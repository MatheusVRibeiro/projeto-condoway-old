import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { styles } from './styles';

export default function Loading({ 
  size = 'large', 
  color,
  text,
  overlay = false,
  theme 
}) {
  const loadingColor = color || theme?.colors?.primary || '#2563eb';
  
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme?.colors?.card || 'white' }]}>
          <ActivityIndicator size={size} color={loadingColor} />
          {text && (
            <Text style={[styles.text, { color: theme?.colors?.text || '#000' }]}>
              {text}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={loadingColor} />
      {text && (
        <Text style={[styles.text, { color: theme?.colors?.text || '#000' }]}>
          {text}
        </Text>
      )}
    </View>
  );
}
