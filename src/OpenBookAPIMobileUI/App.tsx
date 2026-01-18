/**
 * OpenBook Mobile App
 * A mobile client for the OpenBookAPI
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDefaultLists } from './src/database/seed';
import { AppNavigator } from './src/navigation';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await initializeDefaultLists();
        setIsDbReady(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setDbError('Failed to initialize database');
      }
    };

    initDatabase();
  }, []);

  // Show loading while database initializes
  if (!isDbReady && !dbError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error if database failed
  if (dbError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{dbError}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#007AFF"
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default App;
