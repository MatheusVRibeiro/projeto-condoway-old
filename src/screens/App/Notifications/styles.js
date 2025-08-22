import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'left',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
});
