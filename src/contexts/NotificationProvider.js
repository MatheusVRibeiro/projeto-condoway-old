import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
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
  const lastReservationRequestRef = useRef(null); // guarda última pré-reserva criada localmente
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
    let messageText = raw.not_mensagem || raw.message || '';
    // Ajuste: se mensagem de visitante indicar "aguardando na portaria",
    // quando a notificação for do tipo visitante transformamos para "chegou e está no condomínio".
    try {
      const rawTipoLower = String(raw.not_tipo || raw.type || '').toLowerCase();
      const isVisitorNotification = rawTipoLower.includes('visit') || rawTipoLower.includes('visitante');

      if (isVisitorNotification && /aguardando.*portaria|aguardando na portaria|na portaria aguardando/i.test(messageText)) {
        // Tentar extrair nome do visitante entre aspas ou no início da mensagem
        let visitorName = null;
        const quoted = messageText.match(/"([^"]+)"/);
        if (quoted && quoted[1]) visitorName = quoted[1];
        if (!visitorName) {
          const m = messageText.match(/^([A-ZÀ-Ÿ][\w\-à-ÿ']+(?:\s+[A-ZÀ-Ÿ][\w\-à-ÿ']+){0,3})/);
          if (m && m[1]) visitorName = m[1];
        }

        if (visitorName) {
          messageText = `${visitorName} chegou e está no condomínio`;
        } else {
          messageText = messageText.replace(/aguardando.*portaria/ig, 'chegou e está no condomínio');
          messageText = messageText.replace(/na portaria aguardando/ig, 'chegou e está no condomínio');
        }
      }
    } catch (e) {
      console.warn('⚠️ [Notifications] Erro ao ajustar mensagem de visitante:', e);
    }
    const typeLower = raw.not_tipo?.toLowerCase() || (raw.type && raw.type.toLowerCase()) || 'info';
    // Tentar melhorar formatação de datas/hora dentro da mensagem (ex.: 2025-11-27 -> 27/11/2025, 18:00:00 -> 18:00)
    try {
      // Remover menções a fuso horário (ex.: "Brasília", "GMT-3", "UTC")
      messageText = messageText.replace(/\b(Hor[aá]rio de Brasi[íi]lia|padr[aã]o de Brasi[íi]lia|Bras[íi]lia|Brasilia|GMT[+-]?\d+|UTC[+-]?\d+)\b/ig, '');

      // Converter meses em inglês para números (ex: January 3, 2025 -> 03/01/2025)
      const months = {
        january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
        july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
        jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };

      // Pattern: MonthName DD, YYYY  (e.g., January 3, 2025)
      messageText = messageText.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})\b/ig, (m, mon, day, year) => {
        const mm = months[mon.toLowerCase()] || '01';
        const dd = String(day).padStart(2, '0');
        return `${dd}/${mm}/${year}`;
      });

      // Pattern: DD MonthName YYYY  (e.g., 3 January 2025)
      messageText = messageText.replace(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/ig, (m, day, mon, year) => {
        const mm = months[mon.toLowerCase()] || '01';
        const dd = String(day).padStart(2, '0');
        return `${dd}/${mm}/${year}`;
      });

      // Detectar data ISO YYYY-MM-DD e transformar
      const isoDateMatch = messageText.match(/(\d{4}-\d{2}-\d{2})/);
      if (isoDateMatch) {
        const iso = isoDateMatch[1];
        const d = new Date(iso + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          const formattedDate = format(d, 'dd/MM/yyyy');
          messageText = messageText.replace(iso, formattedDate);
        }
      }

      // Detectar hora com segundos HH:MM:SS e substituir por HH:MM
      messageText = messageText.replace(/(\d{2}:\d{2}:\d{2})/g, (m) => m.slice(0,5));

      // Detectar horas isoladas HH:MM (mantém)
      // Finalmente, limpar duplicações de espaços e caracteres sobrando
      messageText = messageText.replace(/\s{2,}/g, ' ').replace(/\s+[,\.]/g, (s) => s.trim());
    } catch (e) {
      console.warn('⚠️ [Notifications] Erro ao normalizar data/hora da mensagem:', e);
    }

    const normalized = {
      id: raw.not_id || raw.id || String(Date.now()),
      title: raw.not_tipo === 'Entrega' ? 'Encomenda Chegou' : (raw.not_tipo === 'Aviso' ? 'Aviso' : (raw.not_tipo === 'Mensagem' ? 'Nova Mensagem' : 'Notificação')),
      message: messageText,
      type: typeLower,
      priority: raw.not_prioridade?.toLowerCase() || 'baixa', // Adicionado para usar a prioridade da API
      timestamp: raw.not_data_envio ? new Date(raw.not_data_envio) : (raw.created_at ? new Date(raw.created_at) : new Date()),
      read: raw.not_lida === 1 || raw.not_lida === true || raw.read === true || false,
      raw,
      // formatted parts: detectar datas/hora e strings entre aspas para grifar (bold) na UI
      formatted: null,
    };

    // Construir formatted parts heurístico: datas (dd/mm/yyyy), horas (HH:MM) e trechos entre aspas serão marcados bold
    try {
      const parts = [];
      let remaining = normalized.message || '';

      // Regex para datas dd/MM/yyyy e horas HH:MM
      const dateRegex = /(\d{2}\/\d{2}\/\d{4})/;
      const timeRegex = /(\d{2}:\d{2})/;
      const quoteRegex = /"([^"]+)"/;

      // Primeiro, se encontrar uma string entre aspas, deixamos como parte bold (normalmente nome do ambiente)
      const quoteMatch = remaining.match(quoteRegex);
      if (quoteMatch) {
        const before = remaining.split(quoteMatch[0])[0];
        if (before) parts.push({ text: before, bold: false });
        parts.push({ text: quoteMatch[1], bold: true });
        const after = remaining.split(quoteMatch[0])[1] || '';
        remaining = after;
      }

      // Em seguida, procurar por datas e horas dentro do restante e marcar bold
      let cursor = remaining;
      while (cursor.length > 0) {
        const dMatch = cursor.match(dateRegex);
        const tMatch = cursor.match(timeRegex);

        // Encontrar o primeiro dos dois
        let firstIndex = -1;
        let firstType = null;
        let firstMatch = null;

        if (dMatch) firstIndex = cursor.indexOf(dMatch[1]);
        if (tMatch) {
          const timeIndex = cursor.indexOf(tMatch[1]);
          if (firstIndex === -1 || timeIndex < firstIndex) {
            firstIndex = timeIndex;
            firstType = 'time';
            firstMatch = tMatch[1];
          }
        }
        if (dMatch && (firstType === null)) {
          firstType = 'date';
          firstMatch = dMatch[1];
        }

        if (firstIndex === -1) {
          // nada mais a marcar
          if (cursor) parts.push({ text: cursor, bold: false });
          break;
        }

        if (firstIndex > 0) {
          parts.push({ text: cursor.slice(0, firstIndex), bold: false });
        }

        parts.push({ text: firstMatch, bold: true });
        cursor = cursor.slice(firstIndex + firstMatch.length);
      }

      // If no parts constructed, fallback to whole message
      if (parts.length === 0) {
        normalized.formatted = null;
      } else {
        normalized.formatted = parts;
      }
    } catch (e) {
      console.warn('⚠️ [Notifications] Erro ao criar formatted parts:', e);
    }
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
          let mapped = serverList.map(normalize);

          // Filtrar confirmações de reserva prematuras geradas pelo backend
          try {
            const last = lastReservationRequestRef.current;
            if (last) {
              mapped = mapped.filter(n => {
                const msg = (n.message || '').toLowerCase();

                // Heurística: identificar notificações de confirmação de reserva
                const rawTipo = String(n.raw?.not_tipo || '').toLowerCase();
                const isReservationConfirm = rawTipo.includes('reservation') || rawTipo.includes('reserva') || msg.includes('reserva') && msg.includes('confirm');

                if (!isReservationConfirm) return true;

                const matchesAmbiente = last.ambiente && msg.includes(String(last.ambiente).toLowerCase());
                const matchesDate = last.date && msg.includes(String(last.date).toLowerCase());
                const matchesTime = last.time && msg.includes(String(last.time).toLowerCase());

                const recent = (Date.now() - last.ts) < 30000; // 30s

                if (recent && matchesAmbiente && matchesDate && matchesTime) {
                  console.log('⚠️ [Notifications] Ignorando confirmação prematura do servidor para pré-reserva local:', n);
                  return false; // filtrar (ignorar) notificações prematuras
                }

                return true;
              });
            }
          } catch (e) {
            console.warn('⚠️ [Notifications] Erro ao filtrar confirmações prematuras:', e);
          }

          // Validação adicional: para notificações que dizem "Reserva Confirmada",
          // confirmar que existe realmente uma reserva com status confirmado no servidor.
          try {
            // Encontrar notificações candidatas a confirmação de reserva
            const confirmNotifs = mapped.filter(n => {
              const msg = (n.message || '').toLowerCase();
              const rawTipo = String(n.raw?.not_tipo || '').toLowerCase();
              return rawTipo.includes('reserva') || (msg.includes('reserva') && msg.includes('confirm')) || (n.title && n.title.toLowerCase().includes('reserva'));
            });

            if (confirmNotifs.length > 0) {
              // Buscar reservas do usuário para validar status
              let userReservations = [];
              try {
                userReservations = await apiService.listarReservas(user.userap_id);
              } catch (e) {
                console.warn('⚠️ [Notifications] Erro ao buscar reservas para validação:', e);
              }

              const validated = [];
              for (const n of mapped) {
                // Se não for confirmação, mantém
                const msg = n.message || '';
                const rawTipo = String(n.raw?.not_tipo || '').toLowerCase();
                const isReservationConfirm = rawTipo.includes('reserva') || (msg.toLowerCase().includes('reserva') && msg.toLowerCase().includes('confirm'));

                if (!isReservationConfirm) {
                  validated.push(n);
                  continue;
                }

                // Tentar extrair ambiente, data e hora via regex (formato após normalização: dd/MM/yyyy e HH:MM)
                const re = /sua reserva do\s+"?([^"\n]+)"?\s+para\s+(\d{2}\/\d{2}\/\d{4})\s+às\s+(\d{2}:\d{2})/i;
                const m = msg.match(re);

                if (!m) {
                  // Se não conseguimos extrair, manter (para não perder notificações legítimas)
                  validated.push(n);
                  continue;
                }

                const [, ambienteName, dateStr, timeStr] = m;

                // Procurar reserva correspondente com status 'confirmada'
                const match = userReservations.find(r => {
                  const rAmb = (r.environmentName || r.amd_nome || r.ambiente_nome || '').toString().toLowerCase();
                  const rDate = (r.date || r.res_data_reserva || '').toString().split('T')[0];
                  const rDateBR = rDate ? format(new Date(rDate + 'T00:00:00'), 'dd/MM/yyyy') : '';
                  const rTime = (r.horario_inicio || r.res_horario_inicio || '').toString().slice(0,5);

                  const sameAmb = ambienteName.toLowerCase().includes(rAmb) || rAmb.includes(ambienteName.toLowerCase());
                  const sameDate = dateStr === rDateBR;
                  const sameTime = timeStr === rTime;

                  // status já está mapeado para 'confirmada' no listarReservas
                  return sameAmb && sameDate && sameTime && r.status === 'confirmada';
                });

                if (match) {
                  validated.push(n);
                } else {
                  console.log('⚠️ [Notifications] Ignorando notificação de confirmação sem reserva confirmada correspondente:', n);
                  // ignorar
                }
              }

              mapped = validated;
            }
          } catch (e) {
            console.warn('⚠️ [Notifications] Erro na validação adicional de confirmações de reserva:', e);
          }
        
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

  const showNotification = async (title, message, type = 'info', persist = false, options = {}) => {
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
        // Determinar prioridade: warnings/errors => alta, demais => baixa
        const prioridade = (type === 'error' || type === 'warning') ? 'alta' : 'baixa';
        const serverNotification = await apiService.criarNotificacao({ 
          userap_id: userId, 
          mensagem: message, 
          tipo: type === 'info' ? 'Aviso' : type,
          prioridade,
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
      // Opções estruturadas para permitir renderização com partes em negrito
      formatted: options.formatted || null,
      meta: options.meta || null,
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Se for uma pré-reserva local, guardar referência para evitar notificações de
    // "reserva confirmada" geradas imediatamente pelo backend (bug conhecido)
    try {
      if (!persist && options?.meta?.kind === 'reservation') {
        lastReservationRequestRef.current = {
          ambiente: options.meta.ambiente,
          date: options.meta.date,
          time: options.meta.time,
          ts: Date.now()
        };
        // Limpar depois de 30s para não bloquear confirmações legítimas
        setTimeout(() => {
          if (lastReservationRequestRef.current && (Date.now() - lastReservationRequestRef.current.ts) > 30000) {
            lastReservationRequestRef.current = null;
          }
        }, 31000);
      }
    } catch (e) {
      console.warn('⚠️ [Notifications] Erro guardando lastReservationRequestRef:', e);
    }

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
