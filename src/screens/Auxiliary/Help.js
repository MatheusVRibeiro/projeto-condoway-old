import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../../components/Button';

export default function Help({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ajuda & FAQ</Text>
      <Text style={styles.question}>Como redefinir minha senha?</Text>
      <Text style={styles.answer}>Acesse a tela de login e clique em "Esqueci a senha".</Text>
      <Text style={styles.question}>Como registrar uma ocorrência?</Text>
      <Text style={styles.answer}>No menu principal, vá em "Ocorrências" e clique em "Registrar Nova".</Text>
      <Text style={styles.question}>Como liberar um visitante?</Text>
      <Text style={styles.answer}>Acesse a aba "Visitantes" e siga as instruções para cadastro.</Text>
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2563eb',
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#1e293b',
  },
  answer: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 8,
  },
});
