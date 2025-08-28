import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { User, Briefcase, Home, Users, Building, MessageSquare } from 'lucide-react-native';
import { styles } from './styles';

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('pt-BR', { 
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateOnly(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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

// Sistema de cores e ícones para tipos de visitantes
const getTypeColor = (type) => {
  switch(type) {
    case 'Prestador': return '#ef4444'; // Vermelho para prestadores
    case 'Hospede': return '#8b5cf6';   // Roxo para hóspedes
    default: return '#10b981';          // Verde para visitantes comuns
  }
};

const getTypeIcon = (type, size = 16) => {
  switch(type) {
    case 'Prestador': return <Briefcase size={size} color={getTypeColor(type)} />;
    case 'Hospede': return <Home size={size} color={getTypeColor(type)} />;
    default: return <Users size={size} color={getTypeColor(type)} />;
  }
};

export default function VisitorCard({ item, onMarkExit, onEdit }) {
  const saiu = !!item.vst_data_saida;
  const statusColor = saiu ? '#22c55e' : '#2563eb';
  const statusText = saiu ? 'Saiu' : 'No condomínio';
  const tempo = saiu ? diffHuman(item.vst_data_visita, item.vst_data_saida) : null;
  const typeColor = getTypeColor(item.vst_tipo);

  const onLongPress = () => onEdit && onEdit(item);

  return (
    <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.85} style={styles.visitorCard}>
      {/* Header com status badge posicionado absolute */}
      <View style={styles.cardHeader}>
        <View style={styles.visitorMainInfo}>
          <Text style={styles.visitorName}>{item.vst_nome}</Text>
          <Text style={styles.visitorDocument}>{item.vst_documento}</Text>
          
          {/* Tipo e Empresa */}
          <View style={styles.nameAndType}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              {getTypeIcon(item.vst_tipo, 12)}
              <Text style={[styles.typeText, { color: typeColor }]}>
                {item.vst_tipo}
              </Text>
            </View>
            {item.vst_empresa && (
              <View style={styles.companyInfo}>
                <Building size={10} color="#6b7280" />
                <Text style={styles.companyText}>{item.vst_empresa}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Status Badge - Posicionado absolute */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={{ backgroundColor: statusColor, borderRadius: 3, width: 6, height: 6, marginRight: 4 }} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </View>

      {/* Conteúdo com datas */}
      <View style={styles.cardContent}>
        <Text style={styles.visitorDate}>� Entrada: {formatDateTime(item.vst_data_visita)}</Text>
        {saiu && <Text style={styles.visitorDate}>✅ Saída: {formatDateTime(item.vst_data_saida)}</Text>}
        {tempo && <Text style={styles.visitorDate}>⏱️ Tempo: {tempo}</Text>}
      </View>
      
      {/* Observações */}
      {item.vst_observacao && (
        <View style={styles.observationContainer}>
          <MessageSquare size={12} color="#d97706" />
          <Text style={styles.observationText} numberOfLines={2}>
            {item.vst_observacao}
          </Text>
        </View>
      )}
      
      {/* Ações */}
      <View style={styles.cardActions}>
        {!saiu && (
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => onMarkExit && onMarkExit(item.vst_id)}
          >
            <Text style={styles.exitButtonText}>Marcar saída</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit && onEdit(item)}
        >
          <User size={12} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
