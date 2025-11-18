import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
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

const VisitorModal = ({ visible, visitor, onClose }) => {
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
                  {getInitials(visitor.visitor_name)}
                </Text>
              </View>
              <View style={styles.headerTitles}>
                <Text style={styles.headerName} numberOfLines={1}>{visitor.visitor_name}</Text>
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

              {visitor.cpf && formatCPF(visitor.cpf) && (
                <View style={styles.sectionRow}>
                  <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.primary}12` }]}>
                    <FileText size={16} color={theme.colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.sectionTexts}>
                    <Text style={styles.sectionLabel}>DOCUMENTO (CPF)</Text>
                    <Text style={styles.sectionValue}>{formatCPF(visitor.cpf)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCopy(visitor.cpf, 'CPF')} style={styles.copyButton}>
                    <Copy size={16} color={copiedField === 'CPF' ? theme.colors.primary : theme.colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              )}

              {visitor.phone && formatPhone(visitor.phone) && (
                <View style={styles.sectionRow}>
                  <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.secondary}12` }]}>
                    <Phone size={16} color={theme.colors.secondary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.sectionTexts}>
                    <Text style={styles.sectionLabel}>Telefone</Text>
                    <Text style={styles.sectionValue}>{formatPhone(visitor.phone)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCopy(visitor.phone, 'Telefone')} style={styles.copyButton}>
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
                    {formatDate(visitor.visit_date)}
                    {visitor.visit_time && ` às ${visitor.visit_time}`}
                  </Text>
                </View>
              </View>
            </View>

            {visitor.qr_code && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>QR Code</Text>
                <View style={styles.qrRow}>
                  <QrCode size={18} color={theme.colors.primary} strokeWidth={2.5} />
                  <Text style={styles.qrText} numberOfLines={1}>{visitor.qr_code}</Text>
                  <TouchableOpacity onPress={() => handleCopy(visitor.qr_code, 'Código QR')} style={styles.copyButton}>
                    <Copy size={16} color={copiedField === 'Código QR' ? theme.colors.primary : theme.colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </Animatable.View>
      </View>
    </Modal>
  );
};

export default VisitorModal;
