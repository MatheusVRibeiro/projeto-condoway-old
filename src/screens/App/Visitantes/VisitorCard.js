import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Calendar, Hash, CheckCircle, ArrowRight, Clock } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../../../contexts/ThemeProvider';
import { formatSmartDate } from '../../../utils/dateFormatter';
import createStyles from './styles'; // Reutilizando styles existentes

const StatusBadge = ({ status, theme }) => {
  const styles = createStyles(theme);
  const statusConfig = {
    scheduled: { label: 'Agendado', color: theme.colors.info, icon: Clock },
    entered: { label: 'Presente', color: theme.colors.success, icon: CheckCircle },
    exited: { label: 'Saiu', color: theme.colors.textSecondary, icon: ArrowRight },
  };

  const config = statusConfig[status] || statusConfig.exited;
  const Icon = config.icon;

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
      <Icon color={config.color} size={14} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const VisitorCard = ({ item, onResend }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const smartDate = formatSmartDate(item.date);

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={styles.visitorCard}
    >
      <View style={styles.visitorCardHeader}>
        <View style={styles.visitorInfo}>
          <User color={theme.colors.primary} size={20} />
          <Text style={styles.visitorName}>{item.name}</Text>
        </View>
        <StatusBadge status={item.status} theme={theme} />
      </View>

      <View style={styles.visitorCardBody}>
        <View style={styles.detailRow}>
          <Calendar color={theme.colors.textSecondary} size={16} />
          <Text style={styles.detailText}>
            {smartDate}
            {item.status !== 'scheduled' && ` | Entrada: ${item.entryTime} - Saída: ${item.exitTime}`}
          </Text>
        </View>
        {item.doc && (
          <View style={styles.detailRow}>
            <Hash color={theme.colors.textSecondary} size={16} />
            <Text style={styles.detailText}>{item.doc}</Text>
          </View>
        )}
      </View>

      {item.status === 'scheduled' && (
        <View style={styles.visitorCardFooter}>
          <TouchableOpacity style={styles.resendButton} onPress={onResend}>
            <Text style={styles.resendButtonText}>Reenviar Convite</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animatable.View>
  );
};

export default VisitorCard;
