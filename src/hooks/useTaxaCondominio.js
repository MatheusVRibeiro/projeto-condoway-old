import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useTaxaCondominio = () => {
  const [taxa, setTaxa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTaxa = async () => {
      try {
        setLoading(true);
        const response = await apiService.buscarTaxaCondominio();
        
        if (response?.sucesso && response?.dados !== undefined) {
          setTaxa(response.dados);
        } else {
          setTaxa(null);
        }
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar taxa condominial:', err);
        setError(err);
        setTaxa(null);
      } finally {
        setLoading(false);
      }
    };

    loadTaxa();
  }, []);

  // Formata o valor para exibição
  const taxaFormatada = taxa != null
    ? `R$ ${Number(taxa).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Não informado';

  return {
    taxa,
    taxaFormatada,
    loading,
    error
  };
};
