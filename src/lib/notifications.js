import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar comportamento padrão das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registra o dispositivo para receber notificações push
 * @returns {Promise<string|null>} Token de push notification ou null
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  // Verificar se é dispositivo físico
  if (!Device.isDevice) {
    console.warn('⚠️ Push notifications só funcionam em dispositivos físicos');
    return null;
  }

  try {
    // Verificar permissões existentes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Se não tem permissão, solicitar
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Se usuário negou permissão
    if (finalStatus !== 'granted') {
      console.warn('⚠️ Permissão para notificações negada');
      return null;
    }

    // Obter token do Expo Push Service
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'tcc-condoway',
    });
    token = tokenData.data;

    console.log('✅ Token de push notification obtido:', token);

    // Salvar token localmente
    await AsyncStorage.setItem('pushToken', token);

    // Configurar canal de notificação para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificações Condoway',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
      });
    }
  } catch (error) {
    console.error('❌ Erro ao registrar para push notifications:', error);
  }

  return token;
}

/**
 * Adiciona listener para notificações recebidas (app em foreground)
 * @param {Function} callback - Função a ser chamada quando notificação é recebida
 * @returns {Subscription} Subscription para remover listener
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Adiciona listener para quando usuário clica na notificação
 * @param {Function} callback - Função a ser chamada quando usuário clica
 * @returns {Subscription} Subscription para remover listener
 */
export function addNotificationResponseReceivedListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove todos os listeners de notificação
 * @param {Subscription} subscription - Subscription a ser removida
 */
export function removeNotificationSubscription(subscription) {
  if (subscription) {
    Notifications.removeNotificationSubscription(subscription);
  }
}

/**
 * Agenda uma notificação local (para testes)
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da notificação
 * @param {object} data - Dados adicionais
 * @param {number} seconds - Segundos até mostrar notificação
 */
export async function scheduleLocalNotification(title, body, data = {}, seconds = 2) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: { seconds },
    });
    console.log('✅ Notificação local agendada');
  } catch (error) {
    console.error('❌ Erro ao agendar notificação local:', error);
  }
}

/**
 * Cancela todas as notificações agendadas
 */
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('🗑️ Todas as notificações agendadas foram canceladas');
}

/**
 * Limpa todas as notificações exibidas
 */
export async function dismissAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
  console.log('🗑️ Todas as notificações foram limpas');
}
