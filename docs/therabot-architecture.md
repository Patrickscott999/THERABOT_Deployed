# 🏗️ Therabot System Architecture (Emotionally Intelligent AI)

## Core Features
- Emotional check-ins (user-initiated)
- Personalized chatbot identity (Supabase OAuth name)
- Mentorship advice on demand
- Coping tools (affirmations, breathing, reflection prompts)
- Emotional intelligence with structured response format
- Follow-up question suggestions

## Architecture Layers

### 1. Frontend (Windsurf)
- Chat interface
- Welcome screen
- Dynamic bot name ("Hi, I’m [user name]")

### 2. Backend Logic
- OpenAI GPT API with dynamic prompt injection
- Structured outputs for consistent response format (using JSON schema)
- Emotion detection integrated into response structure
- Coping strategy responses (AI-generated based on emotional context)
- Follow-up question suggestions to maintain conversation flow

### 3. Auth Layer
- Supabase OAuth login
- Fetch `user_metadata.full_name`
- Use first name as bot identity

## Flow Example:
1. User logs in → name fetched from Supabase
2. User sends a message → GPT receives name & context in prompt
3. GPT generates structured response with emotion analysis and relevant coping strategies
4. UI renders the response components including optional coping tools and follow-up questions

## Structured Response Format

TheraBot uses OpenAI's structured output capability to ensure consistent, well-formatted responses that maintain emotional intelligence. Each response contains:

### Response Schema
```typescript
{
  // Main response message to show the user
  message: string; 
  
  // Emotion detected from user's message
  emotionDetected: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'overwhelmed' | 'confused';
  
  // Suggested coping strategy based on emotional state
  suggestedCopingStrategy: {
    // Types of coping strategies
    type: 'breathing_exercise' | 'affirmation' | 'reflection' | 'none';
    
    // For breathing exercises
    description?: string;
    steps?: string[];
    
    // For affirmations
    text?: string;
    
    // For reflections
    prompt?: string;
    
    // If no strategy suggested
    reason?: string;
  };
  
  // Follow-up questions to encourage conversation
  followUpQuestions: string[];
  
  // Assessment of emotional severity
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

### Integration Points
- **OpenAI Client**: Uses Zod schema to define the structure and validate responses
- **API Layer**: Processes the structured format and forwards it to the frontend
- **Chat UI**: Renders different components based on the response structure
- **Message Component**: Conditionally displays coping strategies and follow-up questions
