'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatInput from '../../components/chat/ChatInput';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatHeader from '../../components/chat/ChatHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

// Define message type
type Message = {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
  emotionDetected?: string;
  suggestedCopingStrategy?: any;
  followUpQuestions?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm TheraBot. How are you feeling today?",
      role: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<string>("Friend");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");
  
  // Feature flags from environment variables
  const enableCopingStrategies = process.env.NEXT_PUBLIC_ENABLE_COPING_STRATEGIES === 'true';
  const enableEmotionDetection = process.env.NEXT_PUBLIC_ENABLE_EMOTION_DETECTION === 'true';

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user name from localStorage (saved during signup)
  useEffect(() => {
    // Check for user data in localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      console.log('Retrieved userData from localStorage:', userData);
      
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          console.log('Parsed user data:', parsedData);
          
          // First check for preferred name, then fallback to fullName
          const preferredName = parsedData.preferredName;
          const fullName = parsedData.fullName;
          
          if (preferredName) {
            console.log('Setting user name to preferred name:', preferredName);
            setUserName(preferredName);
            setNameInput(preferredName); // Pre-populate the name input
          } else if (fullName) {
            console.log('Setting user name to full name:', fullName);
            setUserName(fullName);
            setNameInput(fullName); // Pre-populate the name input
          } else {
            console.log('No name found in user data, using default');
            setNameInput('Friend'); // Default name
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage', error);
        }
      } else {
        console.log('No user data found in localStorage');
        
        // For testing, we'll set a default name in localStorage
        const defaultUserData = { fullName: 'Friend', email: 'user@example.com', signupDate: new Date().toISOString() };
        localStorage.setItem('userData', JSON.stringify(defaultUserData));
        setUserName(defaultUserData.fullName);
        setNameInput(defaultUserData.fullName);
        console.log('Created default user data for testing');
      }
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Get all messages in the format the API expects
      const apiMessages = messages.concat(newUserMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from TheraBot');
      }

      const data = await response.json();
      
      // Create bot message from structured response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response.message,
        role: 'bot',
        timestamp: new Date(),
        emotionDetected: data.response.emotionDetected,
        suggestedCopingStrategy: data.response.suggestedCopingStrategy,
        followUpQuestions: data.response.followUpQuestions,
        severity: data.response.severity
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        role: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving the custom name
  const handleSaveName = () => {
    if (nameInput.trim()) {
      // Update user name in state
      setUserName(nameInput.trim());
      
      // Update name in localStorage
      if (typeof window !== 'undefined') {
        try {
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedData = JSON.parse(userData);
            parsedData.preferredName = nameInput.trim();
            localStorage.setItem('userData', JSON.stringify(parsedData));
          } else {
            localStorage.setItem('userData', JSON.stringify({
              fullName: nameInput.trim(),
              preferredName: nameInput.trim(),
              email: 'user@example.com',
              signupDate: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error('Error updating name in localStorage', error);
        }
      }
      
      // Close the name editing UI
      setIsEditingName(false);
      
      // Add a system message about the name change
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: `I'll call you ${nameInput.trim()} from now on.`,
        role: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  };
  
  // Render the name customization UI
  const renderNameCustomization = () => {
    if (isEditingName) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-sm mb-4 flex items-center gap-2">
          <Input
            type="text"
            placeholder="What should I call you?"
            value={nameInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value)}
            className="flex-1"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSaveName()}
          />
          <Button onClick={handleSaveName} className="bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsEditingName(false)}
          >
            Cancel
          </Button>
        </div>
      );
    }
    
    return (
      <div className="mb-4 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setNameInput(userName);
            setIsEditingName(true);
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Change what TheraBot calls you
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader userName={userName} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderNameCustomization()}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && <div className="chat-bubble chat-bubble-bot">TheraBot is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={loading} />
    </div>
  );
}
