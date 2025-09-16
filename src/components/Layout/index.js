import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

export default function Layout({
  children,
  type = 'column', // column, row, grid
  spacing = 'medium', // none, small, medium, large
  alignment = 'stretch', // start, center, end, stretch, space-between, space-around
  wrap = false,
  style,
  ...props
}) {
  const getLayoutStyles = () => {
    const flexDirection = type === 'row' ? 'row' : 'column';
    
    let justifyContent = 'flex-start';
    let alignItems = 'stretch';
    
    switch (alignment) {
      case 'start':
        justifyContent = 'flex-start';
        alignItems = 'flex-start';
        break;
      case 'center':
        justifyContent = 'center';
        alignItems = 'center';
        break;
      case 'end':
        justifyContent = 'flex-end';
        alignItems = 'flex-end';
        break;
      case 'space-between':
        justifyContent = 'space-between';
        break;
      case 'space-around':
        justifyContent = 'space-around';
        break;
    }

    return {
      flexDirection,
      justifyContent,
      alignItems,
      flexWrap: wrap ? 'wrap' : 'nowrap'
    };
  };

  const getSpacingStyles = () => {
    switch (spacing) {
      case 'none': return { gap: 0 };
      case 'small': return { gap: 8 };
      case 'large': return { gap: 24 };
      default: return { gap: 16 };
    }
  };

  return (
    <View 
      style={[
        styles.container,
        getLayoutStyles(),
        getSpacingStyles(),
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
