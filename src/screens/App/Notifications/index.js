import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, Alert } from 'react-native';
import { Bell, AlertTriangle, Box, Info, Trash2 } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import styles from './styles';
import { useTheme } from '../../../contexts/ThemeProvider';

const mockNotifications = [
  { id: '1', title: 'Assembleia Geral Convocada', message: 'Pauta: aprovação do orçamento anual...', date: '2025-08-26', priority: 'alta', read: false, type: 'alert' },
  { id: '2', title: 'Encomenda na Portaria', message: 'Um pacote da Amazon chegou para você.', date: '2025-08-26', priority: 'média', read: false, type: 'package' },
  { id: '3', title: 'Manutenção - Elevador Bloco A', message: 'O elevador passará por manutenção preventiva...', date: '2025-08-12', priority: 'média', read: false, type: 'maintenance' },
  { id: '4', title: 'Nova Regra para Pets', message: 'A partir de 01/09, será obrigatório o uso de coleira.', date: '2025-07-28', priority: 'baixa', read: true, type: 'info' },
];

// Prioridades serão renderizadas dinamicamente com o tema
const priorities = [
  { key: 'todos', label: 'Todos' },
  { key: 'alta', label: 'Alta' },
  { key: 'média', label: 'Média' },
  { key: 'baixa', label: 'Baixa' },
];

function groupByDate(notifications) {
  const today = new Date().toISOString().slice(0, 10);
  const sections = [];
  const byDate = {};
  notifications.forEach(n => {
    let label = n.date === today ? 'Hoje' :
      n.date === '2025-08-12' ? '12 de agosto' :
      n.date === '2025-07-28' ? '28 de julho' : n.date;
    if (!byDate[label]) byDate[label] = [];
    byDate[label].push(n);
  });
  Object.entries(byDate).forEach(([title, data]) => { sections.push({ title, data }); });
  return sections;
}

export default function Notifications() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('todos');
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filtered = useMemo(() =>
    filter === 'todos' ? notifications : notifications.filter(n => n.priority === filter),
    [filter, notifications]
  );
  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  function markAllAsRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    Alert.alert('Pronto!', 'Todas as notificações foram marcadas como lidas.');
  }

  function deleteNotification(id) {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta notificação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => setNotifications(notifications.filter(n => n.id !== id)) },
      ]
    );
  }

  const priorityColors = {
    alta: { bg: theme.colors.error + '22', text: theme.colors.error },
    média: { bg: theme.colors.warning + '22', text: theme.colors.warning },
    baixa: { bg: theme.colors.info + '22', text: theme.colors.info },
    default: { bg: theme.colors.card, text: theme.colors.textSecondary },
  };

  function getPriorityDotColor(priority) {
    return (priorityColors[priority] || priorityColors.default).text;
  }

  function renderIcon(type, priority) {
    const color = getPriorityDotColor(priority);
    switch (type) {
      case 'alert': return <AlertTriangle color={color} size={22} strokeWidth={2.2} />;
      case 'package': return <Box color={color} size={22} strokeWidth={2.2} />;
      case 'maintenance': return <AlertTriangle color={color} size={22} strokeWidth={2.2} />;
      default: return <Info color={color} size={22} strokeWidth={2.2} />;
    }
  }

  function renderItem({ item, index }) {
    const dotColor = getPriorityDotColor(item.priority);
    return (
      <Animatable.View animation="fadeInUp" duration={500} delay={index * 80}>
        <SwipeableCard onDelete={() => deleteNotification(item.id)}>
          <View style={[
            styles.card,
            { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow, borderColor: theme.colors.border },
            !item.read && { borderLeftWidth: 4, borderLeftColor: dotColor }
          ]}>
            <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }}>
              <View style={styles.cardRow}>
                {renderIcon(item.type, item.priority)}
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                {!item.read && (
                  <Animatable.View animation="pulse" iterationCount="infinite" style={[styles.dot, { backgroundColor: dotColor }]} />
                )}
                <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.trashIcon} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Trash2 color={theme.colors.textSecondary} size={18} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.cardMessage, { color: theme.colors.textSecondary }]}>{item.message}</Text>
            </TouchableOpacity>
          </View>
        </SwipeableCard>
      </Animatable.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>      
      <View style={styles.headerRow}>
        <Bell color={theme.colors.primary} size={22} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Avisos e Notificações</Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
        Você tem {unreadCount} avisos não lidos
        <Text style={[styles.headerAction, { color: theme.colors.primary }]} onPress={markAllAsRead}>  Marcar todas como lidas</Text>
      </Text>
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
      />
    </View>
  );
}

function SwipeableCard({ children }) { return <View>{children}</View>; }
