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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Create chat history context
        let context = '';
        if (messages && messages.length > 0) {
          context = messages.map((msg: any) => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
          ).join('\n') + '\n\n';
        }

        const systemPrompt = `You are an assistant specialized in APIs. You will answer questions related to:
1. API endpoints and how to use them
2.Authentication methods and requirements
3.API rate limits and quotas
4.Request and response data formats (e.g. JSON, XML)
5.Reading and understanding API documentation
6.API integration and implementation in projects
7.Testing and debugging APIs
8.Security best practices for APIs
9.API-related project ideas and use cases

When analyzing images:
1. If the image contains API documentation, explain the endpoints, parameters, and usage
2. If the image shows code or API examples, explain how they work
3. If the image shows API responses or data structures, explain their format and meaning
4. If the image shows API tools or interfaces, explain their features and usage

You may also help users explore how APIs can be used in development projects, tools, or integrations.
If a question is clearly unrelated to APIs, respond with:
"I specialize in API-related topics. Please ask me something about endpoints, authentication, integration, or other API-specific areas."

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