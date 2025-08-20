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
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  text: {
    color: '#2563eb',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
});
