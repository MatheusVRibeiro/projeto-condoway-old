import React from 'react';
import { View, TextInput } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import { Search } from 'lucide-react-native';

export default function SearchBar({ value, onChangeText, placeholder = "Buscar..." }) {
  const { theme } = useTheme();
  const safe = theme && theme.colors ? theme.colors : { 
    card: '#fff', 
    border: '#e5e7eb', 
    text: '#000', 
    textSecondary: '#666' 
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: safe.card, borderColor: safe.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
        <Search color={safe.textSecondary} size={20} style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, color: safe.text, fontSize: 16 }}
          placeholder={placeholder}
          placeholderTextColor={safe.textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}
