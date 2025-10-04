import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from 'react-native';

/**
 * Hook customizado para gerenciar dados de perfil e unidade do usuário
 */
export const useProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carrega os dados do perfil do usuário
   */
  const loadProfile = async () => {
    if (!user?.User_ID) {
      console.warn('⚠️ [useProfile] Nenhum usuário logado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useProfile] Carregando perfil do usuário...');
      
      const response = await apiService.buscarPerfilUsuario(user.User_ID);
      
      if (response.sucesso && response.dados) {
        setProfileData(response.dados);
        console.log('✅ [useProfile] Perfil carregado:', response.dados);
      }
    } catch (err) {
      console.error('❌ [useProfile] Erro ao carregar perfil:', err);
      setError(err.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega os dados da unidade (apartamento)
   */
  const loadUnitDetails = async (unidadeId) => {
    if (!unidadeId && !profileData?.Apto_ID) {
      console.warn('⚠️ [useProfile] ID da unidade não fornecido');
      return;
    }

    const idUnidade = unidadeId || profileData?.Apto_ID;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useProfile] Carregando detalhes da unidade...');
      
      const response = await apiService.buscarDetalhesUnidade(idUnidade);
      
      if (response.sucesso && response.dados) {
        setUnitData(response.dados);
        console.log('✅ [useProfile] Unidade carregada:', response.dados);
      }
    } catch (err) {
      console.error('❌ [useProfile] Erro ao carregar unidade:', err);
      setError(err.message || 'Erro ao carregar dados da unidade');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza os dados do perfil
   */
  const updateProfile = async (dadosAtualizados) => {
    if (!user?.User_ID) {
      throw new Error('Nenhum usuário logado');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useProfile] Atualizando perfil...', dadosAtualizados);
      
      const response = await apiService.atualizarPerfilUsuario(user.User_ID, dadosAtualizados);
      
      if (response.sucesso && response.dados) {
        setProfileData(response.dados);
        
        // Atualiza também o contexto de autenticação se necessário
        if (updateUser) {
          await updateUser({
            user_nome: dadosAtualizados.user_nome || user.user_nome,
            user_email: dadosAtualizados.user_email || user.user_email,
            user_telefone: dadosAtualizados.user_telefone || user.user_telefone,
          });
        }
        
        console.log('✅ [useProfile] Perfil atualizado com sucesso');
        return response.dados;
      }
    } catch (err) {
      console.error('❌ [useProfile] Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Altera a senha do usuário
   */
  const changePassword = async (senhaAtual, novaSenha) => {
    if (!user?.User_ID) {
      throw new Error('Nenhum usuário logado');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useProfile] Alterando senha...');
      
      const response = await apiService.alterarSenha(user.User_ID, senhaAtual, novaSenha);
      
      if (response.sucesso) {
        console.log('✅ [useProfile] Senha alterada com sucesso');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('❌ [useProfile] Erro ao alterar senha:', err);
      setError(err.message || 'Erro ao alterar senha');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faz upload da foto de perfil
   */
  const uploadProfilePhoto = async (fileUri) => {
    if (!user?.User_ID) {
      throw new Error('Nenhum usuário logado');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useProfile] Fazendo upload da foto de perfil...');
      
      const response = await apiService.uploadFotoPerfil(user.User_ID, fileUri);
      
      if (response.sucesso && response.dados) {
        // Atualiza o profileData com a nova URL da foto
        setProfileData(prev => ({
          ...prev,
          user_foto: response.dados.user_foto || response.dados.url
        }));

        // Atualiza também no contexto de autenticação
        if (updateUser) {
          await updateUser({
            user_foto: response.dados.user_foto || response.dados.url
          });
        }
        
        console.log('✅ [useProfile] Foto de perfil atualizada');
        return response.dados;
      }
    } catch (err) {
      console.error('❌ [useProfile] Erro ao fazer upload da foto:', err);
      setError(err.message || 'Erro ao atualizar foto de perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seletor de imagem (mantido para compatibilidade)
   */
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para alterar a foto.');
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 1 
    });
    
    if (!pickerResult.canceled) {
      const fileUri = pickerResult.assets[0].uri;
      
      try {
        await uploadProfilePhoto(fileUri);
        Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
      } catch (error) {
        Alert.alert('Erro', error.message || 'Erro ao atualizar foto de perfil');
      }
    }
  };

  /**
   * Retorna o label do tipo de usuário
   */
  const getUserTypeLabel = (userType) => ({
    morador: 'Morador',
    proprietario: 'Proprietário',
    sindico: 'Síndico',
    porteiro: 'Porteiro'
  }[userType] || 'Morador');

  /**
   * Carrega o perfil automaticamente quando o usuário está disponível
   */
  useEffect(() => {
    if (user?.User_ID && !profileData) {
      loadProfile();
    }
  }, [user?.User_ID]);

  return {
    // Estados
    profileData,
    unitData,
    loading,
    error,
    
    // Funções de API
    loadProfile,
    loadUnitDetails,
    updateProfile,
    changePassword,
    uploadProfilePhoto,
    
    // Funções auxiliares (compatibilidade)
    handlePickImage,
    getUserTypeLabel,
    
    // Dados do usuário do contexto
    user,
  };
};
