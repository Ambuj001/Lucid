import sqlite3

def seed_database():
    conn = sqlite3.connect("cardwise_production.db")
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Insert Core Target Banking Entities
    cursor.execute("""
    INSERT INTO banks (bank_id, display_name, customer_support_phone, grievance_email) VALUES
    ('SBI', 'SBI Card', '1860-180-1290', 'nodalofficer@sbicard.com'),
    ('HDFC', 'HDFC Bank', '1800-266-4332', 'grievance.redressal@hdfcbank.com'),
    ('ICICI', 'ICICI Bank', '1800-200-3344', 'headservicequality@icicibank.com'),
    ('AXIS', 'Axis Bank', '1800-419-5555', 'pno@axisbank.com')
    ON CONFLICT (bank_id) DO NOTHING;
    """)

    # 2. Populate High-Yield Credit Card Instruments
    cursor.execute("""
    INSERT INTO cards (card_id, bank_id, card_name, card_type, card_network, joining_fee_inr, annual_fee_inr, spend_waiver_threshold_inr) VALUES
    ('in_sbi_cashback_credit', 'SBI', 'SBI Cashback', 'CREDIT', 'VISA', 999.00, 999.00, 200000.00),
    ('in_hdfc_infinia_metal', 'HDFC', 'Infinia Metal', 'CREDIT', 'VISA', 12500.00, 12500.00, 1000000.00),
    ('in_icici_amazon_pay_credit', 'ICICI', 'Amazon Pay ICICI', 'CREDIT', 'VISA', 0.00, 0.00, NULL),
    ('in_axis_ace_credit', 'AXIS', 'Axis Ace', 'CREDIT', 'VISA', 499.00, 499.00, 200000.00)
    ON CONFLICT (card_id) DO NOTHING;
    """)

    # 3. Map Crucial ISO 18245 Merchant Category Codes (MCC)
    cursor.execute("""
    INSERT INTO mcc_directory (mcc_code, industry_group, clean_category_name) VALUES
    ('5310', 'Retail', 'Online Marketplace & Department Stores'),
    ('5812', 'Dining', 'Restaurants, Food Outlets & Food Delivery'),
    ('9399', 'Government', 'Government Services & Public Funds'),
    ('4900', 'Utilities', 'Electric, Gas, Water & Sanitary Utilities')
    ON CONFLICT (mcc_code) DO NOTHING;
    """)

    # Clean existing rules before seeding to prevent duplicate rules in SQLite testing environment
    cursor.execute("DELETE FROM reward_rules;")

    # 4. Inject Rigid Reward Parameters and Trap Interceptions
    cursor.executemany("""
    INSERT INTO reward_rules (card_id, mcc_code, is_completely_excluded, base_reward_percentage, points_multiplier, point_to_inr_valuation, monthly_capping_inr, gimmick_warning_text) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?);
    """, [
        # SBI CASHBACK CREDIT CARD MECHANICS
        ('in_sbi_cashback_credit', '5310', 0, 5.00, 1.0, 1.0000, 5000.00, None),
        ('in_sbi_cashback_credit', '5812', 0, 5.00, 1.0, 1.0000, 5000.00, None),
        ('in_sbi_cashback_credit', '9399', 1, 0.00, 1.0, 1.0000, 0.00, '⚠️ Gimmick Alert: All government transactions and savings plans earn a flat 0% rewards cycle on this card variant.'),
        ('in_sbi_cashback_credit', '4900', 1, 0.00, 1.0, 1.0000, 0.00, '⚠️ Category Exclusion: Utility bill cycles have been fully devalued to 0% reward yield.'),

        # HDFC INFINIA METAL MECHANICS
        ('in_hdfc_infinia_metal', '5310', 0, 3.33, 1.0, 1.0000, None, 'Base reward is 3.33% cash-equivalent points when redeemed for travel/flights via SmartBuy portal.'),
        ('in_hdfc_infinia_metal', '5812', 0, 3.33, 1.0, 1.0000, None, None),
        ('in_hdfc_infinia_metal', '4900', 0, 3.33, 1.0, 1.0000, 2000.00, '⚠️ Reward Cap: Utility points accumulation is strictly limited to a maximum of 2,000 reward points per statement cycle.'),

        # AMAZON PAY ICICI MECHANICS
        ('in_icici_amazon_pay_credit', '5310', 0, 5.00, 1.0, 1.0000, None, 'Yield is 5% strictly for Amazon Prime accounts; non-Prime account variants drop to a baseline of 3% cashback.'),
        ('in_icici_amazon_pay_credit', '5812', 0, 2.00, 1.0, 1.0000, None, None),
        ('in_icici_amazon_pay_credit', '4900', 0, 2.00, 1.0, 1.0000, None, None),

        # AXIS ACE MECHANICS
        ('in_axis_ace_credit', '4900', 0, 5.00, 1.0, 1.0000, 500.00, '⚠️ Transaction Trap: 5% utility cashback is only valid if paid via Google Pay portal. Earnings are hard-capped at Rs. 500 per month.')
    ])

    conn.commit()
    conn.close()
    print("Database seeded with production master data successfully.")

if __name__ == "__main__":
    seed_database()
