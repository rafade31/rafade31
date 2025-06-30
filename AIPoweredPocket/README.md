# AIPoweredPocket 📱🤖

**Your secure, private AI companion for Android**

AIPoweredPocket is a comprehensive React Native (Expo) application that brings powerful AI capabilities directly to your mobile device. Built with privacy in mind, all your data stays on your device while leveraging Google AI's powerful models.

## 🌟 Features

### 📊 **Dashboard**
- Central hub showing recent activity
- Quick access to recent chats, notes, and generated images
- Clean, intuitive interface with options for each item

### 💬 **AI Chatbot**
- Rich conversational experience with Google AI models
- **Vision capabilities** - upload images and ask questions about them
- Streaming responses for real-time interaction
- Persistent chat history with search functionality
- Support for multi-turn conversations

### 🎨 **AI Image Generator**
- Text-to-image generation (placeholder implementation)
- Customizable image parameters (size, count)
- History of all generated images
- Share, regenerate, or delete images

### 📝 **Secure Notes**
- **Markdown support** with live preview toggle
- **AI summarization** - get AI-generated summaries of your notes
- Rich text editing with formatting options
- Search through all your notes
- Local storage for privacy

### 🧪 **Prompt Playground**
- Experiment with different AI prompts
- Separate system and user prompt fields
- Model selection and comparison
- Quick example templates (creative, analytical, coding, summary)
- Prompt history for easy reuse

### 🌐 **Web View Browser**
- Integrated minimalist browser
- Dark mode toggle for comfortable viewing
- Browsing history and quick links
- Mobile-optimized navigation controls

### ⚙️ **Settings & Data Management**
- Secure API key storage (Google AI)
- Model selection (Gemini Pro, Vision, etc.)
- Light/Dark theme toggle
- **Data backup & restore** - export/import all data as JSON
- Clear all data option with confirmation

## 🔒 Privacy & Security

- **100% Local Storage** - All your data (chats, notes, images, settings) is stored locally on your device
- **API Key Security** - Your Google AI API key is stored securely on device
- **No Cloud Dependencies** - Works completely offline except for AI API calls
- **Data Portability** - Export/import all your data anytime

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage for local data persistence
- **AI Integration**: Google AI (Gemini) API
- **Markdown**: React Native Markdown Display
- **Additional**: TypeScript, Expo Image Picker, WebView

## 📱 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- Google AI API Key (from [Google AI Studio](https://makersuite.google.com))

### Setup Instructions

1. **Clone and Install**
   ```bash
   cd AIPoweredPocket
   npm install
   ```

2. **Get Google AI API Key**
   - Visit [Google AI Studio](https://makersuite.google.com)
   - Create an API key
   - Copy the key (starts with 'AIza...')

3. **Run the App**
   ```bash
   # Start development server
   npm start
   
   # Run on Android
   npm run android
   
   # Run on iOS (requires Mac)
   npm run ios
   
   # Run on web
   npm run web
   ```

4. **Configure API Key**
   - Open the app
   - Go to Settings tab
   - Enter your Google AI API key
   - Select your preferred model

### Building APK

To build an Android APK:

```bash
# Build development APK
expo build:android

# Or for production
eas build --platform android
```

## 🚀 Usage Guide

### First Time Setup
1. Launch the app
2. Navigate to **Settings**
3. Enter your **Google AI API Key**
4. Choose your preferred **AI model**
5. Start using the app!

### Key Features Usage

**Chat with AI:**
- Go to Chat tab
- Type your message or upload an image
- AI responds with streaming text
- Chat history is automatically saved

**Generate Images:**
- Go to Images tab
- Enter a descriptive prompt
- Select image parameters
- Generate and save images

**Take Notes:**
- Go to Notes tab
- Create new notes with Markdown
- Use AI summarization feature
- Toggle between edit and preview modes

**Experiment with Prompts:**
- Go to Playground tab
- Try different system prompts
- Test various AI models
- Use example templates

## 🔧 Configuration

### AI Models Available
- `gemini-pro` - Best for text generation
- `gemini-pro-vision` - Supports image input
- `gemini-1.5-pro` - Latest advanced model
- `gemini-1.5-flash` - Fast responses

### Theme Options
- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes for low-light usage

### Data Management
- **Export**: Save all data to JSON backup file
- **Import**: Restore from backup file
- **Clear All**: Reset app to fresh state

## 🛡️ Security Features

- API keys are stored using secure device storage
- All user data remains on device
- No telemetry or analytics
- Open source architecture for transparency

## 🤝 Contributing

This is a demonstration project. For production use:
1. Implement proper image generation API
2. Add end-to-end encryption for sensitive data
3. Implement proper error handling and logging
4. Add automated testing
5. Enhance accessibility features

## 📄 License

This project is for educational and demonstration purposes.

## 🆘 Support

For issues or questions:
1. Check your Google AI API key is valid
2. Ensure internet connection for AI features
3. Try clearing app data and reconfiguring
4. Check device storage space

---

**Built with ❤️ using React Native and Google AI**

*Your AI companion that respects your privacy* 🔒
