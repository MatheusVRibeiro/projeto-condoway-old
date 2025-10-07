import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Bell, AlertTriangle, Box, Info, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import styles from './styles';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useNotifications } from '../../../contexts/NotificationProvider';

const priorities = [
  { key: 'todos', label: 'Todos' },
  { key: 'baixa', label: 'Baixa' },
  { key: 'media', label: 'Média' },
  { key: 'alta', label: 'Alta' },
];

function groupByDate(notifications) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const sections = [];
  const byDate = {};
  
  notifications.forEach(n => {
    const notificationDate = n.timestamp.toISOString().slice(0, 10);
    let label = notificationDate === today ? 'Hoje' :
      notificationDate === yesterday ? 'Ontem' :
      n.timestamp.toLocaleDateString('pt-BR');
    if (!byDate[label]) byDate[label] = [];
    byDate[label].push(n);
  });
  
  Object.entries(byDate).forEach(([title, data]) => { 
    sections.push({ title, data }); 
  });
  return sections;
}

export default function Notifications() {
  const { theme } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    loadingMore,
    pagination,
    lastCheck,
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    refreshNotifications,
    loadMore
  } = useNotifications();
  
  const [filter, setFilter] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications(true);
    setRefreshing(false);
  };

  // 1. FILTRA AS NOTIFICAÇÕES PELA PRIORIDADE SELECIONADA
  const filteredNotifications = useMemo(() => {
    if (filter === 'todos') {
      return notifications;
    }
    // Usa o novo campo 'priority'
    return notifications.filter(n => n.priority === filter);
  }, [filter, notifications]);
  
  // 2. AGRUPA POR DATA E CONVERTE PARA ARRAY PLANO COM HEADERS
  const flatData = useMemo(() => {
    const sections = groupByDate(filteredNotifications);
    const items = [];
    sections.forEach(section => {
      items.push({ type: 'header', title: section.title });
      section.data.forEach(notification => {
        items.push({ type: 'item', data: notification });
      });
    });
    return items;
  }, [filteredNotifications]);

  function handleMarkAllAsRead() {
    markAllAsRead();
    Alert.alert('Pronto!', 'Todas as notificações foram marcadas como lidas.');
  }

  function handleDeleteNotification(id) {
    Alert.alert(
      'Excluir Notificação',
      'Esta notificação será removida apenas da sua visualização local.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removeNotification(id) },
      ]
    );
  }

  const priorityColors = {
    alta: { bg: theme.colors.error + '22', text: theme.colors.error },
    media: { bg: theme.colors.warning + '22', text: theme.colors.warning },
    baixa: { bg: theme.colors.info + '22', text: theme.colors.info },
    default: { bg: theme.colors.card, text: theme.colors.textSecondary },
  };

  function getPriorityDotColor(priority) {
    // Usa a prioridade diretamente
    return (priorityColors[priority] || priorityColors.default).text;
  }

  function renderIcon(type, priority) {
    // Usa a prioridade para a cor
    const color = getPriorityDotColor(priority);
    switch (type) {
      case 'entrega': return <Box color={color} size={22} strokeWidth={2.2} />;
      case 'aviso': return <Info color={color} size={22} strokeWidth={2.2} />;
      case 'mensagem': return <Bell color={color} size={22} strokeWidth={2.2} />;
      default: return <AlertTriangle color={color} size={22} strokeWidth={2.2} />;
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && pagination?.hasMore && !loading) {
      loadMore();
    }
  };

  const renderItem = ({ item, index }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeaderWrapper}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
            {item.title.toUpperCase()}
          </Text>
          <View style={[styles.sectionLine, { backgroundColor: theme.colors.border }]} />
        </View>
      );
    }

    const notification = item.data;
    return (
      <Animatable.View animation="fadeInUp" duration={500} delay={index * 80}>
        <View style={[
          styles.card,
          { 
            backgroundColor: theme.colors.card, 
            shadowColor: theme.colors.shadow, 
            borderColor: theme.colors.border 
          },
          !notification.read && { 
            borderLeftWidth: 4, 
            borderLeftColor: getPriorityDotColor(notification.priority) 
          }
        ]}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={{ flex: 1 }} 
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.cardRow}>
              {renderIcon(notification.type, notification.priority)}
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {notification.title}
              </Text>
              {!notification.read && (
                <Animatable.View 
                  animation="pulse" 
                  iterationCount="infinite" 
                  style={[
                    styles.dot, 
                    { backgroundColor: getPriorityDotColor(notification.priority) }
                  ]} 
                />
              )}
              <TouchableOpacity 
                onPress={() => handleDeleteNotification(notification.id)} 
                style={styles.trashIcon} 
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Trash2 color={theme.colors.textSecondary} size={18} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardMessage, { color: theme.colors.textSecondary }]}>
              {notification.message}
            </Text>
            <Text style={[
              styles.cardDate, 
              { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }
            ]}>
              {notification.timestamp.toLocaleString('pt-BR')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  };

  const renderListHeader = () => (
    <>
      <View style={styles.headerRow}>
        <Bell color={theme.colors.primary} size={24} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notificações</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações lidas'}
        </Text>
        <Text style={[styles.pullToRefreshHint, { color: theme.colors.textSecondary }]}>
          Atualiza automaticamente • Puxe para forçar atualização
        </Text>
        {lastCheck && (
          <Text style={[styles.lastUpdate, { color: theme.colors.textSecondary }]}>
            Atualizado às {lastCheck.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
          <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
            Marcar todas como lidas
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.filterRow}>
        {priorities.map(p => {
          const isActive = filter === p.key;
          const pc = priorityColors[p.key] || priorityColors.default;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? pc.bg : theme.colors.background,
                  borderColor: isActive ? pc.text : theme.colors.border,
                }
              ]}
              onPress={() => setFilter(p.key)}
            >
              <Text style={[
                styles.chipText, 
                { color: isActive ? pc.text : theme.colors.textSecondary }
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const renderListFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[
          { color: theme.colors.textSecondary, marginTop: 8, fontSize: 12 }
        ]}>
          Carregando mais notificações...
        </Text>
      </View>
    );
  };

  const renderListEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary, marginTop: 16 }]}>
            Carregando...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Bell color={theme.colors.textSecondary} size={48} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Nenhuma notificação encontrada
        </Text>
        <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
          Puxe para baixo para atualizar
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={flatData}
        keyExtractor={(item, index) => 
          item.type === 'header' ? `header-${item.title}` : `item-${item.data.id}`
        }
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderListEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
}