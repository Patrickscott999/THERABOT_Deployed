'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');

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
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <textarea
          className="flex-1 input-field resize-none min-h-[50px] max-h-[150px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="btn-primary flex-shrink-0"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </div>
  );
}
