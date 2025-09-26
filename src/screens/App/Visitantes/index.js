import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, SectionList, SafeAreaView } from 'react-native';
import { Plus, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../../../contexts/ThemeProvider';
import { groupItemsByDate } from '../../../utils/dateFormatter';
import { visitorsData } from './mock'; // Importando os novos dados
import VisitorCard from './VisitorCard'; // Importando o novo card
import createStyles from './styles';

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

// Cabeçalho da Seção
const SectionHeader = ({ title, theme }) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
};

// Tela Principal
export default function VisitantesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  // Agrupa os dados usando a nova função e o useMemo para performance
  const groupedVisitors = useMemo(() => groupItemsByDate(visitorsData), [visitorsData]);

  const handleAuthorizeNewVisitor = () => {
    navigation.navigate('AuthorizeVisitor');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Users color={theme.colors.primary} size={28} />
        <Text style={styles.title}>Gerenciar Visitantes</Text>
      </View>

      {/* Conteúdo da Lista */}
      <SectionList
        sections={groupedVisitors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VisitorCard 
            item={item} 
            onResend={() => console.log("Reenviar convite para", item.name)} 
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <SectionHeader title={title} theme={theme} />
        )}
        ListEmptyComponent={
          <EmptyState 
            icon={Users} 
            message="Nenhum visitante encontrado. Toque no '+' para autorizar um novo." 
            theme={theme} 
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão Flutuante (FAB) com animação */}
      <Animatable.View animation="zoomIn" duration={300} delay={500}>
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
