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
        console.log('🔄 Carregando usuário do AsyncStorage...');
        const storedUser = await AsyncStorage.getItem('user');
        console.log('📦 Dados brutos do AsyncStorage:', storedUser);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('✅ Usuário carregado do storage:', userData);
          setUser(userData);
          // 2. Configurar o token no axios assim que o app carregar
          setAuthToken(userData.token); 
        } else {
          console.log('❌ Nenhum usuário encontrado no storage');
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
      // 3. Usar o novo apiService para o login
      console.log('🔄 Fazendo login com email:', email);
      const userData = await apiService.login(email, password);
      console.log('✅ Login realizado com sucesso:', userData);
      
      // O setAuthToken já é chamado dentro do apiService.login, mas podemos garantir aqui também.
      setAuthToken(userData.token);
      
      // Salvar primeiro no AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('💾 Usuário salvo no AsyncStorage');
      
      // ✅ CORREÇÃO: Marcar onboarding como concluído após login bem-sucedido
      await AsyncStorage.setItem('onboardingSeen', 'true');
      console.log('✅ Onboarding marcado como concluído');
      
      // Depois atualizar o estado (isso deve forçar re-render)
      console.log('🔄 Atualizando estado do usuário no contexto...');
      setUser(userData);
      console.log('✅ Estado atualizado - user:', userData);
      
      return userData; // Retornar os dados do usuário para a tela de login, se necessário
    } catch (error) {
      console.error("Login failed:", error.message);
      // Lançar o erro para que a tela de Login possa exibi-lo
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      // 4. Limpar o token do axios ao fazer logout
      setAuthToken(null); 
      await AsyncStorage.removeItem('user');
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
