# TheraBot - Emotionally Intelligent AI Chatbot

TheraBot is an AI-powered chatbot designed to provide emotional support, mentorship, and coping tools through emotionally intelligent conversations.

## Features

- **Emotional Check-ins**: Engage with users about their current emotional state
- **Personalized Identity**: Chatbot uses the user's name (from Supabase OAuth)
- **Mentorship Advice**: Provides guidance and support on demand
- **Coping Tools**: Offers affirmations, breathing exercises, and reflection prompts

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT API with emotional intelligence prompting
- **Authentication**: Supabase OAuth

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with your API credentials (see `.env.local.example`)
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Required environment variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/lib` - Utility libraries for OpenAI and Supabase
- `/src/styles` - Global styles

## More Information

For more details about the underlying architecture and principles, see the documentation in the `/docs` folder.
