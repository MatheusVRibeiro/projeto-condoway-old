import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, TextInput, Button, Platform, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { initialVisitors } from './mock';
import { ArrowLeft, UserPlus, User } from 'lucide-react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

const Visitantes = React.memo(function Visitantes() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('agendados');
  const [visitors, setVisitors] = useState(initialVisitors);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { scheduled, history } = useMemo(() => {
    const now = new Date();
    return {
      scheduled: visitors.filter(v => v.vst_data_saida === null && new Date(v.vst_data_visita) >= now),
      history: visitors.filter(v => v.vst_data_saida !== null || new Date(v.vst_data_visita) < now),
    };
  }, [visitors]);

  const isFormValid = useMemo(() => {
    return name.trim().length > 0 && document.trim().length >= 3;
  }, [name, document]);

  const handleAddVisitor = useCallback(async () => {
    if (!isFormValid) {
      Toast.show({ type: 'error', text1: 'Preencha o nome e o documento.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const newVisitor = {
        vst_id: Date.now(),
        vst_nome: name.trim(),
        vst_documento: document.trim(),
        vst_data_visita: date,
        vst_data_saida: null,
      };
      // insert at top
      setVisitors(prev => [newVisitor, ...prev]);
      setModalVisible(false);
      setName('');
      setDocument('');
      setDate(new Date());
      Toast.show({ type: 'success', text1: 'Visitante autorizado com sucesso!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao autorizar visitante.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, document, date, isFormValid]);

  const onDateChange = useCallback((event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  }, [date]);

  const VisitorCard = React.memo(({ item }) => (
    <View style={styles.visitorCard} accessible accessibilityRole="button" accessibilityLabel={`Visitante ${item.vst_nome}`}>
      <User size={32} color="#64748b" style={{ marginRight: 16 }} />
      <View style={styles.visitorInfo}>
        <Text style={styles.visitorName}>{item.vst_nome}</Text>
        <Text style={styles.visitorDocument}>{item.vst_documento}</Text>
        <Text style={styles.visitorDate}>
          {new Date(item.vst_data_visita).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
        </Text>
      </View>
    </View>
  ));

  const renderItem = useCallback(({ item }) => <VisitorCard item={item} />, []);

  const getItemLayout = useCallback((_, index) => ({ length: 80, offset: 80 * index, index }), []);

  const EmptyState = ({ tab }) => (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, color: '#475569' }}>{tab === 'agendados' ? 'Nenhum visitante agendado.' : 'Nenhum histórico de visitantes.'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestão de Visitantes</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'agendados' && styles.tabButtonActive]} onPress={() => setActiveTab('agendados')} accessibilityLabel="Mostrar agendados">
            <Text style={[styles.tabText, activeTab === 'agendados' && styles.tabTextActive]}>Agendados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'historico' && styles.tabButtonActive]} onPress={() => setActiveTab('historico')} accessibilityLabel="Mostrar histórico">
            <Text style={[styles.tabText, activeTab === 'historico' && styles.tabTextActive]}>Histórico</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={activeTab === 'agendados' ? scheduled : history}
          renderItem={renderItem}
          keyExtractor={item => item.vst_id.toString()}
          initialNumToRender={8}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={getItemLayout}
          ListEmptyComponent={<EmptyState tab={activeTab} />}
        />
      </View>
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} accessibilityLabel="Adicionar visitante">
        <UserPlus size={28} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Autorizar Novo Visitante</Text>
              <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} autoFocus={true} accessibilityLabel="Nome do visitante" />
              <TextInput style={styles.input} placeholder="Documento (RG/CPF)" value={document} onChangeText={setDocument} accessibilityLabel="Documento do visitante" />
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)} accessibilityLabel="Selecionar data da visita">
                <Text style={styles.dateButtonText}>
                  {`Data da Visita: ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR').slice(0,5)}`}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="datetime"
                  is24Hour={true}
                  display="default"
                  onChange={onDateChange}
                />
              )}
              <View style={styles.modalButtons}>
                <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#64748b" accessibilityLabel="Cancelar" />
                <TouchableOpacity onPress={handleAddVisitor} disabled={!isFormValid || isSubmitting} accessibilityLabel="Autorizar visitante" style={{ marginLeft: 8 }}>
                  {isSubmitting ? (
                    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                      <ActivityIndicator color="#2563eb" />
                    </View>
                  ) : (
                    <View>
                      <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Autorizar</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
});

export default Visitantes;
