import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // --- Card de Encomenda ---
  packageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  packageCardAwaiting: {
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6',
  },
  packageCardDelivered: {
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
  },
  packageCardContent: {
    padding: 16,
  },
  packageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  packageInfo: {
    flex: 1,
  },
  packageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  packageStore: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeAwaiting: {
    backgroundColor: '#dbeafe',
  },
  statusBadgeDelivered: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeUrgent: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTextAwaiting: {
    color: '#1e40af',
  },
  statusTextDelivered: {
    color: '#065f46',
  },
  statusTextUrgent: {
    color: '#dc2626',
  },
  trackingCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  trackingCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'monospace',
    flex: 1,
  },
  copyButton: {
    padding: 4,
  },
  packageDetails: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 18,
  },
  timelineContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineIcon: {
    marginRight: 8,
  },
  timelineText: {
    fontSize: 12,
    color: '#64748b',
  },
  timelineTextBold: {
    fontWeight: '600',
    color: '#475569',
  },
  waitingTimeAlert: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    gap: 8,
  },
  waitingTimeText: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  actionButtonSecondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
  },
  actionButtonTextSecondary: {
    color: '#475569',
  },
});
