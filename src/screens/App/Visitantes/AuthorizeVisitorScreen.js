import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { User, FileText, Clock, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DateTime } from 'luxon';

import { useTheme } from '../../../contexts/ThemeProvider';
import { useAuth } from '../../../contexts/AuthContext';
import createStyles from './AuthorizeVisitorScreenStyles';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import { apiService } from '../../../services/api';
import { 
  validateFullName, 
  validateCPF, 
  formatCPF, 
  validateRequired 
} from '../../../utils/validation';

export default function AuthorizeVisitorScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const styles = createStyles(theme);
  // Estados do formulário
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const formatDocument = (text) => {
    const numbers = text.replace(/\D/g, '');
    // Formata CPF automaticamente
    if (numbers.length <= 11) {
      return formatCPF(numbers);
    }
    return numbers.substring(0, 20); // Limite de 20 caracteres conforme banco
  };

  const calculateEndDateTime = () => {
    const now = DateTime.local();
    // A partir de agora até 23:59 do mesmo dia
    return {
      start: now.toFormat('yyyy-MM-dd HH:mm:ss'),
      end: now.set({ hour: 23, minute: 59, second: 59 }).toFormat('yyyy-MM-dd HH:mm:ss')
    };
  };
  const handleGenerateInvite = async () => {
    const newErrors = {};

    // Validação de nome completo
    if (!validateRequired(name)) {
      newErrors.name = 'Nome é obrigatório';
    } else if (!validateFullName(name.trim())) {
      newErrors.name = 'Digite o nome completo (mínimo 2 partes, ex: João Silva)';
    } else if (name.trim().length > 60) {
      newErrors.name = 'O nome deve ter no máximo 60 caracteres';
    }

    // Validação de CPF (se informado)
    if (document) {
      const cleanDoc = document.replace(/\D/g, '');
      if (cleanDoc.length === 11) {
        // Validar CPF
        if (!validateCPF(document)) {
          newErrors.document = 'CPF inválido. Verifique os dígitos informados.';
        }
      } else if (cleanDoc.length < 8) {
        newErrors.document = 'Documento deve ter no mínimo 8 dígitos';
      }
    }

    setErrors(newErrors);

    // Se houver erros, exibe o primeiro
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      Alert.alert('Erro de validação', firstError);
      return;
    }

    const validity = calculateEndDateTime();
    
    // Validar se data fim é maior que data início
    const start = DateTime.fromSQL(validity.start);
    const end = DateTime.fromSQL(validity.end);
    
    if (end <= start) {
      Alert.alert('Datas Inválidas', 'A data/hora final deve ser posterior à data/hora inicial.');
      return;
    }
    
    // Dados para enviar à API conforme estrutura do banco
    const visitorData = {
      userap_id: user?.userap_id || user?.Userap_ID || user?.id, // ID do usuário autenticado
      vst_nome: name.trim(),
      vst_documento: document.replace(/\D/g, '') || null,
      vst_validade_inicio: validity.start,
      vst_validade_fim: validity.end,
      vst_status: 'Aguardando'
      // vst_qrcode_hash será gerado pelo backend
      // vst_data_entrada e vst_data_saida serão NULL até portaria registrar
    };

    console.log('📤 Enviando dados do visitante:', visitorData);
    
    setLoading(true);
    
    try {
      // Chama a API para criar autorização
      const response = await apiService.criarVisitante(visitorData);
      
      console.log('✅ Resposta da API (completa):', JSON.stringify(response, null, 2));
      
      // A API pode retornar: { dados: { vst_id, vst_qrcode_hash, ... } } ou direto os dados
      const dadosVisitante = response.dados || response.data || response;
      
      console.log('✅ Dados do visitante criado:', dadosVisitante);
      
      // Limpa os campos do formulário
      setName('');
      setDocument('');
      
      // Navega para tela de convite gerado
      navigation.navigate('InvitationGenerated', { 
        visitorName: name,
        qrCodeHash: dadosVisitante.vst_qrcode_hash,
        visitorId: dadosVisitante.vst_id,
        visitorData: dadosVisitante
      });
      
      // Exibe mensagem de sucesso (após navegação)
      // Alert.alert(
      //   'Sucesso! ✅',
      //   `Autorização criada para ${name}`
      // );
    } catch (error) {
      console.error('❌ Erro ao criar autorização:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível criar a autorização. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autorizar Visitante</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Formulário Simplificado */}
        <View style={styles.form}>
          {/* Dados do Visitante */}
          <Text style={styles.sectionTitle}>Dados do Visitante</Text>
          
          <FormField
            label="Nome Completo *"
            icon={User}
            placeholder="Ex: João da Silva"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={60}
            error={errors.name}
          />

          <FormField
            label="Documento (CPF/RG)"
            icon={FileText}
            placeholder="000.000.000-00 ou RG"
            value={document}
            onChangeText={(text) => setDocument(formatDocument(text))}
            keyboardType="numeric"
            maxLength={20}
            error={errors.document}
          />

          {/* Aviso simplificado */}
          <View style={styles.simpleAlert}>
            <Text style={styles.simpleAlertText}>
              💡 A portaria registrará automaticamente a entrada e saída do visitante ao escanear o QR Code.
            </Text>
          </View>
        </View>

        {/* Botão Principal */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Criando..." : "Gerar Autorização"}
            onPress={handleGenerateInvite}
            fullWidth
            disabled={loading}
          />
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={theme.colors.primary} 
              style={{ marginTop: 8 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}