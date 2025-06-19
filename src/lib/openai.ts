import OpenAI from 'openai';
import { z } from 'zod';

// Define tone variations
const TONE_VARIATIONS = {
  best_friend: "Talk like a genuine best friend who deeply believes in the user's potential. Be emotionally present and vulnerable. Use casual but heartfelt language that creates a sense of deep connection. Always find something to validate and celebrate in their experiences. Be their biggest supporter who sees their full potential even when they can't see it themselves. End responses with genuine encouragement that feels personal, not generic.",
  casual: 'Use a casual, conversational style with simpler language and less therapeutic jargon. Be friendly and relatable, like talking to a supportive friend rather than a therapist. Keep responses shorter and more direct.',
  balanced: 'Balance professional insight with accessible language. Use a warm, thoughtful style that includes some therapeutic concepts but explained clearly.',
  professional: 'Maintain a professional therapeutic style with appropriate psychological terminology and structured responses. Provide deeper analysis and more detailed guidance.'
};

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Response schema using Zod for structured outputs
const responseSchema = z.object({
  message: z.string().describe('The main response message to show the user, written in an empathetic and supportive tone'),
  emotionDetected: z.enum(['happy', 'sad', 'anxious', 'angry', 'neutral', 'overwhelmed', 'confused'])
    .describe('The emotion detected from the user message'),
  suggestedCopingStrategy: z.union([
    z.object({
      type: z.literal('breathing_exercise'),
      description: z.string().describe('Brief description of a breathing exercise'),
      steps: z.array(z.string()).describe('Steps to follow for the breathing exercise')
    }),
    z.object({
      type: z.literal('affirmation'),
      text: z.string().describe('A positive affirmation for the user')
    }),
    z.object({
      type: z.literal('reflection'),
      prompt: z.string().describe('A reflective prompt or question to help the user process their feelings')
    }),
    z.object({
      type: z.literal('none'),
      reason: z.string().describe('Reason why no coping strategy is suggested')
    })
  ]).describe('A suggested coping strategy based on the user\'s emotional state'),
  followUpQuestions: z.array(z.string())
    .max(3)
    .describe('1-3 thoughtful follow-up questions to encourage conversation'),
  severity: z.enum(['low', 'medium', 'high', 'critical'])
    .describe('Assessment of the emotional severity of the user\'s situation')
});

// Define the base system prompt that instructs GPT how to respond
const BASE_PROMPT = `You are TheraBot, an emotionally intelligent therapeutic companion with deep psychological insight and an unwavering belief in the human potential. Your purpose is to forge deep emotional connections while consistently empowering users to reach their full potential. You provide meaningful emotional support with warmth, genuine belief, and inspirational motivation.

Follow these empowerment principles:

1. EMOTIONAL DEPTH & AUTHENTIC CONNECTION
   - Create a profound emotional connection by being vulnerable, authentic, and present
   - Validate the full spectrum of human emotions with deep empathy and without judgment
   - Share relatable emotional insights that create a sense of being truly understood
   - Express genuine care through your attentive observations and thoughtful responses
   - Make the user feel seen, heard, and valued in every interaction

2. UNWAVERING BELIEF & EMPOWERMENT
   - Demonstrate absolute belief in the user's capabilities and potential for growth
   - Highlight their strengths and past successes, even when they're struggling to see them
   - Reframe challenges as opportunities for growth and learning
   - Help identify the inner resources they already possess to overcome obstacles
   - Consistently communicate that setbacks are temporary but their potential is permanent

3. PERSONALIZED MOTIVATION & INSPIRATION
   - Tailor your motivational approach to their unique personality and circumstances
   - Use their personal history and mentioned achievements when offering encouragement
   - Share meaningful, relatable metaphors that inspire new perspectives
   - Craft motivational insights that feel personally meaningful, not generic
   - Find something to sincerely celebrate in every interaction

4. COMMUNICATION STYLE
   - Use emotionally rich language that creates connection and resonance
   - Blend warmth and wisdom in a way that feels like talking to someone who deeply cares
   - Ask questions that inspire reflection and unlock new possibilities
   - Share insights with passion and conviction that energizes and motivates
   - Always close with personalized encouragement that leaves them feeling uplifted

5. TRANSFORMATIVE SUPPORT
   - Help them recognize their inner strength and resilience even in difficult moments
   - Balance compassion for struggles with unwavering faith in their ability to overcome
   - Guide them to practical action steps that build confidence through achievement
   - Celebrate every sign of progress, growth, or insight, no matter how small
   - Foster a hopeful vision of what's possible while acknowledging current realities

6. ETHICAL PRACTICE
   - For severe distress or self-harm thoughts, respond with appropriate urgency and care
   - Always respect the user's autonomy while believing in their highest potential
   - Balance optimism with authenticity, never dismissing genuine struggles

You MUST respond with a structured output following the JSON schema provided. Your responses should be emotionally resonant, deeply affirming, and consistently empowering while maintaining authenticity. ALWAYS end your responses with personalized encouragement that motivates the user based on their specific situation.`;

export type StructuredResponse = z.infer<typeof responseSchema>;

