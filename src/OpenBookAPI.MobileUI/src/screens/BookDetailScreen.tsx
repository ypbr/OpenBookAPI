import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookService } from '../api';
import { ErrorView, LoadingIndicator } from '../components';
import { colors, spacing } from '../constants/theme';
import type { BookDetail } from '../types/api';
import type { RootStackScreenProps } from '../types/navigation';

type RouteProps = RootStackScreenProps<'BookDetail'>['route'];

/**
 * Book detail screen - shows full book information
 */
export const BookDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const {workKey} = route.params;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookService.getBookDetail(workKey);
      setBook(result);
    } catch (err) {
      setError('Failed to load book details. Please try again.');
      console.error('Error fetching book details:', err);
    } finally {
      setLoading(false);
    }
  }, [workKey]);

  useEffect(() => {
    fetchBookDetail();
  }, [fetchBookDetail]);

  const handleAuthorPress = useCallback(
    (authorKey: string) => {
      navigation.navigate('AuthorDetail', {authorKey});
    },
    [navigation],
  );

  if (loading) {
    return <LoadingIndicator fullScreen message="Loading book details..." />;
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView message={error || 'Book not found'} onRetry={fetchBookDetail} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        {book.covers && book.covers.length > 0 ? (
          <Image
            source={{uri: book.covers[0]}}
            style={styles.coverImage}
            resizeMode="contain"
            accessibilityLabel={`Cover of ${book.title}`}
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.placeholderEmoji}>📚</Text>
          </View>
        )}

        {/* Title and Subtitle */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {book.title}
          </Text>
          {book.subtitle && (
            <Text variant="titleMedium" style={styles.subtitle}>
              {book.subtitle}
            </Text>
          )}
        </View>

        {/* Authors */}
        {book.authors && book.authors.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Authors
            </Text>
            <View style={styles.authorChips}>
              {book.authors.map(author => (
                <Chip
                  key={author.key}
                  mode="outlined"
                  style={styles.authorChip}
                  onPress={() => handleAuthorPress(author.key)}>
                  {author.name}
                </Chip>
              ))}
            </View>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Description */}
        {book.description && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {book.description}
            </Text>
          </View>
        )}

        {/* Ratings */}
        {book.ratings && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Ratings
            </Text>
            <View style={styles.ratingsContainer}>
              <Text variant="displaySmall" style={styles.ratingValue}>
                {book.ratings.average.toFixed(1)}
              </Text>
              <Text variant="bodyMedium" style={styles.ratingCount}>
                / 5 ({book.ratings.count.toLocaleString()} ratings)
              </Text>
            </View>
          </View>
        )}

        {/* Bookshelves */}
        {book.bookshelves && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Reader Stats
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {book.bookshelves.wantToRead.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Want to Read
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {book.bookshelves.currentlyReading.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Reading
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {book.bookshelves.alreadyRead.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Already Read
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Subjects */}
        {book.subjects && book.subjects.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Subjects
            </Text>
            <View style={styles.subjectChips}>
              {book.subjects.slice(0, 10).map((subject, index) => (
                <Chip key={index} style={styles.subjectChip} compact>
                  {subject}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* First Publish Date */}
        {book.firstPublishDate && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              First Published
            </Text>
            <Text variant="bodyMedium" style={styles.publishDate}>
              {book.firstPublishDate}
            </Text>
          </View>
        )}
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
  coverImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surfaceVariant,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    color: colors.onSurface,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  authorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  authorChip: {
    backgroundColor: colors.primaryContainer,
  },
  divider: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  description: {
    color: colors.onSurface,
    lineHeight: 24,
  },
  ratingsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ratingValue: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  ratingCount: {
    color: colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary,
    fontWeight: '600',
  },
  statLabel: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  subjectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  subjectChip: {
    backgroundColor: colors.surfaceVariant,
  },
  publishDate: {
    color: colors.onSurface,
  },
});
