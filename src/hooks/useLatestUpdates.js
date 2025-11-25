import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Box, UserPlus, MessageSquareWarning, Bell, User, LogOut, Edit2, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { ultimasAtualizacoes as mockUpdates } from '../screens/App/Dashboard/mock';

/**
 * Hook para buscar e gerenciar as últimas atualizações do Dashboard
 */
export const useLatestUpdates = (limit = 5) => { // Alterado para 5
  const { user } = useAuth();
  const [updates, setUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Mapeia o tipo de evento retornado pelo backend para ícone
   */
  const getIconForType = (type) => {
    const iconMap = {
      'PACKAGE_RECEIVED': Box,
      'RESERVATION_CONFIRMED': Calendar,
      'VISITOR_ENTRY': UserPlus,
      'VISITOR_EXIT': LogOut,
      'OCCURRENCE_UPDATE': Edit2,
      'GENERAL_ANNOUNCEMENT': AlertTriangle,
      'PAYMENT_SUCCESS': CheckCircle,
      'MESSAGE': MessageSquareWarning,
    };
    return iconMap[type] || Bell;
  };

  /**
   * Formata a data no formato "Hoje", "Ontem", ou "dd/mm"
   */
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reseta horas para comparação apenas de datas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoje';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ontem';
    } else {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    } catch (e) {
      return '—';
    }
  };

  /**
   * Formata a hora no formato "HH:mm"
   */
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '--:--';
    }
  };

  /**
   * Agrupa as atualizações por data
   */
  const groupUpdatesByDate = (updatesData) => {
    // Garantia: se não for array ou estiver vazio, retorna objeto vazio
    if (!Array.isArray(updatesData) || updatesData.length === 0) return {};

    const grouped = {};
    const limitedUpdates = updatesData.slice(0, limit);

    limitedUpdates.forEach((update, index) => {
      const dateKey = formatDate(update.timestamp);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push({
        id: update.id, // ID do item original (enc_id, vst_id, res_id, etc)
        uniqueId: `update-${index}`, // ID único para renderização
        texto: update.message,
        hora: formatTime(update.timestamp),
        tipo: (update.type || '').toLowerCase(),
        icone: getIconForType(update.type),
        rawType: update.type, // Tipo original para navegação
      });
    });

    return grouped;
  };

  /**
   * Busca as últimas atualizações da API
   */
  const fetchUpdates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validação do userap_id
      if (!user?.userap_id) {
        console.warn('⚠️ [useLatestUpdates] userap_id não disponível');
        setUpdates({});
        return;
      }

      console.log(`🔄 [useLatestUpdates] Buscando atualizações para userap_id: ${user.userap_id}`);

      const response = await apiService.buscarUltimasAtualizacoes(user.userap_id);

      // Normalizar possíveis formatos de resposta da API
      console.log('🔍 [useLatestUpdates] Resposta bruta da API (normalizar):', response);

      let dados = [];
      if (!response) {
        dados = [];
      } else if (Array.isArray(response)) {
        // API retornou um array diretamente
        dados = response;
      } else if (Array.isArray(response.dados)) {
        // Formato { sucesso, dados }
        dados = response.dados;
      } else if (Array.isArray(response.data)) {
        // Caso raro: wrapper contendo data
        dados = response.data;
      } else if (Array.isArray(response.dados?.dados)) {
        // Defesa extra para payloads aninhados
        dados = response.dados.dados;
      } else {
        dados = [];
      }

      if (dados.length > 0) {
        console.log(`✅ [useLatestUpdates] ${dados.length} atualizações normalizadas`);

        // Validação adicional: para atualizações de RESERVATION_CONFIRMED,
        // confirmar que existe uma reserva com status 'confirmada' correspondente.
        try {
          const userReservations = await apiService.listarReservas(user.userap_id);
          const filtered = dados.filter(update => {
            const rawType = (update.type || '').toString();
            const msg = (update.message || update.texto || '').toString();

            const isResConfirm = rawType.toLowerCase().includes('reservation_confirmed') || rawType.toLowerCase().includes('reservation') || (msg.toLowerCase().includes('reserva') && msg.toLowerCase().includes('confirm'));

            if (!isResConfirm) return true; // manter outras atualizações

            // Tentar extrair ambiente, data (ISO) e hora (HH:MM:SS) da mensagem
            const re = /reserva do\s+\"?([^\"\n]+)\"?\s+para\s+(\d{4}-\d{2}-\d{2})\s+às\s+(\d{2}:\d{2}:\d{2})/i;
            const m = msg.match(re);
            if (!m) {
              // Fallback: tentar padrão sem aspas
              const re2 = /reserva\s+do\s+([^,]+)\s+para\s+(\d{4}-\d{2}-\d{2})\s+às\s+(\d{2}:\d{2}:\d{2})/i;
              const m2 = msg.match(re2);
              if (!m2) return true; // se não extraiu, manter (para não esconder legitimas)
              m = m2;
            }

            const ambienteName = (m[1] || '').toLowerCase().trim();
            const isoDate = m[2]; // YYYY-MM-DD
            const timeFull = m[3]; // HH:MM:SS
            const timeShort = timeFull.slice(0,5);

            // Procurar reserva correspondente com status 'confirmada'
            const match = userReservations.find(r => {
              const rAmb = (r.environmentName || r.amd_nome || r.ambiente_nome || '').toString().toLowerCase();
              const rDate = (r.date || r.res_data_reserva || '').toString().split('T')[0];
              const rTime = (r.horario_inicio || r.res_horario_inicio || '').toString().slice(0,5);

              const sameAmb = rAmb && (rAmb.includes(ambienteName) || ambienteName.includes(rAmb));
              const sameDate = rDate === isoDate;
              const sameTime = rTime === timeShort;

              return sameAmb && sameDate && sameTime && r.status === 'confirmada';
            });

            if (match) return true; // existe reserva confirmada -> manter

            console.log('⚠️ [useLatestUpdates] Ignorando atualização de confirmação sem reserva confirmada correspondente:', update);
            return false; // filtrar update
          });

          const groupedUpdates = groupUpdatesByDate(filtered);
          setUpdates(groupedUpdates);
        } catch (e) {
          console.warn('⚠️ [useLatestUpdates] Erro validando atualizações de reserva:', e);
          const groupedUpdates = groupUpdatesByDate(dados);
          setUpdates(groupedUpdates);
        }
      } else {
        console.warn('⚠️ [useLatestUpdates] Nenhuma atualização encontrada após normalização — usando mock de desenvolvimento');

        // Converter o mock (já agrupado por data) para o formato esperado pelo Dashboard
        try {
          const normalizedMock = {};
          Object.entries(mockUpdates || {}).forEach(([dateKey, items]) => {
            normalizedMock[dateKey] = (items || []).map((it, idx) => ({
              id: it.id ?? `mock-${dateKey}-${idx}`,
              uniqueId: `mock-${dateKey}-${idx}`,
              texto: it.texto || it.message || it.text || '',
              hora: it.hora || '--:--',
              tipo: (it.tipo || '').toLowerCase(),
              icone: it.icone || Bell,
              rawType: it.tipo || it.type || null,
              _mock: true,
            }));
          });

          setUpdates(normalizedMock);
        } catch (e) {
          console.error('❌ [useLatestUpdates] Erro ao aplicar mock de atualizações:', e);
          setUpdates({});
        }
      }
    } catch (err) {
      console.error('❌ [useLatestUpdates] Erro ao buscar atualizações:', err);
      setError(err.message || 'Erro ao carregar atualizações');
      setUpdates({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userap_id]);

  /**
   * Refresh manual (pull-to-refresh)
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUpdates();
  }, [fetchUpdates]);

  /**
   * Carrega as atualizações ao montar o componente
   */
  useEffect(() => {
    if (user?.userap_id) {
      fetchUpdates();
    }
  }, [fetchUpdates, user?.userap_id]);

  return {
    updates,
    loading,
    error,
    refreshing,
    onRefresh,
    refetch: fetchUpdates,
  };
};
