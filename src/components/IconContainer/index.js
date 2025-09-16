import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

export default function IconContainer({
  icon: Icon,
  size = 'medium', // small, medium, large
  variant = 'filled', // filled, outlined, ghost
  color,
  backgroundColor,
  theme,
  style,
  ...props
}) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, iconSize: 16 };
      case 'large':
        return { width: 56, height: 56, iconSize: 28 };
      default: // medium
        return { width: 40, height: 40, iconSize: 20 };
    }
  };

  const getVariantStyles = () => {
    const iconColor = color || theme.colors.primary;
    
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: iconColor,
          iconColor
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          iconColor
        };
      default: // filled
        return {
          backgroundColor: backgroundColor || `${iconColor}15`,
          iconColor
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
        },
        style
      ]}
      {...props}
    >
      <Icon size={sizeStyles.iconSize} color={variantStyles.iconColor} />
    </View>
  );
}
