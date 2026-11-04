import { Router, Response } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { optionalAuth } from '../middleware/auth';
import { chatbotLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import { AuthenticatedRequest, Property } from '../types';

const router = Router();

const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (geminiApiKey && geminiApiKey !== 'your-gemini-api-key') {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

const chatbotMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000),
  session_token: z.string().optional(),
});

/**
 * Helper to extract budget numbers and keywords from user query
 */
function parseQueryFilters(text: string): {
  maxPrice?: number;
  minPrice?: number;
  locationKeyword?: string;
  category?: string;
} {
  const lower = text.toLowerCase();
  const filters: {
    maxPrice?: number;
    minPrice?: number;
    locationKeyword?: string;
    category?: string;
  } = {};

  // Detect lakh / crore patterns
  // e.g. "under 50 lakh", "under 50 lakhs", "budget 25 lac", "below 1 crore", "under 1.5 cr"
  const croreMatch = lower.match(/(?:under|below|less than|budget|within)\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/);
  if (croreMatch) {
    filters.maxPrice = parseFloat(croreMatch[1]) * 10000000;
  } else {
    const lakhMatch = lower.match(/(?:under|below|less than|budget|within|up to)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/);
    if (lakhMatch) {
      filters.maxPrice = parseFloat(lakhMatch[1]) * 100000;
    }
  }

  // Detect category keywords
  if (lower.includes('agricultural') || lower.includes('farm') || lower.includes('farming')) {
    filters.category = 'agricultural_land';
  } else if (lower.includes('commercial') || lower.includes('shop') || lower.includes('office') || lower.includes('showroom')) {
    filters.category = 'commercial';
  } else if (lower.includes('residential') || lower.includes('plot') || lower.includes('house') || lower.includes('villa')) {
    filters.category = 'residential_plot';
  }

  // Detect popular Indian city names
  const cities = [
    'delhi',
    'noida',
    'gurgaon',
    'mumbai',
    'pune',
    'bengaluru',
    'bangalore',
    'hyderabad',
    'chennai',
    'jaipur',
    'lucknow',
    'ahmedabad',
    'kolkata',
    'chandigarh',
    'indore',
    'bhopal',
  ];

  for (const city of cities) {
    if (lower.includes(city)) {
      filters.locationKeyword = city === 'bangalore' ? 'bengaluru' : city;
      break;
    }
  }

  return filters;
}

/**
 * Searches approved properties matching extracted user criteria
 */
async function queryMatchingProperties(filters: {
  maxPrice?: number;
  minPrice?: number;
  locationKeyword?: string;
  category?: string;
}): Promise<Property[]> {
  try {
    let query = supabaseAdmin
      .from('properties')
      .select(
        `
        id,
        title,
        slug,
        price,
        area,
        area_unit,
        category,
        property_type,
        address,
        city:cities(name),
        state:states(name),
        images:property_images(url, is_cover)
      `
      )
      .eq('status', 'approved')
      .limit(5);

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.locationKeyword) {
      // Find matching city or locality
      const { data: matchedCities } = await supabaseAdmin
        .from('cities')
        .select('id')
        .ilike('name', `%${filters.locationKeyword}%`);

      if (matchedCities && matchedCities.length > 0) {
        query = query.in('city_id', matchedCities.map((c) => c.id));
      }
    }

    const { data } = await query.order('is_featured', { ascending: false }).order('price', { ascending: true });
    return (data as unknown as Property[]) || [];
  } catch (error) {
    console.error('Error querying properties for chatbot:', error);
    return [];
  }
}

/**
 * Fallback FAQ matcher when Gemini is not configured or offline
 */
async function matchFaq(userMessage: string): Promise<string | null> {
  try {
    const { data: faqs } = await supabaseAdmin
      .from('faqs')
      .select('question, answer')
      .eq('is_active', true)
      .eq('is_chatbot_knowledge', true);

    if (!faqs || faqs.length === 0) return null;

    const lowerMessage = userMessage.toLowerCase();
    let bestMatch: string | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      const qLower = faq.question.toLowerCase();
      const words = qLower.split(/\s+/).filter((w: string) => w.length > 3);
      let matchCount = 0;

      for (const word of words) {
        if (lowerMessage.includes(word)) {
          matchCount++;
        }
      }

      if (matchCount > highestScore && matchCount >= 2) {
        highestScore = matchCount;
        bestMatch = faq.answer;
      }
    }

    return bestMatch;
  } catch (error) {
    return null;
  }
}

