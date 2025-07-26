import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StorageService } from './src/services/StorageService';

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1',
    primaryContainer: '#e0e7ff',
    secondary: '#64748b',
    background: '#f8fafc',
    surface: '#ffffff',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818cf8',
    primaryContainer: '#4f46e5',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
  },
};

export default function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settings = await StorageService.getSettings();
      setIsDarkTheme(settings.theme === 'dark');
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={isDarkTheme ? darkTheme : lightTheme}>
        <StatusBar style={isDarkTheme ? "light" : "dark"} />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
