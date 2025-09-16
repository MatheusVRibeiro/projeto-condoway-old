import { useState, useMemo, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api'; // Importando a API real

export function usePackages() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Aguardando');
  const [showFilters, setShowFilters] = useState(false);
  const [packages, setPackages] = useState([]); // Iniciar com array vazio
  const [sortBy, setSortBy] = useState('date');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // Novo estado para loading inicial

  // Função para buscar as encomendas da API
  const fetchPackages = useCallback(async () => {
    if (!user?.token) {
      Toast.show({ type: 'error', text1: 'Usuário não autenticado.' });
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const packagesFromApi = await api.getEncomendas(user.token);
      // Mapear os dados da API para o formato que o frontend espera
      const mappedPackages = packagesFromApi.map(pkg => ({
        id: pkg.enc_id,
        store: pkg.enc_remetente,
        trackingCode: pkg.enc_cod_rastreio,
        arrivalDate: pkg.enc_data_chegada,
        status: pkg.enc_status,
        description: `Destinatário: ${pkg.enc_destinatario}`,
        recipient: pkg.enc_destinatario,
        retirada_por: pkg.enc_retirada_por,
        retirada_data: pkg.enc_retirada_data,
      }));
      setPackages(mappedPackages);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar encomendas',
        text2: error.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.token]);

  // Buscar dados ao montar o componente
  useEffect(() => {
    setLoading(true);
    fetchPackages();
  }, [fetchPackages]);

  // Estatísticas calculadas
  const awaitingPickup = useMemo(() => packages.filter(p => p.status === 'Aguardando'), [packages]);
  const delivered = useMemo(() => packages.filter(p => p.status === 'Entregue'), [packages]);

  // Filtro e ordenação
  const filteredPackages = useMemo(() => {
    let filtered = packages;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.trackingCode && p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'store': return a.store.localeCompare(b.store);
        case 'status': return a.status.localeCompare(b.status);
        default: return new Date(b.arrivalDate) - new Date(a.arrivalDate);
      }
    });
    
    return filtered;
  }, [packages, searchTerm, statusFilter, sortBy]);

  // Agrupamento inteligente
  const groupByTimeRange = useCallback((items) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

    const sections = [
      { title: 'Hoje', data: [] },
      { title: 'Esta Semana', data: [] },
      { title: 'Anteriores', data: [] },
    ];
    
    items.forEach(pkg => {
      const arrival = new Date(pkg.arrivalDate);
      if (arrival >= startOfToday) {
        sections[0].data.push(pkg);
      } else if (arrival >= startOfWeek) {
        sections[1].data.push(pkg);
      } else {
        sections[2].data.push(pkg);
      }
    });
    
    return sections.filter(section => section.data.length > 0);
  }, []);

  const groupedAwaitingPickup = useMemo(() => 
    groupByTimeRange(filteredPackages.filter(p => p.status === 'Aguardando')), 
    [filteredPackages, groupByTimeRange]
  );

  const groupedDelivered = useMemo(() => 
    groupByTimeRange(filteredPackages.filter(p => p.status === 'Entregue')), 
    [filteredPackages, groupByTimeRange]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchPackages().then(() => {
      Toast.show({
        type: 'success',
        text1: 'Lista de encomendas atualizada!',
        position: 'bottom',
      });
    });
  }, [fetchPackages]);

  // markAsDelivered foi removido do hook do morador — atualização de status é feita no painel administrativo.


  return {
    // State
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    showFilters, setShowFilters,
    sortBy, setSortBy,
    refreshing, onRefresh,
    packages,
    loading, // Exportar o estado de loading
    
    // Computed
    awaitingPickup,
    delivered,
    filteredPackages,
    groupedAwaitingPickup,
    groupedDelivered,

    // Actions
    // (nenhuma ação de alteração de status no app do morador)
  };
}
