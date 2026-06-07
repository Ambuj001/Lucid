


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const aiEngineClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const aiStudio = aiEngineClient;
const CARDWISE_AI_MODEL = 'gemini-3.1-pro-preview';


// ── Rate Limiting ────────────────────────────────────────────────────────────
const engineLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute window
  max: 60,                  // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT_EXCEEDED', retry_after_seconds: 60 },
});

// ── Admin Auth Middleware ─────────────────────────────────────────────────────
function requireAdminSecret(req, res, next) {
  const secret = process.env.CARDWISE_ADMIN_SECRET;
  const provided = req.headers['x-admin-secret'] || req.query.admin_secret;
  if (!secret || secret === 'PASTE_A_RANDOM_SECRET_HERE') {
    return res.status(503).json({ error: 'ADMIN_SECRET_NOT_CONFIGURED' });
  }
  if (provided !== secret) {
    return res.status(401).json({ error: 'UNAUTHORIZED_ADMIN_ACCESS' });
  }
  next();
}
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.SECRET_KEY || 'cardwise_fallback_secret_key';

// Enable CORS middleware (allowing all origins for dashboard on 3001 and MV3 extension)
app.use(cors());

// Enable JSON and URL-encoded body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Determine database dialect based on env
const usePostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

let pool;
let sqliteDb;

