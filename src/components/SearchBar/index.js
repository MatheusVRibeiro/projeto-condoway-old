import React from 'react';
import { View, TextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Search } from 'lucide-react-native';

import { useTheme } from '../../contexts/ThemeProvider';

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar...' }) {
  const { theme } = useTheme();
  const colors = theme?.colors || {
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#0F172A',
    textSecondary: '#94A3B8',
    shadow: '#0F172A',
  };

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <Search color={colors.textSecondary} size={RFValue(16)} style={{ marginRight: 10 }} />
        <TextInput
          style={{ flex: 1, color: colors.text, fontSize: RFValue(13) }}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}
