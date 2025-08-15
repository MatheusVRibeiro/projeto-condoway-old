import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- Containers ---
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  // --- Barra de Pesquisa ---
  searchContainer: {
    position: 'relative',
    marginBottom: 24,
  },
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
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  tabBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContent: {
    marginTop: 24,
    flex: 1, // Importante para o ScrollView/FlatList funcionar corretamente
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
});
