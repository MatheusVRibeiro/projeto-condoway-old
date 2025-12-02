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

// Helper para verificar se a validade expirou
const isExpired = (validadeFimString) => {
  if (!validadeFimString) return false;
  try {
    const validadeFimDate = new Date(validadeFimString);
    const hoje = new Date();
    
    // Resetar horários para comparar apenas datas
    validadeFimDate.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    
    return validadeFimDate < hoje;
  } catch (error) {
    return false;
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
      .map((v, index) => {
        const randomId = Math.random().toString();
        const vstId = v.vst_id || v.id;
        
        // Backend retorna campos em camelCase: nome, celular, documento, status, validadeInicio, validadeFim
        const nomeVisitante = v.nome || v.vst_nome || v.visitor_name;
        const documentoVisitante = v.documento || v.vst_documento || v.cpf;
        const celularVisitante = v.celular || v.vst_celular || v.phone;
        const statusVisitante = v.status || v.vst_status;
        
        // Data/hora: backend retorna validadeInicio e validadeFim (camelCase)
        const dataValidade = v.validadeInicio || v.validade_inicio || v.vst_validade_inicio || v.visit_date;
        const dataValidadeFim = v.validadeFim || v.validade_fim || v.vst_validade_fim;
        
        const qrCodeHash = v.qrcode_hash || v.vst_qrcode_hash || v.qr_code;
        const tipoVisita = v.tipo || v.vst_tipo;
        
        // Campos adicionais
        const moradorAutorizante = v.morador || v.morador_nome;
        const unidadeNumero = v.unidade || v.ap_numero;
        
        // Extrair hora da data
        const horaValidade = parseDateTime(dataValidade);
        
        // ⚠️ VERIFICAR SE A VALIDADE EXPIROU (antes de filtrar por aba)
        let statusFinal = statusVisitante || 'Aguardando';
        if (dataValidadeFim && statusFinal !== 'Entrou' && statusFinal !== 'Finalizado' && statusFinal !== 'Cancelado') {
          try {
            const validadeFimDate = new Date(dataValidadeFim);
            const hoje = new Date();
            
            // Resetar horários para comparar apenas datas
            validadeFimDate.setHours(0, 0, 0, 0);
            hoje.setHours(0, 0, 0, 0);
            
            // Se a data de validade fim for anterior a hoje, marcar como Cancelado
            if (validadeFimDate < hoje) {
              statusFinal = 'Cancelado';
              if (__DEV__) {
                console.log(`⚠️ [Visitantes] Visitante ${nomeVisitante} expirado: validade ${dataValidadeFim}`);
              }
            }
          } catch (error) {
            console.error('❌ [Visitantes] Erro ao verificar validade:', error);
          }
        }
        
        const mappedVisitor = {
          id: vstId ? vstId.toString() : randomId,
          vst_id: vstId || null,
          visitor_name: nomeVisitante || 'Visitante',
          cpf: documentoVisitante || null,
          phone: celularVisitante || null,
          visit_date: dataValidade || null,
          visit_date_end: dataValidadeFim || null,
          visit_time: horaValidade || null,
          qr_code: qrCodeHash || null,
          status: statusFinal,
          tipo: tipoVisita || 'agendado',
          sub_status: v.sub_status || v.vst_sub_status || null,
          vst_precisa_aprovacao: v.precisa_aprovacao || v.vst_precisa_aprovacao || false,
          // Campos extras
          morador: moradorAutorizante || null,
          unidade: unidadeNumero || null,
        };
        
        return mappedVisitor;
      })
      .filter(v => {
        // Filtrar por aba usando o status já atualizado (com verificação de expiração)
        const status = v.status;
        if (selectedTab === 'waiting') {
          return status !== 'Entrou' && status !== 'Finalizado' && status !== 'Cancelado';
        } else if (selectedTab === 'present') {
          return status === 'Entrou';
        } else {
          return status === 'Finalizado' || status === 'Cancelado';
        }
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
  
  console.log('🔍 [Visitantes] Debug Info:', {
    totalVisitantes: visitantes.length,
    filteredDataLength: filteredData.length,
    selectedTab,
    loading,
    loadError,
  });
  
  console.log('📋 [Visitantes] Primeiros 3 visitantes filtrados:', filteredData.slice(0, 3));

  const waitingCount = visitantes.filter(v => {
    const st = (v.status || v.vst_status || '').toString();
    const validadeFim = v.validadeFim || v.validade_fim || v.vst_validade_fim;
    
    // Se já está cancelado, entrou ou finalizado, não conta como aguardando
    if (st === 'Entrou' || st === 'Finalizado' || st === 'Cancelado') {
      return false;
    }
    
    // Se a validade expirou, não conta como aguardando (será cancelado automaticamente)
    if (isExpired(validadeFim)) {
      return false;
    }
    
    return true;
  }).length;

  const presentCount = visitantes.filter(v => {
    const status = v.status || v.vst_status;
    return status === 'Entrou';
  }).length;

  const historyCount = visitantes.filter(v => {
    const st = (v.status || v.vst_status || '').toString();
    const validadeFim = v.validadeFim || v.validade_fim || v.vst_validade_fim;
    
    // Conta como histórico se já está finalizado/cancelado ou se a validade expirou
    if (st === 'Finalizado' || st === 'Cancelado') {
      return true;
    }
    
    // Se a validade expirou, vai para histórico
    if (isExpired(validadeFim)) {
      return true;
    }
    
    return false;
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
    console.log('🎨 [Visitantes] Renderizando card:', { 
      index, 
      name: item.visitor_name,
      status: item.status,
      id: item.id 
    });
    
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
        totalCount={historyCount}
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

      <SearchBar
        placeholder="Buscar por nome ou CPF..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
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
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
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