/**
 * POST /api/chatbot/message
 * Interact with Sasta Plots AI Chatbot
 */
router.post(
  '/message',
  chatbotLimiter,
  optionalAuth,
  validateBody(chatbotMessageSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { message } = req.body;
      const sessionToken = req.body.session_token || uuidv4();
      const userId = req.user?.id || null;

      // 1. Parse intent, budget, and location from user's message
      const filters = parseQueryFilters(message);

      // 2. Query properties database
      const matchingProperties = await queryMatchingProperties(filters);

      let botResponse = '';

      // 3. Generate response using Gemini AI if configured
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

          // Fetch knowledge FAQs
          const { data: knowledgeFaqs } = await supabaseAdmin
            .from('faqs')
            .select('question, answer')
            .eq('is_active', true)
            .eq('is_chatbot_knowledge', true)
            .limit(10);

          const faqContext = (knowledgeFaqs || [])
            .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
            .join('\n\n');

          const propertyContext = matchingProperties
            .map(
              (p: any) =>
                `- "${p.title}" | Price: ₹${p.price.toLocaleString('en-IN')} | Area: ${p.area} ${p.area_unit} | Location: ${p.city?.name || 'India'} | Link: /properties/${p.slug}`
            )
            .join('\n');

          const systemPrompt = `
You are the helpful, professional real estate assistant for "Sasta Plots" (a premier marketplace for plots, agricultural land, and properties in India).
Keep your responses friendly, concise, and informative.

Available Platform Knowledge / FAQs:
${faqContext}

Matching Properties Currently in our Database:
${propertyContext || 'No specific matching properties found for this exact filter right now, but buyers can browse all listings on the website.'}

Instructions:
1. If the user asks about properties in a specific budget or location, present the matching properties clearly with their prices and area.
2. If the user asks general platform questions (e.g. how to list a property, verification, contact sellers), use the FAQ knowledge.
3. Always invite them to explore more on Sasta Plots or contact sellers through the listing pages.
4. Keep answers under 3-4 short paragraphs.
          `;

          const result = await model.generateContent([
            { text: systemPrompt },
            { text: `User: ${message}` },
          ]);

          botResponse = result.response.text();
        } catch (geminiError: any) {
          console.warn('Gemini API error, falling back to FAQ engine:', geminiError.message);
        }
      }

      // 4. Graceful Fallback if Gemini is not configured or failed
      if (!botResponse) {
        const faqAnswer = await matchFaq(message);

        if (faqAnswer) {
          botResponse = faqAnswer;
        } else if (matchingProperties.length > 0) {
          botResponse = `Here are some properties on Sasta Plots matching your query:\n\n${matchingProperties
            .map(
              (p: any) =>
                `• **${p.title}** - ₹${p.price.toLocaleString('en-IN')} (${p.area} ${p.area_unit}) in ${p.city?.name || 'India'}`
            )
            .join('\n')}\n\nYou can click on any property to view details, photos, and contact the seller!`;
        } else {
          botResponse =
            "Welcome to Sasta Plots! I can help you find verified plots, agricultural land, and residential properties across India within your budget. You can ask me things like 'Show me plots in Jaipur under 30 lakhs' or 'How do I post a property?'.";
        }
      }

      // 5. Asynchronously persist session message in chatbot_sessions
      supabaseAdmin
        .from('chatbot_sessions')
        .upsert(
          {
            session_token: sessionToken,
            user_id: userId,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'session_token' }
        )
        .then();

      res.json({
        success: true,
        data: {
          response: botResponse,
          properties: matchingProperties,
          session_token: sessionToken,
        },
      });
    } catch (error: any) {
      console.error('Chatbot message exception:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message.',
      });
    }
  }
);

export default router;
