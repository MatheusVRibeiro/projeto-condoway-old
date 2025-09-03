import React, { createContext, useContext, useState } from 'react';
import { Platform, Vibration } from 'react-native';
import Toast from 'react-native-toast-message';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showNotification = (title, message, type = 'info') => {
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

    // Mostrar Toast
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
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (!notification?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const addTestNotification = () => {
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
    showNotification(randomMessage.title, randomMessage.message, randomMessage.type);
  };

  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getRecentNotifications = (limit = 5) => {
    return notifications.slice(0, limit);
  };

  const value = {
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addTestNotification,
    getNotificationsByType,
    getRecentNotifications,
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
