import { StyleSheet, Platform, StatusBar } from 'react-native';

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

  // --- Page Header ---
  pageHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
    lineHeight: 20,
    textAlign: 'center',
  },

  // --- Abas (Tabs) - Modernizadas ---
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: '#3b82f6',
  },

  // --- Section Title ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // --- Status Filter Tabs ---
  statusFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusFilterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  statusFilterText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1,
  },
  statusFilterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statusFilterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },

  // --- Group By Filters ---
  groupByContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  groupByLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  groupByButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  groupByButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  groupByButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // --- Group Header ---
  groupHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  groupHeaderCount: {
    fontSize: 11,
    fontWeight: '600',
  },

  // --- Empty State ---
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },

  // --- Loading State ---
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },

  // --- Empty Container ---
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },

  // --- Separador de Data ---
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dateSeparatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 12,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  
  // --- Modal de Reserva (Bottom Sheet Redesign) ---
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalBottomSheet: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetHeader: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  closeSheetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  closeSheetButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  
  // --- Seções do Modal ---
  section: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // --- Period Picker Modernizado ---
  periodGrid: {
    gap: 12,
  },
  modernPeriodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  periodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodIconLarge: {
    fontSize: 40,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
  },
  selectedBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  periodCardContent: {
    gap: 4,
  },
  periodLabelLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  periodTimeLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  reservedBadge: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignSelf: 'flex-start',
  },
  reservedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // --- Botão de Confirmar Reserva ---
  confirmReservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmReservationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  // --- Old styles (deprecated, keeping for backwards compatibility) ---
  periodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  periodIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  periodTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  reservedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- Time Slots (deprecated, keeping for backwards compatibility) ---
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeSlotButton: {
    width: '23%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  timeSlotText: {
    fontWeight: '700',
    fontSize: 13,
  },
  
  modalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
