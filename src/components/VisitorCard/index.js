import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, UserCheck, X, CheckCircle2, AlertCircle, Check, MoreHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../contexts/ThemeProvider';
import createStyles from './styles';

// Sistema de Status Dinâmico
// Suporta múltiplos sub-status para cada categoria principal
const getStatusConfig = (status, subStatus) => {
  const specificConfigs = {
    'Aguardando Aprovação': { color: '#F59E0B', label: 'Aguardando Aprovação', icon: AlertCircle },
    'Aguardando Entrada': { color: '#F59E0B', label: 'Aguardando Entrada', icon: Clock },
    'No Condomínio': { color: '#0EA25C', label: 'No Condomínio', icon: UserCheck },
  };

  const mainConfigs = {
    Aguardando: { color: '#F59E0B', label: subStatus || 'Aguardando', icon: Clock },
    Entrou: { color: '#0EA25C', label: 'No Condomínio', icon: UserCheck },
    Finalizado: { color: '#95A5A6', label: 'Concluído', icon: CheckCircle2 },
    Cancelado: { color: '#E74C3C', label: 'Cancelado', icon: X },
  };

  if (subStatus && specificConfigs[subStatus]) {
    return specificConfigs[subStatus];
  }

  return mainConfigs[status] || mainConfigs.Aguardando;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Data inválida';

  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Hoje';
    if (date.getTime() === tomorrow.getTime()) return 'Amanhã';

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return dateString;
  }
};

const formatPhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.toString().replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }

  return phone;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const VisitorCard = ({ item, onPress, onApprove, onReject }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!item) return null;

  const subStatus = item.sub_status || item.vst_sub_status;
  const statusConfig = getStatusConfig(item.status, subStatus);
  const StatusIcon = statusConfig.icon;

  const isAwaitingApproval =
    item.tipo === 'surpresa' ||
    item.vst_tipo === 'surpresa' ||
    item.precisa_aprovacao ||
    item.vst_precisa_aprovacao ||
    subStatus === 'Aguardando Aprovação';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(item);
  };

  const handleApprove = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApprove?.(item);
  };

  const handleReject = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReject?.(item);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cardWrapper} activeOpacity={0.9} onPress={handlePress}>
        <View style={styles.leftSection}>
          <View style={[styles.avatarGradient, { backgroundColor: `${statusConfig.color}15` }] }>
            <Text style={[styles.avatarText, { color: statusConfig.color }]}>{getInitials(item.visitor_name)}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.visitorName} numberOfLines={1}>
              {item.visitor_name}
            </Text>

            {item.phone && (
              <Text style={styles.visitorPhone} numberOfLines={1}>
                Telefone: {formatPhone(item.phone)}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={12} color={theme.colors.textSecondary} strokeWidth={2.5} />
                <Text style={styles.metaText}>{formatDate(item.visit_date)}</Text>
              </View>

              {item.visit_time && (
                <View style={styles.metaItem}>
                  <Clock size={12} color={theme.colors.textSecondary} strokeWidth={2.5} />
                  <Text style={styles.metaText}>{item.visit_time}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.statusPill, { backgroundColor: `${statusConfig.color}15` }]}> 
            <StatusIcon size={12} color={statusConfig.color} strokeWidth={2.5} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>

          {isAwaitingApproval ? (
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject} activeOpacity={0.75}>
                <X size={16} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveButton} onPress={handleApprove} activeOpacity={0.75}>
                <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.moreButton}>
              <MoreHorizontal size={18} color={theme.colors.textSecondary} strokeWidth={2.5} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default VisitorCard;
