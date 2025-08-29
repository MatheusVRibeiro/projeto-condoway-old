import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../styles';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

export default function ChangePassword() {
  const navigation = useNavigation();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = () => {
    if (!current || !newPass || !confirm) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos.' });
      return;
    }
    if (newPass !== confirm) {
      Toast.show({ type: 'error', text1: 'As senhas não coincidem.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.show({ type: 'success', text1: 'Senha alterada com sucesso!' });
      navigation.goBack();
    }, 1200);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f8fafc' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.sectionContainer, { margin: 20, marginTop: 32 }]}>  
        <Text style={styles.sectionTitle}>Alterar Senha</Text>
        <Text style={styles.infoItemLabel}>Senha Atual</Text>
        <TextInput
          style={styles.input}
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
        />
        <Text style={styles.infoItemLabel}>Nova Senha</Text>
        <TextInput
          style={styles.input}
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry
        />
        <Text style={styles.infoItemLabel}>Confirmar Nova Senha</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.editButton, styles.saveButton, { marginTop: 24, paddingVertical: 14, opacity: loading ? 0.7 : 1 }]}
          onPress={handleChange}
          disabled={loading}
        >
          <Text style={[styles.editButtonText, styles.saveButtonText]}>Confirmar Alteração</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
