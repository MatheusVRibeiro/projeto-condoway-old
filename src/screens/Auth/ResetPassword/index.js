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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, KeyRound } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { styles } from './styles';
import { validateRequired } from '../../../utils/validation';
import { apiService } from '../../../services/api';

export default function ResetPassword({ navigation, route }) {
  const { email } = route.params || {};
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleValidateCode = async () => {
    // Validações do código
    if (!validateRequired(codigo)) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Por favor, insira o código de 6 dígitos',
        position: 'bottom'
      });
      return;
    }

    if (codigo.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Código inválido',
        text2: 'O código deve ter 6 dígitos',
        position: 'bottom'
      });
      return;
    }

    setValidatingCode(true);

    try {
      // Aqui você pode adicionar uma chamada de API para validar apenas o código
      // Por enquanto, vamos simular a validação
      console.log('🔍 Validando código:', codigo);
      
      // Simulando validação (você pode substituir por chamada real de API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCodeValidated(true);
      Toast.show({
        type: 'success',
        text1: 'Código válido!',
        text2: 'Agora você pode criar sua nova senha',
        position: 'bottom'
      });
      
    } catch (error) {
      console.error('❌ Erro ao validar código:', error);
      Toast.show({
        type: 'error',
        text1: 'Código inválido',
        text2: 'Verifique o código e tente novamente',
        position: 'bottom'
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const handleResetPassword = async () => {
    // Validações de senha
    if (!validateRequired(novaSenha)) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Por favor, insira uma nova senha',
        position: 'bottom'
      });
      return;
    }

    if (novaSenha.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Senha muito curta',
        text2: 'A senha deve ter no mínimo 6 caracteres',
        position: 'bottom'
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Senhas não coincidem',
        text2: 'As senhas digitadas são diferentes',
        position: 'bottom'
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🔑 Redefinindo senha para:', email);
      const response = await apiService.redefinirSenha(email, codigo, novaSenha);
      
      console.log('✅ Resposta do servidor:', response);
      
      setSuccess(true);
      Toast.show({
        type: 'success',
        text1: 'Senha alterada!',
        text2: 'Você já pode fazer login',
        position: 'bottom'
      });

      // Navegar para login após 3 segundos
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao redefinir senha:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.message || 'Código inválido ou expirado',
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animatable.View animation="fadeInUp" delay={400} style={styles.successContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={80} color="#22c55e" />
              </View>

              <Text style={styles.successTitle}>Senha redefinida!</Text>
              <Text style={styles.successSubtitle}>
                Sua senha foi alterada com sucesso
              </Text>

              <Text style={styles.successDescription}>
                Você já pode fazer login com sua nova senha.
              </Text>

              <TouchableOpacity
                style={styles.successButton}
                onPress={() => navigation.navigate('Login')}
              >
                <LinearGradient
                  colors={['#2563eb', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Fazer Login</Text>
                  <ArrowRight size={20} color="white" style={{ marginLeft: 10 }} />
                </LinearGradient>
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
          <Text style={styles.headerTitle}>Redefinir Senha</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animatable.View animation="fadeInUp" delay={400} style={styles.formContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Redefinir Senha</Text>
                <Text style={styles.subtitle}>
                  Insira o código de 6 dígitos enviado para {'\n'}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>
              </View>

              {/* Campo Código */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Código de Verificação</Text>
                <View style={styles.inputContainer}>
                  <KeyRound size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="000000"
                    placeholderTextColor="#9ca3af"
                    value={codigo}
                    onChangeText={(text) => setCodigo(text.replace(/[^0-9]/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading && !codeValidated}
                  />
                </View>
                <Text style={styles.hint}>
                  Digite o código de 6 dígitos enviado por e-mail
                </Text>
              </View>

              {/* Botão Validar Código */}
              {!codeValidated && (
                <TouchableOpacity
                  style={[styles.validateButton, (validatingCode || codigo.length !== 6) && styles.disabledButton]}
                  onPress={handleValidateCode}
                  disabled={validatingCode || codigo.length !== 6}
                >
                  <LinearGradient
                    colors={validatingCode || codigo.length !== 6 ? ['#9ca3af', '#6b7280'] : ['#2563eb', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButtonGradient}
                  >
                    {validatingCode ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Validar Código</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Indicador de código validado */}
              {codeValidated && (
                <View style={styles.validatedBadge}>
                  <CheckCircle size={20} color="#22c55e" />
                  <Text style={styles.validatedText}>Código validado! Agora defina sua nova senha</Text>
                </View>
              )}

              {/* Campo Nova Senha */}
              <View style={[styles.formGroup, !codeValidated && styles.disabledField]}>
                <Text style={styles.label}>Nova Senha</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="mínimo 6 caracteres"
                    placeholderTextColor="#9ca3af"
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading && codeValidated}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campo Confirmar Senha */}
              <View style={[styles.formGroup, !codeValidated && styles.disabledField]}>
                <Text style={styles.label}>Confirmar Nova Senha</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="digite a senha novamente"
                    placeholderTextColor="#9ca3af"
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading && codeValidated}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (loading || !codeValidated) && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={loading || !codeValidated}
              >
                <LinearGradient
                  colors={loading || !codeValidated ? ['#9ca3af', '#6b7280'] : ['#2563eb', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Redefinir Senha</Text>
                      <ArrowRight size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={loading}
              >
                <Text style={styles.backToLoginText}>Não recebeu o código?</Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
}