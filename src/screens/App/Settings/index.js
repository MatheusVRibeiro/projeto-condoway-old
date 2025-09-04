import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Switch, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../contexts/ThemeProvider';
import { styles } from './styles';
import { ArrowLeft, Bell, ChevronRight } from 'lucide-react-native';
// import { schedulePushNotification } from '../../../lib/notifications'; // Comentado


const Settings = React.memo(function Settings() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState({
    packages: true,
    reservations: true,
    generalNotices: true,
  });

  const toggleSwitch = (key) => {
    setNotifications(previousState => ({ ...previousState, [key]: !previousState[key] }));
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Configurações</Text>
      </View>
      <View style={styles.content}>
        {/* Navegação para Preferências de Notificação */}
        <TouchableOpacity 
          style={[styles.navigationItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('NotificationPreferences')}
        >
          <View style={styles.navigationItemLeft}>
            <Bell size={24} color={theme.colors.primary} />
            <Text style={[styles.navigationItemText, { color: theme.colors.text }]}>Preferências de Notificação</Text>
          </View>
          <ChevronRight size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Configurações Rápidas</Text>
        <View style={[styles.settingRow, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.settingText, { color: theme.colors.text }]}>Novas Encomendas</Text>
          <Switch
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
            thumbColor={notifications.packages ? theme.colors.primary : theme.colors.textSecondary}
            onValueChange={() => toggleSwitch('packages')}
            value={notifications.packages}
          />
        </View>
        <View style={[styles.settingRow, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.settingText, { color: theme.colors.text }]}>Status de Reservas</Text>
          <Switch
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
            thumbColor={notifications.reservations ? theme.colors.primary : theme.colors.textSecondary}
            onValueChange={() => toggleSwitch('reservations')}
            value={notifications.reservations}
          />
        </View>
        <View style={[styles.settingRow, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.settingText, { color: theme.colors.text }]}>Avisos Gerais</Text>
          <Switch
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
            thumbColor={notifications.generalNotices ? theme.colors.primary : theme.colors.textSecondary}
            onValueChange={() => toggleSwitch('generalNotices')}
            value={notifications.generalNotices}
          />
        </View>
        {/* O botão de teste foi removido daqui */}
      </View>
    </SafeAreaView>
  );
});

export default Settings;
