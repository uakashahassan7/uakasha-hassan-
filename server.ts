/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Server-side Gemini API client
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // AI Shopping Advisor endpoint with high thinking
  app.post('/api/advisor', async (req, res) => {
    try {
      const { prompt, productCatalog } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      if (!ai) {
        // Fallback intelligent guidance if API key is not configured in environment
        res.json({
          reply: `Thank you for asking! At BARVAKA, all our orders enjoy 100% Free Nationwide Delivery across Pakistan with Cash on Delivery (COD). For sizing, our Kurtas and Shirts follow standard Pakistani chest sizing (S: 38", M: 40", L: 42", XL: 44"). You can inspect your parcel upon delivery with our 7-day easy exchange guarantee!`,
          isFallback: true,
        });
        return;
      }

      const systemInstruction = `You are the expert Shopping & Khayr Concierge for BARVAKA (Pakistan's premier multi-category store: Quality · Fast Delivery · Trust · Khayr).
You assist customers in Pakistan with product recommendations, sizing advice for Pakistani clothes (Kurtas, Lawn Suits), fragrance notes (pure Attars, Oudh), gadget specs, gift ideas for Pakistani festivals (Eid, weddings, Ramadan, birthdays), and store policies (Cash on Delivery only, Free Delivery nationwide, open parcel trust).
Be warm, professional, culturally attuned to Pakistani shoppers, and concise. All prices are in PKR (Rs.). If recommending products, reference items from BARVAKA's catalog.`;

      // Call gemini-4-argon with ThinkingLevel.HIGH as required by platform specification
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      res.json({
        reply: response.text || 'I am delighted to help you find the best products at BARVAKA.',
      });
    } catch (err: any) {
      console.warn('Gemini 4 Argon request notice, attempting fallback model or expert response:', err?.message);
      // Fallback to gemini-3.8-flash if argon is unavailable
      if (ai) {
        try {
          const fallbackRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: req.body.prompt,
            config: {
              systemInstruction: 'You are the expert Shopping Advisor for BARVAKA e-commerce store in Pakistan.',
            },
          });
          res.json({ reply: fallbackRes.text });
          return;
        } catch (innerErr) {
          console.error('Fallback model error:', innerErr);
        }
      }

      res.json({
        reply: `At BARVAKA, we take pride in Quality, Fast Delivery, Trust, and Khayr. We deliver nationwide across Pakistan with Free Delivery and Cash on Delivery (COD). Please feel free to reach out to our WhatsApp support at 0300-8278252 for immediate personal assistance!`,
        isFallback: true,
      });
    }
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BARVAKA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
