import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

// Configurar como as notificações devem ser tratadas quando recebidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: true,
    perPage: 20
  });
  const notificationsRef = useRef([]);
  const lastFetchTime = useRef(0);
  const allNotificationsRef = useRef([]);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Registrar Push Token e configurar listeners
  useEffect(() => {
    // ⚠️ DESABILITADO TEMPORARIAMENTE - Precisa de projectId no app.json
    // Reabilitar quando configurar EAS
    /*
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log('📱 Expo Push Token:', token);
        
        // Registrar token no backend se usuário estiver logado
        if (user?.user_id || user?.userap_id) {
          registerDeviceToken(token);
        }
      }
    });

    // Listener para notificações recebidas enquanto app está aberto
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificação recebida (app em foreground):', notification);
      
      // Mostrar Toast
      Toast.show({
        type: 'info',
        text1: notification.request.content.title || 'Nova Notificação',
        text2: notification.request.content.body,
        position: 'top',
        visibilityTime: 4000,
      });
      
      // Vibrar
      if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else {
        Vibration.vibrate(200);
      }
      
      // Recarregar notificações do servidor
      refreshNotifications(true);
    });

    // Listener para quando usuário interage com a notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuário clicou na notificação:', response);
      
      // Recarregar notificações do servidor
      refreshNotifications(true);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
    */
    console.log('⚠️ [Notifications] Push Notifications desabilitado temporariamente - Configure projectId no app.json');
  }, [user?.user_id, user?.userap_id]);

  // Função auxiliar para registrar Push Notifications
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permissão de notificações negada');
        alert('É necessário permitir notificações para receber avisos importantes!');
        return;
      }
      
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId,
        })).data;
        console.log('✅ Push Token obtido:', token);
      } catch (error) {
        console.error('❌ Erro ao obter push token:', error);
      }
    } else {
      console.log('⚠️ Push Notifications funcionam apenas em dispositivos físicos');
    }

    return token;
  }

  const normalize = (raw) => {
    console.log('🔄 Normalizando notificação:', raw);
    const normalized = {
      id: raw.not_id || raw.id || String(Date.now()),
      title: raw.not_tipo === 'Entrega' ? 'Encomenda Chegou' : (raw.not_tipo === 'Aviso' ? 'Aviso' : (raw.not_tipo === 'Mensagem' ? 'Nova Mensagem' : 'Notificação')),
      message: raw.not_mensagem || raw.message || '',
      type: raw.not_tipo?.toLowerCase() || (raw.type && raw.type.toLowerCase()) || 'info',
      priority: raw.not_prioridade?.toLowerCase() || 'baixa', // Adicionado para usar a prioridade da API
      timestamp: raw.not_data_envio ? new Date(raw.not_data_envio) : (raw.created_at ? new Date(raw.created_at) : new Date()),
      read: raw.not_lida === 1 || raw.not_lida === true || raw.read === true || false,
      raw,
    };
    console.log('✅ Notificação normalizada:', normalized);
    return normalized;
  };

  const loadServerNotifications = useCallback(async (page = 1) => {
    if (!user?.user_id) {
      console.log('❌ User não disponível para carregar notificações:', user);
      return;
    }

    if (isRefreshing && page === 1) {
      console.log('⏳ Já há uma requisição em andamento, pulando...');
      return;
    }
    
    // Use userap_id se disponível, senão use user_id como fallback
    const userId = user.userap_id || user.user_id;
    
    try {
      if (page === 1) {
        setIsRefreshing(true);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log(`🔄 Carregando notificações do servidor para userId: ${userId}, página: ${page}`);
      
      const serverList = await apiService.getNotificacoes(userId);
      console.log('📦 Notificações recebidas do servidor:', serverList?.length || 0);
      
      if (Array.isArray(serverList)) {
        const mapped = serverList.map(normalize);
        
        // Armazenar TODAS as notificações
        allNotificationsRef.current = mapped;
        
        // Aplicar paginação
        const limit = 20;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = mapped.slice(startIndex, endIndex);
        
        // Atualizar metadados de paginação
        const newPagination = {
          currentPage: page,
          totalPages: Math.ceil(mapped.length / limit),
          total: mapped.length,
          hasMore: endIndex < mapped.length,
          perPage: limit
        };
        setPagination(newPagination);
        
        // Se for página 1, substituir. Senão, adicionar
        if (page === 1) {
          // Detectar novas notificações para mostrar toast
          if (notificationsRef.current.length > 0) {
            const existingIds = new Set(notificationsRef.current.map(n => n.id));
            const newNotifications = paginatedData.filter(n => !existingIds.has(n.id));
            
            // Mostrar toast para cada nova notificação
            newNotifications.forEach(notification => {
              console.log('🔔 Nova notificação detectada:', notification.title);
              Toast.show({
                type: 'info',
                text1: notification.title,
                text2: notification.message,
                position: 'top',
                visibilityTime: 4000,
              });
              
              // Vibração para nova notificação
              if (Platform.OS === 'ios') {
                Vibration.vibrate();
              } else {
                Vibration.vibrate(200);
              }
            });
          }
          
          setNotifications(paginatedData);
          notificationsRef.current = paginatedData;
        } else {
          // Infinite scroll - adicionar aos existentes
          setNotifications(prev => [...prev, ...paginatedData]);
          notificationsRef.current = [...notificationsRef.current, ...paginatedData];
        }
        
        const unread = mapped.filter(n => !n.read).length;
        setUnreadCount(unread);
        setLastCheck(new Date());
        
        console.log(`✅ ${paginatedData.length} notificações carregadas (página ${page}/${newPagination.totalPages}), ${unread} não lidas no total`);
      } else {
        console.log('⚠️ Resposta do servidor não é um array:', serverList);
        setNotifications([]);
        setUnreadCount(0);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasMore: false,
          perPage: 20
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      if (page === 1) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [user?.user_id, user?.userap_id, isRefreshing]);

  // Removido useEffect automático - notificações serão carregadas apenas via pull-to-refresh

  const showNotification = async (title, message, type = 'info', persist = false) => {
    // Mostrar Toast imediatamente
    Toast.show({
      type: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });

    // Vibração
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(200);
    }

    if (persist && user?.user_id) {
      // Persistir no servidor e usar a resposta
      try {
        // Use userap_id se disponível, senão use user_id como fallback
        const userId = user.userap_id || user.user_id;
        
        console.log(`💾 Persistindo notificação para userId: ${userId}`, { title, message, type });
        const serverNotification = await apiService.criarNotificacao({ 
          userap_id: userId, 
          mensagem: message, 
          tipo: type === 'info' ? 'Aviso' : type 
        });
        console.log('✅ Notificação criada no servidor:', serverNotification);
        
        // Adicionar a notificação normalizada retornada do servidor
        const normalized = normalize(serverNotification);
        setNotifications(prev => [normalized, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        return normalized;
      } catch (err) {
        console.error('❌ Erro ao persistir notificação:', err);
        // Em caso de erro, criar localmente como fallback
      }
    }
    
    // Criar notificação local (quando persist=false ou em caso de erro)
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    return notification;
  };

  const markAsRead = async (notificationId) => {
    console.log('📖 Marcando notificação como lida:', notificationId);
    
    // Encontrar a notificação para verificar se já está lida
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      console.log('⚠️ Notificação não encontrada:', notificationId);
      return;
    }
    
    if (notification.read) {
      console.log('ℹ️ Notificação já está marcada como lida');
      return;
    }

    // Atualizar estado local imediatamente
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Tentar atualizar no servidor
    if (user?.user_id) {
      try {
        console.log('📡 Enviando marcação como lida para o servidor...');
        await apiService.marcarNotificacaoComoLida(notificationId);
        console.log('✅ Notificação marcada como lida no servidor');
      } catch (error) {
        console.error('❌ Erro ao marcar notificação como lida no servidor:', error);
        // Não reverter o estado local em caso de erro do servidor
        // O usuário já viu a notificação, mesmo que o servidor falhe
      }
    }
  };

  const markAllAsRead = async () => {
    console.log('📖 Marcando todas as notificações como lidas');
    
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      console.log('ℹ️ Todas as notificações já estão marcadas como lidas');
      return;
    }
    
    // Atualizar estado local imediatamente
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
    
    // Tentar marcar cada uma no servidor
    if (user?.user_id) {
      const markPromises = unreadNotifications.map(async (notification) => {
        try {
          await apiService.marcarNotificacaoComoLida(notification.id);
          console.log(`✅ Notificação ${notification.id} marcada como lida no servidor`);
        } catch (error) {
          console.error(`❌ Erro ao marcar notificação ${notification.id} como lida:`, error);
          // Continua com as outras mesmo se uma falhar
        }
      });
      
      await Promise.allSettled(markPromises);
      console.log('🏁 Processo de marcação em lote finalizado');
    }
  };

  const removeNotification = (notificationId) => {
    console.log('🗑️ Removendo notificação localmente (não do servidor):', notificationId);
    
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      console.log('⚠️ Notificação não encontrada para remoção:', notificationId);
      return;
    }
    
    // Remove apenas localmente - não afeta o banco de dados
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Ajusta contador de não lidas apenas se a notificação removida não estava lida
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    console.log('✅ Notificação removida localmente. Banco de dados não afetado.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const addTestNotification = async () => {
    const testMessages = [
      {
        title: 'Encomenda Chegou',
        message: 'Você tem um pacote aguardando na portaria',
        type: 'info'
      },
      {
        title: 'Visitante Autorizado',
        message: 'João Silva foi liberado para acesso',
        type: 'success'
      },
      {
        title: 'Manutenção Programada',
        message: 'Limpeza da caixa d\'água amanhã às 8h',
        type: 'warning'
      },
      {
        title: 'Alerta de Segurança',
        message: 'Porta do playground ficou aberta',
        type: 'error'
      }
    ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    
    // Usar showNotification com persist=true para salvar na API
    await showNotification(randomMessage.title, randomMessage.message, randomMessage.type, true);
    
    // Recarregar notificações do servidor para mostrar a nova notificação
    await loadServerNotifications();
  };

  const refreshNotifications = useCallback(async (forceRefresh = false) => {
    if (isRefreshing) {
      console.log('⏳ Refresh já em andamento, ignorando nova solicitação...');
      return;
    }

    // Cache simples: não atualizar se foi atualizado há menos de 10 segundos (exceto se forçado)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    const cacheTimeout = 10000; // 10 segundos

    if (!forceRefresh && timeSinceLastFetch < cacheTimeout) {
      console.log(`⏰ Cache ainda válido (${Math.round(timeSinceLastFetch / 1000)}s ago), pulando atualização`);
      return;
    }

    console.log('🔄 Refresh das notificações solicitado');
    lastFetchTime.current = now;
    return await loadServerNotifications(1); // Sempre volta para página 1
  }, [isRefreshing, loadServerNotifications]);

  const loadMoreNotifications = useCallback(async () => {
    if (loadingMore || loading || !pagination.hasMore) {
      console.log('⏸️ Carregamento de mais notificações ignorado:', {
        loadingMore,
        loading,
        hasMore: pagination.hasMore
      });
      return;
    }
    
    const nextPage = pagination.currentPage + 1;
    console.log(`📄 Carregando página ${nextPage} de notificações...`);
    return await loadServerNotifications(nextPage);
  }, [loadingMore, loading, pagination, loadServerNotifications]);

  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getRecentNotifications = (limit = 5) => {
    return notifications.slice(0, limit);
  };

  const registerDeviceToken = async (deviceToken) => {
    if (!user?.user_id && !user?.userap_id) {
      console.log('⚠️ Usuário não logado, não registrando device token');
      return;
    }
    
    try {
      console.log('📡 Registrando device token no backend...');
      await apiService.registrarDeviceToken(deviceToken);
      console.log('✅ Device token registrado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao registrar device token:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    pagination,
    lastCheck,
    expoPushToken,
    showNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addTestNotification,
    getNotificationsByType,
    getRecentNotifications,
    loadServerNotifications,
    refreshNotifications,
    loadMore: loadMoreNotifications,
    registerDeviceToken,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
