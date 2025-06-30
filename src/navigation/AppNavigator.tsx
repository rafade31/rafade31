import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import ChatScreen from '../screens/ChatScreen';
import ImageGeneratorScreen from '../screens/ImageGeneratorScreen';
import NotesScreen from '../screens/NotesScreen';
import PlaygroundScreen from '../screens/PlaygroundScreen';
import WebViewScreen from '../screens/WebViewScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CharacterScreen from '../screens/CharacterScreen';
import ProvidersScreen from '../screens/ProvidersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Settings Stack Navigator
const SettingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      <Stack.Screen 
        name="Providers" 
        component={ProvidersScreen} 
        options={{ 
          title: 'AI Providers',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
    </Stack.Navigator>
  );
};

// Tools Stack Navigator (includes Playground and Web)
const ToolsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ToolsMain" 
        component={PlaygroundScreen} 
        options={{ 
          title: 'Playground',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      <Stack.Screen 
        name="WebView" 
        component={WebViewScreen} 
        options={{ 
          title: 'Web Browser',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Chat':
              iconName = 'chat';
              break;
            case 'Characters':
              iconName = 'person';
              break;
            case 'Images':
              iconName = 'image';
              break;
            case 'Notes':
              iconName = 'note';
              break;
            case 'Tools':
              iconName = 'build';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Characters" component={CharacterScreen} />
      <Tab.Screen name="Images" component={ImageGeneratorScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Tools" component={ToolsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
