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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Button, FAB, Searchbar } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { StorageService, Note } from '../services/StorageService';
import { AIService } from '../services/AIService';

const NotesScreen = ({ route, navigation }: any) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery]);

  useEffect(() => {
    // Check if we should open a specific note
    if (route.params?.noteId) {
      const note = notes.find(n => n.id === route.params.noteId);
      if (note) {
        openNote(note);
      }
    }
  }, [route.params?.noteId, notes]);

  const loadNotes = async () => {
    try {
      const loadedNotes = await StorageService.getNotes();
      setNotes(loadedNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const filterNotes = () => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditingTitle(note.title);
    setEditingContent(note.content);
    setIsEditing(false);
    setShowPreview(true);
    setIsModalVisible(true);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSelectedNote(newNote);
    setEditingTitle(newNote.title);
    setEditingContent(newNote.content);
    setIsEditing(true);
    setShowPreview(false);
    setIsModalVisible(true);
  };

  const saveNote = async () => {
    if (!selectedNote) return;

    const updatedNote: Note = {
      ...selectedNote,
      title: editingTitle.trim() || 'Untitled',
      content: editingContent,
      updatedAt: new Date(),
    };

    await StorageService.saveNote(updatedNote);
    await loadNotes();
    setIsEditing(false);
    setShowPreview(true);
    setSelectedNote(updatedNote);
  };

  const deleteNote = async (note: Note) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteNote(note.id);
            await loadNotes();
            if (selectedNote?.id === note.id) {
              setIsModalVisible(false);
            }
          },
        },
      ]
    );
  };

  const summarizeNote = async () => {
    if (!selectedNote || !editingContent.trim()) {
      Alert.alert('Error', 'No content to summarize.');
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await AIService.summarizeText(editingContent);
      
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      const summary = `\n\n---\n\n**AI Summary:**\n${response.text}`;
      setEditingContent(prev => prev + summary);
      
      Alert.alert('Success', 'AI summary has been added to your note.');
    } catch (error) {
      console.error('Error summarizing note:', error);
      Alert.alert('Error', 'Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const closeModal = () => {
    if (isEditing) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => setIsModalVisible(false) },
          { text: 'Save', onPress: saveNote },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      setIsModalVisible(false);
    }
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <Card style={styles.noteCard}>
      <TouchableOpacity onPress={() => openNote(item)}>
        <Card.Content>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <TouchableOpacity
              onPress={() => deleteNote(item)}
              style={styles.deleteButton}
            >
              <MaterialIcons name="delete" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <Text style={styles.noteContent} numberOfLines={3}>
            {item.content || 'No content'}
          </Text>
          <Text style={styles.noteDate}>
            {item.updatedAt.toLocaleDateString()} • {item.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="note" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Tap the + button to create your first note'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={createNewNote}
      />

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
              {isEditing && (
                <TouchableOpacity
                  onPress={summarizeNote}
                  style={styles.headerButton}
                  disabled={isSummarizing}
                >
                  <MaterialIcons 
                    name="summarize" 
                    size={24} 
                    color={isSummarizing ? "#9ca3af" : "#6366f1"} 
                  />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={() => setShowPreview(!showPreview)}
                style={styles.headerButton}
              >
                <MaterialIcons 
                  name={showPreview ? "edit" : "preview"} 
                  size={24} 
                  color="#6366f1" 
                />
              </TouchableOpacity>
              
              {isEditing ? (
                <TouchableOpacity onPress={saveNote} style={styles.headerButton}>
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

          {isEditing ? (
            <ScrollView style={styles.editContainer}>
              <TextInput
                style={[styles.titleInput, { fontSize: 20, fontWeight: 600 }]}
                value={editingTitle}
                onChangeText={setEditingTitle}
                placeholder="Note title..."
              />
              <TextInput
                style={styles.contentInput}
                value={editingContent}
                onChangeText={setEditingContent}
                placeholder="Start writing your note... (supports Markdown)"
                multiline
                textAlignVertical="top"
              />
            </ScrollView>
          ) : (
            <ScrollView style={styles.previewContainer}>
              <Text style={styles.previewTitle}>{selectedNote?.title}</Text>
              <Markdown style={markdownStyles}>
                {selectedNote?.content || '*No content*'}
              </Markdown>
            </ScrollView>
          )}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f1f5f9',
  },
  notesList: {
    padding: 16,
  },
  noteCard: {
    marginBottom: 12,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 600,
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
  editContainer: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    minHeight: 400,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#1e293b',
    marginBottom: 16,
  },
});

const markdownStyles: any = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#1e293b',
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 12,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 24,
  },
  strong: {
    fontWeight: 600,
  },
  em: {
    fontStyle: 'italic',
  },
  list_item: {
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  hr: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginVertical: 16,
  },
};

export default NotesScreen;
