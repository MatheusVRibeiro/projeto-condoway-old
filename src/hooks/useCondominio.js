import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook customizado para gerenciar dados do condomínio
 */
export const useCondominio = (condominioId = null) => {
  const { user } = useAuth();
  const [condominioData, setCondominioData] = useState(null);
  const [condominios, setCondominios] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ID do condomínio pode vir do parâmetro ou do usuário logado
  // Tenta todos os formatos possíveis: Cond_ID, cond_id, condId
  const condId = condominioId || user?.Cond_ID || user?.cond_id || user?.condId;
  
  console.log('🏘️ [useCondominio] condId:', condId);
  console.log('👤 [useCondominio] user disponível:', {
    Cond_ID: user?.Cond_ID,
    cond_id: user?.cond_id,
    condId: user?.condId
  });

  /**
   * Busca informações de um condomínio específico
   */
  const loadCondominio = async (id = condId) => {
    if (!id) {
      console.warn('⚠️ [useCondominio] ID do condomínio não fornecido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 [useCondominio] Carregando condomínio com ID: ${id}...`);
      
      const response = await apiService.buscarCondominio(id);
      
      if (response.sucesso && response.dados) {
        setCondominioData(response.dados);
        console.log('✅ [useCondominio] Condomínio carregado:', response.dados);
        console.log('📍 [useCondominio] Endereço:', response.dados.cond_endereco);
        console.log('🏙️ [useCondominio] Cidade:', response.dados.cond_cidade);
      }
    } catch (err) {
      console.error('❌ [useCondominio] Erro ao carregar condomínio:', err);
      setError(err.message || 'Erro ao carregar condomínio');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lista todos os condomínios
   */
  const loadCondominios = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useCondominio] Listando condomínios...');
      
      const response = await apiService.listarCondominios();
      
      if (response.sucesso && response.dados) {
        setCondominios(response.dados);
        console.log('✅ [useCondominio] Condomínios carregados:', response.dados);
      }
    } catch (err) {
      console.error('❌ [useCondominio] Erro ao listar condomínios:', err);
      setError(err.message || 'Erro ao listar condomínios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria um novo condomínio
   */
  const createCondominio = async (dadosCondominio) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useCondominio] Criando condomínio...', dadosCondominio);
      
      const response = await apiService.criarCondominio(dadosCondominio);
      
      if (response.sucesso && response.dados) {
        console.log('✅ [useCondominio] Condomínio criado com sucesso');
        
        // Atualiza a lista de condomínios
        setCondominios(prev => [...prev, response.dados]);
        
        return response.dados;
      }
    } catch (err) {
      console.error('❌ [useCondominio] Erro ao criar condomínio:', err);
      setError(err.message || 'Erro ao criar condomínio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza informações do condomínio
   */
  const updateCondominio = async (id, dadosCondominio) => {
    const condominioId = id || condId;
    
    if (!condominioId) {
      throw new Error('ID do condomínio não fornecido');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useCondominio] Atualizando condomínio...', dadosCondominio);
      
      const response = await apiService.atualizarCondominio(condominioId, dadosCondominio);
      
      if (response.sucesso && response.dados) {
        setCondominioData(response.dados);
        
        // Atualiza também na lista se estiver carregada
        setCondominios(prev => 
          prev.map(c => c.cond_id === condominioId ? response.dados : c)
        );
        
        console.log('✅ [useCondominio] Condomínio atualizado com sucesso');
        return response.dados;
      }
    } catch (err) {
      console.error('❌ [useCondominio] Erro ao atualizar condomínio:', err);
      setError(err.message || 'Erro ao atualizar condomínio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deleta um condomínio
   */
  const deleteCondominio = async (id) => {
    const condominioId = id || condId;
    
    if (!condominioId) {
      throw new Error('ID do condomínio não fornecido');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useCondominio] Deletando condomínio...');
      
      const response = await apiService.deletarCondominio(condominioId);
      
      if (response.sucesso) {
        // Remove da lista
        setCondominios(prev => prev.filter(c => c.cond_id !== condominioId));
        
        // Limpa os dados se for o condomínio atual
        if (condominioId === condId) {
          setCondominioData(null);
        }
        
        console.log('✅ [useCondominio] Condomínio deletado com sucesso');
        return true;
      }
    } catch (err) {
      console.error('❌ [useCondominio] Erro ao deletar condomínio:', err);
      setError(err.message || 'Erro ao deletar condomínio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca estatísticas do condomínio
   */
  const loadEstatisticas = async (id = condId) => {
    if (!id) {
      console.warn('⚠️ [useCondominio] ID do condomínio não fornecido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useCondominio] Carregando estatísticas...');
      
      const response = await apiService.buscarEstatisticasCondominio(id);
      
      if (response.sucesso && response.dados) {
        setEstatisticas(response.dados);
        console.log('✅ [useCondominio] Estatísticas carregadas:', response.dados);
      }
    } catch (err) {
      console.error('❌ [useCondominio] Erro ao carregar estatísticas:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega o condomínio automaticamente quando disponível
   */
  useEffect(() => {
    if (condId && !condominioData) {
      loadCondominio(condId);
    }
  }, [condId]);

  return {
    // Estados
    condominioData,
    condominios,
    estatisticas,
    loading,
    error,
    
    // Funções
    loadCondominio,
    loadCondominios,
    createCondominio,
    updateCondominio,
    deleteCondominio,
    loadEstatisticas,
    
    // Utilitários
    condominioId: condId,
  };
};
