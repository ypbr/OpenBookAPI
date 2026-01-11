import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authorService } from '../api';
import {
    AuthorCard,
    EmptyState,
    ErrorView,
    LoadingIndicator,
    SearchInput,
} from '../components';
import { colors, spacing } from '../constants/theme';
import { useDebounce, usePagination } from '../hooks';
import type { AuthorSummary } from '../types/api';

/**
 * Authors screen - search and browse authors
 */
export const AuthorsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [authors, setAuthors] = useState<AuthorSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);
  const pagination = usePagination();

  const fetchAuthors = useCallback(
    async (query: string, page: number = 1, isRefresh: boolean = false) => {
      if (!query.trim()) {
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
      } catch (err) {
        setError('Failed to fetch authors. Please try again.');
        console.error('Error fetching authors:', err);
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
      fetchAuthors(debouncedQuery, 1);
    } else {
      setAuthors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

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
      fetchAuthors(debouncedQuery, nextPage);
    }
  }, [loading, pagination, debouncedQuery, fetchAuthors]);

  const handleRefresh = useCallback(() => {
    pagination.reset();
    fetchAuthors(debouncedQuery, 1, true);
  }, [debouncedQuery, fetchAuthors, pagination]);

  const renderAuthor = useCallback(
    ({item}: {item: AuthorSummary}) => (
      <AuthorCard author={item} onPress={handleAuthorPress} />
    ),
    [handleAuthorPress],
  );

  const renderFooter = useCallback(() => {
    if (!loading || authors.length === 0) return null;
    return <LoadingIndicator size="small" message="Loading more authors..." />;
  }, [loading, authors.length]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    if (!debouncedQuery) {
      return (
        <EmptyState
          icon="account-search-outline"
          title="Search for Authors"
          message="Enter an author's name to start searching"
        />
      );
    }
    return (
      <EmptyState
        icon="account-off-outline"
        title="No Authors Found"
        message={`No results for "${debouncedQuery}". Try a different search term.`}
      />
    );
  }, [loading, debouncedQuery]);

  if (error && authors.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SearchInput
          placeholder="Search authors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ErrorView
          message={error}
          onRetry={() => fetchAuthors(debouncedQuery, 1)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchInput
        placeholder="Search authors by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading && authors.length === 0 ? (
        <LoadingIndicator fullScreen message="Searching authors..." />
      ) : (
        <FlatList
          data={authors}
          renderItem={renderAuthor}
          keyExtractor={item => item.authorKey}
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
