import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  inactiveTabText: {
    color: theme.colors.textSecondary,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: RFValue(10),
    fontWeight: 'bold',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  // List
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  listContainerEmpty: {
    flex: 1,
  },
  // Cards - Próximos Visitantes
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: RFValue(20),
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardCPF: {
    fontSize: RFValue(12),
    color: theme.colors.textSecondary,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDateTime: {
    fontSize: RFValue(12),
    color: theme.colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: RFValue(10),
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: RFValue(11),
    fontWeight: '600',
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cards - Histórico
  historyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardSubtitle: {
    fontSize: RFValue(12),
    color: theme.colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  timeItem: {
    gap: 2,
  },
  timeLabel: {
    fontSize: RFValue(10),
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  timeValue: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: theme.colors.text,
  },
  arrowIcon: {
    marginHorizontal: 4,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: RFValue(14),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: RFValue(14),
    fontWeight: '600',
  },

  // FAB
  fabWrapper: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Modal de Detalhes
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitleContainer: {
    flex: 1,
    gap: 8,
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  modalAvatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalAvatarText: {
    color: '#FFF',
    fontSize: RFValue(32),
    fontWeight: 'bold',
  },
  modalVisitorName: {
    fontSize: RFValue(22),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  modalVisitorType: {
    fontSize: RFValue(14),
    color: theme.colors.textSecondary,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalInfoText: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: RFValue(12),
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalNotesText: {
    fontSize: RFValue(14),
    color: theme.colors.text,
    lineHeight: 22,
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionButtonSecondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalActionButtonDanger: {
    backgroundColor: '#EF4444',
  },
  modalActionButtonText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFF',
  },
  modalActionButtonTextSecondary: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: theme.colors.text,
  },
  historyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(14),
    color: theme.colors.textSecondary,
  },
});

export default styles;
