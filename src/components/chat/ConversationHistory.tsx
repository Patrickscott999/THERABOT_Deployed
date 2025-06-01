'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';

interface Conversation {
  id: string;
  lastMessage: string;
  timestamp: Date;
  title: string;
}

interface ConversationHistoryProps {
  currentConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onCloseHistory: () => void;
}

export default function ConversationHistory({
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onCloseHistory
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    setLoading(true);

    if (typeof window !== 'undefined') {
      // Get all localStorage keys
      const allKeys = Object.keys(localStorage);
      
      // Filter for conversation IDs
      const conversationKeys = allKeys.filter(key => key.startsWith('chat_messages_'));
      
      // Load each conversation and extract metadata
      const loadedConversations: Conversation[] = [];
      
      conversationKeys.forEach(key => {
        const conversationId = key.replace('chat_messages_', '');
        const messagesJson = localStorage.getItem(key);
        
        if (messagesJson) {
          try {
            const messages = JSON.parse(messagesJson);
            if (messages && messages.length > 0) {
              // Get the first user message to use as a title
              const firstUserMessage = messages.find((m: any) => m.role === 'user');
              // Get the last message for preview
              const lastMessage = messages[messages.length - 1];
              
              // Create a more descriptive title from the first user message
              let conversationTitle = 'New conversation';
              if (firstUserMessage) {
                // Use the full first user message as the title, limiting to a reasonable length
                conversationTitle = firstUserMessage.content;
                // Add ellipsis if the message is too long
                if (conversationTitle.length > 40) {
                  // Try to cut at a word boundary
                  const cutPoint = conversationTitle.substring(0, 40).lastIndexOf(' ');
                  conversationTitle = conversationTitle.substring(0, cutPoint > 20 ? cutPoint : 40) + '...';
                }
              }
              
              loadedConversations.push({
                id: conversationId,
                lastMessage: lastMessage.content,
                timestamp: new Date(lastMessage.timestamp),
                title: conversationTitle
              });
            }
          } catch (error) {
            console.error('Error parsing conversation:', error);
          }
        }
      });
      
      // Sort by most recent first
      loadedConversations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setConversations(loadedConversations);
    }
    
    setLoading(false);
  };

  // Handle conversation deletion with UI update
  const handleDeleteConversation = (conversationId: string) => {
    // Call the parent component's delete handler
    onDeleteConversation(conversationId);
    
    // Update local state to remove the conversation from the list
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    
    // If this was the last conversation, show the empty state message
    if (updatedConversations.length === 0) {
      setLoading(false); // Ensure loading is set to false to show empty state
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      // Today
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Earlier
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white/90 backdrop-blur-sm w-full max-w-md max-h-[80vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-600">Your Conversations</h2>
          <Button
            onClick={onCloseHistory}
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
          >
            ✕
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 mb-4 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">No previous conversations found.</p>
              <p className="text-sm text-gray-400 mt-1">Start a new chat to begin talking with TheraBot.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {conversations.map(conversation => (
                <li 
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                    conversation.id === currentConversationId ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base">
                        {/* Add a chat icon before the title */}
                        <span className="inline-block mr-2 text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </span>
                        {conversation.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 pl-6">{conversation.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">{formatDate(conversation.timestamp)}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                        className="text-xs py-1 px-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 mt-2 rounded transition-colors flex items-center gap-1"
                        aria-label="Delete conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={onCloseHistory}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
