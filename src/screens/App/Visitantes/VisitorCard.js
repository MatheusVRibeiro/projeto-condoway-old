import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { styles } from './styles';

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function diffHuman(entradaDate, saidaDate) {
  if (!entradaDate || !saidaDate) return null;
  const diffMs = new Date(saidaDate) - new Date(entradaDate);
  if (diffMs < 0) return null;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours ? hours + 'h ' : ''}${mins ? mins + 'min' : '0min'}`;
}

export default function VisitorCard({ item, onMarkExit, onEdit }) {
  const saiu = !!item.vst_data_saida;
  const statusColor = saiu ? '#22c55e' : '#2563eb';
  const statusText = saiu ? 'Saiu' : 'No condomínio';
  const tempo = saiu ? diffHuman(item.vst_data_visita, item.vst_data_saida) : null;

  const onLongPress = () => onEdit && onEdit(item);

  return (
    <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.85} style={styles.visitorCard}>
      <User size={32} color="#64748b" style={{ marginRight: 16 }} />
      <View style={styles.visitorInfo}>
        <Text style={styles.visitorName}>{item.vst_nome}</Text>
        <Text style={styles.visitorDocument}>{item.vst_documento}</Text>
        <Text style={styles.visitorDate}>Entrada: {formatDateTime(item.vst_data_visita)}</Text>
        {saiu && <Text style={styles.visitorDate}>Saída: {formatDateTime(item.vst_data_saida)}</Text>}
        {tempo && <Text style={styles.visitorDate}>Tempo de permanência: {tempo}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <View style={{ backgroundColor: statusColor, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{statusText}</Text>
          </View>
          {!saiu && (
            <TouchableOpacity onPress={() => onMarkExit && onMarkExit(item.vst_id)} style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#fee2e2', borderRadius: 8 }}>
              <Text style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: 12 }}>Marcar saída</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onEdit && onEdit(item)} style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#e0e7ef', borderRadius: 8, marginLeft: 8 }}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 12 }}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
