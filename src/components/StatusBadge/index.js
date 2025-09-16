import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

export default function StatusBadge({ status, style }) {
  const { theme } = useTheme();
  const safe = theme && theme.colors ? theme.colors : {
    primary: '#2563eb',
    success: '#22c55e',
    textOnPrimary: '#ffffff'
  };

  if (status === 'Aguardando') {
    return (
      <Text style={[{ backgroundColor: safe.primary, color: '#ffffff', fontWeight: 'bold', fontSize: 11, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }, style]}>
        Aguardando retirada
      </Text>
    );
  }
  if (status === 'Entregue') {
    return (
      <Text style={[{ backgroundColor: safe.success, color: '#ffffff', fontWeight: 'bold', fontSize: 11, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }, style]}>
        Retirada
      </Text>
    );
  }
  return null;
}
