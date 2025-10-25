import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Share } from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeProvider';
import { 
  X, 
  Calendar, 
  Hash, 
  Package, 
  Clock, 
  CheckCircle, 
  Store, 
  Copy, 
  Share2,
  AlertCircle,
  Check
} from 'lucide-react-native';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Toast from 'react-native-toast-message';
import styles from './styles';

export default function PackageModal({ visible, onClose, package: selectedPackage }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!selectedPackage) return null;

  // Validação e parse seguro das datas
  const arrivalDate = selectedPackage.arrivalDate 
    ? parseISO(selectedPackage.arrivalDate) 
    : new Date();
    
  const deliveryDate = selectedPackage.deliveryDate
    ? parseISO(selectedPackage.deliveryDate)
    : (selectedPackage.retirada_data ? parseISO(selectedPackage.retirada_data) : null);
    
  const daysWaiting = selectedPackage.arrivalDate 
    ? differenceInDays(new Date(), arrivalDate)
    : 0;
    
  const isAwaiting = selectedPackage.status === 'Aguardando';

  const handleCopyTrackingCode = async () => {
    if (selectedPackage.trackingCode) {
      try {
        await Clipboard.setStringAsync(selectedPackage.trackingCode);
        
        // Feedback háptico
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Atualiza estado visual
        setCopied(true);
        
        // Toast de sucesso
        Toast.show({
          type: 'success',
          text1: '✓ Código copiado!',
          text2: selectedPackage.trackingCode,
          position: 'bottom',
          visibilityTime: 2000,
        });
        
        // Reseta o ícone após 2 segundos
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: '✗ Erro ao copiar',
          text2: 'Tente novamente',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    }
  };

  const handleSharePackage = async () => {
    try {
      const message = `📦 Encomenda de ${selectedPackage.store}\n` +
        `Código: ${selectedPackage.trackingCode || 'Não informado'}\n` +
        `Status: ${selectedPackage.status}\n` +
        `Chegou em: ${format(arrivalDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}` +
        (deliveryDate ? `\nRetirado em: ${format(deliveryDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}` : '');
      
      await Share.share({ message });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animatable.View animation="slideInUp" duration={400} style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '22' }]}>
                <Package size={24} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Detalhes da Encomenda</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{selectedPackage.store || 'Loja não informada'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.colors.background }]}>
              <X color={theme.colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Badge Grande */}
            <View style={styles.statusSection}>
              <View style={[
                styles.statusBadgeLarge,
                { backgroundColor: isAwaiting ? theme.colors.primary + '22' : theme.colors.success + '22' }
              ]}>
                {isAwaiting ? (
                  <Clock size={32} color={theme.colors.primary} strokeWidth={2.5} />
                ) : (
                  <CheckCircle size={32} color={theme.colors.success} strokeWidth={2.5} />
                )}
                <Text style={[
                  styles.statusTextLarge,
                  { color: isAwaiting ? theme.colors.primary : theme.colors.success }
                ]}>
                  {isAwaiting ? 'Aguardando Retirada' : 'Retirado'}
                </Text>
                {isAwaiting && (
                  <Text style={[styles.waitingDaysText, { color: theme.colors.textSecondary }]}>
                    Há {daysWaiting} {daysWaiting === 1 ? 'dia' : 'dias'}
                  </Text>
                )}
              </View>
            </View>

            {/* Informações Principais */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Informações</Text>
              
              {/* Loja */}
              <View style={styles.infoRow}>
                <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.background }]}>
                  <Store size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Loja</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{selectedPackage.store || 'Não informado'}</Text>
                </View>
              </View>

              {/* Código de Rastreamento */}
              {selectedPackage.trackingCode && (
                <TouchableOpacity 
                  style={styles.infoRow}
                  onPress={handleCopyTrackingCode}
                  activeOpacity={0.7}
                >
                  <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.background }]}>
                    <Hash size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={[styles.infoContent, { flex: 1 }]}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Código de Rastreamento</Text>
                    <Text style={[styles.infoValue, styles.trackingCode, { color: theme.colors.text }]}>
                      {selectedPackage.trackingCode}
                    </Text>
                  </View>
                  {copied ? (
                    <Check size={18} color={theme.colors.success} />
                  ) : (
                    <Copy size={18} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}

              {/* Data de Chegada */}
              <View style={styles.infoRow}>
                <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.background }]}>
                  <Calendar size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Data de Chegada</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {format(arrivalDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Text>
                  <Text style={[styles.infoValueSecondary, { color: theme.colors.textSecondary }]}>
                    {format(arrivalDate, "HH:mm", { locale: ptBR })}
                  </Text>
                </View>
              </View>

              {/* Data de Retirada */}
              {deliveryDate && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconContainer, { backgroundColor: theme.colors.success + '22' }]}>
                    <CheckCircle size={20} color={theme.colors.success} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Data de Retirada</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.success }]}>
                      {format(deliveryDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </Text>
                    <Text style={[styles.infoValueSecondary, { color: theme.colors.success }]}>
                      {format(deliveryDate, "HH:mm", { locale: ptBR })}
                    </Text>
                  </View>
                </View>
              )}

              {/* Tempo de Espera para Aguardando */}
              {isAwaiting && daysWaiting > 0 && (
                <View style={[styles.waitingAlert, { backgroundColor: theme.colors.primary + '22', borderLeftColor: theme.colors.primary }]}>
                  <AlertCircle size={18} color={theme.colors.primary} />
                  <Text style={[styles.waitingAlertText, { color: theme.colors.primary }]}>
                    Esta encomenda está aguardando retirada há{' '}
                    <Text style={{ fontWeight: '700' }}>
                      {daysWaiting} {daysWaiting === 1 ? 'dia' : 'dias'}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer com Ações */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={handleSharePackage}
            >
              <Share2 size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.shareButtonText, { color: theme.colors.text }]}>Compartilhar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.closeButtonFooter, { backgroundColor: theme.colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
}
