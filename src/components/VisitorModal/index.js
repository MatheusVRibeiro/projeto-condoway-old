import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import {
  X,
  FileText,
  Phone,
  Calendar,
  QrCode,
  UserCheck,
  Clock,
  CheckCircle2,
  Copy
} from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeProvider';
import createStyles from './styles';
import { apiService } from '../../services/api';

const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  try {
    const date = new Date(dateString);
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

const getStatusConfig = (status) => {
  const configs = {
    Aguardando: { color: '#E76E0D', label: 'Aguardando Entrada', icon: Clock },
    Entrou: { color: '#0EA25C', label: 'No Condomínio', icon: UserCheck },
    Finalizado: { color: '#95A5A6', label: 'Visita Concluída', icon: CheckCircle2 },
    Cancelado: { color: '#E74C3C', label: 'Autorização Cancelada', icon: X },
  };

  return configs[status] || configs.Aguardando;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatCPF = (cpf) => {
  if (!cpf) return null;
  const cleaned = cpf.toString().replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (cleaned.length === 0) return null;
  return cpf;
};

const formatPhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 0) return null;
  return phone;
};

const VisitorModal = ({ visible, visitor, onClose, onRefresh }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [copiedField, setCopiedField] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [currentVisitor, setCurrentVisitor] = useState(visitor || {});
  const [resendUnavailable, setResendUnavailable] = useState(false);
  const safeVisitor = currentVisitor || visitor || {};

  React.useEffect(() => {
    setCurrentVisitor(visitor || {});
    // Reset resend availability whenever a new visitor is set
    setResendUnavailable(false);
  }, [visitor]);

  if (!visible) return null;

  const statusConfig = getStatusConfig(safeVisitor.status);
  const StatusIcon = statusConfig.icon;

  const visitorName = safeVisitor.visitor_name || safeVisitor.nome || 'Visitante';
  const visitorCpf = safeVisitor.cpf || safeVisitor.documento;
  const visitorPhone = safeVisitor.phone || safeVisitor.celular;
  const visitorVisitDate = safeVisitor.visit_date || safeVisitor.validade_inicio;
  const visitorVisitTime = safeVisitor.visit_time;
  const visitorQrCode = safeVisitor.qr_code || safeVisitor.qrcode_hash;

  // Permite reenviar apenas quando o visitante não está presente/encerrado/cancelado
  // e quando o usuário atual tem permissão: sindico/funcionario podem reenviar qualquer um;
  // moradores podem reenviar apenas seus próprios visitantes (tentativa por nome/userap_id).
  const canResend = safeVisitor.status !== 'Entrou' && safeVisitor.status !== 'Finalizado' && safeVisitor.status !== 'Cancelado';

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

  const handleResendQrCode = async () => {
    if (isResending) return;
    const visitorId = safeVisitor.vst_id || safeVisitor.id || safeVisitor.vstId;
    if (!visitorId) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'ID do visitante não disponível.' });
      return;
    }

    setIsResending(true);
    try {
      await apiService.reenviarConviteVisitante(visitorId);
      // Try to fetch updated visitor details so the modal shows the new QR if backend returned it
      try {
        const updated = await apiService.buscarVisitante(visitorId);
        // The API returns response data; normalize if needed
        const newData = updated?.dados || updated?.data || updated || null;
        if (newData) {
          // If response format includes nested dados, attempt to normalize id and qr
          const normalized = newData.dados ? newData.dados : newData;
          setCurrentVisitor(prev => ({ ...prev, ...normalized }));
        }
      } catch (err) {
        // ignore fetch failure - refresh will still sync
        console.warn('⚠️ [VisitorModal] Não foi possível buscar detalhes atualizados do visitante:', err?.message || err);
      }
  if (typeof onRefresh === 'function') onRefresh();
      Toast.show({ type: 'success', text1: 'Convite Reenviado', text2: `O convite foi reenviado para ${visitorName}.` });
      // Optional: refresh parent list
      // if (typeof onRefresh === 'function') onRefresh();
    } catch (error) {
      console.error('Erro ao reenviar QR:', error);
      const statusCode = error?.statusCode || error?.status || null;
      // 404 => not found, backend probably doesn't expose this endpoint or no resource
      if (statusCode === 404) {
        // Marcar como indisponível para evitar tentativas repetidas
        setResendUnavailable(true);
        Toast.show({ type: 'error', text1: 'Falha no Reenvio', text2: 'Recurso não encontrado. O convite não pode ser reenviado.' });
      } else {
        Toast.show({ type: 'error', text1: 'Falha no Reenvio', text2: 'Não foi possível reenviar o QR Code. Tente novamente mais tarde.' });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={theme.dark ? 40 : 20} style={styles.blurView}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        </BlurView>

        <Animatable.View
          animation="slideInUp"
          duration={400}
          easing="ease-out-expo"
          style={styles.modalContainer}
        >
          <View style={styles.dragHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.headerAvatarWrapper}>
              <View style={[styles.headerAvatar, { backgroundColor: `${statusConfig.color}15` }]}>
                <Text style={[styles.headerAvatarText, { color: statusConfig.color }]}>
                  {getInitials(visitorName)}
                </Text>
              </View>
              <View style={styles.headerTitles}>
                <Text style={styles.headerName} numberOfLines={1}>{visitorName}</Text>
                <View style={[styles.headerBadge, { backgroundColor: `${statusConfig.color}15` }]}>
                  <StatusIcon size={14} color={statusConfig.color} strokeWidth={2.5} />
                  <Text style={[styles.headerBadgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
              <X size={18} color={theme.colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>

              {visitorCpf && formatCPF(visitorCpf) && (
                <View style={styles.sectionRow}>
                  <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.primary}12` }]}> 
                    <FileText size={16} color={theme.colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.sectionTexts}>
                    <Text style={styles.sectionLabel}>DOCUMENTO (CPF)</Text>
                    <Text style={styles.sectionValue}>{formatCPF(visitorCpf)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCopy(visitorCpf, 'CPF')} style={styles.copyButton}>
                    <Copy size={16} color={copiedField === 'CPF' ? theme.colors.primary : theme.colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              )}

              {visitorPhone && formatPhone(visitorPhone) && (
                <View style={styles.sectionRow}>
                  <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.secondary}12` }]}> 
                    <Phone size={16} color={theme.colors.secondary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.sectionTexts}>
                    <Text style={styles.sectionLabel}>Telefone</Text>
                    <Text style={styles.sectionValue}>{formatPhone(visitorPhone)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCopy(visitorPhone, 'Telefone')} style={styles.copyButton}>
                    <Copy size={16} color={copiedField === 'Telefone' ? theme.colors.primary : theme.colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Detalhes da Visita</Text>
              <View style={styles.sectionRow}>
                <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.primary}12` }]}>
                  <Calendar size={16} color={theme.colors.primary} strokeWidth={2.5} />
                </View>
                <View style={styles.sectionTexts}>
                  <Text style={styles.sectionLabel}>Data e horário agendado</Text>
                  <Text style={styles.sectionValue}>
                    {formatDate(visitorVisitDate)}
                    {visitorVisitTime && ` às ${visitorVisitTime}`}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>QR Code</Text>
              {canResend && (
                <TouchableOpacity
                  style={[styles.resendButton, (isResending || resendUnavailable) && { opacity: 0.7 }]}
                  onPress={handleResendQrCode}
                  disabled={isResending || resendUnavailable}
                >
                  {isResending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <QrCode size={18} color="#fff" />
                      <Text style={styles.resendButtonText}>Reenviar QR Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              {resendUnavailable && (
                <Text style={[styles.sectionValue, { marginTop: 8, color: theme.colors.textSecondary }]}>Não é possível reenviar para este visitante.</Text>
              )}
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
    </Modal>
  );
};

export default VisitorModal;
