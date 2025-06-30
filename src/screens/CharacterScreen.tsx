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
  FlatList,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, FAB, Searchbar, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { StorageService } from '../services/StorageService';
import { Character } from '../types/AIProvider';

const CharacterScreen = ({ navigation }: any) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character>({
    id: '',
    name: '',
    description: '',
    personality: '',
    scenario: '',
    firstMessage: '',
    exampleDialogue: '',
    avatarUri: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchQuery]);

  const loadCharacters = async () => {
    try {
      const loadedCharacters = await StorageService.getCharacters();
      setCharacters(loadedCharacters.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const filterCharacters = () => {
    if (!searchQuery.trim()) {
      setFilteredCharacters(characters);
    } else {
      const filtered = characters.filter(character =>
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCharacters(filtered);
    }
  };

  const openCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setEditingCharacter({ ...character });
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const createNewCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: 'New Character',
      description: '',
      personality: '',
      scenario: '',
      firstMessage: 'Hello! I\'m a new AI character.',
      exampleDialogue: '',
      avatarUri: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSelectedCharacter(newCharacter);
    setEditingCharacter(newCharacter);
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const saveCharacter = async () => {
    if (!editingCharacter.name.trim()) {
      Alert.alert('Error', 'Please enter a character name.');
      return;
    }

    const updatedCharacter: Character = {
      ...editingCharacter,
      name: editingCharacter.name.trim(),
      updatedAt: new Date(),
    };

    await StorageService.saveCharacter(updatedCharacter);
    await loadCharacters();
    setIsEditing(false);
    setSelectedCharacter(updatedCharacter);
  };

  const deleteCharacter = async (character: Character) => {
    Alert.alert(
      'Delete Character',
      `Are you sure you want to delete "${character.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteCharacter(character.id);
            await loadCharacters();
            if (selectedCharacter?.id === character.id) {
              setIsModalVisible(false);
            }
          },
        },
      ]
    );
  };

  const duplicateCharacter = async (character: Character) => {
    const duplicated: Character = {
      ...character,
      id: Date.now().toString(),
      name: `${character.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await StorageService.saveCharacter(duplicated);
    await loadCharacters();
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditingCharacter(prev => ({ ...prev, avatarUri: result.assets[0].uri }));
    }
  };

  const importCharacter = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;

      if (fileName?.endsWith('.json')) {
        // Import JSON character file
        const response = await fetch(fileUri);
        const characterData = await response.json();
        const importedCharacter = await StorageService.importCharacter(characterData);
        await loadCharacters();
        Alert.alert('Success', `Character "${importedCharacter.name}" imported successfully!`);
      } else if (fileName?.endsWith('.png')) {
        // Import character card (PNG with embedded JSON)
        Alert.alert('Info', 'PNG character cards not yet supported. Please use JSON files.');
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import character. Please check the file format.');
    }
  };

  const exportCharacter = async (character: Character) => {
    try {
      const characterData = JSON.stringify(character, null, 2);
      // In a real app, you'd save this to a file or share it
      Alert.alert(
        'Export Character',
        `Character "${character.name}" data ready for export.\n\nIn a full implementation, this would save to a file.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export character.');
    }
  };

  const startChatWithCharacter = (character: Character) => {
    setIsModalVisible(false);
    navigation.navigate('Chat', { characterId: character.id });
  };

  const closeModal = () => {
    if (isEditing) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => setIsModalVisible(false) },
          { text: 'Save', onPress: saveCharacter },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      setIsModalVisible(false);
    }
  };

  const renderCharacterItem = ({ item }: { item: Character }) => (
    <Card style={styles.characterCard}>
      <TouchableOpacity onPress={() => openCharacter(item)}>
        <Card.Content>
          <View style={styles.characterHeader}>
            <Avatar.Image 
              source={item.avatarUri ? { uri: item.avatarUri } : undefined}
              size={50}
              style={styles.avatar}
            />
            <View style={styles.characterInfo}>
              <Text style={styles.characterName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.characterDescription} numberOfLines={2}>
                {item.description || 'No description'}
              </Text>
              <Text style={styles.characterDate}>
                {item.updatedAt.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.characterActions}>
              <TouchableOpacity
                onPress={() => startChatWithCharacter(item)}
                style={styles.actionButton}
              >
                <MaterialIcons name="chat" size={20} color="#6366f1" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => duplicateCharacter(item)}
                style={styles.actionButton}
              >
                <MaterialIcons name="content-copy" size={20} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteCharacter(item)}
                style={styles.actionButton}
              >
                <MaterialIcons name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search characters..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <TouchableOpacity onPress={importCharacter} style={styles.importButton}>
          <MaterialIcons name="upload" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {filteredCharacters.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="person" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No characters found' : 'No characters yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Create your first AI character to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCharacters}
          keyExtractor={(item) => item.id}
          renderItem={renderCharacterItem}
          contentContainerStyle={styles.charactersList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={createNewCharacter}
      />

      {/* Character Edit/View Modal */}
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
            
            <View style={styles.modalActions}>
              {!isEditing && selectedCharacter && (
                <>
                  <TouchableOpacity
                    onPress={() => startChatWithCharacter(selectedCharacter)}
                    style={styles.headerButton}
                  >
                    <MaterialIcons name="chat" size={24} color="#6366f1" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => exportCharacter(selectedCharacter)}
                    style={styles.headerButton}
                  >
                    <MaterialIcons name="download" size={24} color="#10b981" />
                  </TouchableOpacity>
                </>
              )}
              
              {isEditing ? (
                <TouchableOpacity onPress={saveCharacter} style={styles.headerButton}>
                  <MaterialIcons name="save" size={24} color="#22c55e" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={() => setIsEditing(true)} 
                  style={styles.headerButton}
                >
                  <MaterialIcons name="edit" size={24} color="#6366f1" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={isEditing ? pickAvatar : undefined}>
                <Avatar.Image 
                  source={editingCharacter.avatarUri ? { uri: editingCharacter.avatarUri } : undefined}
                  size={100}
                  style={styles.largeAvatar}
                />
                {isEditing && (
                  <View style={styles.avatarOverlay}>
                    <MaterialIcons name="camera-alt" size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Character Fields */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Name:</Text>
              <TextInput
                style={[styles.fieldInput, styles.nameInput]}
                value={editingCharacter.name}
                onChangeText={(text) => setEditingCharacter(prev => ({ ...prev, name: text }))}
                placeholder="Character name..."
                editable={isEditing}
              />
            </View>

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Description:</Text>
              <TextInput
                style={[styles.fieldInput, styles.multilineInput]}
                value={editingCharacter.description}
                onChangeText={(text) => setEditingCharacter(prev => ({ ...prev, description: text }))}
                placeholder="Character description..."
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
            </View>

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Personality:</Text>
              <TextInput
                style={[styles.fieldInput, styles.multilineInput]}
                value={editingCharacter.personality}
                onChangeText={(text) => setEditingCharacter(prev => ({ ...prev, personality: text }))}
                placeholder="Character personality traits..."
                multiline
                numberOfLines={4}
                editable={isEditing}
              />
            </View>

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Scenario:</Text>
              <TextInput
                style={[styles.fieldInput, styles.multilineInput]}
                value={editingCharacter.scenario}
                onChangeText={(text) => setEditingCharacter(prev => ({ ...prev, scenario: text }))}
                placeholder="Background scenario..."
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
            </View>

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>First Message:</Text>
              <TextInput
                style={[styles.fieldInput, styles.multilineInput]}
                value={editingCharacter.firstMessage}
                onChangeText={(text) => setEditingCharacter(prev => ({ ...prev, firstMessage: text }))}
                placeholder="Character's opening message..."
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
            </View>

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Example Dialogue:</Text>
              <TextInput
                style={[styles.fieldInput, styles.multilineInput]}
                value={editingCharacter.exampleDialogue}
                onChangeText={(text) => setEditingCharacter(prev => ({ ...prev, exampleDialogue: text }))}
                placeholder="Example conversation..."
                multiline
                numberOfLines={5}
                editable={isEditing}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#f1f5f9',
  },
  importButton: {
    marginLeft: 12,
    padding: 8,
    justifyContent: 'center',
  },
  charactersList: {
    padding: 16,
  },
  characterCard: {
    marginBottom: 12,
    elevation: 2,
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  characterDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 4,
  },
  characterDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  characterActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  largeAvatar: {
    marginBottom: 8,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  fieldSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '500',
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
});

export default CharacterScreen;
