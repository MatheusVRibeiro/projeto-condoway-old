import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, setAuthToken } from '../services/api'; // 1. Importar o novo serviço e o setAuthToken
import SplashScreen from '../screens/Auxiliary/SplashScreen'; // Importando o SplashScreen (pasta correta: Auxiliary)

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
        console.log('🔄 Carregando dados do AsyncStorage...');
        
        // Carregar tanto o usuário quanto o token
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        console.log('📦 Dados brutos do AsyncStorage:', { 
          hasUser: !!storedUser, 
          hasToken: !!storedToken 
        });
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          console.log('✅ Utilizador e Token carregados.');
          
          // Reconfigurar o Axios com o token salvo
          setAuthToken(storedToken);
          
          // Atualizar o estado com os dados do usuário
          setUser(userData);
        } else {
          console.log('❌ Nenhum utilizador/token encontrado no storage');
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        console.log('🏁 AuthContext: setLoading(false)');
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Fazendo login com email:', email);
      
      // 1. Chamar o apiService - retorna { sucesso: true, dados: { usuario, token } }
      const response = await apiService.login(email, password);
      
      // 2. Desestruturar a resposta para pegar o utilizador e o token
      const { usuario, token } = response.dados;
      
      console.log('✅ Login realizado com sucesso. Usuário:', usuario.user_nome);
      
      // 3. Configurar o token no Axios para todas as futuras requisições
      setAuthToken(token);
      
      // 4. Salvar o UTILIZADOR e o TOKEN separadamente no AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(usuario));
      await AsyncStorage.setItem('token', token);
      console.log('💾 Usuário e Token salvos no AsyncStorage');
      
      // ✅ Marcar onboarding como concluído após login bem-sucedido
      await AsyncStorage.setItem('onboardingSeen', 'true');
      console.log('✅ Onboarding marcado como concluído');
      
      // 5. Atualizar o estado (agora só com os dados do utilizador)
      setUser(usuario);
      console.log('✅ Estado atualizado');
      
      return usuario;
    } catch (error) {
      console.error("Login failed:", error.message || error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      // Limpar o token do axios ao fazer logout
      setAuthToken(null);
      
      // Limpar dados do AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      
      console.log('✅ Logout realizado com sucesso');
    } catch (e) {
      console.error("Failed to logout", e);
    }
  };

  const updateUser = async (newUserData) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
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
