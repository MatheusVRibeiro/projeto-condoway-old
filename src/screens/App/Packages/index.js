
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, Modal, SectionList, RefreshControl } from 'react-native';
import { styles } from './styles';
import { allPackages } from './mock';
import { Package, PackageCheck, Search, X, Calendar, Hash } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import BackButton from '../../../components/BackButton';

// --- Componentes Internos ---

const PackageCard = ({ item, onPress }) => {
  const isAwaitingPickup = item.status === 'awaiting_pickup';
  const getStoreIcon = (storeName) => (
    <View style={styles.storeIconContainer}>
      <Text style={styles.storeIconText}>{storeName.substring(0, 4).toUpperCase()}</Text>
    </View>
  );

  return (
    <Animatable.View animation="fadeInUp" duration={500}>
      <TouchableOpacity 
        onPress={onPress}
        style={[
          styles.packageCard,
          isAwaitingPickup ? styles.packageCardAwaiting : styles.packageCardDelivered
        ]}
      >
        {getStoreIcon(item.store)}
        <View style={styles.packageInfo}>
          <Text style={styles.packageStore}>{item.store}</Text>
          <Text style={styles.packageDetails}>Cód: {item.trackingCode || 'Não informado'}</Text>
          <Text style={styles.packageDetails}>
            Chegou em: {new Date(item.arrivalDate).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const EmptyState = ({ message }) => (
  <View style={styles.emptyStateContainer}>
    <PackageCheck color="#9ca3af" size={48} />
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <View style={styles.modalDetailRow}>
    <Icon color="#64748b" size={18} style={styles.modalDetailIcon} />
    <View>
      <Text style={styles.modalDetailLabel}>{label}</Text>
      <Text style={styles.modalDetailValue}>{value}</Text>
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

  const filteredPackages = useMemo(() => {
    if (!searchTerm) return allPackages;
    return allPackages.filter(p =>
      p.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.trackingCode && p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const awaitingPickup = filteredPackages.filter(p => p.status === 'awaiting_pickup');
  const delivered = filteredPackages.filter(p => p.status === 'delivered');

  const groupedDelivered = useMemo(() => {
    const groups = {};
    delivered.forEach(pkg => {
      const dateLabel = new Date(pkg.arrivalDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(pkg);
    });
    return Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
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

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'awaiting' && styles.tabButtonActive]}
            onPress={() => handleTabChange('awaiting')}
          >
            <Text style={[styles.tabText, activeTab === 'awaiting' && styles.tabTextActive]}>Aguardando Retirada</Text>
            {awaitingPickup.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{awaitingPickup.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'delivered' && styles.tabButtonActive]}
            onPress={() => handleTabChange('delivered')}
          >
            <Text style={[styles.tabText, activeTab === 'delivered' && styles.tabTextActive]}>Histórico</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'awaiting' ? (
            <FlatList
              data={awaitingPickup}
              renderItem={({ item }) => <PackageCard item={item} onPress={() => handleOpenModal(item)} />}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={<EmptyState message="Nenhuma encomenda para retirar!" />}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} tintColor={"#2563eb"} />}
            />
          ) : (
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
                <DetailRow icon={Calendar} label="Data de Chegada" value={new Date(selectedPackage.arrivalDate).toLocaleString('pt-BR', {dateStyle: 'long', timeStyle: 'short'})} />
                <DetailRow icon={Hash} label="Código de Rastreio" value={selectedPackage.trackingCode || 'Não informado'} />
                
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
