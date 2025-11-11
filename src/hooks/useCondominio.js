import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook customizado para acessar dados do condomínio do morador
 * 
 * Este hook fornece acesso aos dados do condomínio do usuário logado.
 * Os dados vêm diretamente do perfil do usuário carregado via AuthContext.
 * 
 * ✅ O backend agora retorna todos os campos do condomínio no endpoint /usuario/perfil/:userId:
 * - cond_id
 * - cond_nome
 * - cond_endereco
 * - cond_cidade
 * - cond_estado
 * 
 * Moradores não podem criar, editar ou deletar condomínios.
 */
export const useCondominio = () => {
  const { user } = useAuth();
  const [loading] = useState(false);
  const [error] = useState(null);

  // Dados do condomínio vêm diretamente do perfil do usuário
  const condominioData = useMemo(() => {
    const dados = {
      cond_id: user?.cond_id || null,
      cond_nome: user?.cond_nome || null,
      cond_endereco: user?.cond_endereco || null,
      cond_cidade: user?.cond_cidade || null,
      cond_estado: user?.cond_estado || null,
    };

    console.log('🏘️ [useCondominio] Dados do condomínio:', dados);

    // Avisar se algum campo importante está faltando
    if (dados.cond_id && (!dados.cond_endereco || !dados.cond_cidade || !dados.cond_estado)) {
      console.warn('⚠️ [useCondominio] Dados do condomínio incompletos. Verifique se o backend está retornando todos os campos.');
    }

    return dados;
  }, [user?.cond_id, user?.cond_nome, user?.cond_endereco, user?.cond_cidade, user?.cond_estado]);

  return {
    // Estados
    condominioData,
    loading,
    error,
    
    // Utilitários
    condominioId: condominioData.cond_id,
    hasCondominio: !!condominioData.cond_id,
  };
};

