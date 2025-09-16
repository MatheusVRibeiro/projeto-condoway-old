import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export default function Card({
  children,
  onPress,
  variant = 'default', // default, outlined, elevated
  padding = 'medium', // none, small, medium, large
  margin = 'medium',
  theme,
  style,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        };
      default:
        return {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none': return { padding: 0 };
      case 'small': return { padding: 12 };
      case 'large': return { padding: 24 };
      default: return { padding: 16 };
    }
  };

  const getMarginStyles = () => {
    switch (margin) {
      case 'none': return { margin: 0 };
      case 'small': return { margin: 8 };
      case 'large': return { margin: 24 };
      default: return { margin: 16 };
    }
  };

  const cardStyles = [
    styles.container,
    getVariantStyles(),
    getPaddingStyles(),
    getMarginStyles(),
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}
