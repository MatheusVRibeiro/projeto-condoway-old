import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';

const OccurrenceCard = ({ item, onPress, index = 0 }) => {
  const { theme } = useTheme();

  // Função para obter cor e ícone baseado no status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Aberta':
      case 'Pendente':
        return {
          color: '#3b82f6',
          lightColor: '#dbeafe',
          icon: AlertCircle,
          label: 'Aberta',
        };
      case 'Em Análise':
      case 'Em Andamento':
        return {
          color: '#f59e0b',
          lightColor: '#fed7aa',
          icon: Clock,
          label: 'Em Análise',
        };
      case 'Resolvida':
      case 'Concluída':
        return {
          color: '#10b981',
          lightColor: '#d1fae5',
          icon: CheckCircle,
          label: 'Resolvida',
        };
      default:
        return {
          color: '#6b7280',
          lightColor: '#f3f4f6',
          icon: AlertCircle,
          label: status || 'Pendente',
        };
    }
  };

  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;
  const hasNewComments = item.hasNewComments || false;
  const lastComment = item.comments && item.comments.length > 0 
    ? item.comments[item.comments.length - 1] 
    : null;

  // Formatar data
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={500}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderLeftColor: statusConfig.color,
          },
        ]}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        {/* Header com título e status */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title || item.category}
            </Text>
            <Text style={[styles.protocol, { color: theme.colors.textSecondary }]}>
              Protocolo: {item.protocol}
            </Text>
          </View>

          {/* Badge de status */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.lightColor }]}>
            <StatusIcon size={12} color={statusConfig.color} strokeWidth={2.5} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Informações principais */}
        <View style={styles.infoContainer}>
          <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            📍 {item.location}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            📅 {formatDate(item.date)}
          </Text>
        </View>

        {/* Preview do último comentário */}
        {lastComment && (
          <View style={[styles.commentPreview, { backgroundColor: theme.colors.background }]}>
            <MessageCircle size={14} color={theme.colors.textSecondary} style={styles.commentIcon} />
            <View style={styles.commentContent}>
              <Text style={[styles.commentAuthor, { color: theme.colors.textSecondary }]}>
                {lastComment.author}:
              </Text>
              <Text style={[styles.commentText, { color: theme.colors.text }]} numberOfLines={2}>
                {lastComment.text}
              </Text>
            </View>
            {hasNewComments && (
              <Animatable.View 
                animation="pulse" 
                iterationCount="infinite" 
                duration={1500}
                style={styles.newBadge}
              >
                <View style={styles.newDot} />
              </Animatable.View>
            )}
          </View>
        )}

        {/* Contador de comentários */}
        {item.comments && item.comments.length > 0 && (
          <View style={styles.footer}>
            <MessageCircle size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.commentCount, { color: theme.colors.textSecondary }]}>
              {item.comments.length} {item.comments.length === 1 ? 'comentário' : 'comentários'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  protocol: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoContainer: {
    marginBottom: 12,
    gap: 6,
  },
  location: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  commentPreview: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    position: 'relative',
  },
  commentIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  commentCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default React.memo(OccurrenceCard);
