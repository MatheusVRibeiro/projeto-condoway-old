import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  statsCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    flex: 1,
  },
  statsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});
