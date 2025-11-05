import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Moon, Globe, Palette, Volume2, Vibrate, Mail, MessageSquare, Shield } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';

export default function Settings() {
  const navigation = useNavigation();
  
  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  
  // App preferences
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Privacy preferences
  const [profileVisible, setProfileVisible] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    hasSwitch = false, 
    switchValue, 
    onSwitchChange, 
    onPress,
    variant = 'default' 
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, variant === 'danger' && styles.settingItemDanger]} 
      onPress={onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
    >
      <View style={[styles.settingIcon, variant === 'danger' && styles.settingIconDanger]}>
        <Icon size={20} color={variant === 'danger' ? '#dc2626' : '#2563eb'} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, variant === 'danger' && styles.settingTitleDanger]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
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

  const handleLanguageChange = () => {
    Alert.alert(
      'Idioma',
      'Selecione o idioma desejado:',
      [
        { text: 'Português (BR)', onPress: () => {} },
        { text: 'English', onPress: () => {} },
        { text: 'Español', onPress: () => {} },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Tema',
      'Selecione o tema desejado:',
      [
        { text: 'Claro', onPress: () => setDarkMode(false) },
        { text: 'Escuro', onPress: () => setDarkMode(true) },
        { text: 'Automático', onPress: () => {} },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Redefinir Configurações',
      'Tem certeza que deseja redefinir todas as configurações para o padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Redefinir', 
          style: 'destructive',
          onPress: () => {
            // Reset all settings to default
            setPushNotifications(true);
            setEmailNotifications(true);
            setSmsNotifications(false);
            setSecurityAlerts(true);
            setDarkMode(false);
            setSoundEnabled(true);
            setVibrationEnabled(true);
            setProfileVisible(true);
            setDataCollection(false);
            Alert.alert('Sucesso', 'Configurações redefinidas com sucesso!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferências</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICAÇÕES</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Bell}
              title="Notificações Push"
              subtitle="Receba notificações no dispositivo"
              hasSwitch={true}
              switchValue={pushNotifications}
              onSwitchChange={setPushNotifications}
            />
            <SettingItem
              icon={Mail}
              title="Notificações por E-mail"
              subtitle="Receba atualizações por e-mail"
              hasSwitch={true}
              switchValue={emailNotifications}
              onSwitchChange={setEmailNotifications}
            />
            <SettingItem
              icon={MessageSquare}
              title="Notificações SMS"
              subtitle="Receba alertas importantes por SMS"
              hasSwitch={true}
              switchValue={smsNotifications}
              onSwitchChange={setSmsNotifications}
            />
            <SettingItem
              icon={Shield}
              title="Alertas de Segurança"
              subtitle="Notificações sobre segurança do condomínio"
              hasSwitch={true}
              switchValue={securityAlerts}
              onSwitchChange={setSecurityAlerts}
            />
          </View>
        </Animatable.View>

        {/* Appearance */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={styles.sectionTitle}>APARÊNCIA</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Palette}
              title="Tema"
              subtitle={darkMode ? 'Modo escuro ativado' : 'Modo claro ativado'}
              onPress={handleThemeChange}
            />
            <SettingItem
              icon={Moon}
              title="Modo Escuro"
              subtitle="Reduz o brilho da tela"
              hasSwitch={true}
              switchValue={darkMode}
              onSwitchChange={setDarkMode}
            />
            <SettingItem
              icon={Globe}
              title="Idioma"
              subtitle="Português (Brasil)"
              onPress={handleLanguageChange}
            />
          </View>
        </Animatable.View>

        {/* Audio & Vibration */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>ÁUDIO E VIBRAÇÃO</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Volume2}
              title="Sons do Aplicativo"
              subtitle="Reproduzir sons de notificações"
              hasSwitch={true}
              switchValue={soundEnabled}
              onSwitchChange={setSoundEnabled}
            />
            <SettingItem
              icon={Vibrate}
              title="Vibração"
              subtitle="Vibrar para notificações e alertas"
              hasSwitch={true}
              switchValue={vibrationEnabled}
              onSwitchChange={setVibrationEnabled}
            />
          </View>
        </Animatable.View>

        {/* Privacy */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACIDADE</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Shield}
              title="Perfil Público"
              subtitle="Permitir que outros moradores vejam seu perfil"
              hasSwitch={true}
              switchValue={profileVisible}
              onSwitchChange={setProfileVisible}
            />
            <SettingItem
              icon={Shield}
              title="Coleta de Dados"
              subtitle="Permitir coleta de dados para melhorias"
              hasSwitch={true}
              switchValue={dataCollection}
              onSwitchChange={setDataCollection}
            />
          </View>
        </Animatable.View>

        {/* Advanced */}
        <Animatable.View animation="fadeInUp" duration={600} delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>AVANÇADO</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Shield}
              title="Redefinir Configurações"
              subtitle="Voltar às configurações padrão"
              variant="danger"
              onPress={handleResetSettings}
            />
          </View>
        </Animatable.View>

        {/* Info */}
        <Animatable.View animation="fadeInUp" duration={600} delay={700} style={styles.infoSection}>
          <Text style={styles.infoTitle}>Sobre as Configurações</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Suas preferências são sincronizadas entre dispositivos e aplicadas em tempo real.
              Para dúvidas sobre privacidade, consulte nossa política de dados.
            </Text>
          </View>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
