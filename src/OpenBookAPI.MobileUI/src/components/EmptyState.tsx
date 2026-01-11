import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';
import { colors, spacing } from '../constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Reusable empty state component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={80} color={colors.outline} />
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      {message && (
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      )}
      {onAction && actionLabel && (
        <Button mode="outlined" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.onSurface,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});
