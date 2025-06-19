'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  userName: string;
  onNewChat: () => void;
  conversationId: string;
}

export default function ChatHeader({ userName, onNewChat, conversationId }: ChatHeaderProps) {
  return (
    <motion.div 
      className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-purple-200">
            <span className="text-lg">T</span>
          </div>
          <div>
            <h1 className="font-semibold text-xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">TheraBot</h1>
            <p className="text-sm text-gray-500">Your empowering companion</p>
          </div>
        </motion.div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onNewChat}
            className="text-sm py-2 px-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors shadow-md flex items-center gap-2"
            title="Start a new conversation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </motion.button>
          <motion.div 
            className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100 shadow-sm"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            Hi, {userName}!
          </motion.div>
          
          <Link
            href="/support"
            className="text-sm py-2 px-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Support Us
          </Link>
          
          <Link 
            href="/"
            className="text-sm py-2 px-4 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
