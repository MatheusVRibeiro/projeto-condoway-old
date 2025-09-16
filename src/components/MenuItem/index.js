import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { styles } from './styles';

export default function MenuItem({ 
  icon: Icon, 
  title, 
  subtitle, 
  onPress, 
  theme,
  isLast = false,
  isDanger = false,
  style,
  iconBg = '#eff6ff',
  iconColor,
  chevronColor
}) {
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem, 
        { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
        isLast && styles.lastMenuItem,
        isDanger && { borderColor: theme.isDark ? '#7f1d1d' : '#fee2e2' },
        style
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor || (isDanger ? "#dc2626" : theme.colors.primary)} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[
          styles.menuTitle, 
          { color: isDanger ? "#dc2626" : theme.colors.text }
        ]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <View style={styles.chevronContainer}>
        <ChevronRight size={18} color={chevronColor || (isDanger ? "#dc2626" : theme.colors.textSecondary)} />
      </View>
    </TouchableOpacity>
  );
}
