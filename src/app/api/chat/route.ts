import { NextResponse } from 'next/server';
import { generateChatResponse, StructuredResponse } from '../../../lib/openai';

export async function POST(req: Request) {
  try {
    const { messages, userName } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // Log the received user name
    console.log('API route received userName:', userName);
    
    // Default to 'Friend' only if userName is explicitly undefined, null, or empty string
    const userNameToUse = userName && userName.trim() ? userName : 'Friend';
    console.log('Using name for OpenAI call:', userNameToUse);
    
    // Get the structured response from OpenAI
    const structuredResponse: StructuredResponse = await generateChatResponse(messages, userNameToUse);

    return NextResponse.json({
      response: {
        // The structured format provides more data that the frontend can use
        message: structuredResponse.message,
        emotionDetected: structuredResponse.emotionDetected,
        suggestedCopingStrategy: structuredResponse.suggestedCopingStrategy,
        followUpQuestions: structuredResponse.followUpQuestions,
        severity: structuredResponse.severity,
        // Include the full structured response for advanced features
        fullResponse: structuredResponse
      }
    });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'Failed to process your message' },
      { status: 500 }
    );
  }
}
