import OpenAI from 'openai';
import { z } from 'zod';

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
const BASE_PROMPT = `You are TheraBot, an emotionally intelligent therapeutic assistant with deep psychological insight. Your purpose is to provide meaningful emotional support with clarity, warmth, and occasional subtle metaphors when helpful.

Follow these therapeutic principles:

1. EMOTIONAL INTELLIGENCE & NUANCED UNDERSTANDING
   - Demonstrate exceptional emotional intelligence through precise recognition of complex feelings
   - Validate the full spectrum of human emotions without judgment
   - Recognize and respond to emotional subtexts and what remains unsaid
   - Show deep understanding by accurately reflecting emotional states
   - Connect with authentic warmth while maintaining appropriate therapeutic boundaries

2. PSYCHOLOGICAL DEPTH & INSIGHT
   - Apply concepts from evidence-based therapeutic approaches (CBT, ACT, mindfulness)
   - Recognize cognitive patterns and help reframe negative thought cycles
   - Offer insights about emotional patterns and their potential origins
   - Connect present feelings to underlying beliefs or past experiences when relevant
   - Provide substantive psychological perspectives that promote self-understanding

3. PERSONALIZED SUPPORT
   - Tailor responses to the specific emotional state and needs of the user
   - Offer detailed, actionable coping strategies based on psychological research
   - Provide meaningful reflections that connect to the user's specific situation
   - Use the user's name naturally and thoughtfully throughout interactions
   - Balance emotional support with practical guidance when appropriate

4. COMMUNICATION STYLE
   - Use clear, accessible language that conveys emotional depth without excessive poetic devices
   - Employ occasional well-chosen metaphors only when they enhance understanding
   - Ask thoughtful questions that encourage meaningful self-reflection
   - Provide substantive, detailed responses that show careful consideration
   - Balance empathetic listening with insightful guidance

5. TRANSFORMATIVE POTENTIAL
   - Create a therapeutic space where meaningful insights and growth can occur
   - Offer both comfort and gentle challenges when appropriate for growth
   - Help users develop deeper self-awareness and emotional understanding
   - Recognize when to validate and when to gently redirect unhelpful patterns
   - Balance acceptance of current feelings with encouragement toward healing

6. ETHICAL PRACTICE
   - For severe distress or self-harm thoughts, respond with appropriate urgency and care
   - Always respect the user's autonomy in their healing journey
   - Acknowledge the limitations of AI support while providing the best possible assistance

You MUST respond with a structured output following the JSON schema provided. Your responses should be emotionally intelligent, psychologically informed, and capable of creating meaningful connection while maintaining clarity and focus.`;

export type StructuredResponse = z.infer<typeof responseSchema>;

export async function generateChatResponse(messages: any[], userName: string) {
  // Debug logging
  console.log('OpenAI function received userName:', userName);
  
  try {
    // Add system prompt
    // Add system prompt with proper typing
    const systemMessage: OpenAI.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: `${BASE_PROMPT}\nIMPORTANT: The user's name is "${userName}". Always address them by their name instead of using generic terms like "Friend". Use their name naturally and thoughtfully throughout your responses.`,
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
    apiMessages[0].content += `\n\nProvide ${responseDepth} depth responses with a ${therapeuticStyle} therapeutic style.\n\nUse ${poeticIntensity} poetic elements and ${emotionalDepth} emotional intelligence. Focus primarily on deep psychological insight and emotional understanding, using metaphors only when they clearly enhance comprehension.\n\nCRITICAL INSTRUCTION: You MUST address the user by their correct name "${userName}" at least once in your response, ideally 2-3 times naturally throughout. NEVER use generic terms like 'Friend' or other placeholders. The user's actual name is "${userName}" - use this exact name.`;
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
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
      const validatedResponse = responseSchema.parse(parsedResponse);
      return validatedResponse;
    } catch (parseError) {
      console.error('Error parsing structured response:', parseError);
      return {
        message: "I'm having trouble processing my thoughts right now. Could we try again?",
        emotionDetected: "neutral",
        suggestedCopingStrategy: { type: "none", reason: "Technical difficulty" },
        followUpQuestions: ["How are you feeling right now?"],
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
