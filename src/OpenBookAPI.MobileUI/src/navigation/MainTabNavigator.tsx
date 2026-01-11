import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Icon } from 'react-native-paper';
import { colors } from '../constants/theme';
import {
    AuthorsScreen,
    BooksScreen,
    HomeScreen,
    SettingsScreen,
} from '../screens';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main tab navigator with bottom navigation
 */
export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceVariant,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({color, size}) => (
            <Icon source="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Books"
        component={BooksScreen}
        options={{
          title: 'Books',
          headerShown: false,
          tabBarIcon: ({color, size}) => (
            <Icon source="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Authors"
        component={AuthorsScreen}
        options={{
          title: 'Authors',
          headerShown: false,
          tabBarIcon: ({color, size}) => (
            <Icon source="account-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({color, size}) => (
            <Icon source="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
