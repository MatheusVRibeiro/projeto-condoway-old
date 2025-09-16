import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import { PackageCheck } from 'lucide-react-native';

export default function EmptyState({ message, icon: Icon = PackageCheck }) {
  const { theme } = useTheme();
  const safe = theme && theme.colors ? theme.colors : { textSecondary: '#666' };

  return (
    <View style={{ alignItems: 'center', paddingVertical: 48 }}>
      <Icon color={safe.textSecondary} size={48} />
      <Text style={{ color: safe.textSecondary, fontSize: 16, marginTop: 16, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
}
