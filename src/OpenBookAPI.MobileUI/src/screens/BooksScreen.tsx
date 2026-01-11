import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookService } from '../api';
import {
    BookCard,
    EmptyState,
    ErrorView,
    LoadingIndicator,
    SearchInput,
} from '../components';
import { colors, spacing } from '../constants/theme';
import { useDebounce, usePagination } from '../hooks';
import type { BookSummary } from '../types/api';

/**
 * Books screen - search and browse books
 */
export const BooksScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);
  const pagination = usePagination();

  const fetchBooks = useCallback(
    async (query: string, page: number = 1, isRefresh: boolean = false) => {
      if (!query.trim()) {
        setBooks([]);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const result = await bookService.searchBooks({
          query: query.trim(),
          page,
          limit: 20,
        });

        if (page === 1) {
          setBooks(result.books);
        } else {
          setBooks(prev => [...prev, ...result.books]);
        }
        pagination.setTotalResults(result.totalResults);
      } catch (err) {
        setError('Failed to fetch books. Please try again.');
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination],
  );

  useEffect(() => {
    if (debouncedQuery) {
      pagination.reset();
      fetchBooks(debouncedQuery, 1);
    } else {
      setBooks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleBookPress = useCallback(
    (book: BookSummary) => {
      navigation.navigate('BookDetail', {workKey: book.workKey});
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasNextPage) {
      const nextPage = pagination.page + 1;
      pagination.nextPage();
      fetchBooks(debouncedQuery, nextPage);
    }
  }, [loading, pagination, debouncedQuery, fetchBooks]);

  const handleRefresh = useCallback(() => {
    pagination.reset();
    fetchBooks(debouncedQuery, 1, true);
  }, [debouncedQuery, fetchBooks, pagination]);

  const renderBook = useCallback(
    ({item}: {item: BookSummary}) => (
      <BookCard book={item} onPress={handleBookPress} />
    ),
    [handleBookPress],
  );

  const renderFooter = useCallback(() => {
    if (!loading || books.length === 0) return null;
    return <LoadingIndicator size="small" message="Loading more books..." />;
  }, [loading, books.length]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    if (!debouncedQuery) {
      return (
        <EmptyState
          icon="book-search-outline"
          title="Search for Books"
          message="Enter a title, author, or ISBN to start searching"
        />
      );
    }
    return (
      <EmptyState
        icon="book-off-outline"
        title="No Books Found"
        message={`No results for "${debouncedQuery}". Try a different search term.`}
      />
    );
  }, [loading, debouncedQuery]);

  if (error && books.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SearchInput
          placeholder="Search books..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ErrorView
          message={error}
          onRetry={() => fetchBooks(debouncedQuery, 1)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchInput
        placeholder="Search books by title, author, or ISBN..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading && books.length === 0 ? (
        <LoadingIndicator fullScreen message="Searching books..." />
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={item => item.workKey}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

      {pagination.totalResults > 0 && (
        <View style={styles.resultCount}>
          <Text variant="bodySmall" style={styles.resultText}>
            {pagination.totalResults.toLocaleString()} results found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  resultCount: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  resultText: {
    color: colors.onPrimaryContainer,
  },
});
