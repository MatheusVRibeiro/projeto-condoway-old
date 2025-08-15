import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { styles } from './styles';
import { environments, allExistingReservations, myInitialReservations } from './mock';
import { Calendar as CalendarIcon, Users, Building, ListChecks, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';

const EnvironmentCard = ({ env, onReserve, onDetails }) => (
  <View style={styles.environmentCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{env.name}</Text>
      <View style={{ backgroundColor: env.available ? '#dcfce7' : '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
        <Text style={{ color: env.available ? '#166534' : '#64748b', fontSize: 12, fontWeight: 'bold' }}>
          {env.available ? 'Disponível' : 'Indisponível'}
        </Text>
      </View>
    </View>
    <Text style={styles.cardDescription}>{env.description}</Text>
    <View style={styles.cardInfo}>
      <Users color="#475569" size={16} />
      <Text style={styles.cardInfoText}>Capacidade: {env.capacity} pessoas</Text>
    </View>
    <View style={styles.cardFooter}>
      <TouchableOpacity style={[styles.cardButton, styles.outlineButton]} onPress={onDetails}>
        <Text style={styles.buttonTextOutline}>Ver Detalhes</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.cardButton, styles.primaryButton, !env.available && styles.disabledButton]} 
        onPress={onReserve}
        disabled={!env.available}
      >
        <Text style={styles.buttonTextPrimary}>Solicitar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function Reservas() {
  const [activeTab, setActiveTab] = useState('reservar');
  const [myReservations, setMyReservations] = useState(myInitialReservations);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleOpenModal = (env) => {
    setSelectedEnvironment(env);
    setSelectedTime(null);
    setModalVisible(true);
  };

  const handleRequestReservation = () => {
    if (!selectedTime) {
      Toast.show({ type: 'error', text1: 'Por favor, selecione um horário.' });
      return;
    }
    const newReservation = {
      id: Date.now(),
      environmentName: selectedEnvironment.name,
      date: selectedDate,
      time: selectedTime,
      status: 'pendente'
    };
    setMyReservations(prev => [...prev, newReservation]);
    allExistingReservations.push(newReservation);
    setModalVisible(false);
    Toast.show({ type: 'success', text1: 'Solicitação de reserva enviada!' });
  };

  const handleCancelReservation = (id) => {
    Alert.alert(
      "Cancelar Reserva",
      "Você tem certeza que deseja cancelar esta reserva?",
      [
        { text: "Voltar", style: "cancel" },
        { 
          text: "Sim, cancelar", 
          onPress: () => {
            setMyReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelada' } : r));
            Toast.show({ type: 'info', text1: 'Reserva cancelada.' });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pendente': return { backgroundColor: '#fef9c3', color: '#a16207' };
      case 'confirmada': return { backgroundColor: '#dcfce7', color: '#166534' };
      default: return { backgroundColor: '#fee2e2', color: '#991b1b' };
    }
  };

  const TimeSlotPicker = () => {
    const allSlots = Array.from({ length: 15 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
    const reservedSlots = allExistingReservations
      .filter(r => r.environmentName === selectedEnvironment?.name && r.date === selectedDate && r.status !== 'cancelada')
      .map(r => r.time);

    return (
      <View>
        <Text style={styles.modalSubtitle}>Escolha um horário disponível</Text>
        <View style={styles.timeSlotGrid}>
          {allSlots.map(slot => {
            const isReserved = reservedSlots.includes(slot);
            const isSelected = selectedTime === slot;
            const status = isReserved ? 'reserved' : (isSelected ? 'selected' : 'available');
            return (
              <TouchableOpacity
                key={slot}
                disabled={isReserved}
                onPress={() => setSelectedTime(slot)}
                style={[
                  styles.timeSlotButton,
                  styles[`timeSlot${status.charAt(0).toUpperCase() + status.slice(1)}`]
                ]}
              >
                <Text style={styles[`timeSlotText${status.charAt(0).toUpperCase() + status.slice(1)}`]}>{slot}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Building color="#2563eb" size={28} />
              <Text style={styles.headerTitleText}>Reservas</Text>
            </View>
            <Text style={styles.headerSubtitle}>Solicite um espaço ou gerencie as suas reservas.</Text>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'reservar' && styles.tabButtonActive]}
              onPress={() => setActiveTab('reservar')}
            >
              <Text style={[styles.tabText, activeTab === 'reservar' && styles.tabTextActive]}>Reservar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'minhas' && styles.tabButtonActive]}
              onPress={() => setActiveTab('minhas')}
            >
              <Text style={[styles.tabText, activeTab === 'minhas' && styles.tabTextActive]}>Minhas Reservas</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'reservar' ? (
            <View>
              {environments.map(env => (
                <EnvironmentCard 
                  key={env.id} 
                  env={env} 
                  onReserve={() => handleOpenModal(env)}
                  onDetails={() => Alert.alert("Detalhes", env.rules.join("\n"))}
                />
              ))}
            </View>
          ) : (
            <View>
              {myReservations.map(res => {
                const statusStyle = getStatusStyle(res.status);
                const isExpanded = expandedId === res.id;
                return (
                  <View key={res.id} style={styles.accordionItem}>
                    <TouchableOpacity style={styles.accordionTrigger} onPress={() => setExpandedId(isExpanded ? null : res.id)}>
                      <View style={styles.triggerLeft}>
                        <Text style={styles.accordionTitle}>{res.environmentName}</Text>
                        <Text style={styles.accordionSubtitle}>{new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                        <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{res.status}</Text>
                      </View>
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.accordionContent}>
                        <View style={styles.detailRow}>
                          <Clock size={16} color="#475569" />
                          <Text style={styles.detailText}>Horário: {res.time}</Text>
                        </View>
                        {res.status !== 'cancelada' && (
                          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelReservation(res.id)}>
                            <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar {selectedEnvironment?.name}</Text>
              <Text style={styles.modalSubtitle}>Selecione o dia e depois o horário desejado.</Text>
            </View>
            <Calendar
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: '#2563eb' } }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                todayTextColor: '#2563eb',
                arrowColor: '#2563eb',
              }}
            />
            <TimeSlotPicker />
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.cardButton, styles.primaryButton]} onPress={handleRequestReservation}>
                <Text style={styles.buttonTextPrimary}>Confirmar Solicitação</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
