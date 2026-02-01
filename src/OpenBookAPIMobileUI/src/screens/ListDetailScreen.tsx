import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReadingProgressModal } from '../components';
import { SavedBook } from '../database';
import { useBooksInList } from '../hooks/useBooksInList';
import { useResponsive } from '../hooks/useResponsive';
import { libraryService } from '../services/libraryService';
import { LibraryStackParamList } from '../types';
import { SystemListId } from '../types/library.types';

type ListDetailScreenNavigationProp = NativeStackNavigationProp<
  LibraryStackParamList,
  'ListDetail'
>;
type ListDetailScreenRouteProp = RouteProp<LibraryStackParamList, 'ListDetail'>;

export const ListDetailScreen: React.FC = () => {
  const navigation = useNavigation<ListDetailScreenNavigationProp>();
  const route = useRoute<ListDetailScreenRouteProp>();
  const { listId, listName } = route.params;
  const { listDetailImageWidth, listDetailImageHeight } = useResponsive();

  const { books, loading, error, refresh } = useBooksInList(listId);
  const [refreshing, setRefreshing] = useState(false);

  // Reading progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedBookForProgress, setSelectedBookForProgress] =
    useState<SavedBook | null>(null);

  // Check if this is the "Reading" list
  const isReadingList = listId === SystemListId.READING;

  // Dynamic styles for book images based on device type
  const dynamicImageStyles = useMemo(
    () => ({
      width: listDetailImageWidth,
      height: listDetailImageHeight,
    }),
    [listDetailImageWidth, listDetailImageHeight],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleBookPress = useCallback(
    (book: SavedBook) => {
      navigation.navigate('BookDetail', {
        workKey: book.workKey,
        title: book.title,
      });
    },
    [navigation],
  );

  const handleRemoveBook = useCallback(
    (book: SavedBook) => {
      Alert.alert(
        'Remove Book from List',
        `Do you want to remove "${book.title}" from this list?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await libraryService.removeBookFromList(book.id, listId);
              } catch (err) {
                console.error('Error removing book from list:', err);
                Alert.alert(
                  'Error',
                  'An error occurred while removing the book from the list.',
                );
              }
            },
          },
        ],
      );
    },
    [listId],
  );

  const handleProgressPress = useCallback((book: SavedBook) => {
    setSelectedBookForProgress(book);
    setShowProgressModal(true);
  }, []);

  const handleProgressModalClose = useCallback(() => {
    setShowProgressModal(false);
    setSelectedBookForProgress(null);
  }, []);

  const renderBookItem = useCallback(
    ({ item }: { item: SavedBook }) => {
      const authorNames = JSON.parse(
        ((item._raw as Record<string, unknown>).author_names as string) || '[]',
      ) as string[];

      // Get page tracking info
      const totalPages = item.totalPages;
      const currentPage = item.currentPage;
      const hasPageTracking = totalPages !== null && totalPages > 0;

      return (
        <TouchableOpacity
          style={styles.bookItem}
          onPress={() => handleBookPress(item)}
          onLongPress={() => handleRemoveBook(item)}
          activeOpacity={0.7}
          accessibilityLabel={`${item.title}, ${authorNames.join(', ')}`}
          accessibilityRole="button"
        >
          <View style={[styles.bookImageContainer, dynamicImageStyles]}>
            {item.coverUrl ? (
              <Image
                source={{ uri: item.coverUrl }}
                style={styles.bookImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📚</Text>
              </View>
            )}
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {authorNames.length > 0 && (
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {authorNames.join(', ')}
              </Text>
            )}
            {item.userRating !== null && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {item.userRating}/5</Text>
              </View>
            )}
            {/* Reading progress - show only in Reading list or if progress exists */}
            {(isReadingList || item.readingProgress > 0) && (
              <TouchableOpacity
                style={styles.progressContainer}
                onPress={() => handleProgressPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${item.readingProgress}%` },
                      ]}
                    />
                    {hasPageTracking && (
                      <Text
                        style={[
                          styles.pageTextInBar,
                          item.readingProgress >= 50 &&
                            styles.pageTextInBarLight,
                        ]}
                      >
                        {currentPage || 0}/{totalPages}
                      </Text>
                    )}
                    {isReadingList && !hasPageTracking && (
                      <Text style={styles.updateProgressTextInBar}>
                        Add progress
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.progressPercent}>
                  {item.readingProgress}%
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveBook(item)}
            accessibilityLabel="Remove from list"
            accessibilityRole="button"
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [
      handleBookPress,
      handleRemoveBook,
      handleProgressPress,
      dynamicImageStyles,
      isReadingList,
    ],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📖</Text>
      <Text style={styles.emptyTitle}>List is empty</Text>
      <Text style={styles.emptyText}>Search to add books to this list.</Text>
    </View>
  );

  if (loading && books.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading books...</Text>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{listName}</Text>
        <Text style={styles.headerCount}>
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Reading Progress Modal */}
      <ReadingProgressModal
        visible={showProgressModal}
        onClose={handleProgressModalClose}
        book={selectedBookForProgress}
        onProgressUpdated={refresh}
        isInitialSetup={false}
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  headerCount: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  pageTextInBar: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  pageTextInBarLight: {
    color: '#fff',
  },
  updateProgressTextInBar: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 36,
    textAlign: 'right',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    alignSelf: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#888',
  },
  separator: {
    height: 12,
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
    paddingHorizontal: 32,
  },
});
