import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

/**
 * Hook customizado para carregar visitantes com paginação e infinite scroll
 * 
 * @param {Object} filtros - Filtros opcionais (status, dataInicio, dataFim)
 * @param {number} initialLimit - Quantidade de itens por página (padrão: 20)
 * @returns {Object} - Estado e funções para gerenciar visitantes paginados
 */
export const usePaginatedVisitantes = (filtros = {}, initialLimit = 20) => {
  // Estados
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: true,
    perPage: initialLimit
  });

  /**
   * Carregar primeira página de visitantes
   */
  const loadVisitantes = useCallback(async () => {
    if (loading || loadingMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [Hook] Carregando primeira página de visitantes...', filtros);
      const result = await apiService.listarVisitantes(filtros, 1, initialLimit);
      
      setVisitantes(result.dados);
      setPagination(result.pagination);
      
      console.log('✅ [Hook] Primeira página de visitantes carregada:', {
        total: result.pagination.total,
        loaded: result.dados.length,
        hasMore: result.pagination.hasMore
      });
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar visitantes';
      setError(errorMessage);
      console.error('❌ [Hook] Erro ao carregar visitantes:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros, initialLimit, loading, loadingMore]);

  /**
   * Carregar próxima página (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !pagination.hasMore) {
      console.log('⏸️ [Hook] Carregamento de mais visitantes ignorado');
      return;
    }
    
    setLoadingMore(true);
    
    try {
      const nextPage = pagination.currentPage + 1;
      console.log(`🔄 [Hook] Carregando página ${nextPage} de visitantes...`);
      
      const result = await apiService.listarVisitantes(filtros, nextPage, initialLimit);
      
      // Adicionar novos dados aos existentes
      setVisitantes(prev => [...prev, ...result.dados]);
      setPagination(result.pagination);
      
      console.log('✅ [Hook] Próxima página de visitantes carregada:', {
        page: nextPage,
        loaded: result.dados.length,
        totalLoaded: visitantes.length + result.dados.length
      });
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar mais visitantes';
      setError(errorMessage);
      console.error('❌ [Hook] Erro ao carregar mais visitantes:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, pagination, filtros, initialLimit, visitantes.length]);

  /**
   * Refresh (pull to refresh)
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      console.log('🔄 [Hook] Refreshing visitantes...');
      const result = await apiService.listarVisitantes(filtros, 1, initialLimit);
      
      setVisitantes(result.dados);
      setPagination(result.pagination);
      
      console.log('✅ [Hook] Refresh de visitantes concluído');
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar visitantes';
      setError(errorMessage);
      console.error('❌ [Hook] Erro ao atualizar visitantes:', err);
    } finally {
      setRefreshing(false);
    }
  }, [filtros, initialLimit]);

  /**
   * Atualizar filtros e recarregar
   */
  const updateFilters = useCallback(async (novosFiltros) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.listarVisitantes(novosFiltros, 1, initialLimit);
      setVisitantes(result.dados);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message || 'Erro ao aplicar filtros');
      console.error('❌ [Hook] Erro ao aplicar filtros:', err);
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  /**
   * Adicionar novo visitante (otimista)
   */
  const addVisitante = useCallback((novoVisitante) => {
    setVisitantes(prev => [novoVisitante, ...prev]);
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1
    }));
  }, []);

  /**
   * Atualizar visitante existente
   */
  const updateVisitante = useCallback((visitanteId, dadosAtualizados) => {
    setVisitantes(prev => 
      prev.map(vis => 
        vis.id === visitanteId 
          ? { ...vis, ...dadosAtualizados }
          : vis
      )
    );
  }, []);

  /**
   * Remover visitante
   */
  const removeVisitante = useCallback((visitanteId) => {
    setVisitantes(prev => prev.filter(vis => vis.id !== visitanteId));
    setPagination(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1)
    }));
  }, []);

  // Carregar automaticamente ao montar
  useEffect(() => {
    loadVisitantes();
  }, []); // Apenas na montagem

  return {
    // Dados
    visitantes,
    pagination,
    
    // Estados
    loading,
    loadingMore,
    refreshing,
    error,
    
    // Ações
    loadMore,
    refresh,
    reload: loadVisitantes,
    updateFilters,
    
    // Mutações otimistas
    addVisitante,
    updateVisitante,
    removeVisitante
  };
};
