import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';
import { colors, spacing } from '../constants/theme';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Reusable error view component
 */
export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <View style={styles.container}>
      <Icon source="alert-circle-outline" size={64} color={colors.error} />
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          {retryLabel}
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
