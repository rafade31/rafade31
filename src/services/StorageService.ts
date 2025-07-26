import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIProvider, Character, AISettings, DEFAULT_PROVIDERS } from '../types/AIProvider';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUri?: string;
  characterId?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  characterId?: string;
  providerId?: string;
  settings?: Partial<AISettings>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUri: string;
  createdAt: Date;
  providerId?: string;
}

export interface Settings {
  apiKey: string; // Legacy - kept for backward compatibility
  selectedModel: string; // Legacy - kept for backward compatibility
  theme: 'light' | 'dark';
  defaultProviderId: string;
  defaultCharacterId?: string;
}

export class StorageService {
  private static readonly KEYS = {
    CHATS: 'chats',
    NOTES: 'notes',
    IMAGES: 'generated_images',
    SETTINGS: 'settings',
    AI_PROVIDERS: 'ai_providers',
    CHARACTERS: 'characters',
    AI_SETTINGS: 'ai_settings',
  };

  // Generic storage methods
  private static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data, (key, value) => {
        // Parse dates
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      }) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  private static async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  // AI Provider methods
  static async getAIProviders(): Promise<AIProvider[]> {
    const providers = await this.get<AIProvider[]>(this.KEYS.AI_PROVIDERS);
    return providers || DEFAULT_PROVIDERS;
  }

  static async saveAIProvider(provider: AIProvider): Promise<void> {
    const providers = await this.getAIProviders();
    const existingIndex = providers.findIndex(p => p.id === provider.id);
    
    if (existingIndex >= 0) {
      providers[existingIndex] = provider;
    } else {
      providers.push(provider);
    }
    
    await this.set(this.KEYS.AI_PROVIDERS, providers);
  }

  static async deleteAIProvider(providerId: string): Promise<void> {
    const providers = await this.getAIProviders();
    const filteredProviders = providers.filter(p => p.id !== providerId);
    await this.set(this.KEYS.AI_PROVIDERS, filteredProviders);
  }

  static async updateProviderApiKey(providerId: string, apiKey: string): Promise<void> {
    const providers = await this.getAIProviders();
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      provider.apiKey = apiKey;
      await this.set(this.KEYS.AI_PROVIDERS, providers);
    }
  }

  // Character methods
  static async getCharacters(): Promise<Character[]> {
    const characters = await this.get<Character[]>(this.KEYS.CHARACTERS);
    return characters || [];
  }

  static async saveCharacter(character: Character): Promise<void> {
    const characters = await this.getCharacters();
    const existingIndex = characters.findIndex(c => c.id === character.id);
    
    if (existingIndex >= 0) {
      characters[existingIndex] = character;
    } else {
      characters.push(character);
    }
    
    await this.set(this.KEYS.CHARACTERS, characters);
  }

  static async deleteCharacter(characterId: string): Promise<void> {
    const characters = await this.getCharacters();
    const filteredCharacters = characters.filter(c => c.id !== characterId);
    await this.set(this.KEYS.CHARACTERS, filteredCharacters);
  }

  static async importCharacter(characterData: any): Promise<Character> {
    // Handle different character card formats (JSON, PNG with metadata, etc.)
    let character: Character;
    
    if (typeof characterData === 'string') {
      try {
        const parsed = JSON.parse(characterData);
        character = this.normalizeCharacterFormat(parsed);
      } catch (error) {
        throw new Error('Invalid character file format');
      }
    } else {
      character = this.normalizeCharacterFormat(characterData);
    }
    
    character.id = Date.now().toString();
    character.createdAt = new Date();
    character.updatedAt = new Date();
    
    await this.saveCharacter(character);
    return character;
  }

  private static normalizeCharacterFormat(data: any): Character {
    // Handle different character card formats
    return {
      id: '',
      name: data.name || data.char_name || 'Unknown Character',
      description: data.description || data.char_description || '',
      personality: data.personality || data.char_personality || '',
      scenario: data.scenario || data.world_scenario || '',
      firstMessage: data.first_mes || data.firstMessage || 'Hello!',
      exampleDialogue: data.mes_example || data.exampleDialogue || '',
      avatarUri: data.avatar || data.avatarUri,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: data.settings,
    };
  }

  // Chat methods
  static async getChats(): Promise<Chat[]> {
    const chats = await this.get<Chat[]>(this.KEYS.CHATS);
    return chats || [];
  }

  static async saveChat(chat: Chat): Promise<void> {
    const chats = await this.getChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }
    
    await this.set(this.KEYS.CHATS, chats);
  }

  static async deleteChat(chatId: string): Promise<void> {
    const chats = await this.getChats();
    const filteredChats = chats.filter(c => c.id !== chatId);
    await this.set(this.KEYS.CHATS, filteredChats);
  }

  static async getRecentChats(): Promise<any[]> {
    const chats = await this.getChats();
    return chats
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5)
      .map(chat => ({
        id: chat.id,
        title: chat.title,
        timestamp: chat.updatedAt,
        type: 'chat' as const,
        preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : undefined,
      }));
  }

  // Notes methods
  static async getNotes(): Promise<Note[]> {
    const notes = await this.get<Note[]>(this.KEYS.NOTES);
    return notes || [];
  }

  static async saveNote(note: Note): Promise<void> {
    const notes = await this.getNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }
    
    await this.set(this.KEYS.NOTES, notes);
  }

  static async deleteNote(noteId: string): Promise<void> {
    const notes = await this.getNotes();
    const filteredNotes = notes.filter(n => n.id !== noteId);
    await this.set(this.KEYS.NOTES, filteredNotes);
  }

  static async getRecentNotes(): Promise<any[]> {
    const notes = await this.getNotes();
    return notes
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5)
      .map(note => ({
        id: note.id,
        title: note.title,
        timestamp: note.updatedAt,
        type: 'note' as const,
        preview: note.content.substring(0, 100),
      }));
  }

  // Images methods
  static async getGeneratedImages(): Promise<GeneratedImage[]> {
    const images = await this.get<GeneratedImage[]>(this.KEYS.IMAGES);
    return images || [];
  }

  static async saveGeneratedImage(image: GeneratedImage): Promise<void> {
    const images = await this.getGeneratedImages();
    images.push(image);
    await this.set(this.KEYS.IMAGES, images);
  }

  static async deleteGeneratedImage(imageId: string): Promise<void> {
    const images = await this.getGeneratedImages();
    const filteredImages = images.filter(i => i.id !== imageId);
    await this.set(this.KEYS.IMAGES, filteredImages);
  }

  static async getRecentImages(): Promise<any[]> {
    const images = await this.getGeneratedImages();
    return images
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(image => ({
        id: image.id,
        title: image.prompt.substring(0, 50) + '...',
        timestamp: image.createdAt,
        type: 'image' as const,
        preview: image.prompt,
      }));
  }

  // Settings methods
  static async getSettings(): Promise<Settings> {
    const settings = await this.get<Settings>(this.KEYS.SETTINGS);
    return settings || {
      apiKey: '',
      selectedModel: 'gemini-pro',
      theme: 'light',
      defaultProviderId: 'google-ai',
    };
  }

  static async saveSettings(settings: Settings): Promise<void> {
    await this.set(this.KEYS.SETTINGS, settings);
  }

  // AI Settings methods
  static async getAISettings(): Promise<AISettings> {
    const settings = await this.get<AISettings>(this.KEYS.AI_SETTINGS);
    return settings || {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxTokens: 1024,
      repetitionPenalty: 1.1,
      presencePenalty: 0.0,
      frequencyPenalty: 0.0,
      stopSequences: [],
    };
  }

  static async saveAISettings(settings: AISettings): Promise<void> {
    await this.set(this.KEYS.AI_SETTINGS, settings);
  }

  // Data management
  static async exportAllData(): Promise<string> {
    const chats = await this.getChats();
    const notes = await this.getNotes();
    const images = await this.getGeneratedImages();
    const settings = await this.getSettings();
    const providers = await this.getAIProviders();
    const characters = await this.getCharacters();
    const aiSettings = await this.getAISettings();

    const exportData = {
      chats,
      notes,
      images,
      settings,
      providers,
      characters,
      aiSettings,
      exportDate: new Date(),
      version: '2.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  static async importAllData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData, (key, value) => {
        // Parse dates
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      });

      if (data.chats) await this.set(this.KEYS.CHATS, data.chats);
      if (data.notes) await this.set(this.KEYS.NOTES, data.notes);
      if (data.images) await this.set(this.KEYS.IMAGES, data.images);
      if (data.settings) await this.set(this.KEYS.SETTINGS, data.settings);
      if (data.providers) await this.set(this.KEYS.AI_PROVIDERS, data.providers);
      if (data.characters) await this.set(this.KEYS.CHARACTERS, data.characters);
      if (data.aiSettings) await this.set(this.KEYS.AI_SETTINGS, data.aiSettings);
    } catch (error) {
      throw new Error('Invalid backup file format');
    }
  }

  static async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.KEYS.CHATS,
      this.KEYS.NOTES,
      this.KEYS.IMAGES,
      this.KEYS.SETTINGS,
      this.KEYS.AI_PROVIDERS,
      this.KEYS.CHARACTERS,
      this.KEYS.AI_SETTINGS,
    ]);
  }
}
