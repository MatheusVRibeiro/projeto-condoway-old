import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../contexts/ThemeProvider';
import { styles } from './styles';
import { ArrowLeft } from 'lucide-react-native';

const Settings = React.memo(function Settings() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Navegar automaticamente para NotificationPreferences ao abrir Settings
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('NotificationPreferences');
    }, 100);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Configurações</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Carregando preferências...
        </Text>
      </View>
    </SafeAreaView>
  );
});

export default Settings;
