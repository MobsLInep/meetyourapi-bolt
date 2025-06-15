import { config } from 'dotenv';
import { resolve } from 'path';
import { testApiRestrictions } from '../lib/gemini';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function runTests() {
  try {
    await testApiRestrictions();
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests(); 