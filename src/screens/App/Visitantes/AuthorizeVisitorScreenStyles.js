import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Header com botão voltar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.card,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  validityInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 16,
    gap: 12,
  },
  validityInfoContent: {
    flex: 1,
  },
  validityInfoTitle: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  validityInfoText: {
    fontSize: RFValue(13),
    color: theme.colors.text,
    lineHeight: 20,
  },
  accessTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  accessTypeInfo: {
    flex: 1,
    marginRight: 12,
  },
  accessTypeLabel: {
    fontSize: RFValue(15),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  accessTypeDescription: {
    fontSize: RFValue(12),
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeField: {
    flex: 1,
  },
  notesContainer: {
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: `${theme.colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: RFValue(13),
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  // Tabs de validade - Design compacto
  validityTabs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  validityTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  validityTabActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  validityTabText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  validityTabTextActive: {
    color: theme.colors.primary,
  },
  // Quick info box
  quickInfo: {
    backgroundColor: `${theme.colors.primary}10`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  quickInfoText: {
    fontSize: RFValue(12),
    color: theme.colors.primary,
    fontWeight: '500',
  },
  // Período customizado compacto
  customPeriod: {
    marginBottom: 16,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  compactField: {
    flex: 1,
  },
  compactLabel: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  // Dias da semana
  weekDaysContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  dayButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}20`,
  },
  dayButtonText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  dayButtonTextActive: {
    color: theme.colors.primary,
  },
  // Alert simplificado
  simpleAlert: {
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    marginTop: 8,
  },
  simpleAlertText: {
    fontSize: RFValue(12),
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  // Date Picker Button
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
    gap: 10,
  },
  datePickerText: {
    fontSize: RFValue(14),
    color: theme.colors.textSecondary,
    flex: 1,
  },
  datePickerTextFilled: {
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default styles;
