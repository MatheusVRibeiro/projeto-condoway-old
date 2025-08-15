import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
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
import { Mail, Lock, Eye, EyeOff, LogIn, Check } from 'lucide-react-native';

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
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Por favor, preencha todos os campos.',
        position: 'bottom',
      });
      return;
    }
    
    setIsLoading(true);

    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Login realizado com sucesso!',
        text2: 'Bem-vindo(a) de volta.',
        position: 'bottom',
      });
      login({ email });
      setIsLoading(false);
    }, 1500);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Image
              source={require('../../../../assets/condoway-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Bem-vindo(a) ao</Text>
            <Text style={styles.subtitle}>CondoWay Residence</Text>
          </View>

          <View style={styles.form}>
            {/* Campo de E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Mail color="#9ca3af" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Campo de Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <Lock color="#9ca3af" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="#9ca3af" size={20} />
                  ) : (
                    <Eye color="#9ca3af" size={20} />
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
                  {rememberMe && <Check color="white" size={14} />}
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
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <LogIn color="white" size={20} />
                  <Text style={styles.loginButtonText}>Entrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
