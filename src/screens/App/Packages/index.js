import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Packages() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Encomendas</Text>
    </View>
  );
}
// Adicione os mesmos estilos do exemplo acima
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
});