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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, Eye, EyeOff, LogIn, Check, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../../contexts/AuthContext';

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
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsLoading(false);
      // Simula login de teste com qualquer e-mail e senha
      login({ email, name: 'Usuário de Teste' });
    }, 1500);
  }

  return (
    <>
      <View style={styles.container}>
        <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.gradient}>
          <SafeAreaView style={{ flex: 1, justifyContent: 'space-around', width: '100%' }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
                <Image source={require('../../../../assets/condo.png')} style={styles.logo} />
                <Text style={styles.title}>Acesse sua conta</Text>
                <Text style={styles.subtitle}>Bem-vindo(a) de volta!</Text>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" duration={1000} delay={200} style={styles.form}>
                {/* Campo de E-mail */}
                <View style={styles.inputContainer}>
                  <Mail color="rgba(255, 255, 255, 0.7)" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu e-mail"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
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

                {/* Campo de Senha */}
                <View style={styles.inputContainer}>
                  <Lock color="rgba(255, 255, 255, 0.7)" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Sua senha"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
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
                      <EyeOff color="rgba(255, 255, 255, 0.7)" size={20} />
                    ) : (
                      <Eye color="rgba(255, 255, 255, 0.7)" size={20} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Opções */}
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Check color="#1d4ed8" size={14} />}
                    </View>
                    <Text style={styles.rememberMeText}>Lembrar-me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPasswordText}>Esqueci a senha?</Text>
                  </TouchableOpacity>
                </View>

                {/* Botão de Login */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={isLoading}
                  accessibilityLabel="Botão de login"
                  accessible={true}
                  importantForAccessibility="yes"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#1d4ed8" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <LogIn color="#1d4ed8" size={20} />
                      <Text style={styles.loginButtonText}>Entrar</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Ajuda/FAQ */}
                <TouchableOpacity
                  style={{ alignItems: 'center', marginTop: 16 }}
                  onPress={() => navigation.navigate('Help')}
                  accessibilityLabel="Ajuda e perguntas frequentes"
                  accessible={true}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Info color="#fff" size={18} />
                    <Text style={{ color: '#fff', marginTop: 4, fontSize: 14 }}>Precisa de ajuda?</Text>
                  </View>
                </TouchableOpacity>

              </Animatable.View>

            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </View>
      {/* Toast container para feedback visual */}
      <Toast />
    </>
  );
}
