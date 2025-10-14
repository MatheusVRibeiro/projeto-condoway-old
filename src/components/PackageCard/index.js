import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, CheckCircle2, Copy } from 'lucide-react-native';
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
        style={styles.card}
        activeOpacity={0.7}
      >
        {/* Barra lateral colorida */}
        <View style={[
          styles.sideBar,
          { backgroundColor: isAwaiting ? '#3b82f6' : '#10b981' }
        ]} />

        <View style={styles.cardContent}>
          {/* Header: Ícone + Nome da Loja + Status */}
          <View style={styles.header}>
            <View style={[
              styles.iconCircle,
              { backgroundColor: isAwaiting ? '#eff6ff' : '#f0fdf4' }
            ]}>
              <Text style={[
                styles.iconText,
                { color: isAwaiting ? '#3b82f6' : '#10b981' }
              ]}>
                {getStoreInitials(item.store)}
              </Text>
            </View>

            <Text style={styles.storeName} numberOfLines={1}>
              {item.store}
            </Text>

            <View style={[
              styles.statusBadge,
              { backgroundColor: isAwaiting ? '#dbeafe' : '#d1fae5' }
            ]}>
              <CheckCircle2 
                size={10} 
                color={isAwaiting ? '#2563eb' : '#16a34a'} 
                strokeWidth={2.5} 
              />
              <Text 
                style={[
                  styles.statusText,
                  { color: isAwaiting ? '#2563eb' : '#16a34a' }
                ]}
                numberOfLines={1}
              >
                {isAwaiting ? 'AGUARDANDO RETIRADA' : 'RETIRADO'}
              </Text>
            </View>
          </View>

          {/* Código de Rastreamento */}
          <View style={styles.trackingContainer}>
            <View style={styles.trackingIcon}>
              <View style={styles.packageIconBox}>
                <Text style={styles.packageIconText}>📦</Text>
              </View>
            </View>
            <Text style={styles.trackingCode} numberOfLines={1}>
              {item.trackingCode}
            </Text>
            <TouchableOpacity style={styles.copyButton} activeOpacity={0.6}>
              <Copy size={14} color="#94a3b8" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Informações de Data */}
          <View style={styles.dateInfo}>
            <View style={styles.dateRow}>
              <Calendar size={14} color="#64748b" strokeWidth={2} />
              <Text style={styles.dateLabel}>Chegou em </Text>
              <Text style={styles.dateValue}>
                {format(arrivalDate, "dd 'de' MMMM", { locale: ptBR })}
              </Text>
            </View>

            {isAwaiting && daysWaiting > 0 && (
              <View style={styles.dateRow}>
                <Clock size={14} color="#3b82f6" strokeWidth={2} />
                <Text style={styles.waitingLabel}>Aguardando retirada há </Text>
                <Text style={styles.waitingValue}>{daysWaiting} dias</Text>
              </View>
            )}

            {!isAwaiting && item.deliveryDate && (
              <View style={styles.dateRow}>
                <CheckCircle2 size={14} color="#10b981" strokeWidth={2} />
                <Text style={styles.dateLabel}>Retirado em </Text>
                <Text style={styles.dateValue}>
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
