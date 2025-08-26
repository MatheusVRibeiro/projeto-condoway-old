
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, AlertTriangle, Calendar, Box, UserPlus, MessageSquareWarning } from 'lucide-react-native';
import BackButton from '../../../components/BackButton';
import Skeleton from '../../../components/ui/Skeleton';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { morador, avisosImportantes, encomendas, ultimasAtualizacoes } from './mock';
import { styles } from './styles';

// --- Componentes Internos da Tela ---

const AcaoCard = ({ icon: Icon, title, badgeCount, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.actionCard}>
      {badgeCount > 0 && (
        <View style={styles.actionBadge}>
          <Text style={styles.actionBadgeText}>{badgeCount}</Text>
        </View>
      )}
      <Icon color="#2563eb" size={32} style={styles.actionCardIcon} />
      <Text style={styles.actionCardTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

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
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0); // Estado para o carrossel

  // Função para calcular o slide ativo com base na posição do scroll
  const onScroll = (event) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const slide = Math.round(offset / slideWidth);
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          {/* <BackButton style={{ alignSelf: 'flex-start' }} /> */}
          {/* === HEADER === */}
          <Animatable.View animation="fadeInDown" duration={500} style={[styles.header, styles.section]}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Boa noite, {morador.nome}! 44b</Text>
              <Text style={styles.subtitle}>{morador.condominio}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell color="#4b5563" size={28} />
                {morador.notificacoesNaoLidas > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{morador.notificacoesNaoLidas}</Text>
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
                  <View style={styles.avisoCard}>
                      <AlertTriangle size={20} color="#b91c1c" style={styles.avisoIcon} />
                      <View style={styles.avisoTextContainer}>
                          <Text style={styles.avisoTitle}>{aviso.titulo}</Text>
                          <Text style={styles.avisoText}>{aviso.texto}</Text>
                      </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.paginationContainer}>
              {avisosImportantes.map((_, index) => (
                <View key={index} style={[styles.paginationDot, activeSlide === index && styles.paginationDotActive]} />
              ))}
            </View>
          </Animatable.View>

          {/* === AÇÕES RÁPIDAS === */}
          <Animatable.View animation="fadeInUp" duration={500} delay={200} style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.actionsGrid}>
                <AcaoCard icon={Calendar} title="Reservar Espaço" onPress={() => navigation.navigate('ReservasTab')} />
                <AcaoCard icon={Box} title="Minhas Encomendas" badgeCount={encomendas.quantidade} onPress={() => navigation.navigate('PackagesTab')} />
                <AcaoCard icon={UserPlus} title="Liberar Visitante" onPress={() => navigation.navigate('VisitantesTab')} />
                <AcaoCard icon={MessageSquareWarning} title="Abrir Ocorrência" onPress={() => navigation.navigate('OcorrenciasTab')} />
            </View>
          </Animatable.View>

          {/* === ÚLTIMAS ATUALIZAÇÕES === */}
          <Animatable.View animation="fadeInUp" duration={500} delay={300} style={styles.section}>
            <Text style={styles.sectionTitle}>Últimas Atualizações</Text>
            <View style={styles.updatesCard}>
              {Object.entries(ultimasAtualizacoes).map(([data, itens]) => (
                <View key={data} style={styles.updateGroup}>
                  <Text style={styles.updateDate}>{data}</Text>
                  {itens.map(item => {
                    const Icone = item.icone;
                    const isClickable = ['reservations', 'packages', 'notifications', 'issues', 'profile'].includes(item.tipo);
                    return (
                      <TouchableOpacity key={item.id} disabled={!isClickable} style={styles.updateItem}>
                        <View style={styles.updateIconContainer}>
                          <Icone color="#4b5563" size={20} />
                        </View>
                        <View style={styles.updateTextContainer}>
                          <Text style={styles.updateText}>{item.texto}</Text>
                        </View>
                        <Text style={styles.updateTime}>{item.hora}</Text>
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
