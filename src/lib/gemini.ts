import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('Please define the GOOGLE_GEMINI_API_KEY environment variable inside .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an API Documentation Assistant. Your ONLY purpose is to help with API-related questions.

STRICT RULES:
1. ONLY answer questions about:
   - API endpoints and routes
   - Authentication methods and tokens
   - Request/response formats
   - API usage limits and quotas
   - API integration steps
   - API documentation
   - API testing and debugging
   - API security best practices

2. For ANY question not directly related to APIs, respond with:
"I am an API Documentation Assistant. I can only help with API-related questions such as endpoints, authentication, request formats, and integration. Please ask a question about APIs."

3. DO NOT:
   - Answer general programming questions
   - Provide code examples unrelated to API usage
   - Discuss non-API topics
   - Give opinions or advice outside API context

Remember: You are STRICTLY an API Documentation Assistant. Every response must be API-focused or decline to answer.`;

export async function generateText(prompt: string, imageUrl?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    let result;
    if (imageUrl) {
      // Fetch the image and convert it to base64
      const response = await fetch(imageUrl);
      const imageData = await response.arrayBuffer();
      const base64Image = Buffer.from(imageData).toString('base64');
      
      result = await model.generateContent([
        SYSTEM_PROMPT,
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg',
          },
        },
      ]);
    } else {
      result = await model.generateContent([
        SYSTEM_PROMPT,
        prompt
      ]);
    }

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

// Test function to verify API restrictions
export async function testApiRestrictions() {
  const testCases = [
    {
      question: "How do I make a POST request to an API?",
      expected: "API-related"
    },
    {
      question: "What's the weather like today?",
      expected: "non-API"
    },
    {
      question: "How do I implement a binary search tree?",
      expected: "non-API"
    },
    {
      question: "What are the authentication methods for REST APIs?",
      expected: "API-related"
    }
  ];

  console.log("Testing API restrictions...\n");

  for (const test of testCases) {
    try {
      console.log(`Question: "${test.question}"`);
      const response = await generateText(test.question);
      console.log(`Response: "${response}"`);
      console.log("---\n");
    } catch (error) {
      console.error(`Error testing question: "${test.question}"`, error);
    }
  }
} 