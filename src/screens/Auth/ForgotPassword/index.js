import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { styles } from './styles';
import { validateEmail, validateRequired } from '../../../utils/validation';
import { apiService } from '../../../services/api';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendEmail = async () => {
    // Validação de campo obrigatório
    if (!validateRequired(email)) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Por favor, insira seu e-mail',
        position: 'bottom'
      });
      return;
    }

    // Validação de formato de e-mail
    if (!validateEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'E-mail inválido',
        text2: 'Digite um e-mail válido (ex: usuario@exemplo.com)',
        position: 'bottom'
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('📧 Solicitando recuperação de senha para:', email);
      const response = await apiService.solicitarRecuperacaoSenha(email);
      
      console.log('✅ Resposta do servidor:', response);
      
      setSuccess(true);
      Toast.show({
        type: 'success',
        text1: 'Código enviado!',
        text2: 'Verifique seu e-mail',
        position: 'bottom'
      });

      // Navegar para tela de redefinir senha após 4 segundos
      setTimeout(() => {
        navigation.navigate('ResetPassword', { email });
      }, 4000);
      
    } catch (error) {
      console.error('❌ Erro ao solicitar recuperação:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.message || 'Falha ao enviar código. Tente novamente.',
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="rgb(37, 99, 235)" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recuperar Senha</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animatable.View animation="fadeInUp" delay={400} style={styles.successContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={80} color="#22c55e" />
              </View>

              <Text style={styles.successTitle}>Código enviado!</Text>
              <Text style={styles.successSubtitle}>
                Enviamos um código de 6 dígitos para {'\n'}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>

              <Text style={styles.successDescription}>
                Verifique sua caixa de entrada e use o código para redefinir sua senha.
                {'\n\n'}O código expira em 10 minutos.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('ResetPassword', { email })}
              >
                <LinearGradient
                  colors={['#2563eb', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Inserir Código</Text>
                  <ArrowRight size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => setSuccess(false)}
              >
                <Text style={styles.resendButtonText}>Não recebeu? Enviar novamente</Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="rgb(37, 99, 235)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar Senha</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animatable.View animation="fadeInUp" delay={400} style={styles.formContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Esqueceu sua senha?</Text>
                <Text style={styles.subtitle}>
                  Não se preocupe! Digite seu e-mail e enviaremos {'\n'}
                  um código para redefinir sua senha.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu e-mail"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={handleSendEmail}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#9ca3af', '#6b7280'] : ['#2563eb', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Enviar Código</Text>
                      <ArrowRight size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <ArrowLeft size={16} color="rgb(37, 99, 235)" />
                <Text style={styles.backToLoginText}>Voltar ao Login</Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ForgotPassword;