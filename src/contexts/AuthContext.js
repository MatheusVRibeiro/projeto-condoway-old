import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, setAuthToken, buildFullImageUrl, isTokenExpired, getTokenTimeRemaining, decodeJwt } from '../services/api'; // Importar helpers de validação de token
import SplashScreen from '../screens/Auxiliary/SplashScreen';

// 1. O contexto define a "forma" dos dados que serão compartilhados.
const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

// 2. O AuthProvider agora controla o estado global de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        console.log('🔄 [AuthContext] Carregando dados do AsyncStorage...');
        
        // Carregar tanto o usuário quanto o token
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        console.log('📦 [AuthContext] Dados brutos do AsyncStorage:', { 
          hasUser: !!storedUser, 
          hasToken: !!storedToken 
        });
        
        if (storedUser && storedToken) {
          // Verificar se o token está expirado ANTES de restaurar a sessão
          if (isTokenExpired(storedToken)) {
            const timeRemaining = getTokenTimeRemaining(storedToken);
            console.error('❌ [AuthContext] Token expirado encontrado no storage!');
            console.error(`⏰ [AuthContext] Tempo restante: ${timeRemaining} minutos (expirado)`);
            console.log('🧹 [AuthContext] Limpando dados e forçando novo login...');
            
            // Limpar dados expirados
            await AsyncStorage.multiRemove(['user', 'token', 'userEmail', 'userPassword', 'authToken', 'userData']);
            setAuthToken(null);
            setUser(null);
            setLoading(false);
            return;
          }
          
          const userData = JSON.parse(storedUser);
          
          // ✅ SOLUÇÃO: Se userap_id não estiver no userData, extrair do token
          if (!userData.userap_id) {
            console.warn('⚠️ [AuthContext] userap_id não encontrado no userData do storage');
            console.log('🔍 [AuthContext] Tentando extrair userap_id do token JWT...');
            
            const decoded = decodeJwt(storedToken);
            console.log('🔍 [AuthContext] Token decodificado:', JSON.stringify(decoded, null, 2));
            
            // O token pode ter userApId, userap_id, ou userapId
            const userapId = decoded?.userApId || decoded?.userap_id || decoded?.userapId;
            
            if (userapId) {
              console.log('✅ [AuthContext] userap_id extraído do token:', userapId);
              userData.userap_id = userapId;
            } else {
              console.error('❌ [AuthContext] userap_id não encontrado nem no storage nem no token!');
            }
          }
          
          // Normalizar user_foto se for path relativo
          if (userData.user_foto) {
            userData.user_foto = buildFullImageUrl(userData.user_foto);
            console.log('🔧 [AuthContext] user_foto normalizado ao carregar:', userData.user_foto);
          }
          
          const timeRemaining = getTokenTimeRemaining(storedToken);
          console.log(`✅ [AuthContext] Utilizador e Token carregados. Token expira em ${timeRemaining} minutos.`);
          
          // Reconfigurar o Axios com o token salvo
          setAuthToken(storedToken);
          
          // Atualizar o estado com os dados do usuário
          setUser(userData);
          
          // Avisar se o token está perto de expirar
          if (timeRemaining !== null && timeRemaining < 30) {
            console.warn(`⚠️ [AuthContext] Token expira em ${timeRemaining} minutos! Considere fazer novo login.`);
          }
        } else {
          console.log('❌ [AuthContext] Nenhum utilizador/token encontrado no storage');
        }
      } catch (e) {
        console.error("❌ [AuthContext] Failed to load user from storage", e);
      } finally {
        console.log('🏁 [AuthContext] setLoading(false)');
        setLoading(false);
      }
    }

    loadUserFromStorage();
    
    // Configurar listener para token expirado
    global.onTokenExpired = () => {
      console.log('🔴 [AuthContext] Token expirado. Fazendo logout...');
      logout();
    };
    
    // Cleanup
    return () => {
      global.onTokenExpired = null;
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 [AuthContext] Fazendo login com email:', email);
      
      // 1. Chamar o apiService - retorna { sucesso: true, dados: { usuario, token } }
      const response = await apiService.login(email, password);
      
      // 2. Desestruturar a resposta para pegar o utilizador e o token
      const { usuario, token } = response.dados;
      
      console.log('✅ [AuthContext] Login realizado com sucesso. Usuário:', usuario.user_nome);
      console.log('🔍 [AuthContext] Dados completos do usuário:', JSON.stringify(usuario, null, 2));
      console.log('🔍 [AuthContext] userap_id:', usuario.userap_id);
      console.log('🔍 [AuthContext] user_id:', usuario.user_id);
      
      // ✅ SOLUÇÃO: Se userap_id não vier no objeto usuario, extrair do token JWT
      if (!usuario.userap_id) {
        console.warn('⚠️ [AuthContext] userap_id não encontrado no objeto usuario');
        console.log('🔍 [AuthContext] Tentando extrair userap_id do token JWT...');
        
        const decoded = decodeJwt(token);
        console.log('🔍 [AuthContext] Token decodificado:', JSON.stringify(decoded, null, 2));
        
        // O token pode ter userApId, userap_id, ou userapId
        const userapId = decoded?.userApId || decoded?.userap_id || decoded?.userapId;
        
        if (userapId) {
          console.log('✅ [AuthContext] userap_id extraído do token:', userapId);
          usuario.userap_id = userapId;
        } else {
          console.error('❌ [AuthContext] userap_id não encontrado nem no usuario nem no token!');
        }
      }
      
      // Verificar validade e tempo de expiração do token
      if (isTokenExpired(token)) {
        console.error('❌ [AuthContext] ALERTA: Token recebido já está expirado!');
        throw new Error('Token recebido do servidor já está expirado. Contate o administrador.');
      }
      
      const timeRemaining = getTokenTimeRemaining(token);
      console.log(`⏰ [AuthContext] Token válido. Expira em ${timeRemaining} minutos.`);
      
      // 3. Configurar o token no Axios para todas as futuras requisições
      setAuthToken(token);
      
      // 4. Salvar o UTILIZADOR, TOKEN, EMAIL e SENHA no AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(usuario));
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      console.log('💾 [AuthContext] Usuário, Token e Credenciais salvos no AsyncStorage');
      
      // ✅ Marcar onboarding como concluído após login bem-sucedido
      await AsyncStorage.setItem('onboardingSeen', 'true');
      console.log('✅ [AuthContext] Onboarding marcado como concluído');

      // Notificar hook useOnboardingStatus (se presente) para atualizar imediatamente
      try {
        if (global.onOnboardingChanged) {
          global.onOnboardingChanged('true');
          console.log('📣 [AuthContext] Notified onOnboardingChanged');
        }
      } catch (e) {
        console.warn('⚠️ [AuthContext] Erro ao notificar onOnboardingChanged', e);
      }
      
      // 5. Atualizar o estado (agora só com os dados do utilizador)
      setUser(usuario);
      console.log('✅ [AuthContext] Estado atualizado');
      
      return usuario;
    } catch (error) {
      console.error("❌ [AuthContext] Login failed:", error.message || error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔴 [AuthContext] Iniciando logout...');
      
      setUser(null);
      // Limpar o token do axios ao fazer logout
      setAuthToken(null);
      
      // Limpar TODOS os dados do AsyncStorage (incluindo credenciais)
      await AsyncStorage.multiRemove(['user', 'token', 'userEmail', 'userPassword', 'authToken', 'userData']);
      
      console.log('✅ [AuthContext] Logout realizado com sucesso. Todos os dados limpos.');
    } catch (e) {
      console.error("❌ [AuthContext] Failed to logout", e);
    }
  };

  const updateUser = async (newUserData) => {
    try {
      if (user) {
        // Se user_foto é um path relativo, converter para URL completa
        if (newUserData.user_foto) {
          newUserData.user_foto = buildFullImageUrl(newUserData.user_foto);
          console.log('🔧 [AuthContext] user_foto normalizado:', newUserData.user_foto);
        }
        
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ [AuthContext] user atualizado:', updatedUser);
      }
    } catch (e) {
      console.error("Failed to update user", e);
    }
  };

  if (loading) return <SplashScreen />;

  const isLoggedIn = !!user;
  console.log('🔍 AuthContext render - user:', user?.user_nome || 'null', 'isLoggedIn:', isLoggedIn);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Este é o hook customizado que usaremos nas telas para acessar
//    o estado de login e as funções.
export const useAuth = () => {
  return useContext(AuthContext);
};
