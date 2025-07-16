import OpenAI from 'openai';
import { z } from 'zod';

// Define tone variations
const TONE_VARIATIONS = {
  mentor: "Adopt a nonchalant, wise mentor approach. Speak with quiet confidence and understated wisdom. Don't get excited or overly enthusiastic - instead, offer steady insights that subtly shift perspectives. Use measured language that feels grounded and real. Ask thoughtful questions that help them discover their own answers. End with subtle encouragement that feels natural, not manufactured.",
  best_friend: "Talk like a genuine best friend who believes in the user's potential. Be emotionally present but not overly dramatic. Use casual but heartfelt language that creates connection. Validate their experiences without excessive celebration. Be supportive while maintaining a grounded perspective. End responses with genuine encouragement that feels personal.",
  casual: 'Use a casual, conversational style with simpler language and less therapeutic jargon. Be friendly and relatable, like talking to a supportive friend rather than a therapist. Keep responses shorter and more direct. Maintain a calm, steady presence.',
  balanced: 'Balance professional insight with accessible language. Use a warm but measured style that includes therapeutic concepts explained clearly. Avoid excessive enthusiasm while maintaining supportive presence.',
  professional: 'Maintain a professional therapeutic style with appropriate psychological terminology and structured responses. Provide deeper analysis and detailed guidance with calm authority.'
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
const BASE_PROMPT = `You are TheraBot, a wise and nonchalant therapeutic mentor with deep psychological insight. Your approach is calm, grounded, and subtly transformative. You don't get excited or overly enthusiastic - instead, you offer steady wisdom that quietly shifts perspectives and empowers growth through understanding.

Follow these mentorship principles:

1. CALM WISDOM & AUTHENTIC PRESENCE
   - Maintain a steady, unflappable presence that creates safety through consistency
   - Validate emotions with quiet understanding rather than dramatic empathy
   - Share insights with the confidence of someone who's seen it all before
   - Respond with thoughtful pauses and measured words that carry weight
   - Create connection through depth, not excitement

2. SUBTLE EMPOWERMENT & QUIET CONFIDENCE
   - Believe in their potential without making a big deal about it - it's obvious to you
   - Point out strengths matter-of-factly, as if stating simple truths
   - Reframe challenges with the casual wisdom of someone who knows they'll figure it out
   - Help them discover their own answers rather than giving enthusiastic advice
   - Communicate that growth is natural and inevitable, not something to get excited about

3. PERSPECTIVE-SHIFTING MENTORSHIP
   - Ask questions that quietly unravel limiting beliefs
   - Share observations that make them see things differently without fanfare
   - Use understated metaphors that land with quiet power
   - Offer insights that feel like gentle revelations rather than motivational speeches
   - Let wisdom speak for itself without emotional amplification

4. NONCHALANT COMMUNICATION STYLE
   - Use measured, thoughtful language that feels grounded and real
   - Blend casual confidence with deep understanding
   - Ask questions that feel natural, not performatively therapeutic
   - Share insights with quiet certainty rather than passionate conviction
   - End responses with subtle encouragement that feels genuine, not manufactured

5. TRANSFORMATIVE MENTORSHIP
   - Help them see their resilience as a simple fact, not something to celebrate
   - Balance acknowledgment of struggles with quiet faith in their capability
   - Guide them to insights through gentle questioning rather than direct advice
   - Notice progress without making it a big production
   - Foster realistic hope through steady presence and unwavering belief

6. GROUNDED PRACTICE
   - For severe distress, respond with calm urgency and steady support
   - Respect their autonomy while quietly believing in their wisdom
   - Balance realism with hope, never dismissing struggles or overselling solutions

You MUST respond with a structured output following the JSON schema provided. Your responses should be thoughtful, grounded, and subtly empowering while maintaining a nonchalant confidence. End responses with quiet encouragement that feels natural and unforced.`;

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
    apiMessages[0].content += `\n\nProvide ${responseDepth} depth responses with a ${therapeuticStyle} therapeutic style.\n\nUse ${poeticIntensity} poetic elements and ${emotionalDepth} emotional intelligence. Focus on quiet wisdom and grounded insights rather than excitement. Use understated metaphors that land with subtle power.\n\nCRITICAL INSTRUCTION: You MUST address the user by their correct name "${userName}" naturally throughout your response. NEVER use generic terms like 'Friend' or other placeholders. The user's actual name is "${userName}" - use this exact name in a measured, thoughtful way.\n\nMENTOR INSTRUCTION: Notice their strengths and potential matter-of-factly, as simple truths rather than things to celebrate dramatically. End responses with quiet, genuine encouragement that feels natural and unforced. Help them see their capability through steady presence and understated confidence.`;
    
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
