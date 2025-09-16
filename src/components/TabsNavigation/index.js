import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

const TabsNavigation = ({ 
  activeTab, 
  onTabChange, 
  awaitingCount, 
  deliveredCount, 
  styles 
}) => {
  const { theme } = useTheme();

  const tabs = [
    {
      key: 'Aguardando',
      label: 'Aguardando Retirada',
      count: awaitingCount
    },
    {
      key: 'Entregue',
      label: 'Retirados',
      count: deliveredCount
    }
  ];

  return (
    <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card }]}>
      {tabs.map(({ key, label, count }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.tabButton,
            { borderColor: theme.colors.border },
            activeTab === key && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => onTabChange(key)}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === key ? '#ffffff' : theme.colors.text }
          ]}>
            {label}
          </Text>
          {count > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.tabBadgeText}>{count}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default React.memo(TabsNavigation);
