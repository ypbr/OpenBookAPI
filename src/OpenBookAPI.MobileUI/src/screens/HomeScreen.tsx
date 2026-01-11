import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchInput } from '../components';
import { colors, spacing } from '../constants/theme';

/**
 * Home screen - main landing page of the app
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', {query: searchQuery.trim()});
    }
  }, [navigation, searchQuery]);

  const handleBrowseBooks = useCallback(() => {
    navigation.navigate('Main', {screen: 'Books'});
  }, [navigation]);

  const handleBrowseAuthors = useCallback(() => {
    navigation.navigate('Main', {screen: 'Authors'});
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            📚 OpenBook
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Discover millions of books and authors
          </Text>
        </View>

        {/* Search */}
        <SearchInput
          placeholder="Search books, authors, ISBN..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
        />

        {/* Quick Actions */}
        <View style={styles.actions}>
          <Card style={styles.actionCard} onPress={handleBrowseBooks}>
            <Card.Content style={styles.actionContent}>
              <Text variant="headlineLarge" style={styles.actionIcon}>
                📖
              </Text>
              <Text variant="titleMedium" style={styles.actionTitle}>
                Browse Books
              </Text>
              <Text variant="bodySmall" style={styles.actionDescription}>
                Search and explore books from OpenLibrary
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={handleBrowseAuthors}>
            <Card.Content style={styles.actionContent}>
              <Text variant="headlineLarge" style={styles.actionIcon}>
                ✍️
              </Text>
              <Text variant="titleMedium" style={styles.actionTitle}>
                Find Authors
              </Text>
              <Text variant="bodySmall" style={styles.actionDescription}>
                Discover authors and their works
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Featured Section */}
        <View style={styles.featured}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Popular Searches
          </Text>
          <View style={styles.chips}>
            {['Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'History'].map(
              genre => (
                <Button
                  key={genre}
                  mode="outlined"
                  compact
                  style={styles.chip}
                  onPress={() =>
                    navigation.navigate('Search', {query: genre})
                  }>
                  {genre}
                </Button>
              ),
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  actionContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    color: colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionDescription: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  featured: {
    padding: spacing.xl,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    marginBottom: spacing.xs,
  },
});
