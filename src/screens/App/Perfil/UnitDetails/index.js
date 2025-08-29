import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Home, MapPin, Calendar, Users, Car, Wifi, Zap, Droplets, Edit3, Phone, Mail } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { userProfile } from '../mock';

export default function UnitDetails() {
  const navigation = useNavigation();
  const [unitData] = useState({
    ...userProfile,
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

  const InfoCard = ({ icon: Icon, title, value, subtitle, onEdit }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIconContainer}>
          <Icon size={20} color="#2563eb" />
        </View>
        <View style={styles.infoTitleContainer}>
          <Text style={styles.infoTitle}>{title}</Text>
          {subtitle && <Text style={styles.infoSubtitle}>{subtitle}</Text>}
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Edit3 size={16} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const UtilityStatus = ({ icon: Icon, name, status }) => (
    <View style={styles.utilityItem}>
      <View style={styles.utilityIcon}>
        <Icon size={18} color={status === 'Ativo' ? '#10b981' : '#ef4444'} />
      </View>
      <Text style={styles.utilityName}>{name}</Text>
      <View style={[styles.utilityStatus, { backgroundColor: status === 'Ativo' ? '#dcfce7' : '#fee2e2' }]}>
        <Text style={[styles.utilityStatusText, { color: status === 'Ativo' ? '#166534' : '#dc2626' }]}>
          {status}
        </Text>
      </View>
    </View>
  );

  const AmenityItem = ({ name }) => (
    <View style={styles.amenityItem}>
      <View style={styles.amenityDot} />
      <Text style={styles.amenityText}>{name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={400} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Unidade</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Unit Overview */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIcon}>
              <Home size={32} color="#2563eb" />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewTitle}>{unitData.apartment}</Text>
              <Text style={styles.overviewSubtitle}>{unitData.block} • {unitData.condominium}</Text>
              <Text style={styles.overviewDetail}>{unitData.area} • {unitData.bedrooms} quartos • {unitData.bathrooms} banheiros</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Basic Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES BÁSICAS</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoGrid}>
              <InfoCard
                icon={MapPin}
                title="Localização"
                value={`${unitData.apartment}, ${unitData.block}`}
                subtitle="Endereço da unidade"
              />
              <InfoCard
                icon={Calendar}
                title="Desde"
                value={unitData.registrationDate}
                subtitle="Data de cadastro"
              />
              <InfoCard
                icon={Users}
                title="Tipo"
                value={unitData.userType === 'morador' ? 'Morador' : 'Proprietário'}
                subtitle="Relação com o imóvel"
              />
              <InfoCard
                icon={Car}
                title="Vagas"
                value={`${unitData.parkingSpots} vaga`}
                subtitle="Estacionamento"
              />
            </View>
          </View>
        </Animatable.View>

        {/* Financial Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES FINANCEIRAS</Text>
          <View style={styles.sectionContent}>
            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>Taxa Condominial Mensal</Text>
              <Text style={styles.financialValue}>{unitData.monthlyFee}</Text>
              <Text style={styles.financialNote}>Valor baseado na última assembleia</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Emergency Contact */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>CONTATO DE EMERGÊNCIA</Text>
          <View style={styles.sectionContent}>
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactName}>{unitData.emergencyContact.name}</Text>
                <Text style={styles.contactRelation}>{unitData.emergencyContact.relationship}</Text>
              </View>
              <TouchableOpacity style={styles.contactItem}>
                <Phone size={18} color="#2563eb" />
                <Text style={styles.contactText}>{unitData.emergencyContact.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>

        {/* Utilities Status */}
        <Animatable.View animation="fadeInUp" duration={600} delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS DOS SERVIÇOS</Text>
          <View style={styles.sectionContent}>
            <UtilityStatus icon={Droplets} name="Água" status={unitData.utilities.water} />
            <UtilityStatus icon={Zap} name="Energia" status={unitData.utilities.electricity} />
            <UtilityStatus icon={Wifi} name="Internet" status={unitData.utilities.internet} />
          </View>
        </Animatable.View>

        {/* Amenities */}
        <Animatable.View animation="fadeInUp" duration={600} delay={700} style={styles.section}>
          <Text style={styles.sectionTitle}>ÁREAS COMUNS DISPONÍVEIS</Text>
          <View style={styles.sectionContent}>
            <View style={styles.amenitiesGrid}>
              {unitData.amenities.map((amenity, index) => (
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
