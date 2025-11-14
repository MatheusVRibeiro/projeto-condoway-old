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
    width: 200,
    height: 200,
    marginTop: 48,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ef',
    marginBottom: 48,
    textAlign: 'center',
    paddingHorizontal: 20,
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