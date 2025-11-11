import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Home, MapPin, Calendar, Users, Car, Clock } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './styles';
import { useTheme } from '../../../../contexts/ThemeProvider';
import { apiService } from '../../../../services/api';
import { useProfile } from '../../../../hooks/useProfile';
import { useAuth } from '../../../../contexts/AuthContext';

export default function UnitDetails() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { profileData, loading: loadingProfile } = useProfile();
  const [ambientes, setAmbientes] = useState([]);
  const [loadingAmbientes, setLoadingAmbientes] = useState(true);
  
  // Usar dados reais da API em vez de mock
  const formatRegistrationDate = () => {
    // Tentar múltiplas fontes de data
    const dataCadastro = profileData?.user_data_cadastro || 
                         profileData?.data_cadastro || 
                         user?.user_data_cadastro || 
                         user?.data_cadastro;
    
    console.log('📅 [UnitDetails] Data de cadastro encontrada:', dataCadastro);
    
    if (!dataCadastro) {
      return 'Data não informada';
    }
    
    try {
      const date = new Date(dataCadastro);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ [UnitDetails] Data inválida:', dataCadastro);
        return 'Data inválida';
      }
      const formattedDate = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      // Capitalizar primeira letra do mês
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch (error) {
      console.error('❌ [UnitDetails] Erro ao formatar data:', error);
      return 'Erro ao carregar data';
    }
  };
  
  const formatCurrency = (value) => {
    if (!value || value === 0) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const unitData = {
    apartment: profileData?.ap_numero || user?.ap_numero || '---',
    block: profileData?.bloc_nome || user?.bloc_nome || '---',
    condominium: profileData?.cond_nome || user?.cond_nome || '---',
    city: profileData?.cond_cidade || user?.cond_cidade || 'Não informado',
    state: profileData?.cond_estado || user?.cond_estado || '--',
    registrationDate: formatRegistrationDate(),
    monthlyFee: formatCurrency(profileData?.cond_taxa_base || user?.cond_taxa_base),
  };

  console.log('📦 [UnitDetails] Dados da unidade:', unitData);
  console.log('👤 [UnitDetails] profileData completo:', profileData);
  console.log('👤 [UnitDetails] user completo:', user);
  console.log('� [UnitDetails] Taxa base - Verificação:', {
    'profileData.taxa_base': profileData?.taxa_base,
    'user.taxa_base': user?.taxa_base,
    'profileData.cond_taxa_base': profileData?.cond_taxa_base,
    'user.cond_taxa_base': user?.cond_taxa_base,
    'Tipo profileData.taxa_base': typeof profileData?.taxa_base,
    'Tipo user.taxa_base': typeof user?.taxa_base,
  });
  console.log('�📋 [UnitDetails] Campos de data disponíveis:', {
    'profileData.user_data_cadastro': profileData?.user_data_cadastro,
    'profileData.data_cadastro': profileData?.data_cadastro,
    'user.user_data_cadastro': user?.user_data_cadastro,
    'user.data_cadastro': user?.data_cadastro
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

      {loadingProfile ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary, marginTop: 16 }]}>
            Carregando dados da unidade...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Unit Overview */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={[styles.overviewCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <View style={styles.overviewHeader}>
            <View style={[styles.overviewIcon, { backgroundColor: theme.colors.primary + '22' }]}>
              <Home size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={[styles.overviewTitle, { color: theme.colors.text, fontSize: 22, fontWeight: '700' }]}>{unitData.condominium}</Text>
              <Text style={[styles.overviewSubtitle, { color: theme.colors.textSecondary }]}>{unitData.block} - Apto {unitData.apartment}</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Basic Information */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>INFORMAÇÕES BÁSICAS</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text, fontWeight: '600' }]}>Condomínio</Text>
              <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Text style={[styles.fieldValue, { color: theme.colors.text, fontWeight: '400' }]}>
                  {unitData.condominium || 'Não informado'}
                </Text>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldContainer, styles.fieldHalf]}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text, fontWeight: '600' }]}>Bloco</Text>
                <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.text, fontWeight: '400' }]}>
                    {unitData.block || 'Não informado'}
                  </Text>
                </View>
              </View>

              <View style={[styles.fieldContainer, styles.fieldHalf]}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text, fontWeight: '600' }]}>Apartamento</Text>
                <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.text, fontWeight: '400' }]}>
                    {unitData.apartment || 'Não informado'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldContainer, styles.fieldLarge]}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text, fontWeight: '600' }]}>Cidade</Text>
                <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.text, fontWeight: '400' }]}>
                    {unitData.city || 'Não informado'}
                  </Text>
                </View>
              </View>

              <View style={[styles.fieldContainer, styles.fieldSmall]}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text, fontWeight: '600' }]}>Estado</Text>
                <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.text, fontWeight: '400' }]}>
                    {unitData.state || '--'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text, fontWeight: '600' }]}>Cadastrado desde</Text>
              <View style={[styles.fieldInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Text style={[styles.fieldValue, { color: theme.colors.text, fontWeight: '400' }]}>
                  {unitData.registrationDate || 'Não informado'}
                </Text>
              </View>
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
                    key={ambiente.amd_id || index} 
                    name={ambiente.amd_nome || 'Ambiente sem nome'} 
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
      )}
    </SafeAreaView>
  );
}
