import React from 'react';
import { View, Text } from 'react-native';
import { Package as PackageIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeProvider';

const PackageHeader = ({ 
  awaitingCount, 
  deliveredCount, 
  totalCount, 
  styles 
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        {PackageIcon ? (
          <PackageIcon color={theme.colors.primary} size={28} />
        ) : (
          <Text style={{ fontSize: 24 }}>📦</Text>
        )}

        <Text style={[styles.headerTitleText, { color: theme.colors.text }]}> 
          Minhas Encomendas
        </Text>
      </View>

      <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}> 
        Acompanhe os pacotes que chegaram para si.
      </Text>

      {/* StatsCard inline para evitar problemas de import */}
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
    </View>
  );
};

export default React.memo(PackageHeader);
