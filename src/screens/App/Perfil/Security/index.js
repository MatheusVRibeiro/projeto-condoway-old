import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Smartphone, Key, AlertTriangle } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { useTheme } from '../../../../contexts/ThemeProvider';
import { useProfile } from '../../../../hooks';

export default function Security() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { changePassword, loading } = useProfile();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos de senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert(
        'Erro', 
        error.message || 'Não foi possível alterar a senha. Verifique se a senha atual está correta.'
      );
    }
  };

  const SecurityOption = ({ icon: Icon, title, subtitle, onPress, hasSwitch = false, switchValue, onSwitchChange, variant = 'default' }) => (
    <TouchableOpacity 
      style={[styles.optionItem, { borderBottomColor: theme.colors.border }, variant === 'danger' && { borderBottomColor: theme.colors.error + '44' }]} 
      onPress={onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
    >
      <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary + '22' }, variant === 'danger' && { backgroundColor: theme.colors.error + '22' }]}>
        <Icon size={20} color={variant === 'danger' ? theme.colors.error : theme.colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: variant === 'danger' ? theme.colors.error : theme.colors.text }]}>{title}</Text>
        <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={switchValue ? '#ffffff' : theme.colors.textSecondary}
        />
      ) : (
        <ArrowLeft size={18} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
      )}
    </TouchableOpacity>
  );

  const PasswordInput = ({ label, value, onChangeText, placeholder, showPassword, onToggleShow }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={[styles.passwordInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
        <TextInput
          style={[styles.passwordInput, { color: theme.colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={onToggleShow} style={styles.eyeButton}>
          {showPassword ? <EyeOff size={20} color={theme.colors.textSecondary} /> : <Eye size={20} color={theme.colors.textSecondary} />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.background }]}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Segurança</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Change Password Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ALTERAR SENHA</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <PasswordInput label="Senha Atual" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Digite sua senha atual" showPassword={showCurrentPassword} onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)} />
            <PasswordInput label="Nova Senha" value={newPassword} onChangeText={setNewPassword} placeholder="Digite a nova senha" showPassword={showNewPassword} onToggleShow={() => setShowNewPassword(!showNewPassword)} />
            <PasswordInput label="Confirmar Nova Senha" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirme a nova senha" showPassword={showConfirmPassword} onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)} />
            <TouchableOpacity 
              style={[styles.changePasswordButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} 
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Lock size={20} color="white" />
                  <Text style={styles.changePasswordText}>Alterar Senha</Text>
                </>
              )}
            </TouchableOpacity>
            {/* Password requirements moved here (below the button) */}
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Requisitos de Senha</Text>
              <View style={[styles.infoContent, { backgroundColor: theme.colors.info + '22', borderLeftColor: theme.colors.info, marginTop: 8 }]}>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>• Mínimo de 8 caracteres</Text>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>• Recomendado: letras, números e símbolos</Text>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>• Evite informações pessoais</Text>
                <Text style={[styles.infoText, { color: theme.colors.text }]}>• Use uma senha única</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Security Settings */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CONFIGURAÇÕES DE SEGURANÇA</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow, padding: 20 }]}>            
            <Text style={{ color: theme.colors.text, textAlign: 'center' }}>Em breve — Implementação futura</Text>
          </View>
        </Animatable.View>

        {/* Account Security */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>SEGURANÇA DA CONTA</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow, padding: 20 }]}>            
            <Text style={{ color: theme.colors.text, textAlign: 'center' }}>Em breve — Implementação futura</Text>
          </View>
        </Animatable.View>

        {/* Password requirements was moved to Change Password section above */}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
