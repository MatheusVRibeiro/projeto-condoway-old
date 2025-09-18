import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { apiService } from '../services/api';
import { API_CONFIG, findWorkingAPI } from '../config/api';

const ApiDebugger = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const clearLogs = () => setLogs([]);

  const testConnection = async () => {
    setIsLoading(true);
    addLog('🔄 Testando conectividade da API...', 'info');
    
    try {
      const isConnected = await apiService.testConnection();
      if (isConnected) {
        addLog('✅ Conexão com API bem-sucedida!', 'success');
      } else {
        addLog('❌ Falha na conexão com API', 'error');
      }
    } catch (error) {
      addLog(`❌ Erro: ${error.message}`, 'error');
    }
    
    setIsLoading(false);
  };

  const testNotifications = async () => {
    setIsLoading(true);
    addLog('🔄 Testando endpoint de notificações...', 'info');
    
    try {
      const notifications = await apiService.getNotificacoes();
      addLog(`✅ Notificações carregadas: ${notifications?.length || 0} itens`, 'success');
      if (notifications?.length > 0) {
        addLog(`📋 Primeira notificação: ${JSON.stringify(notifications[0], null, 2)}`, 'info');
      }
    } catch (error) {
      addLog(`❌ Erro ao carregar notificações: ${error.message}`, 'error');
    }
    
    setIsLoading(false);
  };

  const findAPI = async () => {
    setIsLoading(true);
    addLog('🔍 Procurando API disponível...', 'info');
    
    try {
      const workingUrl = await findWorkingAPI();
      if (workingUrl) {
        addLog(`✅ API encontrada em: ${workingUrl}`, 'success');
      } else {
        addLog('❌ Nenhuma API disponível encontrada', 'error');
      }
    } catch (error) {
      addLog(`❌ Erro na busca: ${error.message}`, 'error');
    }
    
    setIsLoading(false);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 API Debugger</Text>
      
      <View style={styles.configInfo}>
        <Text style={styles.configText}>URL Atual: {API_CONFIG.CURRENT_URL}</Text>
        <Text style={styles.configText}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔗 Testar Conexão</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testNotifications}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>📬 Testar Notificações</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={findAPI}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔍 Encontrar API</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>🗑️ Limpar Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <Text style={[styles.logText, { color: getLogColor(log.type) }]}>
              [{log.timestamp}] {log.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  configInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  configText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  clearButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    maxHeight: 300,
  },
  logItem: {
    marginBottom: 8,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ApiDebugger;
