import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_CONFIG } from '../constants/config';

export const SettingsScreen: React.FC = () => {
  const handleOpenLibrary = () => {
    Linking.openURL('https://openlibrary.org');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>App Name</Text>
            <Text style={styles.value}>{APP_CONFIG.NAME}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>{APP_CONFIG.VERSION}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Source</Text>
          <TouchableOpacity style={styles.linkRow} onPress={handleOpenLibrary}>
            <Text style={styles.linkText}>Open Library</Text>
            <Text style={styles.linkIcon}>↗</Text>
          </TouchableOpacity>
          <Text style={styles.description}>
            This app uses data from Open Library, a free and open source project
            by the Internet Archive.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingValue}>Coming Soon</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingValue}>Coming Soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
  },
  linkIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  settingValue: {
    fontSize: 14,
    color: '#999',
  },
});
