import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

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

export default React.memo(OccurrenceCard);
