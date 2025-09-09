import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, Modal, SectionList, RefreshControl, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../contexts/ThemeProvider';
import { styles } from './styles';
import { allPackages } from './mock';
import { Package, PackageCheck, Search, X, Calendar, Hash, CheckCircle, Filter, QrCode } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Componentes Internos ---

const statusBadge = (status, theme) => {
  if (status === 'Aguardando') return (
    <Text style={{ backgroundColor: theme.colors.primary, color: '#ffffff', fontWeight: 'bold', fontSize: 11, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
      Aguardando retirada
    </Text>
  );
  if (status === 'Entregue') return (
    <Text style={{ backgroundColor: '#22c55e', color: '#ffffff', fontWeight: 'bold', fontSize: 11, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
      Retirada
    </Text>
  );
  return null;
};

const PackageCard = ({ item, onPress, theme }) => {
  const isAwaitingPickup = item.status === 'Aguardando';
  const isDelivered = item.status === 'Entregue';

  const getDaysWaiting = () => {
    const today = new Date();
    const arrival = new Date(item.arrivalDate);
    const diffTime = Math.abs(today - arrival);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Animatable.View animation="fadeInUp" duration={500}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.packageCard,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          item.status === 'Aguardando' && { borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
          item.status === 'Entregue' && { opacity: 0.85 },
          pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 }
        ]}
        android_ripple={{ color: theme.colors.border }}
      >
        <View style={[styles.storeIconContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}> 
          <Text style={[styles.storeIconText, { color: theme.colors.text }]}>{item.store.substring(0,4).toUpperCase()}</Text>
        </View>
        <View style={styles.packageInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={[styles.packageStore, { color: theme.colors.text }]}>{item.store}</Text>
            {statusBadge(item.status, theme)}
          </View>
          <Text style={[styles.packageDetails, { color: theme.colors.textSecondary }]}>Cód: {item.trackingCode || 'Não informado'}</Text>
          <Text style={[styles.packageDetails, { color: theme.colors.textSecondary }]}>Chegou em: {new Date(item.arrivalDate).toLocaleDateString('pt-BR')}</Text>
          {isAwaitingPickup && (
            <Text style={[styles.packageDetails, { color: theme.colors.textSecondary }]}>
              Aguardando há {getDaysWaiting()} dia(s)
            </Text>
          )}
          {item.status === 'Entregue' && item.confirmedBy && (
            <Text style={[styles.packageDetails, { color: '#22c55e', fontWeight: 'bold' }]}>Retirado por: {item.confirmedBy} em {new Date(item.confirmedAt).toLocaleDateString('pt-BR')} {new Date(item.confirmedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          )}
        </View>
      </Pressable>
    </Animatable.View>
  );
};

const EmptyState = ({ message, theme }) => (
  <View style={styles.emptyStateContainer}>
    <PackageCheck color={theme.colors.textSecondary} size={48} />
    <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>{message}</Text>
  </View>
);

const DetailRow = ({ icon: Icon, label, value, copyable, theme }) => (
  <View style={styles.modalDetailRow}>
    <Icon color={theme.colors.textSecondary} size={18} style={styles.modalDetailIcon} />
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View>
        <Text style={[styles.modalDetailLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.modalDetailValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
      {copyable && value && (
        <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(value); Toast.show({ type: 'info', text1: 'Código copiado!' }); }} style={{ marginLeft: 8, padding: 4 }}>
          <Hash color={theme.colors.primary} size={18} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// --- Componente Principal da Tela ---

export default function Packages() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Aguardando');
  const [showFilters, setShowFilters] = useState(false);
  const [packages, setPackages] = useState(allPackages);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'store', 'status'

  // Estatísticas calculadas
  const awaitingPickup = useMemo(() => packages.filter(p => p.status === 'Aguardando'), [packages]);
  const delivered = useMemo(() => packages.filter(p => p.status === 'Entregue'), [packages]);
  
  const averageWaitingDays = useMemo(() => {
    if (awaitingPickup.length === 0) return 0;
    const totalDays = awaitingPickup.reduce((sum, pkg) => {
      const days = Math.ceil((new Date() - new Date(pkg.arrivalDate)) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    return Math.round(totalDays / awaitingPickup.length);
  }, [awaitingPickup]);

  const handleOpenModal = (pkg) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Toast.show({ 
      type: newState ? 'success' : 'info', 
      text1: newState ? 'Notificações ativadas!' : 'Notificações desativadas',
      text2: newState 
        ? 'Você será notificado quando chegarem novas encomendas.' 
        : 'Você não receberá mais alertas de encomendas.',
      position: 'bottom'
    });
  };

  const openQRScanner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Scanner QR Code',
      'Esta funcionalidade estará disponível em breve!\n\n✅ Escaneie o código QR da encomenda\n✅ Confirmação rápida de retirada\n✅ Histórico automático',
      [{ text: 'Ok', style: 'default' }]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setTimeout(() => {
      // Simular possível chegada de nova encomenda (30% de chance)
      const shouldAddNew = Math.random() < 0.3;
      
      if (shouldAddNew && packages.length < 15) {
        const newPackage = {
          id: Date.now(),
          store: ['Amazon', 'Mercado Livre', 'Shopee', 'Magazine Luiza'][Math.floor(Math.random() * 4)],
          trackingCode: `BR${Math.random().toString().slice(2, 15)}`,
          arrivalDate: new Date().toISOString(),
          status: 'Aguardando',
          description: 'Encomenda recém-chegada'
        };
        
        setPackages(prev => [newPackage, ...prev]);
        
        Toast.show({ 
          type: 'success', 
          text1: 'Nova encomenda chegou!', 
          text2: `Encomenda da ${newPackage.store} está disponível para retirada.`,
          position: 'bottom'
        });
      } else {
        Toast.show({ 
          type: 'success', 
          text1: 'Lista atualizada!',
          text2: 'Nenhuma nova encomenda no momento.',
          position: 'bottom'
        });
      }
      
      setRefreshing(false);
    }, 1500);
  }, [packages.length]);

  // Filtro por busca e status
  const filteredPackages = useMemo(() => {
    let filtered = packages;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.trackingCode && p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'store':
          return a.store.localeCompare(b.store);
        case 'status':
          return a.status.localeCompare(b.status);
        default: // 'date'
          return new Date(b.arrivalDate) - new Date(a.arrivalDate);
      }
    });
    
    return filtered;
  }, [packages, searchTerm, statusFilter, sortBy]);


  // Agrupamento por status (usando os já calculados no useMemo acima)
  const awaitingPickupFiltered = filteredPackages.filter(p => p.status === 'Aguardando');
  const deliveredFiltered = filteredPackages.filter(p => p.status === 'Entregue');

  // Agrupamento inteligente para aguardando retirada
  const groupedAwaitingPickup = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Domingo

    const sections = [
      { title: 'Hoje', data: [] },
      { title: 'Esta Semana', data: [] },
      { title: 'Anteriores', data: [] },
    ];
    awaitingPickupFiltered.forEach(pkg => {
      const arrival = new Date(pkg.arrivalDate);
      if (arrival >= startOfToday) {
        sections[0].data.push(pkg);
      } else if (arrival >= startOfWeek) {
        sections[1].data.push(pkg);
      } else {
        sections[2].data.push(pkg);
      }
    });
    return sections.filter(section => section.data.length > 0);
  }, [awaitingPickupFiltered]);

  // Agrupamento inteligente para retirados
  const groupedDelivered = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Domingo

    const sections = [
      { title: 'Hoje', data: [] },
      { title: 'Esta Semana', data: [] },
      { title: 'Anteriores', data: [] },
    ];
    deliveredFiltered.forEach(pkg => {
      const arrival = new Date(pkg.arrivalDate);
      if (arrival >= startOfToday) {
        sections[0].data.push(pkg);
      } else if (arrival >= startOfWeek) {
        sections[1].data.push(pkg);
      } else {
        sections[2].data.push(pkg);
      }
    });
    return sections.filter(section => section.data.length > 0);
  }, [deliveredFiltered]);


  const sectionHeader = (title) => (
    <View style={[styles.sectionHeaderContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionHeaderText, { color: theme.colors.textSecondary }]}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <BackButton style={{ alignSelf: 'flex-start' }} />
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Package color={theme.colors.primary} size={28} />
            <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>Minhas Encomendas</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Acompanhe os pacotes que chegaram para si.</Text>
          
          {/* Estatísticas rápidas */}
          <View style={[styles.statsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{awaitingPickup.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Aguardando</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.success }]}>{delivered.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Retiradas</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{packages.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Search color={theme.colors.textSecondary} size={20} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Buscar por loja ou código..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter color={theme.colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Animatable.View animation="fadeInDown" duration={300} style={[styles.filtersContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Ordenar por:</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'date', label: 'Data', icon: Calendar },
                { key: 'store', label: 'Loja', icon: Package },
                { key: 'status', label: 'Status', icon: CheckCircle }
              ].map(({ key, label, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterOption,
                    { backgroundColor: sortBy === key ? theme.colors.primary : 'transparent' }
                  ]}
                  onPress={() => setSortBy(key)}
                >
                  <Icon size={16} color={sortBy === key ? '#ffffff' : theme.colors.textSecondary} />
                  <Text style={[
                    styles.filterOptionText,
                    { color: sortBy === key ? '#ffffff' : theme.colors.text }
                  ]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animatable.View>
        )}

        <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card }]}> 
          <TouchableOpacity
            style={[styles.tabButton, { borderColor: theme.colors.border }, statusFilter === 'Aguardando' && { backgroundColor: theme.colors.primary }]
            }
            onPress={() => setStatusFilter('Aguardando')}
          >
            <Text style={[styles.tabText, { color: statusFilter === 'Aguardando' ? '#ffffff' : theme.colors.text }]}>
              Aguardando Retirada
            </Text>
            {awaitingPickup.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.tabBadgeText}>{awaitingPickup.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, { borderColor: theme.colors.border }, statusFilter === 'Entregue' && { backgroundColor: theme.colors.primary }]
            }
            onPress={() => setStatusFilter('Entregue')}
          >
            <Text style={[styles.tabText, { color: statusFilter === 'Entregue' ? '#ffffff' : theme.colors.text }]}>
              Retirados
            </Text>
            {delivered.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.tabBadgeText}>{delivered.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {refreshing ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>Carregando encomendas...</Text>
            </View>
          ) : statusFilter === 'Entregue' ? (
            <SectionList
              sections={groupedDelivered}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <PackageCard item={item} onPress={() => handleOpenModal(item)} theme={theme} />}
              renderSectionHeader={({ section: { title } }) => sectionHeader(title)}
              ListEmptyComponent={<EmptyState message="O seu histórico de retiradas está vazio." theme={theme} />}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
              contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <SectionList
              sections={groupedAwaitingPickup}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => <>
                <PackageCard item={item} onPress={() => handleOpenModal(item)} theme={theme} />
                <View style={{ height: 8 }} />
              </>}
              renderSectionHeader={({ section: { title } }) => sectionHeader(title)}
              ListEmptyComponent={<EmptyState message="Nenhuma encomenda aguardando retirada!" theme={theme} />}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
              contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={[styles.modalContent, { backgroundColor: theme.colors.card }] }>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{selectedPackage?.store}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            {selectedPackage && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  {statusBadge(selectedPackage.status, theme)}
                </View>
                
                <DetailRow icon={Calendar} label="Data de Chegada" value={new Date(selectedPackage.arrivalDate).toLocaleString('pt-BR', {dateStyle: 'long', timeStyle: 'short'})} theme={theme} />
                
                <DetailRow icon={Hash} label="Código de Rastreio" value={selectedPackage.trackingCode || 'Não informado'} copyable={!!selectedPackage.trackingCode} theme={theme} />
                
                {selectedPackage.deliveryDate && (
                  <DetailRow icon={Package} label="Data de Retirada" value={new Date(selectedPackage.deliveryDate).toLocaleString('pt-BR', {dateStyle: 'long', timeStyle: 'short'})} theme={theme} />
                )}
                
                <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.colors.primary }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.modalCloseButtonText, { color: '#ffffff' }]}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </Animatable.View>
        </View>
      </Modal>

      {/* Floating Action Button para QR Scanner */}
      <TouchableOpacity 
        style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
        onPress={openQRScanner}
        activeOpacity={0.8}
      >
        <QrCode size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
