import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authorService, bookService } from '../api';
import {
  AuthorCard,
  BookCard,
  EmptyState,
  ErrorView,
  LoadingIndicator,
  SearchBar,
} from '../components';
import { useResponsive } from '../hooks/useResponsive';
import {
  AuthorSearchResult,
  AuthorSummary,
  BookSearchResult,
  BookSummary,
} from '../types/api.types';

type TabType = 'books' | 'authors';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { bookColumns, bookCardWidth, authorColumns, authorCardWidth } =
    useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('books');

  // Books state
  const [bookResults, setBookResults] = useState<BookSearchResult | null>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookPage, setBookPage] = useState(1);

  // Authors state
  const [authorResults, setAuthorResults] = useState<AuthorSearchResult | null>(
    null,
  );
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [authorPage, setAuthorPage] = useState(1);

  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBooks = useCallback(
    async (resetPage = true) => {
      if (!searchQuery.trim()) {
        return;
      }

      const currentPage = resetPage ? 1 : bookPage;

      try {
        setBookLoading(true);
        setBookError(null);

        if (resetPage) {
          setBookPage(1);
        }

        const results = await bookService.search({
          query: searchQuery.trim(),
          page: currentPage,
          limit: 20,
        });

        if (resetPage) {
          setBookResults(results);
        } else {
          setBookResults(prev => ({
            ...results,
            books: [...(prev?.books || []), ...results.books],
          }));
        }
      } catch (err: any) {
        setBookError(err.detail || err.message || 'Failed to search books');
      } finally {
        setBookLoading(false);
      }
    },
    [searchQuery, bookPage],
  );

  const searchAuthors = useCallback(
    async (resetPage = true) => {
      if (!searchQuery.trim()) {
        return;
      }

      const currentPage = resetPage ? 1 : authorPage;

      try {
        setAuthorLoading(true);
        setAuthorError(null);

        if (resetPage) {
          setAuthorPage(1);
        }

        const results = await authorService.search({
          query: searchQuery.trim(),
          page: currentPage,
          limit: 20,
        });

        if (resetPage) {
          setAuthorResults(results);
        } else {
          setAuthorResults(prev => ({
            ...results,
            authors: [...(prev?.authors || []), ...results.authors],
          }));
        }
      } catch (err: any) {
        setAuthorError(err.detail || err.message || 'Failed to search authors');
      } finally {
        setAuthorLoading(false);
      }
    },
    [searchQuery, authorPage],
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setHasSearched(true);
    // Search both books and authors in parallel
    await Promise.all([searchBooks(true), searchAuthors(true)]);
    setRefreshing(false);
  }, [searchQuery, searchBooks, searchAuthors]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'books') {
      searchBooks(true).finally(() => setRefreshing(false));
    } else {
      searchAuthors(true).finally(() => setRefreshing(false));
    }
  }, [activeTab, searchBooks, searchAuthors]);

  const handleLoadMoreBooks = useCallback(() => {
    if (bookLoading || !bookResults?.hasNextPage) {
      return;
    }
    setBookPage(prev => prev + 1);
    searchBooks(false);
  }, [bookLoading, bookResults, searchBooks]);

  const handleLoadMoreAuthors = useCallback(() => {
    if (authorLoading || !authorResults?.hasNextPage) {
      return;
    }
    setAuthorPage(prev => prev + 1);
    searchAuthors(false);
  }, [authorLoading, authorResults, searchAuthors]);

  const handleBookPress = useCallback(
    (book: BookSummary) => {
      navigation.navigate('BookDetail', {
        workKey: book.key,
        title: book.title,
      });
    },
    [navigation],
  );

  const handleAuthorPress = useCallback(
    (author: AuthorSummary) => {
      navigation.navigate('AuthorDetail', {
        authorKey: author.key,
        name: author.name,
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

  const renderAuthor = useCallback(
    ({ item }: { item: AuthorSummary }) => (
      <AuthorCard
        author={item}
        onPress={handleAuthorPress}
        cardWidth={authorCardWidth}
      />
    ),
    [handleAuthorPress, authorCardWidth],
  );

  const renderBookFooter = useCallback(() => {
    if (!bookLoading || !bookResults) {
      return null;
    }
    return <LoadingIndicator size="small" message="" />;
  }, [bookLoading, bookResults]);

  const renderAuthorFooter = useCallback(() => {
    if (!authorLoading || !authorResults) {
      return null;
    }
    return <LoadingIndicator size="small" message="" />;
  }, [authorLoading, authorResults]);

  const renderTabs = () => {
    const bookCount = bookResults?.totalResults ?? 0;
    const authorCount = authorResults?.totalResults ?? 0;

    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'books' && styles.activeTab]}
          onPress={() => setActiveTab('books')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'books' }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'books' && styles.activeTabText,
            ]}
          >
            📚 Books {hasSearched && `(${bookCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'authors' && styles.activeTab]}
          onPress={() => setActiveTab('authors')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'authors' }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'authors' && styles.activeTabText,
            ]}
          >
            👤 Authors {hasSearched && `(${authorCount})`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBooksContent = () => {
    if (bookLoading && !bookResults) {
      return <LoadingIndicator message="Searching books..." />;
    }

    if (bookError) {
      return (
        <ErrorView message={bookError} onRetry={() => searchBooks(true)} />
      );
    }

    if (!bookResults) {
      return (
        <EmptyState
          title="Search Books"
          message="Search to find books"
          icon="📚"
        />
      );
    }

    if (bookResults.books.length === 0) {
      return (
        <EmptyState
          title="No Results"
          message={`No books found for "${searchQuery}"`}
          icon="📭"
        />
      );
    }

    return (
      <FlatList
        data={bookResults.books}
        renderItem={renderBook}
        keyExtractor={(item, index) => `book-${item.key}-${index}`}
        key={`books-grid-${bookColumns}`}
        numColumns={bookColumns}
        columnWrapperStyle={bookColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMoreBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderBookFooter}
      />
    );
  };

  const renderAuthorsContent = () => {
    if (authorLoading && !authorResults) {
      return <LoadingIndicator message="Searching authors..." />;
    }

    if (authorError) {
      return (
        <ErrorView message={authorError} onRetry={() => searchAuthors(true)} />
      );
    }

    if (!authorResults) {
      return (
        <EmptyState
          title="Search Authors"
          message="Search to find authors"
          icon="👤"
        />
      );
    }

    if (authorResults.authors.length === 0) {
      return (
        <EmptyState
          title="No Results"
          message={`No authors found for "${searchQuery}"`}
          icon="📭"
        />
      );
    }

    return (
      <FlatList
        data={authorResults.authors}
        renderItem={renderAuthor}
        keyExtractor={(item, index) => `author-${item.key}-${index}`}
        key={`authors-grid-${authorColumns}`}
        numColumns={authorColumns}
        columnWrapperStyle={authorColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMoreAuthors}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderAuthorFooter}
      />
    );
  };

  const renderContent = () => {
    if (!hasSearched) {
      return (
        <EmptyState
          title="Search Books & Authors"
          message="Search to find books and authors from Open Library"
          icon="🔍"
        />
      );
    }

    return activeTab === 'books'
      ? renderBooksContent()
      : renderAuthorsContent();
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Search books or authors..."
      />
      {hasSearched && renderTabs()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
