'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';

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

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div 
        className={`chat-bubble ${
          isBot ? 'chat-bubble-bot' : 'chat-bubble-user'
        } max-w-[80%]`}
      >
        <div className="mb-1">
          <span className="font-medium">{isBot ? 'TheraBot' : 'You'}</span>
          <span className="text-xs ml-2 opacity-70">
            {format(new Date(timestamp), 'h:mm a')}
          </span>
          {isBot && emotionDetected && enableEmotionDetection && (
            <span className="text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
              Detected: {emotionDetected}
            </span>
          )}
        </div>
        <div className={`whitespace-pre-wrap ${isBot ? 'prose prose-lg leading-relaxed' : ''}`}>
          {content}
        </div>
        
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
    </div>
  );
}
