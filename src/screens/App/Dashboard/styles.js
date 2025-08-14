import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- Containers ---
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Espaço extra no final para não sobrepor a TabNav
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
    fontFamily: 'Poppins-Bold', // Adicione se tiver as fontes
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // --- Aviso Card ---
  avisoCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // bg-red-50
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444', // border-red-500
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avisoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  avisoTextContainer: {
    flex: 1,
  },
  avisoTitle: {
    fontWeight: 'bold',
    color: '#991b1b', // text-red-900
    fontFamily: 'Poppins-Bold',
  },
  avisoText: {
    fontSize: 14,
    color: '#991b1b', // text-red-900
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },

  // --- Ações Rápidas Grid ---
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  },
  actionCardIcon: {
    marginBottom: 8,
  },
  actionCardTitle: {
    fontWeight: '600',
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  actionBadge: {
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
  actionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // --- Últimas Atualizações ---
  updatesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateGroup: {
    marginBottom: 12,
  },
  updateDate: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af', // text-gray-400
    paddingBottom: 8,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  updateIconContainer: {
    backgroundColor: '#f3f4f6', // bg-gray-100
    padding: 8,
    borderRadius: 999, // rounded-full
    marginRight: 12,
  },
  updateTextContainer: {
    flex: 1,
  },
  updateText: {
    fontSize: 14,
    color: '#374151', // text-gray-800
    fontFamily: 'Poppins-Regular',
  },
  updateTime: {
    fontSize: 12,
    color: '#9ca3af', // text-gray-400
    fontFamily: 'Poppins-Regular',
  },
  // Adicione no final de src/screens/App/Dashboard/styles.js

  // --- Skeleton Loading ---
  loadingContainer: {
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  skeletonHeaderText: {
    width: '60%',
    height: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonSubText: {
    width: '40%',
    height: 16,
    borderRadius: 8,
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  skeletonCard: {
    height: 90,
    width: '100%',
    borderRadius: 12,
    marginBottom: 24,
  },
  skeletonActionCard: {
    width: '48%',
    height: 110,
    borderRadius: 12,
    marginBottom: 16,
  },
});