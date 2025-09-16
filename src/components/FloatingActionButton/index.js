import React from 'react';
import { TouchableOpacity } from 'react-native';
import { QrCode } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeProvider';

const FloatingActionButton = ({ onPress, styles }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <QrCode size={24} color="#ffffff" />
    </TouchableOpacity>
  );
};

export default React.memo(FloatingActionButton);
