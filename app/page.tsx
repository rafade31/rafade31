'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import CodeEditor from '@/components/CodeEditor'
import ChatPanel from '@/components/ChatPanel'
import WelcomeScreen from '@/components/WelcomeScreen'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'welcome' | 'chat' | 'editor'>('welcome')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [code, setCode] = useState('')

  const handleNewChat = () => {
    setActiveView('chat')
  }

  const handleOpenEditor = (language: string = 'javascript', initialCode: string = '') => {
    setSelectedLanguage(language)
    setCode(initialCode)
    setActiveView('editor')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeView === 'welcome' && (
              <WelcomeScreen 
                onNewChat={handleNewChat}
                onOpenEditor={handleOpenEditor}
              />
            )}
            
            {activeView === 'chat' && (
              <div className="h-full flex">
                <div className="flex-1">
                  <ChatPanel onOpenEditor={handleOpenEditor} />
                </div>
              </div>
            )}
            
            {activeView === 'editor' && (
              <div className="h-full flex">
                <div className="flex-1 flex">
                  <CodeEditor 
                    language={selectedLanguage}
                    value={code}
                    onChange={setCode}
                  />
                  <div className="w-96 border-l border-gray-200 dark:border-gray-700">
                    <ChatPanel 
                      onOpenEditor={handleOpenEditor}
                      embedded={true}
                      currentCode={code}
                      currentLanguage={selectedLanguage}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}