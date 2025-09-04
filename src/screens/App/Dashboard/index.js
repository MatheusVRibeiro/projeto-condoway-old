import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, AlertTriangle, Calendar, Box, UserPlus, MessageSquareWarning, Moon, Sun } from 'lucide-react-native';
import BackButton from '../../../components/BackButton';
import Skeleton from '../../../components/ui/Skeleton';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { morador, avisosImportantes, encomendas, ultimasAtualizacoes } from './mock';
import { styles } from './styles';
import { useTheme } from '../../../contexts/ThemeProvider';

// --- Componentes Internos da Tela ---

const AcaoCard = React.memo(({ icon: Icon, title, badgeCount, onPress, theme }) => {
  const handlePress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const dynamicStyles = {
    actionCard: {
      ...styles.actionCard,
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.shadow,
    },
    actionCardTitle: {
      ...styles.actionCardTitle,
      color: theme.colors.text,
    },
    actionBadgeText: {
      ...styles.actionBadgeText,
      color: '#ffffff',
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={dynamicStyles.actionCard}>
      {badgeCount > 0 && (
        <View style={[styles.actionBadge, { backgroundColor: theme.colors.error }]}>
          <Text style={dynamicStyles.actionBadgeText}>{badgeCount}</Text>
        </View>
      )}
      <Icon color={theme.colors.primary} size={32} style={styles.actionCardIcon} />
      <Text style={dynamicStyles.actionCardTitle}>{title}</Text>
    </TouchableOpacity>
  );
});

const DashboardSkeleton = () => {
  const screenWidth = Dimensions.get('window').width;
  const fullWidth = screenWidth - 32;
  const halfWidth = fullWidth * 0.48;

  return (
    <View style={styles.loadingContainer}>
        <View style={styles.skeletonHeader}>
          <View>
            <Skeleton width={200} height={24} borderRadius={8} />
            <View style={{ height: 8 }} />
            <Skeleton width={150} height={16} borderRadius={8} />
          </View>
          <Skeleton width={44} height={44} borderRadius={22} />
        </View>
        <Skeleton width={fullWidth} height={90} borderRadius={12} />
        <View style={{ height: 24 }} />
        <Skeleton width={150} height={20} borderRadius={8} />
        <View style={{ height: 12 }} />
        <View style={styles.actionsGrid}>
          <Skeleton width={halfWidth} height={110} borderRadius={12} />
          <Skeleton width={halfWidth} height={110} borderRadius={12} />
        </View>
    </View>
  );
};

// --- Componente Principal da Tela ---

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0); // Estado para o carrossel

  const handleReservarEspaco = React.useCallback(() => navigation.navigate('ReservasTab'), [navigation]);
  const handleMinhasEncomendas = React.useCallback(() => navigation.navigate('Packages'), [navigation]);
  const handleLiberarVisitante = React.useCallback(() => navigation.navigate('Visitantes'), [navigation]);
  const handleAbrirOcorrencia = React.useCallback(() => navigation.navigate('OcorrenciasTab'), [navigation]);

  // Função para calcular o slide ativo com base na posição do scroll
  const onScroll = React.useCallback((event) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const slide = Math.round(offset / slideWidth);
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  }, [activeSlide]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.content}>
          {/* <BackButton style={{ alignSelf: 'flex-start' }} /> */}
          {/* === HEADER === */}
          <Animatable.View animation="fadeInDown" duration={500} style={[styles.header, styles.section]}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{`Boa noite, ${morador.nome}!`}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{morador.condominio}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.themeToggle, { backgroundColor: theme.isDark ? theme.colors.card : theme.colors.border + '55' }]} 
                onPress={toggleTheme}
              >
                {theme.isDark ? (
                  <Sun color={theme.colors.text} size={24} />
                ) : (
                  <Moon color={theme.colors.text} size={24} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
                <Bell color={theme.colors.text} size={28} />
                {morador.notificacoesNaoLidas > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: theme.colors.error, borderColor: theme.colors.background }]}>
                    <Text style={[styles.notificationBadgeText, { color: '#ffffff' }]}>{morador.notificacoesNaoLidas}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Image source={{ uri: morador.avatarUrl }} style={styles.avatar} />
            </View>
          </Animatable.View>

          {/* === AVISOS IMPORTANTES (CARROSSEL) === */}
          <Animatable.View animation="fadeInUp" duration={500} delay={100} style={styles.section}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              {avisosImportantes.map((aviso) => (
                <View key={aviso.id} style={styles.avisoCardWrapper}>
                  <View style={[styles.avisoCard, { backgroundColor: theme.colors.error + '15', borderLeftColor: theme.colors.error }]}>
                      <AlertTriangle size={20} color={theme.colors.error} style={styles.avisoIcon} />
                      <View style={styles.avisoTextContainer}>
                          <Text style={[styles.avisoTitle, { color: theme.colors.error }]}>{aviso.titulo}</Text>
                          <Text style={[styles.avisoText, { color: theme.colors.error }]}>{aviso.texto}</Text>
                      </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.paginationContainer}>
              {avisosImportantes.map((_, index) => (
                <View key={index} style={[
                  styles.paginationDot, 
                  { backgroundColor: theme.colors.border },
                  activeSlide === index && { backgroundColor: theme.colors.primary }
                ]} />
              ))}
            </View>
          </Animatable.View>

          {/* === AÇÕES RÁPIDAS === */}
          <Animatable.View animation="fadeInUp" duration={500} delay={200} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ações Rápidas</Text>
            <View style={styles.actionsGrid}>
                <AcaoCard icon={Calendar} title="Reservar Espaço" onPress={handleReservarEspaco} theme={theme} />
                <AcaoCard icon={Box} title="Minhas Encomendas" badgeCount={encomendas.quantidade} onPress={handleMinhasEncomendas} theme={theme} />
                <AcaoCard icon={UserPlus} title="Liberar Visitante" onPress={handleLiberarVisitante} theme={theme} />
                <AcaoCard icon={MessageSquareWarning} title="Abrir Ocorrência" onPress={handleAbrirOcorrencia} theme={theme} />
            </View>
          </Animatable.View>

          {/* === ÚLTIMAS ATUALIZAÇÕES === */}
          <Animatable.View animation="fadeInUp" duration={500} delay={300} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Últimas Atualizações</Text>
            <View style={[styles.updatesCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              {Object.entries(ultimasAtualizacoes).map(([data, itens]) => (
                <View key={data} style={styles.updateGroup}>
                  <Text style={[styles.updateDate, { color: theme.colors.textSecondary }]}>{data}</Text>
                  {itens.map(item => {
                    const Icone = item.icone;
                    const isClickable = ['reservations', 'packages', 'notifications', 'issues', 'profile'].includes(item.tipo);
                    return (
                      <TouchableOpacity key={item.id} disabled={!isClickable} style={styles.updateItem}>
                        <View style={[styles.updateIconContainer, { backgroundColor: theme.isDark ? theme.colors.background : theme.colors.background }]}>
                          <Icone color={theme.colors.primary} size={20} />
                        </View>
                        <View style={styles.updateTextContainer}>
                          <Text style={[styles.updateText, { color: theme.colors.text }]}>{item.texto}</Text>
                        </View>
                        <Text style={[styles.updateTime, { color: theme.colors.textSecondary }]}>{item.hora}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </Animatable.View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
