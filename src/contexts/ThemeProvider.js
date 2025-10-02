import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [themeMode, setThemeModeState] = useState('auto'); // 'light', 'dark', 'auto'
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  // Função para determinar o tema baseado no modo
  const getThemeFromMode = (mode) => {
    if (mode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  };

  // Atualiza o tema quando o modo ou esquema do sistema mudam
  useEffect(() => {
    const newTheme = getThemeFromMode(themeMode);
    setCurrentTheme(newTheme);
  }, [themeMode, systemColorScheme]);

  // Carrega as preferências salvas na inicialização
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setThemeModeState(savedMode);
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    }
  };

  const setThemeMode = async (mode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  // Função legacy para compatibilidade (apenas alterna entre light/dark)
  const toggleTheme = () => {
    const newMode = currentTheme.isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const value = {
    theme: currentTheme,
    themeMode,
    setThemeMode,
    toggleTheme, // Mantém para compatibilidade
    isDark: currentTheme.isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar 
        barStyle={currentTheme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Instead of throwing, return undefined and warn — components should guard against missing theme.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('useTheme: ThemeProvider is missing. Returning undefined context. Wrap your app with ThemeProvider.');
    }
    return undefined;
  }
  return context;
};
