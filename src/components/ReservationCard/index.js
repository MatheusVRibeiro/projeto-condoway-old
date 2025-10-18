import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeProvider';

const ReservationCard = ({ item, onCancel, onPress, index = 0 }) => {
  const { theme } = useTheme();

  // Função para obter cor e ícone baseado no status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pendente':
        return {
          color: '#f59e0b',
          lightColor: '#fed7aa',
          icon: Clock,
          label: 'Pendente',
        };
      case 'confirmada':
        return {
          color: '#10b981',
          lightColor: '#d1fae5',
          icon: CheckCircle,
          label: 'Confirmada',
        };
      case 'cancelada':
        return {
          color: '#ef4444',
          lightColor: '#fee2e2',
          icon: XCircle,
          label: 'Cancelada',
        };
      default:
        return {
          color: '#6b7280',
          lightColor: '#f3f4f6',
          icon: Clock,
          label: status || 'Pendente',
        };
    }
  };

  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;

  // Formatar data
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString + 'T00:00:00');
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel(item.id);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(item);
    }
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={500}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderLeftColor: statusConfig.color,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Header com título e status */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {item.environmentName}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              ID: #{item.id}
            </Text>
          </View>

          {/* Badge de status */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.lightColor }]}>
            <StatusIcon size={12} color={statusConfig.color} strokeWidth={2.5} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Informações principais */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={theme.colors.primary} strokeWidth={2.5} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color={theme.colors.primary} strokeWidth={2.5} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Horário: {item.time}
            </Text>
          </View>
        </View>

        {/* Botão de cancelar (apenas se não estiver cancelada) */}
        {item.status !== 'cancelada' && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '40' },
            ]}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <XCircle size={16} color={theme.colors.error} strokeWidth={2.5} />
            <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
            Cancelar Reserva
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  </Animatable.View>
);
};const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoContainer: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default React.memo(ReservationCard);
