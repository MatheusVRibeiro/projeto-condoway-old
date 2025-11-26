import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { isToday, isThisWeek, parseISO } from 'date-fns';
import { useTheme } from '../../../contexts/ThemeProvider';

// Componentes modernizados
import SearchBar from '../../../components/SearchBar';
import PackageModal from '../../../components/PackageModal';
import PackageHeader from '../../../components/PackageHeader';
import PackageCard from '../../../components/PackageCard';
import TabsNavigation from '../../../components/TabsNavigation';
import LoadingState from '../../../components/LoadingState';

// Hooks customizados
import { usePackages } from '../../../hooks/usePackages';
import useModal from '../../../hooks/useModal';


export default function Packages() {
  const { theme } = useTheme();
  
  // Hooks customizados
  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    refreshing, onRefresh,
    awaitingPickup,
    delivered,
    packages,
    loading,
  } = usePackages();

  const { isVisible: modalVisible, selectedItem: selectedPackage, openModal, closeModal } = useModal();

  // Callbacks memoizados para performance
  const handleOpenModal = useCallback((pkg) => {
    openModal(pkg);
  }, [openModal]);

  

  // Filtrar pacotes baseado na busca por loja e código
  const filteredPackages = useMemo(() => {
    const basePackages = statusFilter === 'Aguardando' ? awaitingPickup : delivered;
    
    if (!searchTerm) return basePackages;
    
    const query = searchTerm.toLowerCase().trim();
    return basePackages.filter(pkg => 
      pkg.store?.toLowerCase().includes(query) ||
      pkg.trackingCode?.toLowerCase().includes(query)
    );
  }, [searchTerm, statusFilter, awaitingPickup, delivered]);

  // Agrupar por data (Hoje, Esta Semana, Anteriores)
  const groupedPackages = useMemo(() => {
    const groups = {
      today: [],
      thisWeek: [],
      older: []
    };

    filteredPackages.forEach(pkg => {
      try {
        const date = parseISO(pkg.arrivalDate);
        
        if (isToday(date)) {
          groups.today.push(pkg);
        } else if (isThisWeek(date, { weekStartsOn: 0 })) {
          groups.thisWeek.push(pkg);
        } else {
          groups.older.push(pkg);
        }
      } catch (error) {
        groups.older.push(pkg);
      }
    });

    return groups;
  }, [filteredPackages]);

  // Renderizar seção
  const renderSection = (title, data) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {data.map((pkg, index) => (
          <PackageCard
            key={pkg.id}
            item={pkg}
            index={index}
            onPress={handleOpenModal}
          />
        ))}
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <Animatable.View 
      animation="fadeIn" 
      style={[styles.emptyState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <Package size={64} color={theme.colors.textSecondary} strokeWidth={1.5} />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
        Nenhuma encomenda encontrada
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
        {statusFilter === 'Entregue' 
          ? "Seu histórico de retiradas está vazio." 
          : searchTerm 
            ? "Tente usar outros termos de busca."
            : "Nenhuma encomenda aguardando retirada!"}
      </Text>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header com Estatísticas */}
      <PackageHeader 
        awaitingCount={awaitingPickup.length}
        deliveredCount={delivered.length}
        totalCount={packages.length}
      />

      <View style={styles.contentWrapper}>
        {/* Tabs de Navegação */}
        <TabsNavigation 
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
          awaitingCount={awaitingPickup.length}
          deliveredCount={delivered.length}
        />

        {/* Barra de Busca */}
        <SearchBar 
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Buscar por loja ou código..."
        />

        {/* Lista de Pacotes */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <LoadingState message="Carregando encomendas..." />
          ) : filteredPackages.length > 0 ? (
            <>
              {renderSection('Hoje', groupedPackages.today)}
              {renderSection('Esta Semana', groupedPackages.thisWeek)}
              {renderSection('Anteriores', groupedPackages.older)}
            </>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </View>

      {/* Modal de Detalhes */}
      <PackageModal 
        visible={modalVisible}
        onClose={closeModal}
        package={selectedPackage}
      />

      {/* Floating Action Button removed as per request (camera icon) */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  
});
