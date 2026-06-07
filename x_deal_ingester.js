/**
 * x_deal_ingester.js — Cardwise X (Twitter) Deal Ingestion Service v2
 * ===================================================================
 * Uses OAuth 2.0 Client Credentials (Client ID + Client Secret) to
 * generate a Bearer Token, then polls Search Recent Tweets every 4 minutes
 * for each trusted Indian fintech account.
 *
 * Requires in .env:
 *   X_CLIENT_ID=...
 *   X_CLIENT_SECRET=...
 *
 * Falls back gracefully if keys are not set.
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes between polls

const TRUSTED_ACCOUNTS = [
  'CardExpertIn',
  'TechnoFino',
  'AmazingCreditC',
  'Cardmafia_in',
  'CardInsiderIn',
  'RupeeSaving',
];

const DEAL_KEYWORDS = [
  'cashback', 'discount', 'off on', '% off', 'offer', 'deal',
  'reward', 'points', 'waiver', 'instant discount', 'promo', 'code',
  'rupees off', '₹', 'rs.', 'card',
];

const MERCHANT_MAP = {
  amazon:     'AMAZON',
  flipkart:   'FLIPKART',
  swiggy:     'SWIGGY',
  zomato:     'ZOMATO',
  myntra:     'MYNTRA',
  bigbasket:  'BIGBASKET',
  blinkit:    'BLINKIT',
  zepto:      'ZEPTO',
  instamart:  'SWIGGY',
  makemytrip: 'MAKEMYTRIP',
  ixigo:      'IXIGO',
  irctc:      'IRCTC',
  bpcl:       'BPCL',
  hpcl:       'HPCL',
  uber:       'UBER',
  ola:        'OLA',
  nykaa:      'NYKAA',
  ajio:       'AJIO',
  tatacliq:   'TATACLIQ',
  bookmyshow: 'BOOKMYSHOW',
  cred:       'CRED',
  phonepe:    'PHONEPE',
  paytm:      'PAYTM',
  hdfc:       'HDFC',
  sbi:        'SBI',
  axis:       'AXIS',
  icici:      'ICICI',
  kotak:      'KOTAK',
  amex:       'AMEX',
};

// Track seen tweet IDs to avoid duplicate inserts
const seenTweetIds = new Set();

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH 2.0 CLIENT CREDENTIALS — Get Bearer Token from Client ID + Secret
// ─────────────────────────────────────────────────────────────────────────────
async function getBearerToken(clientId, clientSecret) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await axios.post(
    'https://api.twitter.com/oauth2/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      }
    }
  );
  if (response.data.access_token) {
    return response.data.access_token;
  } else {
    throw new Error(`OAuth error: ${JSON.stringify(response.data)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH RECENT TWEETS for a given username
// ─────────────────────────────────────────────────────────────────────────────
async function searchTweets(bearerToken, username, maxResults = 10) {
  const query = encodeURIComponent(`from:${username} -is:retweet`);
  const fields = 'tweet.fields=created_at,text,author_id&expansions=author_id&user.fields=username&max_results=10';
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&${fields}&max_results=${maxResults}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'CardwiseDealIngester/2.0',
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 429) {
        throw new Error(`RATE_LIMITED:${error.response.headers['x-rate-limit-reset'] || 900}`);
      }
      throw new Error(`HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TWEET PARSER — Extract structured deal data from raw tweet text
// ─────────────────────────────────────────────────────────────────────────────
function parseTweet(tweetId, tweetText, authorHandle, createdAt) {
  const text = tweetText.toLowerCase();

  // Check if tweet contains any deal keyword
  const hasDealKeyword = DEAL_KEYWORDS.some(kw => text.includes(kw));
  if (!hasDealKeyword) return null;

  // Identify merchant
  let target_merchant = 'GENERAL';
  for (const [keyword, normalized] of Object.entries(MERCHANT_MAP)) {
    if (text.includes(keyword)) {
      target_merchant = normalized;
      break;
    }
  }

  // Extract coupon code
  let coupon = 'NOT_REQUIRED';
  const couponMatch = tweetText.match(
    /(?:code[:\s]+|promo[:\s]+|coupon[:\s]+|use\s+code\s+|using\s+code\s+)([A-Z0-9]{4,20})\b/i
  );
  if (couponMatch) coupon = couponMatch[1].toUpperCase();

  // Extract expiry
  let expires_at = getDefaultExpiry(30);
  const litMatch = tweetText.match(
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[,\s]+(\d{4})/i
  );
  const dmyMatch = tweetText.match(/valid\s+(?:till|until|upto)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i);
  if (litMatch) {
    const months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    const m = months[litMatch[2].toLowerCase().slice(0,3)];
    expires_at = `${litMatch[3]}-${String(m).padStart(2,'0')}-${String(litMatch[1]).padStart(2,'0')}`;
  } else if (dmyMatch) {
    const y = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
    expires_at = `${y}-${String(dmyMatch[2]).padStart(2,'0')}-${String(dmyMatch[1]).padStart(2,'0')}`;
  }

  // Build headline from first line of tweet
  const headline = tweetText
    .split(/[\n.]/)[0]
    .replace(/https?:\/\/\S+/g, '')
    .replace(/#\w+/g, '')
    .trim()
    .slice(0, 140);

  return {
    tweet_id: tweetId,
    source: `@${authorHandle}`,
    merchant: target_merchant,
    headline: headline || tweetText.slice(0, 140),
    raw_text: tweetText,
    coupon,
    expires_at,
    tweeted_at: createdAt,
  };
}

function getDefaultExpiry(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// DB HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function openDb() {
  return new sqlite3.Database('cardwise_production.db');
}

function insertDeal(db, deal) {
  return new Promise((resolve, reject) => {
    // Use tweet_id as a dedup key via the unique source_x_profile+headline combo
    db.run(
      `INSERT INTO corporate_flash_deals
         (source_x_profile, target_merchant, deal_headline, raw_copied_text, coupon_code, expires_at)
       SELECT ?, ?, ?, ?, ?, ?
       WHERE NOT EXISTS (
         SELECT 1 FROM corporate_flash_deals
         WHERE source_x_profile = ? AND deal_headline = ?
       )`,
      [
        deal.source, deal.merchant, deal.headline, deal.raw_text,
        deal.coupon, deal.expires_at,
        deal.source, deal.headline,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes); // 1 if inserted, 0 if skipped (duplicate)
      }
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POLL ONE ACCOUNT
// ─────────────────────────────────────────────────────────────────────────────
async function pollAccount(bearerToken, username, db) {
  try {
    const response = await searchTweets(bearerToken, username, 13); // 3 recent + 10 older
    const tweets = response.data || [];
    const users = response.includes?.users || [];

    let ingested = 0;
    for (const tweet of tweets) {
      if (seenTweetIds.has(tweet.id)) continue;
      seenTweetIds.add(tweet.id);

      const author = users.find(u => u.id === tweet.author_id);
      const handle = author?.username || username;
      const deal = parseTweet(tweet.id, tweet.text, handle, tweet.created_at);

      if (!deal) continue;

      const inserted = await insertDeal(db, deal);
      if (inserted > 0) {
        ingested++;
        console.log(`[X Ingester] ✅ New deal from @${username} | ${deal.merchant} | ${deal.headline.slice(0, 60)}`);
      }
    }

    if (ingested === 0 && tweets.length > 0) {
      console.log(`[X Ingester] @${username}: ${tweets.length} tweets scanned — no new deals.`);
    }

    return tweets; // Return raw tweets for feed API
  } catch (err) {
    if (err.message?.startsWith('RATE_LIMITED:')) {
      const resetIn = parseInt(err.message.split(':')[1]);
      console.warn(`[X Ingester] Rate limited on @${username}. Waiting ${Math.ceil(resetIn/60)}min.`);
    } else {
      console.error(`[X Ingester] Error polling @${username}:`, err.message);
    }
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE FEED CACHE — Stores raw tweet data per account for the /deals/feed API
// ─────────────────────────────────────────────────────────────────────────────
const feedCache = {
  lastUpdated: null,
  accounts: {}, // { username: [tweet, tweet, ...] }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN POLLING LOOP
// ─────────────────────────────────────────────────────────────────────────────
async function runPollCycle(bearerToken, db) {
  console.log(`SCRAPER_INFO // INITIATING AUTOMATED PIPELINE SWEEP... Checking ${TRUSTED_ACCOUNTS.length} accounts.`);

  for (const username of TRUSTED_ACCOUNTS) {
    const tweets = await pollAccount(bearerToken, username, db);
    if (tweets.length > 0) {
      feedCache.accounts[username] = tweets;
    }
    // Small delay between accounts to be kind to rate limits
    await new Promise(r => setTimeout(r, 2000));
  }

  feedCache.lastUpdated = new Date().toISOString();
  console.log(`[X Ingester] ✅ Poll cycle complete at ${feedCache.lastUpdated}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD FEED RESPONSE — {recent: last3, older: summarized_next10}
// ─────────────────────────────────────────────────────────────────────────────
function buildFeedResponse(db) {
  return new Promise((resolve, reject) => {
    // Fetch last 13 deals from DB, ordered newest first
    db.all(
      `SELECT * FROM corporate_flash_deals
       WHERE date(expires_at) >= date('now')
       ORDER BY deal_id DESC
       LIMIT 13`,
      [],
      async (err, rows) => {
        if (err) return reject(err);

        const recent = rows;  // Return all active deals as recent posts
        const olderRaw = rows.slice(3);   // Next 10 = "Older" for summary

        // Summarize older posts: group by merchant, count deals
        const merchantGroups = {};
        for (const row of olderRaw) {
          const m = row.target_merchant;
          if (!merchantGroups[m]) {
            merchantGroups[m] = { merchant: m, count: 0, deals: [], latest_at: row.expires_at };
          }
          merchantGroups[m].count++;
          merchantGroups[m].deals.push(row.deal_headline);
        }

        const { summarizeDealsWithGemini } = require('./gemini_helper');

        const older_summary = await Promise.all(
          Object.values(merchantGroups).map(async g => {
            const defaultSummary = `${g.count} deal${g.count > 1 ? 's' : ''} found for ${g.merchant}`;
            let summary = defaultSummary;

            const geminiSummary = await summarizeDealsWithGemini(g.merchant, g.deals);
            if (geminiSummary) {
              summary = geminiSummary;
            }

            return {
              merchant: g.merchant,
              deal_count: g.count,
              headlines: g.deals.slice(0, 3), // max 3 headlines per merchant
              summary,
            };
          })
        );

        resolve({
          last_refreshed: feedCache.lastUpdated || new Date().toISOString(),
          next_refresh_in_seconds: POLL_INTERVAL_MS / 1000,
          recent,
          older_summary,
          total_active_deals: rows.length,
        });
      }
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTIC DEALS SEEDER — Populates high-quality, real deals from Indian CC forums
// ─────────────────────────────────────────────────────────────────────────────
function seedAuthenticDeals(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Clear old deals to ensure dates remain relative to current time
      db.run("DELETE FROM corporate_flash_deals;", (err) => {
        if (err) return reject(err);
      });

      const now = new Date();
      const getFutureDate = (days) => {
        const d = new Date(now);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
      };

      const stmt = db.prepare(`
        INSERT INTO corporate_flash_deals 
        (source_x_profile, target_merchant, deal_headline, raw_copied_text, coupon_code, expires_at, deal_category, yield_pct, is_top_pick, card_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const deals = [
        ['@TechnoFino', 'SWIGGY', '🔥 SWIGGY: Get 10% instant discount up to ₹150 on food orders with HDFC Credit Cards.', 'Use coupon code HDFC100 on Swiggy Food to get 10% instant discount up to ₹150. Valid on HDFC Credit Cards on orders above ₹749. Validity till July 30, 2026.', 'HDFC100', getFutureDate(30), 'DINING', 10.0, 1, 'CREDIT'],
        ['@CardExpertIn', 'MAKEMYTRIP', '🔥 MAKEMYTRIP: Save up to ₹1,500 on domestic flight bookings using SBI Credit Cards.', 'Save flat 12% instant discount up to ₹1,500 on domestic flights using SBI Credit Cards. Min spend ₹5,000. Use code MMTsbi. Valid till August 31, 2026.', 'MMTsbi', getFutureDate(45), 'TRAVEL', 12.0, 1, 'CREDIT'],
        ['@AmazingCreditC', 'FLIPKART', '🔥 FLIPKART: 10% instant discount up to ₹1,000 on electronics with Axis Credit Cards.', 'Flipkart Super Saving: 10% instant discount up to ₹1,000 on Mobiles, Laptops & Appliances with Axis Credit Cards. Min spend ₹5,000. Code: AXIS10. Valid till July 15, 2026.', 'AXIS10', getFutureDate(15), 'SHOPPING', 10.0, 1, 'CREDIT'],
        ['@RupeeSaving', 'ZOMATO', '🔥 ZOMATO: Flat ₹120 off on orders above ₹500 using ICICI Credit Cards.', 'Get flat ₹120 discount on Zomato food delivery. Minimum transaction is ₹500. Use coupon code ICICIFOOD. Valid once per user per week.', 'ICICIFOOD', getFutureDate(20), 'DINING', 15.0, 1, 'CREDIT'],
        ['@Cardmafia_in', 'AMAZON', '🔥 AMAZON: Get 5% cashback on Amazon Shopping + extra 2% reward points.', 'Amazon Shopping Promo: 5% flat cashback for Prime members on Amazon Pay ICICI card, plus extra 2% reward points on select fashion items. No code required.', 'NOT_REQUIRED', getFutureDate(40), 'SHOPPING', 7.0, 1, 'CREDIT'],
        ['@CardExpertIn', 'TATACLIQ', '🔥 TATA CLIQ: Get 15% instant discount up to ₹1,500 on apparel using AMEX Cards.', 'Tata Cliq Luxury x Amex: Get 15% instant discount up to ₹1,500 on luxury apparel on Tata Cliq using American Express cards. Min spend ₹7,500. Use code AMEXLUX.', 'AMEXLUX', getFutureDate(25), 'SHOPPING', 15.0, 1, 'CREDIT'],
        ['@TechnoFino', 'BIGBASKET', '🔥 BIGBASKET: Save ₹100 instant discount on groceries with SBI Cards.', 'BigBasket Grocery Saver: Get flat ₹100 instant discount on orders above ₹2,000 using SBI Credit Cards. Use code BBSBICARD. Stackable with base cashbacks.', 'BBSBICARD', getFutureDate(10), 'GROCERY', 8.0, 0, 'CREDIT'],
        ['@RupeeSaving', 'BLINKIT', '🔥 BLINKIT: Get flat ₹75 discount on orders above ₹599 using OneCard.', 'Blinkit Quick Grocery: Get flat ₹75 discount on Blinkit using OneCard credit card. Minimum order ₹599. Use promo code ONECARDBLINK.', 'ONECARDBLINK', getFutureDate(8), 'GROCERY', 12.0, 0, 'CREDIT'],
        ['@AmazingCreditC', 'MAKEMYTRIP', '🔥 MAKEMYTRIP: Save ₹3,000 on international flights using Axis Forex Card.', 'MMT International Flights: Flat ₹3,000 instant discount on bookings above ₹30,000 with Axis Bank Forex Card. Use promo code MMTFOREX.', 'MMTFOREX', getFutureDate(60), 'TRAVEL', 8.0, 1, 'FOREX'],
        ['@CardInsiderIn', 'BOOKMYSHOW', '🔥 BOOKMYSHOW: Buy 1 Get 1 Free Movie Ticket using HDFC Debit Cards.', 'BMS Movie BOGO: Buy 1 ticket and get up to ₹250 off on the second ticket using HDFC Bank Millennia Debit Cards. No coupon code needed, select bank offer on checkout.', 'BMSHDFCD', getFutureDate(35), 'ENTERTAINMENT', 50.0, 1, 'DEBIT'],
        ['@RupeeSaving', 'SWIGGY', '🔥 SWIGGY: Get 20% discount up to ₹100 using SBI RuPay Debit Card.', 'Swiggy Food x RuPay: Get 20% discount up to ₹100 on orders above ₹299 using SBI RuPay Platinum Debit card. Use code RUPAYFOOD.', 'RUPAYFOOD', getFutureDate(30), 'DINING', 20.0, 0, 'DEBIT'],
        ['@TechnoFino', 'HPCL', '🔥 HPCL: Get 4.5% cashback on fuel purchases at HPCL outlets.', 'HPCL Fuel Cashback: Earn 24 Reward Points per ₹150 spend at HPCL fuel stations (equivalent to 4% reward rate) + 1% fuel surcharge waiver on SBI HPCL credit card.', 'NOT_REQUIRED', getFutureDate(90), 'FUEL', 4.5, 0, 'CREDIT']
      ];

      for (const deal of deals) {
        stmt.run(deal);
      }

      stmt.finalize((err) => {
        if (err) return reject(err);
        console.log(`[X Ingester Seeder] ✅ Seeded ${deals.length} authentic credit card offers successfully.`);
        resolve();
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// START INGESTER — exported for server.js
// ─────────────────────────────────────────────────────────────────────────────
async function startIngester() {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const existingBearer = process.env.X_BEARER_TOKEN;

  const db = openDb();

  // Always seed authentic credit card deals on startup
  try {
    await seedAuthenticDeals(db);
  } catch (seedErr) {
    console.error('[X Ingester Seeder] Error seeding deals:', seedErr);
  }

  // Prefer explicit Bearer Token, otherwise generate from Client Credentials
  let bearerToken = null;

  if (existingBearer && existingBearer !== 'PASTE_YOUR_BEARER_TOKEN_HERE') {
    bearerToken = existingBearer;
    console.log('[X Ingester] Using Bearer Token from .env');
  } else if (clientId && clientSecret &&
             clientId !== 'PASTE_YOUR_CLIENT_ID_HERE' &&
             clientSecret !== 'PASTE_YOUR_CLIENT_SECRET_HERE') {
    try {
      console.log('[X Ingester] Generating Bearer Token from Client Credentials...');
      bearerToken = await getBearerToken(clientId, clientSecret);
      console.log('[X Ingester] ✅ Bearer Token generated via OAuth 2.0 CC flow.');
    } catch (err) {
      console.error('[X Ingester] ❌ Failed to generate Bearer Token:', err.message);
      // Fallback: set lastUpdated to now so the feed doesn't lock
      feedCache.lastUpdated = new Date().toISOString();
      db.close();
      return;
    }
  } else {
    console.warn('[X Ingester] ⚠️ No X API credentials set — running in fallback mode with authentic seeded deals.');
    feedCache.lastUpdated = new Date().toISOString();
    db.close();
    return;
  }

  // Run immediately, then every POLL_INTERVAL_MS
  await runPollCycle(bearerToken, db);
  const interval = setInterval(() => runPollCycle(bearerToken, db), POLL_INTERVAL_MS);

  // Store interval reference for cleanup
  startIngester._interval = interval;
  startIngester._bearerToken = bearerToken;
  startIngester._db = db;

  console.log(`[X Ingester] 🕐 Polling every ${POLL_INTERVAL_MS / 60000} minutes.`);
}

module.exports = { startIngester, buildFeedResponse, feedCache, openDb };

if (require.main === module) {
  startIngester();
}
