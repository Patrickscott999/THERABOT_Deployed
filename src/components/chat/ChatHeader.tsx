'use client';

import Link from 'next/link';

interface ChatHeaderProps {
  userName: string;
  onNewChat: () => void;
  conversationId: string;
}

export default function ChatHeader({ userName, onNewChat, conversationId }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            T
          </div>
          <div>
            <h1 className="font-semibold text-lg">TheraBot</h1>
            <p className="text-sm text-gray-500">Your emotional support companion</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onNewChat}
            className="text-sm py-1 px-3 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors shadow-sm"
            title="Start a new conversation"
          >
            New Chat
          </button>
          <span className="text-sm text-gray-600">Hi, {userName}</span>
          <Link 
            href="/"
            className="text-sm py-1 px-3 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
