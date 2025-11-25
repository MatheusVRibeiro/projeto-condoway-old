import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { X, MapPin, Calendar, AlertTriangle, Paperclip, Share2, Copy, MessageCircle, FileText } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

const OccurrenceModal = ({ visible, occurrence, onClose }) => {
  const { theme } = useTheme();

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
  const handleCopyProtocol = async () => {
    try {
      await Clipboard.setStringAsync(occurrence.protocol);
      Toast.show({
        type: 'success',
        text1: 'Protocolo copiado!',
        text2: `${occurrence.protocol} copiado para a área de transferência`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (e) {
      console.warn('Erro ao copiar protocolo:', e);
    }
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

          {/* Detalhes da Ocorrência */}
          <View style={[styles.detailsSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Detalhes da Ocorrência</Text>
            </View>

            <Text style={[styles.descriptionLabel, { color: theme.colors.textSecondary }]}>Descrição</Text>
            <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
              {occurrence.description || 'Sem descrição'}
            </Text>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#eff6ff' }]}>
                <MapPin size={18} color="#3b82f6" strokeWidth={2.5} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Local</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{occurrence.location || 'Não informado'}</Text>
              </View>
            </View>
            <Text style={[styles.descriptionLabel, { color: theme.colors.textSecondary }]}>Descrição</Text>
            <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
              {occurrence.description || 'Sem descrição'}
            </Text>

            <View style={styles.detailGrid}>
              <View style={styles.detailCard}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Local</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{occurrence.location || 'Não informado'}</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Data</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatFullDate(occurrence.date)}</Text>
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
              )}
            </View>
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
