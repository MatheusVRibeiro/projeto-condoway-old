import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  menuGroup: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
