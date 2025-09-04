import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../../contexts/ThemeProvider';
import Button from '../../../components/Button';
import { styles } from './styles';


const Help = React.memo(function Help({ navigation }) {
  const { theme } = useTheme();
  
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Ajuda & FAQ</Text>
      <Text style={[styles.question, { color: theme.colors.text }]}>Como redefinir minha senha?</Text>
      <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>Acesse a tela de login e clique em "Esqueci a senha".</Text>
      <Text style={[styles.question, { color: theme.colors.text }]}>Como registrar uma ocorrência?</Text>
      <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>No menu principal, vá em "Ocorrências" e clique em "Registrar Nova".</Text>
      <Text style={[styles.question, { color: theme.colors.text }]}>Como liberar um visitante?</Text>
      <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>Acesse a aba "Visitantes" e siga as instruções para cadastro.</Text>
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
});

export default Help;
