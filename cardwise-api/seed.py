"""Seed 8 Indian credit cards with full MCC-based rules"""
import asyncio
from database import engine, AsyncSessionLocal, Base
from models import Card

CARDS = [
  {
    "id": "sbi_cashback",
    "name": "SBI Cashback Credit Card",
    "issuer": "SBI Card",
    "network": "Visa",
    "annual_fee": 999,
    "rules": [
      {"categories": ["Ecommerce"], "cashback_pct": 5, "points_per_100": 0, "cap_monthly": 5000, "surcharge_waiver": False},
      {"categories": ["ALL"],        "cashback_pct": 1, "points_per_100": 0, "cap_monthly": 50000, "surcharge_waiver": False},
    ],
    "offers": [
      {"merchant": "amazon.in", "discount_pct": 5, "valid_until": "2025-12-31", "description": "5% cashback on Amazon"},
      {"merchant": "flipkart.com", "discount_pct": 5, "valid_until": "2025-12-31", "description": "5% cashback on Flipkart"},
    ]
  },
  {
    "id": "hdfc_millennia",
    "name": "HDFC Millennia Credit Card",
    "issuer": "HDFC Bank",
    "network": "Mastercard",
    "annual_fee": 1000,
    "rules": [
      {"categories": ["Ecommerce", "Apparel", "Beauty"], "cashback_pct": 5, "points_per_100": 0, "cap_monthly": 1000, "surcharge_waiver": False},
      {"categories": ["Food", "Grocery"],                "cashback_pct": 2.5, "points_per_100": 0, "cap_monthly": 400, "surcharge_waiver": False},
      {"categories": ["ALL"],                            "cashback_pct": 1, "points_per_100": 0, "cap_monthly": 50000, "surcharge_waiver": False},
    ],
    "offers": []
  },
  {
    "id": "axis_ace",
    "name": "Axis Ace Credit Card",
    "issuer": "Axis Bank",
    "network": "Visa",
    "annual_fee": 499,
    "rules": [
      {"categories": ["Food"],     "cashback_pct": 5,   "points_per_100": 0, "cap_monthly": 500,   "surcharge_waiver": False},
      {"categories": ["Grocery", "Utility", "Telecom"], "cashback_pct": 4, "points_per_100": 0, "cap_monthly": 400, "surcharge_waiver": False},
      {"categories": ["ALL"],      "cashback_pct": 2,   "points_per_100": 0, "cap_monthly": 50000, "surcharge_waiver": False},
    ],
    "offers": [
      {"merchant": "swiggy.com", "discount_pct": 5, "valid_until": "2025-12-31", "description": "5% cashback on Swiggy"},
    ]
  },
  {
    "id": "amazon_pay_icici",
    "name": "Amazon Pay ICICI Credit Card",
    "issuer": "ICICI Bank",
    "network": "Visa",
    "annual_fee": 0,
    "rules": [
      {"categories": ["Ecommerce"], "cashback_pct": 5, "points_per_100": 0, "cap_monthly": 50000, "surcharge_waiver": False},
      {"categories": ["Food"],      "cashback_pct": 2, "points_per_100": 0, "cap_monthly": 1000,  "surcharge_waiver": False},
      {"categories": ["ALL"],       "cashback_pct": 1, "points_per_100": 0, "cap_monthly": 50000, "surcharge_waiver": False},
    ],
    "offers": [
      {"merchant": "amazon.in", "discount_pct": 5, "valid_until": "2025-12-31", "description": "Prime: 5% | Non-Prime: 3%"},
    ]
  },
  {
    "id": "idfc_first_millennia",
    "name": "IDFC FIRST Millennia Credit Card",
    "issuer": "IDFC FIRST Bank",
    "network": "Visa",
    "annual_fee": 0,
    "rules": [
      {"categories": ["Ecommerce", "Food", "Travel"],  "cashback_pct": 0, "points_per_100": 6, "cap_monthly": 50000, "surcharge_waiver": False},
      {"categories": ["ALL"],                          "cashback_pct": 0, "points_per_100": 3, "cap_monthly": 50000, "surcharge_waiver": False},
    ],
    "offers": []
  },
  {
    "id": "hdfc_regalia",
    "name": "HDFC Regalia Gold Credit Card",
    "issuer": "HDFC Bank",
    "network": "Mastercard",
    "annual_fee": 2500,
    "rules": [
      {"categories": ["Travel", "Entertainment"], "cashback_pct": 0, "points_per_100": 10, "cap_monthly": 50000, "surcharge_waiver": False},
      {"categories": ["Grocery"],                 "cashback_pct": 0, "points_per_100": 5,  "cap_monthly": 50000, "surcharge_waiver": False},
      {"categories": ["ALL"],                     "cashback_pct": 0, "points_per_100": 4,  "cap_monthly": 50000, "surcharge_waiver": False},
    ],
    "offers": []
  },
  {
    "id": "icici_amazon_biz",
    "name": "ICICI Business Advantage Black Card",
    "issuer": "ICICI Bank",
    "network": "American Express",
    "annual_fee": 1999,
    "rules": [
      {"categories": ["Fuel"],  "cashback_pct": 0, "points_per_100": 0, "cap_monthly": 250, "surcharge_waiver": True},
      {"categories": ["Travel"],"cashback_pct": 4, "points_per_100": 0, "cap_monthly": 2000,"surcharge_waiver": False},
      {"categories": ["ALL"],   "cashback_pct": 2, "points_per_100": 0, "cap_monthly": 5000,"surcharge_waiver": False},
    ],
    "offers": []
  },
  {
    "id": "tata_neu_infinity_hdfc",
    "name": "Tata Neu Infinity HDFC Credit Card",
    "issuer": "HDFC Bank",
    "network": "Mastercard",
    "annual_fee": 1499,
    "rules": [
      {"categories": ["Ecommerce", "Apparel"],   "cashback_pct": 5, "points_per_100": 0, "cap_monthly": 50000, "surcharge_waiver": False},
      {"categories": ["Grocery", "Telecom"],      "cashback_pct": 2, "points_per_100": 0, "cap_monthly": 1000, "surcharge_waiver": False},
      {"categories": ["ALL"],                     "cashback_pct": 1, "points_per_100": 0, "cap_monthly": 50000, "surcharge_waiver": False},
    ],
    "offers": []
  },
]

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for data in CARDS:
            existing = await session.get(Card, data["id"])
            if not existing:
                card = Card(**data)
                session.add(card)
        await session.commit()
        print(f"[OK] Seeded {len(CARDS)} cards successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
