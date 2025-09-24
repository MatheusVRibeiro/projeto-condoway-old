import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // Largura da tela menos o padding lateral (16*2)

export const styles = StyleSheet.create({
  // --- Containers ---
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  notificationButton: {
    position: 'relative',
    marginRight: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f5f5f5'
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // --- Avisos Carrossel ---
  avisoCardWrapper: {
    width: cardWidth,
  },
  avisoCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 16,
  },
  avisoIcon: { marginRight: 12, marginTop: 2 },
  avisoTextContainer: { flex: 1 },
  avisoTitle: { fontWeight: 'bold', color: '#991b1b' },
  avisoText: { fontSize: 14, color: '#991b1b', marginTop: 4 },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: '#2563eb' },

  // --- Ações Rápidas ---
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 110, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionCardIcon: { marginBottom: 8 },
  actionCardTitle: { fontWeight: '600', color: '#444', fontSize: 14, textAlign: 'center' },
  actionBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  actionBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  // --- Últimas Atualizações ---
  updatesCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  updateGroup: { marginBottom: 12 },
  updateDate: { textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold', color: '#9ca3af', paddingBottom: 8 },
  updateItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  updateIconContainer: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 999, marginRight: 12 },
  updateTextContainer: { flex: 1 },
  updateText: { fontSize: 14, color: '#374151' },
  updateTime: { fontSize: 12, color: '#9ca3af' },

  // --- Meu Condomínio ---
  condominioCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  condominioCardIcon: {
    marginBottom: 8,
  },
  condominioCardTitle: {
    fontWeight: '600',
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  condominioCardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  condominioCardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  condominioCardBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  developmentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  developmentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
