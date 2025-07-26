import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Title, Paragraph } from 'react-native-paper';
import { StorageService } from '../services/StorageService';

interface RecentItem {
  id: string;
  title: string;
  timestamp: Date;
  type: 'chat' | 'note' | 'image';
  preview?: string;
}

const DashboardScreen = ({ navigation }: any) => {
  const [recentChats, setRecentChats] = useState<RecentItem[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentItem[]>([]);
  const [recentImages, setRecentImages] = useState<RecentItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecentData = async () => {
    try {
      const chats = await StorageService.getRecentChats();
      const notes = await StorageService.getRecentNotes();
      const images = await StorageService.getRecentImages();
      
      setRecentChats(chats.slice(0, 3));
      setRecentNotes(notes.slice(0, 3));
      setRecentImages(images.slice(0, 3));
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  useEffect(() => {
    loadRecentData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentData();
    setRefreshing(false);
  };

  const handleItemPress = (item: RecentItem) => {
    switch (item.type) {
      case 'chat':
        navigation.navigate('Chat', { chatId: item.id });
        break;
      case 'note':
        navigation.navigate('Notes', { noteId: item.id });
        break;
      case 'image':
        navigation.navigate('Images', { imageId: item.id });
        break;
    }
  };

  const handleItemOptions = (item: RecentItem) => {
    // TODO: Implement options menu (rename, delete)
    console.log('Options for item:', item.id);
  };

  const renderRecentSection = (title: string, items: RecentItem[], iconName: keyof typeof MaterialIcons.glyphMap) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={iconName} size={24} color="#6366f1" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {items.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph style={styles.emptyText}>No recent {title.toLowerCase()}</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <TouchableOpacity
              onPress={() => handleItemPress(item)}
              style={styles.cardContent}
            >
              <Card.Content style={styles.cardInner}>
                <View style={styles.itemHeader}>
                  <Title style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Title>
                  <TouchableOpacity
                    onPress={() => handleItemOptions(item)}
                    style={styles.optionsButton}
                  >
                    <MaterialIcons name="more-vert" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                {item.preview && (
                  <Paragraph style={styles.itemPreview} numberOfLines={2}>
                    {item.preview}
                  </Paragraph>
                )}
                <Text style={styles.timestamp}>
                  {item.timestamp.toLocaleDateString()}
                </Text>
              </Card.Content>
            </TouchableOpacity>
          </Card>
        ))
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appTitle}>AIPoweredPocket</Text>
        <Text style={styles.subtitle}>Your AI companion</Text>
      </View>

      {renderRecentSection('Recent Chats', recentChats, 'chat')}
      {renderRecentSection('Recent Notes', recentNotes, 'note')}
      {renderRecentSection('Recent Images', recentImages, 'image')}
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
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1e293b',
  },
  itemCard: {
    marginBottom: 8,
    elevation: 2,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
  },
  cardInner: {
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  optionsButton: {
    padding: 4,
  },
  itemPreview: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyCard: {
    elevation: 1,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
