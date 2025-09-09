import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- Containers ---
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // centraliza o ícone e o título
    width: '100%',
    marginBottom: 8,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
    textAlign: 'center',
    // remover flex para permitir centralização correta
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  // --- Header Actions ---
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // --- Estatísticas ---
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },

  // --- Busca e Filtros ---
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // --- Barra de Pesquisa ---
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 13,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 16,
  },

  // --- Abas (Tabs) ---
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 2,
    gap: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    // Removido maxHeight para evitar corte do texto
  },
  tabButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#475569',
    fontSize: 13,
    paddingHorizontal: 2,
    flexShrink: 1,
    minWidth: 0,
  },
  tabTextActive: {
    color: '#2563eb',
  },
  tabBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginLeft: 4,
    minWidth: 18,
    minHeight: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16,
  },
  tabContent: {
    marginTop: 24,
    flex: 1,
    minHeight: 0,
    paddingBottom: 20,
  },

  // --- Card de Encomenda ---
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  packageCardAwaiting: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  packageCardDelivered: {
    opacity: 0.8,
  },
  storeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storeIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  packageInfo: {
    flex: 1,
  },
  packageStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  packageDetails: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  // --- Estado Vazio ---
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },

  // --- Modal de Detalhes ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailIcon: {
    marginRight: 12,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseButton: {
    marginTop: 24,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    textAlign: 'center',
    color: '#475569',
    fontWeight: '600',
  },

  // --- Agrupamento por Data (SectionList) ---
  sectionHeaderContainer: {
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: '#f8fafc', // Mesma cor do fundo da tela
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },

  // --- Floating Action Button ---
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },

  // --- Package Card Urgency ---
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  urgentText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // --- Urgent Alert ---
  urgentAlert: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
