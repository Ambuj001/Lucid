import sqlite3

def init_db():
    conn = sqlite3.connect("cardwise_production.db")
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Master Bank Directory
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS banks (
        bank_id TEXT PRIMARY KEY, -- e.g., 'HDFC', 'AXIS', 'SBI', 'ICICI', 'PNB'
        display_name TEXT NOT NULL,
        customer_support_phone TEXT,
        grievance_email TEXT
    );
    """)

    # 2. Master Cards and Variants Directory
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cards (
        card_id TEXT PRIMARY KEY, -- e.g., 'in_hdfc_infinia_metal', 'in_sbi_cashback_credit'
        bank_id TEXT REFERENCES banks(bank_id) ON DELETE RESTRICT,
        card_name TEXT NOT NULL,
        card_type TEXT NOT NULL CHECK (card_type IN ('CREDIT', 'DEBIT', 'FOREX')),
        card_network TEXT NOT NULL CHECK (card_network IN ('VISA', 'MASTERCARD', 'RUPAY', 'AMEX')),
        joining_fee_inr REAL DEFAULT 0.00,
        annual_fee_inr REAL DEFAULT 0.00,
        spend_waiver_threshold_inr REAL DEFAULT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. ISO 18245 Merchant Category Codes (MCC) Master List
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mcc_directory (
        mcc_code TEXT PRIMARY KEY, -- e.g., '5812', '5310'
        industry_group TEXT NOT NULL,
        clean_category_name TEXT NOT NULL
    );
    """)

    # 4. Unified Reward Mechanics and Structural Rules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_rules (
        rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT REFERENCES cards(card_id) ON DELETE CASCADE,
        mcc_code TEXT REFERENCES mcc_directory(mcc_code) ON DELETE RESTRICT,
        is_completely_excluded INTEGER DEFAULT 0, -- 1 for True, 0 for False
        base_reward_percentage REAL NOT NULL DEFAULT 0.00,
        points_multiplier REAL DEFAULT 1.0,
        point_to_inr_valuation REAL NOT NULL DEFAULT 1.0000,
        monthly_capping_inr REAL DEFAULT NULL,
        gimmick_warning_text TEXT DEFAULT NULL
    );
    """)

    # 5. User Portfolio Ledger
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY, -- UUID as string
        email_address TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. Active User Wallets
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_wallets (
        wallet_entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
        card_id TEXT REFERENCES cards(card_id) ON DELETE RESTRICT,
        card_network_override TEXT CHECK (card_network_override IN ('VISA', 'MASTERCARD', 'RUPAY', 'AMEX')),
        date_added TEXT DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_card_combination UNIQUE (user_id, card_id)
    );
    """)

    # 7. Automated Live Flash Deals & Pricing Faults Feed
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS active_flash_deals (
        deal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_profile_x TEXT NOT NULL,
        card_id TEXT REFERENCES cards(card_id) ON DELETE CASCADE,
        target_merchant_string TEXT NOT NULL,
        bonus_multiplier_value REAL NOT NULL,
        raw_source_text TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        discovered_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT NOT NULL
    );
    """)

    # 8. Corporate Flash Deals Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS corporate_flash_deals (
        deal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_x_profile TEXT NOT NULL,
        target_merchant TEXT NOT NULL,
        deal_headline TEXT NOT NULL,
        raw_copied_text TEXT NOT NULL,
        coupon_code TEXT DEFAULT 'NOT_REQUIRED',
        expires_at TEXT NOT NULL,
        deal_category TEXT DEFAULT 'GENERAL',
        yield_pct REAL DEFAULT 0.0,
        is_top_pick INTEGER DEFAULT 0,
        card_type TEXT DEFAULT 'CREDIT'
    );
    """)

    # 9. User Financial Profiles for AI Recommendation and Planning
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_financial_profiles (
        user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
        age INTEGER NOT NULL,
        annual_income_inr REAL NOT NULL,
        reward_goal TEXT NOT NULL CHECK (reward_goal IN ('CASHBACK', 'AIRMILES', 'HOTEL_POINTS', 'MAX_YIELD')),
        spend_dining_inr REAL DEFAULT 0.00,
        spend_grocery_inr REAL DEFAULT 0.00,
        spend_shopping_inr REAL DEFAULT 0.00,
        spend_utilities_inr REAL DEFAULT 0.00,
        spend_travel_inr REAL DEFAULT 0.00,
        spend_fuel_inr REAL DEFAULT 0.00,
        spend_insurance_inr REAL DEFAULT 0.00,
        spend_rent_inr REAL DEFAULT 0.00,
        spend_others_inr REAL DEFAULT 0.00,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("Local SQLite cardwise_production.db initialized successfully.")

if __name__ == "__main__":
    init_db()
