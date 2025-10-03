import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';

const OccurrenceHeader = ({ total = 0, open = 0, inProgress = 0, resolved = 0 }) => {
  const { theme } = useTheme();

  const stats = [
    {
      id: 'open',
      label: 'Abertas',
      value: open,
      icon: AlertCircle,
      color: '#3b82f6',
      lightColor: '#dbeafe',
      darkColor: '#2563eb',
    },
    {
      id: 'progress',
      label: 'Em Análise',
      value: inProgress,
      icon: Clock,
      color: '#f59e0b',
      lightColor: '#fed7aa',
      darkColor: '#d97706',
    },
    {
      id: 'resolved',
      label: 'Resolvidas',
      value: resolved,
      icon: CheckCircle,
      color: '#10b981',
      lightColor: '#d1fae5',
      darkColor: '#059669',
    },
  ];

  return (
    <Animatable.View 
      animation="fadeInDown" 
      duration={600}
      style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
          Total de Ocorrências
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
              style={styles.statItem}
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  totalContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
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
    backgroundColor: '#f8fafc',
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
    color: '#64748b',
    textAlign: 'center',
  },
});

export default React.memo(OccurrenceHeader);
