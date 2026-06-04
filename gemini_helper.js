const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if Gemini API is configured
function isGeminiEnabled() {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== 'PASTE_YOUR_GEMINI_API_KEY_HERE';
}

/**
 * Summarizes a list of deal headlines for a merchant into a single, cohesive sentence.
 */
async function summarizeDealsWithGemini(merchant, headlines) {
  if (!isGeminiEnabled()) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a financial deal aggregator. Summarize the following credit card offers/deals for the merchant "${merchant}" into a single concise sentence.
Be specific about the banks, card names, discounts (like 10% or Rs 1000), minimum spends, and caps if mentioned. 
Do not start with "Here is a summary" or repeat the merchant name excessively. Keep it under 25 words.

Deals:
${headlines.map((h, i) => `- ${h}`).join('\n')}

Example summary: "Get 10% instant discount up to ₹1,750 on ICICI cards and flat ₹1,000 off on Realme phones with SBI cards."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/[*#`]/g, '');
  } catch (err) {
    console.error(`[Gemini Summarizer] Failed to summarize for ${merchant}:`, err.message);
    return null;
  }
}

/**
 * Parses user transaction intent using Gemini to extract merchant, amount, category, and MCC,
 * and provides a hyper-personalized card yield recommendation tip.
 */
async function parsePromptWithGemini(userPrompt, walletCardsJson) {
  if (!isGeminiEnabled()) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const systemInstructions = `You are an expert NLP parser and yield optimizer for Indian credit cards.
Analyze the user's purchase prompt and recommend the best card from their wallet.

User Wallet and Card Rules (JSON format):
${walletCardsJson}

Instructions:
1. Parse the user's purchase intent: "${userPrompt}"
2. Extract:
   - "amount": the purchase total in INR as an integer (default to 0 if not mentioned).
   - "merchant": clean normalized merchant/brand name (e.g., 'Amazon', 'Zomato', 'BESCOM', 'government', etc.).
   - "mcc": the most appropriate 4-digit ISO 18245 MCC code. Map to:
     * "5812" (Dining/Food delivery) for Zomato, Swiggy, dining, restaurants.
     * "5310" (Online Marketplace) for Amazon, Flipkart, general e-commerce.
     * "4900" (Utilities) for electricity, gas, water, broadband, bills.
     * "9399" (Government) for taxes, stamp duties, government services.
     * "4511" (Travel/Airlines) for airline tickets.
     * "7011" (Hotels) for lodging/stays.
     * "6513" (Rent) for rent payments.
     * "6300" (Insurance) for premiums.
     * "5541" (Fuel) for petrol/diesel at gas stations.
     * "DEFAULT" if no match.
   - "category_badge": clean uppercase category name (e.g. "DINING", "ONLINE MARKETPLACE", "UTILITIES", "GOVERNMENT", etc.).
3. Formulate a personalized recommendation "personalized_tip":
   - Identify the highest-yielding card in their wallet for this transaction (by looking at the rules).
   - Calculate their expected savings (e.g., amount * base_reward_percentage * point_to_inr_valuation).
   - Warn them about any caps or exclusions (e.g. "SBI Cashback earns 5% but has a 0% utility exclusion", "Axis Ace yields 5% on utilities but capped at ₹500/mo").
   - Suggest action steps (e.g. "Pay via Google Pay to get the 5% yield", "Prime account needed for 5% APay yield").
   - If they have no cards in their wallet, recommend adding Infinia or SBI Cashback to maximize rewards.
   - Keep the tone highly intelligent, professional, and clear.

You must respond with a single valid JSON object matching this structure:
{
  "amount": number,
  "merchant": "string",
  "mcc": "string",
  "category_badge": "string",
  "personalized_tip": "string"
}
`;

    const result = await model.generateContent(systemInstructions);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (err) {
    console.error('[Gemini Prompt Parser] Failed to parse prompt:', err.message);
    return null;
  }
}

/**
 * Analyzes the user's financial profile and wallet to generate a detailed optimization audit report.
 */
async function generateWalletAuditWithGemini(profile, walletCards, recommendedUpgrades) {
  if (!isGeminiEnabled()) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a world-class AI financial planner and credit card optimization expert for Indian cards.
Analyze this user's profile and current wallet, and write a hyper-personalized audit summary.

User Profile:
- Age: ${profile.age}
- Annual Income: ₹${profile.annual_income_inr}
- Reward Goal: ${profile.reward_goal}
- Monthly Category Spends (INR):
  * Dining: ₹${profile.spend_dining_inr}
  * Grocery: ₹${profile.spend_grocery_inr}
  * Shopping: ₹${profile.spend_shopping_inr}
  * Utilities: ₹${profile.spend_utilities_inr}
  * Travel: ₹${profile.spend_travel_inr}
  * Fuel: ₹${profile.spend_fuel_inr}
  * Insurance: ₹${profile.spend_insurance_inr}
  * Rent: ₹${profile.spend_rent_inr}
  * Others: ₹${profile.spend_others_inr}

Current Wallet Cards:
${walletCards.map(c => `- ${c.card_name} (${c.card_type} on ${c.card_network})`).join('\n')}

Top Recommended Missing Cards (Calculated mathematically):
${recommendedUpgrades.map(r => `- ${r.card_name} (Increases reward by ₹${Math.round(r.annual_savings_inr)}/yr, target spends: ${r.target_categories.join(', ')})`).join('\n')}

Task:
Write a highly professional, direct, and actionable 3-bullet analysis advising the user on how to restructure their card spends.
Highlight their biggest reward leaks (e.g. spending ₹30,000 on rent with no high-yield card, or online shopping without SBI Cashback), and tell them how to use their current cards more effectively.
Keep it concise, under 120 words total. Do not use generic filler words. Use standard Markdown bullets.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error('[Gemini Auditor] Failed to generate wallet audit:', err.message);
    return null;
  }
}

module.exports = {
  isGeminiEnabled,
  summarizeDealsWithGemini,
  parsePromptWithGemini,
  generateWalletAuditWithGemini
};
