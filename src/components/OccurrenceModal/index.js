import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput, Image, StyleSheet, Share, Clipboard } from 'react-native';
import { X, MapPin, Calendar, AlertTriangle, Paperclip, Share2, Copy, MessageCircle, Send } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeProvider';

const OccurrenceModal = ({ visible, occurrence, onClose, onSendMessage }) => {
  const { theme } = useTheme();
  const commentsScrollRef = useRef(null);
  const [messageText, setMessageText] = React.useState('');

  useEffect(() => {
    if (visible && commentsScrollRef.current) {
      setTimeout(() => {
        commentsScrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [visible, occurrence?.comments]);

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
  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage) {
      onSendMessage(occurrence.id, messageText.trim());
      setMessageText('');
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
                Conversa ({occurrence.comments?.length || 0})
              </Text>
            </View>

            <ScrollView
              ref={commentsScrollRef}
              style={styles.chatScroll}
              onContentSizeChange={() => commentsScrollRef.current?.scrollToEnd({ animated: true })}
            >
              {occurrence.comments?.map((comment, index) => (
                <Animatable.View
                  key={index}
                  animation="fadeInUp"
                  delay={index * 50}
                  duration={300}
                  style={[
                    styles.commentBubble,
                    comment.author === 'Morador'
                      ? styles.moradorBubble
                      : [styles.sindicoBubble, { backgroundColor: theme.colors.card }],
                  ]}
                >
                  <Text style={[styles.commentAuthor, { color: comment.author === 'Morador' ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }]}>
                    {comment.author}
                  </Text>
                  <Text style={[styles.commentText, { color: comment.author === 'Morador' ? '#ffffff' : theme.colors.text }]}>
                    {comment.text}
                  </Text>
                  <Text style={[styles.commentDate, { color: comment.author === 'Morador' ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary }]}>
                    {comment.date}
                  </Text>
                </Animatable.View>
              ))}
            </ScrollView>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  protocolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  protocol: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  statusTextLarge: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  attachmentsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  attachmentsScroll: {
    flexDirection: 'row',
  },
  attachmentImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
  },
  chatSection: {
    paddingHorizontal: 20,
    flex: 1,
    marginBottom: 8,
  },
  chatScroll: {
    maxHeight: 300,
  },
  commentBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  moradorBubble: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
  },
  sindicoBubble: {
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
  },
  commentAuthor: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 10,
    fontWeight: '500',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default React.memo(OccurrenceModal);
