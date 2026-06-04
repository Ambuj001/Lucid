-- Cardwise Core Production Database Initialization
-- Strict 0-approximation data architecture

-- 1. Master Bank Directory
CREATE TABLE banks (
    bank_id VARCHAR(50) PRIMARY KEY, -- e.g., 'HDFC', 'AXIS', 'SBI', 'ICICI', 'PNB'
    display_name VARCHAR(100) NOT NULL,
    customer_support_phone VARCHAR(20),
    grievance_email VARCHAR(100)
);

-- 2. Master Cards and Variants Directory
CREATE TABLE cards (
    card_id VARCHAR(100) PRIMARY KEY, -- e.g., 'in_hdfc_infinia_metal', 'in_sbi_cashback_credit'
    bank_id VARCHAR(50) REFERENCES banks(bank_id) ON DELETE RESTRICT,
    card_name VARCHAR(150) NOT NULL,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('CREDIT', 'DEBIT', 'FOREX')),
    card_network VARCHAR(20) NOT NULL CHECK (card_network IN ('VISA', 'MASTERCARD', 'RUPAY', 'AMEX')),
    joining_fee_inr NUMERIC(10, 2) DEFAULT 0.00,
    annual_fee_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_waiver_threshold_inr NUMERIC(10, 2) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ISO 18245 Merchant Category Codes (MCC) Master List
CREATE TABLE mcc_directory (
    mcc_code VARCHAR(4) PRIMARY KEY, -- e.g., '5812', '5310', '9399'
    industry_group VARCHAR(100) NOT NULL,
    clean_category_name VARCHAR(100) NOT NULL -- e.g., 'Dining & Restaurants', 'Government Services'
);

-- 4. Unified Reward Mechanics and Structural Rules Table
CREATE TABLE reward_rules (
    rule_id BIGSERIAL PRIMARY KEY,
    card_id VARCHAR(100) REFERENCES cards(card_id) ON DELETE CASCADE,
    mcc_code VARCHAR(4) REFERENCES mcc_directory(mcc_code) ON DELETE RESTRICT,
    is_completely_excluded BOOLEAN DEFAULT FALSE, -- True if category yields flat 0% (e.g., fuel/rent)
    base_reward_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Pure cash-back equivalent multiplier value
    points_multiplier NUMERIC(4, 1) DEFAULT 1.0, -- e.g., 5.0 for 5X points
    point_to_inr_valuation NUMERIC(6, 4) NOT NULL DEFAULT 1.0000, -- e.g., 1 point = 0.2500 INR
    monthly_capping_inr NUMERIC(10, 2) DEFAULT NULL, -- Hard ceiling limit per statement cycle
    gimmick_warning_text TEXT DEFAULT NULL -- Explanatory string if the calculation contains a marketing trap
);

-- 5. User Portfolio Ledger
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_address VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Active User Wallets (The Manual Links)
CREATE TABLE user_wallets (
    wallet_entry_id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    card_id VARCHAR(100) REFERENCES cards(card_id) ON DELETE RESTRICT,
    card_network_override VARCHAR(20) CHECK (card_network_override IN ('VISA', 'MASTERCARD', 'RUPAY', 'AMEX')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_card_combination UNIQUE (user_id, card_id)
);

-- 7. Automated Live Flash Deals & Pricing Faults Feed
CREATE TABLE active_flash_deals (
    deal_id BIGSERIAL PRIMARY KEY,
    source_profile_x VARCHAR(50) NOT NULL,
    card_id VARCHAR(100) REFERENCES cards(card_id) ON DELETE CASCADE,
    target_merchant_string VARCHAR(150) NOT NULL, -- e.g., 'AMAZON', 'ZOMATO'
    bonus_multiplier_value NUMERIC(5, 2) NOT NULL,
    raw_source_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 8. User Financial Profiles for AI Recommendation and Planning
CREATE TABLE user_financial_profiles (
    user_id VARCHAR(100) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    age INTEGER NOT NULL,
    annual_income_inr NUMERIC(15, 2) NOT NULL,
    reward_goal VARCHAR(20) NOT NULL CHECK (reward_goal IN ('CASHBACK', 'AIRMILES', 'HOTEL_POINTS', 'MAX_YIELD')),
    spend_dining_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_grocery_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_shopping_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_utilities_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_travel_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_fuel_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_insurance_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_rent_inr NUMERIC(10, 2) DEFAULT 0.00,
    spend_others_inr NUMERIC(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

