import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

export default function BackButton({ style }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
      <ArrowLeft size={22} color="#2563eb" />
      <Text style={styles.text}>Voltar</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f1f5ff',
    borderRadius: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    color: '#2563eb',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
