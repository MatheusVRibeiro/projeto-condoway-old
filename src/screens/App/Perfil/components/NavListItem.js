import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { styles } from '../styles';

export default function NavListItem({ icon: Icon, title, subtitle, onPress, badge, destructive }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.navItem, destructive && styles.actionButtonDestructive]}>
      <View style={styles.navItemIcon}>
        {Icon ? <Icon color={destructive ? '#ef4444' : '#64748b'} size={18} /> : null}
      </View>
      <View style={styles.navItemText}>
        <Text style={[styles.navItemTitle, destructive && { color: '#ef4444' }]}>{title}</Text>
        {subtitle ? <Text style={styles.navItemSubtitle}>{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.navItemBadge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <ChevronRight color="#9ca3af" size={20} />
    </TouchableOpacity>
  );
}
