# BlackBox AI Clone 🤖

A modern, feature-rich AI coding assistant application inspired by BlackBox AI. Built with Next.js, TypeScript, and Tailwind CSS, this application provides an intuitive interface for AI-powered code generation, completion, and debugging.

## ✨ Features

### 🎯 Core Features
- **AI Chat Assistant** - Interactive chat interface for coding questions and assistance
- **Code Editor** - Monaco-based editor with syntax highlighting for 10+ languages
- **Code Generation** - AI-powered code creation from natural language descriptions
- **Smart Completion** - Intelligent code suggestions and auto-completion
- **Multi-Language Support** - JavaScript, TypeScript, Python, Java, C++, HTML, CSS, and more
- **Real-time Collaboration** - Share and discuss code seamlessly

### 🎨 User Experience
- **Beautiful Modern UI** - Clean, responsive design with smooth animations
- **Dark/Light Mode** - Automatic theme switching with system preference detection
- **Mobile Responsive** - Optimized for all device sizes
- **Fast Performance** - Optimized for speed with <200ms response times
- **Intuitive Navigation** - Easy-to-use sidebar and tabbed interface

### 🔧 Technical Features
- **TypeScript** - Full type safety throughout the application
- **Monaco Editor** - VS Code-like editing experience
- **Syntax Highlighting** - Beautiful code highlighting with Prism.js
- **Hot Reload** - Instant development feedback
- **Modern Architecture** - Component-based React structure
- **Accessibility** - WCAG compliant interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd blackbox-ai-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables (optional)**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys if using real AI integration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
blackbox-ai-clone/
├── app/                    # Next.js 13+ app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── Header.tsx         # Application header
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── WelcomeScreen.tsx  # Landing page
│   ├── CodeEditor.tsx     # Monaco-based code editor
│   ├── ChatPanel.tsx      # AI chat interface
│   └── ThemeProvider.tsx  # Theme management
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # Project documentation
```

## 🎮 Usage Guide

### Getting Started
1. **Welcome Screen** - Start from the home page with feature overview
2. **AI Chat** - Click "Start AI Chat" to begin conversing with the AI assistant
3. **Code Editor** - Click "Open Code Editor" to start coding with AI assistance

### AI Chat Features
- Ask coding questions in natural language
- Request code generation for specific functions
- Get explanations for programming concepts
- Receive code review and optimization suggestions
- Use quick action buttons for common requests

### Code Editor Features
- Select from 10+ programming languages
- Real-time syntax highlighting and error detection
- AI-powered code completion and suggestions
- Save and export your code
- Run code simulation
- Fullscreen editing mode

### Navigation
- **Sidebar** - Access different views and tools
- **Theme Toggle** - Switch between light and dark modes
- **Language Selector** - Change programming language in editor
- **Quick Actions** - Common AI assistant functions

## 🛠️ Development

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (VS Code engine)
- **Syntax Highlighting**: Prism.js
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables
Create a `.env.local` file for local development:

```env
# Optional: Real AI integration
OPENAI_API_KEY=your_openai_api_key_here

# App configuration
NEXT_PUBLIC_APP_NAME=BlackBox AI Clone
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🎨 Customization

### Themes
The application supports automatic dark/light mode switching. Customize themes in:
- `tailwind.config.js` - Color palette and design tokens
- `app/globals.css` - Global styles and CSS variables
- `components/ThemeProvider.tsx` - Theme switching logic

### Adding Languages
To add support for new programming languages:

1. Update `supportedLanguages` array in `components/CodeEditor.tsx`
2. Add default code templates in `getDefaultCodeForLanguage` function
3. Ensure Monaco Editor supports the language

### AI Responses
Customize AI responses by modifying:
- `aiResponses` array in `components/ChatPanel.tsx`
- `codeExamples` object for language-specific code samples
- `generateAIResponse` function for response logic

## 🔐 Security

- Input sanitization for user messages
- XSS protection through React's built-in escaping
- CSRF protection via Next.js
- Environment variable protection
- Safe code execution simulation

## 📈 Performance

- **Fast Loading**: Optimized bundle size with code splitting
- **Responsive**: <200ms AI response simulation
- **Efficient**: Lazy loading of Monaco Editor
- **Cached**: Static assets and API responses cached
- **Mobile Optimized**: Touch-friendly interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Add proper error handling
4. Write meaningful commit messages
5. Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [BlackBox AI](https://blackbox.ai/)
- Built with [Next.js](https://nextjs.org/)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

If you have any questions or run into issues, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Provide steps to reproduce any bugs

---

**Built with ❤️ by rafade31**

Enjoy coding with your AI assistant! 🚀
