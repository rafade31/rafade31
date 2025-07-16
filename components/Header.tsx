'use client'

import { motion } from 'framer-motion'
import { Menu, Sun, Moon, Code, Zap } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface HeaderProps {
  sidebarOpen: boolean
  onSidebarToggle: () => void
}

export default function Header({ sidebarOpen, onSidebarToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-2 w-2 text-yellow-800" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">BlackBox AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Coding Assistant
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.div
            className="hidden md:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              AI Ready
            </span>
          </motion.div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">R</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                rafade31
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Developer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}