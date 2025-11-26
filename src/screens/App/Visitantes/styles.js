import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentWrapper: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },

  // Tabs - Segmented Control Compacto
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.dark ? 0.15 : 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: RFValue(12),
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inactiveTabText: {
    color: theme.colors.textSecondary,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(9),
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContainer: {
    paddingBottom: 100,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Section Header - Estilo Moderno (Discreto)
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: RFValue(10.5),
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    opacity: 0.7,
  },

  // Empty State - Renovado
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: RFValue(22),
    fontWeight: '',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  emptyText: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 32,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // FAB - Compacto
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
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },

  // Loading More
  loadingMoreContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  loadingMoreText: {
    color: theme.colors.textSecondary,
    fontSize: RFValue(13),
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Error State - Renovado
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 20,
  },
  errorText: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#E74C3C',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});

export default styles;
