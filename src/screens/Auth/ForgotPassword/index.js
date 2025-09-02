import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { styles } from './styles';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira seu e-mail',
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira um e-mail válido',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simular requisição para a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      Toast.show({
        type: 'success',
        text1: 'E-mail enviado!',
        text2: 'Verifique sua caixa de entrada',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao enviar e-mail. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="rgb(37, 99, 235)" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animatable.View animation="fadeInUp" delay={400} style={styles.successContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={80} color="#22c55e" />
              </View>

              <Text style={styles.successTitle}>E-mail enviado!</Text>
              <Text style={styles.successSubtitle}>
                Enviamos um link de recuperação para {'\n'}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>

              <Text style={styles.successDescription}>
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <LinearGradient
                  colors={['rgb(37, 99, 235)', '#1e3a8a']}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Voltar ao Login</Text>
                  <ArrowRight size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => setSuccess(false)}
              >
                <Text style={styles.resendButtonText}>Não recebeu? Enviar novamente</Text>
              </TouchableOpacity>

              {/* Botão de Ajuda */}
              <Animatable.View animation="fadeInUp" delay={600} style={styles.helpContainer}>
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => navigation.navigate('Help')}
                >
                  <HelpCircle size={18} color="#6b7280" />
                  <Text style={styles.helpText}>Precisa de ajuda?</Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animatable.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="rgb(37, 99, 235)" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animatable.View animation="fadeInUp" delay={400} style={styles.formContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Esqueceu sua senha?</Text>
                <Text style={styles.subtitle}>
                  Não se preocupe! Digite seu e-mail e enviaremos {'\n'}
                  um link para redefinir sua senha.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu e-mail"
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
                  colors={loading ? ['#9ca3af', '#6b7280'] : ['rgb(37, 99, 235)', '#1e3a8a']}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Enviar Link</Text>
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
                <Text style={styles.backToLoginText}>Voltar ao Login</Text>
              </TouchableOpacity>

              {/* Botão de Ajuda */}
              <Animatable.View animation="fadeInUp" delay={600} style={styles.helpContainer}>
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => navigation.navigate('Help')}
                >
                  <HelpCircle size={18} color="#6b7280" />
                  <Text style={styles.helpText}>Precisa de ajuda?</Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ForgotPassword;