import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    // Recupera usuário salvo
    AsyncStorage.getItem('user').then(storedUser => {
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    });
  }, []);

  const login = (userData) => {
    if (!userData) return;
    setUser(userData);
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };
  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem('user');
  };

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    login,
    logout,
  }), [user]);

  if (loading) return <SplashScreen />;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Este é o hook customizado que usaremos nas telas para acessar
//    o estado de login e as funções.
export const useAuth = () => {
  return useContext(AuthContext);
};
