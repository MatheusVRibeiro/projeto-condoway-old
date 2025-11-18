import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

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
      <View style={[styles.totalContainer, { borderBottomColor: theme.colors.border }] }>
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
          Total de Ocorrências
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }]}>
          {total}
        </Text>
      </View>

      <View style={[styles.statsContainer, { borderColor: theme.colors.border }] }>
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          // Escolher cores de acordo com o tema (light/dark)
          const iconBg = theme.isDark ? `${stat.darkColor}20` : stat.lightColor; // adiciona transparência no dark
          const iconColor = theme.isDark ? stat.darkColor : stat.color;
          const valueColor = theme.isDark ? stat.darkColor : stat.color;
          const itemBg = theme.isDark ? 'transparent' : '#f8fafc';

          return (
            <Animatable.View
              key={stat.id}
              animation="bounceIn"
              delay={index * 150}
              duration={800}
              style={[styles.statItem, { backgroundColor: itemBg }]}
            >
              {/* Ícone circular colorido */}
              <View style={[styles.iconContainer, { backgroundColor: iconBg }]}> 
                <Icon color={iconColor} size={16} strokeWidth={2.5} />
              </View>

              {/* Valor e Label */}
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, { color: valueColor }]}>
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

export default React.memo(OccurrenceHeader);
