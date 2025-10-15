import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, AlertTriangle, Calendar, Box, UserPlus, MessageSquareWarning, Moon, Sun, Video, MessageSquare, UserCheck, Car, Tag, Plus, User } from 'lucide-react-native';
import Skeleton from '../../../components/ui/Skeleton';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { avisosImportantes as avisosImportantesMock, encomendas } from './mock';
import { apiService } from '../../../services/api';
import { styles } from './styles';
import { useTheme } from '../../../contexts/ThemeProvider';
import { useNotifications } from '../../../contexts/NotificationProvider';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../hooks/useProfile';
import { useCondominio } from '../../../hooks/useCondominio';
import { useLatestUpdates } from '../../../hooks/useLatestUpdates';
import { ROUTES } from '../../../routes/routeNames';

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

const CondominioCard = React.memo(({ icon: Icon, title, badgeCount, onPress, theme, iconColor, inDevelopment }) => {
  const handlePress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const dynamicStyles = {
    condominioCard: {
      ...styles.condominioCard,
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.shadow,
    },
    condominioCardTitle: {
      ...styles.condominioCardTitle,
      color: theme.colors.text,
    },
    condominioCardBadgeText: {
      ...styles.condominioCardBadgeText,
      color: '#ffffff',
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={dynamicStyles.condominioCard}>
      {badgeCount > 0 && (
        <View style={[styles.condominioCardBadge, { backgroundColor: theme.colors.error }]}>
          <Text style={dynamicStyles.condominioCardBadgeText}>{badgeCount}</Text>
        </View>
      )}
      
      {inDevelopment && (
        <View style={[styles.developmentBadge, { backgroundColor: theme.colors.warning }]}>
          <Text style={styles.developmentBadgeText}>Em Breve</Text>
        </View>
      )}
      
      <Icon color={iconColor || theme.colors.primary} size={32} style={styles.condominioCardIcon} />
      <Text style={dynamicStyles.condominioCardTitle}>{title}</Text>
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
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { condominioData } = useCondominio();
  const { updates: ultimasAtualizacoes, loading: updatesLoading, error: updatesError } = useLatestUpdates(5); // Limite de 5 itens
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0); // Estado para o carrossel
  const [avisos, setAvisos] = useState(avisosImportantesMock || []);

  // Dados do morador vindos da API ou fallback
  const morador = {
    nome: profileData?.user_nome || user?.user_nome || 'Usuário',
    condominio: condominioData?.cond_nome || profileData?.cond_nome || 'Condomínio',
    avatarUrl: profileData?.user_foto || user?.user_foto || null, // ✅ Corrigido: null em vez de URL quebrada
  };

  const handleReservarEspaco = React.useCallback(() => navigation.navigate('ReservasTab'), [navigation]);
  const handleMinhasEncomendas = React.useCallback(() => navigation.navigate(ROUTES.PACKAGES || 'Packages'), [navigation]);
  const handleLiberarVisitante = React.useCallback(() => navigation.navigate(ROUTES.VISITANTES || 'Visitantes'), [navigation]);
  const handleAbrirOcorrencia = React.useCallback(() => navigation.navigate('OcorrenciasTab'), [navigation]);
  const handleVerNotificacoes = React.useCallback(() => navigation.navigate('Notifications'), [navigation]);
  const handleAbrirPerfil = React.useCallback(() => navigation.navigate(ROUTES.PERFIL || 'PerfilTab'), [navigation]);

  // Função para navegar baseado no tipo de atualização
  const handleUpdatePress = React.useCallback((update) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (update.rawType) {
      case 'PACKAGE_RECEIVED':
        // Navega para a tela de Encomendas
        navigation.navigate(ROUTES.PACKAGES || 'Packages');
        break;
      
      case 'RESERVATION_CONFIRMED':
        // Navega para a tela de Reservas
        navigation.navigate('ReservasTab');
        break;
      
      case 'VISITOR_ENTRY':
      case 'VISITOR_EXIT':
        // Navega para a tela de Visitantes
        navigation.navigate(ROUTES.VISITANTES || 'Visitantes');
        break;
      
      case 'OCCURRENCE_UPDATE':
        // Navega para a tela de Ocorrências
        navigation.navigate('OcorrenciasTab');
        break;
      
      case 'GENERAL_ANNOUNCEMENT':
      case 'MESSAGE':
      case 'PAYMENT_SUCCESS':
        // Navega para a tela de Notificações
        navigation.navigate('Notifications');
        break;
      
      default:
        // Fallback: abre notificações
        navigation.navigate('Notifications');
        break;
    }
  }, [navigation]);

  // Funções para "Meu Condomínio"
  const handleCamerasSeguranca = React.useCallback(() => {
    // Implementação futura - mostrar tela de câmeras ao vivo
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Toast.show({
      type: 'info',
      text1: 'Câmeras de Segurança',
      text2: 'Funcionalidade em desenvolvimento! Em breve você poderá visualizar as câmeras ao vivo.',
      position: 'bottom',
      visibilityTime: 4000,
    });
  }, []);

  const handleMuralAvisos = React.useCallback(() => {
    // Implementação futura - mostrar mural de avisos
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Toast.show({
      type: 'info',
      text1: 'Mural de Avisos',
      text2: 'Em breve você poderá visualizar todos os comunicados oficiais do condomínio.',
      position: 'bottom',
      visibilityTime: 4000,
    });
  }, []);

  const handleAcessoFacial = React.useCallback(() => {
    // Implementação futura - gerenciar acesso facial
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Toast.show({
      type: 'info',
      text1: 'Acesso Facial',
      text2: 'Em desenvolvimento! Gerencie acessos faciais da sua unidade e visitantes.',
      position: 'bottom',
      visibilityTime: 4000,
    });
  }, []);

  const handleTagVeicular = React.useCallback(() => {
    // Implementação futura - gerenciar tags veiculares
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Toast.show({
      type: 'info',
      text1: 'Tags Veiculares',
      text2: 'Em desenvolvimento! Gerencie as tags veiculares dos seus veículos.',
      position: 'bottom',
      visibilityTime: 4000,
    });
  }, []);

  const handleConvidadoRapido = React.useCallback(() => {
    // Ação secundária - cadastro rápido de convidado
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: 'Cadastro Rápido',
      text2: 'Funcionalidade para cadastrar visitante com acesso facial temporário.',
      position: 'bottom',
      visibilityTime: 3000,
    });
  }, []);

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
    let mounted = true;

    const loadAvisos = async () => {
      try {
        console.log('🔄 [DASHBOARD] Iniciando carregamento de avisos...');
        console.log('🔄 [DASHBOARD] Mock disponível:', avisosImportantesMock);
        
        const data = await apiService.buscarAvisosImportantes();
        
        console.log('📦 [DASHBOARD] Dados recebidos da API:', data);
        console.log('📦 [DASHBOARD] Mounted?', mounted);
        console.log('📦 [DASHBOARD] É array?', Array.isArray(data));
        console.log('📦 [DASHBOARD] Length:', data?.length);
        
        if (!mounted) return;
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ [DASHBOARD] Usando dados da API');
          setAvisos(data);
        } else {
          console.log('⚠️ [DASHBOARD] API retornou vazio, usando mock');
          // Fallback para mock se a API não retornar dados
          setAvisos(avisosImportantesMock || []);
        }
      } catch (err) {
        console.error('❌ [DASHBOARD] Erro ao carregar avisos:', err);
        if (!mounted) return;
        console.log('⚠️ [DASHBOARD] Usando mock por erro');
        setAvisos(avisosImportantesMock || []);
      }
    };

    loadAvisos();

    return () => { 
      console.log('🧹 [DASHBOARD] Cleanup - desmontando componente');
      mounted = false; 
    };
  }, []);

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
              
              <TouchableOpacity style={styles.notificationButton} onPress={handleVerNotificacoes}>
                <Bell color={theme.colors.text} size={28} />
                {unreadCount > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: theme.colors.error, borderColor: theme.colors.background }]}>
                    <Text style={[styles.notificationBadgeText, { color: '#ffffff' }]}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.profileButton, { borderColor: theme.colors.border }]} 
                onPress={handleAbrirPerfil}
              >
                {morador.avatarUrl ? (
                  <Image source={{ uri: morador.avatarUrl }} style={styles.avatarButton} />
                ) : (
                  <View style={[styles.avatarButton, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                    <User color="#ffffff" size={24} />
                  </View>
                )}
              </TouchableOpacity>
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
              {avisos.map((aviso) => (
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
              {avisos.map((_, index) => (
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

          {/* === MEU CONDOMÍNIO === */}
          <Animatable.View animation="fadeInUp" duration={500} delay={250} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Meu Condomínio</Text>
            <View style={styles.actionsGrid}>
              {/* Câmeras de Segurança */}
              <CondominioCard 
                icon={Video}
                title="Câmeras"
                onPress={handleCamerasSeguranca}
                theme={theme}
                iconColor={theme.colors.primary}
                inDevelopment={true}
              />

              {/* Mural de Avisos */}
              <CondominioCard 
                icon={MessageSquare}
                title="Mural de Avisos"
                onPress={handleMuralAvisos}
                theme={theme}
                iconColor={theme.colors.primary}
                inDevelopment={true}
              />

              {/* Acesso Facial */}
              <CondominioCard 
                icon={UserCheck}
                title="Acesso Facial"
                onPress={handleAcessoFacial}
                theme={theme}
                iconColor={theme.colors.primary}
                inDevelopment={true}
              />

              {/* Tag Veicular */}
              <CondominioCard 
                icon={Car}
                title="Tags Veiculares"
                onPress={handleTagVeicular}
                theme={theme}
                iconColor={theme.colors.primary}
                inDevelopment={true}
              />
            </View>
          </Animatable.View>

          {/* === ÚLTIMAS ATUALIZAÇÕES === */}
          <Animatable.View animation="fadeInUp" duration={500} delay={300} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Últimas Atualizações</Text>
              <TouchableOpacity 
                onPress={handleVerNotificacoes}
                style={styles.seeAllButton}
              >
                <Text style={[styles.seeAllButtonText, { color: theme.colors.primary }]}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.updatesCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              {updatesLoading ? (
                <View style={styles.updatesLoading}>
                  <Text style={[styles.updatesLoadingText, { color: theme.colors.textSecondary }]}>
                    Carregando atualizações...
                  </Text>
                </View>
              ) : updatesError ? (
                <View style={styles.updatesError}>
                  <Text style={[styles.updatesErrorText, { color: theme.colors.error }]}>
                    {updatesError}
                  </Text>
                </View>
              ) : Object.keys(ultimasAtualizacoes).length === 0 ? (
                <View style={styles.updatesEmpty}>
                  <Bell size={40} color={theme.colors.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.updatesEmptyText, { color: theme.colors.textSecondary }]}>
                    Nenhuma atualização recente
                  </Text>
                </View>
              ) : (
                Object.entries(ultimasAtualizacoes).map(([data, itens]) => (
                  <View key={data} style={styles.updateGroup}>
                    <Text style={[styles.updateDate, { color: theme.colors.textSecondary }]}>{data}</Text>
                    {itens.map(item => {
                      const Icone = item.icone;
                      // Marcar mensagens importantes para negrito
                      const isImportant = [
                        'OCCURRENCE_UPDATE',
                        'GENERAL_ANNOUNCEMENT',
                        'PAYMENT_SUCCESS',
                        'MESSAGE'
                      ].includes(item.rawType);

                      return (
                        <TouchableOpacity 
                          key={item.uniqueId} 
                          onPress={() => handleUpdatePress(item)}
                          style={styles.updateItem}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.updateIconContainer, { backgroundColor: theme.isDark ? theme.colors.background : theme.colors.background }]}>
                            <Icone color={theme.colors.primary} size={20} />
                          </View>
                          <View style={styles.updateTextContainer}>
                            {(() => {
                              // Regex para capturar o identificador retornado pelo backend (ex: OCO-20225-)
                              const idRegex = /([A-Z]{2,}-\d[\w-]*)/;
                              const parts = item.texto.split(idRegex);

                              if (parts.length > 1) {
                                return (
                                  <Text style={[styles.updateText, { color: theme.colors.text }]}> {
                                    parts.map((part, idx) => (
                                      // idx ímpar significa que é o grupo capturado pelo regex
                                      idx % 2 === 1
                                        ? <Text key={idx} style={{ fontWeight: '700' }}>{part}</Text>
                                        : <Text key={idx}>{part}</Text>
                                    ))
                                  } </Text>
                                );
                              }

                              // Se não encontrar identificador, renderiza normalmente
                              return <Text style={[styles.updateText, { color: theme.colors.text }]}>{item.texto}</Text>;
                            })()}
                          </View>
                          <Text style={[styles.updateTime, { color: theme.colors.textSecondary }]}>{item.hora}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))
              )}
            </View>
          </Animatable.View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
