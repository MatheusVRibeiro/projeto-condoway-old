import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { ArrowLeft } from 'lucide-react-native';

export default function Settings() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState({
    packages: true,
    reservations: true,
    generalNotices: true,
  });

  const toggleSwitch = (key) => {
    setNotifications(previousState => ({ ...previousState, [key]: !previousState[key] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Preferências de Notificação</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Novas Encomendas</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notifications.packages ? "#2563eb" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('packages')}
            value={notifications.packages}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Status de Reservas</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notifications.reservations ? "#2563eb" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('reservations')}
            value={notifications.reservations}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Avisos Gerais</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notifications.generalNotices ? "#2563eb" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('generalNotices')}
            value={notifications.generalNotices}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
