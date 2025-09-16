import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- Containers ---
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
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

  // --- Tabs ---
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
  tabContent: {
    marginTop: 24,
  },

  // --- Categories grid ---
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryTitle: {
    fontWeight: '600',
    color: '#334155',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },

  // --- Form ---
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  attachmentButtonText: { marginLeft: 8, fontSize: 16, fontWeight: '600' },

  // attachment preview & thumbnails
  attachmentPreviewContainer: { position: 'relative', marginTop: 8 },
  attachmentImage: { width: '100%', height: 200, borderRadius: 8 },
  removeAttachmentButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 4 },
  attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  thumbnailWrapper: { width: 100, height: 100, marginRight: 8, marginBottom: 8, position: 'relative' },
  thumbnail: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#e5e7eb' },
  progressBarContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, backgroundColor: '#f1f5f9', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden' },
  progressBar: { height: '100%', width: '0%', backgroundColor: '#2563eb' },

  radioGroup: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalOption: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e6eef8' },
  modalOptionText: { fontSize: 16, fontWeight: '600' },
  modalCancel: { borderBottomWidth: 0, marginTop: 8 },
  radioButton: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  radioDot: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#2563eb' },

  submitButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // confirmation
  confirmationContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  confirmationTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  confirmationText: { fontSize: 16, color: '#64748b', textAlign: 'center', marginVertical: 8 },

  // issues list
  accordionItem: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, overflow: 'hidden' },
  accordionTrigger: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  triggerLeft: { flex: 1 },
  accordionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  accordionSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  accordionContent: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },

  // comments
  commentBubble: { maxWidth: '85%', padding: 12, borderRadius: 12, marginBottom: 12 },
  commentText: { fontSize: 14 },
  commentDate: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  moradorBubble: { backgroundColor: '#2563eb', alignSelf: 'flex-end' },
  sindicoBubble: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start' },
  moradorText: { color: 'white' },
  sindicoText: { color: '#1e293b' },

  // Message composer
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e6eef8' },
  messageInput: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: 'transparent' },
  sendButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { fontWeight: '700', fontSize: 14, color: '#fff' },

  // Protocol display
  protocolContainer: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 2, 
    borderRadius: 12, 
    padding: 16, 
    marginVertical: 16, 
    alignItems: 'center',
    borderStyle: 'dashed'
  },
  protocolLabel: { 
    fontSize: 12, 
    fontWeight: '500', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 4 
  },
  protocolNumber: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    letterSpacing: 1 
  },
});
