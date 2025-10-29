import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // <--- 1. IMPORTE O useAuth

/**
 * Hook customizado para carregar ocorrências com paginação e infinite scroll
 * 
 * @param {number} initialLimit - Quantidade de itens por página (padrão: 20)
 * @returns {Object} - Estado e funções para gerenciar ocorrências paginadas
 */
export const usePaginatedOcorrencias = (initialLimit = 20) => {
  const { user } = useAuth(); // <--- 2. PEGUE O UTILIZADOR LOGADO
  const userApId = user?.userap_id; // <--- 3. EXTRAIA O userap_id
  
  // Estados
  const [ocorrencias, setOcorrencias] = useState([]);
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
   * Carregar primeira página de ocorrências
   */
  const loadOcorrencias = useCallback(async () => {
    // <--- 4. VALIDAÇÃO: se não houver userApId, não faz nada
    if (!userApId) {
      console.warn('⚠️ [Hook] userApId não disponível');
      return;
    }

    // Evitar requisições duplicadas
    if (loading || loadingMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [Hook] Carregando primeira página de ocorrências...');
      // <--- 5. PASSA O userApId COMO PRIMEIRO PARÂMETRO
      const result = await apiService.buscarOcorrencias(userApId, 1, initialLimit);
      
      setOcorrencias(result.dados);
      setPagination(result.pagination);
      
      console.log('✅ [Hook] Primeira página carregada:', {
        total: result.pagination.total,
        loaded: result.dados.length,
        hasMore: result.pagination.hasMore
      });
    } catch (err) {
      // Primeira página com erro é problema real
      const errorMessage = err.message?.includes('500') 
        ? 'Erro no servidor ao carregar ocorrências'
        : err.message || 'Erro ao carregar ocorrências';
      setError(errorMessage);
      console.error('❌ [Hook] Erro ao carregar ocorrências:', err);
      
      // Definir estado vazio para evitar tela em branco
      setOcorrencias([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasMore: false,
        perPage: initialLimit
      });
    } finally {
      setLoading(false);
    }
  }, [userApId, initialLimit, loading, loadingMore]);

  /**
   * Carregar próxima página (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    // <--- VALIDAÇÃO: se não houver userApId, não faz nada
    if (!userApId) {
      console.warn('⚠️ [Hook] userApId não disponível para loadMore');
      return;
    }

    // Evitar carregar se já está carregando ou não há mais páginas
    if (loadingMore || loading || !pagination.hasMore) {
      console.log('⏸️ [Hook] Carregamento de mais itens ignorado:', {
        loadingMore,
        loading,
        hasMore: pagination.hasMore
      });
      return;
    }
    
    setLoadingMore(true);
    
    try {
      const nextPage = pagination.currentPage + 1;
      console.log(`🔄 [Hook] Carregando página ${nextPage}...`, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        hasMore: pagination.hasMore
      });
      
      // <--- PASSA O userApId COMO PRIMEIRO PARÂMETRO
      const result = await apiService.buscarOcorrencias(userApId, nextPage, initialLimit);
      
      // Se não retornou dados, marcar como sem mais páginas
      if (!result.dados || result.dados.length === 0) {
        console.log('⚠️ [Hook] Sem mais dados - encerrando paginação');
        setPagination(prev => ({ ...prev, hasMore: false }));
        return;
      }
      
      // Adicionar novos dados aos existentes (importante para infinite scroll)
      setOcorrencias(prev => [...prev, ...result.dados]);
      setPagination(result.pagination);
      
      console.log('✅ [Hook] Próxima página carregada:', {
        page: nextPage,
        loaded: result.dados.length,
        totalLoaded: ocorrencias.length + result.dados.length,
        hasMore: result.pagination.hasMore
      });
    } catch (err) {
      // Se for erro de página vazia, apenas parar a paginação
      if (err.message?.includes('500') || err.message?.includes('Erro ao listar')) {
        console.warn('⚠️ [Hook] Fim da paginação detectado');
        setPagination(prev => ({ ...prev, hasMore: false }));
      } else {
        const errorMessage = err.message || 'Erro ao carregar mais ocorrências';
        setError(errorMessage);
        console.error('❌ [Hook] Erro ao carregar mais ocorrências:', err);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [userApId, loadingMore, loading, pagination, initialLimit, ocorrencias.length]);

  /**
   * Refresh (pull to refresh) - volta para a primeira página
   */
  const refresh = useCallback(async () => {
    // <--- VALIDAÇÃO: se não houver userApId, não faz nada
    if (!userApId) {
      console.warn('⚠️ [Hook] userApId não disponível para refresh');
      return;
    }

    setRefreshing(true);
    setError(null);
    
    try {
      console.log('🔄 [Hook] Refreshing - voltando para primeira página...');
      // <--- PASSA O userApId COMO PRIMEIRO PARÂMETRO
      const result = await apiService.buscarOcorrencias(userApId, 1, initialLimit);
      
      setOcorrencias(result.dados);
      setPagination(result.pagination);
      
      console.log('✅ [Hook] Refresh concluído:', {
        total: result.pagination.total,
        loaded: result.dados.length
      });
    } catch (err) {
      const errorMessage = err.message?.includes('500')
        ? 'Erro no servidor ao atualizar'
        : err.message || 'Erro ao atualizar ocorrências';
      setError(errorMessage);
      console.error('❌ [Hook] Erro ao atualizar ocorrências:', err);
    } finally {
      setRefreshing(false);
    }
  }, [userApId, initialLimit]);

  /**
   * Adicionar nova ocorrência (otimista)
   * Adiciona localmente primeiro, depois sincroniza
   */
  const addOcorrencia = useCallback((novaOcorrencia) => {
    setOcorrencias(prev => [novaOcorrencia, ...prev]);
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1
    }));
  }, []);

  /**
   * Atualizar ocorrência existente
   */
  const updateOcorrencia = useCallback((ocorrenciaId, dadosAtualizados) => {
    setOcorrencias(prev => 
      prev.map(oco => 
        oco.id === ocorrenciaId 
          ? { ...oco, ...dadosAtualizados }
          : oco
      )
    );
  }, []);

  /**
   * Remover ocorrência
   */
  const removeOcorrencia = useCallback((ocorrenciaId) => {
    setOcorrencias(prev => prev.filter(oco => oco.id !== ocorrenciaId));
    setPagination(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1)
    }));
  }, []);

  // Carregar automaticamente ao montar o componente
  useEffect(() => {
    loadOcorrencias();
  }, []); // Apenas na montagem

  return {
    // Dados
    ocorrencias,
    pagination,
    
    // Estados
    loading,
    loadingMore,
    refreshing,
    error,
    
    // Ações
    loadMore,
    refresh,
    reload: loadOcorrencias,
    
    // Mutações otimistas
    addOcorrencia,
    updateOcorrencia,
    removeOcorrencia
  };
};
