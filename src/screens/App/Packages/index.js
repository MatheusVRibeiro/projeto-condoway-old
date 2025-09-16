import React, { useCallback } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useTheme } from '../../../contexts/ThemeProvider';
import { styles } from './styles';

// Componentes reutilizáveis
import SearchBar from '../../../components/SearchBar';
import PackageModal from '../../../components/PackageModal';
import PackageHeader from '../../../components/PackageHeader';
import FilterPanel from '../../../components/FilterPanel';
import TabsNavigation from '../../../components/TabsNavigation';
import LoadingState from '../../../components/LoadingState';
import PackageList from '../../../components/PackageList';
import FloatingActionButton from '../../../components/FloatingActionButton';

// Hooks customizados
import { usePackages } from '../../../hooks/usePackages';
import useModal from '../../../hooks/useModal';
import useQRScanner from '../../../hooks/useQRScanner';

export default function Packages() {
  const { theme } = useTheme();
  
  // Hooks customizados
  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    showFilters, setShowFilters,
    sortBy, setSortBy,
    refreshing, onRefresh,
    awaitingPickup,
    delivered,
    packages,
    groupedAwaitingPickup,
    groupedDelivered
  } = usePackages();

  const { isVisible: modalVisible, selectedItem: selectedPackage, openModal, closeModal } = useModal();
  const { openQRScanner } = useQRScanner();

  // Callbacks memoizados para performance
  const handleOpenModal = useCallback((pkg) => {
    openModal(pkg);
  }, [openModal]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters, setShowFilters]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        
        <PackageHeader 
          awaitingCount={awaitingPickup.length}
          deliveredCount={delivered.length}
          totalCount={packages.length}
          styles={styles}
        />

        <SearchBar 
          value={searchTerm}
          onChangeText={setSearchTerm}
          onToggleFilters={handleToggleFilters}
          placeholder="Buscar por loja ou código..."
        />

        <FilterPanel 
          visible={showFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          styles={styles}
        />

        <TabsNavigation 
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
          awaitingCount={awaitingPickup.length}
          deliveredCount={delivered.length}
          styles={styles}
        />

        <View style={styles.tabContent}>
          {refreshing ? (
            <LoadingState message="Carregando encomendas..." />
          ) : (
            <PackageList 
              sections={statusFilter === 'Entregue' ? groupedDelivered : groupedAwaitingPickup}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onItemPress={handleOpenModal}
              emptyMessage={
                statusFilter === 'Entregue' 
                  ? "O seu histórico de retiradas está vazio." 
                  : "Nenhuma encomenda aguardando retirada!"
              }
              isAwaitingTab={statusFilter === 'Aguardando'}
              styles={styles}
            />
          )}
        </View>
      </View>

      <PackageModal 
        visible={modalVisible}
        onClose={closeModal}
        package={selectedPackage}
      />

      <FloatingActionButton 
        onPress={openQRScanner}
        styles={styles}
      />
    </SafeAreaView>
  );
}
