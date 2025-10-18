import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  removeNotificationSubscription,
} from '../lib/notifications';

/**
 * Hook customizado para gerenciar notificações push
 * Configura listeners para notificações recebidas e cliques
 */
export function usePushNotifications() {
  const navigation = useNavigation();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // 📬 Listener para notificações recebidas (app em foreground)
    notificationListener.current = addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      
      console.log('📬 [PUSH] Notificação recebida:', { title, body, data });

      // Mostrar toast quando notificação chega com app aberto
      Toast.show({
        type: 'info',
        text1: title || 'Nova Notificação',
        text2: body || '',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 50,
      });

      // Atualizar badge (número de notificações não lidas)
      Notifications.setBadgeCountAsync(1);
    });

    // 👆 Listener para quando usuário clica na notificação
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      console.log('👆 [PUSH] Usuário clicou na notificação:', data);

      // Navegar para tela específica baseado no tipo
      handleNotificationNavigation(data);
    });

    // Cleanup: remover listeners quando componente desmontar
    return () => {
      removeNotificationSubscription(notificationListener.current);
      removeNotificationSubscription(responseListener.current);
    };
  }, [navigation]);

  /**
   * Navega para a tela apropriada baseado no tipo de notificação
   * @param {object} data - Dados da notificação
   */
  const handleNotificationNavigation = (data) => {
    if (!data || !data.type) {
      console.warn('⚠️ [PUSH] Notificação sem tipo definido');
      return;
    }

    try {
      switch (data.type) {
        case 'ENCOMENDA':
          navigation.navigate('App', {
            screen: 'Encomendas',
            params: { encomendaId: data.encomendaId },
          });
          break;

        case 'RESERVA':
          navigation.navigate('App', {
            screen: 'Reservas',
            params: { reservaId: data.reservaId },
          });
          break;

        case 'OCORRENCIA':
          navigation.navigate('App', {
            screen: 'Ocorrencias',
            params: { ocorrenciaId: data.ocorrenciaId },
          });
          break;

        case 'VISITANTE':
          navigation.navigate('App', {
            screen: 'ProfileStack',
            params: {
              screen: 'AuthorizeVisitor',
              params: { visitanteId: data.visitanteId },
            },
          });
          break;

        case 'COMUNICADO':
        case 'AVISO':
          navigation.navigate('App', {
            screen: 'Dashboard',
          });
          break;

        default:
          console.warn('⚠️ [PUSH] Tipo de notificação desconhecido:', data.type);
          // Navegar para Dashboard como fallback
          navigation.navigate('App', {
            screen: 'Dashboard',
          });
      }

      console.log(`✅ [PUSH] Navegado para tela: ${data.type}`);
    } catch (error) {
      console.error('❌ [PUSH] Erro ao navegar:', error);
    }
  };

  return null; // Este hook não retorna nada, apenas configura os listeners
}
