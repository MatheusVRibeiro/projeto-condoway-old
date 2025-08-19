import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // --- Containers ---
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-around', // Distribui o conteúdo verticalmente
    alignItems: 'center',
    padding: 32,
  },

  // --- Header ---
  header: {
    alignItems: 'center',
  },
  logo: {
    height: 60,
    width: 200,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },

  // --- Formulário ---
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Fundo semi-transparente
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: 'white',
  },
  eyeIconContainer: {
    padding: 16,
  },

  // --- Opções (Lembrar/Esqueci) ---
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  rememberMeText: {
    fontSize: 14,
    color: 'white',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },

  // --- Botão de Login ---
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#1d4ed8',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
