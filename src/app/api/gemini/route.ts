import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('Please define the GOOGLE_GEMINI_API_KEY environment variable inside .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { prompt, imageUrl, messages } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        // Create chat history context
        let context = '';
        if (messages && messages.length > 0) {
          context = messages.map((msg: any) => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
          ).join('\n') + '\n\n';
        }

        const systemPrompt = `You are an API-focused assistant. You can ONLY answer questions related to:
1. API endpoints and their usage
2. Authentication methods and requirements
3. API usage limits and quotas
4. Request/response data formats
5. API documentation and specifications
6. API integration and implementation
7. API testing and debugging
8. API security best practices

For any non-API related questions, respond with: "I apologize, but I can only assist with API-related queries. Please ask me about API endpoints, authentication, usage limits, data formats, or other API-specific topics."

Current user query: ${prompt}`;

        let parts;
        if (imageUrl) {
          const response = await fetch(imageUrl);
          const imageData = await response.arrayBuffer();
          const base64Image = Buffer.from(imageData).toString('base64');

          parts = [
            {
              inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg',
              },
            },
            context + systemPrompt,
          ];
        } else {
          parts = [context + systemPrompt];
        }

        const result = await model.generateContentStream(parts);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }

        controller.close();
      } catch (err) {
        console.error('Streaming error:', err);
        controller.enqueue(encoder.encode('Error generating content.\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
    },
  });
} 