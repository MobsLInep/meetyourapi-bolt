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
            context + prompt,
          ];
        } else {
          parts = [context + prompt];
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