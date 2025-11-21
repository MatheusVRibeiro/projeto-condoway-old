import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { useTheme } from '../../../contexts/ThemeProvider';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, Eye, EyeOff, LogIn, Check, Info, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../../contexts/AuthContext';
import Help from '../../../screens/App/Perfil/Help';
import { validateEmail } from '../../../utils/validation';

export default function Login() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // estados de erro inline
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  // Limpa erro ao digitar
  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  // Preenchimento automático: carregar email/senha salvos, se existirem
  useEffect(() => {
    let mounted = true;
    async function loadSavedEmail() {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        if (!mounted) return;
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.warn('[Login] Failed to load saved email', e);
      }
    }

    loadSavedEmail();
    return () => { mounted = false; };
  }, []);

  async function handleLogin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Validação local: usar estados de erro para feedback inline
    setEmailError('');
    setPasswordError('');
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Por favor, informe seu e-mail.');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Digite um e-mail válido (ex: nome@exemplo.com).');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Por favor, informe sua senha.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres.');
      hasError = true;
    }

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = await login(email, password, rememberMe);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erro no login:', error); // Log para debug
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = (error && error.message) ? error.message : '';

      // Mapear erros da API para feedback inline quando fizer sentido
      if (msg && (msg.includes('401') || msg.toLowerCase().includes('senha') || msg.toLowerCase().includes('inválid'))) {
        // Marcar ambos os campos para feedback visual consistente
        setEmailError('E-mail ou senha incorretos.');
        setPasswordError('E-mail ou senha incorretos.');
      } else if (msg && (msg.toLowerCase().includes('bloque') || msg.toLowerCase().includes('morador'))) {
        // Acesso restrito: manter alerta/Toast mais visível
        Alert.alert('Acesso Bloqueado', msg || 'Acesso restrito ao aplicativo móvel.', [{ text: 'OK' }]);
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro de Conexão', 
          text2: 'Não foi possível conectar ao servidor. Tente novamente.', 
          position: 'bottom' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <View style={styles.container}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.info]} style={styles.gradient}>
          {/* Elementos decorativos de fundo */}
          <View style={styles.backgroundElements}>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={4000} style={[styles.circle, styles.circle1]} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} delay={1000} style={[styles.circle, styles.circle2]} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={5000} delay={2000} style={[styles.circle, styles.circle3]} />
          </View>

          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"} 
              style={{ flex: 1 }}
            >
              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                <View style={styles.keyboardAvoid}>

                  {/* Header com logo e saudação */}
                  <Animatable.View animation="fadeInDown" duration={1200} style={styles.header}>
                    <Text style={styles.welcomeText}>Bem-vindo!</Text>
                    <Text style={styles.title}>Faça login na sua conta</Text>
                    <Text style={styles.subtitle}>Acesse o seu condomínio de forma rápida e segura</Text>
                  </Animatable.View>

                  {/* Formulário principal */}
                  <Animatable.View animation="fadeInUp" duration={1200} delay={300} style={styles.formContainer}>
                    <View style={styles.form}>
                      
                      {/* Campo de E-mail */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>E-mail</Text>
                        <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                          <View style={styles.inputIconContainer}>
                            <Mail color={emailError ? '#EF4444' : theme.colors.primary} size={20} />
                          </View>
                          <TextInput
                            style={styles.input}
                            placeholder="Digite seu e-mail"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={email}
                            onChangeText={handleEmailChange}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            accessibilityLabel="Campo de e-mail"
                            accessible={true}
                            importantForAccessibility="yes"
                            returnKeyType="next"
                          />
                        </View>
                        {emailError ? (
                          <Animatable.Text animation="fadeIn" duration={300} style={styles.errorText}>
                            {emailError}
                          </Animatable.Text>
                        ) : null}
                      </View>

                      {/* Campo de Senha */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Senha</Text>
                        <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
                          <View style={styles.inputIconContainer}>
                            <Lock color={passwordError ? '#EF4444' : theme.colors.primary} size={20} />
                          </View>
                          <TextInput
                            style={styles.input}
                            placeholder="Digite sua senha"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={password}
                            onChangeText={handlePasswordChange}
                            secureTextEntry={!showPassword}
                            autoComplete="password"
                            accessibilityLabel="Campo de senha"
                            accessible={true}
                            importantForAccessibility="yes"
                            returnKeyType="done"
                          />
                          <TouchableOpacity
                            style={styles.eyeIconContainer}
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff color={theme.colors.textSecondary} size={20} />
                            ) : (
                              <Eye color={theme.colors.textSecondary} size={20} />
                            )}
                          </TouchableOpacity>
                        </View>
                        {passwordError ? (
                          <Animatable.Text animation="fadeIn" duration={300} style={styles.errorText}>
                            {passwordError}
                          </Animatable.Text>
                        ) : null}
                      </View>

                      {/* Opções */}
                      <View style={styles.optionsContainer}>
                        <TouchableOpacity
                          style={styles.rememberMeContainer}
                          onPress={() => setRememberMe(!rememberMe)}
                        >
                          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                            {rememberMe && <Check color="#fff" size={12} />}
                          </View>
                          <Text style={styles.rememberMeText}>Lembrar-me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                          <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Botão de Login */}
                      <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
                        <TouchableOpacity
                          style={[styles.loginButton, isLoading && styles.loginButtonLoading]}
                          onPress={handleLogin}
                          disabled={isLoading}
                          accessibilityLabel="Botão de login"
                          accessible={true}
                          importantForAccessibility="yes"
                        >
                          <LinearGradient
                            colors={[theme.colors.primary, theme.colors.info]}
                            style={styles.loginButtonGradient}
                          >
                            {isLoading ? (
                              <ActivityIndicator color="#fff" size="small" />
                            ) : (
                              <View style={styles.loginButtonContent}>
                                <Text style={styles.loginButtonText}>Entrar</Text>
                                <ArrowRight color="#fff" size={20} />
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animatable.View>

                      {/* Mensagem de contato */}
                      <Animatable.View animation="fadeInUp" duration={1000} delay={800} style={styles.contactContainer}>
                        <Text style={styles.contactText}>
                          Não tem uma conta? Entre em contato com o síndico do seu condomínio.
                        </Text>
                      </Animatable.View>

                    </View>
                  </Animatable.View>

                  {/* Ajuda/FAQ */}
                  <Animatable.View animation="fadeInUp" duration={1000} delay={1000} style={styles.helpContainer}>
                    <TouchableOpacity
                      style={styles.helpButton}
                      onPress={() => setHelpVisible(true)}
                      accessibilityLabel="Ajuda e perguntas frequentes"
                      accessible={true}
                    >
                      <Info color="#fff" size={18} />
                      <Text style={styles.helpText}>Precisa de ajuda?</Text>
                    </TouchableOpacity>
                  </Animatable.View>

                {/* Help Modal — reutiliza componente App/Help para manter conteúdo e estilos consistentes */}
                <Modal animationType="slide" transparent={false} visible={helpVisible} onRequestClose={() => setHelpVisible(false)}>
                  <Help navigation={{ goBack: () => setHelpVisible(false) }} />
                </Modal>

                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </View>
      <Toast />
    </>
  );
}