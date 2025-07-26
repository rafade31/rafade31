import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, ActivityIndicator } from 'react-native-paper';
import { StorageService, GeneratedImage } from '../services/StorageService';
import { AIService } from '../services/AIService';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 2;

const ImageGeneratorScreen = ({ route, navigation }: any) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImageCount, setSelectedImageCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState('512x512');

  useEffect(() => {
    loadGeneratedImages();
  }, []);

  useEffect(() => {
    // Check if we should load a specific image
    if (route.params?.imageId) {
      const image = generatedImages.find(img => img.id === route.params.imageId);
      if (image) {
        setPrompt(image.prompt);
      }
    }
  }, [route.params?.imageId, generatedImages]);

  const loadGeneratedImages = async () => {
    try {
      const images = await StorageService.getGeneratedImages();
      setGeneratedImages(images.reverse()); // Show newest first
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt for image generation.');
      return;
    }

    setIsGenerating(true);

    try {
      // For demo purposes, we'll create a placeholder image
      // In a real app, you'd integrate with an actual image generation API
      const response = await AIService.generateImage(prompt.trim());

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      // Since Google AI doesn't have image generation, we'll simulate it
      // In a real app, you'd save the actual generated image
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        imageUri: 'https://via.placeholder.com/512x512/6366f1/ffffff?text=' + encodeURIComponent(prompt.trim().substring(0, 20)),
        createdAt: new Date(),
      };

      await StorageService.saveGeneratedImage(newImage);
      await loadGeneratedImages();
      setPrompt('');

      Alert.alert('Success', 'Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteGeneratedImage(imageId);
            await loadGeneratedImages();
          },
        },
      ]
    );
  };

  const handleShareImage = (image: GeneratedImage) => {
    // In a real app, you'd implement sharing functionality
    Alert.alert('Share', `Sharing image: ${image.prompt}`);
  };

  const handleRegenerateImage = (image: GeneratedImage) => {
    setPrompt(image.prompt);
  };

  const renderImageItem = ({ item }: { item: GeneratedImage }) => (
    <Card style={styles.imageCard}>
      <Card.Cover 
        source={{ uri: item.imageUri }} 
        style={styles.cardImage}
        resizeMode="cover"
      />
      <Card.Content style={styles.cardContent}>
        <Text style={styles.imagePrompt} numberOfLines={2}>
          {item.prompt}
        </Text>
        <Text style={styles.imageDate}>
          {item.createdAt.toLocaleDateString()}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="text"
          icon="refresh"
          onPress={() => handleRegenerateImage(item)}
          compact
        >
          Regenerate
        </Button>
        <Button
          mode="text"
          icon="share"
          onPress={() => handleShareImage(item)}
          compact
        >
          Share
        </Button>
        <Button
          mode="text"
          icon="delete"
          onPress={() => handleDeleteImage(item.id)}
          compact
          textColor="#ef4444"
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  const imageSizes = ['256x256', '512x512', '1024x1024'];
  const imageCounts = [1, 2, 3, 4];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.generationSection}>
        <Card style={styles.inputCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Generate New Image</Text>
            
            <TextInput
              style={styles.promptInput}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Describe the image you want to generate..."
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            <View style={styles.optionsContainer}>
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Number of Images:</Text>
                <View style={styles.optionButtons}>
                  {imageCounts.map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.optionButton,
                        selectedImageCount === count && styles.optionButtonSelected
                      ]}
                      onPress={() => setSelectedImageCount(count)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        selectedImageCount === count && styles.optionButtonTextSelected
                      ]}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Image Size:</Text>
                <View style={styles.optionButtons}>
                  {imageSizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.optionButton,
                        selectedSize === size && styles.optionButtonSelected
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        selectedSize === size && styles.optionButtonTextSelected
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleGenerateImage}
              disabled={isGenerating || !prompt.trim()}
              style={styles.generateButton}
              loading={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Generated Images</Text>
        
        {generatedImages.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <MaterialIcons name="image" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No images generated yet</Text>
                <Text style={styles.emptySubtext}>
                  Enter a prompt above to generate your first AI image
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={generatedImages}
            keyExtractor={(item) => item.id}
            renderItem={renderImageItem}
            numColumns={2}
            columnWrapperStyle={styles.imageRow}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  generationSection: {
    padding: 16,
  },
  inputCard: {
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1e293b',
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionGroup: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#6366f1',
  },
  historySection: {
    padding: 16,
    paddingTop: 0,
  },
  imageRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageCard: {
    width: imageWidth,
    elevation: 2,
  },
  cardImage: {
    height: imageWidth,
  },
  cardContent: {
    paddingVertical: 8,
  },
  imagePrompt: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  imageDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardActions: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ImageGeneratorScreen;
