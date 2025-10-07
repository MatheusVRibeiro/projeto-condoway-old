import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Store, Calendar, Package, Clock, CheckCircle2, AlertCircle, Copy } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

export default function PackageCard({ item, onPress, index }) {
  const { theme } = useTheme();
  
  const isAwaiting = item.status === 'Aguardando';
  const arrivalDate = new Date(item.arrivalDate);
  const daysWaiting = differenceInDays(new Date(), arrivalDate);
  const isUrgent = daysWaiting >= 7;
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(item);
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
        style={[
          styles.packageCard,
          isAwaiting ? styles.packageCardAwaiting : styles.packageCardDelivered,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.packageCardContent}>
          {/* Header: Ícone + Nome + Status */}
          <View style={styles.packageCardHeader}>
            <View style={styles.storeIconContainer}>
              <Text style={styles.storeIconText}>
                {getStoreInitials(item.store)}
              </Text>
            </View>

            <View style={styles.packageInfo}>
              <View style={styles.packageTopRow}>
                <Text style={styles.packageStore} numberOfLines={1}>
                  {item.store}
                </Text>
              </View>
              
              <View style={[
                styles.statusBadge,
                isUrgent && isAwaiting 
                  ? styles.statusBadgeUrgent 
                  : isAwaiting 
                    ? styles.statusBadgeAwaiting 
                    : styles.statusBadgeDelivered
              ]}>
                {isAwaiting ? (
                  <Clock size={11} color={isUrgent ? '#dc2626' : '#1e40af'} strokeWidth={2.5} />
                ) : (
                  <CheckCircle2 size={11} color="#065f46" strokeWidth={2.5} />
                )}
                <Text style={[
                  styles.statusText,
                  isUrgent && isAwaiting
                    ? styles.statusTextUrgent
                    : isAwaiting
                      ? styles.statusTextAwaiting
                      : styles.statusTextDelivered
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Código de Rastreamento */}
          <View style={styles.trackingCodeContainer}>
            <Package size={14} color="#64748b" strokeWidth={2} />
            <Text style={styles.trackingCode} numberOfLines={1}>
              {item.trackingCode}
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineRow}>
              <Calendar size={14} color="#64748b" strokeWidth={2} style={styles.timelineIcon} />
              <Text style={styles.timelineText}>
                Chegou em <Text style={styles.timelineTextBold}>
                  {format(arrivalDate, "dd 'de' MMMM", { locale: ptBR })}
                </Text>
              </Text>
            </View>

            {!isAwaiting && item.deliveryDate && (
              <View style={styles.timelineRow}>
                <CheckCircle2 size={14} color="#10b981" strokeWidth={2} style={styles.timelineIcon} />
                <Text style={styles.timelineText}>
                  Retirado em <Text style={styles.timelineTextBold}>
                    {format(new Date(item.deliveryDate), "dd/MM/yyyy", { locale: ptBR })}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Alerta de Tempo de Espera */}
          {isAwaiting && daysWaiting > 0 && (
            <View style={styles.waitingTimeAlert}>
              <AlertCircle size={16} color="#ef4444" strokeWidth={2.5} />
              <Text style={styles.waitingTimeText}>
                Aguardando há {daysWaiting} {daysWaiting === 1 ? 'dia' : 'dias'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}
