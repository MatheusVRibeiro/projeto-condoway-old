import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Package, CheckCircle } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';

const FilterPanel = ({ visible, sortBy, onSortChange, styles }) => {
  const { theme } = useTheme();

  const filterOptions = [
    { key: 'date', label: 'Data', icon: Calendar },
    { key: 'store', label: 'Loja', icon: Package },
    { key: 'status', label: 'Status', icon: CheckCircle }
  ];

  if (!visible) return null;

  return (
    <Animatable.View 
      animation="fadeInDown" 
      duration={300} 
      style={[styles.filtersContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Ordenar por:</Text>
      <View style={styles.filterOptions}>
        {filterOptions.map(({ key, label, icon: Icon }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterOption,
              { backgroundColor: sortBy === key ? theme.colors.primary : 'transparent' }
            ]}
            onPress={() => onSortChange(key)}
          >
            <Icon size={16} color={sortBy === key ? '#ffffff' : theme.colors.textSecondary} />
            <Text style={[
              styles.filterOptionText,
              { color: sortBy === key ? '#ffffff' : theme.colors.text }
            ]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animatable.View>
  );
};

export default React.memo(FilterPanel);
