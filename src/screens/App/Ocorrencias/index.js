import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, Alert, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { categories, initialIssues } from './mock';
import { MessageSquareWarning, ArrowLeft, CheckCircle, Paperclip, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/BackButton';
import { useTheme } from '../../../contexts/ThemeProvider';
import ActionSheet from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Ocorrencias() {
  const { theme } = useTheme();
  const actionSheetRef = useRef(null);
  const commentsScrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const openImageOptions = () => actionSheetRef.current?.setModalVisible(true);
  const closeImageOptions = () => actionSheetRef.current?.setModalVisible(false);
  const [activeTab, setActiveTab] = useState('registrar');
  const [myIssues, setMyIssues] = useState(initialIssues);
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

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setStep(2);
  };

  const resetForm = () => {
    setStep(1);
    setCategory(null);
    setDescription('');
    setLocation('');
    setPriority('media');
    setAttachments([]);
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

  // Simulate upload function (replace with real upload to backend)
  const uploadFile = (attachmentObj) => new Promise((resolve, reject) => {
    const { id } = attachmentObj;
    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [id]: 0 }));
    let progress = 0;
    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) progress = 100;
      setUploadProgress(prev => ({ ...prev, [id]: progress }));
      if (progress >= 100) {
        clearInterval(timer);
        // emulate server returning url
        setUploading(false);
        resolve({ success: true, url: attachmentObj.uri });
      }
    }, 400);
    // timeout safety
    setTimeout(() => { if (progress < 100) { clearInterval(timer); reject(new Error('Upload timeout')); } }, 30000);
  });

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

  // persist issues locally while backend is not available
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const raw = await AsyncStorage.getItem('@condoway_issues_v1');
        if (raw) setMyIssues(JSON.parse(raw));
      } catch (e) { console.warn('load issues fail', e); }
    };
    loadIssues();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem('@condoway_issues_v1', JSON.stringify(myIssues));
      } catch (e) { console.warn('save issues fail', e); }
    };
    save();
  }, [myIssues]);

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
    // upload attachments sequentially (could be parallel)
    const uploadedAttachments = [];
    for (const a of attachments) {
      try {
        const res = await uploadFile(a);
        uploadedAttachments.push(res.url || a.uri);
      } catch (e) {
        // mark failed and provide retry option
        Toast.show({ type: 'error', text1: 'Falha no upload de algum anexo. Tente novamente.' });
        return;
      }
    }

    const newIssue = {
      id: Date.now(),
      protocol: `OCO-${Date.now().toString().slice(-6)}`,
      category: category?.title || 'Geral',
      title: category?.title || 'Ocorrência',
      description,
      location,
      date: new Date().toLocaleString('pt-BR'),
      status: 'Enviada',
      priority,
      attachments: uploadedAttachments,
      comments: [{ author: 'Morador', text: description, date: new Date().toLocaleString('pt-BR') }]
    };
    setMyIssues(prev => [newIssue, ...prev]);
    setStep(3);
    // clear draft
    try { await AsyncStorage.removeItem(DRAFT_KEY); } catch(e){}
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
          <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>O síndico foi notificado. Você pode acompanhar o andamento na aba "Minhas Ocorrências".</Text>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.colors.primary }]} onPress={() => { resetForm(); setActiveTab('minhas'); }}>
            <Text style={styles.submitButtonText}>Ver Minhas Ocorrências</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderMyIssues = () => (
    <FlatList
      data={myIssues}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      renderItem={({ item }) => {
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
                      onPress={async () => {
                        const text = (messageDrafts[issue.id] || '').trim();
                        if (!text) return Toast.show({ type: 'error', text1: 'Digite uma mensagem' });
                        // append morador comment
                        setMyIssues(prev => prev.map(it => it.id === issue.id ? { ...it, comments: [...it.comments, { author: 'Morador', text, date: new Date().toLocaleString('pt-BR') }] } : it));
                        setMessageDrafts(prev => ({ ...prev, [issue.id]: '' }));
                        Toast.show({ type: 'success', text1: 'Mensagem enviada' });
                        // autoscroll to bottom
                        setTimeout(() => commentsScrollRef.current?.scrollToEnd({ animated: true }), 150);
                        // simulate syndic reply after delay
                        setTimeout(() => {
                          const reply = 'Recebemos sua ocorrência. O zelador irá verificar amanhã pela manhã.';
                          setMyIssues(prev => prev.map(it => it.id === issue.id ? { ...it, comments: [...it.comments, { author: 'Síndico', text: reply, date: new Date().toLocaleString('pt-BR') }] } : it));
                          // autoscroll after reply
                          setTimeout(() => commentsScrollRef.current?.scrollToEnd({ animated: true }), 200);
                        }, 4000);
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
        <BackButton style={{ alignSelf: 'flex-start' }} />
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
