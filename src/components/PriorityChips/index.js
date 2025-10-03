import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';

const PriorityChips = ({ selectedPriority = 'media', onSelectPriority }) => {
  const { theme } = useTheme();

  const priorities = [
    {
      id: 'baixa',
      label: 'Baixa',
      icon: Info,
      color: '#10b981',
      lightColor: '#d1fae5',
      darkColor: '#059669',
    },
    {
      id: 'media',
      label: 'Média',
      icon: AlertCircle,
      color: '#f59e0b',
      lightColor: '#fed7aa',
      darkColor: '#d97706',
    },
    {
      id: 'alta',
      label: 'Alta',
      icon: AlertTriangle,
      color: '#ef4444',
      lightColor: '#fee2e2',
      darkColor: '#dc2626',
    },
  ];

  const handlePress = (priorityId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectPriority(priorityId);
  };

  return (
    <View style={styles.container}>
      {priorities.map((priority, index) => {
        const Icon = priority.icon;
        const isSelected = selectedPriority === priority.id;

        return (
          <Animatable.View
            key={priority.id}
            animation="fadeInUp"
            delay={index * 100}
            duration={400}
            style={styles.chipWrapper}
          >
            <TouchableOpacity
              onPress={() => handlePress(priority.id)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? priority.color : priority.lightColor,
                  borderColor: priority.color,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'transparent' }]}>
                <Icon
                  size={20}
                  color={isSelected ? '#ffffff' : priority.color}
                  strokeWidth={2.5}
                />
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  { color: isSelected ? '#ffffff' : priority.darkColor },
                ]}
              >
                {priority.label}
              </Text>

              {/* Check indicator */}
              {isSelected && (
                <Animatable.View animation="bounceIn" duration={400} style={styles.checkContainer}>
                  <View style={styles.checkDot} />
                </Animatable.View>
              )}
            </TouchableOpacity>
          </Animatable.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  chipWrapper: {
    flex: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  checkContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
});

export default React.memo(PriorityChips);
