import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sideBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  storeName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Código de Rastreamento
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  trackingIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageIconBox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageIconText: {
    fontSize: 14,
  },
  trackingCode: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.3,
  },
  copyButton: {
    padding: 4,
  },
  // Informações de Data
  dateInfo: {
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748b',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  waitingLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748b',
  },
  waitingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
});
