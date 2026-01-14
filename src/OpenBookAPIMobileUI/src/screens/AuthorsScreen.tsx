import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { authorService } from '../api';
import {
  AuthorCard,
  EmptyState,
  ErrorView,
  LoadingIndicator,
  SearchBar,
} from '../components';
import { AuthorSearchResult, AuthorSummary } from '../types/api.types';

interface AuthorsScreenProps {
  navigation: any;
}

export const AuthorsScreen: React.FC<AuthorsScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AuthorSearchResult | null>(
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

        const results = await authorService.search({
          query: searchQuery.trim(),
          page: currentPage,
          limit: 20,
        });

        if (resetPage) {
          setSearchResults(results);
        } else {
          setSearchResults(prev => ({
            ...results,
            authors: [...(prev?.authors || []), ...results.authors],
          }));
        }
      } catch (err: any) {
        setError(err.detail || err.message || 'Failed to search authors');
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

  const handleAuthorPress = useCallback(
    (author: AuthorSummary) => {
      navigation.navigate('AuthorDetail', {
        authorKey: author.authorKey,
        name: author.name,
      });
    },
    [navigation],
  );

  const renderAuthor = useCallback(
    ({ item }: { item: AuthorSummary }) => (
      <AuthorCard author={item} onPress={handleAuthorPress} />
    ),
    [handleAuthorPress],
  );

  const renderFooter = useCallback(() => {
    if (!loading || !searchResults) {
      return null;
    }
    return <LoadingIndicator size="small" message="" />;
  }, [loading, searchResults]);

  const renderContent = () => {
    if (loading && !searchResults) {
      return <LoadingIndicator message="Searching authors..." />;
    }

    if (error) {
      return <ErrorView message={error} onRetry={() => handleSearch(true)} />;
    }

    if (!searchResults) {
      return (
        <EmptyState
          title="Search for Authors"
          message="Enter a search term to find authors from Open Library"
          icon="✍️"
        />
      );
    }

    if (searchResults.authors.length === 0) {
      return (
        <EmptyState
          title="No Results Found"
          message={`No authors found for "${searchQuery}"`}
          icon="📭"
        />
      );
    }

    return (
      <FlatList
        data={searchResults.authors}
        renderItem={renderAuthor}
        keyExtractor={(item, index) => `${item.authorKey}-${index}`}
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
        placeholder="Search authors..."
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
});
