import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../styles';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

export default function EditProfile() {
  const navigation = useNavigation();
  const [name, setName] = useState('Ana Clara Silva');
  const [email, setEmail] = useState('ana.silva@email.com');
  const [phone, setPhone] = useState('11999999999');
  const [loading, setLoading] = useState(false);

  const validatePhone = (value) => /^\d{10,11}$/.test(value);

  const handleSave = () => {
    if (!validatePhone(phone)) {
      Toast.show({ type: 'error', text1: 'Telefone inválido', text2: 'Digite um número válido com DDD.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.show({ type: 'success', text1: 'Dados atualizados com sucesso!' });
      navigation.goBack();
    }, 1200);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f8fafc' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.sectionContainer, { margin: 20, marginTop: 32 }]}>
        <Text style={styles.sectionTitle}>Editar Perfil</Text>
        <Text style={styles.infoItemLabel}>Nome Completo</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f1f5f9' }]}
          value={name}
          onChangeText={setName}
          editable={false}
        />
        <Text style={styles.infoItemLabel}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.infoItemLabel}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={11}
        />
        <TouchableOpacity
          style={[styles.editButton, styles.saveButton, { marginTop: 24, paddingVertical: 14, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[styles.editButtonText, styles.saveButtonText]}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