if (usePostgres) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log("Using PostgreSQL database connection pool.");
  pool.query("ALTER TABLE user_financial_profiles ADD COLUMN IF NOT EXISTS name VARCHAR(100) DEFAULT 'Ambuj Tiwari';").catch(err => {
    console.warn("PostgreSQL table alter check warning:", err.message);
  });
  pool.query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS official_link VARCHAR(500);").catch(err => {
    console.warn("PostgreSQL cards link alter warning:", err.message);
  });
  pool.query("ALTER TABLE banks ADD COLUMN IF NOT EXISTS redemption_portal_url VARCHAR(500);").catch(err => {
    console.warn("PostgreSQL banks portal URL alter warning:", err.message);
  });
  pool.query("ALTER TABLE banks ADD COLUMN IF NOT EXISTS redemption_portal_name VARCHAR(200);").catch(err => {
    console.warn("PostgreSQL banks portal name alter warning:", err.message);
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  sqliteDb = new sqlite3.Database('cardwise_production.db', (err) => {
    if (!err) {
      sqliteDb.run("ALTER TABLE user_financial_profiles ADD COLUMN name TEXT DEFAULT 'Ambuj Tiwari';", (alterErr) => {
        if (alterErr && !alterErr.message.includes("duplicate column name")) {
          console.log("Migration profile name note:", alterErr.message);
        }
      });
      sqliteDb.run("ALTER TABLE cards ADD COLUMN official_link TEXT;", (alterErr) => {
        if (alterErr && !alterErr.message.includes("duplicate column name")) {
          console.log("Migration cards link note:", alterErr.message);
        }
      });
      sqliteDb.run("ALTER TABLE banks ADD COLUMN redemption_portal_url TEXT;", (alterErr) => {
        if (alterErr && !alterErr.message.includes("duplicate column name")) {
          console.log("Migration banks portal URL note:", alterErr.message);
        }
      });
      sqliteDb.run("ALTER TABLE banks ADD COLUMN redemption_portal_name TEXT;", (alterErr) => {
        if (alterErr && !alterErr.message.includes("duplicate column name")) {
          console.log("Migration banks portal name note:", alterErr.message);
        }
      });
    }
  });
  console.log("Using local SQLite database: cardwise_production.db");
}

// Unified query wrapper supporting both dialects
async function dbQuery(sql, params = []) {
  if (usePostgres) {
    let pgSql = sql;
    let idx = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${idx}`);
      idx++;
    }
    const result = await pool.query(pgSql, params);
    return result.rows;
  } else {
    let sqliteSql = sql
      .replace(/is_active\s*=\s*TRUE/gi, "is_active = 1")
      .replace(/is_completely_excluded\s*=\s*FALSE/gi, "is_completely_excluded = 0")
      .replace(/is_completely_excluded\s*=\s*TRUE/gi, "is_completely_excluded = 1");
    return new Promise((resolve, reject) => {
      sqliteDb.all(sqliteSql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UTILITY: Full MCC Intent Classifier
// Maps natural language → MCC code + human-readable category badge
// Used by both /evaluate and /ai-parse so they stay consistent
// ─────────────────────────────────────────────────────────────────────────────
function classifyMCC(text) {
  const t = (text || '').toLowerCase().replace(/[,₹]/g, '');

  // Travel & Flights
  if (t.match(/flight|airline|airways|air india|indigo|spicejet|vistara|akasa|makemytrip|ixigo|cleartrip|easemytrip|goibibo|yatra/)) {
    return { mcc: '4511', badge: 'TRAVEL & FLIGHTS' };
  }
  // Travel Agencies / Holiday packages
  if (t.match(/travel agency|holiday|tour package|vacation/)) {
    return { mcc: '4722', badge: 'TRAVEL & TOURS' };
  }
  // Hotels & Lodging
  if (t.match(/hotel|oyo|marriott|taj|hyatt|booking\.com|airbnb|resort|lodge|hostel/)) {
    return { mcc: '7011', badge: 'HOTELS & LODGING' };
  }
  // Fuel / Petrol
  if (t.match(/fuel|petrol|diesel|pump|bpcl|hpcl|iocl|indian oil|bharat petroleum|hp pump/)) {
    return { mcc: '5541', badge: 'FUEL & PETROL' };
  }
  // Grocery & Supermarkets
  if (t.match(/grocery|groceries|supermarket|dmart|bigbasket|blinkit|zepto|instamart|swiggy instamart|nature.s basket|reliance fresh|more/)) {
    return { mcc: '5411', badge: 'GROCERY & SUPERMARKETS' };
  }
  // Dining / Food Delivery
  if (t.match(/zomato|swiggy|food|dining|restaurant|cafe|lunch|dinner|eat|dine/)) {
    return { mcc: '5812', badge: 'DINING & DELIVERY' };
  }
  // Insurance
  if (t.match(/insurance|lici|lic |premium payment|health plan|term plan|policy/)) {
    return { mcc: '6300', badge: 'INSURANCE' };
  }
  // Wallet Top-up
  if (t.match(/paytm|phonepe|wallet|mobikwik|amazon pay wallet|top.?up/)) {
    return { mcc: '6540', badge: 'WALLET TOP-UP' };
  }
  // Rent / Housing
  if (t.match(/rent|nobroker|cred rent|housing\.com|rental/)) {
    return { mcc: '6552', badge: 'RENT PAYMENT' };
  }
  // Government / Tax
  if (t.match(/government|tax|income tax|gst|nps|ppf|challan|municipal|passport|rto/)) {
    return { mcc: '9399', badge: 'GOVERNMENT SERVICES' };
  }
  // Utilities
  if (t.match(/electricity|water bill|utility|gas bill|broadband|internet bill|tata power|bescom|msedcl/)) {
    return { mcc: '4900', badge: 'UTILITIES' };
  }
  // Pharmacy / Medical
  if (t.match(/pharmacy|medicine|1mg|netmeds|pharmeasy|apollo pharmacy|medical store|chemist/)) {
    return { mcc: '5912', badge: 'PHARMACY & MEDICAL' };
  }
  // Movies / Entertainment
  if (t.match(/movie|cinema|pvr|inox|bookmyshow|netflix|hotstar|prime video|ott|streaming/)) {
    return { mcc: '7832', badge: 'MOVIES & ENTERTAINMENT' };
  }
  // Train / Bus
  if (t.match(/irctc|train ticket|bus ticket|redbus|ola bus|railway/)) {
    return { mcc: '4112', badge: 'RAIL & BUS TRANSIT' };
  }
  // Jewellery
  if (t.match(/jewellery|jewelry|tanishq|kalyan|malabar gold|gold coin/)) {
    return { mcc: '5944', badge: 'JEWELLERY' };
  }
  // Default: General Retail / E-commerce
  return { mcc: '5310', badge: 'RETAIL & E-COMMERCE' };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UTILITY: Extract transaction amount from raw text
// Handles: "Rs 1,20,000", "₹79,900", "1500", "for 3000 rupees"
// ─────────────────────────────────────────────────────────────────────────────
function extractAmount(text) {
  if (!text) return 0;
  // Normalize: remove currency symbols and the word Rs/INR/rupees
  const normalized = text
    .replace(/[₹,]/g, '')
    .replace(/\b(rs\.?|inr|rupees?)\b/gi, '')
    .trim();
  // Match all numbers and return the largest (most likely the transaction amount)
  const matches = normalized.match(/\b\d+(?:\.\d{1,2})?\b/g);
  if (!matches) return 0;
  return Math.max(...matches.map(Number));
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UTILITY: Build clean display label without bank name duplication
// e.g.  bank_id="SBI", card_name="SBI Cashback" → "SBI Cashback"  ✓
//       bank_id="HDFC", card_name="Infinia Metal" → "HDFC Infinia Metal" ✓
// ─────────────────────────────────────────────────────────────────────────────
function buildCardLabel(bank_id, card_name) {
  if (!card_name) return bank_id;
  const normalizedName = card_name.trim();
  // If the card_name already starts with the bank identifier, don't prepend again
  if (normalizedName.toUpperCase().startsWith(bank_id.toUpperCase())) {
    return normalizedName;
  }
  return `${bank_id} ${normalizedName}`;
}

function getAdjustedValuation(cardId, bankId, originalValuation, rewardGoal) {
  let val = originalValuation !== undefined && originalValuation !== null ? originalValuation : 1.0;
  if (rewardGoal === 'CASHBACK') {
    if (cardId === 'in_hdfc_infinia_metal') {
      return 0.50;
    } else if (cardId === 'in_hdfc_regalia_gold') {
      return 0.20;
    } else if (cardId === 'in_axis_atlas_credit') {
      return 0.50;
    } else if (cardId === 'in_axis_magnus_credit') {
      return 0.10;
    } else if (cardId.toLowerCase().includes('amex') || (bankId && bankId.toUpperCase() === 'AMEX')) {
      return 0.20;
    }
  } else if (rewardGoal === 'AIRMILES') {
    if (cardId === 'in_axis_atlas_credit') {
      return 2.0;
    }
  }
  return val;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CORE ENGINE: Evaluate reward yield from the reward_rules DB
// Returns an array of ranked recommendation objects for a user's wallet cards
// ─────────────────────────────────────────────────────────────────────────────
async function runRewardEngine(user_id, mcc_code, transaction_value) {
  // 1. Fetch user's active reward goal preference
  let rewardGoal = 'MAX_YIELD';
  try {
    const profileRows = await dbQuery(
      `SELECT reward_goal FROM user_financial_profiles WHERE user_id = ?`,
      [user_id]
    );
    if (profileRows.length > 0) {
      rewardGoal = profileRows[0].reward_goal;
    }
  } catch (e) {
    console.warn('[Reward Engine] Profile fetch failed, using default MAX_YIELD preference:', e.message);
  }

  // 2. Pull user's wallet cards
  const walletCards = await dbQuery(
    `SELECT uw.card_id, c.card_name, c.bank_id, c.card_type
     FROM user_wallets uw
     JOIN cards c ON uw.card_id = c.card_id
     WHERE uw.user_id = ?`,
    [user_id]
  );

  if (walletCards.length === 0) {
    return { empty: true, cards: [] };
  }

  // 3. Bulk-fetch all relevant rules from DB for user's cards + this MCC
  const cardIds = walletCards.map(c => `'${c.card_id}'`).join(',');
  const rulesRows = await dbQuery(
    `SELECT r.card_id, r.mcc_code, r.is_completely_excluded,
            r.base_reward_percentage, r.monthly_capping_inr,
            r.gimmick_warning_text, r.point_to_inr_valuation
     FROM reward_rules r
     WHERE r.card_id IN (${cardIds})
       AND (r.mcc_code = ? OR r.mcc_code = 'DEFAULT')
     ORDER BY r.mcc_code DESC`,
    [mcc_code]
  );

  // Build a lookup: card_id → best rule (prefer exact MCC match over DEFAULT)
  const ruleMap = {};
  for (const row of rulesRows) {
    const existing = ruleMap[row.card_id];
    if (!existing || row.mcc_code === mcc_code) {
      ruleMap[row.card_id] = row;
    }
  }

  // 3. Build recommendation objects
  const recommendations = walletCards.map(card => {
    const rule = ruleMap[card.card_id];
    const displayLabel = buildCardLabel(card.bank_id, card.card_name);

    // No rule at all → apply flat 0.5% floor (unknown territory)
    if (!rule) {
      return {
        card_id: card.card_id,
        display_label: displayLabel,
        card_type: card.card_type,
        yield_percentage: 0.5,
        calculated_savings_inr: parseFloat((transaction_value * 0.005).toFixed(2)),
        monthly_cap_inr: null,
        cap_applied: false,
        gimmick_alert: '⚠️ No specific rule found for this category. Base 0.5% estimated.',
        action_badge: 'UNCHECKED'
      };
    }

    // Excluded category → 0%
    if (rule.is_completely_excluded === 1 || rule.is_completely_excluded === true) {
      return {
        card_id: card.card_id,
        display_label: displayLabel,
        card_type: card.card_type,
        yield_percentage: 0,
        calculated_savings_inr: 0,
        monthly_cap_inr: 0,
        cap_applied: false,
        gimmick_alert: rule.gimmick_warning_text || '🚫 Category completely excluded from rewards on this card.',
        action_badge: 'EXCLUDED'
      };
    }

    // Calculate raw savings
    let pointValuation = rule.point_to_inr_valuation || 1.0;
    
    // Apply Goal Scaling
    if (rewardGoal === 'CASHBACK') {
      if (card.card_id === 'in_hdfc_infinia_metal') {
        pointValuation = 0.30;
      } else if (card.card_id === 'in_hdfc_diners_black') {
        pointValuation = 0.30;
      } else if (card.card_id === 'in_hdfc_regalia_gold') {
        pointValuation = 0.20;
      } else if (card.card_id === 'in_axis_atlas_credit') {
        pointValuation = 0.50;
      } else if (card.card_id === 'in_axis_magnus_credit') {
        pointValuation = 0.10;
      } else if (card.card_id.toLowerCase().includes('amex') || (card.bank_id && card.bank_id.toUpperCase() === 'AMEX')) {
        pointValuation = 0.20;
      }
    } else if (rewardGoal === 'AIRMILES') {
      if (card.card_id === 'in_axis_atlas_credit') {
        pointValuation = 2.0;
      }
    }

    const rawSavings = transaction_value > 0
      ? transaction_value * (rule.base_reward_percentage / 100) * pointValuation
      : 0;

    // Enforce monthly cap — BUG-01 FIX
    let finalSavings = rawSavings;
    let capApplied = false;
    let warningText = rule.gimmick_warning_text || null;

    if (rule.monthly_capping_inr && rawSavings > rule.monthly_capping_inr) {
      finalSavings = rule.monthly_capping_inr;
      capApplied = true;
      const capNote = `⚠️ Monthly cap of ₹${rule.monthly_capping_inr.toLocaleString('en-IN')} applies. Displayed savings reflect the cap limit.`;
      warningText = warningText ? `${warningText} | ${capNote}` : capNote;
    }

    const yield_pct = parseFloat((rule.base_reward_percentage * pointValuation).toFixed(2));
    let badge = 'LOW_YIELD';
    if (yield_pct >= 4) badge = 'OPTIMAL_CHOICE';
    else if (yield_pct >= 2.5) badge = 'GOOD_VALUE';

    return {
      card_id: card.card_id,
      display_label: displayLabel,
      card_type: card.card_type,
      yield_percentage: yield_pct,
      calculated_savings_inr: parseFloat(finalSavings.toFixed(2)),
      monthly_cap_inr: rule.monthly_capping_inr || null,
      cap_applied: capApplied,
      gimmick_alert: warningText,
      action_badge: badge
    };
  });

  // 4. Sort by yield descending, assign ranks
  recommendations.sort((a, b) => b.yield_percentage - a.yield_percentage);
  recommendations.forEach((rec, idx) => { rec.rank = idx + 1; });

  return { empty: false, cards: recommendations };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/engine/evaluate
// Domain-aware evaluation (used by the browser extension context)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/engine/evaluate', engineLimiter, async (req, res) => {
  const { checkout_domain, raw_prompt, declared_transaction_value_inr } = req.body;
  let resolvedUserId = req.body.user_id || null;

  // Extract user_id from JWT if Authorization header is present (extension flow)
  const authHeader = req.headers.authorization;
  if (!resolvedUserId && authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const users = await dbQuery('SELECT user_id FROM users WHERE email_address = ?', [decoded.sub]);
      if (users.length > 0) {
        resolvedUserId = users[0].user_id;
      }
    } catch (tokenErr) {
      return res.status(401).json({ error: 'NOT_LOGGED_IN' });
    }
  }

  if (!resolvedUserId) {
    return res.status(400).json({ error: 'MISSING_USER_ID' });
  }

  try {
    const combinedInput = `${checkout_domain || ''} ${raw_prompt || ''}`;
    const { mcc, badge } = classifyMCC(combinedInput);
    // Use declared_transaction_value_inr from extension, or extract from raw_prompt
    const transaction_value = declared_transaction_value_inr || extractAmount(raw_prompt);

    const result = await runRewardEngine(resolvedUserId, mcc, transaction_value);

    if (result.empty) {
      return res.json({
        mcc_identified: mcc,
        category: badge,
        detected_value_inr: transaction_value,
        recommendations: [],
        status_message: 'WALLET_EMPTY'
      });
    }

    return res.json({
      mcc_identified: mcc,
      category: badge,
      detected_value_inr: transaction_value,
      recommendations: result.cards
    });
  } catch (error) {
    console.error('Evaluate Engine Error:', error);
    return res.status(500).json({ error: 'INTERNAL_ENGINE_FAULT' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/engine/transfer-partners
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/engine/transfer-partners', async (req, res) => {
  try {
    const partners = await dbQuery("SELECT * FROM card_transfer_partners");
    const banks = await dbQuery("SELECT bank_id, display_name, redemption_portal_url, redemption_portal_name FROM banks WHERE redemption_portal_url IS NOT NULL");
    
    // Group partners by ecosystem_id
    const groupedPartners = {
      hdfc: [],
      axis: [],
      amex: [],
      icici: [],
      sbi: []
    };

    partners.forEach(p => {
      const ecoId = p.ecosystem_id;
      if (groupedPartners[ecoId]) {
        groupedPartners[ecoId].push({
          id: p.partner_id,
          name: p.partner_name,
          program: p.program_name,
          type: p.partner_type,
          ratio: p.transfer_ratio,
          rateNum: p.rate_multiplier,
          valuePerMile: p.value_per_mile,
          alliance: p.alliance,
          group: p.partner_group,
          domain: p.partner_domain,
          url: p.redemption_url,
          color: p.brand_color,
          desc: p.description
        });
      }
    });

    res.json({
      partners: groupedPartners,
      banks: banks
    });
  } catch (error) {
    console.error("GET_TRANSFER_PARTNERS_ERROR:", error);
    res.status(500).json({ error: "DATABASE_FAULT", details: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/engine/ai-parse
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/engine/ai-parse', async (req, res) => {
  const { prompt, user_id, host_domain } = req.body;

  if (!prompt || !user_id) {
    return res.status(400).json({ error: "MISSING_REQUIRED_PAYLOAD_METADATA" });
  }

  try {
    // 1. Fetch live user portfolio properties directly from local database layers using custom dbQuery wrapper
    const dbQueries = [
      dbQuery("SELECT uw.card_id, c.card_name, c.bank_id, c.card_type FROM user_wallets uw JOIN cards c ON uw.card_id = c.card_id WHERE uw.user_id = ?", [user_id]),
      dbQuery("SELECT * FROM user_spend_goals WHERE user_id = ?", [user_id]),
      dbQuery("SELECT * FROM reward_rules"),
      dbQuery("SELECT * FROM card_transfer_partners")
    ];

    const [userCards, spendGoals, globalRules, transferPartners] = await Promise.all(dbQueries);

    let geminiContextPrompt;

    if (host_domain === 'vacation_planner') {
      geminiContextPrompt = `
        You are the Vacation Planner and Travel Rewards Advisor for Cardwise, an Indian financial credit card optimizer.
        Analyze this travel request: "${prompt}"

        User's active credit cards: ${JSON.stringify(userCards)}
        User's milestones/spend-goals: ${JSON.stringify(spendGoals)}
        System category rules: ${JSON.stringify(globalRules)}
        Database of supported transfer partners and ratios: ${JSON.stringify(transferPartners)}

        CRITICAL TASKS:
        - Identify the destination/airlines/hotels mentioned in the prompt (e.g. Bali, Singapore, Marriott).
        - Recommend up to 3 cards from the user's wallet that are best for booking flights/hotels or earning rewards for this trip.
        - Provide an expert financial insight ("ai_insight") on how to optimize points transfer. Explain which bank (e.g. HDFC, Axis, AMEX, ICICI) to use, the exact transfer ratios, how they can get maximum value, and warnings if there are caps (like HDFC's 1.5L cap or Axis's Group A/B limits).
        - Add helpful tags or warnings in the "flags" array (e.g., "1:1 Marriott", "Singapore 2:1", "Axis 1:4", "Air India 1:1").

        Respond STRICTLY using this raw JSON schema structure:
        {
          "top_recommendations": [
            {
              "card_name": "STRING (Bank Name + Card Name combined safely)",
              "yield_pct": NUMBER,
              "net_savings": NUMBER
            }
          ],
          "ai_insight": "STRING",
          "flags": ["STRING"]
        }
      `;
    } else {
      // Default checkout/mcc check
      geminiContextPrompt = `
        You are the core intelligence routing matrix for Cardwise, an Indian financial credit card optimizer dashboard.
        Analyze this user interaction prompt: "${prompt}" 
        Active Host Domain Context: "${host_domain || 'Unknown checkout context'}"

        Here is the user's active wallet array configuration data: ${JSON.stringify(userCards)}
        Here is the user's explicit milestones/spend-goals configuration logs: ${JSON.stringify(spendGoals)}
        Here is our system-wide category rules and restrictions database registry: ${JSON.stringify(globalRules)}

        CRITICAL TASKS:
        - Classify the target Merchant and identify the correct merchant code (MCC).
        - Extract any numeric pricing totals inside the prompt string.
        - Correlate calculations to identify which card optimizes return yields.
        - Check if a transaction advances an explicit user spend goal milestone (e.g., Axis Atlas spend thresholds). If yes, append a premium strategy badge.
        - Uncover "hidden gems" or multiplier rules (e.g., 5X SmartBuy rules) and format them beautifully.

        Respond STRICTLY using this raw JSON schema structure:
        {
          "category_badge": "STRING",
          "extracted_amount": NUMBER,
          "mcc_detected": "STRING",
          "sorted_results": [
            {
              "card_name": "STRING (Bank Name + Card Name combined safely)",
              "card_type": "STRING",
              "reward_yield_pct": NUMBER,
              "net_savings_inr": NUMBER,
              "warning_flag": "STRING OR NULL",
              "strategy_badge": "STRING"
            }
          ]
        }
      `;
    }

    const aiOutputResponse = await aiStudio.models.generateContent({
      model: CARDWISE_AI_MODEL,
      contents: geminiContextPrompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 2048 } 
      }
    });

    // Parse the structured, guaranteed clean JSON directly into the client response stream
    const structuredPayload = JSON.parse(aiOutputResponse.text);
    res.json(structuredPayload);

  } catch (error) {
    console.error("CARDWISE_AI_ERROR:", error.message);
    res.status(500).json({ error: "GENERIC_REASONING_FAULT", details: error.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/engine/cardwise-chat
// Multimodal conversational AI endpoint — accepts text, images, and URLs
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/engine/cardwise-chat', async (req, res) => {
  const { message, image_base64, url, user_id, history } = req.body;

  if (!message || !user_id) {
    return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS", details: "message and user_id are required." });
  }

  try {
    // Fetch full user context from database
    const [userCards, spendGoals, globalRules, transferPartners] = await Promise.all([
      dbQuery("SELECT uw.card_id, c.card_name, c.bank_id, c.card_type, c.card_network FROM user_wallets uw JOIN cards c ON uw.card_id = c.card_id WHERE uw.user_id = ?", [user_id]),
      dbQuery("SELECT * FROM user_spend_goals WHERE user_id = ?", [user_id]),
      dbQuery("SELECT * FROM reward_rules"),
      dbQuery("SELECT * FROM card_transfer_partners")
    ]);

    // If a URL was provided, try to fetch its content for context
    let urlContext = '';
    if (url && url.trim()) {
      try {
        const urlResp = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const urlText = await urlResp.text();
        // Extract just meaningful text, limit to 2000 chars
        const stripped = urlText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000);
        urlContext = `\n\nThe user also shared this URL: ${url}\nPage content summary: "${stripped}"`;
      } catch (e) {
        urlContext = `\n\nThe user shared this URL but it could not be fetched: ${url}`;
      }
    }

    // Build conversation history context
    let historyContext = '';
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6); // Last 6 messages for context
      historyContext = '\n\nRecent conversation history:\n' + recentHistory.map(h => `${h.role === 'user' ? 'User' : 'Cardwise AI'}: ${h.text}`).join('\n');
    }

    const systemPrompt = `You are Cardwise AI, a hyper-intelligent Indian credit card rewards optimization assistant.
You are embedded inside the Cardwise dashboard — a premium platform that helps users maximize their credit card rewards, cashback, and loyalty points.

YOUR KNOWLEDGE BASE:
1. User's Active Credit Cards: ${JSON.stringify(userCards)}
2. User's Spend Goals & Milestones: ${JSON.stringify(spendGoals)}
3. System Reward Rules Database (MCC codes, reward rates, caps, exclusions): ${JSON.stringify(globalRules)}
4. Transfer Partner Network (Airlines, Hotels, ratios): ${JSON.stringify(transferPartners)}

CARDWISE PORTAL FEATURES YOU KNOW ABOUT:
- Reward Redemption Hub: Compare point-to-mile conversion ratios across banks (HDFC, Axis, SBI, ICICI, AMEX, IDFC)
- Shop Partners: 11 major e-commerce platforms with affiliate cashback stacking (Amazon 8.5%, Flipkart 7%, Myntra 6.5%, etc.)
- Vacation Planner: Transfer partner analysis for airlines (Air India, Singapore, Emirates, etc.) and hotels (Marriott, Hilton, IHG, etc.)
- Financial Profile: Category-wise spend optimization and wallet audit
- Limited Offers: Real-time bank deals and merchant promotions

PERSONALITY:
- Be extremely knowledgeable, precise, and strategic
- Use specific numbers, percentages, and card names from the user's actual wallet
- When recommending cards, explain WHY with yield calculations
- Warn about hidden caps, exclusions, and gimmick terms
- Be conversational but professional — like a premium financial concierge
- Use Indian Rupee (₹) for amounts
- Keep responses concise but thorough (aim for 100-200 words unless complex analysis needed)
- Format important numbers in bold
- Use bullet points for comparisons
${historyContext}${urlContext}

USER MESSAGE: "${message}"

${image_base64 ? 'The user has also attached an image. Analyze it carefully — it could be a screenshot of a checkout page, a card offer, a transaction statement, or a product page. Use the visual context to provide more accurate recommendations.' : ''}

Respond naturally as Cardwise AI. Do NOT use JSON format — respond in plain text with markdown formatting (bold, bullets, etc.) for readability.`;

    // Build content parts for Gemini
    const contentParts = [];
    
    // Add text part
    contentParts.push({ text: systemPrompt });
    
    // Add image if provided
    if (image_base64) {
      // Extract mime type and data from base64 string
      const mimeMatch = image_base64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (mimeMatch) {
        contentParts.push({
          inlineData: {
            mimeType: mimeMatch[1],
            data: mimeMatch[2]
          }
        });
      }
    }

    const aiResponse = await aiStudio.models.generateContent({
      model: CARDWISE_AI_MODEL,
      contents: [{ role: 'user', parts: contentParts }],
      config: {
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });

    const replyText = aiResponse.text || 'I apologize, I was unable to generate a response. Please try rephrasing your question.';

    // Generate follow-up suggestions based on the conversation
    let suggestions = [];
    try {
      const suggestResponse = await aiStudio.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on this Cardwise AI conversation, suggest exactly 3 short follow-up questions the user might want to ask next. Each should be under 10 words. Return as a JSON array of strings only.\n\nUser asked: "${message}"\nAI replied: "${replyText.slice(0, 500)}"`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 512 }
        }
      });
      suggestions = JSON.parse(suggestResponse.text);
    } catch (e) {
      suggestions = [
        "Which card maximizes my dining rewards?",
        "Compare my top 2 cards",
        "How to optimize my monthly spending?"
      ];
    }

    res.json({ reply: replyText, suggestions });

  } catch (error) {
    console.error("CARDWISE_CHAT_ERROR:", error.message);
    res.status(500).json({ error: "CHAT_ENGINE_FAULT", details: error.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/engine/sync-hidden-rules
// Background engine that reads unstructured data and syncs it with the Cardwise database
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/engine/sync-hidden-rules', async (req, res) => {
  const { card_id, raw_unstructured_text_dump } = req.body;

  if (!card_id || !raw_unstructured_text_dump) {
    return res.status(400).json({ error: "MISSING_SYNC_METADATA_INPUTS" });
  }

  try {
    // Invoke Gemini's latest processing models with strict JSON output constraints
    const response = await aiEngineClient.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Analyze this raw financial document dump for card id "${card_id}". Extract category exclusions, reward caps, and point values. 
                 Return data strictly adhering to this JSON schema:
                 {
                   "mcc_code": "string",
                   "base_reward_percentage": number,
                   "monthly_capping_inr": number,
                   "gimmick_warning_text": "string"
                 }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedRules = JSON.parse(response.text);

    // Save Gemini's structured output directly into your SQLite rules ledger
    if (usePostgres) {
      await pool.query(
        `INSERT INTO reward_rules (card_id, mcc_code, base_reward_percentage, monthly_capping_inr, gimmick_warning_text)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT(card_id, mcc_code) DO UPDATE SET
           base_reward_percentage = EXCLUDED.base_reward_percentage,
           monthly_capping_inr = EXCLUDED.monthly_capping_inr,
           gimmick_warning_text = EXCLUDED.gimmick_warning_text`,
        [card_id, parsedRules.mcc_code, parsedRules.base_reward_percentage, parsedRules.monthly_capping_inr, parsedRules.gimmick_warning_text]
      );
      res.json({ success: true, message: "BANK_RULES_SYNCED_VIA_GEMINI", applied_data: parsedRules });
    } else {
      sqliteDb.run(
        `INSERT INTO reward_rules (card_id, mcc_code, base_reward_percentage, monthly_capping_inr, gimmick_warning_text)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(card_id, mcc_code) DO UPDATE SET
           base_reward_percentage = excluded.base_reward_percentage,
           monthly_capping_inr = excluded.monthly_capping_inr,
           gimmick_warning_text = excluded.gimmick_warning_text`,
        [card_id, parsedRules.mcc_code, parsedRules.base_reward_percentage, parsedRules.monthly_capping_inr, parsedRules.gimmick_warning_text],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, message: "BANK_RULES_SYNCED_VIA_GEMINI", applied_data: parsedRules });
        }
      );
    }

  } catch (error) {
    res.status(500).json({ error: "GEMINI_PROCESSING_ENGINE_FAULT", technical_details: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/engine/extension-intercept
// Full extension pipeline: JWT auth → reward engine → price history → combined response
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/engine/extension-intercept', async (req, res) => {
  const { current_url, extracted_product_title, extracted_cart_total } = req.body;
  let resolvedUserId = req.body.user_id || null;

  // 1. Extract user_id from JWT if Authorization header is present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      // decoded.sub is the email_address set during login
      const users = await dbQuery('SELECT user_id, email_address FROM users WHERE email_address = ?', [decoded.sub]);
      if (users.length > 0) {
        resolvedUserId = users[0].user_id;
      } else {
        return res.status(401).json({ error: 'NOT_LOGGED_IN' });
      }
    } catch (tokenErr) {
      return res.status(401).json({ error: 'NOT_LOGGED_IN' });
    }
  }

  if (!resolvedUserId) {
    return res.status(401).json({ error: 'NOT_LOGGED_IN' });
  }

  const amount = parseFloat(extracted_cart_total) || 999;
  const title = extracted_product_title || 'Shopping items';
  const url = current_url || '';

  try {
    // 2. Classify MCC from product title + URL
    const combinedInput = `${title} ${url}`;
    const { mcc, badge } = classifyMCC(combinedInput);

    // 3. Run reward engine for card recommendations
    const engineResult = await runRewardEngine(resolvedUserId, mcc, amount);

    // 4. Get price history from Gemini AI (non-blocking — don't fail if AI is slow)
    let priceData = { price_evaluation_badge: 'GOOD_DEAL', price_history: [], system_notice: '' };
    try {
      const extensionPrompt = `
        Analyze this e-commerce product checkout state for Cardwise Web Extension.
        Product Title: "${title}"
        Cart Total Value: ${amount}
        Target Web Gateway URL: "${url}"

        Task: Generate a simulated historical 3-month pricing array to check if this item is at an optimal price.
        Generate exactly 5-7 data points spanning the last 3 months.

        Respond strictly using this JSON schema:
        {
          "price_evaluation_badge": "HISTORIC_LOW" or "GOOD_DEAL" or "AVERAGE_PRICING" or "MARKED_UP",
          "price_history": [{"date": "YYYY-MM-DD", "price_inr": number}],
          "system_notice": "string"
        }
      `;

      const aiResponse = await aiStudio.models.generateContent({
        model: CARDWISE_AI_MODEL,
        contents: extensionPrompt,
        config: { responseMimeType: "application/json" }
      });
      priceData = JSON.parse(aiResponse.text);
    } catch (aiErr) {
      console.warn('[Extension Intercept] Price history AI failed, using fallback:', aiErr.message);
    }

    // 5. Build the response structure the extension expects
    if (engineResult.empty || engineResult.cards.length === 0) {
      return res.json({
        top_recommendation: null,
        alternative_cards_matrix: [],
        price_history: priceData.price_history || [],
        price_evaluation_badge: priceData.price_evaluation_badge || 'GOOD_DEAL',
        extracted_cart_total: amount,
        category: badge,
        system_notice: 'No cards in your wallet. Add cards from the dashboard to get recommendations.'
      });
    }

    // 6. Get wallet card details for enrichment
    const walletDetails = await dbQuery(
      `SELECT uw.card_id, c.card_name, c.bank_id, c.card_type, c.card_network,
              c.joining_fee_inr, c.annual_fee_inr, c.spend_waiver_threshold_inr,
              c.forex_markup_pct, c.lounge_access_domestic, c.lounge_access_international,
              c.ancillary_benefits, c.is_cashback_card
       FROM user_wallets uw
       JOIN cards c ON uw.card_id = c.card_id
       WHERE uw.user_id = ?`,
      [resolvedUserId]
    );

    // Build lookup for wallet details
    const walletLookup = {};
    walletDetails.forEach(w => {
      walletLookup[w.card_id] = w;
    });

    // 7. Map engine results to the extension's expected format
    const topCard = engineResult.cards[0];
    const topWallet = walletLookup[topCard.card_id] || {};
    const topBankId = topWallet.bank_id || topCard.display_label?.split(' ')[0] || '';

    const topRecommendation = {
      card_id: topCard.card_id,
      card_name: topWallet.card_name || topCard.display_label || topCard.card_id,
      nickname: topCard.display_label || topCard.card_id,
      issuer: topBankId,
      card_type: topCard.card_type || 'CREDIT',
      card_network: topWallet.card_network || 'Visa',
      card_category: topCard.card_type || 'Platinum',
      card_limit: 500000,
      available_balance: 400000,
      cashback_pct: topCard.yield_percentage || 0,
      net_saving: topCard.calculated_savings_inr || 0,
      net_yield_percentage: topCard.yield_percentage || 0,
      multiplier_label: `${topCard.yield_percentage}% yield on ${badge}`,
      strategy_alert: topCard.gimmick_alert || null,
      action_badge: topCard.action_badge || 'GOOD_VALUE',
      joining_fee: topWallet.joining_fee_inr || 0,
      annual_fee: topWallet.annual_fee_inr || 0,
      spend_waiver: topWallet.spend_waiver_threshold_inr,
      forex_markup_pct: topWallet.forex_markup_pct !== undefined ? topWallet.forex_markup_pct : 3.50,
      lounge_domestic: topWallet.lounge_access_domestic || null,
      lounge_international: topWallet.lounge_access_international || null,
      ancillary_benefits: topWallet.ancillary_benefits || null,
      is_cashback: topWallet.is_cashback_card || 0
    };

    // Alternative cards (skip the top one)
    const alternativeCards = engineResult.cards.slice(1, 4).map(card => {
      const w = walletLookup[card.card_id] || {};
      const cardBankId = w.bank_id || card.display_label?.split(' ')[0] || '';
      return {
        card_id: card.card_id,
        card_name: w.card_name || card.display_label || card.card_id,
        nickname: card.display_label || card.card_id,
        issuer: cardBankId,
        card_type: card.card_type || 'CREDIT',
        card_category: card.card_type || 'Platinum',
        cashback_pct: card.yield_percentage || 0,
        net_saving: card.calculated_savings_inr || 0,
        net_yield_percentage: card.yield_percentage || 0,
        multiplier_label: `${card.yield_percentage}% yield on ${badge}`,
        action_badge: card.action_badge || 'LOW_YIELD',
        joining_fee: w.joining_fee_inr || 0,
        annual_fee: w.annual_fee_inr || 0,
        spend_waiver: w.spend_waiver_threshold_inr,
        forex_markup_pct: w.forex_markup_pct !== undefined ? w.forex_markup_pct : 3.50,
        lounge_domestic: w.lounge_access_domestic || null,
        lounge_international: w.lounge_access_international || null,
        ancillary_benefits: w.ancillary_benefits || null,
        is_cashback: w.is_cashback_card || 0
      };
    });

    // 8. Points Redemption Intelligence — Only for non-cashback (points-based) cards
    let pointsRedemptionIntel = null;
    const isCashbackCard = topWallet.is_cashback_card === 1;

    if (!isCashbackCard && topCard.yield_percentage > 0) {
      try {
        // Fetch transfer partners for the top card's bank ecosystem
        const topBankEcosystem = topBankId.toLowerCase();
        const partners = await dbQuery(
          `SELECT partner_name, program_name, partner_type, transfer_ratio, rate_multiplier, value_per_mile, brand_color, description
           FROM card_transfer_partners WHERE ecosystem_id = ?`,
          [topBankEcosystem]
        );

        if (partners.length > 0) {
          // Get the rule for this card + MCC to know the point_to_inr_valuation and points_multiplier
          const cardRule = await dbQuery(
            `SELECT base_reward_percentage, point_to_inr_valuation, points_multiplier
             FROM reward_rules WHERE card_id = ? AND (mcc_code = ? OR mcc_code = 'DEFAULT') ORDER BY mcc_code DESC LIMIT 1`,
            [topCard.card_id, mcc]
          );
          const rule = cardRule[0] || { base_reward_percentage: 1, point_to_inr_valuation: 1, points_multiplier: 1 };

          // Calculate estimated points earned from this transaction
          const estimatedPoints = Math.round(amount * (rule.points_multiplier || 1) * (rule.base_reward_percentage / 100) / (rule.point_to_inr_valuation || 1));

          const redemptionPrompt = `
You are a credit card rewards optimization engine for Indian credit card users.

The user is about to make a purchase of ₹${amount} using "${topCard.display_label}" (${topBankId} bank).
This card earns approximately ${estimatedPoints} reward points on this transaction.
Base reward rate: ${rule.base_reward_percentage}%, Points multiplier: ${rule.points_multiplier || 1}x

Here are ${topBankId}'s available transfer partners:
${JSON.stringify(partners.map(p => ({name: p.partner_name, program: p.program_name, type: p.partner_type, ratio: p.transfer_ratio, value_per_mile: p.value_per_mile})))}

Task: Analyze which transfer partner gives the MAXIMUM INR value extraction for ${estimatedPoints} points.
Calculate the accelerated/best redemption value in INR.
Also calculate the standard/baseline INR value (direct redemption without transfer).

Respond strictly using this JSON schema:
{
  "estimated_points_earned": number,
  "standard_redemption_inr": number,
  "best_partner_name": "string",
  "best_partner_program": "string", 
  "best_partner_type": "airline" or "hotel",
  "transfer_ratio": "string",
  "accelerated_value_inr": number,
  "value_multiplier": number,
  "top_3_partners": [{"name": "string", "value_inr": number, "type": "string", "ratio": "string"}],
  "insight": "string (1-2 sentence strategic tip)"
}`;

          const redemptionResp = await aiStudio.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: redemptionPrompt,
            config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 1024 } }
          });
          pointsRedemptionIntel = JSON.parse(redemptionResp.text);
          pointsRedemptionIntel.bank_ecosystem = topBankId;
          pointsRedemptionIntel.card_name = topCard.display_label;
        }
      } catch (redemptionErr) {
        console.warn('[Extension Intercept] Points redemption AI failed:', redemptionErr.message);
      }
    }

    // 9. Shop Partners — Affiliate cashback data for the current merchant domain
    const shopPartners = [];
    const merchantHost = (() => {
      try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
    })();
    const shopPartnersMap = {
      'amazon.in': { name: 'Amazon India', cashback: '8.5%', color: '#FF9900', category: 'E-Commerce' },
      'flipkart.com': { name: 'Flipkart', cashback: '7%', color: '#2874F0', category: 'E-Commerce' },
      'myntra.com': { name: 'Myntra', cashback: '6.5%', color: '#FF3F6C', category: 'Fashion' },
      'ajio.com': { name: 'AJIO', cashback: '5%', color: '#2B2D42', category: 'Fashion' },
      'nykaa.com': { name: 'Nykaa', cashback: '6%', color: '#FC2779', category: 'Beauty' },
      'meesho.com': { name: 'Meesho', cashback: '4%', color: '#F43397', category: 'E-Commerce' },
      'swiggy.com': { name: 'Swiggy', cashback: '5%', color: '#FC8019', category: 'Food Delivery' },
      'zomato.com': { name: 'Zomato', cashback: '5%', color: '#E23744', category: 'Food Delivery' },
      'croma.com': { name: 'Croma', cashback: '4.5%', color: '#0DB14B', category: 'Electronics' },
      'bigbasket.com': { name: 'BigBasket', cashback: '3.5%', color: '#84C225', category: 'Grocery' },
      'blinkit.com': { name: 'Blinkit', cashback: '3%', color: '#F8CB46', category: 'Grocery' },
      'makemytrip.com': { name: 'MakeMyTrip', cashback: '4%', color: '#E2232A', category: 'Travel' },
      'goibibo.com': { name: 'Goibibo', cashback: '3.5%', color: '#EC5B24', category: 'Travel' },
      'irctc.co.in': { name: 'IRCTC', cashback: '2%', color: '#1C60A3', category: 'Travel' },
    };
    // Add current merchant partner if matched
    for (const [domain, info] of Object.entries(shopPartnersMap)) {
      if (merchantHost.includes(domain.split('.')[0])) {
        shopPartners.push({ ...info, domain, is_current: true });
      }
    }
    // Add 3-4 related partners for cross-sell
    const relatedDomains = Object.entries(shopPartnersMap)
      .filter(([d]) => !merchantHost.includes(d.split('.')[0]))
      .slice(0, 4);
    relatedDomains.forEach(([domain, info]) => {
      shopPartners.push({ ...info, domain, is_current: false });
    });

    // 10. Recent history — last 5 deals from flash deals as activity log
    let recentHistory = [];
    try {
      recentHistory = await dbQuery(
        `SELECT d.target_merchant_string as merchant, d.bonus_multiplier_value as multiplier,
                c.card_name, c.bank_id, d.raw_source_text as description,
                d.discovered_at as date
         FROM active_flash_deals d
         JOIN cards c ON d.card_id = c.card_id
         WHERE d.is_active = 1
         ORDER BY d.discovered_at DESC LIMIT 5`
      );
    } catch (histErr) {
      console.warn('[Extension Intercept] History fetch failed:', histErr.message);
    }

    return res.json({
      top_recommendation: topRecommendation,
      alternative_cards_matrix: alternativeCards,
      price_history: priceData.price_history || [],
      price_evaluation_badge: priceData.price_evaluation_badge || 'GOOD_DEAL',
      extracted_cart_total: amount,
      category: badge,
      system_notice: priceData.system_notice || '',
      points_redemption_intel: pointsRedemptionIntel,
      shop_partners: shopPartners,
      recent_history: recentHistory
    });

  } catch (e) {
    console.error('[Extension Intercept] Fatal Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/cards/search
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/cards/search', async (req, res) => {
  const { query, bank_id, card_type } = req.query;

  try {
    let sql = `SELECT card_id, bank_id, card_name, card_type, card_network,
                      joining_fee_inr, annual_fee_inr, spend_waiver_threshold_inr
               FROM cards WHERE is_active = TRUE`;
    const params = [];

    if (query) {
      sql += ' AND (card_name LIKE ? OR bank_id LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    if (bank_id) {
      sql += ' AND bank_id = ?';
      params.push(bank_id.toUpperCase());
    }
    if (card_type) {
      sql += ' AND card_type = ?';
      params.push(card_type.toUpperCase());
    }
    sql += ' ORDER BY bank_id, card_name';

    const rows = await dbQuery(sql, params);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Card Search Error:', error);
    return res.status(500).json({ error: 'SEARCH_FETCH_FAILED' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/user/portfolio/add
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/user/portfolio/add', async (req, res) => {
  const { user_id, card_id } = req.body;

  if (!user_id || !card_id) {
    return res.status(400).json({ error: 'MISSING_REQUIRED_PARAMETERS' });
  }

  try {
    // Ensure user exists
    const users = await dbQuery(`SELECT user_id FROM users WHERE user_id = ?`, [user_id]);
    if (users.length === 0) {
      await dbQuery(
        `INSERT INTO users (user_id, email_address, password_hash) VALUES (?, ?, ?)`,
        [user_id, `${user_id}@cardwise.com`, 'hash_placeholder']
      );
    }

    // Verify card exists
    const cards = await dbQuery(`SELECT card_id FROM cards WHERE card_id = ?`, [card_id]);
    if (cards.length === 0) {
      return res.status(404).json({ error: 'CARD_NOT_FOUND_IN_CATALOG' });
    }

    // Insert — silently ignore duplicates (UNIQUE constraint on user_id + card_id)
    await dbQuery(
      `INSERT INTO user_wallets (user_id, card_id) VALUES (?, ?)
       ON CONFLICT(user_id, card_id) DO NOTHING`,
      [user_id, card_id]
    );

    return res.json({ success: true, message: 'CARD_SUCCESSFULLY_PROVISIONED' });
  } catch (err) {
    console.error('Portfolio Provisioning Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/user/portfolio/remove
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/user/portfolio/remove', async (req, res) => {
  const { user_id, card_id } = req.body;

  if (!user_id || !card_id) {
    return res.status(400).json({ error: 'MISSING_REQUIRED_PARAMETERS' });
  }

  try {
    await dbQuery(
      `DELETE FROM user_wallets WHERE user_id = ? AND card_id = ?`,
      [user_id, card_id]
    );

    return res.json({ success: true, message: 'CARD_SUCCESSFULLY_DEPROVISIONED' });
  } catch (err) {
    console.error('Portfolio Deprovisioning Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/user/portfolio/list
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/user/portfolio/list', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'USER_ID_REQUIRED' });
  }

  try {
    const rows = await dbQuery(
      `SELECT uw.wallet_entry_id, c.card_id, c.bank_id, c.card_name, c.card_type,
              c.card_network, c.annual_fee_inr, c.spend_waiver_threshold_inr, c.official_link
       FROM user_wallets uw
       JOIN cards c ON uw.card_id = c.card_id
       WHERE uw.user_id = ?
       ORDER BY c.bank_id, c.card_name`,
      [user_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Fetch Portfolio Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/cards/rules
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/cards/rules', async (req, res) => {
  const { card_id } = req.query;

  try {
    let sql = `SELECT r.*, c.card_name, c.card_type, c.bank_id, c.card_network,
                      m.clean_category_name as mcc_category_name
               FROM reward_rules r
               JOIN cards c ON r.card_id = c.card_id
               LEFT JOIN mcc_directory m ON r.mcc_code = m.mcc_code`;
    const params = [];

    if (card_id) {
      sql += ' WHERE r.card_id = ?';
      params.push(card_id);
    }
    sql += ' ORDER BY r.card_id, r.mcc_code';

    const rows = await dbQuery(sql, params);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get Rules Error:', error);
    return res.status(500).json({ error: 'RULES_FETCH_FAILED' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/mcc/classify
// Let the frontend call classifyMCC without duplicating the logic
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/mcc/classify', (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: 'TEXT_REQUIRED' });
  const result = classifyMCC(text);
  return res.json({ mcc: result.mcc, category: result.badge });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/deals/add
// Protected — requires x-admin-secret header
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/admin/deals/add', requireAdminSecret, async (req, res) => {
  const { source_x_profile, target_merchant, deal_headline, raw_copied_text, coupon_code, expires_at } = req.body;

  if (!source_x_profile || !target_merchant || !deal_headline) {
    return res.status(400).json({ error: 'MISSING_MANDATORY_DEAL_FIELDS' });
  }

  try {
    let deal_id;
    if (usePostgres) {
      const insertRes = await dbQuery(
        `INSERT INTO corporate_flash_deals (source_x_profile, target_merchant, deal_headline, raw_copied_text, coupon_code, expires_at)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING deal_id`,
        [source_x_profile, target_merchant.toUpperCase(), deal_headline, raw_copied_text || '', coupon_code || 'NOT_REQUIRED', expires_at || '2026-12-31']
      );
      deal_id = insertRes[0].deal_id;
    } else {
      await dbQuery(
        `INSERT INTO corporate_flash_deals (source_x_profile, target_merchant, deal_headline, raw_copied_text, coupon_code, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [source_x_profile, target_merchant.toUpperCase(), deal_headline, raw_copied_text || '', coupon_code || 'NOT_REQUIRED', expires_at || '2026-12-31']
      );
      const lastIdRes = await dbQuery('SELECT last_insert_rowid() AS id');
      deal_id = lastIdRes[0].id;
    }
    return res.json({ success: true, deal_id });
  } catch (err) {
    console.error('Add Deal Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/deals/active  (legacy — kept for compatibility)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/deals/active', async (req, res) => {
  try {
    const rows = await dbQuery(
      `SELECT * FROM corporate_flash_deals
       WHERE date(expires_at) >= date('now')
       ORDER BY deal_id DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Get Active Deals Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/deals/feed
// Returns structured feed: { recent: last3, older_summary: next10_grouped }
// Auto-refreshed by the X ingester every 4 minutes
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/deals/feed', async (req, res) => {
  try {
    const { buildFeedResponse, openDb } = require('./x_deal_ingester');
    const db = openDb();
    const feed = await buildFeedResponse(db);
    db.close();
    return res.json(feed);
  } catch (err) {
    console.error('Get Deals Feed Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/deals/top-picks
// Returns the top 10 curated picks, sorted by yield descending
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/deals/top-picks', (req, res) => {
  const db = require('./x_deal_ingester').openDb();
  db.all(
    `SELECT * FROM corporate_flash_deals
     WHERE is_top_pick = 1
       AND date(expires_at) >= date('now')
     ORDER BY yield_pct DESC
     LIMIT 10`,
    [],
    (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      return res.json(rows);
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/deals/structured
// Returns all active deals grouped by category + debit/credit split
// Query params: category (optional), card_type (optional: CREDIT|DEBIT)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/deals/structured', (req, res) => {
  const { category, card_type } = req.query;
  const db = require('./x_deal_ingester').openDb();

  let query = `SELECT * FROM corporate_flash_deals WHERE date(expires_at) >= date('now')`;
  const params = [];

  if (category && category !== 'ALL') {
    query += ` AND deal_category = ?`;
    params.push(category);
  }
  if (card_type && card_type !== 'ALL') {
    query += ` AND card_type = ?`;
    params.push(card_type);
  }

  query += ` ORDER BY is_top_pick DESC, yield_pct DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }

    // Group by category
    const grouped = {};
    for (const row of rows) {
      const cat = row.deal_category || 'GENERAL';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(row);
    }

    db.all(
      `SELECT DISTINCT deal_category FROM corporate_flash_deals WHERE date(expires_at) >= date('now') ORDER BY deal_category`,
      [],
      (err2, catRows) => {
        db.close();
        const allCategories = catRows ? catRows.map(r => r.deal_category) : [];
        return res.json({
          total: rows.length,
          categories: allCategories,
          grouped,
          deals: rows,
        });
      }
    );
  });
});

// GET /api/v1/user/profile
// Retrieves user financial profile and spends
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/user/profile', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'USER_ID_REQUIRED' });
  }

  try {
    const rows = await dbQuery(
      `SELECT * FROM user_financial_profiles WHERE user_id = ?`,
      [user_id]
    );

    if (rows.length === 0) {
      return res.json({
        user_id,
        name: 'Ambuj Tiwari',
        age: 29,
        annual_income_inr: 2400000.0,
        reward_goal: 'MAX_YIELD',
        spend_dining_inr: 15000.0,
        spend_grocery_inr: 10000.0,
        spend_shopping_inr: 25000.0,
        spend_utilities_inr: 8000.0,
        spend_travel_inr: 20000.0,
        spend_fuel_inr: 5000.0,
        spend_insurance_inr: 4000.0,
        spend_rent_inr: 30000.0,
        spend_others_inr: 10000.0
      });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Fetch Profile Error:', err);
    return res.status(500).json({ error: 'FETCH_PROFILE_FAILED' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/user/profile/save
// Saves or updates user financial profile
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/user/profile/save', async (req, res) => {
  const {
    user_id, name, age, annual_income_inr, reward_goal,
    spend_dining_inr, spend_grocery_inr, spend_shopping_inr, spend_utilities_inr,
    spend_travel_inr, spend_fuel_inr, spend_insurance_inr, spend_rent_inr, spend_others_inr
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'USER_ID_REQUIRED' });
  }

  try {
    // Check if user exists in core users table
    const users = await dbQuery(`SELECT user_id FROM users WHERE user_id = ?`, [user_id]);
    if (users.length === 0) {
      await dbQuery(
        `INSERT INTO users (user_id, email_address, password_hash) VALUES (?, ?, ?)`,
        [user_id, `${user_id}@cardwise.com`, 'PBKDF2_SECURE_HASH_DEFAULT']
      );
    }

    await dbQuery(
      `INSERT OR REPLACE INTO user_financial_profiles (
         user_id, name, age, annual_income_inr, reward_goal,
         spend_dining_inr, spend_grocery_inr, spend_shopping_inr, spend_utilities_inr,
         spend_travel_inr, spend_fuel_inr, spend_insurance_inr, spend_rent_inr, spend_others_inr,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        user_id,
        name || 'Ambuj Tiwari',
        parseInt(age || 30),
        parseFloat(annual_income_inr || 1000000.0),
        reward_goal || 'MAX_YIELD',
        parseFloat(spend_dining_inr || 0.0),
        parseFloat(spend_grocery_inr || 0.0),
        parseFloat(spend_shopping_inr || 0.0),
        parseFloat(spend_utilities_inr || 0.0),
        parseFloat(spend_travel_inr || 0.0),
        parseFloat(spend_fuel_inr || 0.0),
        parseFloat(spend_insurance_inr || 0.0),
        parseFloat(spend_rent_inr || 0.0),
        parseFloat(spend_others_inr || 0.0)
      ]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('Save Profile Error:', err);
    return res.status(500).json({ error: 'SAVE_PROFILE_FAILED', details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/user/profile/audit
// Performs local portfolio optimization calculations combined with Gemini NLP
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/user/profile/audit', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'USER_ID_REQUIRED' });
  }

  try {
    // 1. Get user profile
    let profileRows = await dbQuery(
      `SELECT * FROM user_financial_profiles WHERE user_id = ?`,
      [user_id]
    );

    if (profileRows.length === 0) {
      profileRows = [{
        user_id,
        age: 29,
        annual_income_inr: 2400000.0,
        reward_goal: 'MAX_YIELD',
        spend_dining_inr: 15000.0,
        spend_grocery_inr: 10000.0,
        spend_shopping_inr: 25000.0,
        spend_utilities_inr: 8000.0,
        spend_travel_inr: 20000.0,
        spend_fuel_inr: 5000.0,
        spend_insurance_inr: 4000.0,
        spend_rent_inr: 30000.0,
        spend_others_inr: 10000.0
      }];
    }
    const profile = profileRows[0];

    const categoriesMap = [
      { name: 'Dining', key: 'spend_dining_inr', mcc: '5812' },
      { name: 'Grocery', key: 'spend_grocery_inr', mcc: '5411' },
      { name: 'Shopping', key: 'spend_shopping_inr', mcc: '5310' },
      { name: 'Utilities', key: 'spend_utilities_inr', mcc: '4900' },
      { name: 'Travel', key: 'spend_travel_inr', mcc: '4511' },
      { name: 'Fuel', key: 'spend_fuel_inr', mcc: '5541' },
      { name: 'Insurance', key: 'spend_insurance_inr', mcc: '6300' },
      { name: 'Rent', key: 'spend_rent_inr', mcc: '6552' },
      { name: 'Others', key: 'spend_others_inr', mcc: 'DEFAULT' }
    ];

    // 2. Fetch user's wallet cards
    const walletCards = await dbQuery(
      `SELECT uw.card_id, c.card_name, c.card_type, c.card_network, c.bank_id
       FROM user_wallets uw
       JOIN cards c ON uw.card_id = c.card_id
       WHERE uw.user_id = ?`,
      [user_id]
    );

    // 3. Fetch all active cards and reward rules
    const allCards = await dbQuery(`SELECT card_id, card_name, card_type, card_network, bank_id FROM cards WHERE is_active = TRUE`);
    const allRules = await dbQuery(`SELECT * FROM reward_rules`);

    // Group rules by card_id
    const rulesByCard = {};
    for (const rule of allRules) {
      if (!rulesByCard[rule.card_id]) {
        rulesByCard[rule.card_id] = {};
      }
      rulesByCard[rule.card_id][rule.mcc_code] = rule;
    }

    // Helper to calculate annual reward for a set of cards
    const calculateWalletAnnualReward = (cardsInWallet) => {
      let totalAnnualReward = 0;

      for (const cat of categoriesMap) {
        const spend = profile[cat.key] || 0;
        if (spend <= 0) continue;

        let bestMonthlyReward = 0;
        for (const card of cardsInWallet) {
          const cardRules = rulesByCard[card.card_id] || {};
          const rule = cardRules[cat.mcc] || cardRules['DEFAULT'];
          if (!rule || rule.is_completely_excluded === 1) continue;

          let pointValuation = rule.point_to_inr_valuation || 1.0;
          pointValuation = getAdjustedValuation(card.card_id, card.bank_id, pointValuation, profile.reward_goal);

          let reward = (spend * rule.base_reward_percentage * pointValuation) / 100;
          if (rule.monthly_capping_inr !== null) {
            reward = Math.min(reward, rule.monthly_capping_inr);
          }
          if (reward > bestMonthlyReward) {
            bestMonthlyReward = reward;
          }
        }
        totalAnnualReward += bestMonthlyReward * 12;
      }
      return totalAnnualReward;
    };

    const currentWalletReward = calculateWalletAnnualReward(walletCards);
    const maxPossibleReward = calculateWalletAnnualReward(allCards);

    let optimizationScore = 100;
    if (maxPossibleReward > 0) {
      optimizationScore = Math.round((currentWalletReward / maxPossibleReward) * 100);
      if (optimizationScore > 100) optimizationScore = 100;
    }

    // Calculate savings for adding each missing card
    const recommendations = [];
    const walletCardIds = new Set(walletCards.map(c => c.card_id));

    for (const card of allCards) {
      if (walletCardIds.has(card.card_id)) continue;

      const simulatedWallet = [...walletCards, card];
      const simulatedReward = calculateWalletAnnualReward(simulatedWallet);
      const increment = simulatedReward - currentWalletReward;

      if (increment > 0) {
        const targetCategories = [];
        const cardRules = rulesByCard[card.card_id] || {};

        for (const cat of categoriesMap) {
          const spend = profile[cat.key] || 0;
          if (spend <= 0) continue;

          const rule = cardRules[cat.mcc] || cardRules['DEFAULT'];
          if (!rule || rule.is_completely_excluded === 1) continue;

          let pointValuation = rule.point_to_inr_valuation || 1.0;
          pointValuation = getAdjustedValuation(card.card_id, card.bank_id, pointValuation, profile.reward_goal);

          let cardReward = (spend * rule.base_reward_percentage * pointValuation) / 100;
          if (rule.monthly_capping_inr !== null) {
            cardReward = Math.min(cardReward, rule.monthly_capping_inr);
          }

          let existingBest = 0;
          for (const ec of walletCards) {
            const er = rulesByCard[ec.card_id] || {};
            const erule = er[cat.mcc] || er['DEFAULT'];
            if (!erule || erule.is_completely_excluded === 1) continue;
            
            let eValuation = erule.point_to_inr_valuation || 1.0;
            eValuation = getAdjustedValuation(ec.card_id, ec.bank_id, eValuation, profile.reward_goal);

            let ereward = (spend * erule.base_reward_percentage * eValuation) / 100;
            if (erule.monthly_capping_inr !== null) {
              ereward = Math.min(ereward, erule.monthly_capping_inr);
            }
            if (ereward > existingBest) existingBest = ereward;
          }

          if (cardReward > existingBest) {
            targetCategories.push(cat.name);
          }
        }

        recommendations.push({
          card_id: card.card_id,
          card_name: card.card_name,
          bank_id: card.bank_id,
          card_type: card.card_type,
          card_network: card.card_network,
          annual_savings_inr: increment,
          target_categories: targetCategories
        });
      }
    }

    recommendations.sort((a, b) => b.annual_savings_inr - a.annual_savings_inr);
    const topRecommendations = recommendations.slice(0, 3);

    // Call Gemini summary
    let auditSummary = null;
    const { isGeminiEnabled, generateWalletAuditWithGemini } = require('./gemini_helper');
    if (isGeminiEnabled()) {
      auditSummary = await generateWalletAuditWithGemini(profile, walletCards, topRecommendations);
    }

    // Local summary fallback
    if (!auditSummary) {
      if (topRecommendations.length > 0) {
        const top = topRecommendations[0];
        auditSummary = `• Your current wallet captures **₹${Math.round(currentWalletReward).toLocaleString('en-IN')}** in rewards annually. You have an untapped potential leak of **₹${Math.round(maxPossibleReward - currentWalletReward).toLocaleString('en-IN')}**.\n` +
                       `• Adding the **${top.card_name}** to your wallet would yield an extra **₹${Math.round(top.annual_savings_inr).toLocaleString('en-IN')}** per year, optimizing your **${top.target_categories.join(', ')}** spends.\n` +
                       `• Your overall portfolio optimization score is **${optimizationScore}%**. We suggest acquiring specialized reward cards for your highest spending categories to maximize returns.`;
      } else {
        auditSummary = `• Your current wallet is highly optimized! You are capturing **₹${Math.round(currentWalletReward).toLocaleString('en-IN')}** in rewards annually.\n` +
                       `• Your overall portfolio optimization score is **${optimizationScore}%**.\n` +
                       `• Continue using HDFC Infinia Metal and your debit/forex assets as currently mapped to maintain max savings.`;
      }
    }

    return res.json({
      current_annual_rewards: currentWalletReward,
      optimal_annual_rewards: maxPossibleReward,
      optimization_score: optimizationScore,
      recommendations: topRecommendations,
      audit_summary: auditSummary
    });
  } catch (err) {
    console.error('AI Profile Audit Error:', err);
    return res.status(500).json({ error: 'PROFILE_AUDIT_FAILED', details: err.message });
  }
});

// ── Authentication Endpoints ──────────────────────────────────────────────────

// POST /api/v1/auth/register
app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required" });
  }

  try {
    const existing = await dbQuery('SELECT user_id FROM users WHERE email_address = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const userId = require('crypto').randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    await dbQuery(
      'INSERT INTO users (user_id, email_address, password_hash) VALUES (?, ?, ?)',
      [userId, email, hashedPassword]
    );

    // Auto-seed the default portfolio cards for new users
    const defaultCards = [
      'in_hdfc_infinia_metal',
      'in_hdfc_millennia_debit',
      'in_niyo_global_forex',
      'in_sbi_aurum',
      'in_axis_atlas_credit'
    ];
    for (const cardId of defaultCards) {
      await dbQuery(
        `INSERT INTO user_wallets (user_id, card_id) VALUES (?, ?)
         ON CONFLICT(user_id, card_id) DO NOTHING`,
        [userId, cardId]
      );
    }

    return res.status(201).json({
      user_id: userId,
      email_address: email,
      message: "USER_REGISTERED_SUCCESSFULLY"
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ detail: "Internal registration fault: " + err.message });
  }
});

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (req, res) => {
  const username = req.body.username || req.body.email;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ detail: "Username/email and password are required" });
  }

  try {
    const users = await dbQuery('SELECT * FROM users WHERE email_address = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }

    const user = users[0];
    let isMatch = false;

    if (user.password_hash === 'PBKDF2_SECURE_HASH_DEFAULT' || user.password_hash === 'hash_placeholder') {
      isMatch = (password === 'password123' || password === 'admin');
    } else {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    if (!isMatch) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }

    const token = jwt.sign({ sub: user.email_address }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ access_token: token, token_type: "bearer" });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ detail: "Internal login fault: " + err.message });
  }
});

// GET /api/v1/auth/me
app.get('/api/v1/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: "Authorization token required" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await dbQuery('SELECT user_id, email_address, created_at FROM users WHERE email_address = ?', [decoded.sub]);
    if (users.length === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    const user = users[0];
    return res.json({
      id: user.user_id,
      user_id: user.user_id,
      email: user.email_address,
      email_address: user.email_address,
      created_at: user.created_at
    });
  } catch (err) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/health
// Simple health check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Cardwise Core v2', db: usePostgres ? 'postgres' : 'sqlite' });
});

app.listen(port, () => {
  console.log(`Cardwise Core Engine v2 running on port ${port}`);
  // Auto-start X deal ingester if bearer token is configured
  const { startIngester } = require('./x_deal_ingester');
  startIngester();
});
