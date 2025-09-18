import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Bell, AlertTriangle, Box, Info, Trash2, Settings } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import styles from './styles';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useNotifications } from '../../../contexts/NotificationProvider';

// Prioridades serão renderizadas dinamicamente com o tema
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
    lastCheck,
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    addTestNotification,
    refreshNotifications
  } = useNotifications();
  
  const [filter, setFilter] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);

  // Atualização automática quando a tela se torna visível
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Tela de notificações entrou em foco - carregando notificações...');
      refreshNotifications();
    }, [refreshNotifications])
  );

  // Função para pull-to-refresh (atualização manual)
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Pull-to-refresh: Forçando atualização das notificações...');
      await refreshNotifications(true); // forceRefresh = true
    } catch (error) {
      console.error('❌ Erro ao atualizar notificações:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'todos') return notifications;
    
    return notifications.filter(n => {
      // Mapear tipos antigos para prioridades
      const priority = getPriorityFromType(n.type);
      return priority === filter;
    });
  }, [filter, notifications]);
  
  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  // Função para mapear tipos para prioridades
  function getPriorityFromType(type) {
    switch (type?.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'alta';
      case 'warning':
      case 'alert':
        return 'media';
      case 'info':
      case 'success':
      default:
        return 'baixa';
    }
  }

  function handleMarkAllAsRead() {
    markAllAsRead();
    Alert.alert('Pronto!', 'Todas as notificações foram marcadas como lidas.');
  }

  function handleDeleteNotification(id) {
    Alert.alert(
      'Excluir Notificação',
      'Esta notificação será removida apenas da sua visualização local. Ela não será excluída do servidor.',
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

  function getPriorityDotColor(type) {
    const priority = getPriorityFromType(type);
    return (priorityColors[priority] || priorityColors.default).text;
  }

  function renderIcon(type) {
    const color = getPriorityDotColor(type);
    switch (type) {
      case 'error': return <AlertTriangle color={color} size={22} strokeWidth={2.2} />;
      case 'warning': return <AlertTriangle color={color} size={22} strokeWidth={2.2} />;
      case 'success': return <Box color={color} size={22} strokeWidth={2.2} />;
      default: return <Info color={color} size={22} strokeWidth={2.2} />;
    }
  }

  function renderItem({ item, index }) {
    const dotColor = getPriorityDotColor(item.type);
    return (
      <Animatable.View animation="fadeInUp" duration={500} delay={index * 80}>
        <View style={[
          styles.card,
          { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow, borderColor: theme.colors.border },
          !item.read && { borderLeftWidth: 4, borderLeftColor: dotColor }
        ]}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={{ flex: 1 }}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.cardRow}>
              {renderIcon(item.type)}
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
              {!item.read && (
                <Animatable.View animation="pulse" iterationCount="infinite" style={[styles.dot, { backgroundColor: dotColor }]} />
              )}
              <TouchableOpacity onPress={() => handleDeleteNotification(item.id)} style={styles.trashIcon} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Trash2 color={theme.colors.textSecondary} size={18} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardMessage, { color: theme.colors.textSecondary }]}>{item.message}</Text>
            <Text style={[styles.cardDate, { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }]}>
              {item.timestamp.toLocaleString('pt-BR')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>      
      {/* Header */}
      <View style={styles.headerRow}>
        <Bell color={theme.colors.primary} size={24} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notificações</Text>
      </View>
      
      {/* Stats */}
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

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
          <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
            Marcar todas como lidas
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Filters */}
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
              <Text style={[styles.chipText, { color: isActive ? pc.text : theme.colors.textSecondary }]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {loading ? (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Carregando notificações...</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
          <Bell color={theme.colors.textSecondary} size={48} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {filter === 'todos' ? 'Nenhuma notificação encontrada' : `Nenhuma notificação do tipo "${filter}" encontrada`}
          </Text>
          <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
            Atualiza automaticamente quando você abre a tela
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderWrapper}>
              <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{title.toUpperCase()}</Text>
              <View style={[styles.sectionLine, { backgroundColor: theme.colors.border }]} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              title="Puxe para atualizar"
              titleColor={theme.colors.textSecondary}
            />
          }
        />
      )}
    </View>
  );
}
