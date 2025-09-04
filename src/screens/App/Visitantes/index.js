import React, { useState, useMemo, useCallback } from 'react';
import useUser from '../../../hooks/useUser';
import { useTheme } from '../../../contexts/ThemeProvider';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, TextInput, Button, Platform, ActivityIndicator, TouchableWithoutFeedback, Keyboard, RefreshControl, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { initialVisitors } from './mock';
import { ArrowLeft, UserPlus, User, AlertTriangle, Building, MessageSquare, Briefcase, Home, Users } from 'lucide-react-native';
import VisitorCard from './VisitorCard';
import { SectionList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('pt-BR', { 
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateOnly(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function diffHuman(entradaDate, saidaDate) {
  if (!entradaDate || !saidaDate) return null;
  const diffMs = new Date(saidaDate) - new Date(entradaDate);
  if (diffMs < 0) return null;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours ? hours + 'h ' : ''}${mins ? mins + 'min' : '0min'}`;
}

export default function Visitantes() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user: authUser } = useUser();
  
  // Para desenvolvimento, usar dados padrão se não houver usuário autenticado
  const user = authUser || { ap_id: 101, user_tipo: 'morador' };

  const [activeTab, setActiveTab] = useState('agendados');
  const [visitors, setVisitors] = useState(initialVisitors);

  const [modalVisible, setModalVisible] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmExitVisitor, setConfirmExitVisitor] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [visitorType, setVisitorType] = useState('Visitante');
  const [company, setCompany] = useState('');
  const [observation, setObservation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filtrar visitantes por ap_id (sem pesquisa por nome/documento ou período)
  const filteredVisitors = useMemo(() => {
    if (!user) return [];
    
    let list = visitors;
    
    // Se não for síndico, filtrar por apartamento
    if (!user.user_tipo || user.user_tipo.toLowerCase() !== 'sindico') {
      if (user.ap_id) {
        list = visitors.filter(v => v.ap_id === user.ap_id);
      }
    }
    
    return list;
  }, [visitors, user]);

  const { scheduled, history } = useMemo(() => {
    const now = new Date();
    return {
      scheduled: filteredVisitors.filter(v => !v.vst_data_saida && new Date(v.vst_data_visita) >= now),
      history: filteredVisitors.filter(v => v.vst_data_saida || new Date(v.vst_data_visita) < now),
    };
  }, [filteredVisitors]);

  // Agrupar em Hoje / Esta semana / Outros para melhor UX
  const groupByDayWeek = useCallback((list) => {
    const today = [];
    const week = [];
    const older = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    list.forEach(v => {
      const d = new Date(v.vst_data_visita);
      if (d >= startOfToday) today.push(v);
      else if (d >= startOfWeek) week.push(v);
      else older.push(v);
    });
    return { today, week, older };
  }, []);

  const { scheduledGroups, historyGroups } = useMemo(() => ({
    scheduledGroups: groupByDayWeek(scheduled),
    historyGroups: groupByDayWeek(history),
  }), [scheduled, history, groupByDayWeek]);

  const confirmVisitorData = useMemo(() => {
    if (!confirmExitVisitor) return null;
    return visitors.find(v => v.vst_id === confirmExitVisitor) || null;
  }, [confirmExitVisitor, visitors]);

  const presentesCount = useMemo(() => filteredVisitors.filter(v => !v.vst_data_saida).length, [filteredVisitors]);

  const isFormValid = useMemo(() => 
    name.trim().length > 0 && document.trim().length >= 3 &&
    (visitorType !== 'Prestador' || company.trim().length > 0), 
  [name, document, visitorType, company]);

  const handleAddVisitor = useCallback(async () => {
    if (!isFormValid) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newVisitor = {
        vst_id: Date.now(),
        ap_id: user?.ap_id || 101,
        vst_nome: name.trim(),
        vst_documento: document.trim(),
        vst_tipo: visitorType,
        vst_empresa: company.trim(),
        vst_observacao: observation.trim(),
        vst_data_visita: date,
        vst_data_saida: null,
      };
      setVisitors(prev => [newVisitor, ...prev]);
      setModalVisible(false);
      // Reset form
      setName(''); setDocument(''); setVisitorType('Visitante'); 
      setCompany(''); setObservation(''); setDate(new Date());
      Toast.show({ type: 'success', text1: 'Visitante autorizado com sucesso!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao autorizar visitante.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, document, visitorType, company, observation, date, isFormValid, user]);

  // Ask for confirmation before marking exit (better UX)
  const handleMarkExit = useCallback((id) => {
    setConfirmExitVisitor(id);
  }, []);

  const handleConfirmExit = useCallback(() => {
    if (!confirmExitVisitor) return;
    setVisitors(prev => prev.map(v => v.vst_id === confirmExitVisitor ? { ...v, vst_data_saida: new Date() } : v));
    setConfirmExitVisitor(null);
    Toast.show({ type: 'success', text1: 'Saída registrada!' });
  }, [confirmExitVisitor]);

  const handleCancelExit = useCallback(() => setConfirmExitVisitor(null), []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - adapt to your backend if needed
    setTimeout(() => {
      setVisitors(initialVisitors);
      setRefreshing(false);
      Toast.show({ type: 'success', text1: 'Lista atualizada' });
    }, 600);
  }, []);

  // CSV export removed per request; keep UI focused and simpler

  const renderItem = useCallback(({ item }) => <VisitorCard item={item} onMarkExit={handleMarkExit} onEdit={setEditVisitor} />, [handleMarkExit]);
  const getItemLayout = useCallback((_, index) => ({ length: 100, offset: 100 * index, index }), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>        
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Gestão de Visitantes</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'agendados' && [styles.tabButtonActive, { backgroundColor: theme.colors.primary }]]} onPress={() => setActiveTab('agendados')} accessibilityLabel="Mostrar agendados"><Text style={[styles.tabText, { color: activeTab === 'agendados' ? '#fff' : theme.colors.textSecondary }]}>Agendados</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'historico' && [styles.tabButtonActive, { backgroundColor: theme.colors.primary }]]} onPress={() => setActiveTab('historico')} accessibilityLabel="Mostrar histórico"><Text style={[styles.tabText, { color: activeTab === 'historico' ? '#fff' : theme.colors.textSecondary }]}>Histórico</Text></TouchableOpacity>
        </View>

        {/* Status dos visitantes presentes */}
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: theme.colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>Status Atual</Text>
            <View style={{ backgroundColor: theme.colors.success + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: theme.colors.success, fontWeight: '700', fontSize: 14 }}>Presentes: {presentesCount}</Text>
            </View>
          </View>
        </View>

        {/* Render grouped sections with SectionList for performance */}
        <SectionList
          sections={activeTab === 'agendados' ? [
            { title: `Hoje (${scheduledGroups.today.length})`, data: scheduledGroups.today },
            { title: `Esta semana (${scheduledGroups.week.length})`, data: scheduledGroups.week },
            { title: `Outros (${scheduledGroups.older.length})`, data: scheduledGroups.older },
          ] : [
            { title: `Hoje (${historyGroups.today.length})`, data: historyGroups.today },
            { title: `Esta semana (${historyGroups.week.length})`, data: historyGroups.week },
            { title: `Outros (${historyGroups.older.length})`, data: historyGroups.older },
          ]}
          keyExtractor={(item) => item.vst_id.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title, data } }) => (
            data && data.length ? (<View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}><Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>{title}</Text></View>) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}><User size={48} color={theme.colors.textSecondary} /></View>
              <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginBottom: 12 }}>
                {activeTab === 'agendados' ? 'Nenhum visitante agendado.' : 'Nenhum histórico de visitantes.'}
              </Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 140 }}
        />

        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} onPress={() => setModalVisible(true)} accessibilityLabel="Adicionar visitante"><UserPlus size={28} color="white" /></TouchableOpacity>

        {/* Modal de edição */}
        <Modal animationType="fade" transparent={true} visible={!!editVisitor} onRequestClose={() => setEditVisitor(null)}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}>                
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Editar Visitante</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Nome Completo" placeholderTextColor={theme.colors.textSecondary} value={editVisitor?.vst_nome || ''} onChangeText={nome => setEditVisitor(ev => ({ ...ev, vst_nome: nome }))} accessibilityLabel="Nome do visitante" />
                <TextInput style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Documento (RG/CPF)" placeholderTextColor={theme.colors.textSecondary} value={editVisitor?.vst_documento || ''} onChangeText={doc => setEditVisitor(ev => ({ ...ev, vst_documento: doc }))} accessibilityLabel="Documento do visitante" />
                <TouchableOpacity style={[styles.dateButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={() => setShowDatePicker(true)} accessibilityLabel="Selecionar data da visita"><Text style={[styles.dateButtonText, { color: theme.colors.textSecondary }]}>{editVisitor?.vst_data_visita ? `Data da Visita: ${new Date(editVisitor.vst_data_visita).toLocaleDateString('pt-BR')} ${new Date(editVisitor.vst_data_visita).toLocaleTimeString('pt-BR').slice(0,5)}` : 'Selecionar data da visita'}</Text></TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePickerEdit"
                    value={editVisitor?.vst_data_visita ? new Date(editVisitor.vst_data_visita) : new Date()}
                    mode="datetime"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'default' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') { setShowDatePicker(false); }
                      if (event.type === 'set' && selectedDate) {
                        setEditVisitor(ev => ({ ...ev, vst_data_visita: selectedDate }));
                        if (Platform.OS === 'ios') { setShowDatePicker(false); }
                      } else if (event.type === 'dismissed') { setShowDatePicker(false); }
                    }}
                  />
                )}
                <View style={styles.modalButtons}>
                  <Button title="Cancelar" onPress={() => setEditVisitor(null)} color={theme.colors.textSecondary} accessibilityLabel="Cancelar edição" />
                  <TouchableOpacity onPress={() => { setVisitors(prev => prev.map(v => v.vst_id === editVisitor.vst_id ? { ...v, ...editVisitor } : v)); setEditVisitor(null); Toast.show({ type: 'success', text1: 'Visitante atualizado!' }); }} accessibilityLabel="Salvar edição" style={{ marginLeft: 8 }}><View><Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Salvar</Text></View></TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal de autorização */}
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Autorizar Novo Visitante</Text>
                
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                  {/* Nome */}
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}             
                    placeholder="Nome Completo"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoFocus={true}
                    accessibilityLabel="Nome do visitante"
                  />
                  
                  {/* Documento */}
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}             
                    placeholder="Documento (RG/CPF)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={document}
                    onChangeText={setDocument}
                    accessibilityLabel="Documento do visitante"
                  />
                  
                  {/* Tipo de Visitante */}
                  <View style={styles.selectorContainer}>
                    <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Tipo de Visitante:</Text>
                    <View style={styles.typeSelector}>
                      {['Visitante', 'Hospede', 'Prestador'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[styles.typeOption, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }, visitorType === type && [styles.typeOptionActive, { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary }]]}
                          onPress={() => setVisitorType(type)}
                        >
                          {type === 'Prestador' && <Briefcase size={16} color={visitorType === type ? theme.colors.error : theme.colors.textSecondary} />}
                          {type === 'Hospede' && <Home size={16} color={visitorType === type ? '#8b5cf6' : theme.colors.textSecondary} />}
                          {type === 'Visitante' && <Users size={16} color={visitorType === type ? theme.colors.success : theme.colors.textSecondary} />}
                          <Text style={[styles.typeOptionText, { color: theme.colors.textSecondary }, visitorType === type && { color: theme.colors.text, fontWeight: '700' }]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  {/* Empresa (obrigatório para Prestador) */}
                  {(visitorType === 'Prestador' || company.length > 0) && (
                    <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>                      
                      <Building size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent', color: theme.colors.text }]}             
                        placeholder={visitorType === 'Prestador' ? 'Nome da empresa *' : 'Nome da empresa (opcional)'}
                        placeholderTextColor={theme.colors.textSecondary}
                        value={company}
                        onChangeText={setCompany}
                        accessibilityLabel="Empresa"
                      />
                    </View>
                  )}
                  
                  {/* Data e Hora */}
                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}             
                    onPress={() => setShowDatePicker(true)}
                    accessibilityLabel="Selecionar data da visita"
                  >
                    <Text style={[styles.dateButtonText, { color: theme.colors.textSecondary }]}> {`Data da Visita: ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR').slice(0, 5)}`}</Text>
                  </TouchableOpacity>
                  
                  {/* Observações */}
                  <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>                    
                    <MessageSquare size={16} color={theme.colors.textSecondary} style={{ marginRight: 8, alignSelf: 'flex-start', marginTop: 8 }} />
                    <TextInput
                      style={[styles.input, { flex: 1, minHeight: 80, textAlignVertical: 'top', marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent', color: theme.colors.text }]}             
                      placeholder="Observações (placa do carro, motivo da visita, etc.)"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={observation}
                      onChangeText={setObservation}
                      multiline={true}
                      numberOfLines={3}
                      accessibilityLabel="Observações"
                    />
                  </View>
                </ScrollView>
                
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="datetime"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'default' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') { setShowDatePicker(false); }
                      if (event.type === 'set' && selectedDate) {
                        setDate(selectedDate);
                        if (Platform.OS === 'ios') { setShowDatePicker(false); }
                      } else if (event.type === 'dismissed') { setShowDatePicker(false); }
                    }}
                  />
                )}
                
                <View style={styles.modalButtons}>
                  <Button title="Cancelar" onPress={() => setModalVisible(false)} color={theme.colors.textSecondary} accessibilityLabel="Cancelar" />
                  <TouchableOpacity onPress={handleAddVisitor} disabled={!isFormValid || isSubmitting} accessibilityLabel="Autorizar visitante" style={{ marginLeft: 8 }}>
                    {isSubmitting ? (
                      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                        <ActivityIndicator color={theme.colors.primary} />
                      </View>
                    ) : (
                      <View style={[styles.submitButton, { backgroundColor: isFormValid ? theme.colors.primary : theme.colors.border }, !isFormValid && styles.submitButtonDisabled]}>
                        <Text style={{ color: isFormValid ? '#ffffff' : theme.colors.textSecondary, fontWeight: '700' }}>Autorizar</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal de confirmação de saída (melhor UX) */}
        <Modal animationType="slide" transparent={true} visible={!!confirmExitVisitor} onRequestClose={handleCancelExit}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}>
              <View style={[styles.modalContent, { width: '90%', alignItems: 'center', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}>                
                <View style={{ backgroundColor: theme.colors.error + '22', borderRadius: 40, padding: 12, marginBottom: 12 }}>
                  <AlertTriangle size={36} color={theme.colors.error} />
                </View>
                <Text style={[styles.modalTitle, { marginBottom: 8, color: theme.colors.text }]}>Confirmar saída</Text>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 16, textAlign: 'center' }}>{`Deseja marcar a saída de${confirmVisitorData ? ' ' + confirmVisitorData.vst_nome : ' este visitante'}?`}</Text>
                {confirmVisitorData && <Text style={{ marginBottom: 8, fontWeight: '600', color: theme.colors.text }}>{`Entrada: ${formatDateTime(confirmVisitorData.vst_data_visita)}`}</Text>}
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
                  <TouchableOpacity onPress={handleCancelExit} style={{ flex: 1, marginRight: 8, backgroundColor: theme.colors.background, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmExit} style={{ flex: 1, marginLeft: 8, backgroundColor: theme.colors.error, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar saída</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
