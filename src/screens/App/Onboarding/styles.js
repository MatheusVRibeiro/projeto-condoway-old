import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.08, // Posiciona o logo a 8% do topo
  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: 'contain',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // O posicionamento vertical será gerido pelo space-between do container principal
  },
  mainContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 34, // Tamanho maior para mais impacto
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 42, // Espaçamento entre linhas
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)', // Um pouco menos transparente
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    maxWidth: '90%', // Evita que o texto fique muito largo
  },
  footer: {
    width: '100%',
    marginBottom: height * 0.05, // Posiciona o botão a 5% da base
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#1d4ed8', // Um azul mais escuro para contraste
    fontSize: 18,
    fontWeight: 'bold',
  },
});
