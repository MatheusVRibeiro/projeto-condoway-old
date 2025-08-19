import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Button from '../../components/Button';

export default function Onboarding({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/condoway-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Bem-vindo ao CondoWay!</Text>
      <Text style={styles.subtitle}>Gerencie seu condomínio de forma simples e moderna.</Text>
      <Button title="Começar" onPress={() => navigation.replace('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
});
