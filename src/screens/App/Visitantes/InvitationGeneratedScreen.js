import React from 'react';
import { View, Text, TouchableOpacity, Share, SafeAreaView } from 'react-native';
import { ArrowLeft, CheckCircle, Share2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

import { useTheme } from '../../../contexts/ThemeProvider';
import styles from './InvitationGeneratedScreenStyles';
import Button from '../../../components/Button';

export default function InvitationGeneratedScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { visitorName = "Visitante" } = route.params || {};

  const qrCodeValue = `CONVITE_CONDOMINIO_XYZ_VISITANTE_${visitorName.replace(/\s/g, '_').toUpperCase()}_VALIDADE_2025-09-25`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Olá! Você foi convidado para visitar o Condomínio CondoWay. Apresente este QR Code na portaria. Convite para: ${visitorName}.`,
        // Você pode adicionar uma URL aqui se o QR Code representar uma URL
        // url: 'https://seusite.com/convite/123'
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error.message);
    }
  };

  const handleFinish = () => {
    // Voltar para a tela principal de visitantes, limpando o histórico de navegação do fluxo de criação
    navigation.popToTop(); 
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
          <QRCode
            value={qrCodeValue}
            size={220}
            logoBackgroundColor='transparent'
          />
        </View>
        
        <Text style={[styles.details, { color: theme.colors.textSecondary }]}>
          Validade: Apenas hoje (25/09/2025)
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
