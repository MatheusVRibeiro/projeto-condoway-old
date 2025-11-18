import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  cardWrapper: {
    borderRadius: 14,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: RFValue(16),
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  visitorName: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  visitorPhone: {
    fontSize: RFValue(11),
    fontWeight: '500',
    color: theme.colors.textSecondary,
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: RFValue(11),
    fontWeight: '500',
    color: theme.colors.textSecondary,
    letterSpacing: -0.1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: RFValue(11),
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0EA25C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default createStyles;
