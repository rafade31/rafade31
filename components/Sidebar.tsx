'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Code2, 
  Home, 
  History, 
  Settings, 
  FileText,
  Sparkles,
  Database,
  Terminal,
  X
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeView: 'welcome' | 'chat' | 'editor'
  onViewChange: (view: 'welcome' | 'chat' | 'editor') => void
}

const navigationItems = [
  { id: 'welcome', label: 'Home', icon: Home, view: 'welcome' as const },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, view: 'chat' as const },
  { id: 'editor', label: 'Code Editor', icon: Code2, view: 'editor' as const },
]

const toolItems = [
  { id: 'history', label: 'History', icon: History },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
]

export default function Sidebar({ isOpen, onToggle, activeView, onViewChange }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Navigation
              </h2>
              <button
                onClick={onToggle}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Main
                </h3>
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => onViewChange(item.view)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        activeView === item.view
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className={`h-5 w-5 ${
                        activeView === item.view 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                      <span className="font-medium">{item.label}</span>
                      {activeView === item.view && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                        />
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>

              {/* Tools */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Tools
                </h3>
                <nav className="space-y-1">
                  {toolItems.map((item) => (
                    <motion.button
                      key={item.id}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>

              {/* AI Features */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  AI Features
                </h3>
                <div className="space-y-2">
                  <motion.div
                    className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg border border-purple-200 dark:border-purple-700"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Code Generation
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      AI-powered code completion
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg border border-blue-200 dark:border-blue-700"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Code Review
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Intelligent code analysis
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="font-medium">Settings</span>
            </motion.button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}