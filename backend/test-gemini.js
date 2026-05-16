import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello',
    });
    console.log('Type of response.text:', typeof response.text);
    console.log('Value:', typeof response.text === 'function' ? response.text() : response.text);
  } catch (error) {
    console.error('Error:', error);
  }
}
run();
