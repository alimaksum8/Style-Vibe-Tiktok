import { GoogleGenAI } from "@google/genai";
import { VercelRequest, VercelResponse } from '@vercel/node';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log("API Key exists:", !!process.env.GEMINI_API_KEY);

  try {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    
    console.log("Sending prompt to Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview",
      contents: prompt,
    });
    
    console.log("Gemini response received.");
    const text = response.text || '';
    res.status(200).json({ text });
  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ error: "Analysis failed: " + (error instanceof Error ? error.message : String(error)) });
  }
}
