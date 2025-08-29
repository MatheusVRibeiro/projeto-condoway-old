import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from '../styles';

export default function UnitDetails() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Minha Unidade</Text>
          <Text style={{ color: '#64748b', marginTop: 8 }}>Bloco A - Apartamento 123</Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>Membro desde: Janeiro 2023</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
