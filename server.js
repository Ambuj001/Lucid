


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');
const app = express();

const aiEngineClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// Enable CORS middleware
app.use(cors({
  origin: 'http://localhost:3001'
}));

// Enable JSON middleware parsing
app.use(express.json());

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
} else {
  const sqlite3 = require('sqlite3').verbose();
  sqliteDb = new sqlite3.Database('cardwise_production.db');
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
        pointValuation = 0.50;
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
  const { checkout_domain, raw_prompt, user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'MISSING_USER_ID' });
  }

  try {
    const combinedInput = `${checkout_domain || ''} ${raw_prompt || ''}`;
    const { mcc, badge } = classifyMCC(combinedInput);
    const transaction_value = extractAmount(raw_prompt);

    const result = await runRewardEngine(user_id, mcc, transaction_value);

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
// POST /api/v1/engine/ai-parse
// Natural language prompt evaluation (used by the AI Suggestion tab)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/engine/ai-parse', engineLimiter, (req, res) => {
  const { prompt, user_id } = req.body;

  if (!prompt || !user_id) {
    return res.status(400).json({ error: "PARAMETER_VALIDATION_FAILURE" });
  }

  const cleanPrompt = prompt.toLowerCase();
  let matched_mcc = "5310"; // Default: Retail
  let category_badge = "RETAIL";

  if (cleanPrompt.includes("zomato") || cleanPrompt.includes("swiggy") || cleanPrompt.includes("food")) {
    matched_mcc = "5812";
    category_badge = "DINING & DELIVERY";
  } else if (cleanPrompt.includes("flight") || cleanPrompt.includes("hotel") || cleanPrompt.includes("travel")) {
    matched_mcc = "4511";
    category_badge = "TRAVEL & FLIGHTS";
  }

  let transaction_value = 0;
  const numericMatch = cleanPrompt.replace(/[,₹]/g, '').match(/\b\d+(?:\.\d{1,2})?\b/);
  if (numericMatch) transaction_value = parseFloat(numericMatch[0]);

  // Combined parallel database query to check wallets, goals, and rules at the same time
  const dbQueries = [
    dbQuery("SELECT uw.card_id, c.card_name, c.bank_id, c.card_type FROM user_wallets uw JOIN cards c ON uw.card_id = c.card_id WHERE uw.user_id = ?", [user_id]),
    dbQuery("SELECT * FROM user_spend_goals WHERE user_id = ?", [user_id]),
    dbQuery("SELECT * FROM reward_rules WHERE mcc_code = ?", [matched_mcc])
  ];

  Promise.all(dbQueries).then(([userCards, spendGoals, rules]) => {
    const sortedResults = userCards.map(card => {
      const rule = rules.find(r => r.card_id === card.card_id);
      const goal = spendGoals.find(g => g.card_id === card.card_id);

      let yield_pct = 1.0;
      let warning = rule ? rule.gimmick_warning_text : null;
      let strategy_indicator = "STANDARD_EARNINGS_TRACK";
      let priority_weight = 0; // Higher weight bubbles to the top of the list

      if (rule) {
        yield_pct = rule.is_completely_excluded === 1 ? 0.0 : parseFloat(rule.base_reward_percentage);
      }

      let net_savings = transaction_value > 0 ? (transaction_value * (yield_pct / 100)) : 0;

      // MILESTONE INTEGRATION CHECK
      if (goal) {
        const remainingSpend = goal.target_spend_inr - goal.current_spend_inr;
        if (remainingSpend > 0 && transaction_value > 0) {
          strategy_indicator = `🎯 TARGET GOAL: BOSTING MILESTONE PROGRESSION (${((goal.current_spend_inr / goal.target_spend_inr) * 100).toFixed(0)}% ACHIEVED)`;
          // Add priority weight if this transaction safely advances a spend milestone tracking goal
          if (transaction_value <= remainingSpend + 50000) {
             priority_weight += 100; 
          }
        }
      }

      // Check for multiplier benefits (e.g., 5X multipliers)
      if (yield_pct >= 5.0) {
        strategy_indicator = `🔥 REWARD MULTIPLIER ACTIVE: Verified high-yield accelerator loop.`;
      }

      const cleanLabel = card.card_name.startsWith(card.bank_id) ? card.card_name : `${card.bank_id} ${card.card_name}`;

      return {
        card_name: cleanLabel,
        card_type: card.card_type,
        reward_yield_pct: yield_pct,
        net_savings_inr: parseFloat(net_savings.toFixed(2)),
        warning_flag: warning,
        strategy_badge: strategy_indicator,
        execution_weight: priority_weight + yield_pct
      };
    });

    // Sort by optimization priority metrics
    sortedResults.sort((a, b) => b.execution_weight - a.execution_weight);

    res.json({
      parsed_category: category_badge,
      extracted_amount: transaction_value,
      sorted_results: sortedResults
    });
  }).catch(err => res.status(500).json({ error: err.message }));
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
              c.card_network, c.annual_fee_inr, c.spend_waiver_threshold_inr
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

// ─────────────────────────────────────────────────────────────────────────────
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
    user_id, age, annual_income_inr, reward_goal,
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
         user_id, age, annual_income_inr, reward_goal,
         spend_dining_inr, spend_grocery_inr, spend_shopping_inr, spend_utilities_inr,
         spend_travel_inr, spend_fuel_inr, spend_insurance_inr, spend_rent_inr, spend_others_inr,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        user_id,
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/health

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
