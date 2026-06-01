const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Enable JSON middleware parsing
app.use(express.json());

// Production PostgreSQL Connection Pool Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Evaluate route handler
app.post('/api/v1/engine/evaluate', async (req, res) => {
  const { checkout_domain, declared_transaction_value_inr, user_id } = req.body;

  // Strict Validation Bound
  if (!checkout_domain || !user_id) {
    return res.status(400).json({ error: "MISSING_MANDATORY_PARAMETERS" });
  }

  try {
    // 1. Resolve domain string to target MCC and look for standard platform surcharges
    // (In production, replace this static dictionary query with a direct call to your mcc_directory table)
    let mcc_code = "5310"; // Default to general online retail
    let surcharge_pct = 0.00;

    if (checkout_domain.includes('zomato.com') || checkout_domain.includes('swiggy.com')) {
      mcc_code = "5812"; // Dining
    } else if (checkout_domain.includes('.gov.in') || checkout_domain.includes('billdesk.com')) {
      mcc_code = "9399"; // Government Services / PPF Contributions
      surcharge_pct = 1.00; // Average credit card surcharge layer
    }

    // 2. Fetch the cards currently active inside this specific user's manual wallet
    const userWalletQuery = `
      SELECT card_id FROM user_wallets WHERE user_id = $1
    `;
    const walletResult = await pool.query(userWalletQuery, [user_id]);
    const userCardIds = walletResult.rows.map(row => row.card_id);

    if (userCardIds.length === 0) {
      return res.status(200).json({
        mcc_identified: mcc_code,
        actionable_recommendations: [],
        status_message: "USER_WALLET_EMPTY"
      });
    }

    // 3. Query your master reward rules for the identified category and cards
    const rulesQuery = `
      SELECT r.*, c.card_name, c.card_type
      FROM reward_rules r
      JOIN cards c ON r.card_id = c.card_id
      WHERE r.card_id = ANY($1) AND r.mcc_code = $2 AND r.is_completely_excluded = FALSE
    `;
    const rulesResult = await pool.query(rulesQuery, [userCardIds, mcc_code]);

    // 4. Compute exact mathematical net yields
    const recommendations = rulesResult.rows.map(rule => {
      const base_yield = parseFloat(rule.base_reward_percentage);
      const net_yield = base_yield - surcharge_pct;
      const transaction_value = declared_transaction_value_inr ? parseFloat(declared_transaction_value_inr) : 0;
      const fiat_gain = transaction_value > 0 ? (transaction_value * (net_yield / 100)) : 0;

      return {
        card_ranking: 0, // Assigned dynamically below
        card_id: rule.card_id,
        display_label: `${rule.card_name} (${rule.card_type})`,
        expected_yield_percentage: parseFloat(net_yield.toFixed(2)),
        calculated_fiat_gain_inr: parseFloat(fiat_gain.toFixed(2)),
        panel_badge: net_yield <= 0 ? "AVOID_FEES" : "OPTIMAL_REWARD",
        instruction_string: rule.gimmick_warning_text || `Yield calculated at ${net_yield}% net of platform checkout surcharges.`
      };
    });

    // 5. Sort recommendations highest yield first
    recommendations.sort((a, b) => b.expected_yield_percentage - a.expected_yield_percentage);
    recommendations.forEach((rec, index) => rec.card_ranking = index + 1);

    // Return the absolute, non-demo parameters to your partner's extension
    return res.status(200).json({
      mcc_identified: mcc_code,
      actionable_recommendations: recommendations
    });

  } catch (error) {
    console.error("Lucid Engine Fatal Error:", error);
    return res.status(500).json({ error: "INTERNAL_ENGINE_FAULT" });
  }
});

// GET /api/v1/cards/search
app.get('/api/v1/cards/search', async (req, res) => {
  const { query } = req.query; // e.g., ?query=Cashback
  
  try {
    const cardSearchQuery = `
      SELECT card_id, bank_id, card_name, card_type 
      FROM cards 
      WHERE card_name ILIKE $1 AND is_active = TRUE
    `;
    const result = await pool.query(cardSearchQuery, [`%${query}%`]);
    
    // Return clean data array to your frontend dashboard
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Card Search Error:", error);
    return res.status(500).json({ error: "SEARCH_FETCH_FAILED" });
  }
});

app.listen(port, () => {
  console.log(`Lucid Core Engine server running on port ${port}`);
});
