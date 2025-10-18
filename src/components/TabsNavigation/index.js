import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

const TabsNavigation = ({ 
  activeTab, 
  onTabChange, 
  awaitingCount, 
  deliveredCount, 
}) => {
  const { theme } = useTheme();

  const tabs = [
    {
      key: 'Aguardando',
      icon: Clock,
      label: 'Aguardando',
      subtitle: 'Retirada',
      count: awaitingCount,
      color: '#3b82f6',
      lightColor: '#dbeafe'
    },
    {
      key: 'Entregue',
      icon: CheckCircle,
      label: 'Retirados',
      subtitle: 'Histórico',
      count: deliveredCount,
      color: '#10b981',
      lightColor: '#d1fae5'
    }
  ];

  const handleTabPress = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(key);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {tabs.map(({ key, icon: Icon, label, subtitle, count, color, lightColor }) => {
        const isActive = activeTab === key;
        
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              isActive && { backgroundColor: lightColor }
            ]}
            onPress={() => handleTabPress(key)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: isActive ? color : theme.colors.background }
            ]}>
              <Icon 
                size={20} 
                color={isActive ? '#ffffff' : theme.colors.textSecondary} 
                strokeWidth={2.5} 
              />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={[
                styles.label,
                { color: isActive ? color : theme.colors.text }
              ]}>
                {label}
              </Text>
              <Text style={[
                styles.subtitle,
                { color: isActive ? color : theme.colors.textSecondary }
              ]}>
                {subtitle}
              </Text>
            </View>

            {count > 0 && (
              <View style={[styles.badge, { backgroundColor: color }]}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default React.memo(TabsNavigation);
