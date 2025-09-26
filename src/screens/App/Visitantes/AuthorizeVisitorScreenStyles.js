import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    marginLeft: 16,
    color: theme.colors.text,
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    marginLeft: 8,
    color: theme.colors.textSecondary,
  },
  validityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  validityOption: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    width: '48%',
    backgroundColor: theme.colors.card,
  },
  validityOptionSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  validityOptionUnselected: {
    borderColor: theme.colors.border,
  },
  validityText: {
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  validityTextSelected: {
    color: theme.colors.primary,
  },
  validityTextUnselected: {
    color: theme.colors.text,
  },
  dateRangeContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
});

export default styles;
