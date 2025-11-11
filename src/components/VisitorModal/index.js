import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { 
  X, 
  FileText, 
  Phone, 
  Calendar, 
  Clock, 
  QrCode, 
  UserCheck,
  CheckCircle2,
  Share2,
  Copy,
  MapPin,
  Shield,
  AlertCircle,
  Trash2
} from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeProvider';
import { apiService } from '../../services/api';
import createStyles from './styles';

const { height } = Dimensions.get('window');

const getStatusConfig = (status) => {
  const configs = {
    'Aguardando': { 
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8E53'], 
      label: 'Aguardando Entrada', 
      icon: Clock 
    },
    'Entrou': { 
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'], 
      label: 'No Condomínio', 
      icon: UserCheck 
    },
    'Finalizado': { 
      color: '#95A5A6',
      gradient: ['#95A5A6', '#7F8C8D'], 
      label: 'Visita Concluída', 
      icon: CheckCircle2 
    },
    'Cancelado': { 
      color: '#E74C3C',
      gradient: ['#E74C3C', '#C0392B'], 
      label: 'Autorização Cancelada', 
      icon: AlertCircle 
    },
  };
  return configs[status] || configs['Aguardando'];
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  
  try {
    const date = new Date(dateString);
    // Verificar se a data é válida
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch {
    return 'Data inválida';
  }
};

const formatCPF = (cpf) => {
  if (!cpf) return null;
  // Remove tudo que não é número
  const cleaned = cpf.toString().replace(/\D/g, '');
  // Formata: XXX.XXX.XXX-XX
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  // Se não tem 11 dígitos, retorna null para não mostrar
  if (cleaned.length === 0) return null;
  // Se tem algum número mas formato errado, mostra o original
  return cpf;
};

const formatPhone = (phone) => {
  if (!phone) return null;
  // Remove tudo que não é número
  const cleaned = phone.toString().replace(/\D/g, '');
  // Celular: (XX) XXXXX-XXXX (11 dígitos)
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } 
  // Fixo: (XX) XXXX-XXXX (10 dígitos)
  else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  // Se não tem formato válido, retorna null para não mostrar
  if (cleaned.length === 0) return null;
  // Se tem algum número mas formato errado, mostra o original
  return phone;
};

