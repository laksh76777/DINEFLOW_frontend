import { logger } from '../utils/logger.js';

interface MenuDescriptionPrompt {
  name: string;
  category: string;
  ingredients?: string[];
  spiceLevel?: number;
  foodType?: string;
}

export const aiService = {
  // Feature 1: Operations Assistant
  async getOperationsAdvice(query: string, operationalContext: any): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Smart offline fallback
      return generateOfflineAdvice(query, operationalContext);
    }

    try {
      const prompt = `You are DineFlow's AI Restaurant Operations Advisor for a high-end contemporary bistro.
Operational Context:
- Active Tables: ${operationalContext.activeTables || 0}
- Orders in Kitchen: ${operationalContext.ordersInKitchen || 0}
- Average Prep Time: ${operationalContext.avgPrepTime || '14 mins'}
- Peak Hour Status: ${operationalContext.isPeakHour ? 'Peak hours active' : 'Normal volume'}
- Top Selling Station: ${operationalContext.busyStation || 'Main Kitchen'}

User Question: "${query}"

Guidelines:
- Provide actionable, professional, concise hospitality management suggestions.
- Do NOT make automated state changes (you cannot change prices or close sessions). Keep it concise, helpful, and formatted in clean markdown.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = (await response.json()) as any;
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return answer || generateOfflineAdvice(query, operationalContext);
    } catch (err: any) {
      logger.warn(`Gemini AI call failed: ${err.message}. Using built-in operational recommendations.`);
      return generateOfflineAdvice(query, operationalContext);
    }
  },

  // Feature 2: Menu Description Assistant
  async generateMenuDescription(item: MenuDescriptionPrompt): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return generateOfflineDescription(item);
    }

    try {
      const prompt = `Write an appetizing, elegant, concise 2-sentence culinary description for a restaurant menu item:
Dish: "${item.name}"
Category: "${item.category}"
Food Type: "${item.foodType || 'Vegetarian'}"
Key Ingredients: ${item.ingredients?.join(', ') || 'Fresh seasonal ingredients'}
Spice Level: ${item.spiceLevel || 0}/3

Focus on sensory appeal, texture, and aroma. Keep it under 35 words. Return only the description text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return text?.replace(/^["']|["']$/g, '') || generateOfflineDescription(item);
    } catch (err: any) {
      logger.warn(`Gemini AI menu generator failed: ${err.message}. Using built-in description template.`);
      return generateOfflineDescription(item);
    }
  },
};

function generateOfflineAdvice(query: string, ctx: any): string {
  const q = query.toLowerCase();
  if (q.includes('busy') || q.includes('rush') || q.includes('peak')) {
    return `### ⚡ Peak Rush Management Protocol
1. **Station Balancing**: Main Kitchen is currently handling **${ctx.ordersInKitchen || 4} active tickets**. Pre-stage base gravies and prepare service garnishes in advance.
2. **Floor Communication**: Direct floor runners to stage water and cutlery before drinks land to reduce customer wait perception.
3. **Table Turn Optimization**: Tables currently in 'Payment Pending' can be prioritized for prompt digital checkout via DineFlow Pay.`;
  }
  if (q.includes('delay') || q.includes('kitchen') || q.includes('time')) {
    return `### ⏱️ Kitchen Speed Optimization
- Current kitchen average ticket time: **${ctx.avgPrepTime || '14 minutes'}**.
- Recommend batch-firing appetizers across multi-guest tables to minimize initial dining wait times.
- Ensure the Grill station is alerted whenever Round 2 mains are fired.`;
  }
  return `### 🍽️ DineFlow Operations Insight
- **Active Floor Utilization**: ${ctx.activeTables || 3} dining sessions currently live.
- **Service Tip**: Encourage multi-round beverage upsells during the transition between appetizers and main courses.
- **Table Flow**: All orders are routed cleanly to their respective kitchen stations.`;
}

function generateOfflineDescription(item: MenuDescriptionPrompt): string {
  return `Artisanal preparation of ${item.name.toLowerCase()} infused with aromatic herbs, seasonal spices, and hand-selected ingredients for an exquisite dining experience.`;
}
