'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Save, 
  Copy, 
  Download, 
  Settings, 
  Maximize2,
  Languages,
  Lightbulb,
  Zap
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Editor...</p>
      </div>
    </div>
  )
})

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string) => void
}

const supportedLanguages = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'html', name: 'HTML', extension: 'html' },
  { id: 'css', name: 'CSS', extension: 'css' },
  { id: 'json', name: 'JSON', extension: 'json' },
  { id: 'markdown', name: 'Markdown', extension: 'md' },
]

export default function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const { theme } = useTheme()
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    setSelectedLanguage(language)
  }, [language])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: true },
      wordWrap: 'on',
      contextmenu: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      folding: true,
      foldingStrategy: 'indentation',
    })

    // Add custom AI completion suggestions
    monaco.languages.registerCompletionItemProvider(selectedLanguage, {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          {
            label: 'ai-function',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'function ${1:functionName}(${2:params}) {\n\t${3:// AI-generated code}\n\treturn ${4:result};\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'AI-generated function template',
          },
          {
            label: 'ai-class',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3:// AI-generated constructor}\n\t}\n\n\t${4:// AI-generated methods}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'AI-generated class template',
          },
        ]
        return { suggestions }
      }
    })
  }

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage)
    setShowLanguageSelector(false)
    
    // Get default code for the language
    const defaultCode = getDefaultCodeForLanguage(newLanguage)
    onChange(defaultCode)
    
    toast.success(`Switched to ${supportedLanguages.find(l => l.id === newLanguage)?.name}`)
  }

  const getDefaultCodeForLanguage = (lang: string): string => {
    const defaults: Record<string, string> = {
      javascript: '// Welcome to BlackBox AI JavaScript Editor\nconsole.log("Hello, World!");\n\n// AI assistance is enabled - start typing to see suggestions',
      typescript: '// Welcome to BlackBox AI TypeScript Editor\ninterface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "Developer",\n  age: 25\n};\n\nconsole.log(user);',
      python: '# Welcome to BlackBox AI Python Editor\nprint("Hello, World!")\n\n# AI assistance is enabled - start typing to see suggestions\ndef greet(name):\n    return f"Hello, {name}!"',
      java: '// Welcome to BlackBox AI Java Editor\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '// Welcome to BlackBox AI C++ Editor\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
      html: '<!-- Welcome to BlackBox AI HTML Editor -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>BlackBox AI</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
      css: '/* Welcome to BlackBox AI CSS Editor */\nbody {\n    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n}',
    }
    return defaults[lang] || '// Start coding with AI assistance...'
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(value)
    toast.success('Code copied to clipboard!')
  }

  const handleSaveCode = () => {
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `code.${supportedLanguages.find(l => l.id === selectedLanguage)?.extension || 'txt'}`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Code saved successfully!')
  }

  const handleRunCode = () => {
    toast.success('Code execution simulated! (Connect to a real runtime for actual execution)')
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Languages className="h-4 w-4" />
              <span className="text-sm font-medium">
                {supportedLanguages.find(l => l.id === selectedLanguage)?.name || 'Language'}
              </span>
            </button>

            {showLanguageSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
              >
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                      selectedLanguage === lang.id ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* AI Assistant Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              AI Assistant Active
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleRunCode}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="h-4 w-4" />
            <span className="text-sm font-medium">Run</span>
          </motion.button>

          <button
            onClick={handleCopyCode}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy Code"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            onClick={handleSaveCode}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Save Code"
          >
            <Save className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <button
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <MonacoEditor
          height="100%"
          language={selectedLanguage}
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
            wordWrap: 'on',
            automaticLayout: true,
            contextmenu: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />

        {/* AI Suggestion Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            AI suggestions enabled
          </span>
        </motion.div>
      </div>

      {/* Click outside to close language selector */}
      {showLanguageSelector && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowLanguageSelector(false)}
        />
      )}
    </div>
  )
}