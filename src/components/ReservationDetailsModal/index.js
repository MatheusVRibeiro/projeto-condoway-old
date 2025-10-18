import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Share } from 'react-native';
import { X, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Share2, Copy } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeProvider';

const ReservationDetailsModal = ({ visible, reservation, onClose, onCancel }) => {
  const { theme } = useTheme();

  if (!reservation) return null;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel(reservation.id);
    onClose();
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const message = `🏢 Reserva - ${reservation.environmentName}\n📅 Data: ${formatDate(reservation.date)}\n⏰ Horário: ${reservation.time}\n📋 Status: ${getStatusLabel(reservation.status)}\n🆔 ID: #${reservation.id}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleCopyId = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Toast.show({
      type: 'success',
      text1: 'ID copiado!',
      text2: `#${reservation.id}`,
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pendente':
        return {
          color: '#f59e0b',
          lightColor: '#fed7aa',
          icon: Clock,
          label: 'Pendente',
          description: 'Aguardando confirmação do síndico',
        };
      case 'confirmada':
        return {
          color: '#10b981',
          lightColor: '#d1fae5',
          icon: CheckCircle,
          label: 'Confirmada',
          description: 'Sua reserva foi confirmada!',
        };
      case 'cancelada':
        return {
          color: '#ef4444',
          lightColor: '#fee2e2',
          icon: XCircle,
          label: 'Cancelada',
          description: 'Esta reserva foi cancelada',
        };
      default:
        return {
          color: '#6b7280',
          lightColor: '#f3f4f6',
          icon: AlertCircle,
          label: status || 'Pendente',
          description: 'Status desconhecido',
        };
    }
  };

  const getStatusLabel = (status) => {
    return getStatusConfig(status).label;
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString + 'T00:00:00');
      return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const statusConfig = getStatusConfig(reservation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animatable.View 
          animation="slideInUp" 
          duration={400}
          style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Detalhes da Reserva
              </Text>
              <TouchableOpacity 
                style={styles.idBadge}
                onPress={handleCopyId}
                activeOpacity={0.7}
              >
                <Text style={[styles.idText, { color: theme.colors.textSecondary }]}>
                  ID: #{reservation.id}
                </Text>
                <Copy size={12} color={theme.colors.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <X size={20} color={theme.colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Card */}
            <Animatable.View 
              animation="fadeIn" 
              delay={100}
              style={[styles.statusCard, { backgroundColor: statusConfig.lightColor, borderColor: statusConfig.color }]}
            >
              <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.color }]}>
                <StatusIcon size={24} color="#ffffff" strokeWidth={2.5} />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
                <Text style={[styles.statusDescription, { color: statusConfig.color }]}>
                  {statusConfig.description}
                </Text>
              </View>
            </Animatable.View>

            {/* Informações da Reserva */}
            <Animatable.View animation="fadeIn" delay={200} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Informações da Reserva
              </Text>
              
              <View style={[styles.infoCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '22' }]}>
                    <MapPin size={18} color={theme.colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      Ambiente
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {reservation.environmentName}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.infoRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '22' }]}>
                    <Calendar size={18} color={theme.colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      Data
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {formatDate(reservation.date)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.infoRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '22' }]}>
                    <Clock size={18} color={theme.colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      Horário
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {reservation.time}
                    </Text>
                  </View>
                </View>
              </View>
            </Animatable.View>

            {/* QR Code Simulado */}
            {reservation.status === 'confirmada' && (
              <Animatable.View animation="fadeIn" delay={300} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Código de Acesso
                </Text>
                <View style={[styles.qrCodeCard, { backgroundColor: '#ffffff', borderColor: theme.colors.border }]}>
                  <View style={styles.qrCodePlaceholder}>
                    <Text style={[styles.qrCodeText, { color: theme.colors.textSecondary }]}>
                      QR Code
                    </Text>
                    <Text style={[styles.qrCodeSubtext, { color: theme.colors.textSecondary }]}>
                      #{reservation.id}
                    </Text>
                  </View>
                  <Text style={[styles.qrCodeInfo, { color: theme.colors.textSecondary }]}>
                    Apresente este código na portaria no dia da reserva
                  </Text>
                </View>
              </Animatable.View>
            )}

            {/* Instruções */}
            <Animatable.View animation="fadeIn" delay={400} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Instruções
              </Text>
              <View style={[styles.instructionsCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                <View style={styles.instructionRow}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>1</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: '#1e3a8a' }]}>
                    Chegue 10 minutos antes do horário reservado
                  </Text>
                </View>
                <View style={styles.instructionRow}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>2</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: '#1e3a8a' }]}>
                    Apresente o código de acesso na portaria
                  </Text>
                </View>
                <View style={styles.instructionRow}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>3</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: '#1e3a8a' }]}>
                    Siga as regras de uso do ambiente
                  </Text>
                </View>
              </View>
            </Animatable.View>
          </ScrollView>

          {/* Footer com ações */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={500}
            style={[styles.footer, { borderTopColor: theme.colors.border }]}
          >
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share2 size={18} color={theme.colors.text} strokeWidth={2.5} />
                <Text style={[styles.shareButtonText, { color: theme.colors.text }]}>
                  Compartilhar
                </Text>
              </TouchableOpacity>

              {reservation.status !== 'cancelada' && (
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '40' }]}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <XCircle size={18} color={theme.colors.error} strokeWidth={2.5} />
                  <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animatable.View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  idText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  qrCodeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    alignItems: 'center',
  },
  qrCodePlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  qrCodeSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
  },
  qrCodeInfo: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  instructionsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 16,
    gap: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ReservationDetailsModal;
