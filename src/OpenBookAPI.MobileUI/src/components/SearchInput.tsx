import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { borderRadius, colors, spacing } from '../constants/theme';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
}

/**
 * Reusable search input component
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSubmit,
  autoFocus = false,
}) => {
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        onSubmitEditing={handleSubmit}
        autoFocus={autoFocus}
        style={styles.searchbar}
        inputStyle={styles.input}
        accessibilityLabel="Search input"
        accessibilityHint={`Enter text to ${placeholder.toLowerCase()}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  searchbar: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceVariant,
    elevation: 0,
  },
  input: {
    color: colors.onSurface,
  },
});
