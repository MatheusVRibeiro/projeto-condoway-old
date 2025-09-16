import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, Eye, EyeOff, LogIn, Check, Info, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../../contexts/AuthContext';
import Help from '../../../screens/App/Perfil/Help';
import { api } from '../../services/api'; // Importando a API (caminho corrigido)

// Função simples de validação de e-mail
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function Login() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  async function handleLogin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Por favor, preencha todos os campos.', position: 'bottom' });
      return;
    }
    
    if (!validateEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: 'error', text1: 'E-mail inválido', text2: 'Digite um e-mail válido.', position: 'bottom' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = await api.login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      login(userData);
    } catch (error) {
      console.error('Erro no login:', error); // Log para debug
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro de Login', 
        text2: error.message, 
        position: 'bottom' 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <View style={styles.container}>
        <LinearGradient colors={['rgb(37, 99, 235)', '#1e3a8a']} style={styles.gradient}>
          {/* Elementos decorativos de fundo */}
          <View style={styles.backgroundElements}>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={4000} style={[styles.circle, styles.circle1]} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} delay={1000} style={[styles.circle, styles.circle2]} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={5000} delay={2000} style={[styles.circle, styles.circle3]} />
          </View>

          <SafeAreaView style={styles.safeArea}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
                
                {/* Header com logo e saudação */}
                <Animatable.View animation="fadeInDown" duration={1200} style={styles.header}>
                  <Image source={require('../../../../assets/condo.png')} style={styles.logo} />
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
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <Mail color="rgb(37, 99, 235)" size={20} />
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="Digite seu e-mail"
                          placeholderTextColor="#9CA3AF"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          accessibilityLabel="Campo de e-mail"
                          accessible={true}
                          importantForAccessibility="yes"
                          returnKeyType="next"
                        />
                      </View>
                    </View>

                    {/* Campo de Senha */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Senha</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <Lock color="rgb(37, 99, 235)" size={20} />
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="Digite sua senha"
                          placeholderTextColor="#9CA3AF"
                          value={password}
                          onChangeText={setPassword}
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
                            <EyeOff color="#9CA3AF" size={20} />
                          ) : (
                            <Eye color="#9CA3AF" size={20} />
                          )}
                        </TouchableOpacity>
                      </View>
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
                          colors={['rgb(37, 99, 235)', '#1e3a8a']}
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

                    {/* Link para registro */}
                    <Animatable.View animation="fadeInUp" duration={1000} delay={800} style={styles.signUpContainer}>
                      <Text style={styles.signUpText}>Não tem uma conta? </Text>
                      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signUpLink}>Cadastre-se</Text>
                      </TouchableOpacity>
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

              </KeyboardAvoidingView>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
      <Toast />
    </>
  );
}
