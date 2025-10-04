import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, FileText, Clock, ChevronLeft, CalendarDays } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DateTime } from 'luxon';

import { useTheme } from '../../../contexts/ThemeProvider';
import createStyles from './AuthorizeVisitorScreenStyles';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';

export default function AuthorizeVisitorScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  // Estados do formulário
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [validityType, setValidityType] = useState('today'); // 'today' ou 'custom'
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [selectedDays, setSelectedDays] = useState([]); // Dias da semana selecionados

  // Dias da semana
  const weekDays = [
    { key: 0, label: 'Dom' },
    { key: 1, label: 'Seg' },
    { key: 2, label: 'Ter' },
    { key: 3, label: 'Qua' },
    { key: 4, label: 'Qui' },
    { key: 5, label: 'Sex' },
    { key: 6, label: 'Sáb' },
  ];

  // Toggle dia da semana
  const toggleDay = (dayKey) => {
    setSelectedDays(prev => 
      prev.includes(dayKey) 
        ? prev.filter(d => d !== dayKey)
        : [...prev, dayKey]
    );
  };
  
  const formatDocument = (text) => {
    const numbers = text.replace(/\D/g, '');
    // Formata CPF se tiver 11 dígitos, senão deixa livre para RG
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numbers.substring(0, 20); // Limite de 20 caracteres conforme banco
  };

  const calculateEndDateTime = () => {
    const now = DateTime.local();
    
    if (validityType === 'today') {
      // A partir de agora até 23:59 do mesmo dia
      return {
        start: now.toFormat('yyyy-MM-dd HH:mm:ss'),
        end: now.set({ hour: 23, minute: 59, second: 59 }).toFormat('yyyy-MM-dd HH:mm:ss')
      };
    }
    
    if (validityType === 'custom') {
      // Valida se as datas foram preenchidas
      if (!startDate || !endDate) {
        throw new Error('Datas não preenchidas');
      }

      // Converte DD/MM/YYYY para formato SQL
      const [sDay, sMonth, sYear] = startDate.split('/');
      const [eDay, eMonth, eYear] = endDate.split('/');
      const [sHour, sMinute] = startTime.split(':');
      const [eHour, eMinute] = endTime.split(':');
      
      const start = DateTime.fromObject({
        year: parseInt(sYear),
        month: parseInt(sMonth),
        day: parseInt(sDay),
        hour: parseInt(sHour),
        minute: parseInt(sMinute),
        second: 0
      });
      
      const end = DateTime.fromObject({
        year: parseInt(eYear),
        month: parseInt(eMonth),
        day: parseInt(eDay),
        hour: parseInt(eHour),
        minute: parseInt(eMinute),
        second: 59
      });
      
      return {
        start: start.toFormat('yyyy-MM-dd HH:mm:ss'),
        end: end.toFormat('yyyy-MM-dd HH:mm:ss'),
        selectedDays: selectedDays.length > 0 ? selectedDays : null
      };
    }
    
    // Fallback para hoje
    return {
      start: now.toFormat('yyyy-MM-dd HH:mm:ss'),
      end: now.set({ hour: 23, minute: 59, second: 59 }).toFormat('yyyy-MM-dd HH:mm:ss')
    };
  };
  
  const handleGenerateInvite = () => {
    // Validações
    if (!name.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o nome do visitante.');
      return;
    }

    if (name.trim().length > 60) {
      Alert.alert('Nome muito longo', 'O nome deve ter no máximo 60 caracteres.');
      return;
    }

    if (document && document.replace(/\D/g, '').length < 8) {
      Alert.alert('Documento Inválido', 'Por favor, informe um documento válido.');
      return;
    }

    // Validação específica para período customizado
    if (validityType === 'custom') {
      if (!startDate || !endDate) {
        Alert.alert('Datas Obrigatórias', 'Por favor, selecione as datas de início e fim.');
        return;
      }
    }

    let validity;
    try {
      validity = calculateEndDateTime();
    } catch (error) {
      Alert.alert('Erro', error.message);
      return;
    }
    
    // Validar se data fim é maior que data início
    const start = DateTime.fromSQL(validity.start);
    const end = DateTime.fromSQL(validity.end);
    
    if (end <= start) {
      Alert.alert('Datas Inválidas', 'A data/hora final deve ser posterior à data/hora inicial.');
      return;
    }
    
    // Dados para enviar à API conforme estrutura do banco
    const visitorData = {
      // userap_id será preenchido pelo backend com base no usuário autenticado
      vst_nome: name.trim(),
      vst_documento: document.replace(/\D/g, '') || null,
      vst_validade_inicio: validity.start,
      vst_validade_fim: validity.end,
      // vst_qrcode_hash será gerado pelo backend
      vst_status: 'Aguardando',
      // Dias da semana selecionados (se houver)
      dias_semana: validity.selectedDays || null
      // vst_data_entrada e vst_data_saida serão NULL até portaria registrar
    };

    console.log('Dados do visitante:', visitorData);
    
    // TODO: Chamar API para criar autorização
    // api.post('/visitantes', visitorData)
    //   .then(response => {
    //     navigation.navigate('InvitationGenerated', { 
    //       visitorName: name,
    //       qrCodeHash: response.data.vst_qrcode_hash,
    //       visitorId: response.data.vst_id
    //     });
    //   })
    //   .catch(error => {
    //     Alert.alert('Erro', 'Não foi possível criar a autorização. Tente novamente.');
    //   });
    
    // Por enquanto, navegação direta
    navigation.navigate('InvitationGenerated', { 
      visitorName: name,
      visitorData 
    });
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
        {/* Formulário Compacto */}
        <View style={styles.form}>
          {/* Dados do Visitante - Compacto */}
          <Text style={styles.sectionTitle}>Dados do Visitante</Text>
          
          <FormField
            label="Nome Completo *"
            icon={User}
            placeholder="Ex: João da Silva"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={60}
          />

          <FormField
            label="Documento (CPF/RG)"
            icon={FileText}
            placeholder="000.000.000-00 ou RG"
            value={document}
            onChangeText={(text) => setDocument(formatDocument(text))}
            keyboardType="numeric"
            maxLength={20}
          />

          {/* Validade - Tabs Compactas */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Período de Validade</Text>
          
          <View style={styles.validityTabs}>
            <TouchableOpacity 
              style={[styles.validityTab, validityType === 'today' && styles.validityTabActive]}
              onPress={() => setValidityType('today')}
            >
              <Text style={[styles.validityTabText, validityType === 'today' && styles.validityTabTextActive]}>
                Apenas Hoje
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.validityTab, validityType === 'custom' && styles.validityTabActive]}
              onPress={() => setValidityType('custom')}
            >
              <Text style={[styles.validityTabText, validityType === 'custom' && styles.validityTabTextActive]}>
                Personalizado
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info da validade atual */}
          {validityType === 'today' && (
            <View style={styles.quickInfo}>
              <Text style={styles.quickInfoText}>
                ✓ Válido a partir de agora até 23:59 de hoje
              </Text>
            </View>
          )}

          {/* Período Customizado - Com Calendário */}
          {validityType === 'custom' && (
            <View style={styles.customPeriod}>
              {/* Data de Início */}
              <Text style={styles.compactLabel}>Data de Início *</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => {
                  Alert.alert('Seleção de Data', 'Insira a data no formato DD/MM/AAAA no campo abaixo');
                }}
              >
                <CalendarDays color={theme.colors.primary} size={20} />
                <Text style={[styles.datePickerText, startDate && styles.datePickerTextFilled]}>
                  {startDate || 'Selecione a data de início'}
                </Text>
              </TouchableOpacity>
              <FormField
                placeholder="DD/MM/AAAA"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numeric"
              />

              <View style={styles.compactRow}>
                <View style={styles.compactField}>
                  <Text style={styles.compactLabel}>Hora Início</Text>
                  <FormField
                    placeholder="08:00"
                    value={startTime}
                    onChangeText={setStartTime}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Data de Fim */}
              <Text style={[styles.compactLabel, { marginTop: 12 }]}>Data de Término *</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => {
                  Alert.alert('Seleção de Data', 'Insira a data no formato DD/MM/AAAA no campo abaixo');
                }}
              >
                <CalendarDays color={theme.colors.primary} size={20} />
                <Text style={[styles.datePickerText, endDate && styles.datePickerTextFilled]}>
                  {endDate || 'Selecione a data de término'}
                </Text>
              </TouchableOpacity>
              <FormField
                placeholder="DD/MM/AAAA"
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numeric"
              />

              <View style={styles.compactRow}>
                <View style={styles.compactField}>
                  <Text style={styles.compactLabel}>Hora Fim</Text>
                  <FormField
                    placeholder="23:59"
                    value={endTime}
                    onChangeText={setEndTime}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Seletores de Dias da Semana */}
              <Text style={styles.compactLabel}>Dias da Semana (Opcional)</Text>
              <View style={styles.weekDaysContainer}>
                {weekDays.map(day => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.key) && styles.dayButtonActive
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      selectedDays.includes(day.key) && styles.dayButtonTextActive
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.quickInfo}>
                <Text style={styles.quickInfoText}>
                  {selectedDays.length > 0 
                    ? `✓ Válido apenas nos dias selecionados`
                    : `ℹ️ Sem dias selecionados = válido todos os dias do período`
                  }
                </Text>
              </View>
            </View>
          )}

          {/* Aviso simplificado */}
          <View style={styles.simpleAlert}>
            <Text style={styles.simpleAlertText}>
              O QR Code valerá durante todo o período escolhido. A portaria registrará entrada e saída.
            </Text>
          </View>
        </View>

        {/* Botão Principal */}
        <View style={styles.buttonContainer}>
          <Button
            title="Gerar Autorização"
            onPress={handleGenerateInvite}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}