const VisitorModal = ({ visible, visitor, onClose, onRefresh }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [copiedField, setCopiedField] = useState(null);
  
  if (!visitor) return null;
  
  const statusConfig = getStatusConfig(visitor.status);
  const StatusIcon = statusConfig.icon;

  const handleCopy = async (text, field) => {
    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setCopiedField(field);
      Toast.show({
        type: 'success',
        text1: 'Copiado!',
        text2: `${field} copiado para área de transferência`,
        position: 'bottom',
        visibilityTime: 2000,
      });
      
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const handleCancelAuthorization = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Cancelar Autorização',
      `Deseja realmente cancelar a autorização de ${visitor.visitor_name}?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Cancelar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelarVisitante(visitor.vst_id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show({
                type: 'success',
                text1: 'Autorização Cancelada',
                text2: 'A autorização foi cancelada com sucesso',
              });
              if (onRefresh) await onRefresh();
              onClose();
            } catch (error) {
              console.error('Erro ao cancelar:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: 'Erro ao Cancelar',
                text2: error.message || 'Não foi possível cancelar a autorização',
              });
            }
          }
        }
      ]
    );
  };

  const handleResendQRCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Reenviar QR Code',
      `Deseja reenviar o QR Code para ${visitor.visitor_name}?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Reenviar',
          onPress: async () => {
            try {
              await apiService.reenviarConviteVisitante(visitor.vst_id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show({
                type: 'success',
                text1: 'QR Code Reenviado',
                text2: 'O QR Code foi reenviado com sucesso',
              });
            } catch (error) {
              console.error('Erro ao reenviar:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: 'Erro ao Reenviar',
                text2: error.message || 'Não foi possível reenviar o QR Code',
              });
            }
          }
        }
      ]
    );
  };

  const handleApproveVisitor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Aprovar Visitante',
      `Deseja aprovar a visita de ${visitor.visitor_name}?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Aprovar',
          onPress: () => {
            // TODO: Implementar API de aprovação
            console.log('Aprovar visitante:', visitor.vst_id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
              type: 'success',
              text1: 'Visitante Aprovado',
              text2: 'A visita foi aprovada com sucesso',
            });
            onClose();
          }
        }
      ]
    );
  };

  const handleRejectVisitor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Recusar Visitante',
      `Deseja recusar a visita de ${visitor.visitor_name}?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Recusar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar API de recusa
            console.log('Recusar visitante:', visitor.vst_id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
              type: 'success',
              text1: 'Visitante Recusado',
              text2: 'A visita foi recusada',
            });
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={theme.dark ? 40 : 20} style={styles.blurView}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={onClose}
          />
        </BlurView>

        <Animatable.View 
          animation="slideInUp" 
          duration={500}
          easing="ease-out-expo"
          style={styles.modalContainer}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header com Avatar e Status */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <LinearGradient
                colors={statusConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarLarge}
              >
                <Text style={styles.avatarLargeText}>
                  {getInitials(visitor.visitor_name)}
                </Text>
              </LinearGradient>

              <View style={styles.headerInfo}>
                <Text style={styles.visitorNameLarge} numberOfLines={2}>
                  {visitor.visitor_name}
                </Text>
                
                <LinearGradient
                  colors={statusConfig.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusBadgeLarge}
                >
                  <StatusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.statusTextLarge}>
                    {statusConfig.label}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={26} color={theme.colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
          >
            {/* Personal Information Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Shield size={16} color={theme.colors.primary} strokeWidth={2.5} />
                <Text style={styles.cardTitle}>Informações Pessoais</Text>
              </View>
              
              {visitor.cpf && formatCPF(visitor.cpf) && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <FileText size={16} color={theme.colors.textSecondary} strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>DOCUMENTO (CPF)</Text>
                    <Text style={styles.infoValue}>{formatCPF(visitor.cpf)}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleCopy(visitor.cpf, 'CPF')}
                    style={styles.copyButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Animatable.View
                      animation={copiedField === 'CPF' ? 'pulse' : undefined}
                      duration={500}
                    >
                      {copiedField === 'CPF' ? (
                        <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} />
                      ) : (
                        <Copy size={16} color={theme.colors.textSecondary} strokeWidth={2} />
                      )}
                    </Animatable.View>
                  </TouchableOpacity>
                </View>
              )}

              {visitor.phone && formatPhone(visitor.phone) && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Phone size={16} color={theme.colors.textSecondary} strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>TELEFONE</Text>
                    <Text style={styles.infoValue}>{formatPhone(visitor.phone)}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleCopy(visitor.phone, 'Telefone')}
                    style={styles.copyButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Animatable.View
                      animation={copiedField === 'Telefone' ? 'pulse' : undefined}
                      duration={500}
                    >
                      {copiedField === 'Telefone' ? (
                        <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} />
                      ) : (
                        <Copy size={16} color={theme.colors.textSecondary} strokeWidth={2} />
                      )}
                    </Animatable.View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Visit Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Calendar size={16} color={theme.colors.primary} strokeWidth={2.5} />
                <Text style={styles.cardTitle}>Detalhes da Visita</Text>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar size={16} color={theme.colors.textSecondary} strokeWidth={2} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>DATA E HORÁRIO AGENDADO</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(visitor.visit_date)}
                    {visitor.visit_time && ` às ${visitor.visit_time}`}
                  </Text>
                </View>
              </View>

              {visitor.entry_time && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Clock size={16} color="#10B981" strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>ENTRADA</Text>
                    <Text style={[styles.infoValue, { color: '#10B981' }]}>
                      {visitor.entry_time}
                    </Text>
                  </View>
                </View>
              )}

              {visitor.exit_time && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Clock size={16} color="#EF4444" strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>SAÍDA</Text>
                    <Text style={[styles.infoValue, { color: '#EF4444' }]}>
                      {visitor.exit_time}
                    </Text>
                  </View>
                </View>
              )}

              {visitor.qr_code && (
                <View style={styles.qrCodeCard}>
                  <QrCode size={18} color={theme.colors.primary} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>QR CODE</Text>
                    <Text style={styles.qrCodeText} numberOfLines={1}>
                      {visitor.qr_code}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleCopy(visitor.qr_code, 'Código QR')}
                    style={styles.copyButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Animatable.View
                      animation={copiedField === 'Código QR' ? 'pulse' : undefined}
                      duration={500}
                    >
                      {copiedField === 'Código QR' ? (
                        <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} />
                      ) : (
                        <Copy size={16} color={theme.colors.primary} strokeWidth={2} />
                      )}
                    </Animatable.View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Notes Card */}
            {visitor.notes && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FileText size={16} color={theme.colors.primary} strokeWidth={2.5} />
                  <Text style={styles.cardTitle}>Observações</Text>
                </View>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{visitor.notes}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          {visitor.status === 'Aguardando' && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButtonOutline}
                onPress={handleResendQRCode}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['transparent', 'transparent']}
                  style={styles.actionGradient}
                >
                  <QrCode size={18} color={theme.colors.primary} strokeWidth={2.5} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                    Reenviar QR Code
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButtonDanger}
                onPress={handleCancelAuthorization}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Trash2 size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                    Cancelar Visita
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Approve/Reject Actions for Pending Visitors */}
          {visitor.status === 'Pendente' && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButtonDanger}
                onPress={handleRejectVisitor}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <X size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                    Recusar
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButtonSuccess}
                onPress={handleApproveVisitor}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                    Aprovar
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animatable.View>
      </View>
    </Modal>
  );
};

export default VisitorModal;
