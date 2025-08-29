import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { userProfile } from './mock';
import { useAuth } from '../../../contexts/AuthContext';
import { ROUTES } from '../../../routes/routeNames';
import { Edit, Shield, Home, Settings, FileText, HelpCircle, Users, LogOut, MapPin, Star, ChevronRight, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';

// Componente de ação principal
const ActionCard = ({ icon: Icon, iconBg = '#eff6ff', iconColor = '#2563eb', title, subtitle, onPress, variant = 'default' }) => (
  <Animatable.View animation="fadeInUp" duration={400}>
    <TouchableOpacity 
      style={[styles.actionCard, variant === 'danger' && styles.actionCardDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: iconBg }]}>
        <Icon size={24} color={iconColor} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, variant === 'danger' && styles.actionTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={20} color={variant === 'danger' ? '#dc2626' : '#94a3b8'} />
    </TouchableOpacity>
  </Animatable.View>
);

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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header com avatar e info */}
        <Animatable.View animation="fadeInDown" duration={400} style={styles.profileCard}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarContainer}>
            <Image 
              source={typeof profile.avatarUrl === 'string' ? { uri: profile.avatarUrl } : profile.avatarUrl} 
              style={styles.avatar} 
            />
            <View style={styles.editAvatarBadge}>
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <MapPin size={14} color="#64748b" />
              </View>
              <Text style={styles.locationText}>{profile.apartment} - {profile.block}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.roleText}>{getUserTypeLabel(profile.userType)}</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Menu Principal */}
        <Animatable.View animation="fadeInUp" duration={400} delay={100} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
                <Edit size={20} color="#2563eb" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Editar Perfil</Text>
                <Text style={styles.menuSubtitle}>Dados pessoais e contato</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Security')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                <Shield size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Segurança</Text>
                <Text style={styles.menuSubtitle}>Senha e autenticação</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]} onPress={() => navigation.navigate('UnitDetails')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#f0fdf4' }]}>
                <Home size={20} color="#10b981" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Minha Unidade</Text>
                <Text style={styles.menuSubtitle}>Informações do apartamento</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={400} delay={200} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>GERAL</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#f0f9ff' }]}>
                <Settings size={20} color="#0ea5e9" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Preferências</Text>
                <Text style={styles.menuSubtitle}>Configurações do app</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Documents')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#fef2f2' }]}>
                <FileText size={20} color="#ef4444" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Documentos</Text>
                <Text style={styles.menuSubtitle}>Regras e formulários</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]} onPress={() => navigation.navigate('Help')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: '#f8fafc' }]}>
                <HelpCircle size={20} color="#64748b" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Ajuda e Suporte</Text>
                <Text style={styles.menuSubtitle}>FAQ e contato</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Logout */}
        <Animatable.View animation="fadeInUp" duration={400} delay={300} style={styles.dangerSection}>
          <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: '#fef2f2' }]}>
              <LogOut size={20} color="#dc2626" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.dangerText]}>Sair da Conta</Text>
              <Text style={styles.menuSubtitle}>Fazer logout do aplicativo</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRight size={18} color="#dc2626" />
            </View>
          </TouchableOpacity>
        </Animatable.View>

        <View style={styles.bottomSpacer}>
          <Text style={styles.appVersion}>CondoWay v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
