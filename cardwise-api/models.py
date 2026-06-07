from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    wallets = relationship("UserWallet", back_populates="user")
    logs = relationship("RecommendationLog", back_populates="user")

class Card(Base):
    __tablename__ = "cards"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    network = Column(String, nullable=False)
    annual_fee = Column(Float, default=0)
    # rules: list of {mcc, category, cashback_pct, points_per_100, multiplier, cap_monthly, surcharge_waiver}
    rules = Column(JSON, nullable=False, default=[])
    # offers: list of {merchant, discount_pct, valid_until, description}
    offers = Column(JSON, nullable=False, default=[])
    wallets = relationship("UserWallet", back_populates="card")

class UserWallet(Base):
    __tablename__ = "user_wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    card_id = Column(String, ForeignKey("cards.id"), nullable=False)
    nickname = Column(String, nullable=True)
    card_category = Column(String, nullable=True) # Gold, Platinum, Titanium, Signature, Infinite, World, Select
    card_network = Column(String, nullable=True) # Visa, Mastercard, RuPay, Amex
    card_limit = Column(Float, default=100000.0)
    available_balance = Column(Float, default=100000.0)
    user = relationship("User", back_populates="wallets")
    card = relationship("Card", back_populates="wallets")

class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    domain = Column(String, nullable=False)
    mcc = Column(String)
    best_card_id = Column(String)
    best_card_name = Column(String)
    transaction_amount = Column(Float)
    net_saving = Column(Float)
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="logs")

class PriceHistory(Base):
    __tablename__ = "price_history"
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True, nullable=False)  # amazon.in, flipkart.com, etc.
    product_name = Column(String, nullable=False)  # extracted product title
    product_url = Column(String, nullable=True)  # product page URL
    price_inr = Column(Float, nullable=False)  # price at this point in time
    currency = Column(String, default="INR")
    tracked_at = Column(DateTime, default=datetime.utcnow, index=True)  # when price was tracked
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # which user found this price
