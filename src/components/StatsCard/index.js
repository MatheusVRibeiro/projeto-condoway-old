import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

const StatsCard = ({ awaitingCount, deliveredCount, totalCount, styles }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.statsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{awaitingCount}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Aguardando</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.colors.success }]}>{deliveredCount}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Retiradas</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalCount}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
      </View>
    </View>
  );
};

export const MemoizedStatsCard = React.memo(StatsCard);
export default StatsCard;
