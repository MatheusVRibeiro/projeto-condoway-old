import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { userProfile } from './mock';
import { useAuth } from '../../../contexts/AuthContext';
import { User, FileText, Settings, HelpCircle, LogOut, ChevronRight, Mail, Phone, ChevronDown, Camera, Edit, Save, X, Shield } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

// --- Componentes Internos ---

const AccordionItem = ({ title, icon: Icon, children, onEdit, isEditing }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionTrigger} onPress={() => setExpanded(!expanded)}>
        <View style={styles.accordionTitleContainer}>
          <Icon color="#2563eb" size={20} />
          <Text style={styles.accordionTitle}>{title}</Text>
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

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Você tem a certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Sair", onPress: logout, style: 'destructive' }
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

  const profileActions = [
    { label: 'Alterar Senha', icon: Shield, onPress: () => setPasswordModalVisible(true) },
    { label: 'Configurações', icon: Settings, onPress: () => navigation.navigate('Settings') },
    { label: 'Ajuda e Suporte', icon: HelpCircle, onPress: () => {} },
    { label: 'Sair da Conta', icon: LogOut, onPress: handleLogout, variant: 'destructive' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Animatable.View animation="fadeInDown" style={styles.profileHeader}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              <View style={styles.cameraIconOverlay}><Camera size={16} color="white" /></View>
            </TouchableOpacity>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userInfo}>{`${profile.apartment} - ${profile.block}`}</Text>
          </Animatable.View>

          <AccordionItem title="Meus Dados" icon={User} onEdit={() => setIsEditing(true)} isEditing={isEditing}>
            <View style={styles.infoItem}>
              <Mail color="#64748b" size={18} style={styles.infoItemIcon} />
              <Text style={styles.infoItemText}>{profile.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Phone color="#64748b" size={18} style={styles.infoItemIcon} />
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

          <AccordionItem title="Documentos" icon={FileText}>
            {profile.documents.map(doc => (
              <TouchableOpacity key={doc.id} style={styles.documentItem}>
                <View style={{flex: 1}}><Text style={{fontSize: 14, fontWeight: '600'}}>{doc.name}</Text><Text style={{fontSize: 12, color: '#64748b'}}>{doc.category}</Text></View>
                <ChevronRight color="#9ca3af" size={20} />
              </TouchableOpacity>
            ))}
          </AccordionItem>

          <Animatable.View animation="fadeInUp" delay={200} style={styles.actionsContainer}>
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
