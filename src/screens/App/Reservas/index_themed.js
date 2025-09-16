import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../contexts/ThemeProvider';
import { styles } from './styles';
import { environments, allExistingReservations, myInitialReservations } from './mock';
import { Calendar as CalendarIcon, Users, Building, ListChecks, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';

const EnvironmentCard = React.memo(({ env, onReserve, onDetails, theme }) => (
  <View style={[styles.environmentCard, { backgroundColor: theme.colors.card }]} accessible accessibilityRole="button" accessibilityLabel={`Ambiente ${env.name}`}>
    <View style={styles.cardHeader}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{env.name}</Text>
      <View style={{ backgroundColor: env.available ? '#dcfce7' : theme.colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
        <Text style={{ color: env.available ? '#166534' : theme.colors.textSecondary, fontSize: 12, fontWeight: 'bold' }}>
          {env.available ? 'Disponível' : 'Indisponível'}
        </Text>
      </View>
    </View>
    <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>{env.description}</Text>
    <View style={styles.cardInfo}>
      <Users color={theme.colors.textSecondary} size={16} />
      <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>Capacidade: {env.capacity} pessoas</Text>
    </View>
    <View style={styles.cardFooter}>
      <TouchableOpacity style={[styles.cardButton, styles.outlineButton, { borderColor: theme.colors.border }]} onPress={onDetails} accessibilityLabel={`Ver detalhes de ${env.name}`}>
        <Text style={[styles.buttonTextOutline, { color: theme.colors.text }]}>Ver Detalhes</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.cardButton, styles.primaryButton, { backgroundColor: theme.colors.primary }, !env.available && styles.disabledButton]} 
        onPress={onReserve}
        disabled={!env.available}
        accessibilityLabel={`Solicitar ${env.name}`}
      >
        <Text style={styles.buttonTextPrimary}>Solicitar</Text>
      </TouchableOpacity>
    </View>
  </View>
));

export default function Reservas() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('reservar');
  const [myReservations, setMyReservations] = useState(myInitialReservations);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = useCallback((env) => {
    setSelectedEnvironment(env);
    setSelectedTime(null);
    setModalVisible(true);
  }, []);

  const handleRequestReservation = useCallback(() => {
    if (!selectedTime) {
      Toast.show({ type: 'error', text1: 'Por favor, selecione um horário.' });
      return;
    }
    try {
      setIsSubmitting(true);
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
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao solicitar reserva.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTime, selectedEnvironment, selectedDate]);

  const handleCancelReservation = useCallback((id) => {
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
  }, []);

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
        <Text style={[styles.modalSubtitle, { color: theme.colors.text }]}>Escolha um horário disponível</Text>
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
                  { backgroundColor: isSelected ? theme.colors.primary : theme.colors.card },
                  { borderColor: theme.colors.border },
                  isReserved && { backgroundColor: theme.colors.border }
                ]}
              >
                <Text style={[
                  styles.timeSlotText,
                  { color: isSelected ? '#ffffff' : theme.colors.text },
                  isReserved && { color: theme.colors.textSecondary }
                ]}>{slot}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Building color={theme.colors.primary} size={28} />
              <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>Reservas</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Solicite um espaço ou gerencie as suas reservas.</Text>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton, 
                { borderColor: theme.colors.border },
                activeTab === 'reservar' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('reservar')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'reservar' ? '#ffffff' : theme.colors.text }
              ]}>Reservar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                { borderColor: theme.colors.border },
                activeTab === 'minhas' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('minhas')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'minhas' ? '#ffffff' : theme.colors.text }
              ]}>Minhas Reservas</Text>
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
                  theme={theme}
                />
              ))}
            </View>
          ) : (
            <View>
              {myReservations.map(res => {
                const statusStyle = getStatusStyle(res.status);
                const isExpanded = expandedId === res.id;
                return (
                  <View key={res.id} style={[styles.accordionItem, { backgroundColor: theme.colors.card }]}>
                    <TouchableOpacity style={styles.accordionTrigger} onPress={() => setExpandedId(isExpanded ? null : res.id)}>
                      <View style={styles.triggerLeft}>
                        <Text style={[styles.accordionTitle, { color: theme.colors.text }]}>{res.environmentName}</Text>
                        <Text style={[styles.accordionSubtitle, { color: theme.colors.textSecondary }]}>
                          {new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                        <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{res.status}</Text>
                      </View>
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.accordionContent}>
                        <View style={styles.detailRow}>
                          <Clock size={16} color={theme.colors.textSecondary} />
                          <Text style={[styles.detailText, { color: theme.colors.text }]}>Horário: {res.time}</Text>
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
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Solicitar {selectedEnvironment?.name}</Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Selecione o dia e depois o horário desejado.</Text>
            </View>
            <Calendar
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                todayTextColor: theme.colors.primary,
                arrowColor: theme.colors.primary,
                calendarBackground: theme.colors.card,
                textSectionTitleColor: theme.colors.text,
                dayTextColor: theme.colors.text,
                monthTextColor: theme.colors.text,
              }}
            />
            <TimeSlotPicker />
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.cardButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]} 
                onPress={handleRequestReservation} 
                disabled={isSubmitting} 
                accessibilityLabel="Confirmar solicitação"
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonTextPrimary}>Confirmar Solicitação</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
