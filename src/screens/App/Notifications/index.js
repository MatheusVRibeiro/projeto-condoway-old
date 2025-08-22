import React from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import { mockNotifications } from './mock';

// mockNotifications agora importado de mock.js

export default function NotificationsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Feather name={item.icon} size={28} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notificações</Text>
      <FlatList
        data={mockNotifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ...styles agora está em styles.js
