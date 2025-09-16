import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

export default function DetailRow({ icon: Icon, label, value, copyable }) {
  const { theme } = useTheme();
  const safe = theme && theme.colors ? theme.colors : { textSecondary: '#666', text: '#000', primary: '#2563eb' };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
      <View style={{ marginRight: 8 }}>
        <Icon color={safe.textSecondary} size={18} />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: safe.textSecondary }}>{label}</Text>
          <Text style={{ color: safe.text }}>{value}</Text>
        </View>
        {copyable && value && (
          <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(value); Toast.show({ type: 'info', text1: 'Código copiado!' }); }} style={{ marginLeft: 8, padding: 4 }}>
            <Icon color={safe.primary} size={18} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
