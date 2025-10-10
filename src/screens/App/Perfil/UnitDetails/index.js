import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Home, MapPin, Calendar, Users, Car, Wifi, Zap, Droplets, Edit3, Phone, Mail } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { useTheme } from '../../../../contexts/ThemeProvider';
import { useProfile } from '../../../../hooks/useProfile';
import Loading from '../../../../components/Loading';

export default function UnitDetails() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Busca dados do perfil da API
  const { profileData, loading } = useProfile();

  // Formata a data de cadastro
  const formatarDataCadastro = (dataString) => {
    if (!dataString) return 'Não informado';
    
    try {
      const data = new Date(dataString);
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${meses[data.getMonth()]} ${data.getFullYear()}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Não informado';
    }
  };

  // Monta dados para exibição
  // Monta dados para exibição
  const displayData = {
    // Título: "Nome do Condomínio"
    title: profileData?.cond_nome || 'Carregando...',
    
    // Subtítulo: "Bloco A - Andar 10 - Apto 101"
    subtitle: profileData?.bloc_nome && profileData?.ap_andar && profileData?.ap_numero
      ? `${profileData.bloc_nome} - Andar ${profileData.ap_andar} - Apto ${profileData.ap_numero}`
      : profileData?.bloc_nome && profileData?.ap_numero
      ? `${profileData.bloc_nome} - Apto ${profileData.ap_numero}`
      : 'Não informado',
    
    // Localização completa: "Rua Exemplo, 123 - São Paulo - SP"
    endereco: profileData?.cond_endereco || 'Não informado',
    cidade: profileData?.cond_cidade || 'Não informado',
    estado: profileData?.cond_estado || '',
    enderecoCompleto: profileData?.cond_endereco && profileData?.cond_cidade && profileData?.cond_estado
      ? `${profileData.cond_endereco} - ${profileData.cond_cidade} - ${profileData.cond_estado}`
      : profileData?.cond_endereco && profileData?.cond_cidade
      ? `${profileData.cond_endereco} - ${profileData.cond_cidade}`
      : profileData?.cond_endereco || profileData?.cond_cidade || 'Não informado',
    
    // Data de cadastro do usuário
    registrationDate: formatarDataCadastro(profileData?.user_data_cadastro),
    
    // Tipo de usuário
    userType: profileData?.user_tipo || 'Morador',
    
    // Mock data para campos futuros
    area: '85m²',
    bedrooms: 3,
    bathrooms: 2,
    monthlyFee: 'R$ 485,00',
    emergencyContact: {
      name: 'Em breve',
      phone: '-',
      relationship: '-'
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
  };

  // Componentes de UI modernos
  const InfoCard = ({ icon: Icon, title, value, subtitle, color = theme.colors.primary }) => (
    <Animatable.View animation="fadeIn" style={styles.modernInfoCard}>
      <View style={[styles.modernIconContainer, { backgroundColor: color }]}>
        <Icon size={26} color="#FFFFFF" strokeWidth={2.5} />
      </View>
      <View style={styles.modernInfoContent}>
        <Text style={[styles.modernInfoTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.modernInfoValue, { color: theme.colors.text }]} numberOfLines={2}>
          {value}
        </Text>
        {subtitle && (
          <Text style={[styles.modernInfoSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </Animatable.View>
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

  if (loading) {
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
              <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>{displayData.title}</Text>
              <Text style={[styles.overviewSubtitle, { color: theme.colors.primary }]}>{displayData.subtitle}</Text>
              <Text style={[styles.overviewDetail, { color: theme.colors.textSecondary }]}>{displayData.area} • {displayData.bedrooms} quartos • {displayData.bathrooms} banheiros</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Basic Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMAÇÕES BÁSICAS</Text>
          <View style={styles.modernInfoGrid}>
            <InfoCard 
              icon={MapPin} 
              title="LOCALIZAÇÃO" 
              value={displayData.enderecoCompleto} 
              subtitle={displayData.subtitle}
              color="#10B981"
            />
            <InfoCard 
              icon={Calendar} 
              title="DESDE" 
              value={displayData.registrationDate} 
              subtitle="Data de cadastro no app"
              color="#F59E0B"
            />
            <InfoCard 
              icon={Users} 
              title="TIPO" 
              value={displayData.userType === 'Morador' ? 'Morador' : displayData.userType === 'Proprietario' ? 'Proprietário' : displayData.userType === 'Sindico' ? 'Síndico' : displayData.userType === 'ADM' ? 'Administrador' : displayData.userType} 
              subtitle="Relação com o imóvel"
              color="#8B5CF6"
            />
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
