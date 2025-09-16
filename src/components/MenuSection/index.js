import React from 'react';
import { View, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';

export default function MenuSection({ title, children, animation = "fadeInUp", duration = 400, delay = 100, theme }) {
  return (
    <Animatable.View animation={animation} duration={duration} delay={delay} style={styles.menuSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <View style={[styles.menuGroup, { backgroundColor: theme.colors.card }]}>
        {children}
      </View>
    </Animatable.View>
  );
}
