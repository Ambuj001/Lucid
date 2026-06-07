const jwt = require('jsonwebtoken');

// Load environment variables if any, or default
const JWT_SECRET = process.env.SECRET_KEY || 'cardwise_fallback_secret_key';

// Generate token
const token = jwt.sign({ sub: 'usr_prod_101_cardwise@cardwise.com' }, JWT_SECRET, { expiresIn: '24h' });

async function runTest() {
  const payload = {
    current_url: "https://www.amazon.in/dp/B0D12345",
    extracted_product_title: "Samsung Galaxy Flagship Smartphone",
    extracted_cart_total: "65000"
  };

  console.log("Sending intercept request for Marriott (MCC 7011/Travel/Hotel)...");
  try {
    const response = await fetch('http://localhost:3000/api/v1/engine/extension-intercept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("\nResponse Status:", response.status);
    console.log("\nTop Recommendation Details:");
    console.log(JSON.stringify(data.top_recommendation, null, 2));

    console.log("\nAlternative Cards Matrix:");
    console.log(JSON.stringify(data.alternative_cards_matrix, null, 2));

    console.log("\nPoints Redemption Intel:");
    console.log(JSON.stringify(data.points_redemption_intel, null, 2));
    
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
