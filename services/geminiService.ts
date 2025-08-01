
import { GoogleGenAI } from "@google/genai";
import { Gesture } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // maybe showing an error message in the UI.
  // For this project, we assume the key is always present.
  console.warn("API_KEY environment variable not set. The app will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const detectGesture = async (base64ImageData: string): Promise<Gesture | 'NONE'> => {
  if (!API_KEY) return 'NONE';

  const prompt = `Analyze the user's hand gesture in this image. The user is playing Rock, Paper, Scissors. Respond with only one of the following words based on the most prominent hand gesture you see: 'ROCK', 'PAPER', 'SCISSORS'. If you cannot clearly identify one of these three gestures, respond with 'NONE'.`;

  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ImageData,
      },
    };
    
    const textPart = {
        text: prompt
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
    });
    
    const text = response.text.trim().toUpperCase();

    if (text === 'ROCK' || text === 'PAPER' || text === 'SCISSORS') {
      return text as Gesture;
    }

    console.warn(`Gemini returned an unexpected value: ${text}`);
    return 'NONE';
  } catch (error) {
    console.error("Error detecting gesture with Gemini API:", error);
    return 'NONE';
  }
};
