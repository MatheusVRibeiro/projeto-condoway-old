import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Smartphone,
  Mail,
  MessageSquare,
  Users,
  Package,
  AlertTriangle,
  Volume2,
  VolumeX,
  Clock,
  Settings,
  CheckCircle,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../contexts/ThemeProvider';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';

const NotificationPreferences = () => {
  const navigation = useNavigation();
  const { theme, themeMode, setThemeMode } = useTheme();

  // Estados das preferências de notificação
  const [preferences, setPreferences] = useState({
    // Notificações Gerais
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    
    // Comunicação
    messages: true,
    announcements: true,
    emergencyAlerts: true,
    
    // Atividades do Condomínio
    reservations: true,
    packages: true,
    visitors: true,
    maintenanceUpdates: true,
    
    // Segurança (removido: exibido em outra tela)
    
    // Configurações Avançadas
    quietHoursEnabled: false,
    quietStart: '22:00',
    quietEnd: '07:00',
    weekendMode: false,
  });

  // Estado para controlar se é a primeira renderização
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-save quando preferências mudam (mas não na primeira renderização)
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSavePreferences();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [preferences]);

  const updatePreference = (key, value) => {
    // Feedback háptico
    Vibration.vibrate(50);
    
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      
      // Lógica dependente: se push estiver desabilitado, desabilitar som e vibração
      if (key === 'pushEnabled' && !value) {
        updated.soundEnabled = false;
        updated.vibrationEnabled = false;
      }
      
      // Se som estiver desabilitado, desabilitar vibração também
      if (key === 'soundEnabled' && !value) {
        updated.vibrationEnabled = false;
      }
      
      return updated;
    });
  };

  const handleSavePreferences = async () => {
    try {
      // Simular salvamento (aqui você faria a chamada para API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Toast.show({
        type: 'success',
        text1: 'Preferências salvas',
        text2: 'Suas configurações foram atualizadas',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: 'Tente novamente em alguns instantes',
        position: 'bottom',
      });
    }
  };

  

  const handleClearNotifications = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de notificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: () => {
            Toast.show({
              type: 'success',
              text1: 'Histórico limpo',
              text2: 'Todas as notificações foram removidas',
              position: 'bottom',
            });
          }
        },
      ]
    );
  };

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    Toast.show({
      type: 'success',
      text1: 'Tema alterado',
      text2: `Tema ${mode === 'light' ? 'claro' : mode === 'dark' ? 'escuro' : 'automático'} aplicado.`,
      position: 'bottom',
    });
  };

  const getThemeIcon = (mode) => {
    switch (mode) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'auto': return Smartphone;
      default: return Sun;
    }
  };

  const renderThemeOption = (mode, label) => {
    const Icon = getThemeIcon(mode);
    const isSelected = themeMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        onPress={() => handleThemeChange(mode)}
        style={[
          styles.themeOption,
          { 
            backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border 
          }
        ]}
      >
        <Icon 
          color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
          size={24} 
        />
        <Text style={[
          styles.themeOptionText,
          { 
            color: isSelected ? theme.colors.primary : theme.colors.text,
            fontWeight: isSelected ? '600' : '500'
          }
        ]}>
          {label}
        </Text>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  const PreferenceSection = ({ title, children, icon: Icon }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      style={[styles.section, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.sectionHeader}>
        <Icon size={20} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </Animatable.View>
  );

  const PreferenceItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon: Icon,
    disabled = false 
  }) => (
    <View style={[styles.preferenceItem, disabled && styles.disabledItem]}>
      <View style={styles.preferenceLeft}>
        <Icon 
          size={18} 
          color={disabled ? theme.colors.textSecondary : theme.colors.primary} 
        />
        <View style={styles.preferenceText}>
          <Text style={[
            styles.preferenceTitle, 
            { color: disabled ? theme.colors.textSecondary : theme.colors.text }
          ]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ 
          false: theme.colors.border, 
          true: theme.colors.primary + '40' 
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.textSecondary}
        disabled={disabled}
      />
    </View>
  );

  const styles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Poppins-SemiBold',
      color: theme.colors.text,
      flex: 1,
    },
    
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 20,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.colors.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
      marginLeft: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 16,
      marginLeft: 28,
      lineHeight: 20,
    },
    themeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 8,
    },
    themeOption: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      position: 'relative',
      minHeight: 80,
      justifyContent: 'center',
    },
    themeOptionText: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
      fontWeight: '500',
    },
    selectedIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    preferenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    disabledItem: {
      opacity: 0.5,
    },
    preferenceLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    preferenceText: {
      marginLeft: 12,
      flex: 1,
    },
    preferenceTitle: {
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
    },
    preferenceDescription: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      marginTop: 2,
    },
    dangerZone: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#ef444440',
      shadowColor: theme.colors.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    dangerTitle: {
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
      color: '#ef4444',
      marginBottom: 8,
    },
    dangerDescription: {
      fontSize: 13,
      fontFamily: 'Poppins-Regular',
      color: theme.colors.textSecondary,
      marginBottom: 16,
      lineHeight: 18,
    },
    dangerButton: {
      backgroundColor: '#ef444420',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ef4444',
    },
    dangerButtonText: {
      color: '#ef4444',
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      textAlign: 'center',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={500} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('ProfileMain')}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Preferências</Text>
        
        {/* botão de teste removido */}
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção de Tema */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={500}
          style={[styles.section, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.sectionHeader}>
            <Settings size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Aparência
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Escolha como o aplicativo deve aparecer
          </Text>
          
          <View style={styles.themeContainer}>
            {renderThemeOption('light', 'Claro')}
            {renderThemeOption('dark', 'Escuro')}
            {renderThemeOption('auto', 'Automático')}
          </View>
        </Animatable.View>

        {/* Seção Geral */}
        <PreferenceSection title="Geral" icon={Settings}>
          <PreferenceItem
            title="Notificações Push"
            description="Receber notificações no dispositivo"
            value={preferences.pushEnabled}
            onToggle={(value) => updatePreference('pushEnabled', value)}
            icon={preferences.pushEnabled ? Bell : BellOff}
          />
          
          <PreferenceItem
            title="Som"
            description="Tocar som ao receber notificações"
            value={preferences.soundEnabled}
            onToggle={(value) => updatePreference('soundEnabled', value)}
            icon={preferences.soundEnabled ? Volume2 : VolumeX}
            disabled={!preferences.pushEnabled}
          />
          
          <PreferenceItem
            title="Vibração"
            description="Vibrar ao receber notificações"
            value={preferences.vibrationEnabled}
            onToggle={(value) => updatePreference('vibrationEnabled', value)}
            icon={Smartphone}
            disabled={!preferences.pushEnabled || !preferences.soundEnabled}
          />
        </PreferenceSection>

        {/* Seção Comunicação */}
        <PreferenceSection title="Comunicação" icon={MessageSquare}>
          <PreferenceItem
            title="Mensagens"
            description="Recados e comunicados importantes"
            value={preferences.messages}
            onToggle={(value) => updatePreference('messages', value)}
            icon={Mail}
          />
          
          <PreferenceItem
            title="Avisos do Condomínio"
            description="Informações gerais e atualizações"
            value={preferences.announcements}
            onToggle={(value) => updatePreference('announcements', value)}
            icon={Users}
          />
          
          <PreferenceItem
            title="Alertas de Emergência"
            description="Notificações urgentes e de segurança"
            value={preferences.emergencyAlerts}
            onToggle={(value) => updatePreference('emergencyAlerts', value)}
            icon={AlertTriangle}
          />
        </PreferenceSection>

        {/* Seção Atividades */}
        <PreferenceSection title="Atividades do Condomínio" icon={Clock}>
          <PreferenceItem
            title="Reservas"
            description="Confirmações e lembretes de reservas"
            value={preferences.reservations}
            onToggle={(value) => updatePreference('reservations', value)}
            icon={CheckCircle}
          />
          
          <PreferenceItem
            title="Encomendas"
            description="Chegada de pacotes e entregas"
            value={preferences.packages}
            onToggle={(value) => updatePreference('packages', value)}
            icon={Package}
          />
          
          <PreferenceItem
            title="Visitantes"
            description="Notificações sobre liberação de acesso"
            value={preferences.visitors}
            onToggle={(value) => updatePreference('visitors', value)}
            icon={Users}
          />
          
          <PreferenceItem
            title="Manutenção"
            description="Atualizações sobre serviços de manutenção"
            value={preferences.maintenanceUpdates}
            onToggle={(value) => updatePreference('maintenanceUpdates', value)}
            icon={Settings}
          />
        </PreferenceSection>

        {/* Seção Segurança removida */}

        {/* Espaçamento inferior */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationPreferences;
