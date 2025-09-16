import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

const SectionHeader = ({ title, styles }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.sectionHeaderContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionHeaderText, { color: theme.colors.textSecondary }]}>
        {title}
      </Text>
    </View>
  );
};

export default React.memo(SectionHeader);
