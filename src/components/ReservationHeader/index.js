import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';

const ReservationHeader = ({ total = 0, pending = 0, confirmed = 0, cancelled = 0 }) => {
  const { theme } = useTheme();

  const stats = [
    {
      id: 'pending',
      label: 'Pendentes',
      value: pending,
      icon: Clock,
      color: '#f59e0b',
      lightColor: '#fef3c7',
      darkColor: '#d97706',
    },
    {
      id: 'confirmed',
      label: 'Confirmadas',
      value: confirmed,
      icon: CheckCircle,
      color: '#10b981',
      lightColor: '#d1fae5',
      darkColor: '#059669',
    },
    {
      id: 'cancelled',
      label: 'Canceladas',
      value: cancelled,
      icon: XCircle,
      color: '#ef4444',
      lightColor: '#fee2e2',
      darkColor: '#dc2626',
    },
  ];

  return (
    <Animatable.View 
      animation="fadeInDown" 
      duration={600}
      style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <View style={[styles.totalContainer, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
          Total de Reservas
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }]}>
          {total}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Animatable.View
              key={stat.id}
              animation="bounceIn"
              delay={index * 150}
              duration={800}
              style={[styles.statItem, { backgroundColor: theme.colors.background }]}
            >
              {/* Ícone circular colorido */}
              <View style={[styles.iconContainer, { backgroundColor: stat.lightColor }]}>
                <Icon color={stat.color} size={16} strokeWidth={2.5} />
              </View>

              {/* Valor e Label */}
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {stat.label}
                </Text>
              </View>
            </Animatable.View>
          );
        })}
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  totalContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default React.memo(ReservationHeader);
