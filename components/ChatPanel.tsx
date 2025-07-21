'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  Code2, 
  Copy, 
  Download,
  User,
  Bot,
  Trash2,
  RefreshCw,
  Lightbulb,
  Zap,
  FileText,
  Terminal
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useTheme } from './ThemeProvider'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'code'
  language?: string
}

interface ChatPanelProps {
  onOpenEditor: (language?: string, code?: string) => void
  embedded?: boolean
  currentCode?: string
  currentLanguage?: string
}

const aiResponses = [
  "I'll help you create that function. Here's a solution:",
  "Let me generate the code for you:",
  "Here's how you can implement this:",
  "I've created an optimized version for you:",
  "This should solve your problem:",
]

const codeExamples: Record<string, string> = {
  javascript: `// Async function to fetch user data
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}`,
  python: `# Machine learning model prediction
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

def train_model(X, y):
    """Train a linear regression model"""
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = LinearRegression()
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    return model, score`,
  typescript: `// Type-safe API client
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`);
    return response.json();
  }
}`,
  java: `// Singleton pattern implementation
public class DatabaseConnection {
    private static DatabaseConnection instance;
    private Connection connection;
    
    private DatabaseConnection() {
        // Private constructor
    }
    
    public static synchronized DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }
    
    public Connection getConnection() {
        return connection;
    }
}`,
}

export default function ChatPanel({ onOpenEditor, embedded = false, currentCode, currentLanguage }: ChatPanelProps) {
  const { theme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI coding assistant. I can help you with:

• **Code Generation** - Describe what you want and I'll write the code
• **Code Review** - Analyze and improve your existing code
• **Debugging** - Find and fix issues in your code
• **Explanations** - Understand how code works
• **Best Practices** - Learn coding standards and patterns

What would you like to work on today?`,
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()
    let response = ''
    let type: 'text' | 'code' = 'text'
    let language = 'javascript'

    // Detect if user is asking for code
    if (lowerMessage.includes('function') || lowerMessage.includes('code') || lowerMessage.includes('write') || lowerMessage.includes('create')) {
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      
      // Detect language from message
      if (lowerMessage.includes('python')) language = 'python'
      else if (lowerMessage.includes('typescript')) language = 'typescript'
      else if (lowerMessage.includes('java')) language = 'java'
      else if (lowerMessage.includes('react')) language = 'javascript'
      
      response = `${randomResponse}\n\n\`\`\`${language}\n${codeExamples[language]}\n\`\`\``
      type = 'code'
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('how')) {
      response = `I'd be happy to explain! Here are the key concepts:

• **Variables** - Store data values that can be used later
• **Functions** - Reusable blocks of code that perform specific tasks
• **Objects** - Collections of related data and functionality
• **Arrays** - Ordered lists of items
• **Loops** - Repeat code multiple times
• **Conditionals** - Execute code based on conditions

Would you like me to explain any of these in more detail or show you examples?`
    } else if (lowerMessage.includes('review') && currentCode) {
      response = `I've analyzed your code and here are my suggestions:

✅ **Good practices found:**
• Clean variable naming
• Proper indentation
• Good structure

🔧 **Improvements:**
• Consider adding error handling
• Add type annotations if using TypeScript
• Break down large functions into smaller ones
• Add comments for complex logic

Would you like me to show you an improved version?`
    } else {
      response = `I understand you're asking about "${userMessage}". Here's how I can help:

• If you want me to **write code**, describe what functionality you need
• If you want me to **explain** something, ask "How does X work?"
• If you want me to **review code**, paste your code and ask for feedback
• If you want to **debug**, describe the issue you're facing

What specific coding task can I assist you with?`
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      type,
      language
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const extractCodeFromMessage = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/
    const match = content.match(codeBlockRegex)
    if (match) {
      return {
        language: match[1] || 'javascript',
        code: match[2]
      }
    }
    return null
  }

  const openInEditor = (message: Message) => {
    const codeData = extractCodeFromMessage(message.content)
    if (codeData) {
      onOpenEditor(codeData.language, codeData.code)
      toast.success('Code opened in editor!')
    }
  }

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Chat cleared! I'm ready to help you with your coding questions.

What would you like to work on?`,
      timestamp: new Date(),
      type: 'text'
    }])
    toast.success('Chat cleared!')
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'
    const hasCode = message.content.includes('```')

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary-500' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-4 rounded-2xl ${
            isUser 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}>
            {hasCode ? (
              <div className="space-y-3">
                {message.content.split('```').map((part, index) => {
                  if (index % 2 === 0) {
                    // Text content
                    return part.trim() ? (
                      <div key={index} className="whitespace-pre-wrap">
                        {part.trim()}
                      </div>
                    ) : null
                  } else {
                    // Code content
                    const lines = part.split('\n')
                    const language = lines[0] || 'javascript'
                    const code = lines.slice(1).join('\n')
                    
                    return (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {language}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyToClipboard(code)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              title="Copy code"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => openInEditor(message)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              title="Open in editor"
                            >
                              <Code2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <SyntaxHighlighter
                          language={language}
                          style={theme === 'dark' ? oneDark : oneLight}
                          customStyle={{
                            margin: 0,
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }
                })}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
          
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${embedded ? '' : 'border-l border-gray-200 dark:border-gray-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ready to help with coding
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about coding..."
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              disabled={isTyping}
            />
          </div>
          
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              inputValue.trim() && !isTyping
                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            whileHover={inputValue.trim() && !isTyping ? { scale: 1.05 } : {}}
            whileTap={inputValue.trim() && !isTyping ? { scale: 0.95 } : {}}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { text: 'Generate a function', icon: Code2 },
            { text: 'Explain this code', icon: Lightbulb },
            { text: 'Find bugs', icon: Terminal },
            { text: 'Best practices', icon: FileText },
          ].map((action, index) => (
            <motion.button
              key={action.text}
              onClick={() => setInputValue(action.text)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <action.icon className="h-3 w-3" />
              <span>{action.text}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}