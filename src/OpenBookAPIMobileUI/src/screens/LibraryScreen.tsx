import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateListModal } from '../components/CreateListModal';
import { ListCard } from '../components/ListCard';
import { ReadingList } from '../database';
import { useReadingLists } from '../hooks/useReadingLists';
import { useResponsive } from '../hooks/useResponsive';
import { libraryService } from '../services/libraryService';
import { LibraryStackParamList } from '../types';

type LibraryScreenNavigationProp = NativeStackNavigationProp<
  LibraryStackParamList,
  'LibraryMain'
>;

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const { listColumns, listCardWidth } = useResponsive();
  const { lists, loading, error, refresh } = useReadingLists();
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleListPress = useCallback(
    (list: ReadingList) => {
      navigation.navigate('ListDetail', {
        listId: list.id,
        listName: list.name,
      });
    },
    [navigation],
  );

  const handleListLongPress = useCallback((list: ReadingList) => {
    if (list.isSystemList) {
      Alert.alert('Info', 'System lists cannot be deleted or edited.');
      return;
    }

    Alert.alert(list.name, 'What would you like to do with this list?', [
      {
        text: 'Edit',
        onPress: () => {
          // TODO: Edit list modal
          Alert.alert(
            'Coming Soon',
            'List editing feature will be added soon.',
          );
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => confirmDeleteList(list),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  }, []);

  const confirmDeleteList = useCallback((list: ReadingList) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await libraryService.deleteList(list.id);
            } catch (err) {
              console.error('Error deleting list:', err);
              Alert.alert(
                'Error',
                'An error occurred while deleting the list.',
              );
            }
          },
        },
      ],
    );
  }, []);

  const handleCreateList = useCallback(
    async (name: string, icon: string, color: string) => {
      try {
        await libraryService.createList(name, icon, color);
        setCreateModalVisible(false);
      } catch (err) {
        console.error('Error creating list:', err);
        Alert.alert('Error', 'An error occurred while creating the list.');
      }
    },
    [],
  );

  const renderListCard = useCallback(
    ({ item }: { item: ReadingList }) => (
      <ListCard
        id={item.id}
        name={item.name}
        icon={item.icon}
        color={item.color}
        isSystem={item.isSystemList}
        onPress={() => handleListPress(item)}
        onLongPress={() => handleListLongPress(item)}
        cardWidth={listCardWidth}
      />
    ),
    [handleListPress, handleListLongPress, listCardWidth],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>No lists yet</Text>
      <Text style={styles.emptyText}>Create lists to organize your books.</Text>
    </View>
  );

  if (loading && lists.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading lists...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>An error occurred</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderListCard}
        keyExtractor={item => item.id}
        key={`lists-grid-${listColumns}`}
        numColumns={listColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
        accessibilityLabel="Create new list"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create List Modal */}
      <CreateListModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
});
