import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from '../styles';

export default function About() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Sobre o App</Text>
        <Text style={{ color: '#64748b', marginTop: 8 }}>Versão: 1.0.0</Text>
        <Text style={{ color: '#64748b', marginTop: 4 }}>Condoway - Aplicativo do Condomínio</Text>
      </View>
    </SafeAreaView>
  );
}
