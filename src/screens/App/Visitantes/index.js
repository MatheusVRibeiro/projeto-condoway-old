import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, RefreshControl, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Plus, UserCheck, Clock, Calendar, ArrowRight, QrCode, Users, X, Phone, Car, FileText, MapPin } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { DateTime } from 'luxon';
import SearchBar from '../../../components/SearchBar';

import { useTheme } from '../../../contexts/ThemeProvider';
import createStyles from './styles';
import { apiService } from '../../../services/api';

// --- Dados de Exemplo (Mocks) seguindo estrutura da API Condoo ---
const upcomingVisitorsData = [
  { 
    id: '1', 
    visitor_name: 'Carlos Silva', 
    cpf: '123.456.789-00',
    visit_date: '2025-10-02',
    visit_time: '18:00',
    qr_code: 'QR123456',
    status: 'Aguardando',
    created_at: '2025-10-01T10:00:00',
    phone: '(11) 98765-4321',
    vehicle_plate: 'ABC-1234',
    notes: 'Visitante autorizado para entrega'
  },
  { 
    id: '2', 
    visitor_name: 'Mariana Costa', 
    cpf: '987.654.321-00',
    visit_date: '2025-10-03',
    visit_time: '10:30',
    qr_code: 'QR789012',
    status: 'Aguardando',
    created_at: '2025-10-01T11:00:00',
    phone: '(11) 91234-5678',
    vehicle_plate: null,
    notes: null
  },
  { 
    id: '3', 
    visitor_name: 'João Santos', 
    cpf: '456.789.123-00',
    visit_date: '2025-10-02',
    visit_time: '14:00',
    qr_code: 'QR345678',
    status: 'Entrou',
    created_at: '2025-09-28T09:00:00',
    phone: '(11) 99999-8888',
    vehicle_plate: 'XYZ-9876',
    notes: 'Visitante frequente - funcionário'
  },
];

const accessHistoryData = [
  { 
    id: '1', 
    visitor_name: 'Ana Beatriz',
    cpf: '111.222.333-44',
    visit_date: '2025-09-30',
    entry_time: '09:15',
    exit_time: '11:30',
    status: 'Finalizado',
    qr_code: 'QR111222'
  },
  { 
    id: '2', 
    visitor_name: 'Ricardo Gomes',
    cpf: '555.666.777-88',
    visit_date: '2025-09-29',
    entry_time: '14:00',
    exit_time: '18:45',
    status: 'Finalizado',
    qr_code: 'QR555666'
  },
];
// --- Fim dos Dados de Exemplo ---

const getStatusConfig = (status) => {
  const configs = {
    'Aguardando': { color: '#F59E0B', label: 'Aguardando', icon: Clock },
    'Entrou': { color: '#10B981', label: 'Entrou', icon: UserCheck },
    'Finalizado': { color: '#6B7280', label: 'Finalizado', icon: Calendar },
    'Cancelado': { color: '#EF4444', label: 'Cancelado', icon: Clock },
  };
  return configs[status] || configs['Aguardando'];
};

const formatDate = (dateString) => {
  if (!dateString) return 'Data inválida';
  
  // Tenta parsear como SQL primeiro (YYYY-MM-DD HH:MM:SS), depois como ISO
  let dt = DateTime.fromSQL(dateString);
  if (!dt.isValid) {
    dt = DateTime.fromISO(dateString);
  }
  
  if (!dt.isValid) return dateString; // Retorna string original se não conseguir parsear
  
  const today = DateTime.local().startOf('day');
  const tomorrow = today.plus({ days: 1 });
  
  if (dt.hasSame(today, 'day')) return 'Hoje';
  if (dt.hasSame(tomorrow, 'day')) return 'Amanhã';
  return dt.toFormat('dd/MM/yyyy');
};

