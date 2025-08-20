import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 24,
  },
  logo: {
    width: 64,
    height: 64,
    marginTop: 48,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ef',
    marginBottom: 32,
    textAlign: 'center',
  },
  illustration: {
    width: 260,
    height: 260,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 16,
  },
});
