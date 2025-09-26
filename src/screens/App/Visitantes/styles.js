import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: 'bold',
    marginLeft: 12,
    color: theme.colors.text,
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderColor: 'transparent',
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
  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  // Floating Action Button (FAB)
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    elevation: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Cards (Visitor & History)
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: RFValue(15),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: RFValue(12),
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  // Resend Button
  resendButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  resendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: RFValue(11),
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: RFValue(14),
    color: theme.colors.textSecondary,
  },
});

export default styles;
