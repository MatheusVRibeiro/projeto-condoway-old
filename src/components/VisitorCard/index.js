import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, UserCheck, X, CheckCircle2, ArrowRight, QrCode, AlertCircle, Check } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeProvider';
import createStyles from './styles';

// Sistema de Status Dinâmico
// Suporta múltiplos sub-status para cada categoria principal
const getStatusConfig = (status, subStatus) => {
  // Sub-status específicos têm prioridade
  const specificConfigs = {
    'Aguardando Aprovação': {
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      label: 'Aguardando Aprovação',
      icon: AlertCircle,
    },
    'Aguardando Entrada': {
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      label: 'Aguardando Entrada',
      icon: Clock,
    },
    'No Condomínio': {
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
      label: 'No Condomínio',
      icon: UserCheck,
    },
  };

  // Configurações principais por status
  const mainConfigs = {
    'Aguardando': { 
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      label: subStatus || 'Aguardando', 
      icon: Clock,
    },
    'Entrou': { 
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
      label: 'No Condomínio', 
      icon: UserCheck,
    },
    'Finalizado': { 
      color: '#95A5A6',
      gradient: ['#95A5A6', '#7F8C8D'],
      label: 'Concluído', 
      icon: CheckCircle2,
    },
    'Cancelado': { 
      color: '#E74C3C',
      gradient: ['#E74C3C', '#C0392B'],
      label: 'Cancelado', 
      icon: X,
    },
  };

  // Prioridade: sub-status específico > sub-status genérico > status principal
  if (subStatus && specificConfigs[subStatus]) {
    return specificConfigs[subStatus];
  }
  
  return mainConfigs[status] || mainConfigs['Aguardando'];
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

// Formatar telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
const formatPhone = (phone) => {
  if (!phone) return null;
  
  // Remove tudo que não é número
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Celular: (XX) XXXXX-XXXX (11 dígitos)
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  
  // Fixo: (XX) XXXX-XXXX (10 dígitos)
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  
  // Retorna original se não bater formato esperado
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

const VisitorCard = ({ item, index, onPress, onApprove, onReject }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  if (!item) return null;
  
  // Suporta sub-status da API (ex: vst_sub_status ou campo específico)
  const subStatus = item.sub_status || item.vst_sub_status;
  const statusConfig = getStatusConfig(item.status, subStatus);
  const StatusIcon = statusConfig.icon;
  
  // Identifica se é uma "Visita Surpresa" que precisa de aprovação
  // A API deve enviar: vst_tipo === 'surpresa' ou vst_precisa_aprovacao === true
  const isAwaitingApproval = item.tipo === 'surpresa' || item.vst_tipo === 'surpresa' || 
                                 item.precisa_aprovacao || item.vst_precisa_aprovacao ||
                                 subStatus === 'Aguardando Aprovação';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(item);
  };

  const handleApprove = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onApprove) onApprove(item);
  };

  const handleReject = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onReject) onReject(item);
  };

  return (
    <Animatable.View 
      animation="fadeInUp" 
      delay={index * 80}
      duration={700}
      style={styles.container}
    >
      <TouchableOpacity 
        style={[
          styles.cardWrapper,
          isAwaitingApproval && styles.cardWrapperHighlight
        ]}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <LinearGradient
          colors={[theme.colors.card, theme.colors.card]}
          style={[
            styles.cardGradient,
            isAwaitingApproval && styles.cardGradientHighlight
          ]}
        >
          {/* Borda destacada para visitas surpresa */}
          {isAwaitingApproval && (
            <View style={styles.highlightBorder} />
          )}

          {/* Left Section: Avatar + Info */}
          <View style={styles.leftSection}>
            {/* Avatar with Gradient */}
            <LinearGradient
              colors={statusConfig.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {getInitials(item.visitor_name)}
              </Text>
            </LinearGradient>
            
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
                  <Calendar size={11} color={theme.colors.textSecondary} strokeWidth={2.5} />
                  <Text style={styles.metaText}>
                    {formatDate(item.visit_date)}
                  </Text>
                </View>
                
                {item.visit_time && item.visit_time !== 'N/A' && (
                  <>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaItem}>
                      <Clock size={11} color={theme.colors.textSecondary} strokeWidth={2.5} />
                      <Text style={styles.metaText}>
                        {item.visit_time}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Right Section: Quick Actions (surpresa) ou Status + Arrow (normal) */}
          <View style={styles.rightSection}>
            {isAwaitingApproval ? (
              // CARD TIPO 2: Visita Surpresa - Botões de Ação
              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleReject}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={handleApprove}
                  activeOpacity={0.7}
                >
                  <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ) : (
              // CARD TIPO 1: Visita Pré-agendada - Apenas Status
              <>
                <LinearGradient
                  colors={[...statusConfig.gradient].reverse()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusBadge}
                >
                  <StatusIcon size={13} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
                
                <View style={styles.arrowContainer}>
                  <ArrowRight size={18} color={theme.colors.textSecondary} strokeWidth={2.5} />
                </View>
              </>
            )}
          </View>

          {/* Decorative Elements */}
          <View style={[styles.decorLine, { backgroundColor: statusConfig.color }]} />
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default VisitorCard;
