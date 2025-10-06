import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Building2, Users } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import { useCondominio } from '../../hooks/useCondominio';

/**
 * Card de informações do condomínio
 * Exibe nome, endereço e cidade do condomínio
 */
export default function CondominioCard({ onPress, style }) {
  const { theme } = useTheme();
  const { condominioData, loading } = useCondominio();

  if (loading || !condominioData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
        <View style={styles.skeleton}>
          <Text style={[styles.skeletonText, { color: theme.colors.textSecondary }]}>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        },
        style
      ]}
    >
      <TouchableOpacity 
        onPress={onPress}
        style={styles.content}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {/* Header com ícone */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '22' }]}>
            <Building2 size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Condomínio
            </Text>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {condominioData.cond_nome}
            </Text>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.infoContainer}>
          {condominioData.cond_endereco && (
            <View style={styles.infoRow}>
              <MapPin size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {condominioData.cond_endereco}
              </Text>
            </View>
          )}

          {condominioData.cond_cidade && (
            <View style={styles.infoRow}>
              <MapPin size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {condominioData.cond_cidade}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    gap: 12,
  },
  skeleton: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonText: {
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    gap: 8,
    paddingLeft: 60,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
});
