import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Plus, Users, Clock, CalendarCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../../../contexts/ThemeProvider';
import createStyles from './styles';

// --- Dados de Exemplo (Mocks) ---
const upcomingVisitorsData = [
  { id: '1', name: 'Carlos Silva', date: '25/09/2025' },
  { id: '2', name: 'Mariana Costa', date: '27/09/2025' },
];

const accessHistoryData = [
  { id: '1', name: 'Ana Beatriz', date: '22/09/2025', entry: '09:15', exit: '11:30' },
  { id: '2', name: 'Ricardo Gomes', date: '21/09/2025', entry: '14:00', exit: '18:45' },
];
// --- Fim dos Dados de Exemplo ---

// Componente para os botões das abas
const TabButton = ({ title, active, onPress, theme }) => {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active ? styles.activeTabText : styles.inactiveTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Card para a lista de "Próximas Visitas"
const VisitorCard = ({ item, onResend, theme }) => {
  const styles = createStyles(theme);
  return (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>Visita agendada para: {item.date}</Text>
      </View>
      <TouchableOpacity style={styles.resendButton} onPress={onResend}>
        <Text style={styles.resendButtonText}>Reenviar</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Card para a lista de "Histórico de Acessos"
const HistoryCard = ({ item, theme }) => {
  const styles = createStyles(theme);
  return (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.date} | Entrada: {item.entry} - Saída: {item.exit}
        </Text>
      </View>
    </Animatable.View>
  );
};

// Estado vazio melhorado
const EmptyState = ({ icon, message, theme }) => {
  const styles = createStyles(theme);
  const Icon = icon;
  return (
    <View style={styles.emptyContainer}>
      <Icon color={theme.colors.textSecondary} size={48} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

// Tela Principal
export default function VisitantesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' ou 'history'
  const styles = createStyles(theme);

  const handleAuthorizeNewVisitor = () => {
    navigation.navigate('AuthorizeVisitor');
  };

  const renderUpcomingList = () => (
    <FlatList
      data={upcomingVisitorsData}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <VisitorCard item={item} onResend={() => console.log("Reenviar convite para", item.name)} theme={theme} />}
      ListEmptyComponent={<EmptyState icon={CalendarCheck} message="Nenhuma visita agendada." theme={theme} />}
      contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderHistoryList = () => (
    <FlatList
      data={accessHistoryData}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <HistoryCard item={item} theme={theme} />}
      ListEmptyComponent={<EmptyState icon={Clock} message="Nenhum histórico de acesso encontrado." theme={theme} />}
      contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Users color={theme.colors.primary} size={28} />
        <Text style={styles.title}>Gerenciar Visitantes</Text>
      </View>

      {/* Abas de Navegação */}
      <View style={styles.tabContainer}>
        <TabButton title="Próximas Visitas" active={activeTab === 'upcoming'} onPress={() => setActiveTab('upcoming')} theme={theme} />
        <TabButton title="Histórico de Acessos" active={activeTab === 'history'} onPress={() => setActiveTab('history')} theme={theme} />
      </View>

      {/* Conteúdo da Lista */}
      <View style={styles.listContainer}>
        {activeTab === 'upcoming' ? renderUpcomingList() : renderHistoryList()}
      </View>

      {/* Botão Flutuante (FAB) com animação */}
      <Animatable.View animation="zoomIn" duration={300}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAuthorizeNewVisitor}
        >
          <Plus color="#FFF" size={28} strokeWidth={3} />
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}
