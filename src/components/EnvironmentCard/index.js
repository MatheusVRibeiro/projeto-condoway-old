import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Users, CalendarCheck, MapPin, Info, Utensils, PartyPopper, Volleyball, Gamepad, Book } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeProvider';

const EnvironmentCard = ({ item, onReserve, onDetails, index = 0 }) => {
  const { theme } = useTheme();

  const handleReserve = () => {
    if (item.available) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onReserve(item);
    }
  };

  const handleDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDetails(item);
  };

  // Ícone baseado no nome do ambiente
  const getEnvironmentIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('salão') || nameLower.includes('festas')) {
      return { icon: PartyPopper, color: '#ec4899', lightColor: '#fce7f3' };
    }
    if (nameLower.includes('churrasqueira') || nameLower.includes('gourmet')) {
      return { icon: Utensils, color: '#f59e0b', lightColor: '#fed7aa' };
    }
    if (nameLower.includes('quadra') || nameLower.includes('tênis') || nameLower.includes('esporte')) {
      return { icon: Volleyball, color: '#10b981', lightColor: '#d1fae5' };
    }
    if (nameLower.includes('jogos') || nameLower.includes('sala de jogos') || nameLower.includes('game')) {
      return { icon: Gamepad, color: '#8b5cf6', lightColor: '#f3e8ff' };
    }
    if (nameLower.includes('estudo') || nameLower.includes('biblioteca') || nameLower.includes('study')) {
      return { icon: Book, color: '#06b6d4', lightColor: '#dffafe' };
    }
    return { icon: MapPin, color: '#3b82f6', lightColor: '#dbeafe' };
  };

  const envIcon = getEnvironmentIcon(item.name);
  const EnvironmentIcon = envIcon.icon;

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={500}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Header com ícone grande e badge */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: envIcon.lightColor }]}>
            <EnvironmentIcon size={32} color={envIcon.color} strokeWidth={2} />
          </View>

          {/* Badge de disponibilidade */}
          <View
            style={[
              styles.availabilityBadge,
              {
                backgroundColor: item.available
                  ? theme.colors.success + '22'
                  : theme.colors.error + '22',
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: item.available
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            />
            <Text
              style={[
                styles.availabilityText,
                {
                  color: item.available
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            >
              {item.available ? 'Disponível' : 'Indisponível'}
            </Text>
          </View>
        </View>

        {/* Título e descrição */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* Informações em badges */}
        <View style={styles.infoBadges}>
          <View style={[styles.infoBadge, { backgroundColor: theme.colors.background }]}>
            <Users size={14} color={theme.colors.primary} strokeWidth={2.5} />
            <Text style={[styles.infoBadgeText, { color: theme.colors.textSecondary }]}>
              {item.capacity} pessoas
            </Text>
          </View>

          {item.items && item.items.length > 0 && (
            <View style={[styles.infoBadge, { backgroundColor: theme.colors.background }]}>
              <MapPin size={14} color={theme.colors.primary} strokeWidth={2.5} />
              <Text style={[styles.infoBadgeText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.items.length} {item.items.length === 1 ? 'item' : 'itens'}
              </Text>
            </View>
          )}
        </View>

        {/* Footer com botões */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.outlineButton,
              { borderColor: theme.colors.border },
            ]}
            onPress={handleDetails}
            activeOpacity={0.7}
          >
            <Info size={16} color={theme.colors.text} strokeWidth={2.5} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              Detalhes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              {
                backgroundColor: item.available
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={handleReserve}
            disabled={!item.available}
            activeOpacity={0.7}
          >
            <CalendarCheck
              size={16}
              color="#ffffff"
              strokeWidth={2.5}
            />
            <Text style={styles.primaryButtonText}>Reservar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  outlineButton: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    // backgroundColor aplicado dinamicamente
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default React.memo(EnvironmentCard);
