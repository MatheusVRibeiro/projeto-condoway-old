import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, Alert, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { categories } from './mock';
import { MessageSquareWarning, ArrowLeft, CheckCircle, Paperclip, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useAuth } from '../../../contexts/AuthContext';
import ActionSheet from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../../services/api'; // Importando a API centralizada

export default function Ocorrencias() {
  const { theme } = useTheme();
  const { user } = useAuth(); // Pegando dados do usuário autenticado
  const actionSheetRef = useRef(null);
  const commentsScrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const openImageOptions = () => actionSheetRef.current?.setModalVisible(true);
  const closeImageOptions = () => actionSheetRef.current?.setModalVisible(false);
  const [activeTab, setActiveTab] = useState('registrar');
  const [myIssues, setMyIssues] = useState([]);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('media');
  // support multiple attachments (max 3)
  const [attachments, setAttachments] = useState([]);
  const ATTACHMENT_LIMIT = 3;
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // {uri: percent}
  const [expandedId, setExpandedId] = useState(null);
  const [messageDrafts, setMessageDrafts] = useState({}); // { [issueId]: text }

  const DRAFT_KEY = '@condoway_occurrence_draft_v1';

  // Buscar ocorrências ao carregar a tela
  useEffect(() => {
    console.log('Dados do usuário:', user); // Debug
    if (user?.user_id && user?.token) {
      buscarMinhasOcorrencias();
    } else {
      console.log('Usuário não autenticado ou sem token:', { 
        user_id: user?.user_id, 
        token: user?.token ? 'presente' : 'ausente' 
      });
    }
  }, [user]);

  const buscarMinhasOcorrencias = async () => {
    try {
      console.log('🔍 Iniciando busca de ocorrências...');
      console.log('👤 Dados do usuário:', { user_id: user?.user_id, token: user?.token ? 'presente' : 'ausente' });
      
      setUploading(true);
      const ocorrenciasDaApi = await api.buscarOcorrencias(user.token);
      
      console.log('📋 Ocorrências recebidas da API:', ocorrenciasDaApi);
      console.log('📊 Tipo de dados:', typeof ocorrenciasDaApi);
      console.log('📏 É array?', Array.isArray(ocorrenciasDaApi));
      console.log('📏 Quantidade:', ocorrenciasDaApi?.length);
      
      // Garantir que sempre seja um array válido
      const ocorrenciasValidas = Array.isArray(ocorrenciasDaApi) ? ocorrenciasDaApi : [];
      console.log('✅ Ocorrências válidas:', ocorrenciasValidas);
      
      // Mapear os dados da API para o formato esperado pelo componente
      const ocorrenciasMapeadas = ocorrenciasValidas.map(oco => ({
        id: oco.oco_id,
        protocol: oco.oco_protocolo,
        title: oco.oco_categoria,
        category: oco.oco_categoria,
        description: oco.oco_descricao,
        location: oco.oco_localizacao,
        date: new Date(oco.oco_data).toLocaleString('pt-BR'),
        status: oco.oco_status === 'Aberta' ? 'Em Análise' : 
                oco.oco_status === 'Em Andamento' ? 'Em Análise' : 
                oco.oco_status === 'Resolvida' ? 'Resolvida' : oco.oco_status,
        priority: oco.oco_prioridade?.toLowerCase() || 'media',
        attachments: oco.oco_imagem ? [oco.oco_imagem] : [],
        comments: [
          {
            author: 'Morador',
            text: oco.oco_descricao,
            date: new Date(oco.oco_data).toLocaleString('pt-BR')
          }
        ]
      }));
      
      // Filtrar apenas as ocorrências do usuário logado
      const minhasOcorrencias = ocorrenciasMapeadas.filter(oco => {
        const ocorrenciaOriginal = ocorrenciasValidas.find(orig => orig.oco_id === oco.id);
        return ocorrenciaOriginal?.userap_id === user?.user_id;
      });
      
      console.log('🎯 Ocorrências mapeadas (todas):', ocorrenciasMapeadas.length);
      console.log('👤 Minhas ocorrências filtradas:', minhasOcorrencias.length, minhasOcorrencias);
      console.log('🔍 User ID para filtro:', user?.user_id);
      
      setMyIssues(minhasOcorrencias);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar ocorrências',
        text2: error.message
      });
    } finally {
      setUploading(false);
    }
  };

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
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
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

      const url = await api.uploadAnexo(uri, user.token);
      
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

  // Função para enviar comentário
  const handleSendComment = async (issueId, text) => {
    if (!text.trim()) {
      Toast.show({ type: 'error', text1: 'Digite uma mensagem' });
      return;
    }

    if (!user?.token) {
      Toast.show({ type: 'error', text1: 'Usuário não autenticado' });
      return;
    }

    try {
      const novoComentario = await api.adicionarComentario(issueId, text, user.token);
      
      // Atualizar a lista local com o novo comentário
      setMyIssues(prev => prev.map(it => 
        it.id === issueId 
          ? { ...it, comments: [...(it.comments || []), novoComentario] } 
          : it
      ));
      
      setMessageDrafts(prev => ({ ...prev, [issueId]: '' }));
      Toast.show({ type: 'success', text1: 'Mensagem enviada' });
      
      // Autoscroll para o final
      setTimeout(() => commentsScrollRef.current?.scrollToEnd({ animated: true }), 150);
      
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro ao enviar mensagem', 
        text2: error.message 
      });
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() || !location.trim()) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos obrigatórios' });
      return;
    }

    console.log('Verificando autenticação:', { 
      user: user ? 'presente' : 'ausente',
      user_id: user?.user_id,
      token: user?.token ? 'presente' : 'ausente'
    });

    if (!user) {
      Toast.show({ type: 'error', text1: 'Usuário não encontrado', text2: 'Faça login novamente' });
      return;
    }

    if (!user.token) {
      Toast.show({ type: 'error', text1: 'Token de autenticação não encontrado', text2: 'Faça login novamente' });
      return;
    }

    try {
      setUploading(true);
      
      // Upload de anexos sequencialmente
      const uploadedAttachments = [];
      for (const attachment of attachments) {
        try {
          if (attachment.uri) {
            const urlAnexo = await api.uploadAnexo(attachment.uri, user.token);
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
      
      const novaOcorrencia = await api.criarOcorrencia(dadosOcorrencia, user.token);
      
      // pegar protocolo retornado pela API, se houver
      const protocoloRetornado = novaOcorrencia?.oco_protocolo || novaOcorrencia?.protocolo;

      // Garantir que a nova ocorrência tenha um ID válido
      const ocorrenciaComId = {
        id: novaOcorrencia?.oco_id || novaOcorrencia?.id || Date.now(),
        protocol: protocoloRetornado || 'Gerando...',
        category: category?.title || 'Geral',
        title: category?.title || 'Ocorrência',
        description,
        location,
        date: new Date().toLocaleString('pt-BR'),
        status: 'Em Análise', // Status inicial mais apropriado
        priority,
        attachments: uploadedAttachments,
        comments: [{ author: 'Morador', text: description, date: new Date().toLocaleString('pt-BR') }],
        ...novaOcorrencia
      };
      
      // Atualizar a lista de ocorrências
      setMyIssues(prev => [ocorrenciaComId, ...prev]);
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

  const renderRegisterContent = () => {
    if (step === 1) {
      return (
        <View style={[styles.categoryGrid]}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
              ]}
              onPress={() => handleCategorySelect(cat)}
            >
              <cat.icon color={theme.colors.primary} size={32} />
              <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (step === 2) {
      return (
        <View>
          <TouchableOpacity onPress={resetForm} style={styles.formHeader}>
            <ArrowLeft color={theme.colors.textSecondary} size={20} />
            <Text style={{ marginLeft: 8, color: theme.colors.textSecondary }}>Voltar</Text>
          </TouchableOpacity>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>Detalhes da Ocorrência - {category?.title}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{getCategoryLabels(category?.title).label}</Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }
              ]}
              placeholder={getCategoryLabels(category?.title).placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Local Específico</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }
              ]}
              placeholder="Ex: Piscina, Garagem Bloco B..."
              placeholderTextColor={theme.colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Anexos (opcional)</Text>
            <TouchableOpacity
              accessibilityLabel="Adicionar anexo"
              accessibilityHint="Abre opções para tirar foto ou escolher da galeria"
              style={[styles.attachmentButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              onPress={openImageOptions}
            >
              <Paperclip size={18} color={theme.colors.primary} />
              <Text style={[styles.attachmentButtonText, { color: theme.colors.primary }]}>Adicionar Anexo</Text>
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
                    <TouchableOpacity onPress={() => handleRemoveAttachment(a.id)} style={styles.removeAttachmentButton} accessibilityLabel={`Remover anexo ${a.name}`}>
                      <XCircle size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <Text style={{ marginTop: 6, color: theme.colors.textSecondary }}>{attachments.length}/{ATTACHMENT_LIMIT} anexos</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Prioridade</Text>
            <View style={styles.radioGroup}>
              {['baixa', 'media', 'alta'].map(p => (
                <TouchableOpacity key={p} style={styles.radioButton} onPress={() => setPriority(p)}>
                  <View style={[styles.radioCircle, { borderColor: theme.colors.primary }]}>
                    {priority === p && <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />}
                  </View>
                  <Text style={[styles.radioLabel, { color: theme.colors.text }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Enviar Ocorrência</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.confirmationContainer}>
          <CheckCircle color={theme.colors.success} size={64} />
          <Text style={[styles.confirmationTitle, { color: theme.colors.text }]}>Ocorrência Enviada!</Text>
          
          {/* Exibir o protocolo de forma destacada */}
          <View style={[styles.protocolContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
            <Text style={[styles.protocolLabel, { color: theme.colors.textSecondary }]}>Protocolo</Text>
            <Text style={[styles.protocolNumber, { color: theme.colors.primary }]}>
              {myIssues[0]?.protocol || 'Gerando...'}
            </Text>
          </View>
          
          <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
            O síndico foi notificado. Guarde o número do protocolo para acompanhar sua ocorrência.
          </Text>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.colors.primary }]} onPress={() => { resetForm(); setActiveTab('minhas'); }}>
            <Text style={styles.submitButtonText}>Ver Minhas Ocorrências</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderMyIssues = () => (
    <FlatList
      data={myIssues.filter(item => item && item.id)} // Filtra itens válidos
      keyExtractor={(item, index) => item?.id?.toString() || `item-${index}`}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      renderItem={({ item }) => {
        // Validação de segurança
        if (!item || !item.id) {
          return null;
        }
        
        const issue = item;
        const statusStyle = getStatusStyle(issue.status);
        const isExpanded = expandedId === issue.id;
        return (
          <View style={[styles.accordionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity style={styles.accordionTrigger} onPress={() => { setExpandedId(isExpanded ? null : issue.id); if (!isExpanded) setTimeout(() => commentsScrollRef.current?.scrollToEnd({ animated: true }), 300); }}>
              <View style={styles.triggerLeft}>
                <Text style={[styles.accordionTitle, { color: theme.colors.text }]}>{issue.title}</Text>
                <Text style={[styles.accordionSubtitle, { color: theme.colors.textSecondary }]}>Protocolo: {issue.protocol}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{issue.status}</Text>
              </View>
            </TouchableOpacity>
            {isExpanded && (
              <View style={[styles.accordionContent, { borderTopColor: theme.colors.border }]}>
                {issue.attachments && issue.attachments.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary, marginBottom: 8 }]}>Anexos:</Text>
                    {issue.attachments.map((att, idx) => (
                      <Image key={idx} source={{ uri: att }} style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 8 }} />
                    ))}
                  </View>
                )}

                {/* comments + autoscroll */}
                <ScrollView ref={commentsScrollRef} style={{ maxHeight: 320, marginBottom: 8 }} onContentSizeChange={() => commentsScrollRef.current?.scrollToEnd({ animated: true })}>
                  {issue.comments.map((comment, index) => (
                    <View
                      key={index}
                      style={[
                        styles.commentBubble,
                        comment.author === 'Morador'
                          ? [styles.moradorBubble, { backgroundColor: theme.colors.primary }]
                          : [styles.sindicoBubble, { backgroundColor: theme.colors.background }]
                      ]}
                    >
                      <Text style={comment.author === 'Morador' ? styles.moradorText : [styles.sindicoText, { color: theme.colors.text }]}>{comment.text}</Text>
                      <Text style={[styles.commentDate, { color: comment.author === 'Morador' ? theme.colors.textSecondary : theme.colors.textSecondary }]}>{comment.date}</Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Message input to send a message in this issue */}
                <View style={{ marginTop: 8 }}>
                  <View style={[styles.messageContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <TextInput
                      placeholder="Escreva uma mensagem para o síndico..."
                      placeholderTextColor={theme.colors.textSecondary}
                      value={messageDrafts[issue.id] || ''}
                      onChangeText={(t) => setMessageDrafts(prev => ({ ...prev, [issue.id]: t }))}
                      style={[styles.messageInput, { color: theme.colors.text }]}
                      multiline
                    />
                    <TouchableOpacity
                      accessibilityLabel={`Enviar mensagem para a ocorrência ${issue.protocol}`}
                      style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        const text = (messageDrafts[issue.id] || '').trim();
                        handleSendComment(issue.id, text);
                      }}
                    >
                      <Text style={[styles.sendButtonText, { color: '#fff' }]}>Enviar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
               </View>
             )}
           </View>
         );
       }}
     />
   );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.content, { flex: 1 }]}>
        <View style={styles.header}>
          <MessageSquareWarning color={theme.colors.primary} size={28} />
          <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>Registrar Ocorrências</Text>
        </View>

        {step === 1 && (
          <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'registrar' && [styles.tabButtonActive, { backgroundColor: theme.colors.primary + '22' }]]}
              onPress={() => setActiveTab('registrar')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'registrar' ? theme.colors.primary : theme.colors.textSecondary }]}>Registrar Nova</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'minhas' && [styles.tabButtonActive, { backgroundColor: theme.colors.primary + '22' }]]}
              onPress={() => setActiveTab('minhas')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'minhas' ? theme.colors.primary : theme.colors.textSecondary }]}>Minhas Ocorrências</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'registrar' ? (
          <ScrollView 
            style={[styles.tabContent, { flex: 1 }]} 
            contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} 
            keyboardShouldPersistTaps="handled"
          >
            {renderRegisterContent()}
          </ScrollView>
        ) : (
          <View style={[styles.tabContent, { flex: 1 }]}>
            {renderMyIssues()}
          </View>
        )}
      </View>

      {/* ActionSheet nativo via react-native-actions-sheet */}
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
    </SafeAreaView>
  );
}
