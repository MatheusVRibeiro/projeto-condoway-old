import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';

const ThemeContext = createContext();

const lightTheme = {
  isDark: false,
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    shadow: '#000000',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
  },
};

const darkTheme = {
  isDark: true,
  colors: {
    primary: '#3b82f6',
    secondary: '#94a3b8',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    shadow: '#000000',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    // Sincronizar com o sistema quando mudar
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    theme,
    isDark: isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
