import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // --- Containers principais ---
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: '#fff',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    top: height * 0.3,
    right: -75,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // Centraliza verticalmente
    paddingVertical: 20,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center', // Centraliza verticalmente
  },

  // --- Header (Textos sem Logo) ---
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30, // Espaço antes do formulário
  },
  welcomeText: {
    fontSize: 36, // Aumentado
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22, // Aumentado
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },

  // --- Formulário (Espaçamento REDUZIDO) ---
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 20, // <-- Reduzido
    marginVertical: 10, // <-- Reduzido
    marginHorizontal: 24, // <-- Mantido (para o card flutuante)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20, // <-- Reduzido
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 56,
    paddingHorizontal: 4,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  inputIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 12,
  },
  eyeIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },

  // --- Opções (Espaçamento REDUZIDO) ---
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // <-- Reduzido
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: 'rgb(37, 99, 235)',
    borderColor: 'rgb(37, 99, 235)',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'rgb(37, 99, 235)',
    fontWeight: '600',
  },

  // --- Botão de Login (Espaçamento REDUZIDO) ---
  loginButton: {
    borderRadius: 16,
    height: 56,
    marginBottom: 16, // <-- Reduzido
    shadowColor: 'rgb(37, 99, 235)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonLoading: {
    opacity: 0.8,
  },
  loginButtonGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },

  // --- Mensagem de contato ---
  contactContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // --- Ajuda ---
  helpContainer: {
    alignItems: 'center',
    marginTop: 30, // Espaço após o formulário
    paddingBottom: 10,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  helpText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});