from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/v1/deals", tags=["deals"])

@router.get("/feed")
async def get_feed():
    return {
        "recent": [
            {
                "deal_id": "d1",
                "platform": "X",
                "author_handle": "@AmazingCreditC",
                "content": "SBI Cashback is giving flat 5% on Amazon right now! Huge deal! 🚀🔥",
                "timestamp": "2026-06-05T10:00:00Z"
            },
            {
                "deal_id": "d2",
                "platform": "X",
                "author_handle": "@DealsIndia",
                "content": "HDFC Millennia 5% cashback trick for Zomato. Check this thread.",
                "timestamp": "2026-06-05T09:30:00Z"
            }
        ],
        "older_summary": []
    }

@router.get("/top-picks")
async def get_top_picks():
    return [
        {
            "id": "tp1",
            "title": "Amazon Great Indian Sale",
            "description": "Up to 10% off with SBI Cards",
            "url": "https://amazon.in"
        }
    ]

@router.get("/structured")
async def get_structured(category: str = "ALL", card_type: str = "ALL"):
    return {
        "deals": [
            {
                "id": "sd1",
                "merchant": "Swiggy",
                "category": "Food",
                "card_type": "Axis Ace",
                "discount_text": "Flat 5% Cashback",
                "valid_until": "2026-12-31"
            }
        ]
    }
