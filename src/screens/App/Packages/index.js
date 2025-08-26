import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, Modal, SectionList, RefreshControl, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { styles } from './styles';
import { allPackages } from './mock';
import { Package, PackageCheck, Search, X, Calendar, Hash } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/BackButton';

// --- Componentes Internos ---

const statusBadge = (status) => {
  if (status === 'awaiting_pickup') return <Text style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', fontSize: 11, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>Aguardando retirada</Text>;
  if (status === 'delivered') return <Text style={{ backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', fontSize: 11, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>Retirada</Text>;
  return null;
};

const PackageCard = ({ item, onPress }) => {
  const isAwaitingPickup = item.status === 'awaiting_pickup';
  // const isPendingConfirmation = item.status === 'pending_confirmation';
  const isDelivered = item.status === 'delivered';
  const getStoreIcon = (storeName) => (
    <View style={styles.storeIconContainer}>
      <Text style={styles.storeIconText}>{storeName.substring(0, 4).toUpperCase()}</Text>
    </View>
  );

  return (
    <Animatable.View animation="fadeInUp" duration={500}>
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          styles.packageCard,
          isAwaitingPickup ? styles.packageCardAwaiting : isDelivered ? styles.packageCardDelivered : {},
          pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 }
        ]}
        android_ripple={{ color: '#e0e7ef' }}
      >
        {getStoreIcon(item.store)}
        <View style={styles.packageInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={styles.packageStore}>{item.store}</Text>
            {statusBadge(item.status)}
          </View>
          <Text style={styles.packageDetails}>Cód: {item.trackingCode || 'Não informado'}</Text>
          <Text style={styles.packageDetails}>
            Chegou em: {new Date(item.arrivalDate).toLocaleDateString('pt-BR')}
          </Text>
          {/* Mensagem aguardando confirmação removida */}
          {item.status === 'delivered' && item.confirmedBy && (
            <Text style={[styles.packageDetails, { color: '#22c55e', fontWeight: 'bold' }]}>Retirado por: {item.confirmedBy} em {new Date(item.confirmedAt).toLocaleDateString('pt-BR')} {new Date(item.confirmedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          )}
        </View>
      </Pressable>
    </Animatable.View>
  );
};

const EmptyState = ({ message }) => (
  <View style={styles.emptyStateContainer}>
    <PackageCheck color="#9ca3af" size={48} />
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const DetailRow = ({ icon: Icon, label, value, copyable }) => (
  <View style={styles.modalDetailRow}>
    <Icon color="#64748b" size={18} style={styles.modalDetailIcon} />
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View>
        <Text style={styles.modalDetailLabel}>{label}</Text>
        <Text style={styles.modalDetailValue}>{value}</Text>
      </View>
      {copyable && value && (
        <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(value); Toast.show({ type: 'info', text1: 'Código copiado!' }); }} style={{ marginLeft: 8, padding: 4 }}>
          <Hash color="#2563eb" size={18} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// --- Componente Principal da Tela ---

export default function Packages() {
  const [activeTab, setActiveTab] = useState('awaiting');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleTabChange = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleOpenModal = (pkg) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
  };
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => {
      // Aqui você faria a chamada à API para buscar novos dados
      setRefreshing(false);
      Toast.show({ type: 'success', text1: 'Lista de encomendas atualizada!' });
    }, 1000);
  }, []);

  // Filtro por busca e status
  const filteredPackages = useMemo(() => {
    let filtered = allPackages;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.trackingCode && p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    return filtered;
  }, [searchTerm, statusFilter]);


  // Agrupamento por status
  const awaitingPickup = filteredPackages.filter(p => p.status === 'awaiting_pickup');
  const delivered = filteredPackages.filter(p => p.status === 'delivered');

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
    awaitingPickup.forEach(pkg => {
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
  }, [awaitingPickup]);

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
    delivered.forEach(pkg => {
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
  }, [delivered]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BackButton style={{ alignSelf: 'flex-start' }} />
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Package color="#2563eb" size={28} />
            <Text style={styles.headerTitleText}>Minhas Encomendas</Text>
          </View>
          <Text style={styles.headerSubtitle}>Acompanhe os pacotes que chegaram para si.</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#9ca3af" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por loja ou código..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Filtros de status */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, statusFilter === 'awaiting_pickup' && styles.tabButtonActive]}
            onPress={() => setStatusFilter('awaiting_pickup')}
          >
            <Text style={[styles.tabText, statusFilter === 'awaiting_pickup' && styles.tabTextActive]}>Aguardando Retirada</Text>
            {awaitingPickup.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{awaitingPickup.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, statusFilter === 'delivered' && styles.tabButtonActive]}
            onPress={() => setStatusFilter('delivered')}
          >
            <Text style={[styles.tabText, statusFilter === 'delivered' && styles.tabTextActive]}>Retirados</Text>
            {delivered.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{delivered.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {/* Skeleton loading */}
          {refreshing ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: '#64748b', fontSize: 16 }}>Carregando encomendas...</Text>
            </View>
          ) : statusFilter === 'delivered' ? (
            <SectionList
              sections={groupedDelivered}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <PackageCard item={item} onPress={() => handleOpenModal(item)} />}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              ListEmptyComponent={<EmptyState message="O seu histórico de retiradas está vazio." />}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} tintColor={"#2563eb"} />}
            />
          ) : (
            <SectionList
              sections={groupedAwaitingPickup}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => <>
                <PackageCard item={item} onPress={() => handleOpenModal(item)} />
                <View style={{ height: 8 }} />
              </>}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              ListEmptyComponent={<EmptyState message="Nenhuma encomenda aguardando retirada!" />}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} tintColor={"#2563eb"} />}
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
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPackage?.store}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            {selectedPackage && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {statusBadge(selectedPackage.status)}
                </View>
                <DetailRow icon={Calendar} label="Data de Chegada" value={new Date(selectedPackage.arrivalDate).toLocaleString('pt-BR', {dateStyle: 'long', timeStyle: 'short'})} />
                <DetailRow icon={Hash} label="Código de Rastreio" value={selectedPackage.trackingCode || 'Não informado'} copyable={!!selectedPackage.trackingCode} />
                {/* Botão de confirmação removido, status será atualizado via API pelo porteiro/síndico */}
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
