import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Camera, Edit3, Save, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { userProfile } from '../mock';

export default function EditProfile() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(userProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const handleSave = () => {
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    setIsEditing(false);
    setEditingField(null);
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
      setProfile(prev => ({ ...prev, avatarUrl: pickerResult.assets[0].uri }));
    }
  };

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const ProfileField = ({ label, field, value, placeholder, keyboardType = 'default', multiline = false }) => (
    <Animatable.View animation="fadeInUp" duration={400} style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputContainer}>
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          onChangeText={(text) => updateField(field, text)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
        <TouchableOpacity style={styles.fieldEditButton} onPress={() => setEditingField(field)}>
          <Edit3 size={16} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={400} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={20} color="#2563eb" />
          </TouchableOpacity>
        </Animatable.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
              <Image 
                source={typeof profile.avatarUrl === 'string' ? { uri: profile.avatarUrl } : profile.avatarUrl} 
                style={styles.avatar} 
              />
              <View style={styles.avatarOverlay}>
                <Camera size={24} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Toque para alterar foto</Text>
          </Animatable.View>

          {/* Personal Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
            <View style={styles.sectionContent}>
              <ProfileField
                label="Nome Completo"
                field="name"
                value={profile.name}
                placeholder="Digite seu nome completo"
              />
              <ProfileField
                label="E-mail"
                field="email"
                value={profile.email}
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
              />
              <ProfileField
                label="Telefone"
                field="phone"
                value={profile.phone}
                placeholder="Digite seu telefone"
                keyboardType="phone-pad"
              />
            </View>
          </Animatable.View>

          {/* Address Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
            <Text style={styles.sectionTitle}>LOCALIZAÇÃO</Text>
            <View style={styles.sectionContent}>
              <ProfileField
                label="Apartamento"
                field="apartment"
                value={profile.apartment}
                placeholder="Ex: Apto 72"
              />
              <ProfileField
                label="Bloco"
                field="block"
                value={profile.block}
                placeholder="Ex: Bloco B"
              />
              <ProfileField
                label="Condomínio"
                field="condominium"
                value={profile.condominium}
                placeholder="Nome do condomínio"
              />
            </View>
          </Animatable.View>

          {/* Additional Information */}
          <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.section}>
            <Text style={styles.sectionTitle}>OUTRAS INFORMAÇÕES</Text>
            <View style={styles.sectionContent}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Tipo de Usuário</Text>
                <View style={styles.userTypeContainer}>
                  <Text style={styles.userTypeText}>
                    {profile.userType === 'morador' ? 'Morador' : 
                     profile.userType === 'proprietario' ? 'Proprietário' :
                     profile.userType === 'sindico' ? 'Síndico' : 'Porteiro'}
                  </Text>
                  <Text style={styles.userTypeHint}>Entre em contato com a administração para alterar</Text>
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
