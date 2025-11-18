import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: RFValue(12),
    fontWeight: '500',
    color: theme.colors.textSecondary,
    letterSpacing: -0.1,
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
    height: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: RFValue(20),
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: RFValue(10),
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  statTextWrapper: {
    flex: 1,
    gap: 2,
  },
});

export default createStyles;
