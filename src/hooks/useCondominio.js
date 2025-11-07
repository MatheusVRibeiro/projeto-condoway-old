import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook customizado para acessar dados do condomínio do morador
 * 
 * Este hook apenas fornece acesso aos dados do condomínio do usuário logado.
 * Moradores não podem criar, editar ou deletar condomínios.
 * 
 * Os dados vêm do perfil do usuário carregado via useProfile/AuthContext.
 */
export const useCondominio = () => {
  const { user } = useAuth();
  const [loading] = useState(false);
  const [error] = useState(null);

  // Dados do condomínio vêm do perfil do usuário (carregado via useProfile)
  const condominioData = {
    cond_id: user?.cond_id || null,
    cond_nome: user?.cond_nome || null,
    cond_endereco: user?.cond_endereco || null,
    cond_cidade: user?.cond_cidade || null,
    cond_estado: user?.cond_estado || null,
  };

  console.log('🏘️ [useCondominio] Dados do condomínio:', condominioData);

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

