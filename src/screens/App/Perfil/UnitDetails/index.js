import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Home, MapPin, Calendar, Users, Car, Wifi, Zap, Droplets, Edit3, Phone, Mail } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { useTheme } from '../../../../contexts/ThemeProvider';
import { useProfile } from '../../../../hooks/useProfile';
import { useCondominio } from '../../../../hooks/useCondominio';
import { Loading } from '../../../../components/Loading';

export default function UnitDetails() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Hooks para dados reais da API
  const { 
    profileData, 
    unitData, 
    loading: profileLoading, 
    loadUnitDetails 
  } = useProfile();
  
  const { 
    condominioData, 
    loading: condominioLoading 
  } = useCondominio();

  // Carrega detalhes da unidade quando o profileData estiver disponível
  useEffect(() => {
    if (profileData?.Apto_ID) {
      loadUnitDetails(profileData.Apto_ID);
    }
  }, [profileData?.Apto_ID]);

  // Mock data como fallback (será substituído por dados reais quando disponível)
  const [unitData_mock] = useState({
    area: '85m²',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 1,
    registrationDate: 'Janeiro 2023',
    monthlyFee: 'R$ 485,00',
    emergencyContact: {
      name: 'João Silva',
      phone: '(11) 99876-5432',
      relationship: 'Responsável'
    },
    utilities: {
      water: 'Ativo',
      electricity: 'Ativo',
      gas: 'Ativo',
      internet: 'Ativo'
    },
    amenities: [
      'Piscina',
      'Academia',
      'Salão de Festas',
      'Playground',
      'Quadra de Tênis',
      'Sauna'
    ]
  });

  // Combina dados reais da API com mock para campos ainda não implementados
  const displayData = {
    apartment: profileData?.apto_numero || 'Carregando...',
    block: profileData?.bloco_nome || 'Carregando...',
    condominium: condominioData?.cond_nome || profileData?.cond_nome || 'Carregando...',
    endereco: condominioData?.cond_endereco || 'Não informado',
    cidade: condominioData?.cond_cidade || 'Não informado',
    area: unitData?.apto_area || unitData_mock.area,
    bedrooms: unitData?.apto_quartos || unitData_mock.bedrooms,
    bathrooms: unitData?.apto_banheiros || unitData_mock.bathrooms,
    parkingSpots: unitData?.apto_vagas || unitData_mock.parkingSpots,
    registrationDate: profileData?.userap_data_cadastro || unitData_mock.registrationDate,
    monthlyFee: unitData?.apto_taxa_condominio || unitData_mock.monthlyFee,
    userType: profileData?.userap_tipo || 'morador',
    emergencyContact: unitData_mock.emergencyContact,
    utilities: unitData_mock.utilities,
    amenities: unitData_mock.amenities,
  };

  const loading = profileLoading || condominioLoading;

  const InfoCard = ({ icon: Icon, title, value, subtitle, onEdit }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.primary + '22' }]}>
          <Icon size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.infoTitleContainer}>
          <Text style={[styles.infoTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
          {subtitle && <Text style={[styles.infoSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Edit3 size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  const UtilityStatus = ({ icon: Icon, name, status }) => (
    <View style={[styles.utilityItem, { borderBottomColor: theme.colors.border }]}>
      <View style={[styles.utilityIcon, { backgroundColor: theme.colors.background }]}>
        <Icon size={18} color={status === 'Ativo' ? theme.colors.success : theme.colors.error} />
      </View>
      <Text style={[styles.utilityName, { color: theme.colors.text }]}>{name}</Text>
      <View style={[styles.utilityStatus, { backgroundColor: (status === 'Ativo' ? theme.colors.success : theme.colors.error) + '22' }]}>
        <Text style={[styles.utilityStatusText, { color: status === 'Ativo' ? theme.colors.success : theme.colors.error }]}>
          {status}
        </Text>
      </View>
    </View>
  );

  const AmenityItem = ({ name }) => (
    <View style={styles.amenityItem}>
      <View style={[styles.amenityDot, { backgroundColor: theme.colors.primary }]} />
      <Text style={[styles.amenityText, { color: theme.colors.text }]}>{name}</Text>
    </View>
  );

  if (loading && !profileData) {
    return <Loading />;
  }

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
              <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>{displayData.apartment}</Text>
              <Text style={[styles.overviewSubtitle, { color: theme.colors.primary }]}>{displayData.block} • {displayData.condominium}</Text>
              <Text style={[styles.overviewDetail, { color: theme.colors.textSecondary }]}>{displayData.area} • {displayData.bedrooms} quartos • {displayData.bathrooms} banheiros</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Basic Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMAÇÕES BÁSICAS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.infoGrid}>
              <InfoCard icon={MapPin} title="Localização" value={`${displayData.apartment}, ${displayData.block}`} subtitle="Endereço da unidade" />
              <InfoCard icon={Calendar} title="Desde" value={displayData.registrationDate} subtitle="Data de cadastro" />
              <InfoCard icon={Users} title="Tipo" value={displayData.userType === 'morador' ? 'Morador' : displayData.userType === 'proprietario' ? 'Proprietário' : displayData.userType === 'sindico' ? 'Síndico' : 'Porteiro'} subtitle="Relação com o imóvel" />
              <InfoCard icon={Car} title="Vagas" value={`${displayData.parkingSpots} vaga${displayData.parkingSpots > 1 ? 's' : ''}`} subtitle="Estacionamento" />
            </View>
          </View>
        </Animatable.View>

        {/* Financial Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMAÇÕES FINANCEIRAS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.financialCard}>
              <Text style={[styles.financialLabel, { color: theme.colors.textSecondary }]}>Taxa Condominial Mensal</Text>
              <Text style={[styles.financialValue, { color: theme.colors.primary }]}>{displayData.monthlyFee}</Text>
              <Text style={[styles.financialNote, { color: theme.colors.textSecondary }]}>Valor baseado na última assembleia</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Emergency Contact */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CONTATO DE EMERGÊNCIA</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Text style={[styles.contactName, { color: theme.colors.text }]}>{displayData.emergencyContact.name}</Text>
                <Text style={[styles.contactRelation, { color: theme.colors.textSecondary }]}>{displayData.emergencyContact.relationship}</Text>
              </View>
              <TouchableOpacity style={styles.contactItem}>
                <Phone size={18} color={theme.colors.primary} />
                <Text style={[styles.contactText, { color: theme.colors.text }]}>{displayData.emergencyContact.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>

        {/* Utilities Status */}
        <Animatable.View animation="fadeInUp" duration={600} delay={600} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>STATUS DOS SERVIÇOS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <UtilityStatus icon={Droplets} name="Água" status={displayData.utilities.water} />
            <UtilityStatus icon={Zap} name="Energia" status={displayData.utilities.electricity} />
            <UtilityStatus icon={Wifi} name="Internet" status={displayData.utilities.internet} />
          </View>
        </Animatable.View>

        {/* Amenities */}
        <Animatable.View animation="fadeInUp" duration={600} delay={700} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ÁREAS COMUNS DISPONÍVEIS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.amenitiesGrid}>
              {displayData.amenities.map((amenity, index) => (
                <AmenityItem key={index} name={amenity} />
              ))}
            </View>
          </View>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
