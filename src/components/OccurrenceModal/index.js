import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput, Image, Share, Clipboard, ActivityIndicator } from 'react-native';
import { X, MapPin, Calendar, AlertTriangle, Paperclip, Share2, Copy, MessageCircle, Send } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeProvider';
import { apiService } from '../../services/api';
import styles from './styles';

const OccurrenceModal = ({ visible, occurrence, onClose, onSendMessage }) => {
  const { theme } = useTheme();
  const commentsScrollRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Carregar comentários quando a modal for aberta
  useEffect(() => {
    const loadComments = async () => {
      if (visible && occurrence?.id) {
        setLoadingComments(true);
        try {
          console.log('🔄 Carregando comentários da ocorrência:', occurrence.id);
          const comentarios = await apiService.buscarComentarios(occurrence.id);
          setComments(comentarios || []);
          console.log('✅ Comentários carregados:', comentarios);
          
          // TODO: Marcar mensagens como lidas quando o endpoint estiver disponível
          // await apiService.marcarTodasMensagensLidas(occurrence.id);
        } catch (error) {
          console.error('❌ Erro ao carregar comentários:', error);
        } finally {
          setLoadingComments(false);
        }
      }
    };

    loadComments();
  }, [visible, occurrence?.id]);

  // Auto-scroll quando comentários mudarem
  useEffect(() => {
    if (visible && commentsScrollRef.current && comments.length > 0) {
      setTimeout(() => {
        commentsScrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [visible, comments]);

  if (!occurrence) return null;

  // Configuração de status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Aberta':
      case 'Pendente':
        return { color: '#ef4444', lightColor: '#fee2e2', label: 'Aberta' };
      case 'Em Análise':
      case 'Em Andamento':
        return { color: '#f59e0b', lightColor: '#fed7aa', label: 'Em Análise' };
      case 'Resolvida':
      case 'Concluída':
        return { color: '#10b981', lightColor: '#d1fae5', label: 'Resolvida' };
      default:
        return { color: '#6b7280', lightColor: '#f3f4f6', label: status || 'Pendente' };
    }
  };

  const statusConfig = getStatusConfig(occurrence.status);

  // Formatar data completa
  const formatFullDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Copiar protocolo
  const handleCopyProtocol = () => {
    Clipboard.setString(occurrence.protocol);
    Toast.show({
      type: 'success',
      text1: 'Protocolo copiado!',
      text2: `${occurrence.protocol} copiado para a área de transferência`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  // Compartilhar ocorrência
  const handleShare = async () => {
    try {
      await Share.share({
        message: `📋 Ocorrência - Protocolo: ${occurrence.protocol}\n\n` +
                 `Categoria: ${occurrence.category}\n` +
                 `Local: ${occurrence.location}\n` +
                 `Status: ${statusConfig.label}\n` +
                 `Data: ${formatFullDate(occurrence.date)}\n\n` +
                 `Descrição: ${occurrence.description}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (messageText.trim() && onSendMessage) {
      try {
        const novoComentario = await onSendMessage(occurrence.id, messageText.trim());
        
        // Adicionar comentário à lista local
        if (novoComentario) {
          setComments(prev => [...prev, novoComentario]);
        }
        
        setMessageText('');
        
        // Auto-scroll para o final
        setTimeout(() => {
          commentsScrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
      } catch (error) {
        console.error('Erro ao enviar comentário:', error);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="slideInUp"
          duration={400}
          style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: statusConfig.lightColor }]}>
                <MessageCircle size={24} color={statusConfig.color} strokeWidth={2.5} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {occurrence.title || occurrence.category}
                </Text>
                <TouchableOpacity onPress={handleCopyProtocol} style={styles.protocolContainer}>
                  <Text style={[styles.protocol, { color: theme.colors.textSecondary }]}>
                    {occurrence.protocol}
                  </Text>
                  <Copy size={14} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Status Badge Grande */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadgeLarge, { backgroundColor: statusConfig.lightColor }]}>
              <AlertTriangle size={20} color={statusConfig.color} strokeWidth={2.5} />
              <Text style={[styles.statusTextLarge, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Informações Principais */}
          <View style={[styles.infoSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#eff6ff' }]}>
                <MapPin size={18} color="#3b82f6" strokeWidth={2.5} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Local</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{occurrence.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#fef3c7' }]}>
                <Calendar size={18} color="#f59e0b" strokeWidth={2.5} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Data de Registro</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {formatFullDate(occurrence.date)}
                </Text>
              </View>
            </View>

            {occurrence.priority && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: '#fee2e2' }]}>
                  <AlertTriangle size={18} color="#ef4444" strokeWidth={2.5} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Prioridade</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {occurrence.priority.charAt(0).toUpperCase() + occurrence.priority.slice(1)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Anexos */}
          {occurrence.attachments && occurrence.attachments.length > 0 && (
            <View style={styles.attachmentsSection}>
              <View style={styles.sectionHeader}>
                <Paperclip size={18} color={theme.colors.textSecondary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Anexos ({occurrence.attachments.length})
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsScroll}>
                {occurrence.attachments.map((att, idx) => (
                  <Image key={idx} source={{ uri: att }} style={styles.attachmentImage} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chat de Comentários */}
          <View style={styles.chatSection}>
            <View style={styles.sectionHeader}>
              <MessageCircle size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Conversa ({comments.length})
              </Text>
            </View>

            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Carregando comentários...
                </Text>
              </View>
            ) : (
              <ScrollView
                ref={commentsScrollRef}
                style={styles.chatScroll}
                onContentSizeChange={() => commentsScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {comments.length === 0 ? (
                  <View style={styles.emptyComments}>
                    <MessageCircle size={32} color={theme.colors.textSecondary} opacity={0.3} />
                    <Text style={[styles.emptyCommentsText, { color: theme.colors.textSecondary }]}>
                      Nenhum comentário ainda
                    </Text>
                  </View>
                ) : (
                  comments.map((comment, index) => (
                    <Animatable.View
                      key={comment.id || index}
                      animation="fadeInUp"
                      delay={index * 50}
                      duration={300}
                      style={[
                        styles.commentBubble,
                        comment.isOwn
                          ? styles.moradorBubble
                          : [styles.sindicoBubble, { backgroundColor: theme.colors.card }],
                      ]}
                    >
                      <Text style={[
                        styles.commentAuthor, 
                        { color: comment.isOwn ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }
                      ]}>
                        {comment.user}
                      </Text>
                      <Text style={[
                        styles.commentText, 
                        { color: comment.isOwn ? '#ffffff' : theme.colors.text }
                      ]}>
                        {comment.text}
                      </Text>
                      <Text style={[
                        styles.commentTime, 
                        { color: comment.isOwn ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary }
                      ]}>
                        {comment.timestamp ? format(parseISO(comment.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ''}
                      </Text>
                    </Animatable.View>
                  ))
                )}
              </ScrollView>
            )}
          </View>

          {/* Input de Mensagem */}
          <View style={[styles.messageInputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
            <TextInput
              style={[styles.messageInput, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={theme.colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: theme.colors.primary, opacity: messageText.trim() ? 1 : 0.5 }]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Footer com Ações */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={handleShare}>
              <Share2 size={18} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Compartilhar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={onClose}>
              <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
};

export default React.memo(OccurrenceModal);
