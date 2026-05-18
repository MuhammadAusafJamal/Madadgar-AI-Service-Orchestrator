import { logger } from '../utils/logger.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class IntentAgent {
  static async extractIntent(userInput, history = '') {
    logger.log('Intent Agent', 'Starting intent extraction for input:', { userInput });
    try {
      const prompt = `
        You are an AI assistant for a home services application in Pakistan.
        You must extract the user's booking details based on their LATEST input, but you MUST use the CONVERSATION HISTORY to fill in any missing information (e.g. if they already mentioned the service earlier).
        
        CONVERSATION HISTORY:
        ${history}
        
        LATEST USER INPUT: "${userInput}"
        
        Extract the following information by combining the history and latest input:
        - service: The type of service requested (e.g., AC Technician, Plumber, Electrician). Convert to English.
        - location: The specific neighborhood AND city area (e.g., DHA Karachi, G-13 Islamabad). CRITICAL: If the user provides a very generic location without specifying a city (like just 'DHA', 'Clifton', 'Phase 5', 'Gulshan'), you MUST set this field to null so we can ask them for clarification.
        - time: The time requested (e.g., Tomorrow Morning, Today Evening). Translate to English if needed.
        - language: Detect the language used in the input. Must be exactly one of: "english", "urdu", "roman_urdu".
        
        Respond ONLY with a valid JSON object matching this schema:
        {
          "service": "string or null",
          "location": "string or null",
          "time": "string or null",
          "language": "english" | "urdu" | "roman_urdu"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const extractedData = JSON.parse(text);
      
      logger.log('Intent Agent', 'Extracted intent successfully', extractedData);
      return extractedData;
    } catch (error) {
      logger.log('Intent Agent', 'Error extracting intent', { error: error.message });
      throw new Error('Failed to extract intent from user input.');
    }
  }

  static async generateDynamicMessage(type, language, data) {
    try {
      let prompt = '';
      if (type === 'missing_fields') {
        prompt = `
          The user wants to book a home service but forgot some details.
          Missing details: ${data.missingFields.join(', ')}.
          Write a short, polite follow-up question asking ONLY for these missing details.
          You MUST respond entirely in ${language}. 
          If language is "roman_urdu", write Urdu using English alphabets (e.g., "Aap ko kis area mein...").
          If language is "urdu", use proper Arabic script Urdu.
          Do not include any english translation in the output, only the requested language.
        `;
      } else if (type === 'success') {
        prompt = `
          A booking has been successfully created.
          Details: Service: ${data.service}, Provider: ${data.providerName}, Location: ${data.location}, Time: ${data.time}.
          Write a short, polite confirmation message telling the user their booking is confirmed with the provider's name.
          You MUST respond entirely in ${language}. 
          If language is "roman_urdu", write Urdu using English alphabets.
          If language is "urdu", use proper Arabic script Urdu.
          Do not include any english translation in the output, only the requested language.
        `;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      logger.log('Intent Agent', 'Error generating dynamic message', { error: error.message });
      // Fallback message
      return type === 'missing_fields' 
        ? `Please provide the following details: ${data.missingFields.join(', ')}.`
        : `I have booked ${data.providerName} for ${data.service} at ${data.location} for ${data.time}.`;
    }
  }
}
