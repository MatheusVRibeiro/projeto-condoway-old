import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import { styles } from './styles';
import { environments, allExistingReservations, myInitialReservations } from './mock';
import { CalendarPlus, CalendarCheck, Info } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { EnvironmentCard, ReservationHeader, ReservationCard, EnvironmentDetailsModal, ReservationDetailsModal } from '../../../components';
import { parseISO, isToday, isYesterday, isThisWeek, isLastWeek, isThisMonth, isLastMonth, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reservas() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reservar');
  const [myReservations, setMyReservations] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loadingAmbientes, setLoadingAmbientes] = useState(true);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(null); // 'manha', 'tarde', 'noite'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pendente'); // 'pendente', 'confirmada', 'cancelada'
  const [reservasDoAmbiente, setReservasDoAmbiente] = useState([]); // Reservas do ambiente selecionado
  
  // Novos estados para os modais
  const [environmentDetailsVisible, setEnvironmentDetailsVisible] = useState(false);
  const [reservationDetailsVisible, setReservationDetailsVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // ✅ Carregar ambientes da API
  useEffect(() => {
    carregarAmbientes();
  }, []);

  // ✅ Carregar reservas da API quando trocar para tab "minhas"
  useEffect(() => {
    if (activeTab === 'minhas' && user?.userap_id) {
      carregarReservas();
    }
  }, [activeTab, user?.userap_id]);

  // ✅ Carregar reservas do ambiente quando mudar data ou ambiente
  useEffect(() => {
    if (selectedEnvironment?.id && selectedDate) {
      carregarReservasDoAmbiente();
    }
  }, [selectedEnvironment?.id, selectedDate]);

  const carregarAmbientes = async () => {
    try {
      setLoadingAmbientes(true);
      console.log('🔄 [Reservas] Carregando ambientes...');
      const data = await apiService.listarAmbientes();
      console.log('✅ [Reservas] Ambientes carregados:', data);
      
      // Mapear para o formato esperado pelo componente
      const ambientesMapeados = data.map(amb => ({
        id: amb.amd_id || amb.id,
        name: amb.amd_nome || amb.nome || 'Ambiente',
        description: amb.amd_descricao || amb.descricao || '',
        capacity: amb.amd_capacidade || amb.capacidade || 0,
        price: amb.amd_valor || amb.valor || 0,
        available: true, // Disponível para reserva
        availablePeriods: ['manha', 'tarde', 'noite'], // Pode vir do backend futuramente
        image: amb.amd_imagem || amb.imagem || null,
        amenities: amb.amd_comodidades || amb.comodidades || [],
        rules: amb.amd_regras || amb.regras || [
          "Respeite o horário de uso.",
          "Mantenha o ambiente limpo após o uso.",
          "Siga as normas do condomínio."
        ],
        items: amb.amd_items || amb.items || [
          "Consulte a administração para mais detalhes"
        ],
        _raw: amb
      }));
      
      setAmbientes(ambientesMapeados);
    } catch (error) {
      console.error('❌ [Reservas] Erro ao carregar ambientes:', error);
      Toast.show({ type: 'error', text1: 'Erro ao carregar ambientes' });
      // Fallback para mock em caso de erro
      setAmbientes(environments);
    } finally {
      setLoadingAmbientes(false);
    }
  };

  const carregarReservas = async () => {
    try {
      setLoadingReservas(true);
      console.log('🔄 [Reservas] Carregando reservas do usuário...');
      const data = await apiService.listarReservas(user.userap_id);
      console.log('✅ [Reservas] Reservas carregadas:', data);
      setMyReservations(data);
    } catch (error) {
      console.error('❌ [Reservas] Erro ao carregar reservas:', error);
      Toast.show({ type: 'error', text1: 'Erro ao carregar suas reservas' });
      // Fallback para mock em caso de erro
      setMyReservations(myInitialReservations);
    } finally {
      setLoadingReservas(false);
    }
  };

  const carregarReservasDoAmbiente = async () => {
    try {
      console.log(`🔄 [Reservas] Carregando reservas do ambiente ${selectedEnvironment.id}...`);
      const data = await apiService.listarReservasAmbiente(selectedEnvironment.id);
      console.log('✅ [Reservas] Reservas do ambiente carregadas:', data);
      setReservasDoAmbiente(data);
    } catch (error) {
      console.error('❌ [Reservas] Erro ao carregar reservas do ambiente:', error);
      setReservasDoAmbiente([]);
    }
  };

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
    const fullEnvironment = ambientes.find(e => e.id === env.id) || env;
    setSelectedEnvironment(fullEnvironment);
    setSelectedPeriod(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setEnvironmentDetailsVisible(false); // Fecha o modal de detalhes
    setModalVisible(true);
  }, [ambientes]);

  const handleDetailsModal = useCallback((env) => {
    // Garantir que o environment tenha todas as propriedades necessárias
    const fullEnvironment = ambientes.find(e => e.id === env.id) || env;
    setSelectedEnvironment(fullEnvironment);
    setEnvironmentDetailsVisible(true);
  }, [ambientes]);

  const handleOpenReservationDetails = useCallback((reservation) => {
    setSelectedReservation(reservation);
    setReservationDetailsVisible(true);
  }, []);

  const handleRequestReservation = useCallback(async () => {
    if (!selectedPeriod) {
      Toast.show({ type: 'error', text1: 'Por favor, selecione um período.' });
      return;
    }
    
    if (!user?.userap_id) {
      Toast.show({ type: 'error', text1: 'Erro: Usuário não identificado' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Converter período para horários específicos (formato HH:MM:SS)
      const periodTimes = {
        manha: { inicio: '08:00:00', fim: '12:00:00' },
        tarde: { inicio: '12:00:00', fim: '18:00:00' },
        noite: { inicio: '18:00:00', fim: '22:00:00' }
      };
      
      const horarios = periodTimes[selectedPeriod];
      
      const dadosReserva = {
        ambiente_id: selectedEnvironment.id,
        res_data_reserva: selectedDate,
        res_horario_inicio: horarios.inicio,
        res_horario_fim: horarios.fim,
      };
      
      console.log('📤 [Reservas] Criando reserva...', dadosReserva);
      
      await apiService.criarReserva(dadosReserva);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      Toast.show({ 
        type: 'success', 
        text1: 'Solicitação enviada!', 
        text2: 'Aguarde a confirmação do síndico.' 
      });
      
      // Recarregar lista de reservas
      if (activeTab === 'minhas') {
        await carregarReservas();
      }
      
    } catch (err) {
      console.error('❌ [Reservas] Erro ao criar reserva:', err);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro ao solicitar reserva',
        text2: err.message || 'Tente novamente'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPeriod, selectedEnvironment, selectedDate, user, activeTab]);

  const handleCancelReservation = useCallback(async (id) => {
    console.log(`🎯 [Reservas] handleCancelReservation chamado com ID: ${id}, tipo: ${typeof id}`);
    
    // Para web, usar window.confirm; para mobile, usar Alert.alert
    const isWeb = typeof window !== 'undefined' && window.confirm;
    
    if (isWeb) {
      const confirmar = window.confirm("Você tem certeza que deseja cancelar esta reserva?");
      if (!confirmar) return;
      
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Warning);
        console.log(`🔄 [Reservas] Iniciando cancelamento da reserva ID: ${id}...`);
        
        const resultado = await apiService.cancelarReserva(id);
        console.log('✅ [Reservas] Resultado do cancelamento:', resultado);
        
        Toast.show({ type: 'success', text1: 'Reserva cancelada com sucesso!' });
        
        // Recarregar lista de reservas
        console.log('🔄 [Reservas] Recarregando lista de reservas...');
        if (activeTab === 'minhas' && user?.userap_id) {
          setLoadingReservas(true);
          const data = await apiService.listarReservas(user.userap_id);
          setMyReservations(data);
          setLoadingReservas(false);
        }
      } catch (error) {
        console.error('❌ [Reservas] Erro ao cancelar reserva:', {
          message: error.message,
          stack: error.stack,
          fullError: error
        });
        Toast.show({ 
          type: 'error', 
          text1: 'Erro ao cancelar reserva',
          text2: error.message || 'Tente novamente'
        });
      }
    } else {
      Alert.alert(
        "Cancelar Reserva",
        "Você tem certeza que deseja cancelar esta reserva?",
        [
          { text: "Voltar", style: "cancel" },
          { 
            text: "Sim, cancelar", 
            onPress: async () => {
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                console.log(`🔄 [Reservas] Iniciando cancelamento da reserva ID: ${id}...`);
                
                const resultado = await apiService.cancelarReserva(id);
                console.log('✅ [Reservas] Resultado do cancelamento:', resultado);
                
                Toast.show({ type: 'success', text1: 'Reserva cancelada com sucesso!' });
                
                // Recarregar lista de reservas
                console.log('🔄 [Reservas] Recarregando lista de reservas...');
                if (activeTab === 'minhas' && user?.userap_id) {
                  setLoadingReservas(true);
                  const data = await apiService.listarReservas(user.userap_id);
                  setMyReservations(data);
                  setLoadingReservas(false);
                }
              } catch (error) {
                console.error('❌ [Reservas] Erro ao cancelar reserva:', {
                  message: error.message,
                  stack: error.stack,
                  fullError: error
                });
                Toast.show({ 
                  type: 'error', 
                  text1: 'Erro ao cancelar reserva',
                  text2: error.message || 'Tente novamente'
                });
              }
            },
            style: 'destructive'
          }
        ]
      );
    }
  }, [activeTab, user]);

  // Filtrar reservas
  const filteredReservations = useMemo(() => {
    return myReservations.filter(r => r.status === filterStatus);
  }, [myReservations, filterStatus]);

  // Agrupar reservas inteligentemente (Hoje, Ontem, Esta Semana, etc)
  const groupedReservations = useMemo(() => {
    const groups = {
      hoje: { label: 'Hoje', reservas: [] },
      ontem: { label: 'Ontem', reservas: [] },
      estaSemana: { label: 'Esta Semana', reservas: [] },
      semanaPassada: { label: 'Semana Passada', reservas: [] },
      esteMes: { label: 'Este Mês', reservas: [] },
      mesPassado: { label: 'Mês Passado', reservas: [] },
      maisAntigo: { label: 'Mais Antigo', reservas: [] },
    };

    filteredReservations.forEach(reserva => {
      try {
        const dateStr = reserva.date.includes('T') ? reserva.date : reserva.date + 'T00:00:00';
        const dataReserva = parseISO(dateStr);

        if (isToday(dataReserva)) {
          groups.hoje.reservas.push(reserva);
        } else if (isYesterday(dataReserva)) {
          groups.ontem.reservas.push(reserva);
        } else if (isThisWeek(dataReserva, { locale: ptBR })) {
          groups.estaSemana.reservas.push(reserva);
        } else if (isLastWeek(dataReserva, { locale: ptBR })) {
          groups.semanaPassada.reservas.push(reserva);
        } else if (isThisMonth(dataReserva)) {
          groups.esteMes.reservas.push(reserva);
        } else if (isLastMonth(dataReserva)) {
          groups.mesPassado.reservas.push(reserva);
        } else {
          groups.maisAntigo.reservas.push(reserva);
        }
      } catch (error) {
        console.error('Erro ao agrupar reserva:', error);
      }
    });

    // Retornar apenas grupos que têm reservas
    return Object.keys(groups)
      .filter(key => groups[key].reservas.length > 0)
      .map(key => ({
        key,
        label: groups[key].label,
        reservas: groups[key].reservas.sort((a, b) => new Date(b.date) - new Date(a.date))
      }));
  }, [filteredReservations]);

  const PeriodPicker = () => {
    const periods = [
      { 
        id: 'manha', 
        label: 'Manhã', 
        time: '08:00 - 12:00',
        horario_inicio: '08:00:00',
        horario_fim: '12:00:00',
        icon: '🌅',
        color: '#f59e0b',
        lightColor: '#fef3c7'
      },
      { 
        id: 'tarde', 
        label: 'Tarde', 
        time: '12:00 - 18:00',
        horario_inicio: '12:00:00',
        horario_fim: '18:00:00',
        icon: '☀️',
        color: '#3b82f6',
        lightColor: '#dbeafe'
      },
      { 
        id: 'noite', 
        label: 'Noite', 
        time: '18:00 - 22:00',
        horario_inicio: '18:00:00',
        horario_fim: '22:00:00',
        icon: '🌙',
        color: '#8b5cf6',
        lightColor: '#ede9fe'
      }
    ];

    // Normalizar data para comparação
    const dataNormalizada = selectedDate.split('T')[0];

    // Verificar períodos já reservados (usando reservas reais do banco)
    const periodosReservados = periods.map(period => {
      // Buscar reservas que conflitam com este período na data selecionada
      const temReserva = reservasDoAmbiente.some(reserva => {
        // Normalizar data da reserva
        const dataReserva = reserva.date.split('T')[0];
        
        // Se não é a mesma data, não há conflito
        if (dataReserva !== dataNormalizada) return false;
        
        // Se está cancelada, não bloqueia
        if (reserva.status === 'cancelada') return false;
        
        // Verificar se os horários se sobrepõem
        const reservaInicio = reserva.horario_inicio;
        const reservaFim = reserva.horario_fim;
        const periodoInicio = period.horario_inicio;
        const periodoFim = period.horario_fim;
        
        const conflito = (
          (periodoInicio >= reservaInicio && periodoInicio < reservaFim) ||
          (periodoFim > reservaInicio && periodoFim <= reservaFim) ||
          (periodoInicio <= reservaInicio && periodoFim >= reservaFim)
        );
        
        if (conflito) {
          console.log(`⚠️ Período ${period.label} bloqueado por reserva #${reserva.id}`);
        }
        
        return conflito;
      });
      
      return {
        periodo: period.id,
        reservado: temReserva
      };
    });

    return (
      <View>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
          ⏰ Escolha o período
        </Text>
        <View style={styles.periodGrid}>
          {periods.map(period => {
            const periodoReservado = periodosReservados.find(p => p.periodo === period.id);
            const isReserved = periodoReservado?.reservado || false;
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
              
              {loadingAmbientes ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Carregando ambientes...
                  </Text>
                </View>
              ) : ambientes.length > 0 ? (
                ambientes.map((env, index) => (
                  <EnvironmentCard 
                    key={env.id} 
                    item={env} 
                    onReserve={handleOpenModal}
                    onDetails={handleDetailsModal}
                    index={index}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Nenhum ambiente disponível no momento
                  </Text>
                </View>
              )}
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
                  </TouchableOpacity>
                ))}
              </View>

              {/* Lista de reservas */}
              {loadingReservas ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Carregando suas reservas...
                  </Text>
                </View>
              ) : filteredReservations.length > 0 ? (
                groupedReservations.map((group, groupIndex) => (
                  <Animatable.View 
                    key={group.key} 
                    animation="fadeInUp" 
                    delay={groupIndex * 100}
                    duration={500}
                  >
                    {/* Header do grupo */}
                    <View style={[styles.groupHeader, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                      <Text style={[styles.groupHeaderText, { color: theme.colors.text }]}>
                        {group.label}
                      </Text>
                      <Text style={[styles.groupHeaderCount, { color: theme.colors.textSecondary }]}>
                        {group.reservas.length} {group.reservas.length === 1 ? 'reserva' : 'reservas'}
                      </Text>
                    </View>
                    
                    {/* Reservas do grupo */}
                    {group.reservas.map((res, index) => (
                      <ReservationCard
                        key={res.id}
                        item={res}
                        onCancel={handleCancelReservation}
                        onPress={handleOpenReservationDetails}
                        index={index}
                      />
                    ))}
                  </Animatable.View>
                ))
              ) : (
                <Animatable.View 
                  animation="fadeIn" 
                  style={[styles.emptyState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                >
                  <CalendarCheck size={48} color={theme.colors.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                    {filterStatus === 'pendente' 
                      ? 'Nenhuma reserva pendente' 
                      : filterStatus === 'confirmada'
                      ? 'Nenhuma reserva confirmada'
                      : 'Nenhuma reserva cancelada'}
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
