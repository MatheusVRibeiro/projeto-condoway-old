import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../contexts/ThemeProvider';
import { createProfileStyles } from './styles';
import { userProfile } from './mock';
import { useAuth } from '../../../contexts/AuthContext';
import { ROUTES } from '../../../routes/routeNames';
import { Edit, Shield, Home, Bell, FileText, HelpCircle, Users, LogOut, MapPin, Star, ChevronRight, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';

// Componente de ação principal
const ActionCard = ({ icon: Icon, iconBg, iconColor, title, subtitle, onPress, variant = 'default', theme }) => {
  const bgColor = iconBg || (theme.isDark ? '#1e293b' : '#eff6ff');
  const iColor = iconColor || theme.colors.primary;
  
  return (
    <Animatable.View animation="fadeInUp" duration={400}>
      <TouchableOpacity 
        style={[
          styles.actionCard, 
          { backgroundColor: theme.colors.card },
          variant === 'danger' && styles.actionCardDanger
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: bgColor }]}>
          <Icon size={24} color={iColor} />
        </View>
        <View style={styles.actionContent}>
          <Text style={[
            styles.actionTitle, 
            { color: theme.colors.text },
            variant === 'danger' && styles.actionTitleDanger
          ]}>{title}</Text>
          {subtitle && <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
        </View>
        <ChevronRight size={20} color={variant === 'danger' ? '#dc2626' : theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Card de estatística do usuário
const StatsCard = ({ icon: Icon, value, label, color = '#2563eb' }) => (
  <View style={styles.statsCardContainer}>
    <View style={[styles.statsIconWrapper, { backgroundColor: `${color}15` }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{label}</Text>
  </View>
);

export default function Perfil() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createProfileStyles(theme), [theme]);
  const { logout } = useAuth();
  const [profile, setProfile] = useState(userProfile);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1,1], 
      quality: 1 
    });
    if (!pickerResult.canceled) {
      setProfile(p => ({ ...p, avatarUrl: pickerResult.assets[0].uri }));
    }
  };

  const getUserTypeLabel = (userType) => ({ 
    morador: 'Morador', 
    proprietario: 'Proprietário', 
    sindico: 'Síndico', 
    porteiro: 'Porteiro' 
  }[userType] || 'Morador');

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header com avatar e info */}
        <Animatable.View animation="fadeInDown" duration={400} style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }] }>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarContainer}>
            <Image 
              source={typeof profile.avatarUrl === 'string' ? { uri: profile.avatarUrl } : profile.avatarUrl} 
              style={[styles.avatar, { borderColor: theme.colors.card }]} 
            />
            <View style={[styles.editAvatarBadge, { backgroundColor: theme.colors.primary, borderColor: theme.colors.card }] }>
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{profile.name}</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <MapPin size={14} color={theme.colors.textSecondary} />
              </View>
              <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>{profile.apartment} - {profile.block}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: theme.isDark ? '#78350f33' : '#fef3c7' }] }>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <Text style={[styles.roleText, { color: theme.isDark ? '#fbbf24' : '#92400e' }]}>{getUserTypeLabel(profile.userType)}</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Menu Principal */}
        <Animatable.View animation="fadeInUp" duration={400} delay={100} style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CONTA</Text>
          <View style={[styles.menuGroup, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
                <Edit size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Editar Perfil</Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>Dados pessoais e contato</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('Security')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
                <Shield size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Segurança</Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>Senha e autenticação</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('UnitDetails')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
                <Home size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Minha Unidade</Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>Informações do apartamento</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={400} delay={200} style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>GERAL</Text>
          <View style={[styles.menuGroup, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]} onPress={() => navigation.navigate('NotificationPreferences')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
                <Bell size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Preferências</Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>Configurações do aplicativo</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]} onPress={() => navigation.navigate('Documents')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}> 
                <FileText size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Documentos</Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>Regras e formulários</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]} onPress={() => navigation.navigate('Help')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}> 
                <HelpCircle size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Ajuda e Suporte</Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>FAQ e contato</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Logout */}
        <Animatable.View animation="fadeInUp" duration={400} delay={300} style={styles.dangerSection}>
          <TouchableOpacity style={[styles.menuItem, styles.dangerItem, { backgroundColor: theme.colors.card, borderColor: theme.isDark ? '#7f1d1d' : '#fee2e2' }]} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: '#fef2f2' }]}>
              <LogOut size={20} color="#dc2626" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.dangerText]}>Sair da Conta</Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>Fazer logout do aplicativo</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRight size={18} color="#dc2626" />
            </View>
          </TouchableOpacity>
        </Animatable.View>

        <View style={styles.bottomSpacer}>
          <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>CondoWay v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
