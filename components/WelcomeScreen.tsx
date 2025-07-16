'use client'

import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Code2, 
  Sparkles, 
  Zap, 
  Brain, 
  Rocket,
  ArrowRight,
  Star,
  Users,
  Clock
} from 'lucide-react'

interface WelcomeScreenProps {
  onNewChat: () => void
  onOpenEditor: (language?: string, code?: string) => void
}

const features = [
  {
    icon: Sparkles,
    title: 'AI Code Generation',
    description: 'Generate production-ready code from natural language descriptions',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Brain,
    title: 'Smart Completion',
    description: 'Intelligent code completion that understands your project context',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get code suggestions in under 200 milliseconds',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Rocket,
    title: 'Multi-Language',
    description: 'Support for 70+ programming languages and frameworks',
    color: 'from-green-500 to-emerald-500'
  }
]

const quickActions = [
  {
    title: 'Start AI Chat',
    description: 'Ask questions and get instant coding help',
    icon: MessageSquare,
    action: 'chat',
    color: 'bg-primary-500 hover:bg-primary-600'
  },
  {
    title: 'Open Code Editor',
    description: 'Write code with AI assistance',
    icon: Code2,
    action: 'editor',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
]

const stats = [
  { label: 'Developers Trust Us', value: '10M+', icon: Users },
  { label: 'Lines of Code Generated', value: '1B+', icon: Code2 },
  { label: 'Average Response Time', value: '<200ms', icon: Clock },
  { label: 'User Rating', value: '4.9/5', icon: Star }
]

export default function WelcomeScreen({ onNewChat, onOpenEditor }: WelcomeScreenProps) {
  const handleQuickAction = (action: string) => {
    if (action === 'chat') {
      onNewChat()
    } else if (action === 'editor') {
      onOpenEditor('javascript', '// Start coding with AI assistance...')
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Code2 className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="h-4 w-4 text-yellow-800" />
              </div>
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold gradient-text mb-6"
          >
            BlackBox AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            The most advanced AI coding assistant. Generate, complete, and debug code
            10x faster with intelligent AI suggestions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className={`${action.color} text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="h-6 w-6" />
                <span>{action.title}</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-center mb-3">
                <stat.icon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Powerful AI Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center bg-gradient-to-r from-primary-500 to-purple-600 p-12 rounded-3xl text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Code Smarter?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join millions of developers using AI to build better software faster.
          </p>
          
          <motion.button
            onClick={onNewChat}
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center space-x-3 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="h-6 w-6" />
            <span>Start Your First AI Chat</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}