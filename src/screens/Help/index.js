import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Button from '../../components/Button';
import { styles } from './styles';

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
