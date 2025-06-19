'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DOMPurify from 'isomorphic-dompurify';
import { motion } from 'framer-motion';

// Feature flags from environment variables
const enableCopingStrategies = process.env.NEXT_PUBLIC_ENABLE_COPING_STRATEGIES === 'true';
const enableEmotionDetection = process.env.NEXT_PUBLIC_ENABLE_EMOTION_DETECTION === 'true';

interface MessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'bot';
    timestamp: Date;
    emotionDetected?: string;
    suggestedCopingStrategy?: any;
    followUpQuestions?: string[];
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export default function ChatMessage({ message }: MessageProps) {
  const { content, role, timestamp, emotionDetected, suggestedCopingStrategy, followUpQuestions } = message;
  const isBot = role === 'bot';
  const [showCopingStrategy, setShowCopingStrategy] = useState(false);

  // Function to render the coping strategy section if available
  const renderCopingStrategy = () => {
    if (!isBot || !suggestedCopingStrategy || suggestedCopingStrategy.type === 'none') {
      return null;
    }

    switch (suggestedCopingStrategy.type) {
      case 'breathing_exercise':
        return (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-700">Breathing Exercise</h4>
            <p className="text-sm mb-2">{suggestedCopingStrategy.description}</p>
            <ol className="list-decimal list-inside text-sm">
              {suggestedCopingStrategy.steps.map((step: string, index: number) => (
                <li key={index} className="my-1">{step}</li>
              ))}
            </ol>
          </div>
        );
      case 'affirmation':
        return (
          <div className="mt-3 p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-700">Affirmation</h4>
            <p className="text-sm italic">"{suggestedCopingStrategy.text}"</p>
          </div>
        );
      case 'reflection':
        return (
          <div className="mt-3 p-3 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-700">Reflection Prompt</h4>
            <p className="text-sm">{suggestedCopingStrategy.prompt}</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Function to render follow-up questions if available
  const renderFollowUpQuestions = () => {
    if (!isBot || !followUpQuestions || followUpQuestions.length === 0) {
      return null;
    }

    return (
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-600">You might consider:</p>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {followUpQuestions.map((question: string, index: number) => (
            <li key={index} className="my-1">{question}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Format the message content to replace markdown-like formatting with styled HTML
  const formatMessageContent = (text: string) => {
    if (!isBot) return text;
    
    // Replace numbering patterns like "1. **Text**:" with styled elements
    let formattedText = text.replace(/(?:\d+\. )\*\*(.*?)\*\*:/g, '<div class="point-title">$1</div>');
    
    // Replace remaining **bold** with styled spans
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');
    
    // Add gradient styling to motivational sentences at the end (sentences ending with ! or that contain words like 'can', 'will')
    formattedText = formattedText.replace(/([^.!?]*(?:believe in you|you can|you will|you're capable)[^.!?]*[.!?])/gi, 
      '<span class="motivational">$1</span>');
    
    // Clean the HTML to prevent XSS
    return DOMPurify.sanitize(formattedText);
  };

  // Get color for emotion indicator
  const getEmotionColor = (emotion: string): string => {
    const emotionColors: {[key: string]: string} = {
      'joy': '#10B981', // green
      'happiness': '#10B981',
      'content': '#10B981',
      'sad': '#60A5FA', // blue
      'sadness': '#60A5FA',
      'grief': '#60A5FA',
      'angry': '#EF4444', // red
      'anger': '#EF4444',
      'frustrated': '#EF4444',
      'anxious': '#F59E0B', // amber
      'anxiety': '#F59E0B',
      'worried': '#F59E0B',
      'fear': '#F59E0B',
      'neutral': '#9CA3AF', // gray
      'confused': '#9CA3AF',
    };
    
    // Check if emotion contains any of our keys as substrings
    const matchedEmotion = Object.keys(emotionColors).find(key => 
      emotion.toLowerCase().includes(key.toLowerCase()));
    
    return matchedEmotion ? emotionColors[matchedEmotion] : '#9CA3AF'; // default to gray
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setIsVisible(true);
  }, []);

  return (
    <motion.div 
      className={`flex items-end ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
    >
      {isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md mr-2">
          T
        </div>
      )}
      <div 
        className={`chat-bubble ${
          isBot ? 'chat-bubble-bot' : 'chat-bubble-user'
        } max-w-[80%]`}
      >
        <div className="mb-1 flex items-center">
          <span className="font-medium">{isBot ? 'TheraBot' : 'You'}</span>
          <span className="text-xs ml-2 opacity-70">
            {format(new Date(timestamp), 'h:mm a')}
          </span>
          {isBot && emotionDetected && enableEmotionDetection && (
            <span className="text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded-full flex items-center">
              <span className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: getEmotionColor(emotionDetected)}}></span>
              {emotionDetected}
            </span>
          )}
        </div>
        <div 
          className={`message-content whitespace-pre-wrap ${isBot ? 'prose prose-lg leading-relaxed' : ''}`}
          dangerouslySetInnerHTML={{ __html: isBot ? formatMessageContent(content) : content }}
        />
        
        {isBot && suggestedCopingStrategy && suggestedCopingStrategy.type !== 'none' && enableCopingStrategies && (
          <div className="mt-2">
            <button 
              onClick={() => setShowCopingStrategy(!showCopingStrategy)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showCopingStrategy ? 'Hide coping strategy' : 'View suggested coping strategy'}
            </button>
            {showCopingStrategy && renderCopingStrategy()}
          </div>
        )}

        {renderFollowUpQuestions()}
      </div>
      {!isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md ml-2">
          Y
        </div>
      )}
    </motion.div>
  );
}
