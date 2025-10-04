import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InboxIcon } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';

const OccurrenceEmptyState = ({ message = 'Nenhuma ocorrência encontrada' }) => {
  const { theme } = useTheme();

  return (
    <Animatable.View 
      animation="fadeIn" 
      duration={600}
      style={styles.container}
    >
      <Animatable.View 
        animation="bounceIn" 
        delay={200}
        duration={800}
        style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}
      >
        <InboxIcon size={48} color={theme.colors.textSecondary} strokeWidth={1.5} />
      </Animatable.View>
      
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Nada por aqui
      </Text>
      
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default React.memo(OccurrenceEmptyState);
