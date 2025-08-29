import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Smartphone, Key, AlertTriangle } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';

export default function Security() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleChangePassword = () => {
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
    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const SecurityOption = ({ icon: Icon, title, subtitle, onPress, hasSwitch = false, switchValue, onSwitchChange, variant = 'default' }) => (
    <TouchableOpacity 
      style={[styles.optionItem, variant === 'danger' && styles.optionItemDanger]} 
      onPress={onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
    >
      <View style={[styles.optionIcon, variant === 'danger' && styles.optionIconDanger]}>
        <Icon size={20} color={variant === 'danger' ? '#dc2626' : '#2563eb'} />
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, variant === 'danger' && styles.optionTitleDanger]}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
          thumbColor={switchValue ? '#ffffff' : '#94a3b8'}
        />
      ) : (
        <ArrowLeft size={18} color="#94a3b8" style={{ transform: [{ rotate: '180deg' }] }} />
      )}
    </TouchableOpacity>
  );

  const PasswordInput = ({ label, value, onChangeText, placeholder, showPassword, onToggleShow }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={onToggleShow} style={styles.eyeButton}>
          {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Segurança</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Change Password Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>ALTERAR SENHA</Text>
          <View style={styles.sectionContent}>
            <PasswordInput
              label="Senha Atual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Digite sua senha atual"
              showPassword={showCurrentPassword}
              onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            />
            <PasswordInput
              label="Nova Senha"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Digite a nova senha"
              showPassword={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
            />
            <PasswordInput
              label="Confirmar Nova Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme a nova senha"
              showPassword={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
              <Lock size={20} color="white" />
              <Text style={styles.changePasswordText}>Alterar Senha</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Security Settings */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURAÇÕES DE SEGURANÇA</Text>
          <View style={styles.sectionContent}>
            <SecurityOption
              icon={Smartphone}
              title="Autenticação de Dois Fatores"
              subtitle="Adicione uma camada extra de segurança"
              hasSwitch={true}
              switchValue={twoFactorEnabled}
              onSwitchChange={setTwoFactorEnabled}
            />
            <SecurityOption
              icon={Shield}
              title="Notificações de Segurança"
              subtitle="Receba alertas sobre atividades suspeitas"
              hasSwitch={true}
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
          </View>
        </Animatable.View>

        {/* Account Security */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>SEGURANÇA DA CONTA</Text>
          <View style={styles.sectionContent}>
            <SecurityOption
              icon={Key}
              title="Sessões Ativas"
              subtitle="Gerencie dispositivos conectados"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
            <SecurityOption
              icon={AlertTriangle}
              title="Atividade Recente"
              subtitle="Visualize ações realizadas na conta"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
          </View>
        </Animatable.View>

        {/* Password Requirements */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.infoSection}>
          <Text style={styles.infoTitle}>Requisitos de Senha</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>• Mínimo de 6 caracteres</Text>
            <Text style={styles.infoText}>• Recomendado: letras, números e símbolos</Text>
            <Text style={styles.infoText}>• Evite informações pessoais</Text>
            <Text style={styles.infoText}>• Use uma senha única</Text>
          </View>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
