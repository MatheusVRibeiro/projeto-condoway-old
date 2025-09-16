import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { styles } from './styles';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'medium', // small, medium, large
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left', // left, right
  theme,
  style,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
          text: { color: theme.colors.text }
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary },
          text: { color: theme.colors.primary }
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: theme.colors.primary }
        };
      case 'danger':
        return {
          container: { backgroundColor: '#dc2626' },
          text: { color: 'white' }
        };
      default: // primary
        return {
          container: { backgroundColor: theme.colors.primary },
          text: { color: 'white' }
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
          text: { fontSize: 14 }
        };
      case 'large':
        return {
          container: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 56 },
          text: { fontSize: 18 }
        };
      default: // medium
        return {
          container: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 48 },
          text: { fontSize: 16 }
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        isDisabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text.color} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === 'left' && (
            <Icon size={sizeStyles.text.fontSize} color={variantStyles.text.color} style={styles.iconLeft} />
          )}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>{title}</Text>
          {Icon && iconPosition === 'right' && (
            <Icon size={sizeStyles.text.fontSize} color={variantStyles.text.color} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
