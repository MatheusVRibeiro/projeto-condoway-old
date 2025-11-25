import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, FlatList, ActivityIndicator, Pressable, RefreshControl, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { categories } from './mock';
import { MessageSquareWarning, ArrowLeft, CheckCircle, Paperclip, XCircle, Share2, Copy, MessageCircle, Plus, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useAuth } from '../../../contexts/AuthContext';
import { usePaginatedOcorrencias } from '../../../hooks';
import ActionSheet from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../../services/api'; // Importando a API centralizada com axios
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import CategoryCard from '../../../components/CategoryCard';
import OccurrenceHeader from '../../../components/OccurrenceHeader';
import StepProgress from '../../../components/StepProgress';
import PriorityChips from '../../../components/PriorityChips';
import OccurrenceCard from '../../../components/OccurrenceCard';
import OccurrenceEmptyState from '../../../components/OccurrenceEmptyState';
import OccurrenceModal from '../../../components/OccurrenceModal';

export default function Ocorrencias() {
  const { theme } = useTheme();
  const { user } = useAuth(); // Pegando dados do usuário autenticado
  const actionSheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  const openImageOptions = () => actionSheetRef.current?.setModalVisible(true);
  const closeImageOptions = () => actionSheetRef.current?.setModalVisible(false);
  const [activeTab, setActiveTab] = useState('registrar');
  
  // ✅ Hook de paginação com infinite scroll
  const {
    ocorrencias,
    loading,
    loadingMore,
    refreshing,
    error: loadError,
    pagination,
    loadMore,
    refresh,
    addOcorrencia
  } = usePaginatedOcorrencias(20);
  
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('media');
  // support multiple attachments (max 3)
  const [attachments, setAttachments] = useState([]);
  const ATTACHMENT_LIMIT = 3;
  const [uploading, setUploading] = useState(false); // Para formulário de criação
  const [uploadProgress, setUploadProgress] = useState({}); // {uri: percent}
  const [expandedId, setExpandedId] = useState(null);
  
  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState('abertas'); // Iniciado em 'abertas' ao invés de 'todas'
  // refreshing agora vem do hook
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const DRAFT_KEY = '@condoway_occurrence_draft_v1';

  // ✅ Mapear ocorrências do hook para o formato esperado pela tela
  const myIssues = useMemo(() => {
    if (!ocorrencias || !Array.isArray(ocorrencias)) return [];
    
    console.log('🔍 [Ocorrencias] Total de ocorrências carregadas:', ocorrencias.length);
    console.log('🔍 [Ocorrencias] user.userap_id:', user?.userap_id);
    
    // Mapear os dados da API para o formato esperado
    const mapped = ocorrencias.map(oco => ({
      id: oco.oco_id,
      protocol: oco.oco_protocolo,
      title: oco.oco_categoria,
      category: oco.oco_categoria,
      description: oco.oco_descricao,
      location: oco.oco_localizacao,
      date: oco.oco_data ? new Date(oco.oco_data).toLocaleString('pt-BR') : '',
      status: oco.oco_status || 'Aberta', // Manter o status original do backend
      priority: oco.oco_prioridade?.toLowerCase() || 'media',
      attachments: oco.oco_imagem ? [oco.oco_imagem] : [],
      comments: [
        {
          author: 'Morador',
          text: oco.oco_descricao,
          date: oco.oco_data ? new Date(oco.oco_data).toLocaleString('pt-BR') : ''
        }
      ],
      // Dados originais para referência
      _original: oco
    }));
    
    console.log('🔍 [Ocorrencias] Ocorrências antes do filtro:', mapped.map(o => ({
      id: o.id,
      userap_id: o._original?.userap_id
    })));
    
    const filtered = mapped.filter(oco => {
      // Filtrar apenas ocorrências do usuário logado
      const matches = oco._original?.userap_id === user?.userap_id;
      if (!matches) {
        console.log('❌ [Ocorrencias] Ocorrência filtrada:', {
          oco_id: oco.id,
          oco_userap_id: oco._original?.userap_id,
          user_userap_id: user?.userap_id
        });
      }
      return matches;
    });
    
    console.log('✅ [Ocorrencias] Ocorrências após filtro:', filtered.length);
    
    return filtered;
  }, [ocorrencias, user?.userap_id]);

  // ✅ Função simplificada - hook já gerencia o carregamento
  const buscarMinhasOcorrencias = refresh;

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setStep(2);
  };

  const resetForm = async () => {
    setStep(1);
    setCategory(null);
    setDescription('');
    setLocation('');
    setPriority('media');
    setAttachments([]);
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      console.warn('Failed to remove draft', e);
    }
  };

  // compress image helper using expo-image-manipulator (falls back to original URI on error)
  const compressImage = async (uri) => {
    try {
      // try to resize if image is large and compress
      const actions = [{ resize: { width: 1280 } }];
      const result = await ImageManipulator.manipulateAsync(uri, actions, { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
      return result.uri || uri;
    } catch (e) {
      console.warn('Image compression failed, using original uri', e);
      return uri;
    }
  };

  const addAttachment = async (uri) => {
    if (!uri) return;
    if (attachments.length >= ATTACHMENT_LIMIT) {
      Toast.show({ type: 'error', text1: `Máximo de ${ATTACHMENT_LIMIT} anexos` });
      return;
    }
    const compressed = await compressImage(uri);
    setAttachments(prev => [...prev, { id: Date.now().toString() + Math.random().toString(36).slice(2,8), uri: compressed, name: compressed.split('/').pop(), status: 'idle' }]);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) {
      await addAttachment(result.assets[0].uri);
    }
  };

  // Tirar foto com a câmera
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) {
      await addAttachment(result.assets[0].uri);
    }
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
    setUploadProgress(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
  };

  // Upload de arquivo usando a API
  const uploadFile = async (attachmentObj) => {
    if (!user?.token) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { id, uri } = attachmentObj;
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      
      // Simular progresso para feedback visual
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[id] || 0;
          if (current >= 90) return prev;
          return { ...prev, [id]: current + 10 };
        });
      }, 200);

      const url = await apiService.uploadAnexo(uri);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [id]: 100 }));
      
      return { success: true, url };
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  useEffect(() => {
    // draft auto-save
    const saveDraft = async () => {
      if (step === 1) return; // no need to save draft on category select step
      try {
        const draft = { category, description, location, priority, attachments };
        const jsonValue = JSON.stringify(draft);
        await AsyncStorage.setItem(DRAFT_KEY, jsonValue);
      } catch (e) {
        console.warn('Failed to save draft', e);
      }
    };
    saveDraft();
  }, [category, description, location, priority, attachments]);

  useEffect(() => {
    // draft auto-recovery
    const loadDraft = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(DRAFT_KEY);
        if (jsonValue != null) {
          const draft = JSON.parse(jsonValue);
          setCategory(draft.category);
          setDescription(draft.description);
          setLocation(draft.location);
          setPriority(draft.priority);
          setAttachments(draft.attachments);
          setStep(2); // go to details step
        }
      } catch (e) {
        console.warn('Failed to load draft', e);
      }
    };
    loadDraft();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim() || !location.trim()) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos obrigatórios' });
      return;
    }

    console.log('Verificando autenticação:', { 
      user: user ? 'presente' : 'ausente',
      user_id: user?.user_id
    });

    if (!user) {
      Toast.show({ type: 'error', text1: 'Usuário não encontrado', text2: 'Faça login novamente' });
      return;
    }

    // O token é gerenciado automaticamente pelo Axios após o login via setAuthToken()

    try {
      setUploading(true);
      
      // Upload de anexos sequencialmente
      const uploadedAttachments = [];
      for (const attachment of attachments) {
        try {
          if (attachment.uri) {
            const urlAnexo = await apiService.uploadAnexo(attachment.uri);
            uploadedAttachments.push(urlAnexo);
          }
        } catch (e) {
          console.error('Erro no upload do anexo:', e);
          Toast.show({ 
            type: 'error', 
            text1: 'Falha no upload de anexo', 
            text2: 'Tente novamente.' 
          });
          return;
        }
      }

      // NÃO gerar protocolo no cliente. O backend gera o protocolo (oco_protocolo) automaticamente.
      console.log('📤 Montando dados da ocorrência (sem protocolo)');
      const dadosOcorrencia = {
        user_id: user.user_id, // ID do usuário que está criando
        categoria: category?.title || 'Geral',
        descricao: description,
        local: location,
        prioridade: priority.charAt(0).toUpperCase() + priority.slice(1), // Capitalizar primeira letra
        anexos: uploadedAttachments,
      };

      console.log('📤 Enviando ocorrência:', dadosOcorrencia);
      console.log('👤 Dados do usuário para criação:', { 
        user_id: user?.user_id, 
        token: user?.token ? 'presente' : 'ausente' 
      });
      
      const novaOcorrencia = await apiService.criarOcorrencia(dadosOcorrencia);
      
      // pegar protocolo retornado pela API, se houver
      const protocoloRetornado = novaOcorrencia?.oco_protocolo || novaOcorrencia?.protocolo;

      // Garantir que a nova ocorrência tenha um ID válido
      const ocorrenciaComId = {
        oco_id: novaOcorrencia?.oco_id,
        id: novaOcorrencia?.oco_id, // Manter compatibilidade temporária
        protocol: protocoloRetornado || 'Gerando...',
        category: category?.title || 'Geral',
        title: category?.title || 'Ocorrência',
        description,
        location,
        date: new Date().toLocaleString('pt-BR'),
        status: 'Aberta', // Status inicial - será movido para 'Em Análise' pelo síndico
        priority,
        attachments: uploadedAttachments,
        comments: [{ author: 'Morador', text: description, date: new Date().toLocaleString('pt-BR') }],
        ...novaOcorrencia
      };
      
      // Atualizar a lista de ocorrências usando o hook
      addOcorrencia(novaOcorrencia);
      setStep(3);
      
      // Limpar rascunho
      try { 
        await AsyncStorage.removeItem(DRAFT_KEY); 
      } catch(e) {
        console.warn('Erro ao remover rascunho:', e);
      }

      Toast.show({ 
        type: 'success', 
        text1: 'Ocorrência criada com sucesso!',
        text2: protocoloRetornado ? `Protocolo: ${protocoloRetornado}` : undefined
      });

    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro ao criar ocorrência', 
        text2: error.message 
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Aberta': return { backgroundColor: theme.colors.primary + '22', color: theme.colors.primary };
      case 'Em Análise': return { backgroundColor: theme.colors.warning + '22', color: theme.colors.warning };
      case 'Resolvida': return { backgroundColor: theme.colors.success + '22', color: theme.colors.success };
      default: return { backgroundColor: theme.colors.info + '22', color: theme.colors.info };
    }
  };

  const getCategoryLabels = (categoryTitle) => {
    const title = categoryTitle?.toLowerCase();
    
    // Tratamento especial para "Outro" ou "Outro Problema"
    if (title?.includes('outro')) {
      return {
        label: 'Descreva sua solicitação ou problema',
        placeholder: 'Descreva detalhadamente sua solicitação, sugestão ou problema que não se enquadra nas outras categorias. Seja o mais específico possível para que possamos entender e ajudar da melhor forma...'
      };
    }
    
    switch (title) {
      case 'vazamento':
        return {
          label: 'Descreva o problema de vazamento',
          placeholder: 'Descreva com o máximo de detalhes o problema de vazamento que está acontecendo...'
        };
      case 'infraestrutura':
        return {
          label: 'Descreva o problema de infraestrutura',
          placeholder: 'Descreva com o máximo de detalhes o problema de infraestrutura que está acontecendo...'
        };
      case 'elevador':
        return {
          label: 'Descreva o problema do elevador',
          placeholder: 'Descreva com o máximo de detalhes o problema do elevador que está acontecendo...'
        };
      case 'segurança':
        return {
          label: 'Descreva o problema de segurança',
          placeholder: 'Descreva com o máximo de detalhes o problema de segurança que está acontecendo...'
        };
      case 'limpeza':
        return {
          label: 'Descreva o problema de limpeza',
          placeholder: 'Descreva com o máximo de detalhes o problema de limpeza que está acontecendo...'
        };
      default:
        return {
          label: `Descreva o problema de ${categoryTitle?.toLowerCase()}`,
          placeholder: `Descreva com o máximo de detalhes o problema de ${categoryTitle?.toLowerCase()} que está acontecendo...`
        };
    }
  };

  // Contar ocorrências por categoria
  const getCategoryCount = (categoryId) => {
    if (!myIssues || myIssues.length === 0) return 0;
    return myIssues.filter(issue => 
      issue?.category?.toLowerCase() === categoryId.toLowerCase() ||
      issue?.title?.toLowerCase() === categoryId.toLowerCase()
    ).length;
  };

  // Calcular estatísticas das ocorrências
  const getOccurrenceStats = () => {
    if (!myIssues || myIssues.length === 0) {
      return { total: 0, open: 0, inProgress: 0, resolved: 0 };
    }

    const stats = {
      total: myIssues.length,
      open: myIssues.filter(issue => {
        const status = issue?.status?.toLowerCase();
        return status === 'aberta' || status === 'pendente';
      }).length,
      inProgress: myIssues.filter(issue => {
        const status = issue?.status?.toLowerCase();
        return status === 'em análise' || status === 'em andamento';
      }).length,
      resolved: myIssues.filter(issue => {
        const status = issue?.status?.toLowerCase();
        return status === 'resolvida' || status === 'concluída';
      }).length,
    };

    return stats;
  };

  const renderRegisterContent = () => {
    if (step === 1) {
      return (
        <View>
          {/* Grid de categorias */}
          <View style={[styles.categoryGrid]}>
            {categories.map((cat, index) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                count={getCategoryCount(cat.id)}
                onPress={handleCategorySelect}
                index={index}
              />
            ))}
          </View>
        </View>
      );
    }

    if (step === 2) {
      const charCount = description.length;
      const maxChars = 500;
      const isDescriptionValid = description.trim().length >= 10;
      const isLocationValid = location.trim().length >= 3;

      return (
        <View style={styles.formContainer}>
          {/* Step Progress Indicator */}
          <StepProgress currentStep={2} totalSteps={3} />

          {/* Header com botão voltar */}
          <TouchableOpacity onPress={resetForm} style={styles.formHeader}>
            <ArrowLeft color={theme.colors.textSecondary} size={20} />
            <Text style={{ marginLeft: 8, color: theme.colors.textSecondary, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
          
          <Animatable.View animation="fadeInRight" duration={400}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              Detalhes da Ocorrência
            </Text>
            <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>
              {category?.title}
            </Text>

            {/* Descrição com contador de caracteres */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  {getCategoryLabels(category?.title).label}
                </Text>
                <Text style={[styles.charCounter, { 
                  color: charCount > maxChars ? theme.colors.error : theme.colors.textSecondary 
                }]}>
                  {charCount}/{maxChars}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.textarea,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isDescriptionValid ? theme.colors.border : '#fbbf24',
                    color: theme.colors.text
                  }
                ]}
                placeholder={getCategoryLabels(category?.title).placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                maxLength={maxChars}
                value={description}
                onChangeText={setDescription}
              />
              {!isDescriptionValid && description.length > 0 && (
                <Text style={[styles.validationText, { color: '#f59e0b' }]}>
                  Mínimo de 10 caracteres
                </Text>
              )}
            </View>

            {/* Local com validação */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Local Específico
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.colors.card, 
                    borderColor: isLocationValid ? theme.colors.border : '#fbbf24',
                    color: theme.colors.text 
                  }
                ]}
                placeholder="Ex: Piscina, Garagem Bloco B..."
                placeholderTextColor={theme.colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
              {!isLocationValid && location.length > 0 && (
                <Text style={[styles.validationText, { color: '#f59e0b' }]}>
                  Mínimo de 3 caracteres
                </Text>
              )}
            </View>

            {/* Prioridade com Chips */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Nível de Prioridade
              </Text>
              <PriorityChips
                selectedPriority={priority}
                onSelectPriority={setPriority}
              />
            </View>

            {/* Anexos */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Anexos (opcional)
              </Text>
              <TouchableOpacity
                accessibilityLabel="Adicionar anexo"
                accessibilityHint="Abre opções para tirar foto ou escolher da galeria"
                style={[styles.attachmentButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                onPress={openImageOptions}
              >
                <Paperclip size={18} color={theme.colors.primary} />
                <Text style={[styles.attachmentButtonText, { color: theme.colors.primary }]}>
                  Adicionar Anexo
                </Text>
              </TouchableOpacity>

              {attachments.length > 0 && (
                <View style={styles.attachmentsRow}>
                  {attachments.map(a => (
                    <View key={a.id} style={styles.thumbnailWrapper}>
                      <Image source={{ uri: a.uri }} style={styles.thumbnail} />
                      {uploadProgress[a.id] ? (
                        <View style={styles.progressBarContainer}>
                          <View style={[styles.progressBar, { width: `${uploadProgress[a.id]}%`, backgroundColor: theme.colors.primary }]} />
                        </View>
                      ) : null}
                      <TouchableOpacity 
                        onPress={() => handleRemoveAttachment(a.id)} 
                        style={styles.removeAttachmentButton} 
                        accessibilityLabel={`Remover anexo ${a.name}`}
                      >
                        <XCircle size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <Text style={{ marginTop: 6, color: theme.colors.textSecondary, fontSize: 12 }}>
                {attachments.length}/{ATTACHMENT_LIMIT} anexos
              </Text>
            </View>

            {/* Botão de envio melhorado */}
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: theme.colors.primary,
                  opacity: (isDescriptionValid && isLocationValid) ? 1 : 0.6
                }
              ]} 
              onPress={handleSubmit}
              disabled={!isDescriptionValid || !isLocationValid}
            >
              <CheckCircle size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Enviar Ocorrência</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      );
    }

    if (step === 3) {
      const lastOccurrence = myIssues[0];
      
      const handleCopyProtocol = async () => {
        if (lastOccurrence?.protocol) {
          try {
            await Clipboard.setStringAsync(lastOccurrence.protocol);
            Toast.show({
              type: 'success',
              text1: 'Protocolo copiado!',
              text2: `${lastOccurrence.protocol} copiado para a área de transferência`,
              position: 'bottom',
              visibilityTime: 2000,
            });
          } catch (e) {
            console.warn('Erro ao copiar protocolo:', e);
          }
        }
      };

      const handleShareOccurrence = async () => {
        if (!lastOccurrence) return;
        try {
          await Share.share({
            message: `📋 Ocorrência Registrada!\n\n` +
                     `Protocolo: ${lastOccurrence.protocol}\n` +
                     `Categoria: ${category?.title}\n` +
                     `Local: ${location}\n` +
                     `Prioridade: ${priority.charAt(0).toUpperCase() + priority.slice(1)}\n\n` +
                     `Descrição: ${description}`,
          });
        } catch (error) {
          console.error('Erro ao compartilhar:', error);
        }
      };

      return (
        <Animatable.View animation="fadeIn" duration={600} style={styles.confirmationContainer}>
          {/* Animação de sucesso */}
          <Animatable.View animation="bounceIn" delay={200} duration={800}>
            <View style={[styles.successIconContainer, { backgroundColor: '#d1fae5' }]}>
              <CheckCircle color="#10b981" size={40} strokeWidth={2.5} />
            </View>
          </Animatable.View>

          <Animatable.Text animation="fadeInUp" delay={400} style={[styles.confirmationTitle, { color: theme.colors.text }]}>
            Ocorrência Enviada!
          </Animatable.Text>
          
          {/* Protocolo copiável */}
          <Animatable.View animation="fadeInUp" delay={600} style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={handleCopyProtocol}
              style={[styles.protocolContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.protocolLabel, { color: theme.colors.textSecondary }]}>
                Protocolo
              </Text>
              <View style={styles.protocolRow}>
                <Text style={[styles.protocolNumber, { color: theme.colors.primary }]}>
                  {lastOccurrence?.protocol || 'Gerando...'}
                </Text>
                <Copy size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.protocolHint, { color: theme.colors.textSecondary }]}>
                Toque para copiar
              </Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Resumo da ocorrência */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={800}
            style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Resumo da Ocorrência</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Categoria:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{category?.title}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Local:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{location}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Prioridade:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </View>
          </Animatable.View>

          {/* Timeline de próximos passos */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={1000}
            style={[styles.timelineCard, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}
          >
            <Text style={[styles.timelineTitle, { color: '#1e40af' }]}>Próximos Passos</Text>
            <View style={styles.timelineStep}>
              <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]} />
              <Text style={[styles.timelineText, { color: '#334155' }]}>Ocorrência registrada ✓</Text>
            </View>
            <View style={styles.timelineStep}>
              <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={[styles.timelineText, { color: '#334155' }]}>Síndico será notificado</Text>
            </View>
            <View style={styles.timelineStep}>
              <View style={[styles.timelineDot, { backgroundColor: '#6b7280' }]} />
              <Text style={[styles.timelineText, { color: '#334155' }]}>Aguarde análise e resposta</Text>
            </View>
          </Animatable.View>
          
          {/* Botões de ação */}
          <Animatable.View animation="fadeInUp" delay={1200} style={styles.confirmationActions}>
            <TouchableOpacity 
              style={[styles.actionButtonOutline, { borderColor: theme.colors.primary }]} 
              onPress={handleShareOccurrence}
              activeOpacity={0.7}
            >
              <Share2 size={14} color={theme.colors.primary} />
              <Text style={[styles.actionButtonOutlineText, { color: theme.colors.primary }]}>Compartilhar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButtonPrimary}
              onPress={() => { resetForm(); setActiveTab('minhas'); }}
              activeOpacity={0.8}
            >
              <MessageCircle size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonPrimaryText}>Ver Minhas Ocorrências</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButtonGhost}
              onPress={resetForm}
              activeOpacity={0.6}
            >
              <Text style={[styles.actionButtonGhostText, { color: theme.colors.textSecondary }]}>
                Registrar Nova Ocorrência
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      );
    }
  };

  // ✅ onRefresh agora usa o refresh do hook (buscarMinhasOcorrencias = refresh)
  
  // Filtrar ocorrências por status
  const getFilteredIssues = () => {
    console.log('🔍 [getFilteredIssues] myIssues recebido:', myIssues.length);
    let filtered = myIssues.filter(item => item && item.id); // Validação de segurança usando id

    // Filtrar por status
    if (filterStatus !== 'todas') {
      filtered = filtered.filter(issue => {
        const status = issue.status?.toLowerCase();
        switch (filterStatus) {
          case 'abertas':
            return status === 'aberta' || status === 'pendente';
          case 'analise':
            return status === 'em análise' || status === 'em andamento';
          case 'resolvidas':
            return status === 'resolvida' || status === 'concluída';
          default:
            return true;
        }
      });
    }

    console.log('✅ [getFilteredIssues] Resultado após filtros:', filtered.length);
    return filtered;
  };

  // Agrupar ocorrências por período (Hoje, Esta semana, Este mês, Mais antigas)
  const groupOccurrencesByPeriod = (issues) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups = {
      hoje: [],
      semana: [],
      mes: [],
      antigas: []
    };

    issues.forEach(issue => {
      if (!issue.date) {
        groups.antigas.push(issue);
        return;
      }

      // Extrair data do formato brasileiro "DD/MM/YYYY, HH:MM:SS"
      const dateStr = issue.date.split(',')[0]; // "DD/MM/YYYY"
      const [day, month, year] = dateStr.split('/').map(Number);
      const issueDate = new Date(year, month - 1, day);

      if (issueDate >= today) {
        groups.hoje.push(issue);
      } else if (issueDate >= weekAgo) {
        groups.semana.push(issue);
      } else if (issueDate >= monthAgo) {
        groups.mes.push(issue);
      } else {
        groups.antigas.push(issue);
      }
    });

    return groups;
  };

  const renderMyIssues = () => {
    const filteredIssues = getFilteredIssues();
    const groupedIssues = groupOccurrencesByPeriod(filteredIssues);
    const stats = getOccurrenceStats();

    return (
      <View style={{ flex: 1 }}>
        {/* Header com estatísticas */}
        {stats.total > 0 && (
          <OccurrenceHeader
            total={stats.total}
            open={stats.open}
            inProgress={stats.inProgress}
            resolved={stats.resolved}
          />
        )}

        {/* Tabs de filtro por status - SEM "Todas" e SEM badges de contagem */}
        <View style={styles.statusFilterContainer}>
          {[
            { key: 'abertas', label: 'Abertas' },
            { key: 'analise', label: 'Em Análise' },
            { key: 'resolvidas', label: 'Resolvidas' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.statusFilterTab,
                {
                  backgroundColor: filterStatus === tab.key ? theme.colors.primary : theme.colors.card,
                  borderColor: filterStatus === tab.key ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setFilterStatus(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  { color: filterStatus === tab.key ? '#ffffff' : theme.colors.textSecondary },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de ocorrências agrupadas por período */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Hoje */}
          {groupedIssues.hoje.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.periodHeader, { color: theme.colors.text }]}>Hoje</Text>
              {groupedIssues.hoje.map((item, index) => (
                <OccurrenceCard
                  key={item?.oco_id?.toString() || item?.id?.toString() || `hoje-${index}`}
                  item={item}
                  index={index}
                  onPress={(issue) => {
                    setSelectedOccurrence(issue);
                    setShowModal(true);
                  }}
                />
              ))}
            </View>
          )}

          {/* Esta Semana */}
          {groupedIssues.semana.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.periodHeader, { color: theme.colors.text }]}>Esta Semana</Text>
              {groupedIssues.semana.map((item, index) => (
                <OccurrenceCard
                  key={item?.oco_id?.toString() || item?.id?.toString() || `semana-${index}`}
                  item={item}
                  index={index}
                  onPress={(issue) => {
                    setSelectedOccurrence(issue);
                    setShowModal(true);
                  }}
                />
              ))}
            </View>
          )}

          {/* Este Mês */}
          {groupedIssues.mes.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.periodHeader, { color: theme.colors.text }]}>Este Mês</Text>
              {groupedIssues.mes.map((item, index) => (
                <OccurrenceCard
                  key={item?.oco_id?.toString() || item?.id?.toString() || `mes-${index}`}
                  item={item}
                  index={index}
                  onPress={(issue) => {
                    setSelectedOccurrence(issue);
                    setShowModal(true);
                  }}
                />
              ))}
            </View>
          )}

          {/* Mais Antigas */}
          {groupedIssues.antigas.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.periodHeader, { color: theme.colors.text }]}>Mais Antigas</Text>
              {groupedIssues.antigas.map((item, index) => (
                <OccurrenceCard
                  key={item?.oco_id?.toString() || item?.id?.toString() || `antigas-${index}`}
                  item={item}
                  index={index}
                  onPress={(issue) => {
                    setSelectedOccurrence(issue);
                    setShowModal(true);
                  }}
                />
              ))}
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
                Carregando ocorrências...
              </Text>
            </View>
          )}

          {/* Error */}
          {loadError && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.error, marginBottom: 16, textAlign: 'center' }}>
                {loadError}
              </Text>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: theme.colors.primary, 
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8 
                }}
                onPress={refresh}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Tentar novamente
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty state */}
          {filteredIssues.length === 0 && !loading && !loadError && (
            <OccurrenceEmptyState
              message={`Nenhuma ocorrência ${filterStatus === 'abertas' ? 'aberta' : filterStatus === 'analise' ? 'em análise' : 'resolvida'}`}
            />
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.content, { flex: 1 }]}>
        <View style={styles.header}>
          <MessageSquareWarning color={theme.colors.primary} size={28} />
          <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>Registrar Ocorrências</Text>
        </View>

        {step === 1 && (
          <View style={[styles.tabsContainer, { backgroundColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'registrar' && [styles.tabButtonActive, { 
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.primary 
                }]
              ]}
              onPress={() => setActiveTab('registrar')}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Plus 
                  size={18} 
                  color={activeTab === 'registrar' ? theme.colors.primary : theme.colors.textSecondary} 
                  strokeWidth={2.5} 
                />
                <Text style={[
                  styles.tabText,
                  { color: theme.colors.textSecondary },
                  activeTab === 'registrar' && [styles.tabTextActive, { color: theme.colors.primary }]
                ]}>
                  Registrar Nova
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'minhas' && [styles.tabButtonActive, { 
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.primary 
                }]
              ]}
              onPress={() => setActiveTab('minhas')}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FileText 
                  size={18} 
                  color={activeTab === 'minhas' ? theme.colors.primary : theme.colors.textSecondary} 
                  strokeWidth={2.5} 
                />
                <Text style={[
                  styles.tabText,
                  { color: theme.colors.textSecondary },
                  activeTab === 'minhas' && [styles.tabTextActive, { color: theme.colors.primary }]
                ]}>
                  Minhas Ocorrências
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'registrar' ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={step === 2 ? styles.formScrollContent : styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderRegisterContent()}
          </ScrollView>
        ) : (
          <View style={[styles.tabContent, { flex: 1 }]}>
            {renderMyIssues()}
          </View>
        )}
      </View>

      <ActionSheet ref={actionSheetRef} containerStyle={{ backgroundColor: 'transparent' }}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TouchableOpacity style={styles.modalOption} onPress={async () => { await handleTakePhoto(); closeImageOptions(); }}>
            <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>Tirar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={async () => { await handlePickImage(); closeImageOptions(); }}>
            <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>Escolher da Galeria</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalOption, styles.modalCancel]} onPress={closeImageOptions}>
            <Text style={[styles.modalOptionText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      <OccurrenceModal
        visible={showModal}
        occurrence={selectedOccurrence}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}
