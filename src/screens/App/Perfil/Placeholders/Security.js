import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { Shield, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function Security() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Segurança e Acesso</Text>

        <TouchableOpacity style={styles.preferenceButton} onPress={() => navigation.navigate('ChangePassword')}>
          <View style={styles.preferenceContent}>
            <Shield color="#64748b" size={18} />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Alterar Senha</Text>
              <Text style={styles.preferenceDescription}>Atualize sua senha</Text>
            </View>
          </View>
          <ChevronRight color="#9ca3af" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.preferenceButton, { marginTop: 8 }]} onPress={() => {/* placeholder for sessions */}}>
          <View style={styles.preferenceContent}>
            <Shield color="#64748b" size={18} />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Sessões Ativas</Text>
              <Text style={styles.preferenceDescription}>Revogar acessos de outros dispositivos</Text>
            </View>
          </View>
          <ChevronRight color="#9ca3af" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
