import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  AuthorDetailScreen,
  AuthorsScreen,
  BookDetailScreen,
  BooksScreen,
  HomeScreen,
  SettingsScreen,
} from '../screens';
import {
  AuthorsStackParamList,
  BooksStackParamList,
  HomeStackParamList,
  RootTabParamList,
  SettingsStackParamList,
} from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BooksStack = createNativeStackNavigator<BooksStackParamList>();
const AuthorsStack = createNativeStackNavigator<AuthorsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#007AFF',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '600' as const,
  },
  headerBackTitleVisible: false,
};

// Tab Icons Component
const TabIcon: React.FC<{ icon: string; focused: boolean }> = ({
  icon,
  focused,
}) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
);

// Home Stack Navigator
const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={screenOptions}>
    <HomeStack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ title: 'Read Land' }}
    />
    <HomeStack.Screen
      name="BookDetail"
      component={BookDetailScreen}
      options={({ route }) => ({
        title: route.params.title || 'Book Details',
      })}
    />
  </HomeStack.Navigator>
);

// Books Stack Navigator
const BooksStackNavigator: React.FC = () => (
  <BooksStack.Navigator screenOptions={screenOptions}>
    <BooksStack.Screen
      name="BooksMain"
      component={BooksScreen}
      options={{ title: 'Books' }}
    />
    <BooksStack.Screen
      name="BookDetail"
      component={BookDetailScreen}
      options={({ route }) => ({
        title: route.params.title || 'Book Details',
      })}
    />
  </BooksStack.Navigator>
);

// Authors Stack Navigator
const AuthorsStackNavigator: React.FC = () => (
  <AuthorsStack.Navigator screenOptions={screenOptions}>
    <AuthorsStack.Screen
      name="AuthorsMain"
      component={AuthorsScreen}
      options={{ title: 'Authors' }}
    />
    <AuthorsStack.Screen
      name="AuthorDetail"
      component={AuthorDetailScreen}
      options={({ route }) => ({
        title: route.params.name || 'Author Details',
      })}
    />
    <AuthorsStack.Screen
      name="BookDetail"
      component={BookDetailScreen}
      options={({ route }) => ({
        title: route.params.title || 'Book Details',
      })}
    />
  </AuthorsStack.Navigator>
);

// Settings Stack Navigator
const SettingsStackNavigator: React.FC = () => (
  <SettingsStack.Navigator screenOptions={screenOptions}>
    <SettingsStack.Screen
      name="SettingsMain"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </SettingsStack.Navigator>
);

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏠" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="BooksTab"
          component={BooksStackNavigator}
          options={{
            tabBarLabel: 'Books',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📚" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="AuthorsTab"
          component={AuthorsStackNavigator}
          options={{
            tabBarLabel: 'Authors',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="✍️" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStackNavigator}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="⚙️" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
