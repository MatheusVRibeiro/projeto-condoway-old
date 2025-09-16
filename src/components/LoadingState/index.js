import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

const LoadingState = ({ message = "Carregando encomendas..." }) => {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
        {message}
      </Text>
    </View>
  );
};

export default React.memo(LoadingState);
