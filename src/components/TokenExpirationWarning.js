import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTokenTimeRemaining } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente que monitora o tempo de expiração do token JWT
 * e exibe um aviso quando está próximo de expirar (< 30 minutos)
 * 
 * Uso: Adicione no componente raiz após o login
 * <TokenExpirationWarning />
 */
const TokenExpirationWarning = () => {
  const { logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Verificar o token a cada minuto
    const interval = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          const remaining = getTokenTimeRemaining(token);
          setTimeRemaining(remaining);
          
          // Mostrar aviso se faltar menos de 30 minutos
          if (remaining !== null && remaining > 0 && remaining < 30) {
            setShowWarning(true);
            console.warn(`⚠️ [TokenWarning] Token expira em ${remaining} minutos`);
          } else if (remaining === 0) {
            console.error('❌ [TokenWarning] Token expirado!');
            setShowWarning(true);
          } else {
            setShowWarning(false);
          }
        }
      } catch (error) {
        console.error('❌ [TokenWarning] Erro ao verificar token:', error);
      }
    }, 60000); // Verificar a cada 1 minuto

    // Verificação inicial imediata
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const remaining = getTokenTimeRemaining(token);
          setTimeRemaining(remaining);
          if (remaining !== null && remaining > 0 && remaining < 30) {
            setShowWarning(true);
          }
        }
      } catch (error) {
        console.error('❌ [TokenWarning] Erro na verificação inicial:', error);
      }
    })();

    return () => clearInterval(interval);
  }, []);

  if (!showWarning || timeRemaining === null) {
    return null;
  }

  const isExpired = timeRemaining === 0;
  const warningColor = isExpired ? '#ef4444' : timeRemaining < 10 ? '#f59e0b' : '#eab308';

  return (
    <View style={[styles.container, { backgroundColor: warningColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isExpired ? 'Sessão Expirada' : 'Sessão Expirando'}
          </Text>
          <Text style={styles.message}>
            {isExpired 
              ? 'Sua sessão expirou. Por favor, faça login novamente.'
              : `Sua sessão expira em ${timeRemaining} minuto${timeRemaining !== 1 ? 's' : ''}. Por favor, salve seu trabalho.`
            }
          </Text>
        </View>
        {isExpired && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={logout}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Fazer Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50, // Espaço para status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default TokenExpirationWarning;
