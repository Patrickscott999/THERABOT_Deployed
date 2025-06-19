'use client';

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
      
      // Update rows
      setRows(Math.min(Math.floor(newHeight / 24), 5));
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div 
      className="border-t border-gray-200 bg-white p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="flex space-x-3 items-end max-w-4xl mx-auto">
        <div className="relative flex-1 group">
          <textarea
            ref={textareaRef}
            className="flex-1 w-full input-field resize-none min-h-[50px] max-h-[150px] pr-12 transition-all duration-200 rounded-2xl border-gray-300 group-hover:border-blue-300 shadow-sm focus:shadow-md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
            rows={rows}
          />
          <div className="absolute bottom-2 right-2 text-xs px-2 py-1 bg-gray-100 rounded-md hidden group-hover:block">
            {message.length} / 2000
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="btn-primary flex-shrink-0 rounded-full px-5 py-3 flex items-center gap-2 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Send
            </>
          )}
        </motion.button>
      </form>
      <div className="mt-3 text-xs text-gray-500 text-center max-w-4xl mx-auto flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Press Enter to send, Shift+Enter for a new line
      </div>
    </motion.div>
  );
}
