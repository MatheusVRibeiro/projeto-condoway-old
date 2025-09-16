import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import StatusBadge from '../StatusBadge';
import { styles } from '../../screens/App/Packages/styles';

export default function PackageCard({ item, onPress }) {
  const { theme } = useTheme();
  const safe = theme && theme.colors ? theme.colors : { card: '#fff', border: '#e5e7eb', background: '#f5f5f5', text: '#000', textSecondary: '#666', primary: '#2563eb' };

  const getDaysWaiting = () => {
    const today = new Date();
    const arrival = new Date(item.arrivalDate);
    const diffTime = Math.abs(today - arrival);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Animatable.View animation="fadeInUp" duration={500}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.packageCard,
          { backgroundColor: safe.card, borderColor: safe.border },
          item.status === 'Aguardando' && { borderLeftWidth: 4, borderLeftColor: safe.primary },
          item.status === 'Entregue' && { opacity: 0.85 },
          pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 }
        ]}
        android_ripple={{ color: safe.border }}
      >
        <View style={[styles.storeIconContainer, { backgroundColor: safe.background, borderColor: safe.border }]}> 
          <Text style={[styles.storeIconText, { color: safe.text }]}>{item.store.substring(0,4).toUpperCase()}</Text>
        </View>
        <View style={styles.packageInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={[styles.packageStore, { color: safe.text }]}>{item.store}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={[styles.packageDetails, { color: safe.textSecondary }]}>Cód: {item.trackingCode || 'Não informado'}</Text>
          <Text style={[styles.packageDetails, { color: safe.textSecondary }]}>Chegou em: {new Date(item.arrivalDate).toLocaleDateString('pt-BR')}</Text>
          {item.status === 'Aguardando' && (
            <Text style={[styles.packageDetails, { color: safe.textSecondary }]}>Aguardando há {getDaysWaiting()} dia(s)</Text>
          )}
          {item.status === 'Entregue' && item.confirmedBy && (
            <Text style={[styles.packageDetails, { color: '#22c55e', fontWeight: 'bold' }]}>Retirado por: {item.confirmedBy} em {new Date(item.confirmedAt).toLocaleDateString('pt-BR')} {new Date(item.confirmedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          )}
        </View>
      </Pressable>
    </Animatable.View>
  );
}
