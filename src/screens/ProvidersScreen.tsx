import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { StorageService } from '../services/StorageService';
import { AIProvider, AISettings, DEFAULT_AI_SETTINGS, AIProviderType } from '../types/AIProvider';
import { AIService } from '../services/AIService';

const ProvidersScreen = () => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  useEffect(() => {
    loadProviders();
    loadAISettings();
  }, []);

  const loadProviders = async () => {
    try {
      const loadedProviders = await StorageService.getAIProviders();
      setProviders(loadedProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const loadAISettings = async () => {
    try {
      const settings = await StorageService.getAISettings();
      setAiSettings(settings);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const openProvider = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setEditingProvider({ ...provider });
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const editProvider = () => {
    setIsEditing(true);
  };

  const saveProvider = async () => {
    if (!editingProvider) return;

    if (editingProvider.apiKey && !AIService.validateApiKey(editingProvider.apiKey, editingProvider.type)) {
      Alert.alert('Invalid API Key', 'The API key format appears to be invalid for this provider.');
      return;
    }

    await StorageService.saveAIProvider(editingProvider);
    await loadProviders();
    setIsEditing(false);
    setSelectedProvider(editingProvider);
  };

  const toggleProvider = async (provider: AIProvider) => {
    const updatedProvider = { ...provider, isEnabled: !provider.isEnabled };
    await StorageService.saveAIProvider(updatedProvider);
    await loadProviders();
  };

  const testProvider = async (provider: AIProvider) => {
    if (!provider.apiKey && provider.type !== 'pollinations' && provider.type !== 'ai_horde') {
      Alert.alert('Error', 'API key required for testing this provider.');
      return;
    }

    Alert.alert(
      'Testing Provider',
      'Testing connection...',
      [{ text: 'Cancel', style: 'cancel' }]
    );

    try {
      const response = await AIService.generateText(
        'Hello, this is a test message. Please respond briefly.',
        undefined,
        undefined,
        provider.id
      );

      if (response.error) {
        Alert.alert('Test Failed', response.error);
      } else {
        Alert.alert('Test Successful', `Provider responded: ${response.text.substring(0, 100)}...`);
      }
    } catch (error) {
      Alert.alert('Test Failed', 'Failed to connect to provider.');
    }
  };

  const saveAISettings = async () => {
    await StorageService.saveAISettings(aiSettings);
    Alert.alert('Success', 'AI settings saved successfully!');
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all AI settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setAiSettings(DEFAULT_AI_SETTINGS);
          },
        },
      ]
    );
  };

  const closeModal = () => {
    if (isEditing) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => setIsModalVisible(false) },
          { text: 'Save', onPress: saveProvider },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      setIsModalVisible(false);
    }
  };

  const getProviderIcon = (type: AIProviderType) => {
    switch (type) {
      case 'google': return 'smart-toy';
      case 'openai': return 'psychology';
      case 'anthropic': return 'science';
      case 'cohere': return 'auto-awesome';
      case 'ai_horde': return 'group';
      case 'local_server': return 'computer';
      case 'pollinations': return 'image';
      default: return 'settings';
    }
  };

  const renderProviderCard = (provider: AIProvider) => (
    <Card key={provider.id} style={styles.providerCard}>
      <Card.Content>
        <View style={styles.providerHeader}>
          <View style={styles.providerInfo}>
            <MaterialIcons 
              name={getProviderIcon(provider.type)} 
              size={24} 
              color={provider.isEnabled ? '#6366f1' : '#9ca3af'} 
            />
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerType}>{provider.type}</Text>
            </View>
          </View>
          
          <View style={styles.providerControls}>
            <Switch
              value={provider.isEnabled}
              onValueChange={() => toggleProvider(provider)}
              trackColor={{ false: '#f3f4f6', true: '#6366f1' }}
              thumbColor={provider.isEnabled ? '#fff' : '#f9fafb'}
            />
          </View>
        </View>

        <View style={styles.providerModels}>
          {provider.models.slice(0, 2).map((model) => (
            <Chip key={model} style={styles.modelChip} textStyle={styles.modelChipText}>
              {model}
            </Chip>
          ))}
          {provider.models.length > 2 && (
            <Chip style={styles.modelChip} textStyle={styles.modelChipText}>
              +{provider.models.length - 2} more
            </Chip>
          )}
        </View>

        <View style={styles.providerActions}>
          <Button
            mode="outlined"
            onPress={() => openProvider(provider)}
            style={styles.actionButton}
            compact
          >
            Configure
          </Button>
          
          {provider.isEnabled && (
            <Button
              mode="text"
              onPress={() => testProvider(provider)}
              style={styles.actionButton}
              compact
            >
              Test
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Providers</Text>
        <Text style={styles.subtitle}>Configure your AI services</Text>
      </View>

      {/* Provider Cards */}
      <View style={styles.providersSection}>
        {providers.map(renderProviderCard)}
      </View>

      {/* AI Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <View style={styles.settingsHeader}>
            <MaterialIcons name="tune" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Global AI Settings</Text>
            <TouchableOpacity
              onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
              style={styles.expandButton}
            >
              <MaterialIcons 
                name={showAdvancedSettings ? "expand-less" : "expand-more"} 
                size={24} 
                color="#6b7280" 
              />
            </TouchableOpacity>
          </View>

          {/* Basic Settings */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Temperature: {aiSettings.temperature}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>0.0</Text>
              <View style={styles.sliderTrack}>
                <TouchableOpacity
                  style={[styles.sliderThumb, { left: `${aiSettings.temperature * 100}%` }]}
                  onPress={() => {/* Implement slider */}}
                />
              </View>
              <Text style={styles.sliderLabel}>2.0</Text>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Max Tokens</Text>
            <TextInput
              style={styles.numberInput}
              value={aiSettings.maxTokens.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 1024;
                setAiSettings(prev => ({ ...prev, maxTokens: value }));
              }}
              keyboardType="numeric"
              placeholder="1024"
            />
          </View>

          {/* Advanced Settings */}
          {showAdvancedSettings && (
            <>
              <Divider style={styles.divider} />
              
              <View style={styles.settingGroup}>
                <Text style={styles.settingLabel}>Top P: {aiSettings.topP}</Text>
                <TextInput
                  style={styles.numberInput}
                  value={aiSettings.topP.toString()}
                  onChangeText={(text) => {
                    const value = parseFloat(text) || 0.9;
                    setAiSettings(prev => ({ ...prev, topP: value }));
                  }}
                  keyboardType="numeric"
                  placeholder="0.9"
                />
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingLabel}>Top K</Text>
                <TextInput
                  style={styles.numberInput}
                  value={aiSettings.topK.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 40;
                    setAiSettings(prev => ({ ...prev, topK: value }));
                  }}
                  keyboardType="numeric"
                  placeholder="40"
                />
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingLabel}>Repetition Penalty</Text>
                <TextInput
                  style={styles.numberInput}
                  value={aiSettings.repetitionPenalty.toString()}
                  onChangeText={(text) => {
                    const value = parseFloat(text) || 1.1;
                    setAiSettings(prev => ({ ...prev, repetitionPenalty: value }));
                  }}
                  keyboardType="numeric"
                  placeholder="1.1"
                />
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingLabel}>Stop Sequences</Text>
                <TextInput
                  style={styles.textInput}
                  value={aiSettings.stopSequences.join(', ')}
                  onChangeText={(text) => {
                    const sequences = text.split(',').map(s => s.trim()).filter(s => s);
                    setAiSettings(prev => ({ ...prev, stopSequences: sequences }));
                  }}
                  placeholder="\\n, Human:, User:"
                  multiline
                />
              </View>
            </>
          )}

          <View style={styles.settingsActions}>
            <Button
              mode="contained"
              onPress={saveAISettings}
              style={styles.saveButton}
            >
              Save Settings
            </Button>
            <Button
              mode="outlined"
              onPress={resetToDefaults}
              style={styles.resetButton}
            >
              Reset
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Provider Configuration Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {selectedProvider?.name || 'Provider'}
            </Text>
            
            <View style={styles.modalActions}>
              {isEditing ? (
                <TouchableOpacity onPress={saveProvider} style={styles.headerButton}>
                  <MaterialIcons name="save" size={24} color="#22c55e" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={editProvider} style={styles.headerButton}>
                  <MaterialIcons name="edit" size={24} color="#6366f1" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {editingProvider && (
              <>
                <View style={styles.configSection}>
                  <Text style={styles.configLabel}>API Key:</Text>
                  <TextInput
                    style={styles.configInput}
                    value={editingProvider.apiKey || ''}
                    onChangeText={(text) => setEditingProvider(prev => prev ? { ...prev, apiKey: text } : null)}
                    placeholder={`Enter ${editingProvider.type} API key...`}
                    secureTextEntry={!isEditing}
                    editable={isEditing}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {editingProvider.type === 'local_server' && (
                  <View style={styles.configSection}>
                    <Text style={styles.configLabel}>Base URL:</Text>
                    <TextInput
                      style={styles.configInput}
                      value={editingProvider.baseUrl || ''}
                      onChangeText={(text) => setEditingProvider(prev => prev ? { ...prev, baseUrl: text } : null)}
                      placeholder="http://localhost:5000"
                      editable={isEditing}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}

                <View style={styles.configSection}>
                  <Text style={styles.configLabel}>Available Models:</Text>
                  <View style={styles.modelsList}>
                    {editingProvider.models.map((model, index) => (
                      <Chip key={index} style={styles.modelChip}>
                        {model}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.configSection}>
                  <Text style={styles.configLabel}>Features:</Text>
                  <View style={styles.featuresList}>
                    {editingProvider.supportsVision && (
                      <Chip icon="visibility" style={styles.featureChip}>
                        Vision Support
                      </Chip>
                    )}
                    {editingProvider.supportsImage && (
                      <Chip icon="image" style={styles.featureChip}>
                        Image Generation
                      </Chip>
                    )}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  providersSection: {
    padding: 16,
  },
  providerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  providerType: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  providerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerModels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  modelChip: {
    backgroundColor: '#f1f5f9',
  },
  modelChipText: {
    fontSize: 11,
  },
  providerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  settingsCard: {
    margin: 16,
    elevation: 2,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
    flex: 1,
  },
  expandButton: {
    padding: 4,
  },
  settingGroup: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 30,
    textAlign: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    marginLeft: -10,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  divider: {
    marginVertical: 16,
  },
  settingsActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  resetButton: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  configSection: {
    marginBottom: 20,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  configInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    backgroundColor: '#e0e7ff',
  },
});

export default ProvidersScreen;
