from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ── Cards ─────────────────────────────────────────────────────────────────────
class CardOut(BaseModel):
    id: str
    name: str
    issuer: str
    network: str
    annual_fee: float
    rules: List[Any]
    offers: List[Any]
    class Config: from_attributes = True

class WalletAddRequest(BaseModel):
    card_id: str

class UserWalletCardOut(BaseModel):
    id: str
    name: str
    issuer: str
    network: str
    annual_fee: float
    rules: List[Any]
    offers: List[Any]
    nickname: Optional[str] = None
    card_category: Optional[str] = None
    card_network: Optional[str] = None
    card_limit: Optional[float] = 100000.0
    available_balance: Optional[float] = 100000.0
    class Config: from_attributes = True

class WalletCardUpdateRequest(BaseModel):
    nickname: Optional[str] = None
    card_category: Optional[str] = None
    card_network: Optional[str] = None
    card_limit: Optional[float] = None
    available_balance: Optional[float] = None

# ── Engine ────────────────────────────────────────────────────────────────────
class EvaluateRequest(BaseModel):
    checkout_domain: str
    declared_transaction_value_inr: float

class CardRanking(BaseModel):
    rank: int
    card_id: str
    card_name: str
    issuer: str
    net_saving_inr: float
    cashback_pct: float
    surcharge_fee_inr: float
    net_yield_pct: float
    badge: str
    reason: str

class EvaluateResponse(BaseModel):
    mcc_identified: str
    category: str
    transaction_amount: float
    best_card: str
    best_card_id: str
    total_saving: float
    ai_reason: str
    rankings: List[CardRanking]

# ── Logs ──────────────────────────────────────────────────────────────────────
class LogOut(BaseModel):
    id: int
    domain: str
    mcc: Optional[str]
    best_card_name: Optional[str]
    transaction_amount: Optional[float]
    net_saving: Optional[float]
    reason: Optional[str]
    created_at: datetime
    class Config: from_attributes = True

# ── Extension Intercept ────────────────────────────────────────────────────────
class ExtensionInterceptRequest(BaseModel):
    user_id: str
    current_url: str
    extracted_product_title: str
    extracted_cart_total: float

class PriceHistoryItem(BaseModel):
    date: str
    price_inr: float

class TopRecommendation(BaseModel):
    card_id: str
    display_label: str
    card_name: str
    nickname: Optional[str] = None
    issuer: str
    card_category: Optional[str] = None
    card_network: Optional[str] = None
    card_limit: Optional[float] = 100000.0
    available_balance: Optional[float] = 100000.0
    net_saving: float
    cashback_pct: float
    net_yield_percentage: float
    strategy_alert: str

class AlternativeCardItem(BaseModel):
    card_name: str
    nickname: Optional[str] = None
    issuer: str
    card_category: Optional[str] = None
    card_network: Optional[str] = None
    multiplier_label: str
    cashback_pct: float
    net_saving: float
    net_yield_percentage: float

class ExtensionInterceptResponse(BaseModel):
    price_history: List[PriceHistoryItem]
    price_evaluation_badge: str
    top_recommendation: TopRecommendation
    alternative_cards_matrix: List[AlternativeCardItem]
