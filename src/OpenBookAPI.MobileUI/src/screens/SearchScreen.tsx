import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authorService, bookService } from '../api';
import {
    AuthorCard,
    BookCard,
    EmptyState,
    ErrorView,
    LoadingIndicator,
    SearchInput,
} from '../components';
import { colors, spacing } from '../constants/theme';
import { useDebounce, usePagination } from '../hooks';
import type { AuthorSummary, BookSummary } from '../types/api';
import type { RootStackScreenProps } from '../types/navigation';

type RouteProps = RootStackScreenProps<'Search'>['route'];

type SearchType = 'books' | 'authors';

/**
 * Search screen - unified search for books and authors
 */
export const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const initialQuery = route.params?.query || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>('books');
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [authors, setAuthors] = useState<AuthorSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);
  const pagination = usePagination();

  const fetchResults = useCallback(
    async (
      query: string,
      type: SearchType,
      page: number = 1,
      isRefresh: boolean = false,
    ) => {
      if (!query.trim()) {
        setBooks([]);
        setAuthors([]);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        if (type === 'books') {
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
        } else {
          const result = await authorService.searchAuthors({
            query: query.trim(),
            page,
            limit: 20,
          });

          if (page === 1) {
            setAuthors(result.authors);
          } else {
            setAuthors(prev => [...prev, ...result.authors]);
          }
          pagination.setTotalResults(result.totalResults);
        }
      } catch (err) {
        setError(`Failed to search ${type}. Please try again.`);
        console.error('Error searching:', err);
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
      fetchResults(debouncedQuery, searchType, 1);
    } else {
      setBooks([]);
      setAuthors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, searchType]);

  const handleBookPress = useCallback(
    (book: BookSummary) => {
      navigation.navigate('BookDetail', {workKey: book.workKey});
    },
    [navigation],
  );

  const handleAuthorPress = useCallback(
    (author: AuthorSummary) => {
      navigation.navigate('AuthorDetail', {authorKey: author.authorKey});
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasNextPage) {
      const nextPage = pagination.page + 1;
      pagination.nextPage();
      fetchResults(debouncedQuery, searchType, nextPage);
    }
  }, [loading, pagination, debouncedQuery, searchType, fetchResults]);

  const handleRefresh = useCallback(() => {
    pagination.reset();
    fetchResults(debouncedQuery, searchType, 1, true);
  }, [debouncedQuery, searchType, fetchResults, pagination]);

  const handleTypeChange = useCallback((value: string) => {
    setSearchType(value as SearchType);
    setBooks([]);
    setAuthors([]);
  }, []);

  const renderBook = useCallback(
    ({item}: {item: BookSummary}) => (
      <BookCard book={item} onPress={handleBookPress} />
    ),
    [handleBookPress],
  );

  const renderAuthor = useCallback(
    ({item}: {item: AuthorSummary}) => (
      <AuthorCard author={item} onPress={handleAuthorPress} />
    ),
    [handleAuthorPress],
  );

  const renderFooter = useCallback(() => {
    if (!loading || (books.length === 0 && authors.length === 0)) return null;
    return <LoadingIndicator size="small" message="Loading more..." />;
  }, [loading, books.length, authors.length]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    if (!debouncedQuery) {
      return (
        <EmptyState
          icon="magnify"
          title="Search OpenBook"
          message="Enter a search term to find books or authors"
        />
      );
    }
    return (
      <EmptyState
        icon={searchType === 'books' ? 'book-off-outline' : 'account-off-outline'}
        title="No Results Found"
        message={`No ${searchType} found for "${debouncedQuery}". Try a different search term.`}
      />
    );
  }, [loading, debouncedQuery, searchType]);

  const data = searchType === 'books' ? books : authors;
  const renderItem = searchType === 'books' ? renderBook : renderAuthor;
  const keyExtractor = (item: BookSummary | AuthorSummary) =>
    'workKey' in item ? item.workKey : item.authorKey;

  if (error && data.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SearchInput
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        <ErrorView
          message={error}
          onRetry={() => fetchResults(debouncedQuery, searchType, 1)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchInput
        placeholder="Search books, authors..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus={!initialQuery}
      />

      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={searchType}
          onValueChange={handleTypeChange}
          buttons={[
            {value: 'books', label: 'Books', icon: 'book-outline'},
            {value: 'authors', label: 'Authors', icon: 'account-outline'},
          ]}
          style={styles.segmentButtons}
        />
      </View>

      {loading && data.length === 0 ? (
        <LoadingIndicator fullScreen message={`Searching ${searchType}...`} />
      ) : (
        <FlatList
          data={data as (BookSummary | AuthorSummary)[]}
          renderItem={renderItem as any}
          keyExtractor={keyExtractor}
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
            {pagination.totalResults.toLocaleString()} results
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
  segmentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  segmentButtons: {
    backgroundColor: colors.surfaceVariant,
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
