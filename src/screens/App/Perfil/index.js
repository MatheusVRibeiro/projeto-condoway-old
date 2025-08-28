import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { userProfile } from './mock';
import { useAuth } from '../../../contexts/AuthContext';
import { ROUTES } from '../../../routes/routeNames';
import { 
  User, FileText, Settings, HelpCircle, LogOut, ChevronRight, Mail, Phone, 
  ChevronDown, Camera, Edit, X, Shield, MapPin, Calendar, Bell, 
  Eye, Star, Clock, Home, Users
} from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

// --- Componentes Internos ---

const StatsCard = ({ icon: Icon, title, value, color = "#2563eb" }) => (
  <Animatable.View animation="fadeInUp" style={[styles.statsCard, { borderLeftColor: color }]}>
    <View style={styles.statsIconContainer}>
      <Icon size={20} color={color} />
    </View>
    <View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  </Animatable.View>
);

const AccordionItem = ({ title, icon: Icon, children, onEdit, isEditing, badge }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionTrigger} onPress={() => setExpanded(!expanded)}>
        <View style={styles.accordionTitleContainer}>
          <Icon color="#2563eb" size={20} />
          <Text style={styles.accordionTitle}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {onEdit && !isEditing && (
            <TouchableOpacity onPress={onEdit}>
              <Edit color="#64748b" size={20} />
            </TouchableOpacity>
          )}
          <Animatable.View transition="rotate" style={expanded && { transform: [{ rotate: '180deg' }]}}>
            <ChevronDown color="#64748b" size={24} />
          </Animatable.View>
        </View>
      </TouchableOpacity>
      {expanded && (
        <Animatable.View animation="fadeIn" style={styles.accordionContent}>
          {children}
        </Animatable.View>
      )}
    </Animatable.View>
  );
};

