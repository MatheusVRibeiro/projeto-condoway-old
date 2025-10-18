import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, CheckCircle2, Copy, Check } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

export default function PackageCard({ item, onPress, index }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  
  const isAwaiting = item.status === 'Aguardando';
  const arrivalDate = new Date(item.arrivalDate);
  const daysWaiting = differenceInDays(new Date(), arrivalDate);
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(item);
  };

  const handleCopyTrackingCode = async () => {
    // Previne que o click abra o modal
    
    
    try {
      await Clipboard.setStringAsync(item.trackingCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      
      // Mostra toast de sucesso
      Toast.show({
        type: 'success',
        text1: '✓ Código copiado!',
        text2: item.trackingCode,
        position: 'bottom',
        visibilityTime: 2000,
      });
      
      // Reseta o ícone após 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao copiar',
        text2: 'Tente novamente',
        position: 'bottom',
      });
    }
  };

  const getStoreInitials = (storeName) => {
    return storeName.substring(0, 2).toUpperCase();
  };

  return (
    <Animatable.View 
      animation="fadeInUp" 
      delay={index * 100}
      duration={400}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}
        activeOpacity={0.7}
      >
        {/* Barra lateral colorida */}
        <View style={[
          styles.sideBar,
          { backgroundColor: isAwaiting ? theme.colors.primary : theme.colors.success }
        ]} />

        <View style={styles.cardContent}>
          {/* Header: Ícone + Nome da Loja + Status */}
          <View style={styles.header}>
            <View style={[
              styles.iconCircle,
              { backgroundColor: isAwaiting ? theme.colors.primary + '22' : theme.colors.success + '22' }
            ]}>
              <Text style={[
                styles.iconText,
                { color: isAwaiting ? theme.colors.primary : theme.colors.success }
              ]}>
                {getStoreInitials(item.store)}
              </Text>
            </View>

            <Text style={[styles.storeName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.store}
            </Text>

            <View style={[
              styles.statusBadge,
              { backgroundColor: isAwaiting ? theme.colors.primary + '22' : theme.colors.success + '22' }
            ]}>
              <CheckCircle2 
                size={10} 
                color={isAwaiting ? theme.colors.primary : theme.colors.success} 
                strokeWidth={2.5} 
              />
              <Text 
                style={[
                  styles.statusText,
                  { color: isAwaiting ? theme.colors.primary : theme.colors.success }
                ]}
                numberOfLines={1}
              >
                {isAwaiting ? 'AGUARDANDO RETIRADA' : 'RETIRADO'}
              </Text>
            </View>
          </View>

          {/* Código de Rastreamento */}
          <View style={[styles.trackingContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.trackingIcon}>
              <View style={styles.packageIconBox}>
                <Text style={styles.packageIconText}>📦</Text>
              </View>
            </View>
            <Text style={[styles.trackingCode, { color: theme.colors.text }]} numberOfLines={1}>
              {item.trackingCode}
            </Text>
            <TouchableOpacity 
              style={styles.copyButton} 
              activeOpacity={0.6}
              onPress={handleCopyTrackingCode}
            >
              {copied ? (
                <Check size={14} color={theme.colors.success} strokeWidth={2.5} />
              ) : (
                <Copy size={14} color={theme.colors.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          {/* Informações de Data */}
          <View style={styles.dateInfo}>
            <View style={styles.dateRow}>
              <Calendar size={14} color={theme.colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Chegou em </Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                {format(arrivalDate, "dd 'de' MMMM", { locale: ptBR })}
              </Text>
            </View>

            {isAwaiting && daysWaiting > 0 && (
              <View style={styles.dateRow}>
                <Clock size={14} color={theme.colors.primary} strokeWidth={2} />
                <Text style={[styles.waitingLabel, { color: theme.colors.textSecondary }]}>Aguardando retirada há </Text>
                <Text style={[styles.waitingValue, { color: theme.colors.primary }]}>{daysWaiting} dias</Text>
              </View>
            )}

            {!isAwaiting && item.deliveryDate && (
              <View style={styles.dateRow}>
                <CheckCircle2 size={14} color={theme.colors.success} strokeWidth={2} />
                <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Retirado em </Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {format(new Date(item.deliveryDate), "dd 'de' MMMM", { locale: ptBR })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}
