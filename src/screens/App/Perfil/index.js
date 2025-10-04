import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../contexts/ThemeProvider';
import { createProfileStyles } from './styles';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../hooks/useProfile';
import { ROUTES } from '../../../routes/routeNames';
import { Edit, Shield, Home, Bell, FileText, HelpCircle, Users, LogOut, MapPin, Star, ChevronRight, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';

// Componente de ação principal
const ActionCard = ({ icon: Icon, iconBg, iconColor, title, subtitle, onPress, variant = 'default', theme }) => {
  const bgColor = iconBg || (theme.isDark ? theme.colors.card : `${theme.colors.info}15`);
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
  <ChevronRight size={20} color={variant === 'danger' ? theme.colors.error : theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Card de estatística do usuário
const StatsCard = ({ icon: Icon, value, label, color = null, theme }) => {
  const c = color || theme.colors.primary;
  return (
    <View style={styles.statsCardContainer}>
      <View style={[styles.statsIconWrapper, { backgroundColor: `${c}15` }]}>
        <Icon size={18} color={c} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
};

export default function Perfil() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createProfileStyles(theme), [theme]);
  const { user, logout } = useAuth();
  
  // Hook para dados do perfil da API
  const { 
    profileData, 
    loading,
    uploadProfilePhoto 
  } = useProfile();

  // Dados para exibição (usa dados da API quando disponível, senão usa dados do user do contexto)
  const displayProfile = {
    name: profileData?.user_nome || user?.user_nome || 'Usuário',
    email: profileData?.user_email || user?.user_email || '',
    phone: profileData?.user_telefone || user?.user_telefone || '',
    apartment: profileData?.apto_numero || 'N/A',
    block: profileData?.bloco_nome || '',
    condominium: profileData?.cond_nome || '',
    avatarUrl: profileData?.user_foto || user?.user_foto || null,
    userType: profileData?.userap_tipo || 'morador',
    memberSince: profileData?.userap_data_cadastro || user?.user_data_cadastro || 'Recente',
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para alterar a foto.');
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1,1], 
      quality: 1 
    });
    
    if (!pickerResult.canceled) {
      const fileUri = pickerResult.assets[0].uri;
      
      try {
        await uploadProfilePhoto(fileUri);
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      } catch (error) {
        Alert.alert('Erro', error.message || 'Erro ao atualizar foto de perfil');
      }
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
            {displayProfile.avatarUrl ? (
              <Image 
                source={{ uri: displayProfile.avatarUrl }} 
                style={[styles.avatar, { borderColor: theme.colors.card }]} 
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary, borderColor: theme.colors.card, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
                  {displayProfile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.editAvatarBadge, { backgroundColor: theme.colors.primary, borderColor: theme.colors.card }] }>
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{displayProfile.name}</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <MapPin size={14} color={theme.colors.textSecondary} />
              </View>
              <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                {displayProfile.apartment && displayProfile.block 
                  ? `${displayProfile.apartment} - ${displayProfile.block}` 
                  : displayProfile.condominium || 'Condomínio'}
              </Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: theme.isDark ? `${theme.colors.warning}33` : `${theme.colors.warning}15` }] }>
              <Star size={12} color={theme.colors.warning} fill={theme.colors.warning} />
              <Text style={[styles.roleText, { color: theme.colors.text }]}>{getUserTypeLabel(displayProfile.userType)}</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Menu Principal */}
        <Animatable.View animation="fadeInUp" duration={400} delay={100} style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CONTA</Text>
          <View style={[styles.menuGroup, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: `${theme.colors.info}15` }]}>
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
              <View style={[styles.menuIcon, { backgroundColor: `${theme.colors.info}15` }]}>
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
              <View style={[styles.menuIcon, { backgroundColor: `${theme.colors.info}15` }]}>
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
              <View style={[styles.menuIcon, { backgroundColor: `${theme.colors.info}15` }]}>
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
              <View style={[styles.menuIcon, { backgroundColor: `${theme.colors.info}15` }]}> 
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
              <View style={[styles.menuIcon, { backgroundColor: `${theme.colors.info}15` }]}> 
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
          <TouchableOpacity style={[styles.menuItem, styles.dangerItem, { backgroundColor: theme.colors.card, borderColor: theme.isDark ? `${theme.colors.error}33` : `${theme.colors.error}15` }]} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: `${theme.colors.error}15` }]}>
              <LogOut size={20} color={theme.colors.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.dangerText]}>Sair da Conta</Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>Fazer logout do aplicativo</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRight size={18} color={theme.colors.error} />
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
