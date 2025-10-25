import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { Plus, Users, Calendar, Clock, AlertCircle, CheckCircle2, History, UserCheck } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../../contexts/ThemeProvider';
import { usePaginatedVisitantes } from '../../../hooks';
import SearchBar from '../../../components/SearchBar';
import VisitorHeader from '../../../components/VisitorHeader';
import VisitorCard from '../../../components/VisitorCard';
import VisitorModal from '../../../components/VisitorModal';
import LoadingState from '../../../components/LoadingState';
import createStyles from './styles';

// Criar FlatList animada
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Helper: Parse date string to extract time
const parseDateTime = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return null;
  }
};

// Main Screen Component
const VisitantesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // State
  const [selectedTab, setSelectedTab] = useState('waiting'); // 'waiting', 'present', 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // FAB animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);

  // ✅ Hook de paginação para visitantes
  const {
    visitantes,
    loading,
    loadingMore,
    refreshing,
    error: loadError,
    pagination,
    loadMore,
    refresh,
    updateFilters
  } = usePaginatedVisitantes({}, 20);

  // ✅ Helper para agrupar por data
  const groupByDate = (visitors) => {
    const groups = {};
    
    visitors.forEach(visitor => {
      const dateKey = visitor.visit_date?.split('T')[0] || 'Sem data';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(visitor);
    });
    
    // Ordenar datas (mais recente primeiro)
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (a === 'Sem data') return 1;
      if (b === 'Sem data') return -1;
      return new Date(b) - new Date(a);
    });
    
    return sortedDates.map(date => ({
      date,
      data: groups[date]
    }));
  };

  // ✅ Mapear visitantes do hook para formato esperado e separar por status
  // AGUARDANDO: Autorizados mas ainda não entraram
  const waitingVisitors = useMemo(() => {
    if (!visitantes || !Array.isArray(visitantes)) return [];
    
    const filtered = visitantes
      .filter(v => (v.vst_status || v.status) === 'Aguardando')
      .map(v => {
        const validadeInicio = v.vst_validade_inicio || v.visit_date;
        const dataEntrada = v.vst_data_entrada;
        const dataSaida = v.vst_data_saida;
        
        return {
          id: v.vst_id?.toString() || v.id,
          visitor_name: v.vst_nome || v.visitor_name,
          cpf: v.vst_documento || v.cpf || 'N/A',
          phone: v.vst_celular || v.phone || null,
          visit_date: validadeInicio,
          visit_time: parseDateTime(validadeInicio) || 'N/A',
          qr_code: v.vst_qrcode_hash || v.qr_code,
          status: v.vst_status || v.status,
          created_at: v.created_at,
          notes: v.notes || null,
          entry_time: parseDateTime(dataEntrada),
          exit_time: parseDateTime(dataSaida),
        };
      });
    
    return groupByDate(filtered);
  }, [visitantes]);

  // PRESENTES: Visitantes que já fizeram check-in (estão no condomínio)
  const presentVisitors = useMemo(() => {
    if (!visitantes || !Array.isArray(visitantes)) return [];
    
    const filtered = visitantes
      .filter(v => (v.vst_status || v.status) === 'Entrou')
      .map(v => {
        const validadeInicio = v.vst_validade_inicio || v.visit_date;
        const dataEntrada = v.vst_data_entrada;
        const dataSaida = v.vst_data_saida;
        
        return {
          id: v.vst_id?.toString() || v.id,
          visitor_name: v.vst_nome || v.visitor_name,
          cpf: v.vst_documento || v.cpf || 'N/A',
          phone: v.vst_celular || v.phone || null,
          visit_date: validadeInicio,
          visit_time: parseDateTime(validadeInicio) || 'N/A',
          qr_code: v.vst_qrcode_hash || v.qr_code,
          status: v.vst_status || v.status,
          created_at: v.created_at,
          notes: v.notes || null,
          entry_time: parseDateTime(dataEntrada),
          exit_time: parseDateTime(dataSaida),
        };
      });
    
    return groupByDate(filtered);
  }, [visitantes]);

  // HISTÓRICO: Finalizados (saíram) ou Cancelados
  const historyVisitors = useMemo(() => {
    if (!visitantes || !Array.isArray(visitantes)) return [];
    
    const filtered = visitantes
      .filter(v => ['Finalizado', 'Cancelado'].includes(v.vst_status || v.status))
      .map(v => {
        const validadeInicio = v.vst_validade_inicio || v.visit_date;
        const dataEntrada = v.vst_data_entrada;
        const dataSaida = v.vst_data_saida;
        
        return {
          id: v.vst_id?.toString() || v.id,
          visitor_name: v.vst_nome || v.visitor_name,
          cpf: v.vst_documento || v.cpf || 'N/A',
          phone: v.vst_celular || v.phone || null,
          visit_date: validadeInicio,
          entry_time: parseDateTime(dataEntrada),
          exit_time: parseDateTime(dataSaida),
          status: v.vst_status || v.status,
          qr_code: v.vst_qrcode_hash || v.qr_code
        };
      });
    
    return groupByDate(filtered);
  }, [visitantes]);

  // Carrega visitantes ao abrir a tela
  useFocusEffect(
    useCallback(() => {
      if (visitantes.length === 0 && !loading) {
        refresh();
      }
    }, [visitantes.length, loading, refresh])
  );

  // Handlers
  const handleAddVisitor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const handleTabChange = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
    setSearchQuery(''); // Reset search when changing tabs
  };

  const handleHeaderCardPress = (tabId) => {
    setSelectedTab(tabId);
    setSearchQuery('');
  };

  // Handlers para Quick Actions (Visitas Surpresa)
  const handleApproveVisitor = async (visitor) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // TODO: Implementar chamada à API para aprovar visitante surpresa
      console.log('Aprovar visitante surpresa:', visitor.id);
      // Após aprovação, visitante vai para "Presentes"
      await refresh();
    } catch (error) {
      console.error('Erro ao aprovar visitante:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRejectVisitor = async (visitor) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // TODO: Implementar chamada à API para recusar visitante surpresa
      console.log('Recusar visitante surpresa:', visitor.id);
      // Após recusa, visitante vai para "Histórico" com status "Recusado"
      await refresh();
    } catch (error) {
      console.error('Erro ao recusar visitante:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Handle scroll for FAB animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;

        // Hide FAB when scrolling down, show when scrolling up
        if (diff > 5 && fabScale._value === 1) {
          Animated.spring(fabScale, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        } else if (diff < -5 && fabScale._value === 0) {
          Animated.spring(fabScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }

        lastScrollY.current = currentScrollY;
      },
    }
  );

  // Filtrar por busca e flatten para lista simples
  const filteredData = useMemo(() => {
    let groupedData = [];
    
    if (selectedTab === 'waiting') {
      groupedData = waitingVisitors;
    } else if (selectedTab === 'present') {
      groupedData = presentVisitors;
    } else {
      groupedData = historyVisitors;
    }
    
    if (!searchQuery.trim()) {
      // Flatten grouped data mantendo separação por data
      return groupedData;
    }
    
    // Buscar e filtrar
    const query = searchQuery.toLowerCase().trim();
    const filteredGroups = groupedData
      .map(group => ({
        ...group,
        data: group.data.filter(v => 
          v.visitor_name?.toLowerCase().includes(query) ||
          v.cpf?.toLowerCase().includes(query)
        )
      }))
      .filter(group => group.data.length > 0);
    
    return filteredGroups;
  }, [selectedTab, waitingVisitors, presentVisitors, historyVisitors, searchQuery]);

  // Empty State Component
  const EmptyState = () => {
    const getEmptyStateConfig = () => {
      switch(selectedTab) {
        case 'waiting':
          return {
            title: 'Nenhum visitante aguardando',
            description: searchQuery 
              ? 'Tente usar outros termos de busca' 
              : 'Visitantes autorizados que ainda não chegaram aparecerão aqui',
            showButton: !searchQuery
          };
        case 'present':
          return {
            title: 'Nenhum visitante presente',
            description: searchQuery 
              ? 'Tente usar outros termos de busca' 
              : 'Visitantes que já fizeram check-in aparecerão aqui',
            showButton: false
          };
        case 'history':
          return {
            title: 'Sem histórico de acessos',
            description: searchQuery 
              ? 'Tente usar outros termos de busca' 
              : 'Visitas finalizadas e canceladas aparecerão aqui',
            showButton: false
          };
        default:
          return {
            title: 'Nenhum visitante',
            description: 'Não há visitantes para exibir',
            showButton: false
          };
      }
    };

    const config = getEmptyStateConfig();

    return (
      <Animatable.View 
        animation="fadeIn" 
        style={styles.emptyContainer}
      >
        <Users size={64} color={theme.colors.textSecondary} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>{config.title}</Text>
        <Text style={styles.emptyText}>{config.description}</Text>
        {config.showButton && (
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={handleAddVisitor}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.emptyButtonText}>Autorizar Visitante</Text>
          </TouchableOpacity>
        )}
      </Animatable.View>
    );
  };

  // Format date for section header (Agrupamento Relativo)
  const formatSectionDate = (dateString) => {
    if (dateString === 'Sem data') return 'SEM DATA';
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      // Hoje e Amanhã
      if (date.getTime() === today.getTime()) return 'HOJE';
      if (date.getTime() === tomorrow.getTime()) return 'AMANHÃ';
      
      // Próximos 7 dias
      if (date > tomorrow && date < nextWeek) {
        return date.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
      }
      
      // Mais de 7 dias
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short'
      }).toUpperCase().replace('.', '');
    } catch {
      return dateString;
    }
  };

  // Render Section Header (Estilo Moderno - Alinhado à Esquerda)
  const renderSectionHeader = (date) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {formatSectionDate(date)}
      </Text>
    </View>
  );

  // Flatten data for FlatList with section headers
  const flattenedData = useMemo(() => {
    const result = [];
    filteredData.forEach((group, groupIndex) => {
      // Add section header
      result.push({
        id: `section-${group.date}`,
        type: 'section',
        date: group.date,
        groupIndex
      });
      // Add items
      group.data.forEach((item, itemIndex) => {
        result.push({
          ...item,
          type: 'item',
          groupIndex,
          itemIndex
        });
      });
    });
    return result;
  }, [filteredData]);

  // Render Card or Section
  const renderItem = ({ item, index }) => {
    if (item.type === 'section') {
      return renderSectionHeader(item.date);
    }
    
    return (
      <VisitorCard 
        item={item} 
        index={item.itemIndex}
        onPress={handleVisitorPress}
        onApprove={handleApproveVisitor}
        onReject={handleRejectVisitor}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedFlatList
        data={flattenedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <>
            {/* Header com Estatísticas */}
            <VisitorHeader 
              awaitingCount={waitingVisitors.reduce((acc, g) => acc + g.data.length, 0)}
              approvedCount={presentVisitors.reduce((acc, g) => acc + g.data.length, 0)}
              totalCount={visitantes.length}
              onCardPress={handleHeaderCardPress}
            />

            <View style={styles.contentWrapper}>
              {/* Tabs de Navegação por Status */}
              <View style={styles.tabContainer}>
                {/* Tab: Aguardando */}
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'waiting' && styles.activeTab]}
                  onPress={() => handleTabChange('waiting')}
                  activeOpacity={0.7}
                >
                  <AlertCircle 
                    size={18} 
                    color={selectedTab === 'waiting' ? '#FFFFFF' : theme.colors.textSecondary} 
                    strokeWidth={2.5}
                  />
                  <Text style={[
                    styles.tabText,
                    selectedTab === 'waiting' ? styles.activeTabText : styles.inactiveTabText
                  ]}>
                    Aguardando
                  </Text>
                </TouchableOpacity>

                {/* Tab: Presentes */}
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'present' && styles.activeTab]}
                  onPress={() => handleTabChange('present')}
                  activeOpacity={0.7}
                >
                  <UserCheck 
                    size={18} 
                    color={selectedTab === 'present' ? '#FFFFFF' : theme.colors.textSecondary} 
                    strokeWidth={2.5}
                  />
                  <Text style={[
                    styles.tabText,
                    selectedTab === 'present' ? styles.activeTabText : styles.inactiveTabText
                  ]}>
                    Presentes
                  </Text>
                </TouchableOpacity>

                {/* Tab: Histórico */}
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
                  onPress={() => handleTabChange('history')}
                  activeOpacity={0.7}
                >
                  <History 
                    size={18} 
                    color={selectedTab === 'history' ? '#FFFFFF' : theme.colors.textSecondary} 
                    strokeWidth={2.5}
                  />
                  <Text style={[
                    styles.tabText,
                    selectedTab === 'history' ? styles.activeTabText : styles.inactiveTabText
                  ]}>
                    Histórico
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Barra de Busca */}
              <SearchBar
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </>
        )}
        contentContainerStyle={[
          styles.listContainer,
          flattenedData.length === 0 && styles.listContainerEmpty
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListFooterComponent={() => {
          if (!loadingMore) return null;
          return (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingMoreText}>
                Carregando mais visitantes...
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={() => {
          if (loading && visitantes.length === 0) {
            return <LoadingState message="Carregando visitantes..." />;
          }
          
          if (loadError) {
            return (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {loadError}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={refresh}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            );
          }
          return <EmptyState />;
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* FAB - Adicionar Visitante */}
      <Animated.View 
        style={[
          styles.fabWrapper,
          {
            transform: [
              { scale: fabScale },
              {
                translateY: fabScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: fabScale,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddVisitor}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Autorizar novo visitante"
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal de Detalhes */}
      <VisitorModal
        visible={modalVisible}
        visitor={selectedVisitor}
        onClose={handleCloseModal}
        onRefresh={refresh}
      />
    </SafeAreaView>
  );
};

export default VisitantesScreen;
