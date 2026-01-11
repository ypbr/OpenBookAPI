import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';
import { borderRadius, colors, shadows, spacing } from '../constants/theme';
import { AuthorSummary } from '../types/api';
import { getInitials } from '../utils/formatters';

interface AuthorCardProps {
  author: AuthorSummary;
  onPress: (author: AuthorSummary) => void;
}

/**
 * Card component for displaying author summary
 */
export const AuthorCard: React.FC<AuthorCardProps> = ({author, onPress}) => {
  const handlePress = () => {
    onPress(author);
  };

  const initials = getInitials(author.name);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${author.name}`}>
      <Card style={styles.card}>
        <View style={styles.content}>
          {author.photoUrl ? (
            <Image
              source={{uri: author.photoUrl}}
              style={styles.photo}
              resizeMode="cover"
              accessibilityLabel={`Photo of ${author.name}`}
            />
          ) : (
            <Avatar.Text
              size={80}
              label={initials}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
          )}
          <View style={styles.details}>
            <Text variant="titleMedium" style={styles.name} numberOfLines={2}>
              {author.name}
            </Text>
            {author.birthDate && (
              <Text variant="bodySmall" style={styles.birthDate}>
                Born: {author.birthDate}
              </Text>
            )}
            {author.topWork && (
              <Text variant="bodyMedium" style={styles.topWork} numberOfLines={1}>
                Known for: {author.topWork}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.workCount}>
              {author.workCount} work{author.workCount !== 1 ? 's' : ''}
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
  photo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
  },
  avatar: {
    backgroundColor: colors.primaryContainer,
  },
  avatarLabel: {
    color: colors.onPrimaryContainer,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  name: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  birthDate: {
    color: colors.outline,
    marginTop: spacing.xs,
  },
  topWork: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  workCount: {
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
