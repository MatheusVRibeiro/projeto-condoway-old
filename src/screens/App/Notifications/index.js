import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { Bell, AlertTriangle, Box, Info, Trash2 } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import styles from './styles';

const mockNotifications = [
  { id: '1', title: 'Assembleia Geral Convocada', message: 'Pauta: aprovação do orçamento anual...', date: '2025-08-26', priority: 'alta', read: false, icon: <AlertTriangle color="#e53935" size={22} strokeWidth={2.2} /> },
  { id: '2', title: 'Encomenda na Portaria', message: 'Um pacote da Amazon chegou para você.', date: '2025-08-26', priority: 'média', read: false, icon: <Box color="#fb8c00" size={22} strokeWidth={2.2} /> },
  { id: '3', title: 'Manutenção - Elevador Bloco A', message: 'O elevador passará por manutenção preventiva...', date: '2025-08-12', priority: 'média', read: false, icon: <AlertTriangle color="#fb8c00" size={22} strokeWidth={2.2} /> },
  { id: '4', title: 'Nova Regra para Pets', message: 'A partir de 01/09, será obrigatório o uso de coleira.', date: '2025-07-28', priority: 'baixa', read: true, icon: <Info color="#2563eb" size={22} strokeWidth={2.2} /> },
];

const priorities = [
  { key: 'todos', label: 'Todos', color: '#e5e7eb', text: '#334155' },
  { key: 'alta', label: 'Alta', color: '#fdecea', text: '#e53935' },
  { key: 'média', label: 'Média', color: '#fff4e5', text: '#fb8c00' },
  { key: 'baixa', label: 'Baixa', color: '#e3f0fd', text: '#2563eb' },
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
  Object.entries(byDate).forEach(([title, data]) => {
    sections.push({ title, data });
  });
  return sections;
}

export default function Notifications() {
  const [filter, setFilter] = useState('todos');
  const [notifications, setNotifications] = useState(mockNotifications);
  const colorScheme = useColorScheme();

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
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => setNotifications(notifications.filter(n => n.id !== id)),
        },
      ]
    );
  }

  function getPriorityDotColor(priority) {
    if (priority === 'alta') return '#e53935';
    if (priority === 'média') return '#fb8c00';
    if (priority === 'baixa') return '#2563eb';
    return '#2563eb';
  }

  function renderItem({ item, index }) {
    return (
      <Animatable.View animation="fadeInUp" duration={500} delay={index * 80}>
        <SwipeableCard onDelete={() => deleteNotification(item.id)}>
          <View style={[
            styles.card, 
            !item.read && [styles.cardUnread, { borderLeftColor: getPriorityDotColor(item.priority) }],
            colorScheme === 'dark' && styles.cardDark
          ]}>
            <TouchableOpacity activeOpacity={0.8} style={{flex: 1}}>
              <View style={styles.cardRow}>
                {item.icon}
                <Text style={styles.cardTitle}>{item.title}</Text>
                {!item.read && (
                  <Animatable.View animation="pulse" iterationCount="infinite" style={[styles.dot, { backgroundColor: getPriorityDotColor(item.priority) }]} />
                )}
                <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.trashIcon} hitSlop={{top:8,right:8,bottom:8,left:8}}>
                  <Trash2 color="#b0b0b0" size={18} />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardMessage}>{item.message}</Text>
            </TouchableOpacity>
          </View>
        </SwipeableCard>
      </Animatable.View>
    );
  }

  return (
    <View style={[styles.container, colorScheme === 'dark' && styles.containerDark]}>
      <View style={styles.headerRow}>
        <Bell color="#2563eb" size={22} />
        <Text style={styles.headerTitle}>Avisos e Notificações</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Você tem {unreadCount} avisos não lidos
        <Text style={styles.headerAction} onPress={markAllAsRead}>  Marcar todas como lidas</Text>
      </Text>
      <View style={styles.filterRow}>
        {priorities.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.chip, { backgroundColor: filter === p.key ? p.color : '#f3f4f6', borderColor: filter === p.key ? p.text : '#e5e7eb' }]}
            onPress={() => setFilter(p.key)}
          >
            <Text style={[styles.chipText, { color: filter === p.key ? p.text : '#64748b' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderWrapper}>
            <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
            <View style={styles.sectionLine} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

// SwipeableCard: ícone clicável para deletar com confirmação
function SwipeableCard({ children, onDelete }) {
  return (
    <View>
      {children}
    </View>
  );
}
