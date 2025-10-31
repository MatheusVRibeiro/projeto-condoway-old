import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Home, MapPin, Calendar, Users, Car, Clock } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { userProfile } from '../mock';
import { useTheme } from '../../../../contexts/ThemeProvider';
import { apiService } from '../../../../services/api';

export default function UnitDetails() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [ambientes, setAmbientes] = useState([]);
  const [loadingAmbientes, setLoadingAmbientes] = useState(true);
  const [unitData] = useState({
    ...userProfile,
    area: '85m²',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 1,
    registrationDate: 'Janeiro 2023',
    monthlyFee: 'R$ 485,00',
  });

  useEffect(() => {
    carregarAmbientes();
  }, []);

  const carregarAmbientes = async () => {
    try {
      setLoadingAmbientes(true);
      console.log('🔄 [UnitDetails] Carregando ambientes...');
      const data = await apiService.listarAmbientes();
      console.log('✅ [UnitDetails] Ambientes carregados:', data);
      console.log('📋 [UnitDetails] Primeiro ambiente:', data[0]);
      setAmbientes(data);
    } catch (error) {
      console.error('❌ [UnitDetails] Erro ao carregar ambientes:', error);
      setAmbientes([]);
    } finally {
      setLoadingAmbientes(false);
    }
  };

  const InfoCard = ({ icon: Icon, title, value, subtitle, badge }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.primary + '22' }]}>
          <Icon size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.infoTitleContainer}>
          <Text style={[styles.infoTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
          {subtitle && <Text style={[styles.infoSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
        </View>
        {badge && (
          <View style={[styles.badge, { backgroundColor: theme.colors.warning + '22' }]}>
            <Clock size={12} color={theme.colors.warning} />
            <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  const ComingSoonCard = ({ title, description }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600} 
      style={[styles.comingSoonCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.warning + '22' }]}>
        <Clock size={32} color={theme.colors.warning} />
      </View>
      <Text style={[styles.comingSoonTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.comingSoonDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
      <View style={[styles.comingSoonBadge, { backgroundColor: theme.colors.warning + '22' }]}>
        <Text style={[styles.comingSoonBadgeText, { color: theme.colors.warning }]}>EM BREVE</Text>
      </View>
    </Animatable.View>
  );

  const AmenityItem = ({ name }) => {
    console.log('🏢 [AmenityItem] Renderizando:', name);
    return (
      <View style={styles.amenityItem}>
        <View style={[styles.amenityDot, { backgroundColor: theme.colors.primary }]} />
        <Text style={[styles.amenityText, { color: theme.colors.text }]}>{name || 'Nome não disponível'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.colors.background }]}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Minha Unidade</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Unit Overview */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={[styles.overviewCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <View style={styles.overviewHeader}>
            <View style={[styles.overviewIcon, { backgroundColor: theme.colors.primary + '22' }]}>
              <Home size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>{unitData.apartment}</Text>
              <Text style={[styles.overviewSubtitle, { color: theme.colors.primary }]}>{unitData.block} • {unitData.condominium}</Text>
              <Text style={[styles.overviewDetail, { color: theme.colors.textSecondary }]}>{unitData.area} • {unitData.bedrooms} quartos • {unitData.bathrooms} banheiros</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Basic Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMAÇÕES BÁSICAS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.infoGrid}>
              <InfoCard icon={MapPin} title="Localização" value={`${unitData.apartment}, ${unitData.block}`} subtitle="Endereço da unidade" />
              <InfoCard icon={Calendar} title="Desde" value={unitData.registrationDate} subtitle="Data de cadastro" />
              <InfoCard icon={Users} title="Tipo" value={unitData.userType === 'morador' ? 'Morador' : 'Proprietário'} subtitle="Relação com o imóvel" />
              <InfoCard icon={Car} title="Vagas" value={`${unitData.parkingSpots} vaga`} subtitle="Estacionamento" badge="EM BREVE" />
            </View>
          </View>
        </Animatable.View>

        {/* Financial Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMAÇÕES FINANCEIRAS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.financialCard}>
              <Text style={[styles.financialLabel, { color: theme.colors.textSecondary }]}>Taxa Condominial Mensal</Text>
              <Text style={[styles.financialValue, { color: theme.colors.primary }]}>{unitData.monthlyFee}</Text>
              <Text style={[styles.financialNote, { color: theme.colors.textSecondary }]}>Valor baseado na última assembleia</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Áreas Comuns Disponíveis */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ÁREAS COMUNS DISPONÍVEIS</Text>
          {loadingAmbientes ? (
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Carregando ambientes...</Text>
            </View>
          ) : ambientes.length > 0 ? (
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <View style={styles.amenitiesGrid}>
                {ambientes.map((ambiente, index) => (
                  <AmenityItem 
                    key={ambiente.id || ambiente.amd_id || ambiente.amb_id || index} 
                    name={ambiente.nome || ambiente.amd_nome || ambiente.amb_nome || 'Ambiente sem nome'} 
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Nenhum ambiente disponível no momento</Text>
            </View>
          )}
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
