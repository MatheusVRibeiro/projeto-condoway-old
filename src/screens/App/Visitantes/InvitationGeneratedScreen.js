import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, Share2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { DateTime } from 'luxon';

import { useTheme } from '../../../contexts/ThemeProvider';
import styles from './InvitationGeneratedScreenStyles';
import Button from '../../../components/Button';

export default function InvitationGeneratedScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  // ✅ CORREÇÃO: Esta tela não deve fazer parte do histórico de navegação
  // Quando o usuário pressiona "Concluir" ou "Voltar", ele vai direto para o Dashboard
  // sem possibilidade de voltar para esta tela usando o botão de voltar do sistema
  
  // Recebe os parâmetros enviados da tela anterior
  const { 
    visitorName = "Visitante",
    qrCodeHash = "",
    visitorId = "",
    visitorData = {}
  } = route.params || {};

  console.log('📋 Dados recebidos na tela de convite:', { visitorName, qrCodeHash, visitorId, visitorData });

  // Usa o hash do QR Code gerado pelo backend
  const qrCodeValue = qrCodeHash || `VISITOR_${visitorId}_${Date.now()}`;
  
  // Formata a data de validade
  const getValidityText = () => {
    const validadeFim = visitorData?.vst_validade_fim || visitorData?.dados?.vst_validade_fim;
    if (!validadeFim) return 'Válido apenas hoje';
    
    const dt = DateTime.fromSQL(validadeFim);
    if (!dt.isValid) return 'Válido apenas hoje';
    
    const today = DateTime.local().startOf('day');
    if (dt.hasSame(today, 'day')) {
      return `Válido até hoje às ${dt.toFormat('HH:mm')}`;
    }
    
    return `Válido até ${dt.toFormat('dd/MM/yyyy')} às ${dt.toFormat('HH:mm')}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Olá ${visitorName}! Você foi autorizado a visitar o Condomínio CondoWay. Apresente este QR Code na portaria.\n\n${getValidityText()}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error.message);
    }
  };

  const handleFinish = () => {
    // Limpa o histórico de navegação e volta para a tela principal de visitantes
    // Isso evita que o usuário volte para esta tela ao pressionar "voltar"
    navigation.reset({
      index: 0,
      routes: [
        { name: 'Dashboard' }, // Volta para as tabs principais (Dashboard)
      ],
    });
    
    // Opcional: navegar para a tab de visitantes especificamente
  // navigation.navigate('Dashboard', { screen: 'Visitantes' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinish} style={styles.backButton}>
          <ArrowLeft color={theme.colors.primary} size={26} />
        </TouchableOpacity>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        <CheckCircle color={theme.colors.success} size={64} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Convite Gerado!</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Convite para <Text style={{ fontWeight: 'bold' }}>{visitorName}</Text> foi criado com sucesso.
        </Text>

        {/* QR Code */}
        <View style={[styles.qrCodeContainer, { backgroundColor: 'white' }]}>
          {qrCodeValue ? (
            <QRCode
              value={qrCodeValue}
              size={220}
              logoBackgroundColor='transparent'
            />
          ) : (
            <Text style={{ color: theme.colors.textSecondary }}>
              Erro ao gerar QR Code
            </Text>
          )}
        </View>
        
        <Text style={[styles.details, { color: theme.colors.textSecondary }]}>
          {getValidityText()}
        </Text>
      </View>

      {/* Botões de Ação */}
      <View style={styles.buttonContainer}>
        <Button
          title="Compartilhar Convite"
          onPress={handleShare}
          icon={Share2}
          fullWidth
        />
        <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
          <Text style={[styles.finishButtonText, { color: theme.colors.textSecondary }]}>Concluir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
