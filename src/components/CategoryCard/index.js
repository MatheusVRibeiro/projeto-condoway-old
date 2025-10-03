import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeProvider';

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

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    color: '#1e293b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.2,
    minHeight: 34,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default React.memo(CategoryCard);
