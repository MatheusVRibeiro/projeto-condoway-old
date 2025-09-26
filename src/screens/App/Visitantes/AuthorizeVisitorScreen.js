import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Calendar, ArrowLeft, User, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../../contexts/ThemeProvider';
import createStyles from './AuthorizeVisitorScreenStyles';
import FormField from '../../../components/FormField'; // Usando FormField que já parece existir
import Button from '../../../components/Button'; // Usando o Button que já existe

const ValidityOption = ({ label, selected, onPress, theme }) => {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      style={[
        styles.validityOption,
        selected ? styles.validityOptionSelected : styles.validityOptionUnselected
      ]}
      onPress={onPress}
    >
      <Text style={[styles.validityText, selected ? styles.validityTextSelected : styles.validityTextUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function AuthorizeVisitorScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [validity, setValidity] = useState('today'); // 'today', 'weekend', 'period'
  
  const handleGenerateInvite = () => {
    if (!name.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o nome do visitante.');
      return;
    }
    
    // Navegar para a tela de convite gerado
    navigation.navigate('InvitationGenerated', { visitorName: name });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Autorizar Novo Visitante</Text>
      </View>

      {/* Formulário */}
      <View style={styles.form}>
        <FormField
          label="Nome do Visitante"
          icon={User}
          placeholder="Digite o nome completo"
          value={name}
          onChangeText={setName}
        />
        <FormField
          label="Documento (CPF/RG)"
          icon={FileText}
          placeholder="Opcional"
          value={document}
          onChangeText={setDocument}
          keyboardType="numeric"
        />

        <View style={styles.section}>
          <Calendar color={theme.colors.textSecondary} size={20} />
          <Text style={styles.sectionTitle}>Validade da Autorização</Text>
        </View>

        <View style={styles.validityContainer}>
          <ValidityOption label="Apenas hoje" selected={validity === 'today'} onPress={() => setValidity('today')} theme={theme} />
          <ValidityOption label="Fim de semana" selected={validity === 'weekend'} onPress={() => setValidity('weekend')} theme={theme} />
          <ValidityOption label="Período específico" selected={validity === 'period'} onPress={() => setValidity('period')} theme={theme} />
        </View>
        
        {validity === 'period' && (
          <View style={styles.dateRangeContainer}>
            <Text style={{color: theme.colors.textSecondary}}>Seletor de data de início e fim apareceria aqui.</Text>
          </View>
        )}
      </View>

      {/* Botão Principal */}
      <View style={styles.buttonContainer}>
        <Button
          title="Gerar Convite com QR Code"
          onPress={handleGenerateInvite}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}
