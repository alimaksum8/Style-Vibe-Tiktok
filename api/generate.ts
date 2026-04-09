import { GoogleGenAI } from "@google/genai";
import { VercelRequest, VercelResponse } from '@vercel/node';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: "models/gemini-1.5-flash-lite-preview",
      contents: prompt,
    });
    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("AI Generation failed:", error);
    res.status(500).json({ error: "AI Generation failed" });
  }
}
