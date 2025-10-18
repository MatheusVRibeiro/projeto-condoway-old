import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

const CategoryCard = ({ category, count = 0, onPress, index = 0 }) => {
  const { theme } = useTheme();
  const Icon = category.icon;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(category);
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={600}
      style={styles.wrapper}
    >
      <TouchableOpacity
        style={[
          styles.card,
          { 
            backgroundColor: theme.colors.card, 
            borderColor: theme.colors.border,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Ícone com círculo colorido */}
        <View 
          style={[
            styles.iconContainer,
            { backgroundColor: category.lightColor }
          ]}
        >
          <Icon color={category.color} size={28} strokeWidth={2.5} />
        </View>

        {/* Título */}
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
          {category.title}
        </Text>

        {/* Indicador visual de "pressione" */}
        <View style={[styles.bottomBorder, { backgroundColor: category.color }]} />
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default React.memo(CategoryCard);