// Card para a lista de "Próximas Visitas"
const VisitorCard = ({ item, theme, onPress }) => {
  const styles = createStyles(theme);
  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {/* Avatar e Info Principal */}
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {item.visitor_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.visitor_name}</Text>
            <Text style={styles.cardCPF}>CPF: {item.cpf}</Text>
            
            <View style={styles.cardDetailsRow}>
              <View style={styles.dateTimeContainer}>
                <Calendar size={14} color={theme.colors.textSecondary} />
                <Text style={styles.cardDateTime}>
                  {formatDate(item.visit_date)} às {item.visit_time}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status e Ação */}
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
            <StatusIcon size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          
          {item.status === 'pending' && (
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={(e) => {
                e.stopPropagation();
                // Mostrar QR Code
              }}
            >
              <QrCode size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Card para a lista de "Histórico de Acessos"
const HistoryCard = ({ item, theme, onPress }) => {
  const styles = createStyles(theme);
  const statusConfig = getStatusConfig(item.status);
  
  return (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.historyCard}>
      <TouchableOpacity 
        style={styles.historyCardContent}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.textSecondary }]}>
            <Text style={styles.avatarText}>
              {item.visitor_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.visitor_name}</Text>
            <Text style={styles.cardSubtitle}>
              {formatDate(item.visit_date)}
            </Text>
            
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Entrada</Text>
                <Text style={styles.timeValue}>{item.entry_time}</Text>
              </View>
              <ArrowRight size={14} color={theme.colors.textSecondary} style={styles.arrowIcon} />
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Saída</Text>
                <Text style={styles.timeValue}>{item.exit_time || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Modal de Detalhes do Visitante
const VisitorDetailsModal = ({ visible, visitor, onClose, theme }) => {
  const styles = createStyles(theme);
  
  if (!visitor) return null;
  
  const statusConfig = getStatusConfig(visitor.status);
  const StatusIcon = statusConfig.icon;

  const handleCancelAuthorization = () => {
    Alert.alert(
      'Cancelar Autorização',
      `Deseja realmente cancelar a autorização de ${visitor.visitor_name}?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Cancelar', 
          style: 'destructive',
          onPress: () => {
            // Chamar API para cancelar
            console.log('Cancelar autorização:', visitor.id);
            onClose();
          }
        }
      ]
    );
  };

  const handleResendInvite = () => {
    Alert.alert(
      'Reenviar Convite',
      `Deseja reenviar o convite para ${visitor.visitor_name}?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Reenviar',
          onPress: () => {
            // Chamar API para reenviar
            console.log('Reenviar convite:', visitor.id);
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View 
          animation="slideInUp" 
          duration={400}
          style={styles.modalContent}
        >
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>Detalhes do Visitante</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
                <StatusIcon size={12} color={statusConfig.color} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Avatar e Nome */}
            <View style={styles.modalAvatarSection}>
              <View style={[styles.modalAvatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.modalAvatarText}>
                  {visitor.visitor_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.modalVisitorName}>{visitor.visitor_name}</Text>
            </View>

            {/* Informações Principais */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Informações Pessoais</Text>
              
              <View style={styles.modalInfoRow}>
                <FileText size={18} color={theme.colors.textSecondary} />
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>CPF</Text>
                  <Text style={styles.modalInfoValue}>{visitor.cpf}</Text>
                </View>
              </View>

              {visitor.phone && (
                <View style={styles.modalInfoRow}>
                  <Phone size={18} color={theme.colors.textSecondary} />
                  <View style={styles.modalInfoText}>
                    <Text style={styles.modalInfoLabel}>Telefone</Text>
                    <Text style={styles.modalInfoValue}>{visitor.phone}</Text>
                  </View>
                </View>
              )}

              {visitor.vehicle_plate && (
                <View style={styles.modalInfoRow}>
                  <Car size={18} color={theme.colors.textSecondary} />
                  <View style={styles.modalInfoText}>
                    <Text style={styles.modalInfoLabel}>Placa do Veículo</Text>
                    <Text style={styles.modalInfoValue}>{visitor.vehicle_plate}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Informações da Visita */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Detalhes da Visita</Text>
              
              <View style={styles.modalInfoRow}>
                <Calendar size={18} color={theme.colors.textSecondary} />
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Data e Horário</Text>
                  <Text style={styles.modalInfoValue}>
                    {formatDate(visitor.visit_date)} às {visitor.visit_time}
                  </Text>
                </View>
              </View>

              {visitor.entry_time && (
                <View style={styles.modalInfoRow}>
                  <Clock size={18} color={theme.colors.textSecondary} />
                  <View style={styles.modalInfoText}>
                    <Text style={styles.modalInfoLabel}>Horário de Entrada</Text>
                    <Text style={styles.modalInfoValue}>{visitor.entry_time}</Text>
                  </View>
                </View>
              )}

              {visitor.exit_time && (
                <View style={styles.modalInfoRow}>
                  <Clock size={18} color={theme.colors.textSecondary} />
                  <View style={styles.modalInfoText}>
                    <Text style={styles.modalInfoLabel}>Horário de Saída</Text>
                    <Text style={styles.modalInfoValue}>{visitor.exit_time}</Text>
                  </View>
                </View>
              )}

              <View style={styles.modalInfoRow}>
                <QrCode size={18} color={theme.colors.textSecondary} />
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Código QR</Text>
                  <Text style={styles.modalInfoValue}>{visitor.qr_code}</Text>
                </View>
              </View>
            </View>

            {/* Observações */}
            {visitor.notes && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Observações</Text>
                <Text style={styles.modalNotesText}>{visitor.notes}</Text>
              </View>
            )}
          </ScrollView>

          {/* Ações do Modal */}
          {visitor.status === 'Aguardando' && (
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.modalActionButtonSecondary]}
                onPress={handleResendInvite}
              >
                <Text style={styles.modalActionButtonTextSecondary}>Reenviar Convite</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.modalActionButtonDanger]}
                onPress={handleCancelAuthorization}
              >
                <Text style={styles.modalActionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animatable.View>
      </View>
    </Modal>
  );
};

// Tela Principal
const VisitantesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingVisitors, setUpcomingVisitors] = useState([]);
  const [historyVisitors, setHistoryVisitors] = useState([]);

  // Carregar visitantes da API
  const carregarVisitantes = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      
      console.log('🔄 Carregando visitantes da API...');
      const response = await apiService.listarVisitantes();
      
      console.log('✅ Visitantes carregados:', response);
      
      // Separa visitantes por status
      // A API retorna: { sucesso: true, message: '...', nItens: 4, dados: [...] }
      const dados = response.dados || response.data?.dados || response.data || response;
      const proximos = dados.filter(v => 
        ['Aguardando', 'Entrou'].includes(v.vst_status || v.status)
      );
      const historico = dados.filter(v => 
        ['Finalizado', 'Cancelado'].includes(v.vst_status || v.status)
      );
      
      // Mapeia para o formato esperado pelos componentes
      setUpcomingVisitors(proximos.map(v => {
        const validadeInicio = v.vst_validade_inicio || v.visit_date;
        const dataEntrada = v.vst_data_entrada;
        const dataSaida = v.vst_data_saida;
        
        return {
          id: v.vst_id?.toString() || v.id,
          visitor_name: v.vst_nome || v.visitor_name,
          cpf: v.vst_documento || v.cpf || 'N/A',
          visit_date: validadeInicio,
          visit_time: validadeInicio ? DateTime.fromSQL(validadeInicio).toFormat('HH:mm') : 'N/A',
          qr_code: v.vst_qrcode_hash || v.qr_code,
          status: v.vst_status || v.status,
          created_at: v.created_at,
          phone: v.phone || null,
          vehicle_plate: v.vehicle_plate || null,
          notes: v.notes || null,
          entry_time: dataEntrada ? DateTime.fromSQL(dataEntrada).toFormat('HH:mm') : null,
          exit_time: dataSaida ? DateTime.fromSQL(dataSaida).toFormat('HH:mm') : null,
        };
      }));
      
      setHistoryVisitors(historico.map(v => {
        const validadeInicio = v.vst_validade_inicio || v.visit_date;
        const dataEntrada = v.vst_data_entrada;
        const dataSaida = v.vst_data_saida;
        
        return {
          id: v.vst_id?.toString() || v.id,
          visitor_name: v.vst_nome || v.visitor_name,
          cpf: v.vst_documento || v.cpf || 'N/A',
          visit_date: validadeInicio,
          entry_time: dataEntrada ? DateTime.fromSQL(dataEntrada).toFormat('HH:mm') : null,
          exit_time: dataSaida ? DateTime.fromSQL(dataSaida).toFormat('HH:mm') : null,
          status: v.vst_status || v.status,
          qr_code: v.vst_qrcode_hash || v.qr_code
        };
      }));
      
    } catch (error) {
      console.error('❌ Erro ao carregar visitantes:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os visitantes. Usando dados locais.'
      );
      // Mantém dados mock em caso de erro
      setUpcomingVisitors(upcomingVisitorsData);
      setHistoryVisitors(accessHistoryData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carrega visitantes ao abrir a tela
  useFocusEffect(
    useCallback(() => {
      carregarVisitantes();
    }, [])
  );

  const handleAddVisitor = () => {
    navigation.navigate('AuthorizeVisitor');
  };

  const handleVisitorPress = (visitor) => {
    setSelectedVisitor(visitor);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedVisitor(null), 300);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarVisitantes(false);
  }, []);

  const filteredData = selectedTab === 'upcoming' 
    ? upcomingVisitors.filter(v => 
        v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : historyVisitors.filter(v => 
        v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Users size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>
        {selectedTab === 'upcoming' 
          ? 'Nenhum visitante agendado' 
          : 'Sem histórico de acessos'}
      </Text>
      <Text style={styles.emptyText}>
        {selectedTab === 'upcoming'
          ? 'Autorize visitantes para permitir acesso ao condomínio'
          : 'O histórico de acessos aparecerá aqui'}
      </Text>
      {selectedTab === 'upcoming' && (
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleAddVisitor}
        >
          <Plus size={20} color="#FFF" />
          <Text style={styles.emptyButtonText}>Autorizar Visitante</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderUpcomingCard = ({ item }) => (
    <VisitorCard item={item} theme={theme} onPress={() => handleVisitorPress(item)} />
  );

  const renderHistoryCard = ({ item }) => (
    <HistoryCard item={item} theme={theme} onPress={() => handleVisitorPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs de Navegação */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Calendar size={20} color={selectedTab === 'upcoming' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[
            styles.tabText,
            selectedTab === 'upcoming' ? styles.activeTabText : styles.inactiveTabText
          ]}>
            Próximos
          </Text>
          {upcomingVisitors.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{upcomingVisitors.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Clock size={20} color={selectedTab === 'history' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[
            styles.tabText,
            selectedTab === 'history' ? styles.activeTabText : styles.inactiveTabText
          ]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar visitante..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando visitantes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={selectedTab === 'upcoming' ? renderUpcomingCard : renderHistoryCard}
          contentContainerStyle={[
            styles.listContainer,
            filteredData.length === 0 && styles.listContainerEmpty
          ]}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB - Adicionar Visitante */}
      <Animatable.View 
        animation="bounceIn" 
        delay={300}
        style={styles.fabWrapper}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddVisitor}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Adicionar novo visitante"
        >
          <Plus size={28} color="#FFF" />
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal de Detalhes */}
      <VisitorDetailsModal
        visible={modalVisible}
        visitor={selectedVisitor}
        onClose={handleCloseModal}
        theme={theme}
      />
    </SafeAreaView>
  );
};

export default VisitantesScreen;
