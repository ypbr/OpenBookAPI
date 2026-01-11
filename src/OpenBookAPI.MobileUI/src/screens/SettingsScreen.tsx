import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Switch, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

/**
 * Settings screen - app configuration and preferences
 */
export const SettingsScreen: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Appearance
          </Text>
          <List.Item
            title="Dark Mode"
            description="Switch between light and dark themes"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch value={darkMode} onValueChange={setDarkMode} />
            )}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Notifications
          </Text>
          <List.Item
            title="Push Notifications"
            description="Receive updates about new features"
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch value={notifications} onValueChange={setNotifications} />
            )}
          />
        </View>

        <Divider style={styles.divider} />

        {/* About Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            About
          </Text>
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information-outline" />}
          />
          <List.Item
            title="Data Source"
            description="OpenLibrary.org"
            left={props => <List.Icon {...props} icon="database-outline" />}
          />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-lock-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Support Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Support
          </Text>
          <List.Item
            title="Report a Bug"
            left={props => <List.Icon {...props} icon="bug-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Send Feedback"
            left={props => <List.Icon {...props} icon="message-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Rate the App"
            left={props => <List.Icon {...props} icon="star-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
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
    padding: spacing.lg,
  },
  title: {
    color: colors.onSurface,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
});
