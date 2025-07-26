import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, Chip } from 'react-native-paper';
import { AIService } from '../services/AIService';
import { StorageService } from '../services/StorageService';

const PlaygroundScreen = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [promptHistory, setPromptHistory] = useState<Array<{
    system: string;
    user: string;
    response: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    loadSettings();
    setAvailableModels(AIService.getAvailableModels());
    loadPromptHistory();
  }, []);

  const loadSettings = async () => {
    const settings = await StorageService.getSettings();
    setSelectedModel(settings.selectedModel);
  };

  const loadPromptHistory = () => {
    // For now, we'll just use local state
    // In a real app, you might want to persist this history
  };

  const handleExecute = async () => {
    if (!userPrompt.trim()) {
      Alert.alert('Error', 'Please enter a user prompt.');
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const aiResponse = await AIService.generateText(
        userPrompt.trim(),
        systemPrompt.trim() || undefined
      );

      if (aiResponse.error) {
        setResponse(`Error: ${aiResponse.error}`);
      } else {
        setResponse(aiResponse.text);
        
        // Add to history
        const historyEntry = {
          system: systemPrompt.trim(),
          user: userPrompt.trim(),
          response: aiResponse.text,
          timestamp: new Date(),
        };
        setPromptHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      }
    } catch (error) {
      console.error('Playground execution error:', error);
      setResponse('Error: Failed to execute prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            setSystemPrompt('');
            setUserPrompt('');
            setResponse('');
          },
        },
      ]
    );
  };

  const loadPresetExample = (example: 'creative' | 'analytical' | 'coding' | 'summary') => {
    const examples = {
      creative: {
        system: 'You are a creative writing assistant. Help users write engaging stories, poems, and creative content. Be imaginative and inspiring.',
        user: 'Write a short story about a robot who discovers emotions.',
      },
      analytical: {
        system: 'You are a logical and analytical assistant. Break down complex problems step by step and provide clear, reasoned explanations.',
        user: 'Analyze the pros and cons of remote work vs office work.',
      },
      coding: {
        system: 'You are a programming expert. Provide clean, well-commented code examples and explain programming concepts clearly.',
        user: 'Create a React Native component for a custom button with loading state.',
      },
      summary: {
        system: 'You are a summarization expert. Create concise, clear summaries that capture the key points of any text.',
        user: 'Summarize the key benefits of artificial intelligence in healthcare.',
      },
    };

    const selected = examples[example];
    setSystemPrompt(selected.system);
    setUserPrompt(selected.user);
    setResponse('');
  };

  const loadFromHistory = (historyItem: typeof promptHistory[0]) => {
    setSystemPrompt(historyItem.system);
    setUserPrompt(historyItem.user);
    setResponse(historyItem.response);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prompt Playground</Text>
        <Text style={styles.subtitle}>
          Experiment with AI prompts and test different models
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.modelSelector}>
            <Text style={styles.sectionLabel}>Model:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.modelChips}>
                {availableModels.map((model) => (
                  <Chip
                    key={model}
                    selected={selectedModel === model}
                    onPress={() => setSelectedModel(model)}
                    style={styles.modelChip}
                  >
                    {model}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>System Prompt (Optional):</Text>
            <TextInput
              style={styles.systemPromptInput}
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              placeholder="Define the AI's behavior and role..."
              multiline
              numberOfLines={3}
              maxLength={1000}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>User Prompt:</Text>
            <TextInput
              style={styles.userPromptInput}
              value={userPrompt}
              onChangeText={setUserPrompt}
              placeholder="Enter your prompt here..."
              multiline
              numberOfLines={4}
              maxLength={2000}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleExecute}
              disabled={isLoading || !userPrompt.trim()}
              loading={isLoading}
              style={styles.executeButton}
            >
              Execute
            </Button>
            <Button
              mode="outlined"
              onPress={handleClear}
              style={styles.clearButton}
            >
              Clear
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionLabel}>Quick Examples:</Text>
          <View style={styles.exampleButtons}>
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => loadPresetExample('creative')}
            >
              <MaterialIcons name="create" size={20} color="#6366f1" />
              <Text style={styles.exampleButtonText}>Creative</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => loadPresetExample('analytical')}
            >
              <MaterialIcons name="analytics" size={20} color="#6366f1" />
              <Text style={styles.exampleButtonText}>Analytical</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => loadPresetExample('coding')}
            >
              <MaterialIcons name="code" size={20} color="#6366f1" />
              <Text style={styles.exampleButtonText}>Coding</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => loadPresetExample('summary')}
            >
              <MaterialIcons name="summarize" size={20} color="#6366f1" />
              <Text style={styles.exampleButtonText}>Summary</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {response && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.responseHeader}>
              <Text style={styles.sectionLabel}>Response:</Text>
              <TouchableOpacity
                onPress={() => setResponse('')}
                style={styles.clearResponseButton}
              >
                <MaterialIcons name="clear" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.responseContainer} nestedScrollEnabled>
              <Text style={styles.responseText}>{response}</Text>
            </ScrollView>
          </Card.Content>
        </Card>
      )}

      {promptHistory.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Recent History:</Text>
            {promptHistory.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => loadFromHistory(item)}
              >
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTimestamp}>
                    {item.timestamp.toLocaleString()}
                  </Text>
                  <MaterialIcons name="replay" size={16} color="#6366f1" />
                </View>
                <Text style={styles.historyUser} numberOfLines={2}>
                  {item.user}
                </Text>
                {item.system && (
                  <Text style={styles.historySystem} numberOfLines={1}>
                    System: {item.system}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}
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
  modelSelector: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modelChips: {
    flexDirection: 'row',
    gap: 8,
  },
  modelChip: {
    marginRight: 8,
  },
  inputSection: {
    marginBottom: 16,
  },
  systemPromptInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    minHeight: 80,
  },
  userPromptInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  executeButton: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  clearButton: {
    flex: 1,
    borderColor: '#6b7280',
  },
  exampleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  exampleButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearResponseButton: {
    padding: 4,
  },
  responseContainer: {
    maxHeight: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  historyItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyUser: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  historySystem: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

export default PlaygroundScreen;
