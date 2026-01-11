import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { borderRadius, colors, shadows, spacing } from '../constants/theme';
import { BookSummary } from '../types/api';

interface BookCardProps {
  book: BookSummary;
  onPress: (book: BookSummary) => void;
}

/**
 * Card component for displaying book summary
 */
export const BookCard: React.FC<BookCardProps> = ({book, onPress}) => {
  const handlePress = () => {
    onPress(book);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${book.title}`}>
      <Card style={styles.card}>
        <View style={styles.content}>
          {book.coverUrl ? (
            <Image
              source={{uri: book.coverUrl}}
              style={styles.cover}
              resizeMode="cover"
              accessibilityLabel={`Cover of ${book.title}`}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text variant="titleLarge" style={styles.placeholderText}>
                📚
              </Text>
            </View>
          )}
          <View style={styles.details}>
            <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
              {book.title}
            </Text>
            {book.authorName && book.authorName.length > 0 && (
              <Text variant="bodyMedium" style={styles.author} numberOfLines={1}>
                {book.authorName.join(', ')}
              </Text>
            )}
            {book.firstPublishYear && (
              <Text variant="bodySmall" style={styles.year}>
                First published: {book.firstPublishYear}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.editions}>
              {book.editionCount} edition{book.editionCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
  },
  coverPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  author: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  year: {
    color: colors.outline,
    marginTop: spacing.xs,
  },
  editions: {
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