const ActionButton = ({ label, icon: Icon, onPress, variant }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.actionButton, variant === 'destructive' && styles.actionButtonDestructive]}
  >
    <Icon 
      color={variant === 'destructive' ? '#ef4444' : '#334155'} 
      size={20} 
      style={styles.actionButtonIcon} 
    />
    <Text style={[styles.actionButtonText, variant === 'destructive' && styles.actionButtonTextDestructive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// --- Componente Principal da Tela ---

export default function Perfil() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState(userProfile);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Você tem a certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Sair", onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: ROUTES.LOGIN }],
          });
        }, style: 'destructive' }
    ]);
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("É necessária a permissão para aceder às suas fotos!");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1,
    });
    if (!pickerResult.canceled) {
      setProfile(prev => ({ ...prev, avatarUrl: pickerResult.assets[0].uri }));
    }
  };

  const handleSaveProfile = () => {
    setProfile(tempProfile);
    setIsEditing(false);
    Toast.show({ type: 'success', text1: 'Dados atualizados com sucesso!' });
  };

  const handleCancelEdit = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const getUserTypeLabel = (userType) => {
    const types = {
      morador: 'Morador',
      proprietario: 'Proprietário',
      sindico: 'Síndico',
      porteiro: 'Porteiro'
    };
    return types[userType] || 'Morador';
  };

  const profileActions = [
    { label: 'Configurações', icon: Settings, onPress: () => navigation.navigate('Settings') },
    { label: 'Ajuda e Suporte', icon: HelpCircle, onPress: () => navigation.navigate('Help') },
    { label: 'Sair da Conta', icon: LogOut, onPress: handleLogout, variant: 'destructive' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          {/* Header do Perfil Melhorado */}
          <Animatable.View animation="fadeInDown" style={styles.profileHeader}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              <View style={styles.cameraIconOverlay}>
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>
            
            {isEditing ? (
              <TextInput
                style={[styles.userName, styles.userNameEditing]}
                value={tempProfile.name}
                onChangeText={(text) => setTempProfile(p => ({ ...p, name: text }))}
                placeholder="Nome completo"
              />
            ) : (
              <Text style={styles.userName}>{profile.name}</Text>
            )}

            <View style={styles.userLocationContainer}>
              <MapPin size={14} color="#64748b" />
              <Text style={styles.userInfo}>{`${profile.apartment} - ${profile.block}`}</Text>
            </View>

            <View style={styles.userLocationContainer}>
              <Home size={14} color="#64748b" />
              <Text style={styles.userInfo}>Condomínio Residencial Villa Real</Text>
            </View>

            <View style={styles.userBadge}>
              <Star size={12} color="#f59e0b" />
              <Text style={styles.userBadgeText}>{getUserTypeLabel(profile.userType)}</Text>
            </View>
          </Animatable.View>

          {/* Cards de Estatísticas */}
          <View style={styles.statsContainer}>
            <StatsCard 
              icon={Clock} 
              title="Tempo no Condomínio" 
              value="2 anos" 
              color="#10b981" 
            />
            <StatsCard 
              icon={Bell} 
              title="Notificações" 
              value="12" 
              color="#f59e0b" 
            />
          </View>

          {/* Seções com Acordeão */}
          <AccordionItem title="Informações Pessoais" icon={User} onEdit={() => setIsEditing(true)} isEditing={isEditing}>
            <View style={styles.infoItem}>
              <Mail color="#64748b" size={18} style={styles.infoItemIcon} />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemLabel}>Email</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={tempProfile.email}
                    onChangeText={(text) => setTempProfile(p => ({ ...p, email: text }))}
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.infoItemText}>{profile.email}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Phone color="#64748b" size={18} style={styles.infoItemIcon} />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemLabel}>Telefone</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={tempProfile.phone}
                    onChangeText={(text) => setTempProfile(p => ({ ...p, phone: text }))}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoItemText}>{profile.phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <Home color="#64748b" size={18} style={styles.infoItemIcon} />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemLabel}>Apartamento</Text>
                <Text style={styles.infoItemText}>{profile.apartment} - {profile.block}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Calendar color="#64748b" size={18} style={styles.infoItemIcon} />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemLabel}>Membro desde</Text>
                <Text style={styles.infoItemText}>Janeiro 2023</Text>
              </View>
            </View>

            {isEditing && (
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity style={[styles.editButton, styles.cancelButton]} onPress={handleCancelEdit}>
                  <Text style={[styles.editButtonText, styles.cancelButtonText]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editButton, styles.saveButton]} onPress={handleSaveProfile}>
                  <Text style={[styles.editButtonText, styles.saveButtonText]}>Salvar</Text>
                </TouchableOpacity>
              </View>
            )}
          </AccordionItem>

          <AccordionItem title="Preferências" icon={Settings}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceContent}>
                <Bell color="#64748b" size={18} />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Notificações Push</Text>
                  <Text style={styles.preferenceDescription}>Receber notificações no celular</Text>
                </View>
              </View>
              <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceContent}>
                <Eye color="#64748b" size={18} />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Perfil Privado</Text>
                  <Text style={styles.preferenceDescription}>Ocultar informações de outros moradores</Text>
                </View>
              </View>
              <Switch 
                value={privateProfile} 
                onValueChange={setPrivateProfile}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>

            <TouchableOpacity 
              style={styles.preferenceButton}
              onPress={() => setPasswordModalVisible(true)}
            >
              <View style={styles.preferenceContent}>
                <Shield color="#64748b" size={18} />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Alterar Senha</Text>
                  <Text style={styles.preferenceDescription}>Modificar senha de acesso</Text>
                </View>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
          </AccordionItem>

          <AccordionItem title="Documentos" icon={FileText} badge={profile.documents.length.toString()}>
            {profile.documents.map(doc => (
              <TouchableOpacity key={doc.id} style={styles.documentItem}>
                <View style={styles.documentIcon}>
                  <FileText size={20} color="#ef4444" />
                </View>
                <View style={styles.documentContent}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentCategory}>{doc.category}</Text>
                </View>
                <TouchableOpacity style={styles.documentAction}>
                  <ChevronRight size={16} color="#64748b" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </AccordionItem>

          {/* Lista de Ações */}
          <Animatable.View animation="fadeInUp" delay={200} style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Configurações da Conta</Text>
            {profileActions.map((action) => (
              <ActionButton key={action.label} {...action} />
            ))}
          </Animatable.View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Senha</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}><X color="#64748b" size={24} /></TouchableOpacity>
            </View>
            <Text style={{color: '#64748b', marginBottom: 16}}>Para sua segurança, informe a sua senha atual antes de definir uma nova.</Text>
            <TextInput style={styles.input} placeholder="Senha Atual" secureTextEntry />
            <TextInput style={styles.input} placeholder="Nova Senha" secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirmar Nova Senha" secureTextEntry />
            <TouchableOpacity style={[styles.editButton, styles.saveButton, {marginTop: 24, paddingVertical: 12}]} onPress={() => {setPasswordModalVisible(false); Toast.show({type: 'success', text1: 'Senha alterada com sucesso!'})}}>
              <Text style={[styles.editButtonText, styles.saveButtonText]}>Salvar Nova Senha</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
