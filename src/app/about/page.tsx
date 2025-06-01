import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">About TheraBot</h1>
          <p className="text-xl text-gray-600">Your Emotionally Intelligent AI Companion</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">What is TheraBot?</h2>
          <p className="text-gray-700 mb-4">
            TheraBot is an AI-powered chatbot designed to provide emotional support, mentorship advice, 
            and coping tools through emotionally intelligent conversations.
          </p>
          <p className="text-gray-700 mb-4">
            Using advanced natural language processing, TheraBot can recognize emotions in your messages 
            and respond with empathy, understanding, and helpful guidance.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Core Features</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Emotional check-ins for daily support</li>
            <li>Personalized chatbot identity using your name</li>
            <li>Mentorship advice on demand</li>
            <li>Coping tools including affirmations, breathing exercises, and reflection prompts</li>
            <li>Private and secure conversations</li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Emotional Intelligence</h2>
          <p className="text-gray-700 mb-4">
            TheraBot is built on principles of emotional intelligence, meaning it can:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Recognize and validate your emotions</li>
            <li>Respond with appropriate empathy and understanding</li>
            <li>Offer guidance without judgment</li>
            <li>Provide personalized support based on your needs</li>
          </ul>
        </div>

        <div className="text-center">
          <Link href="/login" className="btn-primary inline-block">
            Get Started with TheraBot
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            TheraBot is not a replacement for professional mental health services.
            If you're experiencing a crisis, please seek help from a qualified professional.
          </p>
        </div>
      </div>
    </div>
  );
}
