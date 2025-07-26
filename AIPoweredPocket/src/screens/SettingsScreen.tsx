import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, Divider, List } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { StorageService, Settings } from '../services/StorageService';
import { AIService } from '../services/AIService';

const SettingsScreen = () => {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    selectedModel: 'gemini-pro',
    theme: 'light',
  });
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    setAvailableModels(AIService.getAvailableModels());
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await StorageService.getSettings();
      setSettings(loadedSettings);
      setTempApiKey(loadedSettings.apiKey);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (updatedSettings: Settings) => {
    try {
      await StorageService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleApiKeyUpdate = () => {
    if (!tempApiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key.');
      return;
    }

    if (!AIService.validateApiKey(tempApiKey.trim())) {
      Alert.alert(
        'Invalid API Key',
        'The API key format appears to be invalid. Google AI API keys should start with "AIza" and be at least 20 characters long.'
      );
      return;
    }

    const updatedSettings = { ...settings, apiKey: tempApiKey.trim() };
    saveSettings(updatedSettings);
  };

  const handleModelChange = (model: string) => {
    const updatedSettings = { ...settings, selectedModel: model };
    saveSettings(updatedSettings);
  };

  const handleThemeToggle = () => {
    const newTheme: "light" | "dark" = settings.theme === "light" ? "dark" : "light";
    const updatedSettings = { ...settings, theme: newTheme };
    saveSettings(updatedSettings);
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      const exportData = await StorageService.exportAllData();
      const fileName = `aipoweredpocket-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, exportData);
      
      Alert.alert(
        'Export Successful',
        `Your data has been exported to: ${fileName}\n\nThe file is saved in your app's documents folder.`,
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    try {
      Alert.alert(
        'Import Data',
        'This will replace all your current data (chats, notes, images, settings). Are you sure you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                
                const result = await DocumentPicker.getDocumentAsync({
                  type: 'application/json',
                  copyToCacheDirectory: true,
                });

                if (result.canceled) {
                  setIsLoading(false);
                  return;
                }

                const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
                await StorageService.importAllData(fileContent);
                await loadSettings();
                
                Alert.alert('Success', 'Data imported successfully!');
              } catch (error) {
                console.error('Import error:', error);
                Alert.alert('Error', 'Failed to import data. Please check the file format and try again.');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Import setup error:', error);
      Alert.alert('Error', 'Failed to open file picker. Please try again.');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data including chats, notes, images, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadSettings(); // Reload default settings
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Clear data error:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your AI companion</Text>
      </View>

      {/* AI Configuration */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="smart-toy" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>AI Configuration</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Google AI API Key:</Text>
            <View style={styles.apiKeyContainer}>
              <TextInput
                style={styles.apiKeyInput}
                value={isApiKeyVisible ? tempApiKey : maskApiKey(tempApiKey)}
                onChangeText={setTempApiKey}
                placeholder="Enter your Google AI API key..."
                secureTextEntry={!isApiKeyVisible}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setIsApiKeyVisible(!isApiKeyVisible)}
                style={styles.visibilityButton}
              >
                <MaterialIcons 
                  name={isApiKeyVisible ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
            <Button
              mode="contained"
              onPress={handleApiKeyUpdate}
              style={styles.updateButton}
              disabled={tempApiKey.trim() === settings.apiKey}
            >
              Update API Key
            </Button>
            <Text style={styles.helpText}>
              Get your API key from Google AI Studio (makersuite.google.com)
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Selected Model:</Text>
            {availableModels.map((model) => (
              <TouchableOpacity
                key={model}
                style={[
                  styles.modelOption,
                  settings.selectedModel === model && styles.modelOptionSelected
                ]}
                onPress={() => handleModelChange(model)}
              >
                <View style={styles.modelOptionContent}>
                  <Text style={[
                    styles.modelOptionText,
                    settings.selectedModel === model && styles.modelOptionTextSelected
                  ]}>
                    {model}
                  </Text>
                  {settings.selectedModel === model && (
                    <MaterialIcons name="check" size={20} color="#6366f1" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Appearance */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="palette" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Use dark theme for better viewing in low light
                </Text>
              </View>
              <Switch
                value={settings.theme === 'dark'}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#f3f4f6', true: '#6366f1' }}
                thumbColor={settings.theme === 'dark' ? '#fff' : '#f9fafb'}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="storage" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>

          <List.Item
            title="Export Data"
            description="Save all your data to a backup file"
            left={props => <List.Icon {...props} icon="download" color="#22c55e" />}
            onPress={handleExportData}
            disabled={isLoading}
          />

          <List.Item
            title="Import Data"
            description="Restore data from a backup file"
            left={props => <List.Icon {...props} icon="upload" color="#3b82f6" />}
            onPress={handleImportData}
            disabled={isLoading}
          />

          <List.Item
            title="Clear All Data"
            description="Permanently delete all data"
            left={props => <List.Icon {...props} icon="delete" color="#ef4444" />}
            onPress={handleClearAllData}
            disabled={isLoading}
          />
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.appInfo}>
            <Text style={styles.appName}>AIPoweredPocket</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Your secure, private AI companion for chatting, image generation, note-taking, and more.
            </Text>
          </View>

          <View style={styles.privacyInfo}>
            <MaterialIcons name="security" size={20} color="#22c55e" />
            <Text style={styles.privacyText}>
              All data is stored locally on your device. Your privacy is protected.
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  apiKeyInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  visibilityButton: {
    padding: 12,
  },
  updateButton: {
    marginTop: 8,
    backgroundColor: '#6366f1',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 16,
  },
  modelOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  modelOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f9ff',
  },
  modelOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  modelOptionTextSelected: {
    color: '#6366f1',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyText: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
  },
});

export default SettingsScreen;
