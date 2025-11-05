import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, AlertCircle, UserCheck, History } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../../contexts/ThemeProvider';
import { usePaginatedVisitantes } from '../../../hooks';
import SearchBar from '../../../components/SearchBar';
import VisitorHeader from '../../../components/VisitorHeader';
import VisitorCard from '../../../components/VisitorCard';
import VisitorModal from '../../../components/VisitorModal';
import createStyles from './styles';

const parseDateTime = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
  } catch (error) {
    return null;
  }
};

const VisitantesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('waiting');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const hookResult = usePaginatedVisitantes() || {};
  const visitantes = hookResult.visitantes || [];
  const pagination = hookResult.pagination || {};
  const loading = hookResult.loading || false;
  const loadingMore = hookResult.loadingMore || false;
  const refreshing = hookResult.refreshing || false;
  const loadError = hookResult.error;
  const loadMore = hookResult.loadMore || (() => {});
  const refresh = hookResult.refresh || (() => {});

  const getFilteredVisitors = () => {
    if (!Array.isArray(visitantes)) return [];

    return visitantes
      .filter(v => {
        const status = (v.vst_status || v.status || '').toString();
        if (selectedTab === 'waiting') {
          return status !== 'Entrou' && status !== 'Finalizado' && status !== 'Cancelado';
        } else if (selectedTab === 'present') {
          return status === 'Entrou';
        } else {
          return status === 'Finalizado' || status === 'Cancelado';
        }
      })
      .map(v => {
        const randomId = Math.random().toString();
        const vstId = v.vst_id ? v.vst_id.toString() : null;
        const genId = v.id ? v.id.toString() : null;
        
        return {
          id: vstId || genId || randomId,
          visitor_name: v.vst_nome || v.visitor_name || 'Visitante',
          cpf: v.vst_documento || v.cpf || 'N/A',
          phone: v.vst_celular || v.phone || null,
          visit_date: v.vst_validade_inicio || v.visit_date,
          visit_time: parseDateTime(v.vst_validade_inicio || v.visit_date) || 'N/A',
          qr_code: v.vst_qrcode_hash || v.qr_code,
          status: v.vst_status || v.status,
        };
      })
      .filter(v => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const name = v.visitor_name ? v.visitor_name.toLowerCase() : '';
        const doc = v.cpf ? v.cpf.toLowerCase() : '';
        return name.includes(query) || doc.includes(query);
      });
  };

  const filteredData = getFilteredVisitors();

  const waitingCount = visitantes.filter(v => {
    const st = (v.vst_status || v.status || '').toString();
    return st !== 'Entrou' && st !== 'Finalizado' && st !== 'Cancelado';
  }).length;

  const presentCount = visitantes.filter(v => {
    const status = v.vst_status || v.status;
    return status === 'Entrou';
  }).length;

  useFocusEffect(
    useCallback(() => {
      if (visitantes.length === 0 && !loading && refresh) {
        refresh();
      }
    }, [visitantes, loading, refresh])
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

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setSearchQuery('');
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Carregando visitantes...</Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#E74C3C" />
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const titles = {
      waiting: 'Nenhum visitante aguardando',
      present: 'Nenhum visitante presente',
      history: 'Sem histórico'
    };

    return (
      <View style={styles.emptyContainer}>
        <AlertCircle size={64} color={theme.colors.textSecondary} opacity={0.3} />
        <Text style={styles.emptyTitle}>{titles[selectedTab]}</Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 'Tente outros termos de busca' : 'Nenhum visitante nesta categoria'}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <VisitorCard 
        item={item} 
        index={index}
        onPress={handleVisitorPress}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <VisitorHeader 
        awaitingCount={waitingCount}
        approvedCount={presentCount}
        totalCount={visitantes.length}
        onCardPress={handleTabChange}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'waiting' && styles.activeTab]}
          onPress={() => handleTabChange('waiting')}
        >
          <AlertCircle 
            size={18} 
            color={selectedTab === 'waiting' ? '#FFFFFF' : theme.colors.textSecondary} 
          />
          <Text style={[styles.tabText, selectedTab === 'waiting' ? styles.activeTabText : styles.inactiveTabText]}>
            Aguardando
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'present' && styles.activeTab]}
          onPress={() => handleTabChange('present')}
        >
          <UserCheck 
            size={18} 
            color={selectedTab === 'present' ? '#FFFFFF' : theme.colors.textSecondary} 
          />
          <Text style={[styles.tabText, selectedTab === 'present' ? styles.activeTabText : styles.inactiveTabText]}>
            Presentes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => handleTabChange('history')}
        >
          <History 
            size={18} 
            color={selectedTab === 'history' ? '#FFFFFF' : theme.colors.textSecondary} 
          />
          <Text style={[styles.tabText, selectedTab === 'history' ? styles.activeTabText : styles.inactiveTabText]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <SearchBar
          placeholder="Buscar por nome ou CPF..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          filteredData.length === 0 && styles.listContainerEmpty
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : null}
      />

      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fab} onPress={handleAddVisitor}>
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

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
