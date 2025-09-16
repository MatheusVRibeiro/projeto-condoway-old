import React from 'react';
import { SectionList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import PackageCard from '../PackageCard';
import EmptyState from '../EmptyState';
import SectionHeader from '../SectionHeader';

const PackageList = ({ 
  sections, 
  refreshing, 
  onRefresh, 
  onItemPress, 
  emptyMessage,
  isAwaitingTab = false,
  styles 
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => {
    if (isAwaitingTab) {
      return (
        <>
          <PackageCard item={item} onPress={() => onItemPress(item)} />
          <View style={{ height: 8 }} />
        </>
      );
    }
    return <PackageCard item={item} onPress={() => onItemPress(item)} />;
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => (
        <SectionHeader title={title} styles={styles} />
      )}
      ListEmptyComponent={<EmptyState message={emptyMessage} />}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={[theme.colors.primary]} 
          tintColor={theme.colors.primary} 
        />
      }
      contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default React.memo(PackageList);
