import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const WebViewScreen = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [urlHistory, setUrlHistory] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (canGoBack) {
          webViewRef.current?.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [canGoBack])
  );

  const handleUrlSubmit = () => {
    let finalUrl = url.trim();
    
    if (!finalUrl) return;
    
    // Add protocol if missing
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      // Check if it looks like a search query
      if (finalUrl.includes(' ') || !finalUrl.includes('.')) {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
      } else {
        finalUrl = `https://${finalUrl}`;
      }
    }
    
    setUrl(finalUrl);
    
    // Add to history if not already there
    if (!urlHistory.includes(finalUrl)) {
      setUrlHistory(prev => [finalUrl, ...prev.slice(0, 9)]); // Keep last 10
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    
    // Update URL input with current URL
    if (navState.url !== url) {
      setUrl(navState.url);
    }
  };

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    }
  };

  const handleGoForward = () => {
    if (canGoForward) {
      webViewRef.current?.goForward();
    }
  };

  const handleShare = () => {
    Alert.alert('Share', `Share: ${currentUrl}`);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Inject CSS to force dark mode
    const darkModeCSS = `
      (function() {
        const style = document.createElement('style');
        style.textContent = \`
          * {
            background-color: #1a1a1a !important;
            color: #ffffff !important;
            border-color: #333333 !important;
          }
          img { filter: brightness(0.8) !important; }
          video { filter: brightness(0.8) !important; }
        \`;
        document.head.appendChild(style);
      })();
    `;
    
    if (!isDarkMode) {
      webViewRef.current?.injectJavaScript(darkModeCSS);
    } else {
      webViewRef.current?.reload();
    }
  };

  const showUrlHistory = () => {
    if (urlHistory.length === 0) {
      Alert.alert('History', 'No browsing history yet.');
      return;
    }

    const historyOptions = urlHistory.map((historyUrl, index) => ({
      text: historyUrl.length > 50 ? historyUrl.substring(0, 50) + '...' : historyUrl,
      onPress: () => setUrl(historyUrl),
    }));

    Alert.alert(
      'Browsing History',
      'Select a URL to visit:',
      [
        ...historyOptions,
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const quickLinks = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
  ];

  const showQuickLinks = () => {
    const linkOptions = quickLinks.map((link) => ({
      text: link.name,
      onPress: () => setUrl(link.url),
    }));

    Alert.alert(
      'Quick Links',
      'Select a site to visit:',
      [
        ...linkOptions,
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const darkModeInjectedJS = isDarkMode ? `
    (function() {
      const style = document.createElement('style');
      style.textContent = \`
        * {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
          border-color: #333333 !important;
        }
        img { filter: brightness(0.8) !important; }
        video { filter: brightness(0.8) !important; }
      \`;
      document.head.appendChild(style);
    })();
    true;
  ` : '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* URL Bar */}
      <View style={styles.urlBar}>
        <TouchableOpacity onPress={showUrlHistory} style={styles.historyButton}>
          <MaterialIcons name="history" size={20} color="#6366f1" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.urlInput}
          value={url}
          onChangeText={setUrl}
          onSubmitEditing={handleUrlSubmit}
          placeholder="Enter URL or search..."
          autoCapitalize="none"
          autoCorrect={false}
          selectTextOnFocus
        />
        
        <TouchableOpacity onPress={showQuickLinks} style={styles.quickLinksButton}>
          <MaterialIcons name="bookmark" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleGoBack}
          disabled={!canGoBack}
          style={[styles.controlButton, !canGoBack && styles.disabledButton]}
        >
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            color={canGoBack ? "#6366f1" : "#9ca3af"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleGoForward}
          disabled={!canGoForward}
          style={[styles.controlButton, !canGoForward && styles.disabledButton]}
        >
          <MaterialIcons 
            name="arrow-forward" 
            size={24} 
            color={canGoForward ? "#6366f1" : "#9ca3af"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleRefresh} style={styles.controlButton}>
          <MaterialIcons name="refresh" size={24} color="#6366f1" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleDarkMode} style={styles.controlButton}>
          <MaterialIcons 
            name={isDarkMode ? "light-mode" : "dark-mode"} 
            size={24} 
            color="#6366f1" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleShare} style={styles.controlButton}>
          <MaterialIcons name="share" size={24} color="#6366f1" />
        </TouchableOpacity>
        
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <MaterialIcons name="hourglass-empty" size={16} color="#6366f1" />
          </View>
        )}
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={darkModeInjectedJS}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scalesPageToFit
        allowsBackForwardNavigationGestures
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
  },
  historyButton: {
    marginRight: 12,
    padding: 4,
  },
  urlInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  quickLinksButton: {
    marginLeft: 12,
    padding: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  controlButton: {
    padding: 8,
    marginRight: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingIndicator: {
    marginLeft: 'auto',
    padding: 8,
  },
  webView: {
    flex: 1,
  },
});

export default WebViewScreen;
