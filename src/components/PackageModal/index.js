import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import { X, Calendar, Hash, Package } from 'lucide-react-native';
import StatusBadge from '../StatusBadge';
import DetailRow from '../DetailRow';

export default function PackageModal({ visible, onClose, package: selectedPackage }) {
  const { theme } = useTheme();
  const safe = theme && theme.colors ? theme.colors : { 
    card: '#fff', 
    text: '#000', 
    textSecondary: '#666',
    primary: '#2563eb' 
  };

  if (!selectedPackage) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Animatable.View animation="zoomIn" duration={300} style={{ backgroundColor: safe.card, borderRadius: 16, padding: 20, width: '100%', maxWidth: 400 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: safe.text, fontSize: 18, fontWeight: 'bold' }}>{selectedPackage.store}</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={safe.textSecondary} size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <StatusBadge status={selectedPackage.status} />
          </View>
          
          <DetailRow 
            icon={Calendar} 
            label="Data de Chegada" 
            value={new Date(selectedPackage.arrivalDate).toLocaleString('pt-BR', {dateStyle: 'long', timeStyle: 'short'})} 
          />
          
          <DetailRow 
            icon={Hash} 
            label="Código de Rastreio" 
            value={selectedPackage.trackingCode || 'Não informado'} 
            copyable={!!selectedPackage.trackingCode} 
          />
          
          {selectedPackage.deliveryDate && (
            <DetailRow 
              icon={Package} 
              label="Data de Retirada" 
              value={new Date(selectedPackage.deliveryDate).toLocaleDateString('pt-BR')} 
            />
          )}
          
          <TouchableOpacity 
            style={{ backgroundColor: safe.primary, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 16 }} 
            onPress={onClose}
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Fechar</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </Modal>
  );
}
