import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Share, Clipboard } from 'react-native';
import * as Animatable from 'react-native-animatable';
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
  AlertCircle 
} from 'lucide-react-native';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Toast from 'react-native-toast-message';
import styles from './styles';

export default function PackageModal({ visible, onClose, package: selectedPackage }) {
  const { theme } = useTheme();

  if (!selectedPackage) return null;

  const arrivalDate = parseISO(selectedPackage.arrivalDate);
  const deliveryDate = selectedPackage.retirada_data ? parseISO(selectedPackage.retirada_data) : null;
  const daysWaiting = differenceInDays(new Date(), arrivalDate);
  const isAwaiting = selectedPackage.status === 'Aguardando';

  const handleCopyTrackingCode = () => {
    if (selectedPackage.trackingCode) {
      Clipboard.setString(selectedPackage.trackingCode);
      Toast.show({
        type: 'success',
        text1: 'Código copiado!',
        text2: 'Código de rastreamento copiado',
        position: 'bottom',
        visibilityTime: 2000,
      });
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
        <Animatable.View animation="slideInUp" duration={400} style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Package size={24} color="#3b82f6" strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.title}>Detalhes da Encomenda</Text>
                <Text style={styles.subtitle}>{selectedPackage.store || 'Loja não informada'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Badge Grande */}
            <View style={styles.statusSection}>
              <View style={[
                styles.statusBadgeLarge,
                isAwaiting ? styles.statusBadgeAwaitingLarge : styles.statusBadgeDeliveredLarge
              ]}>
                {isAwaiting ? (
                  <Clock size={32} color="#3b82f6" strokeWidth={2.5} />
                ) : (
                  <CheckCircle size={32} color="#10b981" strokeWidth={2.5} />
                )}
                <Text style={[
                  styles.statusTextLarge,
                  isAwaiting ? styles.statusTextAwaitingLarge : styles.statusTextDeliveredLarge
                ]}>
                  {isAwaiting ? 'Aguardando Retirada' : 'Retirado'}
                </Text>
                {isAwaiting && (
                  <Text style={styles.waitingDaysText}>
                    Há {daysWaiting} {daysWaiting === 1 ? 'dia' : 'dias'}
                  </Text>
                )}
              </View>
            </View>

            {/* Informações Principais */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações</Text>
              
              {/* Loja */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Store size={20} color="#64748b" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Loja</Text>
                  <Text style={styles.infoValue}>{selectedPackage.store || 'Não informado'}</Text>
                </View>
              </View>

              {/* Código de Rastreamento */}
              {selectedPackage.trackingCode && (
                <TouchableOpacity 
                  style={styles.infoRow}
                  onPress={handleCopyTrackingCode}
                  activeOpacity={0.7}
                >
                  <View style={styles.infoIconContainer}>
                    <Hash size={20} color="#64748b" />
                  </View>
                  <View style={[styles.infoContent, { flex: 1 }]}>
                    <Text style={styles.infoLabel}>Código de Rastreamento</Text>
                    <Text style={[styles.infoValue, styles.trackingCode]}>
                      {selectedPackage.trackingCode}
                    </Text>
                  </View>
                  <Copy size={18} color="#3b82f6" />
                </TouchableOpacity>
              )}

              {/* Data de Chegada */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Calendar size={20} color="#64748b" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Data de Chegada</Text>
                  <Text style={styles.infoValue}>
                    {format(arrivalDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Text>
                  <Text style={styles.infoValueSecondary}>
                    {format(arrivalDate, "HH:mm", { locale: ptBR })}
                  </Text>
                </View>
              </View>

              {/* Data de Retirada */}
              {deliveryDate && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconContainer, { backgroundColor: '#d1fae5' }]}>
                    <CheckCircle size={20} color="#10b981" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Data de Retirada</Text>
                    <Text style={[styles.infoValue, { color: '#047857' }]}>
                      {format(deliveryDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </Text>
                    <Text style={[styles.infoValueSecondary, { color: '#059669' }]}>
                      {format(deliveryDate, "HH:mm", { locale: ptBR })}
                    </Text>
                  </View>
                </View>
              )}

              {/* Tempo de Espera para Aguardando */}
              {isAwaiting && daysWaiting > 0 && (
                <View style={styles.waitingAlert}>
                  <AlertCircle size={18} color="#3b82f6" />
                  <Text style={styles.waitingAlertText}>
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
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleSharePackage}
            >
              <Share2 size={18} color="#64748b" />
              <Text style={styles.shareButtonText}>Compartilhar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButtonFooter}
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
