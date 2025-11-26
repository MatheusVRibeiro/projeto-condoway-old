import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingTop: -10,
    paddingBottom: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: theme.colors.textSecondary,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTouchable: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: RFValue(22),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  statTextWrapper: {
    flex: 0,
    alignItems: 'center',
    gap: 2,
  },
});

export default createStyles;