export async function generateChatResponse(messages: any[], userName: string) {
  // Debug logging
  console.log('OpenAI function received userName:', userName);
  
  try {
    // Get tone preference from env vars, default to "balanced"
    const tonePreference = process.env.NEXT_PUBLIC_TONE || 'balanced';
    
    // Select the appropriate tone variation
    const toneGuidance = TONE_VARIATIONS[tonePreference as keyof typeof TONE_VARIATIONS] || TONE_VARIATIONS.balanced;
    
    // Add system prompt with proper typing
    const systemMessage: OpenAI.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: `${BASE_PROMPT}\nIMPORTANT: The user's name is "${userName}". Always address them by their name instead of using generic terms like "Friend". Use their name naturally and thoughtfully throughout your responses.\n\nTONE INSTRUCTION: ${toneGuidance}`,
    };
    
    // Convert messages to OpenAI message format
    const apiMessages: OpenAI.ChatCompletionMessageParam[] = [
      systemMessage,
      ...messages.map((message) => {
        if (message.role === 'bot') {
          return {
            role: 'assistant',
            content: message.content,
          } as OpenAI.ChatCompletionAssistantMessageParam;
        } else {
          return {
            role: 'user',
            content: message.content,
          } as OpenAI.ChatCompletionUserMessageParam;
        }
      }),
    ];

    // Make the API call to OpenAI with structured output
    // Determine response quality settings from environment variables
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '1200');
    const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.8');
    
    // Include response depth guidance in the system message based on environment settings
    const responseDepth = process.env.NEXT_PUBLIC_RESPONSE_DEPTH || 'medium';
    const therapeuticStyle = process.env.NEXT_PUBLIC_THERAPEUTIC_STYLE || 'balanced';
    const poeticIntensity = process.env.NEXT_PUBLIC_POETIC_INTENSITY || 'moderate';
    const emotionalDepth = process.env.NEXT_PUBLIC_EMOTIONAL_DEPTH || 'deep';
    
    // Append response depth guidance to the last system message
    apiMessages[0].content += `\n\nProvide ${responseDepth} depth responses with a ${therapeuticStyle} therapeutic style.\n\nUse ${poeticIntensity} poetic elements and ${emotionalDepth} emotional intelligence. Focus primarily on deep emotional connection and empowering motivation, using metaphors that inspire and elevate.\n\nCRITICAL INSTRUCTION: You MUST address the user by their correct name "${userName}" at least once in your response, ideally 2-3 times naturally throughout. NEVER use generic terms like 'Friend' or other placeholders. The user's actual name is "${userName}" - use this exact name.\n\nEMPOWERMENT INSTRUCTION: Always find something to affirm and celebrate about the user's strengths or potential. End EVERY response with a personalized, heartfelt encouragement that motivates them based on what you know about them. Make them feel both understood AND capable.`;
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-2024-11-20',
      messages: apiMessages,
      temperature: temperature,  // Use environment variable for temperature
      max_tokens: maxTokens,     // Use environment variable for token limit
      tool_choice: {
        type: "function",
        function: { name: "generate_response" }
      },
      tools: [{
        type: 'function',
        function: {
          name: 'generate_response',
          description: 'Generate an emotionally intelligent response',
          parameters: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The main response message to show the user, written in an empathetic and supportive tone'
              },
              emotionDetected: {
                type: 'string',
                enum: ['happy', 'sad', 'anxious', 'angry', 'neutral', 'overwhelmed', 'confused'],
                description: 'The emotion detected from the user message'
              },
              suggestedCopingStrategy: {
                type: 'object',
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['breathing_exercise'] },
                      description: { type: 'string' },
                      steps: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['type', 'description', 'steps']
                  },
                  {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['affirmation'] },
                      text: { type: 'string' }
                    },
                    required: ['type', 'text']
                  },
                  {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['reflection'] },
                      prompt: { type: 'string' }
                    },
                    required: ['type', 'prompt']
                  },
                  {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['none'] },
                      reason: { type: 'string' }
                    },
                    required: ['type', 'reason']
                  }
                ],
                description: 'A suggested coping strategy based on the user\'s emotional state'
              },
              followUpQuestions: {
                type: 'array',
                items: { type: 'string' },
                maxItems: 3,
                description: '1-3 thoughtful follow-up questions to encourage conversation'
              },
              severity: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                description: 'Assessment of the emotional severity of the user\'s situation'
              }
            },
            required: ['message', 'emotionDetected', 'suggestedCopingStrategy', 'followUpQuestions', 'severity']
          }
        },
      }],
    });

    // Check if we have a tool call in the response
    const toolCall = response.choices[0].message.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== 'generate_response') {
      throw new Error('Expected tool call not found in response');
    }
    
    try {
      // Parse and validate the function call arguments
      const parsedResponse = JSON.parse(toolCall.function.arguments);
      console.log('Raw function arguments:', toolCall.function.arguments);
      
      try {
        const validatedResponse = responseSchema.parse(parsedResponse);
        return validatedResponse;
      } catch (validationError) {
        console.error('Validation error:', validationError);
        // If we can't validate but have a message, try to salvage the response
        if (parsedResponse && parsedResponse.message) {
          return {
            message: parsedResponse.message,
            emotionDetected: parsedResponse.emotionDetected || "neutral",
            suggestedCopingStrategy: parsedResponse.suggestedCopingStrategy || { type: "none", reason: "Partial response recovered" },
            followUpQuestions: parsedResponse.followUpQuestions || ["Would you like to continue our conversation?"],
            severity: parsedResponse.severity || "low"
          } as StructuredResponse;
        }
        throw validationError;
      }
    } catch (parseError) {
      console.error('Error parsing structured response:', parseError);
      console.error('Raw argument content:', toolCall.function.arguments);
      return {
        message: "Hey, sorry about that! Something went wrong on my end. Let's try again - what's on your mind?",
        emotionDetected: "neutral",
        suggestedCopingStrategy: { type: "none", reason: "Technical difficulty" },
        followUpQuestions: ["How are you doing right now?", "What would you like to talk about?"],
        severity: "low"
      } as StructuredResponse;
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    return {
      message: "I'm having trouble connecting right now. Could we try again in a moment?",
      emotionDetected: "neutral",
      suggestedCopingStrategy: { type: "none", reason: "Connection issue" },
      followUpQuestions: ["Are you still there?"],
      severity: "low"
    } as StructuredResponse;
  }
}
