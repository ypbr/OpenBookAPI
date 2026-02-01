import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookService } from '../api';
import {
  BookCard,
  EmptyState,
  ErrorView,
  LoadingIndicator,
  SearchBar,
} from '../components';
import { useResponsive } from '../hooks/useResponsive';
import { BookSearchResult, BookSummary } from '../types/api.types';

interface BooksScreenProps {
  navigation: any;
}

export const BooksScreen: React.FC<BooksScreenProps> = ({ navigation }) => {
  const { bookColumns, bookCardWidth } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleSearch = useCallback(
    async (resetPage = true) => {
      if (!searchQuery.trim()) {
        return;
      }

      const currentPage = resetPage ? 1 : page;

      try {
        setLoading(true);
        setError(null);

        if (resetPage) {
          setPage(1);
        }

        const results = await bookService.search({
          query: searchQuery.trim(),
          page: currentPage,
          limit: 20,
        });

        if (resetPage) {
          setSearchResults(results);
        } else {
          setSearchResults(prev => ({
            ...results,
            books: [...(prev?.books || []), ...results.books],
          }));
        }
      } catch (err: any) {
        setError(err.detail || err.message || 'Failed to search books');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, page],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    handleSearch(true);
  }, [handleSearch]);

  const handleLoadMore = useCallback(() => {
    if (loading || !searchResults?.hasNextPage) {
      return;
    }
    setPage(prev => prev + 1);
    handleSearch(false);
  }, [loading, searchResults, handleSearch]);

  const handleBookPress = useCallback(
    (book: BookSummary) => {
      navigation.navigate('BookDetail', {
        workKey: book.key,
        title: book.title,
      });
    },
    [navigation],
  );

  const renderBook = useCallback(
    ({ item }: { item: BookSummary }) => (
      <BookCard
        book={item}
        onPress={handleBookPress}
        cardWidth={bookCardWidth}
      />
    ),
    [handleBookPress, bookCardWidth],
  );

  const renderFooter = useCallback(() => {
    if (!loading || !searchResults) {
      return null;
    }
    return <LoadingIndicator size="small" message="" />;
  }, [loading, searchResults]);

  const renderContent = () => {
    if (loading && !searchResults) {
      return <LoadingIndicator message="Searching books..." />;
    }

    if (error) {
      return <ErrorView message={error} onRetry={() => handleSearch(true)} />;
    }

    if (!searchResults) {
      return (
        <EmptyState
          title="Search for Books"
          message="Enter a search term to find books from Open Library"
          icon="📚"
        />
      );
    }

    if (searchResults.books.length === 0) {
      return (
        <EmptyState
          title="No Results Found"
          message={`No books found for "${searchQuery}"`}
          icon="📭"
        />
      );
    }

    return (
      <FlatList
        data={searchResults.books}
        renderItem={renderBook}
        keyExtractor={(item, index) => `${item.key}-${index}`}
        key={`books-grid-${bookColumns}`}
        numColumns={bookColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={() => handleSearch(true)}
        placeholder="Search books..."
      />
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});
