import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeProvider';
import { styles } from './styles';
import { environments, allExistingReservations, myInitialReservations } from './mock';
import { CalendarPlus, CalendarCheck, Info } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { EnvironmentCard, ReservationHeader, ReservationCard, EnvironmentDetailsModal, ReservationDetailsModal } from '../../../components';

export default function Reservas() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('reservar');
  const [myReservations, setMyReservations] = useState(myInitialReservations);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(null); // 'manha', 'tarde', 'noite'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todas'); // 'todas', 'pendente', 'confirmada', 'cancelada'
  
  // Novos estados para os modais
  const [environmentDetailsVisible, setEnvironmentDetailsVisible] = useState(false);
  const [reservationDetailsVisible, setReservationDetailsVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Calcular estatísticas
  const stats = useMemo(() => ({
    total: myReservations.length,
    pending: myReservations.filter(r => r.status === 'pendente').length,
    confirmed: myReservations.filter(r => r.status === 'confirmada').length,
    cancelled: myReservations.filter(r => r.status === 'cancelada').length,
  }), [myReservations]);

  const handleOpenModal = useCallback((env) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Garantir que o environment tenha todas as propriedades necessárias
    const fullEnvironment = environments.find(e => e.id === env.id) || env;
    setSelectedEnvironment(fullEnvironment);
    setSelectedPeriod(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setEnvironmentDetailsVisible(false); // Fecha o modal de detalhes
    setModalVisible(true);
  }, []);

  const handleDetailsModal = useCallback((env) => {
    // Garantir que o environment tenha todas as propriedades necessárias
    const fullEnvironment = environments.find(e => e.id === env.id) || env;
    setSelectedEnvironment(fullEnvironment);
    setEnvironmentDetailsVisible(true);
  }, []);

  const handleOpenReservationDetails = useCallback((reservation) => {
    setSelectedReservation(reservation);
    setReservationDetailsVisible(true);
  }, []);

  const handleRequestReservation = useCallback(() => {
    if (!selectedPeriod) {
      Toast.show({ type: 'error', text1: 'Por favor, selecione um período.' });
      return;
    }
    try {
      setIsSubmitting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Converter período para horário de exibição
      const periodTimes = {
        manha: '08:00 - 12:00',
        tarde: '12:00 - 18:00',
        noite: '18:00 - 22:00'
      };
      
      const newReservation = {
        id: Date.now(),
        environmentName: selectedEnvironment.name,
        date: selectedDate,
        time: periodTimes[selectedPeriod],
        period: selectedPeriod,
        status: 'pendente'
      };
      setMyReservations(prev => [newReservation, ...prev]);
      allExistingReservations.push(newReservation);
      setModalVisible(false);
      Toast.show({ type: 'success', text1: 'Solicitação enviada!', text2: 'Aguarde a confirmação do síndico.' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao solicitar reserva.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPeriod, selectedEnvironment, selectedDate]);

  const handleCancelReservation = useCallback((id) => {
    Alert.alert(
      "Cancelar Reserva",
      "Você tem certeza que deseja cancelar esta reserva?",
      [
        { text: "Voltar", style: "cancel" },
        { 
          text: "Sim, cancelar", 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setMyReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelada' } : r));
            Toast.show({ type: 'info', text1: 'Reserva cancelada.' });
          },
          style: 'destructive'
        }
      ]
    );
  }, []);

  // Filtrar reservas
  const filteredReservations = useMemo(() => {
    if (filterStatus === 'todas') {
      return myReservations;
    }
    return myReservations.filter(r => r.status === filterStatus);
  }, [myReservations, filterStatus]);

  const PeriodPicker = () => {
    const periods = [
      { 
        id: 'manha', 
        label: 'Manhã', 
        time: '08:00 - 12:00',
        icon: '🌅',
        color: '#f59e0b',
        lightColor: '#fef3c7'
      },
      { 
        id: 'tarde', 
        label: 'Tarde', 
        time: '12:00 - 18:00',
        icon: '☀️',
        color: '#3b82f6',
        lightColor: '#dbeafe'
      },
      { 
        id: 'noite', 
        label: 'Noite', 
        time: '18:00 - 22:00',
        icon: '🌙',
        color: '#8b5cf6',
        lightColor: '#ede9fe'
      }
    ];

    // Verificar períodos já reservados
    const reservedPeriods = allExistingReservations
      .filter(r => 
        r.environmentName === selectedEnvironment?.name && 
        r.date === selectedDate && 
        r.status !== 'cancelada'
      )
      .map(r => r.period);

    return (
      <View>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
          ⏰ Escolha o período
        </Text>
        <View style={styles.periodGrid}>
          {periods.map(period => {
            const isReserved = reservedPeriods.includes(period.id);
            const isSelected = selectedPeriod === period.id;
            
            return (
              <TouchableOpacity
                key={period.id}
                disabled={isReserved}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectedPeriod(period.id);
                }}
                style={[
                  styles.modernPeriodCard,
                  { 
                    borderColor: theme.colors.border, 
                    backgroundColor: theme.colors.card,
                    shadowColor: period.color
                  },
                  isSelected && { 
                    backgroundColor: period.lightColor, 
                    borderColor: period.color,
                    borderWidth: 2.5,
                    shadowColor: period.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  },
                  isReserved && { 
                    backgroundColor: theme.colors.border, 
                    opacity: 0.4 
                  }
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.periodCardHeader}>
                  <Text style={styles.periodIconLarge}>{period.icon}</Text>
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: period.color }]}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.periodCardContent}>
                  <Text style={[
                    styles.periodLabelLarge,
                    { color: isSelected ? period.color : theme.colors.text },
                    isReserved && { color: theme.colors.textSecondary }
                  ]}>
                    {period.label}
                  </Text>
                  <Text style={[
                    styles.periodTimeLarge,
                    { color: isSelected ? period.color : theme.colors.textSecondary },
                    isReserved && { color: theme.colors.textSecondary }
                  ]}>
                    {period.time}
                  </Text>
                </View>
                
                {isReserved && (
                  <View style={[styles.reservedBadge, { backgroundColor: theme.colors.error }]}>
                    <Text style={styles.reservedBadgeText}>RESERVADO</Text>
                  </View>
                )}
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
          {/* Tabs modernizados */}
          <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'reservar' && styles.tabButtonActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('reservar');
              }}
              activeOpacity={0.7}
            >
              <CalendarPlus 
                size={18} 
                color={activeTab === 'reservar' ? theme.colors.primary : theme.colors.textSecondary} 
                strokeWidth={2.5}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'reservar' && styles.tabTextActive,
                { color: activeTab === 'reservar' ? theme.colors.primary : theme.colors.textSecondary }
              ]}>Reservar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'minhas' && styles.tabButtonActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('minhas');
              }}
              activeOpacity={0.7}
            >
              <CalendarCheck 
                size={18} 
                color={activeTab === 'minhas' ? theme.colors.primary : theme.colors.textSecondary} 
                strokeWidth={2.5}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'minhas' && styles.tabTextActive,
                { color: activeTab === 'minhas' ? theme.colors.primary : theme.colors.textSecondary }
              ]}>Minhas Reservas</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'reservar' ? (
            <View>
              <Animatable.Text 
                animation="fadeIn" 
                style={[styles.sectionTitle, { color: theme.colors.text }]}
              >
                Ambientes Disponíveis
              </Animatable.Text>
              {environments.map((env, index) => (
                <EnvironmentCard 
                  key={env.id} 
                  item={env} 
                  onReserve={handleOpenModal}
                  onDetails={handleDetailsModal}
                  index={index}
                />
              ))}
            </View>
          ) : (
            <View>
              {/* Header com estatísticas */}
              <ReservationHeader 
                total={stats.total}
                pending={stats.pending}
                confirmed={stats.confirmed}
                cancelled={stats.cancelled}
              />

              {/* Filtros de status */}
              <View style={styles.statusFilterContainer}>
                {[
                  { key: 'todas', label: 'Todas', count: stats.total },
                  { key: 'pendente', label: 'Pendentes', count: stats.pending },
                  { key: 'confirmada', label: 'Confirmadas', count: stats.confirmed },
                  { key: 'cancelada', label: 'Canceladas', count: stats.cancelled },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.statusFilterTab,
                      {
                        backgroundColor: filterStatus === tab.key ? theme.colors.primary : theme.colors.card,
                        borderColor: filterStatus === tab.key ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFilterStatus(tab.key);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.statusFilterText,
                        { color: filterStatus === tab.key ? '#ffffff' : theme.colors.textSecondary },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {tab.label}
                    </Text>
                    {tab.count > 0 && (
                      <View
                        style={[
                          styles.statusFilterBadge,
                          {
                            backgroundColor: filterStatus === tab.key ? 'rgba(255, 255, 255, 0.3)' : theme.colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusFilterBadgeText,
                            { color: '#ffffff' },
                          ]}
                        >
                          {tab.count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Lista de reservas */}
              {filteredReservations.length > 0 ? (
                filteredReservations.map((res, index) => (
                  <ReservationCard
                    key={res.id}
                    item={res}
                    onCancel={handleCancelReservation}
                    onPress={handleOpenReservationDetails}
                    index={index}
                  />
                ))
              ) : (
                <Animatable.View 
                  animation="fadeIn" 
                  style={[styles.emptyState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                >
                  <CalendarCheck size={48} color={theme.colors.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                    {filterStatus === 'todas' 
                      ? 'Nenhuma reserva encontrada' 
                      : `Nenhuma reserva ${filterStatus}`}
                  </Text>
                </Animatable.View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          
          <Animatable.View 
            animation="slideInUp" 
            duration={400}
            style={[styles.modalBottomSheet, { backgroundColor: theme.colors.background }]}
          >
            {/* Header com título e botão fechar */}
            <View style={[styles.sheetHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.handleBar} />
              <View style={styles.headerContent}>
                <View style={styles.headerTitleContainer}>
                  <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                    {selectedEnvironment?.name}
                  </Text>
                  <Text style={[styles.sheetSubtitle, { color: theme.colors.textSecondary }]}>
                    Reservar ambiente
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeSheetButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.closeSheetButtonText, { color: theme.colors.text }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              style={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Seção do Calendário */}
              <Animatable.View animation="fadeIn" delay={100} style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
                  📅 Escolha a data
                </Text>
                <View style={[styles.calendarCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Calendar
                    onDayPress={day => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDate(day.dateString);
                      setSelectedPeriod(null);
                    }}
                    markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }}
                    minDate={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().split('T')[0];
                    })()}
                    theme={{
                      todayTextColor: theme.colors.primary,
                      arrowColor: theme.colors.primary,
                      calendarBackground: 'transparent',
                      textDisabledColor: theme.colors.textSecondary + '55',
                      textSectionTitleColor: theme.colors.textSecondary,
                      dayTextColor: theme.colors.text,
                      monthTextColor: theme.colors.text,
                      selectedDayBackgroundColor: theme.colors.primary,
                      selectedDayTextColor: '#ffffff',
                    }}
                  />
                </View>
              </Animatable.View>

              {/* Seção de Períodos */}
              <Animatable.View animation="fadeIn" delay={200} style={styles.section}>
                <PeriodPicker />
              </Animatable.View>
            </ScrollView>
            
            {/* Footer fixo com botão de confirmar */}
            <Animatable.View 
              animation="fadeInUp" 
              delay={300}
              style={[styles.sheetFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            >
              <TouchableOpacity 
                style={[
                  styles.confirmReservationButton,
                  { 
                    backgroundColor: selectedPeriod ? theme.colors.primary : theme.colors.border,
                  }
                ]} 
                onPress={handleRequestReservation} 
                disabled={isSubmitting || !selectedPeriod} 
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <CalendarCheck size={20} color="#ffffff" strokeWidth={2.5} />
                    <Text style={styles.confirmReservationButtonText}>
                      Confirmar Reserva
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </View>
      </Modal>

      {/* Modal de Detalhes do Ambiente */}
      <EnvironmentDetailsModal
        visible={environmentDetailsVisible}
        environment={selectedEnvironment}
        onClose={() => setEnvironmentDetailsVisible(false)}
        onReserve={handleOpenModal}
      />

      {/* Modal de Detalhes da Reserva */}
      <ReservationDetailsModal
        visible={reservationDetailsVisible}
        reservation={selectedReservation}
        onClose={() => setReservationDetailsVisible(false)}
        onCancel={handleCancelReservation}
      />
    </SafeAreaView>
  );
}
