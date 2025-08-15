import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- Containers ---
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // bg-gray-50
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16, // rounded-2xl
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },

  // --- Header ---
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    height: 80,
    width: 200,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b', // text-gray-800
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb', // text-primary
  },

  // --- Formulário ---
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569', // text-gray-600
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // bg-gray-50
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0', // border-border
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeIconContainer: {
    padding: 12,
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
  checkbox: { // Estilo para um checkbox customizado
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#334155', // text-gray-700
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },

  // --- Botão de Login ---
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
