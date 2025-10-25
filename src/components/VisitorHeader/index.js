import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { UserCheck, Clock, Users, TrendingUp, History } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeProvider';
import createStyles from './styles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3; // 3 cards com spacing

const VisitorHeader = ({ 
  awaitingCount = 0, 
  approvedCount = 0, 
  totalCount = 0,
  onCardPress 
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const stats = [
    {
      id: 'waiting',
      tabId: 'waiting',
      label: 'Aguardando',
      value: awaitingCount,
      icon: Clock,
      gradient: ['#F59E0B', '#FBBF24'],
      iconBg: 'rgba(245, 158, 11, 0.15)',
      shadowColor: '#F59E0B',
    },
    {
      id: 'present',
      tabId: 'present',
      label: 'Presentes',
      value: approvedCount,
      icon: UserCheck,
      gradient: ['#4ECDC4', '#44A08D'],
      iconBg: 'rgba(78, 205, 196, 0.15)',
      shadowColor: '#4ECDC4',
    },
    {
      id: 'history',
      tabId: 'history',
      label: 'Histórico',
      value: totalCount - awaitingCount - approvedCount,
      icon: History,
      gradient: ['#95A5A6', '#7F8C8D'],
      iconBg: 'rgba(149, 165, 166, 0.15)',
      shadowColor: '#95A5A6',
    },
  ];

  const handleCardPress = (tabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onCardPress) {
      onCardPress(tabId);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="fadeInDown" 
        duration={800}
        style={styles.headerContent}
      >
        <Text style={styles.headerTitle}>Gestão de Visitantes</Text>
        <Text style={styles.headerSubtitle}>Acompanhe e gerencie acessos</Text>
      </Animatable.View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Animatable.View
              key={stat.id}
              animation="zoomIn"
              delay={index * 150 + 200}
              duration={600}
              style={[styles.statCard, { width: CARD_WIDTH }]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleCardPress(stat.tabId)}
                style={styles.cardTouchable}
              >
                <LinearGradient
                  colors={[theme.colors.card, theme.colors.card]}
                  style={styles.cardGradient}
                >
                  {/* Icon Container with Gradient Border */}
                  <View style={[styles.iconWrapper, { shadowColor: stat.shadowColor }]}>
                    <LinearGradient
                      colors={stat.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconGradient}
                    >
                      <Icon size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </LinearGradient>
                  </View>

                  {/* Stats */}
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>

                  {/* Decorative Element */}
                  <View style={[styles.decorCircle, { backgroundColor: stat.iconBg }]} />
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          );
        })}
      </View>
    </View>
  );
};

export default VisitorHeader;
