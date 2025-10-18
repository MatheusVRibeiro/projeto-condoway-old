import React from 'react';
import { View, Text } from 'react-native';
import { InboxIcon } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

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

export default React.memo(OccurrenceEmptyState);
