import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Platform, StatusBar } from 'react-native';
import { X, Users, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeProvider';

const EnvironmentDetailsModal = ({ visible, environment, onClose, onReserve }) => {
  const { theme } = useTheme();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleReserve = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReserve(environment);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="slideInUp"
          duration={400}
          style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}
        >
          {environment ? (
            <>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {environment.name}
              </Text>
              <View style={[
                styles.availabilityBadge,
                {
                  backgroundColor: environment.available
                    ? theme.colors.success + '22'
                    : theme.colors.error + '22',
                },
              ]}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: environment.available
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.availabilityText,
                    {
                      color: environment.available
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                >
                  {environment.available ? 'Disponível' : 'Indisponível'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <X size={20} color={theme.colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Descrição */}
            <Animatable.View animation="fadeIn" delay={100} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Sobre o Ambiente
              </Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {environment.description}
              </Text>
            </Animatable.View>

            {/* Informações Principais */}
            <Animatable.View animation="fadeIn" delay={200} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Informações
              </Text>
              
              <View style={[styles.infoCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '22' }]}>
                    <Users size={18} color={theme.colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      Capacidade
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {environment.capacity} pessoas
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.infoRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '22' }]}>
                    <Clock size={18} color={theme.colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      Horário de Funcionamento
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      08:00 - 22:00
                    </Text>
                  </View>
                </View>
              </View>
            </Animatable.View>

            {/* Itens Disponíveis */}
            {environment.items && environment.items.length > 0 && (
              <Animatable.View animation="fadeIn" delay={300} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Itens Disponíveis
                </Text>
                <View style={styles.itemsGrid}>
                  {environment.items.map((item, index) => (
                    <View 
                      key={index}
                      style={[styles.itemChip, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                    >
                      <MapPin size={14} color={theme.colors.primary} strokeWidth={2.5} />
                      <Text style={[styles.itemText, { color: theme.colors.text }]}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animatable.View>
            )}

            {/* Regras */}
            {environment.rules && environment.rules.length > 0 && (
              <Animatable.View animation="fadeIn" delay={400} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Regras de Uso
                </Text>
                <View style={[styles.rulesCard, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
                  {environment.rules.map((rule, index) => (
                    <View key={index} style={styles.ruleRow}>
                      <AlertCircle size={16} color="#f59e0b" strokeWidth={2.5} />
                      <Text style={[styles.ruleText, { color: '#92400e' }]}>
                        {rule}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animatable.View>
            )}
          </ScrollView>

          {/* Footer com botão de reservar */}
          {environment.available && (
            <Animatable.View 
              animation="fadeInUp" 
              delay={500}
              style={[styles.footer, { borderTopColor: theme.colors.border }]}
            >
              <TouchableOpacity
                style={[styles.reserveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleReserve}
                activeOpacity={0.7}
              >
                <CheckCircle size={20} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.reserveButtonText}>
                  Fazer Reserva
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
            </>
          ) : (
            <View style={[styles.loadingContainer, { borderColor: theme.colors.border }]}> 
              <View style={[styles.loadingBar, { backgroundColor: theme.colors.border }]} />
              <View style={[styles.loadingBar, { backgroundColor: theme.colors.border, width: '60%' }]} />
            </View>
          )}
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748b',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  itemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  rulesCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    padding: 16,
    gap: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#92400e',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  reserveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loadingBar: {
    height: 12,
    borderRadius: 999,
    width: '100%',
  },
});

export default EnvironmentDetailsModal;
