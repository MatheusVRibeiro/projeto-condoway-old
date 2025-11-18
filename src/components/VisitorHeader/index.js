import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, UserCheck, History } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../contexts/ThemeProvider';
import createStyles from './styles';

const VisitorHeader = ({ awaitingCount = 0, approvedCount = 0, totalCount = 0, onCardPress }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const stats = [
    {
      id: 'waiting',
      label: 'Aguardando',
      value: awaitingCount,
      color: '#F59E0B',
      icon: Clock,
    },
    {
      id: 'present',
      label: 'Presentes',
      value: approvedCount,
      color: '#0EA25C',
      icon: UserCheck,
    },
    {
      id: 'history',
      label: 'Histórico',
      value: Math.max(totalCount - awaitingCount - approvedCount, 0),
      color: '#3B82F6',
      icon: History,
    },
  ];

  const handleCardPress = (tabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCardPress?.(tabId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Gestão de Visitantes</Text>
        <Text style={styles.headerSubtitle}>Acompanhe e gerencie acessos</Text>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Animatable.View
              key={stat.id}
              animation="fadeInUp"
              delay={150 * index}
              duration={500}
              style={styles.statCard}
            >
              <TouchableOpacity
                style={styles.cardTouchable}
                activeOpacity={0.85}
                onPress={() => handleCardPress(stat.id)}
              >
                <View style={[styles.iconWrapper, { backgroundColor: `${stat.color}15` }]}> 
                  <Icon size={18} color={stat.color} strokeWidth={2.5} />
                </View>
                <View style={styles.statTextWrapper}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          );
        })}
      </View>
    </View>
  );
};

export default VisitorHeader;
