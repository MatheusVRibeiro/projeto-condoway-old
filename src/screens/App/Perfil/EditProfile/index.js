import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Camera, Edit3, Save, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { useTheme } from '../../../../contexts/ThemeProvider';
import { useProfile } from '../../../../hooks/useProfile';
import Loading from '../../../../components/Loading';
import { 
  validateFullName, 
  validateEmail, 
  validatePhone, 
  validateRequired,
  formatPhone 
} from '../../../../utils/validation';

export default function EditProfile() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { 
    user, 
    profileData, 
    loading, 
    updateProfile, 
    uploadProfilePhoto,
    loadProfile 
  } = useProfile();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    apartment: '',
    block: '',
    condominium: '',
    avatarUrl: null,
    userType: 'morador'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Carrega dados do perfil quando disponível
  useEffect(() => {
    console.log('📦 [EditProfile] profileData recebido:', profileData);
    console.log('👤 [EditProfile] user recebido:', user);
    
    if (profileData) {
      console.log('✅ [EditProfile] Extraindo dados do profileData...');
      console.log('  - Apartamento:', profileData.apto_numero || profileData.ap_numero || 'não encontrado');
      console.log('  - Bloco:', profileData.bl_nome || profileData.bloc_nome || profileData.bloco_nome || 'não encontrado');
      console.log('  - Condomínio:', profileData.cond_nome || 'não encontrado');

      setProfile({
        name: profileData.user_nome || user?.user_nome || '',
        email: profileData.user_email || user?.user_email || '',
        phone: profileData.user_telefone || user?.user_telefone || '',
        apartment: profileData.apto_numero || profileData.ap_numero || '',
        block: profileData.bl_nome || profileData.bloc_nome || profileData.bloco_nome || '',
        condominium: profileData.cond_nome || '',
        avatarUrl: profileData.user_foto || user?.user_foto || null,
        userType: profileData.userap_tipo || 'morador'
      });
    } else if (user) {
      console.log('⚠️ [EditProfile] Sem profileData, usando dados do user');
      // Se não há profileData, usa os dados básicos do user
      setProfile(prev => ({
        ...prev,
        name: user.user_nome || '',
        email: user.user_email || '',
        phone: user.user_telefone || '',
        avatarUrl: user.user_foto || null,
      }));
    }
  }, [profileData, user]);

  const handleSave = async () => {
    const newErrors = {};

    // Validação de nome completo
    if (!validateRequired(profile.name)) {
      newErrors.name = 'Nome é obrigatório';
    } else if (!validateFullName(profile.name)) {
      newErrors.name = 'Digite seu nome completo (mínimo 2 partes)';
    }

    // Validação de e-mail
    if (!validateRequired(profile.email)) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(profile.email)) {
      newErrors.email = 'Digite um e-mail válido';
    }

    // Validação de telefone (se preenchido)
    if (profile.phone && !validatePhone(profile.phone)) {
      newErrors.phone = 'Telefone inválido. Use formato: (11) 98765-4321';
    }

    setErrors(newErrors);

    // Se houver erros, exibe o primeiro
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      Alert.alert('Erro de validação', firstError);
      return;
    }

    try {
      setIsSaving(true);
      
      const dadosAtualizados = {
        user_nome: profile.name,
        user_email: profile.email,
        user_telefone: profile.phone ? profile.phone.replace(/\D/g, '') : null,
      };

      await updateProfile(dadosAtualizados);
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setIsEditing(false);
      setEditingField(null);
      setErrors({});
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
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
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const fileUri = pickerResult.assets[0].uri;
      
      // Atualiza localmente primeiro para feedback visual imediato
      setProfile(prev => ({ ...prev, avatarUrl: fileUri }));
      
      try {
        // Faz upload para o servidor
        await uploadProfilePhoto(fileUri);
        Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
      } catch (error) {
        Alert.alert('Erro', error.message || 'Erro ao atualizar foto de perfil');
        // Reverte em caso de erro
        setProfile(prev => ({ 
          ...prev, 
          avatarUrl: profileData?.user_foto || user?.user_foto || null 
        }));
      }
    }
  };

  const updateField = (field, value) => {
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Formata telefone automaticamente
    if (field === 'phone') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 11) {
        value = formatPhone(numbers);
      }
    }

    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const ProfileField = ({ label, field, value, placeholder, keyboardType = 'default', multiline = false }) => (
    <Animatable.View animation="fadeInUp" duration={400} style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={[
        styles.fieldInputContainer, 
        { 
          backgroundColor: theme.colors.background, 
          borderColor: errors[field] ? '#dc2626' : theme.colors.border 
        }
      ]}>        
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline, { color: theme.colors.text }]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          onChangeText={(text) => updateField(field, text)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
        <TouchableOpacity style={styles.fieldEditButton} onPress={() => setEditingField(field)}>
          <Edit3 size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {errors[field] && (
        <Text style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
          {errors[field]}
        </Text>
      )}
    </Animatable.View>
  );

  if (loading && !profileData) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={400} style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>          
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.background }]}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Editar Perfil</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, { backgroundColor: theme.colors.primary + '22' }]}
            disabled={isSaving}
          >            
            <Save size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animatable.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
              {profile.avatarUrl ? (
                <Image 
                  source={{ uri: profile.avatarUrl }} 
                  style={[styles.avatar, { borderColor: theme.colors.card, shadowColor: theme.colors.primary }]} 
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary, borderColor: theme.colors.card }]}>
                  <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>
                    {profile.name.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={[styles.avatarOverlay, { backgroundColor: theme.colors.primary, borderColor: theme.colors.card, shadowColor: theme.colors.primary }]}>                
                <Camera size={24} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: theme.colors.textSecondary }]}>Toque para alterar foto</Text>
          </Animatable.View>

          {/* Personal Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              INFORMAÇÕES PESSOAIS
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>              
              <ProfileField label="Nome Completo" field="name" value={profile.name} placeholder="Digite seu nome completo" />
              <ProfileField label="E-mail" field="email" value={profile.email} placeholder="Digite seu e-mail" keyboardType="email-address" />
              <ProfileField label="Telefone" field="phone" value={profile.phone} placeholder="Digite seu telefone" keyboardType="phone-pad" />
            </View>
          </Animatable.View>

          {/* Address Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>LOCALIZAÇÃO</Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>              
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Condomínio</Text>
                <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.fieldInput, { color: theme.colors.textSecondary }]}>
                    {profile.condominium || 'Não informado'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Bloco</Text>
                <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.fieldInput, { color: theme.colors.textSecondary }]}>
                    {profile.block || 'Não informado'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Apartamento</Text>
                <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.fieldInput, { color: theme.colors.textSecondary }]}>
                    {profile.apartment || 'Não informado'}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.fieldHint, { color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }]}>
                Entre em contato com a administração para alterar dados da unidade
              </Text>
            </View>
          </Animatable.View>

          {/* Additional Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>OUTRAS INFORMAÇÕES</Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>              
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Tipo de Usuário</Text>
                <View style={[styles.userTypeContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>                  
                  <Text style={[styles.userTypeText, { color: theme.colors.text }]}>
                    {profile.userType === 'morador' ? 'Morador' : 
                     profile.userType === 'proprietario' ? 'Proprietário' :
                     profile.userType === 'sindico' ? 'Síndico' : 'Porteiro'}
                  </Text>
                  <Text style={[styles.userTypeHint, { color: theme.colors.textSecondary }]}>Entre em contato com a administração para alterar</Text>
                </View>
              </View>
            </View>
          </Animatable.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
