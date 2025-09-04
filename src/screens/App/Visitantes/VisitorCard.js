import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { User, Briefcase, Home, Users, Building, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeProvider';

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

function diffHuman(entradaDate, saidaDate) {
  if (!entradaDate || !saidaDate) return null;
  const diffMs = new Date(saidaDate) - new Date(entradaDate);
  if (diffMs < 0) return null;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours ? hours + 'h ' : ''}${mins ? mins + 'min' : '0min'}`;
}

// Map semântico de cor do tipo
const typeColorMap = (theme, type) => {
  switch (type) {
    case 'Prestador': return theme.colors.error; // vermelho
    case 'Hospede': return '#8b5cf6'; // custom roxo
    default: return theme.colors.success; // verde
  }
};

const typeIcon = (theme, type, size = 16) => {
  const color = typeColorMap(theme, type);
  switch (type) {
    case 'Prestador': return <Briefcase size={size} color={color} />;
    case 'Hospede': return <Home size={size} color={color} />;
    default: return <Users size={size} color={color} />;
  }
};

// Gerador de estilos dependente do tema
const makeStyles = (theme) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: theme.isDark ? 4 : 2 },
    shadowOpacity: theme.isDark ? 0.4 : 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4, letterSpacing: 0.2 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8, fontWeight: '500' },
  badgeBase: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tinyDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  dividerTop: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border },
  metaText: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4, fontWeight: '500' },
  observation: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: 14, borderRadius: 12 },
  observationText: { flex: 1, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  primaryAction: { backgroundColor: theme.colors.error, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, shadowColor: theme.colors.error, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  primaryActionText: { color: '#ffffff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  editButton: { backgroundColor: theme.colors.secondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, minWidth: 36, alignItems: 'center', shadowColor: theme.colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  companyInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  companyText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  typeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  statusBadge: { position: 'absolute', top: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  headerWrapper: { marginBottom: 16, position: 'relative' },
  nameAndType: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 8 },
});

export default function VisitorCard({ item, onMarkExit, onEdit }) {
  const { theme } = useTheme();
  const s = useMemo(() => StyleSheet.create(makeStyles(theme)), [theme]);

  const saiu = !!item.vst_data_saida;
  const statusColor = saiu ? theme.colors.success : theme.colors.info;
  const statusText = saiu ? 'Saiu' : 'No condomínio';
  const tempo = saiu ? diffHuman(item.vst_data_visita, item.vst_data_saida) : null;
  const tipoColor = typeColorMap(theme, item.vst_tipo);

  const onLongPress = () => onEdit && onEdit(item);

  return (
    <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.85} style={s.card}>
      {/* Cabeçalho + Badge de status */}
      <View style={s.headerWrapper}>
        <View>
          <Text style={s.title}>{item.vst_nome}</Text>
          <Text style={s.subtitle}>{item.vst_documento}</Text>
          <View style={s.nameAndType}>
            <View style={[s.typeBadge, { backgroundColor: tipoColor + '22' }]}>
              {typeIcon(theme, item.vst_tipo, 12)}
              <Text style={[s.typeText, { color: tipoColor }]}>{item.vst_tipo}</Text>
            </View>
            {item.vst_empresa && (
              <View style={s.companyInfo}>
                <Building size={10} color={theme.colors.textSecondary} />
                <Text style={s.companyText}>{item.vst_empresa}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <View style={[s.tinyDot, { backgroundColor: statusColor }]} />
          <Text style={[s.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Datas */}
      <View style={s.dividerTop}>
        <Text style={s.metaText}>Entrada: {formatDateTime(item.vst_data_visita)}</Text>
        {saiu && <Text style={s.metaText}>Saída: {formatDateTime(item.vst_data_saida)}</Text>}
        {tempo && <Text style={s.metaText}>Tempo: {tempo}</Text>}
      </View>

      {/* Observação */}
      {item.vst_observacao && (
        <View style={[s.observation, { backgroundColor: theme.colors.warning + '22', borderLeftWidth: 4, borderLeftColor: theme.colors.warning }]}>
          <MessageSquare size={12} color={theme.colors.warning} />
          <Text style={[s.observationText, { color: theme.colors.warning }]} numberOfLines={2}>
            {item.vst_observacao}
          </Text>
        </View>
      )}

      {/* Ações */}
      <View style={s.actions}>
        {!saiu && (
          <TouchableOpacity
            style={[s.primaryAction]}
            onPress={() => onMarkExit && onMarkExit(item.vst_id)}
          >
            <Text style={s.primaryActionText}>Marcar saída</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={s.editButton}
          onPress={() => onEdit && onEdit(item)}
        >
          <User size={12} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
