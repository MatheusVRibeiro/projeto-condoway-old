import React, { useState, useMemo, useCallback } from 'react';
import useUser from '../../../hooks/useUser';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, TextInput, Button, Platform, ActivityIndicator, TouchableWithoutFeedback, Keyboard, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { initialVisitors } from './mock';
import { ArrowLeft, UserPlus, User, AlertTriangle } from 'lucide-react-native';
import VisitorCard from './VisitorCard';
import { SectionList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
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
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState('agendados');
  const [visitors, setVisitors] = useState(initialVisitors);
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [showPeriodStartPicker, setShowPeriodStartPicker] = useState(false);
  const [showPeriodEndPicker, setShowPeriodEndPicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmExitVisitor, setConfirmExitVisitor] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filtrar visitantes por ap_id e período (sem pesquisa por nome/documento)
  const filteredVisitors = useMemo(() => {
    if (!user) return [];
    let list = (user.user_tipo && user.user_tipo.toLowerCase() === 'sindico') ? visitors : visitors.filter(v => v.ap_id === user.ap_id);
    if (periodStart) list = list.filter(v => new Date(v.vst_data_visita) >= periodStart);
    if (periodEnd) list = list.filter(v => new Date(v.vst_data_visita) <= periodEnd);
    return list;
  }, [visitors, user, periodStart, periodEnd]);

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

  const isFormValid = useMemo(() => name.trim().length > 0 && document.trim().length >= 3, [name, document]);

  const handleAddVisitor = useCallback(async () => {
    if (!isFormValid) {
      Toast.show({ type: 'error', text1: 'Preencha o nome e o documento.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newVisitor = {
        vst_id: Date.now(),
        ap_id: user?.ap_id || null,
        vst_nome: name.trim(),
        vst_documento: document.trim(),
        vst_data_visita: date,
        vst_data_saida: null,
      };
      setVisitors(prev => [newVisitor, ...prev]);
      setModalVisible(false);
      setName(''); setDocument(''); setDate(new Date());
      Toast.show({ type: 'success', text1: 'Visitante autorizado com sucesso!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao autorizar visitante.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, document, date, isFormValid, user]);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestão de Visitantes</Text>
  {/* ...existing code... */}
      </View>

      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setShowPeriodStartPicker(true)} style={{ marginRight: 8 }}>
            <Text style={{ color: periodStart ? '#2563eb' : '#64748b', fontWeight: 'bold' }}>{periodStart ? new Date(periodStart).toLocaleDateString('pt-BR') : 'Início'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPeriodEndPicker(true)}>
            <Text style={{ color: periodEnd ? '#2563eb' : '#64748b', fontWeight: 'bold' }}>{periodEnd ? new Date(periodEnd).toLocaleDateString('pt-BR') : 'Fim'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Presentes: {presentesCount}</Text>
        </View>

        {showPeriodStartPicker && (
          <DateTimePicker testID="periodStartPicker" value={periodStart || new Date()} mode="date" is24Hour={true} display="default" onChange={(event, selectedDate) => { setShowPeriodStartPicker(Platform.OS === 'ios'); if (selectedDate) setPeriodStart(selectedDate); }} />
        )}
        {showPeriodEndPicker && (
          <DateTimePicker testID="periodEndPicker" value={periodEnd || new Date()} mode="date" is24Hour={true} display="default" onChange={(event, selectedDate) => { setShowPeriodEndPicker(Platform.OS === 'ios'); if (selectedDate) setPeriodEnd(selectedDate); }} />
        )}

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'agendados' && styles.tabButtonActive]} onPress={() => setActiveTab('agendados')} accessibilityLabel="Mostrar agendados"><Text style={[styles.tabText, activeTab === 'agendados' && styles.tabTextActive]}>Agendados</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'historico' && styles.tabButtonActive]} onPress={() => setActiveTab('historico')} accessibilityLabel="Mostrar histórico"><Text style={[styles.tabText, activeTab === 'historico' && styles.tabTextActive]}>Histórico</Text></TouchableOpacity>
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
            data && data.length ? (<View style={styles.sectionHeader}><Text style={styles.sectionHeaderText}>{title}</Text></View>) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}><User size={48} color="#94a3b8" /></View>
              <Text style={{ fontSize: 16, color: '#475569', marginBottom: 12 }}>{activeTab === 'agendados' ? 'Nenhum visitante agendado.' : 'Nenhum histórico de visitantes.'}</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 140 }}
        />

        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} accessibilityLabel="Adicionar visitante"><UserPlus size={28} color="white" /></TouchableOpacity>

        {/* Modal de edição */}
        <Modal animationType="fade" transparent={true} visible={!!editVisitor} onRequestClose={() => setEditVisitor(null)}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Editar Visitante</Text>
                <TextInput style={styles.input} placeholder="Nome Completo" value={editVisitor?.vst_nome || ''} onChangeText={nome => setEditVisitor(ev => ({ ...ev, vst_nome: nome }))} accessibilityLabel="Nome do visitante" />
                <TextInput style={styles.input} placeholder="Documento (RG/CPF)" value={editVisitor?.vst_documento || ''} onChangeText={doc => setEditVisitor(ev => ({ ...ev, vst_documento: doc }))} accessibilityLabel="Documento do visitante" />
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)} accessibilityLabel="Selecionar data da visita"><Text style={styles.dateButtonText}>{editVisitor?.vst_data_visita ? `Data da Visita: ${new Date(editVisitor.vst_data_visita).toLocaleDateString('pt-BR')} ${new Date(editVisitor.vst_data_visita).toLocaleTimeString('pt-BR').slice(0,5)}` : 'Selecionar data da visita'}</Text></TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker testID="dateTimePickerEdit" value={editVisitor?.vst_data_visita ? new Date(editVisitor.vst_data_visita) : new Date()} mode="datetime" is24Hour={true} display="default" onChange={(event, selectedDate) => { setShowDatePicker(Platform.OS === 'ios'); if (selectedDate) setEditVisitor(ev => ({ ...ev, vst_data_visita: selectedDate })); }} />
                )}
                <View style={styles.modalButtons}>
                  <Button title="Cancelar" onPress={() => setEditVisitor(null)} color="#64748b" accessibilityLabel="Cancelar edição" />
                  <TouchableOpacity onPress={() => { setVisitors(prev => prev.map(v => v.vst_id === editVisitor.vst_id ? { ...v, ...editVisitor } : v)); setEditVisitor(null); Toast.show({ type: 'success', text1: 'Visitante atualizado!' }); }} accessibilityLabel="Salvar edição" style={{ marginLeft: 8 }}><View><Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Salvar</Text></View></TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

  {/* Modal de autorização */}
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Autorizar Novo Visitante</Text>
                <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} autoFocus={true} accessibilityLabel="Nome do visitante" />
                <TextInput style={styles.input} placeholder="Documento (RG/CPF)" value={document} onChangeText={setDocument} accessibilityLabel="Documento do visitante" />
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)} accessibilityLabel="Selecionar data da visita"><Text style={styles.dateButtonText}>{`Data da Visita: ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR').slice(0,5)}`}</Text></TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker testID="dateTimePicker" value={date} mode="datetime" is24Hour={true} display="default" onChange={(event, selectedDate) => { setShowDatePicker(Platform.OS === 'ios'); if (selectedDate) setDate(selectedDate); }} />
                )}
                <View style={styles.modalButtons}>
                  <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#64748b" accessibilityLabel="Cancelar" />
                  <TouchableOpacity onPress={handleAddVisitor} disabled={!isFormValid || isSubmitting} accessibilityLabel="Autorizar visitante" style={{ marginLeft: 8 }}>
                    {isSubmitting ? (<View style={{ paddingHorizontal: 16, paddingVertical: 10 }}><ActivityIndicator color="#2563eb" /></View>) : (<View><Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Autorizar</Text></View>)}
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
              <View style={[styles.modalContent, { width: '90%', alignItems: 'center' }]}>
                <View style={{ backgroundColor: '#fff4f4', borderRadius: 40, padding: 12, marginBottom: 12 }}>
                  <AlertTriangle size={36} color="#b91c1c" />
                </View>
                <Text style={[styles.modalTitle, { marginBottom: 8 }]}>Confirmar saída</Text>
                <Text style={{ color: '#475569', marginBottom: 16, textAlign: 'center' }}>{`Deseja marcar a saída de${confirmVisitorData ? ' ' + confirmVisitorData.vst_nome : ' este visitante'}?`}</Text>
                {confirmVisitorData && <Text style={{ marginBottom: 8, fontWeight: '600' }}>{`Entrada: ${formatDateTime(confirmVisitorData.vst_data_visita)}`}</Text>}
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
                  <TouchableOpacity onPress={handleCancelExit} style={{ flex: 1, marginRight: 8, backgroundColor: '#e6e9ee', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#475569', fontWeight: '600' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmExit} style={{ flex: 1, marginLeft: 8, backgroundColor: '#ef4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
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
