import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, TextInput, Button, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { initialVisitors } from './mock';
import { ArrowLeft, UserPlus, User, FileBadge, Calendar as CalendarIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

const Visitantes = React.memo(function Visitantes() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('agendados');
  const [visitors, setVisitors] = useState(initialVisitors);
  const [modalVisible, setModalVisible] = useState(false);
  
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

  const handleAddVisitor = () => {
    if (!name || !document) {
      Toast.show({ type: 'error', text1: 'Preencha o nome e o documento.' });
      return;
    }
    const newVisitor = {
      vst_id: Date.now(),
      vst_nome: name,
      vst_documento: document,
      vst_data_visita: date,
      vst_data_saida: null,
    };
    setVisitors(prev => [newVisitor, ...prev]);
    setModalVisible(false);
    setName('');
    setDocument('');
    setDate(new Date());
    Toast.show({ type: 'success', text1: 'Visitante autorizado com sucesso!' });
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const VisitorCard = ({ item }) => (
    <View style={styles.visitorCard}>
      <User size={32} color="#64748b" style={{ marginRight: 16 }} />
      <View style={styles.visitorInfo}>
        <Text style={styles.visitorName}>{item.vst_nome}</Text>
        <Text style={styles.visitorDocument}>{item.vst_documento}</Text>
        <Text style={styles.visitorDate}>
          {new Date(item.vst_data_visita).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestão de Visitantes</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'agendados' && styles.tabButtonActive]} onPress={() => setActiveTab('agendados')}>
            <Text style={[styles.tabText, activeTab === 'agendados' && styles.tabTextActive]}>Agendados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'historico' && styles.tabButtonActive]} onPress={() => setActiveTab('historico')}>
            <Text style={[styles.tabText, activeTab === 'historico' && styles.tabTextActive]}>Histórico</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={activeTab === 'agendados' ? scheduled : history}
          renderItem={({ item }) => <VisitorCard item={item} />}
          keyExtractor={item => item.vst_id.toString()}
        />
      </View>
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <UserPlus size={28} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Autorizar Novo Visitante</Text>
            <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Documento (RG/CPF)" value={document} onChangeText={setDocument} />
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
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
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#64748b" />
              <Button title="Autorizar" onPress={handleAddVisitor} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

export default Visitantes;
