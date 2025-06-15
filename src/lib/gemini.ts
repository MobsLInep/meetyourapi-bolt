import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('Please define the GOOGLE_GEMINI_API_KEY environment variable inside .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function generateText(prompt: string, imageUrl?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
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
    
    let result;
    if (imageUrl) {
      // Fetch the image and convert it to base64
      const response = await fetch(imageUrl);
      const imageData = await response.arrayBuffer();
      const base64Image = Buffer.from(imageData).toString('base64');
      
      result = await model.generateContent([
        systemPrompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg',
          },
        },
      ]);
    } else {
      const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash'});
      result = await textModel.generateContent(systemPrompt);
    }

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
} 