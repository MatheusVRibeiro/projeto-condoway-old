import React from 'react';
import { View, Text } from 'react-native';
import { Package, Clock, CheckCircle } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts/ThemeProvider';
import styles from './styles';

const PackageHeader = ({ awaitingCount, deliveredCount, totalCount }) => {
  const { theme } = useTheme();

  const stats = [
    {
      icon: Clock,
      label: 'Aguardando',
      value: awaitingCount,
      color: '#3b82f6',
      lightColor: '#dbeafe',
      delay: 0
    },
    {
      icon: CheckCircle,
      label: 'Retiradas',
      value: deliveredCount,
      color: '#10b981',
      lightColor: '#d1fae5',
      delay: 100
    },
    {
      icon: Package,
      label: 'Total',
      value: totalCount,
      color: '#64748b',
      lightColor: '#f1f5f9',
      delay: 200
    }
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isLast = index === stats.length - 1;
          return (
            <React.Fragment key={stat.label}>
              <Animatable.View
                animation="fadeInUp"
                delay={stat.delay}
                style={styles.statCard}
              >
                <View style={[styles.iconContainer, { backgroundColor: stat.lightColor }]}>
                  <Icon size={20} color={stat.color} strokeWidth={2.5} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </Animatable.View>
              {!isLast && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.separator} />
    </View>
  );
};

export default React.memo(PackageHeader);
