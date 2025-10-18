import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Box, UserPlus, MessageSquareWarning, Bell, User, LogOut, Edit2, CheckCircle, AlertTriangle } from 'lucide-react-native';

/**
 * Hook para buscar e gerenciar as últimas atualizações do Dashboard
 */
export const useLatestUpdates = (limit = 5) => { // Alterado para 5
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
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
  };

  /**
   * Formata a hora no formato "HH:mm"
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  /**
   * Agrupa as atualizações por data
   */
  const groupUpdatesByDate = (updatesData) => {
    const grouped = {};
    
    // Limita o número de atualizações antes de agrupar
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
        tipo: update.type.toLowerCase(),
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
      
      if (response.sucesso && response.dados) {
        console.log(`✅ [useLatestUpdates] ${response.dados.length} atualizações recebidas`);
        const groupedUpdates = groupUpdatesByDate(response.dados);
        setUpdates(groupedUpdates);
      } else {
        console.warn('⚠️ [useLatestUpdates] Resposta sem dados:', response);
        setUpdates({});
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
