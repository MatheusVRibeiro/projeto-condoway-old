import React, { createContext, useContext, useState, useMemo } from 'react';

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

  const login = (userData) => {
    setUser(userData || { name: 'Ana Clara' }); // Simula login
  };
  const logout = () => setUser(null);

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    login,
    logout,
  }), [user]);

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
