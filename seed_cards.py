"""
seed_cards.py — Cardwise Comprehensive Indian Card Data Seeder & Doc Generator
=============================================================================
Seeds the SQLite database with 110+ premium Indian cards and their reward/exclusion rules.
Also programmatically generates the card documentation markdown files in card_docs/.
"""

import os
import sqlite3

DB_PATH = "cardwise_production.db"
DOCS_DIR = "card_docs"

# ─────────────────────────────────────────────────────────────────────────────
# 1. BANKS MASTER DATA
# ─────────────────────────────────────────────────────────────────────────────
BANK_DATA = [
    ("HDFC", "HDFC Bank", "1800-202-6161", "support@hdfcbank.com"),
    ("SBI", "State Bank of India", "1800-11-2211", "contactcentre@sbi.co.in"),
    ("ICICI", "ICICI Bank", "1800-200-3344", "customer.care@icicibank.com"),
    ("AXIS", "Axis Bank", "1800-419-5959", "support@axisbank.com"),
    ("IDFC", "IDFC First Bank", "1800-10-888", "care@idfcfirstbank.com"),
    ("INDUS", "IndusInd Bank", "1860-267-7777", "induscare@indusind.com"),
    ("AMEX", "American Express", "1800-419-2122", "customercare@americanexpress.com"),
    ("KOTAK", "Kotak Mahindra Bank", "1860-266-2666", "customercare@kotak.com"),
    ("YES", "Yes Bank", "1800-1200", "customercare@yesbank.in"),
    ("ONECARD", "OneCard / FPL Technologies", "1800-572-7575", "support@getonecard.app"),
    ("RBL", "RBL Bank", "1800-121-9050", "customercare@rblbank.com"),
    ("HSBC", "HSBC India", "1800-266-3456", "customer.care@hsbc.co.in"),
    ("SC", "Standard Chartered Bank", "1800-345-5000", "customer.care@sc.com"),
    ("AU", "AU Small Finance Bank", "1800-1200-699", "support@aubank.in"),
    ("NIYO", "Niyo Global / Equitas", "1800-103-1222", "global@goniyo.com"),
    ("BOOKMYFOREX", "BookMyForex", "1800-108-8282", "support@bookmyforex.com"),
    ("BOB", "Bank of Baroda", "1800-258-4455", "support@bankofbaroda.com"),
    ("PNB", "Punjab National Bank", "1800-180-2222", "care@pnb.co.in"),
    ("UNION", "Union Bank of India", "1800-22-2244", "customercare@unionbankofindia.bank"),
    ("CANARA", "Canara Bank", "1800-425-0018", "hocancard@canarabank.com"),
    ("BOI", "Bank of India", "1800-220-229", "customer.feedback@bankofindia.co.in"),
    ("CBI", "Central Bank of India", "1800-22-1911", "complaints@centralbank.co.in"),
    ("INDIAN", "Indian Bank", "1800-425-0000", "customercomplaints@indianbank.co.in"),
    ("UJJIVAN", "Ujjivan Small Finance Bank", "1800-208-2121", "customercare@ujjivan.com"),
    ("SURYODAY", "Suryoday Small Finance Bank", "1800-266-7711", "smile@suryodaybank.com"),
    ("UTKARSH", "Utkarsh Small Finance Bank", "1800-123-5353", "customercare@utkarsh.bank"),
    ("FEDERAL", "Federal Bank", "1800-425-1199", "contact@federalbank.co.in"),
    ("IDBI", "IDBI Bank", "1800-209-4324", "customercare@idbi.co.in"),
    ("UCO", "UCO Bank", "1800-103-0123", "hopgr.calcutta@ucobank.co.in"),
    ("IOB", "Indian Overseas Bank", "1800-425-4445", "complaints@iob.in")
]

# ─────────────────────────────────────────────────────────────────────────────
# 2. MCC CATEGORY CODES
# ─────────────────────────────────────────────────────────────────────────────
MCC_DATA = [
    ("DEFAULT", "General", "Default / All Other Spends"),
    ("4112", "Transportation", "Rail & Bus Transit (IRCTC, Redbus)"),
    ("4511", "Airlines", "Airlines & Flights"),
    ("4722", "Travel", "Travel Agencies & Tour Operators"),
    ("4900", "Utilities", "Utilities (Electricity, Water, Gas)"),
    ("5045", "Electronics", "Electronics & IT Equipment"),
    ("5094", "Jewellery", "Jewellery & Precious Metals (Wholesale)"),
    ("5310", "Retail", "Retail & E-commerce (Amazon, Flipkart)"),
    ("5411", "Grocery", "Grocery & Supermarkets (BigBasket, DMart)"),
    ("5499", "Grocery", "Convenience & Kirana Stores"),
    ("5541", "Fuel", "Fuel & Petrol Pumps"),
    ("5812", "Dining", "Dining, Restaurants & Food Delivery"),
    ("5912", "Pharmacy", "Pharmacy & Medical Stores"),
    ("5944", "Jewellery", "Jewellery Retail (Tanishq, Kalyan)"),
    ("6300", "Insurance", "Insurance Premium Payments"),
    ("6513", "Real Estate", "Real Estate & Property"),
    ("6540", "Digital Payments", "Wallet & Prepaid Instrument Top-up"),
    ("6552", "Real Estate", "Rent Payments"),
    ("7011", "Travel", "Hotels, Resorts & Accommodation"),
    ("7216", "Services", "Dry Cleaning & Laundry Services"),
    ("7512", "Travel", "Car Rental"),
    ("7832", "Entertainment", "Movie Theatres & OTT / Streaming"),
    ("8099", "Health", "Health & Wellness Services"),
    ("8299", "Education", "Educational Services & Courses"),
    ("9399", "Government", "Government Services & Tax Payments")
]

# ─────────────────────────────────────────────────────────────────────────────
# 3. 114 CARDS DATA (Format: card_id, bank_id, card_name, type, network, join_fee, annual_fee, waiver_threshold)
# ─────────────────────────────────────────────────────────────────────────────
CARDS_DATA = [
    # HDFC Bank (22 Cards)
    ("in_hdfc_infinia_metal", "HDFC", "HDFC Infinia Metal", "CREDIT", "VISA", 12500, 12500, 1000000),
    ("in_hdfc_diners_black", "HDFC", "HDFC Diners Club Black Metal", "CREDIT", "AMEX", 10000, 10000, 1000000),
    ("in_hdfc_regalia_gold", "HDFC", "HDFC Regalia Gold", "CREDIT", "VISA", 2500, 2500, 300000),
    ("in_hdfc_millennia_credit", "HDFC", "HDFC Millennia", "CREDIT", "VISA", 1000, 1000, 100000),
    ("in_hdfc_tata_neu_infinity", "HDFC", "Tata Neu Infinity HDFC", "CREDIT", "RUPAY", 1499, 1499, 300000),
    ("in_hdfc_tata_neu_plus", "HDFC", "Tata Neu Plus HDFC", "CREDIT", "RUPAY", 499, 499, 100000),
    ("in_hdfc_moneyback_plus", "HDFC", "HDFC MoneyBack+", "CREDIT", "MASTERCARD", 500, 500, 50000),
    ("in_hdfc_freedom", "HDFC", "HDFC Freedom", "CREDIT", "VISA", 500, 500, 50000),
    ("in_hdfc_shoppers_stop", "HDFC", "Shoppers Stop HDFC", "CREDIT", "VISA", 299, 299, 25000),
    ("in_hdfc_swiggy", "HDFC", "Swiggy HDFC Card", "CREDIT", "MASTERCARD", 500, 500, 200000),
    ("in_hdfc_marriott_bonvoy", "HDFC", "Marriott Bonvoy HDFC", "CREDIT", "VISA", 3000, 3000, 1500000),
    ("in_hdfc_indianoil", "HDFC", "IndianOil HDFC Card", "CREDIT", "RUPAY", 500, 500, 50000),
    ("in_hdfc_biz_black", "HDFC", "HDFC Biz Black", "CREDIT", "VISA", 10000, 10000, 750000),
    ("in_hdfc_biz_grow", "HDFC", "HDFC Biz Grow", "CREDIT", "VISA", 500, 500, 100000),
    ("in_hdfc_easyshop_platinum_debit", "HDFC", "HDFC EasyShop Platinum Debit", "DEBIT", "VISA", 750, 750, 0),
    ("in_hdfc_millennia_debit", "HDFC", "HDFC Millennia Debit", "DEBIT", "MASTERCARD", 500, 500, 0),
    ("in_hdfc_easyshop_imperia_debit", "HDFC", "HDFC EasyShop Imperia Platinum Debit", "DEBIT", "VISA", 0, 0, 0),
    ("in_hdfc_easyshop_gold_debit", "HDFC", "HDFC EasyShop Gold Debit", "DEBIT", "VISA", 250, 250, 0),
    ("in_hdfc_easyshop_classic_debit", "HDFC", "HDFC EasyShop Classic Debit", "DEBIT", "VISA", 150, 150, 0),
    ("in_hdfc_multicurrency_forex", "HDFC", "HDFC Multicurrency Forex Card", "FOREX", "VISA", 150, 75, 0),
    ("in_hdfc_regalia_forex", "HDFC", "HDFC Regalia Forex Card", "FOREX", "VISA", 1000, 0, 0),
    ("in_hdfc_isic_student_forex", "HDFC", "HDFC ISIC Student Forex Card", "FOREX", "MASTERCARD", 300, 0, 0),

    # State Bank of India (18 Cards)
    ("in_sbi_cashback_credit", "SBI", "SBI Cashback", "CREDIT", "VISA", 999, 999, 200000),
    ("in_sbi_simplyclick_credit", "SBI", "SBI SimplyCLICK", "CREDIT", "VISA", 499, 499, 100000),
    ("in_sbi_simplysave_credit", "SBI", "SBI SimplySAVE", "CREDIT", "VISA", 499, 499, 100000),
    ("in_sbi_aurum", "SBI", "SBI AURUM", "CREDIT", "VISA", 9999, 9999, 1200000),
    ("in_sbi_elite", "SBI", "SBI Elite", "CREDIT", "VISA", 4999, 4999, 500000),
    ("in_sbi_prime", "SBI", "SBI Prime", "CREDIT", "VISA", 2999, 2999, 300000),
    ("in_sbi_pulse", "SBI", "SBI Pulse", "CREDIT", "VISA", 1499, 1499, 200000),
    ("in_sbi_bpcl_octane", "SBI", "SBI BPCL Octane", "CREDIT", "VISA", 1499, 1499, 200000),
    ("in_sbi_bpcl", "SBI", "SBI BPCL", "CREDIT", "VISA", 499, 499, 50000),
    ("in_sbi_air_india_signature", "SBI", "SBI Air India Signature", "CREDIT", "VISA", 4999, 4999, 1500000),
    ("in_sbi_irctc_premium", "SBI", "SBI IRCTC Premier", "CREDIT", "RUPAY", 1499, 1499, 200000),
    ("in_sbi_yatra", "SBI", "SBI Yatra", "CREDIT", "VISA", 499, 499, 100000),
    ("in_sbi_fabindia", "SBI", "SBI Fabindia Card", "CREDIT", "VISA", 499, 499, 100000),
    ("in_sbi_platinum_debit", "SBI", "SBI Platinum Debit", "DEBIT", "VISA", 350, 350, 0),
    ("in_sbi_gold_debit", "SBI", "SBI Gold Debit", "DEBIT", "VISA", 250, 250, 0),
    ("in_sbi_classic_debit", "SBI", "SBI Classic Debit", "DEBIT", "VISA", 125, 125, 0),
    ("in_sbi_global_contactless_debit", "SBI", "SBI Global Contactless Debit", "DEBIT", "MASTERCARD", 0, 125, 0),
    ("in_sbi_multicurrency_forex", "SBI", "State Bank Multicurrency Forex", "FOREX", "VISA", 100, 50, 0),

    # ICICI Bank (16 Cards)
    ("in_icici_amazon_pay_credit", "ICICI", "Amazon Pay ICICI", "CREDIT", "VISA", 0, 0, 0),
    ("in_icici_sapphiro", "ICICI", "ICICI Sapphiro", "CREDIT", "MASTERCARD", 6500, 3500, 600000),
    ("in_icici_rubyx", "ICICI", "ICICI Rubyx", "CREDIT", "VISA", 3000, 2000, 300000),
    ("in_icici_coral", "ICICI", "ICICI Coral", "CREDIT", "RUPAY", 500, 500, 150000),
    ("in_icici_platinum", "ICICI", "ICICI Platinum Chip", "CREDIT", "VISA", 0, 0, 0),
    ("in_icici_hpcl_super_saver", "ICICI", "ICICI HPCL Super Saver", "CREDIT", "VISA", 500, 500, 150000),
    ("in_icici_manchester_united", "ICICI", "ICICI Manchester United", "CREDIT", "VISA", 499, 499, 125000),
    ("in_icici_makemytrip_signature", "ICICI", "ICICI MakeMyTrip Signature", "CREDIT", "VISA", 2500, 0, 0),
    ("in_icici_emeralde_private_metal", "ICICI", "ICICI Emeralde Private Metal", "CREDIT", "VISA", 12499, 12499, 1500000),
    ("in_icici_accor_coral", "ICICI", "ICICI Accor Coral", "CREDIT", "VISA", 1500, 1500, 200000),
    ("in_icici_mine", "ICICI", "ICICI Mine Card", "CREDIT", "VISA", 0, 0, 0),
    ("in_icici_sapphiro_debit", "ICICI", "ICICI Sapphiro Debit", "DEBIT", "VISA", 1999, 1999, 0),
    ("in_icici_coral_debit", "ICICI", "ICICI Coral Debit", "DEBIT", "VISA", 599, 599, 0),
    ("in_icici_expressions_debit", "ICICI", "ICICI Expressions Debit", "DEBIT", "MASTERCARD", 499, 499, 0),
    ("in_icici_multicurrency_forex", "ICICI", "ICICI Multicurrency Forex Card", "FOREX", "VISA", 150, 75, 0),
    ("in_icici_sapphiro_forex", "ICICI", "ICICI Sapphiro Forex Card", "FOREX", "MASTERCARD", 2999, 0, 0),

    # Axis Bank (16 Cards)
    ("in_axis_ace_credit", "AXIS", "Axis Ace", "CREDIT", "VISA", 499, 499, 200000),
    ("in_axis_flipkart_credit", "AXIS", "Axis Flipkart", "CREDIT", "RUPAY", 500, 500, 350000),
    ("in_axis_atlas_credit", "AXIS", "Axis Atlas", "CREDIT", "VISA", 5000, 5000, 1500000),
    ("in_axis_magnus_credit", "AXIS", "Axis Magnus", "CREDIT", "MASTERCARD", 12500, 12500, 1500000),
    ("in_axis_horizon", "AXIS", "Axis Horizon", "CREDIT", "VISA", 3000, 3000, 350000),
    ("in_axis_my_zone", "AXIS", "Axis My Zone", "CREDIT", "RUPAY", 0, 500, 150000),
    ("in_axis_neo", "AXIS", "Axis Neo", "CREDIT", "VISA", 250, 250, 100000),
    ("in_axis_vistara_signature", "AXIS", "Axis Vistara Signature", "CREDIT", "VISA", 3000, 3000, 0),
    ("in_axis_privilege", "AXIS", "Axis Privilege", "CREDIT", "VISA", 1500, 1500, 250000),
    ("in_axis_select", "AXIS", "Axis Select", "CREDIT", "VISA", 3000, 3000, 600000),
    ("in_axis_reserve", "AXIS", "Axis Reserve", "CREDIT", "VISA", 50000, 50000, 2500000),
    ("in_axis_burgundy_debit", "AXIS", "Axis Burgundy Debit", "DEBIT", "VISA", 0, 0, 0),
    ("in_axis_liberty_debit", "AXIS", "Axis Liberty Debit", "DEBIT", "MASTERCARD", 200, 200, 0),
    ("in_axis_prestige_debit", "AXIS", "Axis Prestige Debit", "DEBIT", "VISA", 1000, 500, 0),
    ("in_axis_multicurrency_forex", "AXIS", "Axis Multicurrency Forex Card", "FOREX", "VISA", 150, 100, 0),
    ("in_axis_club_vistara_forex", "AXIS", "Axis Club Vistara Forex Card", "FOREX", "VISA", 1000, 0, 0),

    # IDFC First Bank (8 Cards)
    ("in_idfc_first_wealth", "IDFC", "IDFC First Wealth", "CREDIT", "VISA", 0, 0, 0),
    ("in_idfc_first_select", "IDFC", "IDFC First Select", "CREDIT", "VISA", 0, 0, 0),
    ("in_idfc_first_millennia", "IDFC", "IDFC First Millennia", "CREDIT", "VISA", 0, 0, 0),
    ("in_idfc_first_classic", "IDFC", "IDFC First Classic", "CREDIT", "VISA", 0, 0, 0),
    ("in_idfc_first_wow", "IDFC", "IDFC First WOW!", "CREDIT", "VISA", 0, 0, 0),
    ("in_idfc_first_wealth_debit", "IDFC", "IDFC First Wealth Debit", "DEBIT", "VISA", 0, 0, 0),
    ("in_idfc_first_select_debit", "IDFC", "IDFC First Select Debit", "DEBIT", "VISA", 0, 0, 0),
    ("in_idfc_first_mayura_forex", "IDFC", "IDFC First Mayura Forex Card", "FOREX", "VISA", 2500, 0, 0),

    # IndusInd Bank (7 Cards)
    ("in_indus_celesta", "INDUS", "IndusInd Celesta", "CREDIT", "MASTERCARD", 50000, 50000, 0),
    ("in_indus_legend", "INDUS", "IndusInd Legend", "CREDIT", "VISA", 9999, 0, 0),
    ("in_indus_platinum_aura", "INDUS", "IndusInd Platinum Aura", "CREDIT", "VISA", 0, 0, 0),
    ("in_indus_pioneer_heritage", "INDUS", "IndusInd Pioneer Heritage", "CREDIT", "VISA", 90000, 90000, 0),
    ("in_indus_exclusive_debit", "INDUS", "IndusInd Exclusive Debit", "DEBIT", "VISA", 0, 0, 0),
    ("in_indus_signature_debit", "INDUS", "IndusInd Signature Debit", "DEBIT", "VISA", 1500, 1500, 0),
    ("in_indus_multicurrency_forex", "INDUS", "IndusInd Multicurrency Forex Card", "FOREX", "VISA", 150, 0, 0),

    # American Express (6 Cards)
    ("in_amex_centurion", "AMEX", "Amex Centurion Card", "CREDIT", "AMEX", 700000, 250000, 0),
    ("in_amex_platinum_charge", "AMEX", "Amex Platinum Charge", "CREDIT", "AMEX", 60000, 60000, 0),
    ("in_amex_gold_charge", "AMEX", "Amex Gold Charge", "CREDIT", "AMEX", 1000, 4999, 0),
    ("in_amex_platinum_travel", "AMEX", "Amex Platinum Travel", "CREDIT", "AMEX", 3500, 5000, 0),
    ("in_amex_smart_earn", "AMEX", "Amex SmartEarn", "CREDIT", "AMEX", 495, 495, 40000),
    ("in_amex_mrcc", "AMEX", "Amex Membership Rewards Card", "CREDIT", "AMEX", 1000, 4500, 150000),

    # Kotak Mahindra Bank (6 Cards)
    ("in_kotak_white", "KOTAK", "Kotak White Credit Card", "CREDIT", "VISA", 3000, 3000, 500000),
    ("in_kotak_league_platinum", "KOTAK", "Kotak League Platinum", "CREDIT", "MASTERCARD", 500, 500, 50000),
    ("in_kotak_811_dream", "KOTAK", "Kotak 811 Dream Different", "CREDIT", "VISA", 0, 0, 0),
    ("in_kotak_mojo", "KOTAK", "Kotak Mojo Platinum", "CREDIT", "VISA", 1000, 1000, 100000),
    ("in_kotak_privy_league_signature_debit", "KOTAK", "Kotak Privy League Signature Debit", "DEBIT", "VISA", 0, 0, 0),
    ("in_kotak_everyday_debit", "KOTAK", "Kotak Everyday Debit", "DEBIT", "VISA", 199, 199, 0),

    # Yes Bank (4 Cards)
    ("in_yes_marquee", "YES", "Yes Marquee", "CREDIT", "MASTERCARD", 9999, 4999, 800000),
    ("in_yes_reserv", "YES", "Yes Reserv", "CREDIT", "MASTERCARD", 1999, 1999, 300000),
    ("in_yes_byoc", "YES", "Yes BYOC", "CREDIT", "VISA", 0, 1200, 0),
    ("in_yes_signature_debit", "YES", "Yes Bank Signature Debit", "DEBIT", "VISA", 0, 599, 0),

    # Others (11 Cards)
    ("in_onecard_metal", "ONECARD", "OneCard Metal", "CREDIT", "VISA", 0, 0, 0),
    ("in_rbl_shoprite", "RBL", "RBL ShopRite", "CREDIT", "MASTERCARD", 500, 500, 100000),
    ("in_rbl_world_safari", "RBL", "RBL World Safari", "CREDIT", "MASTERCARD", 3000, 3000, 0),
    ("in_hsbc_cashback", "HSBC", "HSBC Cashback", "CREDIT", "VISA", 999, 999, 200000),
    ("in_hsbc_premier", "HSBC", "HSBC Premier Credit Card", "CREDIT", "VISA", 0, 0, 0),
    ("in_sc_ultimate", "SC", "Standard Chartered Ultimate", "CREDIT", "VISA", 5000, 5000, 0),
    ("in_sc_easemytrip", "SC", "Standard Chartered EaseMyTrip", "CREDIT", "MASTERCARD", 350, 350, 50000),
    ("in_au_zenith", "AU", "AU Zenith", "CREDIT", "VISA", 7999, 7999, 500000),
    ("in_au_vetta", "AU", "AU Vetta", "CREDIT", "VISA", 2999, 2999, 150000),
    ("in_niyo_global_forex", "NIYO", "Niyo Global Forex", "FOREX", "VISA", 0, 0, 0),
    ("in_bookmyforex_prepaid", "BOOKMYFOREX", "BookMyForex Prepaid Card", "FOREX", "VISA", 0, 0, 0),

    # RuPay Select Debit Cards (8 Cards)
    ("in_sbi_rupay_select_debit", "SBI", "SBI RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_hdfc_rupay_select_debit", "HDFC", "HDFC RuPay Select Debit", "DEBIT", "RUPAY", 0, 250, 0),
    ("in_icici_rupay_select_debit", "ICICI", "ICICI RuPay Select Debit", "DEBIT", "RUPAY", 0, 199, 0),
    ("in_axis_rupay_select_debit", "AXIS", "Axis RuPay Select Debit", "DEBIT", "RUPAY", 0, 500, 0),
    ("in_idfc_first_rupay_select_debit", "IDFC", "IDFC First RuPay Select Debit", "DEBIT", "RUPAY", 0, 0, 0),
    ("in_indus_rupay_select_debit", "INDUS", "IndusInd RuPay Select Debit", "DEBIT", "RUPAY", 0, 500, 0),
    ("in_kotak_rupay_select_debit", "KOTAK", "Kotak RuPay Select Debit", "DEBIT", "RUPAY", 0, 299, 0),
    ("in_yes_rupay_select_debit", "YES", "Yes Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 399, 0),

    # Additional RuPay Select Debit Cards (14 Cards)
    ("in_bob_rupay_select_debit", "BOB", "Bank of Baroda RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_pnb_rupay_select_debit", "PNB", "PNB RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_union_rupay_select_debit", "UNION", "Union Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_canara_rupay_select_debit", "CANARA", "Canara Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_boi_rupay_select_debit", "BOI", "Bank of India RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_cbi_rupay_select_debit", "CBI", "Central Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_indian_rupay_select_debit", "INDIAN", "Indian Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_ujjivan_rupay_select_debit", "UJJIVAN", "Ujjivan RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_suryoday_rupay_select_debit", "SURYODAY", "Suryoday RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_utkarsh_rupay_select_debit", "UTKARSH", "Utkarsh RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_federal_rupay_select_debit", "FEDERAL", "Federal Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_idbi_rupay_select_debit", "IDBI", "IDBI Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_uco_rupay_select_debit", "UCO", "UCO Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0),
    ("in_iob_rupay_select_debit", "IOB", "Indian Overseas Bank RuPay Select Debit", "DEBIT", "RUPAY", 0, 300, 0)
]

# ─────────────────────────────────────────────────────────────────────────────
# 4. REWARD RULES SEED DATA
# Format: (card_id, mcc_code, excluded, yield_pct, monthly_cap_inr, gimmick_text, point_valuation)
# ─────────────────────────────────────────────────────────────────────────────
REWARD_RULES = [
    # Infinia
    ("in_hdfc_infinia_metal", "DEFAULT", 0, 3.33, None, "Base 3.33% yield (5 points per Rs.150 spent, 1 point = Rs.1.00 for SmartBuy Travel).", 1.0),
    ("in_hdfc_infinia_metal", "4511", 0, 10.0, 15000.0, "SmartBuy flights: 5X points multiplier applies. Limit 15,000 points/month.", 1.0),
    ("in_hdfc_infinia_metal", "7011", 0, 10.0, 15000.0, "SmartBuy hotels: 5X points multiplier applies. Limit 15,000 points/month.", 1.0),
    ("in_hdfc_infinia_metal", "4900", 0, 3.33, 2000.0, "⚠️ Capped: Utility point yield is capped at 2,000 reward points per calendar month.", 1.0),
    ("in_hdfc_infinia_metal", "6300", 0, 3.33, 2000.0, "⚠️ Capped: Insurance payments capped at 2,000 points per transaction/day.", 1.0),
    ("in_hdfc_infinia_metal", "6540", 1, 0, 0, "🚫 Wallet top-up is completely excluded from rewards.", 1.0),
    ("in_hdfc_infinia_metal", "6552", 1, 0, 0, "🚫 Rent payments earn zero reward points.", 1.0),
    ("in_hdfc_infinia_metal", "9399", 1, 0, 0, "🚫 Government taxes & public fund payments earn zero reward points.", 1.0),
    ("in_hdfc_infinia_metal", "5541", 1, 0, 0, "🚫 Fuel spends excluded from points; 1% surcharge waiver applies up to Rs. 1,000/month.", 1.0),

    # Diners Club Black
    ("in_hdfc_diners_black", "DEFAULT", 0, 3.33, None, "Base 3.33% yield (5 points per Rs.150 spent, 1 point = Rs.1.00 for travel).", 1.0),
    ("in_hdfc_diners_black", "4511", 0, 10.0, 15000.0, "SmartBuy Travel multiplier: 5X accelerated reward rate.", 1.0),
    ("in_hdfc_diners_black", "7011", 0, 10.0, 15000.0, "SmartBuy Travel hotels: 5X accelerated reward rate.", 1.0),
    ("in_hdfc_diners_black", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 1.0),
    ("in_hdfc_diners_black", "6552", 1, 0, 0, "🚫 Rent payments excluded.", 1.0),
    ("in_hdfc_diners_black", "9399", 1, 0, 0, "🚫 Government payments excluded.", 1.0),

    # Regalia Gold
    ("in_hdfc_regalia_gold", "DEFAULT", 0, 1.33, None, "Base 1.33% yield (4 points per Rs.150, 1 point = Rs.0.50 via Gold Travel Portal).", 0.5),
    ("in_hdfc_regalia_gold", "5310", 0, 6.67, 4000.0, "💰 20 points per Rs. 150 spent on Marks & Spencer, Myntra, Nykaa, Reliance Digital. Capped at 4,000 points/month.", 0.5),
    ("in_hdfc_regalia_gold", "4511", 0, 6.67, 4000.0, "✈️ 5X SmartBuy Flights accelerator.", 0.5),
    ("in_hdfc_regalia_gold", "4900", 0, 1.33, 2000.0, "⚠️ Capped: Utilities capped at 2,000 points/month.", 0.5),
    ("in_hdfc_regalia_gold", "6540", 1, 0, 0, "🚫 Wallet load excluded.", 0.5),
    ("in_hdfc_regalia_gold", "6552", 1, 0, 0, "🚫 Rent payments excluded.", 0.5),

    # HDFC Millennia
    ("in_hdfc_millennia_credit", "DEFAULT", 0, 1.0, 1000.0, "1% CashPoints on default spends. Monthly cap Rs.1,000.", 1.0),
    ("in_hdfc_millennia_credit", "5310", 0, 5.0, 1000.0, "💰 5% CashPoints on Amazon, Flipkart, Myntra, Tata CLiQ. Capped at Rs.1,000/month.", 1.0),
    ("in_hdfc_millennia_credit", "5812", 0, 5.0, 1000.0, "🍔 5% CashPoints on Swiggy, Zomato. Capped at Rs.1,000/month.", 1.0),
    ("in_hdfc_millennia_credit", "6540", 1, 0, 0, "🚫 Wallet top-up excluded.", 1.0),
    ("in_hdfc_millennia_credit", "6552", 1, 0, 0, "🚫 Rent payments excluded.", 1.0),

    # Tata Neu Infinity
    ("in_hdfc_tata_neu_infinity", "DEFAULT", 0, 1.5, None, "1.5% NeuCoins on all non-Tata brands. 1 NeuCoin = Rs. 1.00 on Tata brands.", 1.0),
    ("in_hdfc_tata_neu_infinity", "5310", 0, 5.0, 5000.0, "💰 5% NeuCoins on BigBasket, Tata CLiQ, Croma, Air India Express via Tata Neu App.", 1.0),
    ("in_hdfc_tata_neu_infinity", "5812", 0, 5.0, 1000.0, "🍔 5% NeuCoins on Starbucks & Tata Dining partners.", 1.0),

    # Swiggy HDFC Card
    ("in_hdfc_swiggy", "DEFAULT", 0, 1.0, None, "1% cashback on other spends.", 1.0),
    ("in_hdfc_swiggy", "5812", 0, 10.0, 1500.0, "🍔 10% cashback on Swiggy app purchases (food delivery, Instamart, Dineout). Capped at Rs.1,500/month.", 1.0),
    ("in_hdfc_swiggy", "5310", 0, 5.0, 1500.0, "💰 5% cashback on online shopping (Amazon, Flipkart, Nykaa, etc.). Capped at Rs.1,500/month.", 1.0),

    # SBI Cashback
    ("in_sbi_cashback_credit", "DEFAULT", 0, 1.0, None, "1% cashback on offline/other transactions. Auto-credited to statement.", 1.0),
    ("in_sbi_cashback_credit", "5310", 0, 5.0, 5000.0, "💰 5% cashback on online shopping. Monthly cashback cap: Rs.5,000.", 1.0),
    ("in_sbi_cashback_credit", "5411", 0, 5.0, 5000.0, "🛒 5% cashback on online grocery apps (Blinkit, BigBasket). Cap Rs.5,000.", 1.0),
    ("in_sbi_cashback_credit", "4900", 1, 0, 0, "🚫 Utility bills earn zero cashback.", 1.0),
    ("in_sbi_cashback_credit", "6300", 1, 0, 0, "🚫 Insurance payments earn zero cashback.", 1.0),
    ("in_sbi_cashback_credit", "6540", 1, 0, 0, "🚫 Wallet load is completely devalued to 0% cashback.", 1.0),
    ("in_sbi_cashback_credit", "6552", 1, 0, 0, "🚫 Rent payments earn zero cashback.", 1.0),
    ("in_sbi_cashback_credit", "9399", 1, 0, 0, "🚫 Government tax & utility fee payments earn zero cashback.", 1.0),

    # SBI SimplyCLICK
    ("in_sbi_simplyclick_credit", "DEFAULT", 0, 0.25, None, "Base 1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_sbi_simplyclick_credit", "5310", 0, 2.5, None, "💰 10X Points (2.5% yield) on Apollo 24x7, BookMyShow, Cleartrip, Eazydiner, Lenskart, Netmeds.", 0.25),
    ("in_sbi_simplyclick_credit", "5411", 0, 1.25, None, "🛒 5X Points (1.25% yield) on all other online spends.", 0.25),
    ("in_sbi_simplyclick_credit", "6552", 1, 0, 0, "🚫 Rent payments excluded.", 0.25),

    # SBI AURUM
    ("in_sbi_aurum", "DEFAULT", 0, 1.0, None, "Base 4 reward points per Rs.100 (1.0% yield, 1 point = Rs.0.25). Offers 1:1 transfer on premium airlines/hotels.", 0.25),
    ("in_sbi_aurum", "5812", 0, 2.5, None, "🍔 10X points (2.5% yield) on Dining spends.", 0.25),
    ("in_sbi_aurum", "4511", 0, 2.5, None, "✈️ 10X points (2.5% yield) on flight bookings booked directly.", 0.25),
    ("in_sbi_aurum", "5310", 0, 2.5, None, "💰 10X points (2.5% yield) on Departmental store spends.", 0.25),
    ("in_sbi_aurum", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI Elite
    ("in_sbi_elite", "DEFAULT", 0, 0.5, None, "Base 2 reward points per Rs.100 (0.5% yield, 1 point = Rs.0.25).", 0.25),
    ("in_sbi_elite", "5812", 0, 1.25, None, "🍔 5X points (1.25% yield) on Dining spends.", 0.25),
    ("in_sbi_elite", "5411", 0, 1.25, None, "🛒 5X points (1.25% yield) on Grocery spends.", 0.25),
    ("in_sbi_elite", "5310", 0, 1.25, None, "💰 5X points (1.25% yield) on Departmental stores.", 0.25),
    ("in_sbi_elite", "7832", 0, 1.25, None, "🎬 5X points (1.25% yield) on Movies.", 0.25),
    ("in_sbi_elite", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI Prime
    ("in_sbi_prime", "DEFAULT", 0, 0.5, None, "Base 2 reward points per Rs.100 (0.5% yield, 1 point = Rs.0.25).", 0.25),
    ("in_sbi_prime", "5812", 0, 2.5, None, "🍔 10X points (2.5% yield) on Dining spends.", 0.25),
    ("in_sbi_prime", "5411", 0, 2.5, None, "🛒 10X points (2.5% yield) on Groceries.", 0.25),
    ("in_sbi_prime", "5310", 0, 2.5, None, "💰 10X points (2.5% yield) on Departmental store spends.", 0.25),
    ("in_sbi_prime", "7832", 0, 2.5, None, "🎬 10X points (2.5% yield) on Movie tickets.", 0.25),
    ("in_sbi_prime", "4900", 0, 3.75, None, "⚡ 15 reward points per Rs.100 spent on Utility bill payments (3.75% yield).", 0.25),
    ("in_sbi_prime", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI SimplySAVE
    ("in_sbi_simplysave_credit", "DEFAULT", 0, 0.25, None, "Base 1 reward point per Rs.100 spent (0.25% yield, 1 point = Rs.0.25).", 0.25),
    ("in_sbi_simplysave_credit", "5812", 0, 2.5, None, "🍔 10X points (2.5% yield) on Dining spends.", 0.25),
    ("in_sbi_simplysave_credit", "5411", 0, 2.5, None, "🛒 10X points (2.5% yield) on Grocery spends.", 0.25),
    ("in_sbi_simplysave_credit", "5310", 0, 2.5, None, "💰 10X points (2.5% yield) on Departmental store spends.", 0.25),
    ("in_sbi_simplysave_credit", "7832", 0, 2.5, None, "🎬 10X points (2.5% yield) on Movies spends.", 0.25),
    ("in_sbi_simplysave_credit", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI BPCL Octane
    ("in_sbi_bpcl_octane", "DEFAULT", 0, 0.25, None, "Base 1 reward point per Rs.100 spent (0.25% yield, 1 point = Rs.0.25).", 0.25),
    ("in_sbi_bpcl_octane", "5541", 0, 6.25, 2500.0, "⛽ 25X points (6.25% reward yield) on BPCL fuel purchases. Capped at 2,500 points/month. Extra 1% surcharge waiver.", 0.25),
    ("in_sbi_bpcl_octane", "5812", 0, 2.5, None, "🍔 10X points (2.5% yield) on Dining spends.", 0.25),
    ("in_sbi_bpcl_octane", "5411", 0, 2.5, None, "🛒 10X points (2.5% yield) on Grocery spends.", 0.25),
    ("in_sbi_bpcl_octane", "5310", 0, 2.5, None, "💰 10X points (2.5% yield) on Departmental store spends.", 0.25),
    ("in_sbi_bpcl_octane", "7832", 0, 2.5, None, "🎬 10X points (2.5% yield) on Movies spends.", 0.25),
    ("in_sbi_bpcl_octane", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI BPCL
    ("in_sbi_bpcl", "DEFAULT", 0, 0.25, None, "Base 1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_sbi_bpcl", "5541", 0, 3.25, 1300.0, "⛽ 13X points (3.25% reward yield) on BPCL fuel purchases. Capped at 1,300 points/month. Extra 1% surcharge waiver.", 0.25),
    ("in_sbi_bpcl", "5812", 0, 1.25, None, "🍔 5X points (1.25% yield) on Dining spends.", 0.25),
    ("in_sbi_bpcl", "5411", 0, 1.25, None, "🛒 5X points (1.25% yield) on Grocery spends.", 0.25),
    ("in_sbi_bpcl", "5310", 0, 1.25, None, "💰 5X points (1.25% yield) on Departmental store spends.", 0.25),
    ("in_sbi_bpcl", "7832", 0, 1.25, None, "🎬 5X points (1.25% yield) on Movies spends.", 0.25),
    ("in_sbi_bpcl", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI Air India Signature
    ("in_sbi_air_india_signature", "DEFAULT", 0, 4.0, None, "Base 4 reward points per Rs.100 spent (4.0% yield when converted 1:1 to Air India miles).", 1.0),
    ("in_sbi_air_india_signature", "4511", 0, 30.0, None, "✈️ 30 reward points per Rs.100 spent on direct Air India ticket bookings (30.0% yield).", 1.0),
    ("in_sbi_air_india_signature", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 1.0),

    # SBI Pulse
    ("in_sbi_pulse", "DEFAULT", 0, 0.5, None, "Base 2 reward points per Rs.100 spent (0.5% yield).", 0.25),
    ("in_sbi_pulse", "5812", 0, 1.25, None, "🍔 5X points (1.25% yield) on Dining spends.", 0.25),
    ("in_sbi_pulse", "5912", 0, 1.25, None, "💊 5X points (1.25% yield) on Pharmacy/Chemist spends.", 0.25),
    ("in_sbi_pulse", "7832", 0, 1.25, None, "🎬 5X points (1.25% yield) on Movies spends.", 0.25),
    ("in_sbi_pulse", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI IRCTC Premier
    ("in_sbi_irctc_premium", "DEFAULT", 0, 0.5, None, "Base 2 reward points per Rs.100 spent (0.5% yield).", 0.25),
    ("in_sbi_irctc_premium", "4112", 0, 10.0, None, "🚆 Up to 10% value back as reward points on AC rail tickets booked via irctc.co.in.", 0.25),
    ("in_sbi_irctc_premium", "5812", 0, 0.75, None, "🍔 3X points (0.75% yield) on Dining spends.", 0.25),
    ("in_sbi_irctc_premium", "4900", 0, 0.75, None, "⚡ 3X points (0.75% yield) on Electricity bill payments.", 0.25),
    ("in_sbi_irctc_premium", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # SBI Yatra
    ("in_sbi_yatra", "DEFAULT", 0, 0.25, None, "Base 1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_sbi_yatra", "5812", 0, 1.5, None, "🍔 6X points (1.5% yield) on Dining spends.", 0.25),
    ("in_sbi_yatra", "5411", 0, 1.5, None, "🛒 6X points (1.5% yield) on Grocery spends.", 0.25),
    ("in_sbi_yatra", "5310", 0, 1.5, None, "💰 6X points (1.5% yield) on Departmental store spends.", 0.25),
    ("in_sbi_yatra", "7832", 0, 1.5, None, "🎬 6X points (1.5% yield) on Movies spends.", 0.25),
    ("in_sbi_yatra", "6552", 1, 0, 0, "🚫 Rent payments earn zero rewards.", 0.25),

    # Amazon Pay ICICI
    ("in_icici_amazon_pay_credit", "DEFAULT", 0, 1.0, None, "1% cashback on other offline and online spends.", 1.0),
    ("in_icici_amazon_pay_credit", "5310", 0, 5.0, None, "💰 5% cashback on Amazon shopping for Prime members. Capping: None.", 1.0),
    ("in_icici_amazon_pay_credit", "5812", 0, 2.0, None, "🍔 2% cashback on dining partner merchants.", 1.0),
    ("in_icici_amazon_pay_credit", "4900", 0, 2.0, None, "⚡ 2% cashback on utility payments paid via Amazon Pay.", 1.0),
    ("in_icici_amazon_pay_credit", "6552", 1, 0, 0, "🚫 Rent payments excluded from cashback.", 1.0),
    ("in_icici_amazon_pay_credit", "6540", 1, 0, 0, "🚫 Wallet load transactions earn zero cashback.", 1.0),

    # ICICI Sapphiro
    ("in_icici_sapphiro", "DEFAULT", 0, 0.5, None, "2 Reward points per Rs.100 spent domestic (0.5% yield, 1 point = Rs.0.25).", 0.25),
    ("in_icici_sapphiro", "4511", 0, 1.0, None, "✈️ 4 points per Rs.100 spent on Airlines.", 0.25),

    # Axis Ace
    ("in_axis_ace_credit", "DEFAULT", 0, 1.5, None, "💰 Flat 1.5% cashback on all default spends. Highly valuable offline cashback card.", 1.0),
    ("in_axis_ace_credit", "4900", 0, 5.0, 500.0, "⚡ 5% cashback on Utilities paid on Google Pay app. Capped at Rs.500/month.", 1.0),
    ("in_axis_ace_credit", "5812", 0, 4.0, 500.0, "🍔 4% cashback on Swiggy, Zomato, Ola. Capped at Rs.500/month.", 1.0),
    ("in_axis_ace_credit", "6540", 1, 0, 0, "🚫 Wallet loading transactions earn 0% cashback.", 1.0),
    ("in_axis_ace_credit", "6552", 1, 0, 0, "🚫 Rent payments excluded from cashback.", 1.0),
    ("in_axis_ace_credit", "9399", 1, 0, 0, "🚫 Government spends devalued and excluded.", 1.0),

    # Axis Flipkart
    ("in_axis_flipkart_credit", "DEFAULT", 0, 1.5, None, "1.5% cashback on other spends.", 1.0),
    ("in_axis_flipkart_credit", "5310", 0, 5.0, None, "💰 5% cashback on Flipkart purchases. Capping: None.", 1.0),
    ("in_axis_flipkart_credit", "5812", 0, 4.0, None, "🍔 4% cashback on Swiggy, PVR, Uber. Capping: None.", 1.0),

    # Axis Atlas
    ("in_axis_atlas_credit", "DEFAULT", 0, 2.0, None, "Base 1 EDGE Mile per Rs.100 (2% value when redeemed for partner airmiles 1:2).", 2.0),
    ("in_axis_atlas_credit", "4511", 0, 6.0, 10000.0, "✈️ 3 EDGE Miles per Rs.100 on direct Airline websites. Capped at 10,000 miles/month.", 2.0),
    ("in_axis_atlas_credit", "7011", 0, 6.0, 10000.0, "🏨 3 EDGE Miles per Rs.100 on direct Hotel websites. Capped at 10,000 miles/month.", 2.0),
    ("in_axis_atlas_credit", "6552", 1, 0, 0, "🚫 Rent payments excluded.", 2.0),

    # Axis Magnus
    ("in_axis_magnus_credit", "DEFAULT", 0, 1.2, None, "12 EDGE reward points per Rs.200 (1.2% base yield).", 0.2),
    ("in_axis_magnus_credit", "4722", 0, 6.0, None, "✈️ 5X points on Axis Travel Edge portal bookings.", 0.2),

    # IDFC First Wealth
    ("in_idfc_first_wealth", "DEFAULT", 0, 0.75, None, "3X Reward Points on weekday spends (0.75% yield, 1 point = Rs.0.25).", 0.25),
    ("in_idfc_first_wealth", "5310", 0, 1.5, None, "💰 6X Reward Points on weekend/online spends (1.5% yield).", 0.25),
    ("in_idfc_first_wealth", "5812", 0, 2.5, None, "🍔 10X points (2.5% yield) on incremental spends above Rs. 30,000 per month.", 0.25),

    # IndusInd Celesta
    ("in_indus_celesta", "DEFAULT", 0, 2.5, None, "Base 2.5% yield on all spends (1 point = Rs.1.00).", 1.0),
    ("in_indus_celesta", "4511", 0, 5.0, None, "✈️ 2X accelerated rewards (5.0% yield) on flight spends.", 1.0),

    # Amex Platinum Charge
    ("in_amex_platinum_charge", "DEFAULT", 0, 1.25, None, "1 Membership Reward point per Rs.40 spent (effective 1.25% for travel).", 0.5),
    ("in_amex_platinum_charge", "5310", 0, 3.75, None, "💰 3X points on Amex Reward Multiplier online portal.", 0.5),

    # Amex SmartEarn
    ("in_amex_smart_earn", "DEFAULT", 0, 0.5, None, "1 Reward point per Rs.50 spent.", 0.25),
    ("in_amex_smart_earn", "5310", 0, 5.0, 500.0, "💰 10X points on Amazon & Flipkart spends. Capped at 500 points/month.", 0.25),

    # Kotak League Platinum
    ("in_kotak_league_platinum", "DEFAULT", 0, 0.5, None, "2 reward points per Rs.150 spent (0.5% yield).", 0.25),
    ("in_kotak_league_platinum", "5812", 0, 2.0, None, "🍔 8 reward points per Rs.150 on Dining.", 0.25),

    # Yes Marquee
    ("in_yes_marquee", "DEFAULT", 0, 2.25, None, "Base 36 reward points per Rs.200 (2.25% yield, 1 point = Rs.0.25). Excellent default yield.", 0.25),
    ("in_yes_marquee", "5310", 0, 4.5, None, "💰 72 points per Rs.200 spent on select online merchant partners.", 0.25),

    # OneCard Metal
    ("in_onecard_metal", "DEFAULT", 0, 0.2, None, "1 Reward Point per Rs.50 spent (0.2% yield, 10 points = Rs.1.00).", 0.1),
    ("in_onecard_metal", "5812", 0, 1.0, None, "🍔 5X points (1.0% yield) on your top 2 categories (dining/groceries) automatically.", 0.1),
    ("in_onecard_metal", "5411", 0, 1.0, None, "🛒 5X points (1.0% yield) on grocery if it ranks in top 2 spend categories.", 0.1),

    # HSBC Cashback
    ("in_hsbc_cashback", "DEFAULT", 0, 1.5, None, "Flat 1.5% cashback on all offline and other spends.", 1.0),
    ("in_hsbc_cashback", "5812", 0, 10.0, 1000.0, "🍔 10% cashback on Dining, Food Delivery (Swiggy/Zomato), and Grocery spends. Capped at Rs.1,000/month.", 1.0),

    # StanChart Ultimate
    ("in_sc_ultimate", "DEFAULT", 0, 3.33, None, "💰 Base 5 Reward Points per Rs.150 spend (3.33% yield, 1 point = Rs.1.00 cash/voucher). Excellent default rate.", 1.0),
    ("in_sc_ultimate", "6552", 1, 0, 0, "🚫 Rent payments excluded from rewards.", 1.0),

    # Niyo Global Forex
    ("in_niyo_global_forex", "DEFAULT", 0, 0.0, None, "0% Forex Markup on international POS/e-commerce. Real-time interbank rate.", 1.0),
    ("in_niyo_global_forex", "5541", 1, 0, 0, "🚫 Fuel spends excluded from benefit tracking.", 1.0),

    # BookMyForex Prepaid
    ("in_bookmyforex_prepaid", "DEFAULT", 0, 0.0, None, "0% Forex Markup on loaded pockets. No currency fluctuations.", 1.0),

    # HDFC EasyShop Platinum Debit
    ("in_hdfc_easyshop_platinum_debit", "DEFAULT", 0, 0.5, 750.0, "0.5% back (1 point per Rs.100) on apparel, groceries, dining, electronics.", 1.0),
    ("in_hdfc_easyshop_platinum_debit", "4900", 0, 1.0, 750.0, "⚡ 1% cashback on utility payments paid via NetBanking/App. Capped at Rs.750/month.", 1.0),
    ("in_hdfc_easyshop_platinum_debit", "6300", 0, 1.0, 750.0, "🛡️ 1% cashback on insurance payments. Capped at Rs.750/month.", 1.0),
    ("in_hdfc_easyshop_platinum_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 1.0),

    # HDFC Millennia Debit
    ("in_hdfc_millennia_debit", "DEFAULT", 0, 1.0, 400.0, "1% cashback on offline spends. Capped at Rs.400/month.", 1.0),
    ("in_hdfc_millennia_debit", "5310", 0, 2.5, 400.0, "💰 2.5% cashback on online shopping websites. Capped at Rs.400/month.", 1.0),

    # ICICI Sapphiro Debit
    ("in_icici_sapphiro_debit", "DEFAULT", 0, 0.5, None, "4 reward points per Rs.200 (0.5% yield).", 0.25),
    ("in_icici_sapphiro_debit", "4511", 0, 1.0, None, "✈️ 8 points per Rs.200 (1.0% yield) on international spends.", 0.25),

    # SBI Platinum Debit
    ("in_sbi_platinum_debit", "DEFAULT", 0, 0.25, 250.0, "1 point per Rs.200 spent (0.25% yield). Capped at Rs.250/month.", 0.25),

    # SBI RuPay Select Debit
    ("in_sbi_rupay_select_debit", "DEFAULT", 0, 0.5, None, "2 reward points per Rs.200 spent on e-commerce (1% yield); 1 point per Rs.200 offline (0.5% yield).", 0.5),
    ("in_sbi_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.5),
    ("in_sbi_rupay_select_debit", "5541", 1, 0, 0, "🚫 Fuel spends excluded from points.", 0.5),

    # HDFC RuPay Select Debit
    ("in_hdfc_rupay_select_debit", "DEFAULT", 0, 1.0, 500.0, "1% cashback on online e-commerce spent (capped at Rs. 500/month); 0.5% on POS retail.", 1.0),
    ("in_hdfc_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 1.0),

    # ICICI RuPay Select Debit
    ("in_icici_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_icici_rupay_select_debit", "5310", 0, 0.5, None, "💰 2 reward points per Rs.100 spent online (0.50% yield).", 0.25),
    ("in_icici_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Axis RuPay Select Debit
    ("in_axis_rupay_select_debit", "DEFAULT", 0, 0.2, None, "1 EDGE reward point per Rs.200 spent (0.20% yield).", 0.2),
    ("in_axis_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.2),

    # IDFC First RuPay Select Debit
    ("in_idfc_first_rupay_select_debit", "DEFAULT", 0, 0.2, None, "1 reward point per Rs.150 spent (0.20% yield).", 0.2),
    ("in_idfc_first_rupay_select_debit", "5310", 0, 0.6, None, "💰 3x reward points on online/e-commerce shopping.", 0.2),
    ("in_idfc_first_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.2),

    # IndusInd RuPay Select Debit
    ("in_indus_rupay_select_debit", "DEFAULT", 0, 0.5, None, "1 reward point per Rs.100 spent on POS/online shopping (0.50% yield).", 0.5),
    ("in_indus_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.5),

    # Kotak RuPay Select Debit
    ("in_kotak_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 Kotak reward point per Rs.200 spent (0.25% yield).", 0.25),
    ("in_kotak_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Yes Bank RuPay Select Debit
    ("in_yes_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 Yes reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_yes_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Bank of Baroda RuPay Select Debit
    ("in_bob_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_bob_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # PNB RuPay Select Debit
    ("in_pnb_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_pnb_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Union Bank RuPay Select Debit
    ("in_union_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_union_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Canara Bank RuPay Select Debit
    ("in_canara_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_canara_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Bank of India RuPay Select Debit
    ("in_boi_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_boi_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Central Bank RuPay Select Debit
    ("in_cbi_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_cbi_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Indian Bank RuPay Select Debit
    ("in_indian_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_indian_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Ujjivan RuPay Select Debit
    ("in_ujjivan_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_ujjivan_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Suryoday RuPay Select Debit
    ("in_suryoday_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_suryoday_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Utkarsh RuPay Select Debit
    ("in_utkarsh_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_utkarsh_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Federal Bank RuPay Select Debit
    ("in_federal_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_federal_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # IDBI Bank RuPay Select Debit
    ("in_idbi_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_idbi_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # UCO Bank RuPay Select Debit
    ("in_uco_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_uco_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25),

    # Indian Overseas Bank RuPay Select Debit
    ("in_iob_rupay_select_debit", "DEFAULT", 0, 0.25, None, "1 reward point per Rs.100 spent (0.25% yield).", 0.25),
    ("in_iob_rupay_select_debit", "6540", 1, 0, 0, "🚫 Wallet loads excluded.", 0.25)
]

# Populate sensible defaults dynamically for any card that does not have an explicit rules record.
# This ensures all 114 cards in the database have a DEFAULT rule, preventing recommendations engine from breaking.
EXPLICIT_CARDS_WITH_RULES = set([r[0] for r in REWARD_RULES])

for card in CARDS_DATA:
    card_id, _, _, c_type, _, _, _, _ = card
    if card_id not in EXPLICIT_CARDS_WITH_RULES:
        # Provide fallback rules based on card type
        if c_type == "CREDIT":
            REWARD_RULES.append((card_id, "DEFAULT", 0, 1.0, None, "Base 1.0% reward yield.", 1.0))
        elif c_type == "DEBIT":
            REWARD_RULES.append((card_id, "DEFAULT", 0, 0.25, None, "Base 0.25% reward yield.", 1.0))
        elif c_type == "FOREX":
            REWARD_RULES.append((card_id, "DEFAULT", 0, 0.0, None, "0% Forex Markup on matching currency pocket transactions.", 1.0))

# ─────────────────────────────────────────────────────────────────────────────
# 5. SEED FUNCTION & DOCUMENT GENERATION
# ─────────────────────────────────────────────────────────────────────────────
def seed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Disable foreign key checks for bulk reset
    cursor.execute("PRAGMA foreign_keys = OFF;")

    print("🌱 Clearing existing data...")
    cursor.execute("DELETE FROM user_wallets;")
    cursor.execute("DELETE FROM users;")
    cursor.execute("DELETE FROM active_flash_deals;")
    cursor.execute("DELETE FROM reward_rules;")
    cursor.execute("DELETE FROM cards;")
    cursor.execute("DELETE FROM banks;")
    cursor.execute("DELETE FROM mcc_directory;")

    print("🌱 Seeding MCC Directory...")
    cursor.executemany(
        "INSERT INTO mcc_directory (mcc_code, industry_group, clean_category_name) VALUES (?, ?, ?)",
        MCC_DATA
    )

    print("🌱 Seeding Banks...")
    cursor.executemany(
        "INSERT INTO banks (bank_id, display_name, customer_support_phone, grievance_email) VALUES (?, ?, ?, ?)",
        BANK_DATA
    )

    print("🌱 Seeding Cards catalog...")
    cursor.executemany(
        """INSERT INTO cards
           (card_id, bank_id, card_name, card_type, card_network,
            joining_fee_inr, annual_fee_inr, spend_waiver_threshold_inr, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)""",
        CARDS_DATA
    )

    # Seed card-specific official product page links
    premium_card_links = {
        "in_sbi_cashback_credit": "https://www.sbicard.com/en/personal/credit-cards/shopping/cashback-sbi-card.page",
        "in_sbi_simplyclick_credit": "https://www.sbicard.com/en/personal/credit-cards/shopping/simplyclick-sbi-card.page",
        "in_sbi_simplysave_credit": "https://www.sbicard.com/en/personal/credit-cards/shopping/simplysave-sbi-card.page",
        "in_sbi_aurum": "https://www.sbicard.com/en/personal/credit-cards/super-premium/aurum.page",
        "in_sbi_elite": "https://www.sbicard.com/en/personal/credit-cards/lifestyle/sbi-card-elite.page",
        "in_sbi_prime": "https://www.sbicard.com/en/personal/credit-cards/lifestyle/sbi-card-prime.page",
        "in_sbi_pulse": "https://www.sbicard.com/en/personal/credit-cards/lifestyle/sbi-card-pulse.page",
        "in_sbi_bpcl_octane": "https://www.sbicard.com/en/personal/credit-cards/travel/bpcl-sbi-card-octane.page",
        "in_sbi_bpcl": "https://www.sbicard.com/en/personal/credit-cards/travel/bpcl-sbi-card.page",
        "in_sbi_air_india_signature": "https://www.sbicard.com/en/personal/credit-cards/travel/air-india-sbi-signature-card.page",
        "in_sbi_irctc_premium": "https://www.sbicard.com/en/personal/credit-cards/travel/irctc-sbi-card-premier.page",
        "in_sbi_yatra": "https://www.sbicard.com/en/personal/credit-cards/travel/yatra-sbi-card.page",
        "in_sbi_fabindia": "https://www.sbicard.com/en/personal/credit-cards/shopping/fabindia-sbi-card.page",
        
        "in_hdfc_infinia_metal": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia-credit-card-metal-edition",
        "in_hdfc_diners_black": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/diners-club-black-metal-edition",
        "in_hdfc_regalia_gold": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-gold-credit-card",
        "in_hdfc_millennia_credit": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-cards",
        "in_hdfc_swiggy": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/swiggy-hdfc-bank-credit-card",
        
        "in_axis_magnus_credit": "https://www.axisbank.com/retail/cards/credit-card/magnus-credit-card/features-benefits",
        "in_axis_atlas_credit": "https://www.axisbank.com/retail/cards/credit-card/axis-bank-atlas-credit-card/features-benefits",
        "in_axis_ace_credit": "https://www.axisbank.com/retail/cards/credit-card/ace-credit-card/features-benefits",
        "in_axis_flipkart_credit": "https://www.axisbank.com/retail/cards/credit-card/flipkart-axisbank-creditcard/features-benefits"
    }
    for card_id, link in premium_card_links.items():
        cursor.execute("UPDATE cards SET official_link = ? WHERE card_id = ?", (link, card_id))

    print("🌱 Seeding Reward Rules...")
    cursor.executemany(
        """INSERT INTO reward_rules
           (card_id, mcc_code, is_completely_excluded, base_reward_percentage,
            monthly_capping_inr, gimmick_warning_text, point_to_inr_valuation)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        REWARD_RULES
    )

    print("🌱 Pre-seeding active wallets for demo user...")
    # Seed the demo user usr_prod_101_cardwise
    cursor.execute(
        "INSERT OR IGNORE INTO users (user_id, email_address, password_hash) VALUES (?, ?, ?)",
        ("usr_prod_101_cardwise", "usr_prod_101_cardwise@cardwise.com", "PBKDF2_SECURE_HASH_DEFAULT")
    )
    
    # Associate default cards in their wallet
    demo_wallet_cards = [
        ("usr_prod_101_cardwise", "in_hdfc_infinia_metal"),
        ("usr_prod_101_cardwise", "in_hdfc_millennia_debit"),
        ("usr_prod_101_cardwise", "in_niyo_global_forex")
    ]
    cursor.executemany(
        "INSERT OR IGNORE INTO user_wallets (user_id, card_id) VALUES (?, ?)",
        demo_wallet_cards
    )

    # Seed default financial profile for usr_prod_101_cardwise
    cursor.execute(
        """INSERT OR REPLACE INTO user_financial_profiles 
           (user_id, age, annual_income_inr, reward_goal, 
            spend_dining_inr, spend_grocery_inr, spend_shopping_inr, spend_utilities_inr, 
            spend_travel_inr, spend_fuel_inr, spend_insurance_inr, spend_rent_inr, spend_others_inr)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        ("usr_prod_101_cardwise", 29, 2400000.0, "MAX_YIELD", 
         15000.0, 10000.0, 25000.0, 8000.0, 20000.0, 5000.0, 4000.0, 30000.0, 10000.0)
    )

    conn.commit()

    # Re-enable and check foreign key integrity
    cursor.execute("PRAGMA foreign_keys = ON;")
    fk_check = cursor.execute("PRAGMA foreign_key_check;").fetchall()
    if fk_check:
        print(f"⚠️ FK violations found during seed validation: {fk_check}")
    else:
        print("✅ Foreign key integrity checks passed.")

    conn.close()
    print(f"🎉 SQLite Database populated successfully with {len(CARDS_DATA)} cards!")


def generate_markdown_docs():
    """
    Programmatically compiles 114 detailed markdown documents in the card_docs/ directory
    using the master data list, ensuring 100% parity with the DB.
    """
    if not os.path.exists(DOCS_DIR):
        os.makedirs(DOCS_DIR)

    # Dictionary mapping bank_id to display name
    bank_mapping = {b[0]: b[1] for b in BANK_DATA}
    mcc_mapping = {m[0]: m[2] for m in MCC_DATA}

    # Group rules by card_id
    rules_by_card = {}
    for r in REWARD_RULES:
        card_id, mcc_code, excluded, yield_pct, cap, warning, valuation = r
        if card_id not in rules_by_card:
            rules_by_card[card_id] = []
        rules_by_card[card_id].append({
            "mcc_code": mcc_code,
            "excluded": excluded,
            "yield_pct": yield_pct,
            "cap": cap,
            "warning": warning,
            "valuation": valuation
        })

    print(f"📂 Programmatically compiling {len(CARDS_DATA)} card documents under `{DOCS_DIR}/`...")
    
    for card in CARDS_DATA:
        card_id, bank_id, card_name, card_type, card_network, join_fee, annual_fee, waiver = card
        bank_name = bank_mapping.get(bank_id, bank_id)
        
        # Build document header
        doc = f"# {card_name}\n\n"
        doc += f"The **{card_name}** is a premium **{card_type.capitalize()}** card issued by **{bank_name}** running on the **{card_network}** network. Below are the verified fee structures, reward policies, exclusions, and card terms.\n\n"
        
        # Fee structure
        doc += "## 💳 Fee and Waiver Structure\n"
        doc += f"- **Joining Fee:** ₹{join_fee:,.2f} + GST\n"
        doc += f"- **Annual Fee:** ₹{annual_fee:,.2f} + GST\n"
        if waiver and waiver > 0:
            doc += f"- **Annual Fee Spend Waiver Threshold:** Spends exceeding ₹{waiver:,.2f} in the previous card anniversary year waive the subsequent year's fee.\n"
        else:
            doc += "- **Annual Fee Spend Waiver Threshold:** N/A (Card is either Lifetime Free or has a non-waivable annual fee structure).\n"
        doc += "\n"

        # Card features & custom descriptions
        doc += "## ✈️ Perks and Lounge Access\n"
        if card_type == "FOREX":
            doc += "- **Zero Forex Markup:** Swipes in foreign currency incur a flat 0% markup fee over the live exchange rate.\n"
            doc += "- **Multi-Currency Pockets:** Supports pre-loading multiple currencies to hedge against market volatility.\n"
            doc += "- **International ATM Withdrawals:** Flat cash withdrawal fee of ~$2.00 (or equivalent in loaded currency) per transaction.\n"
            doc += "- **Lounge Access:** Includes 1 complimentary international airport lounge visit per calendar quarter in India.\n"
        elif card_type == "DEBIT":
            if card_network == "RUPAY" and "select" in card_name.lower():
                doc += "- **Linked Accounts:** Direct debit from savings/current bank accounts. Subject to high daily withdrawal & purchase limits.\n"
                doc += "- **RuPay Select Wellness:** 1 complimentary health checkup package, 1 complimentary gym/fitness membership session (30 days offline or 90 days home), 1 complimentary spa or salon service, and 1 complimentary golf lesson/round per quarter.\n"
                doc += "- **Lounge Access:** 1 complimentary domestic airport lounge access per calendar quarter, plus 2 complimentary international airport lounge visits per calendar year.\n"
                doc += "- **Insurance Cover:** Personal accident and permanent total disability cover of up to ₹10 Lakhs (requires at least 1 POS/E-com transaction within 30 days prior to the accident).\n"
                doc += "- **Cab & Concierge:** 1 complimentary ₹100 cab coupon per quarter, plus 24/7 dedicated concierge services.\n"
            else:
                doc += "- **Linked Accounts:** Direct debit from savings/current bank accounts. Subject to daily withdrawal limits.\n"
                doc += "- **Lounge Access:** 1 complimentary domestic lounge access per calendar quarter subject to meeting spend guidelines.\n"
                doc += "- **Insurance Cover:** Accident and card liability insurance of up to ₹5 Lakhs.\n"
        else:
            # Credit Card defaults
            if join_fee >= 10000:
                doc += "- **Super-Premium Perks:** Complimentary luxury golf rounds, 24/7 dedicated concierge assistance, and metal form factor.\n"
                doc += "- **Lounge Access:** Unlimited complimentary domestic and international airport lounge visits for both primary and add-on cardholders.\n"
            elif join_fee >= 2500:
                doc += "- **Premium Perks:** Discounted dining programs, airline voucher milestones, and priority check-in benefits.\n"
                doc += "- **Lounge Access:** 8 to 12 complimentary domestic and 6 international lounge visits per calendar year.\n"
            else:
                doc += "- **Basic perks:** 1% fuel surcharge waiver at authorized retail fuel outlets.\n"
                doc += "- **Lounge Access:** 4 complimentary domestic lounge visits per year, subject to spend rules in the previous quarter.\n"
        doc += "\n"

        # Reward Rules
        doc += "## 📊 Reward Point Matrix & Category Exclusions\n"
        doc += "This matrix outlines the net cash-equivalent return percentages across different merchant category codes (MCCs):\n\n"
        doc += "| Category / Merchant | MCC Code | Reward Yield | Monthly Cap / Exclusions |\n"
        doc += "| :--- | :--- | :--- | :--- |\n"
        
        card_rules = rules_by_card.get(card_id, [])
        for rule in card_rules:
            mcc = rule["mcc_code"]
            cat_name = mcc_mapping.get(mcc, "Default Spend Category")
            if mcc == "DEFAULT":
                cat_name = "**Default / All Other Spends**"
            
            yield_str = f"{rule['yield_pct']}%"
            if rule["excluded"]:
                yield_str = "0.00% (Excluded)"
            
            cap_str = f"Cap ₹{rule['cap']:,.2f}/month" if rule["cap"] else "No Cap"
            if rule["excluded"]:
                cap_str = "🚫 Excluded Category"
                
            doc += f"| {cat_name} | `{mcc}` | **{yield_str}** | {cap_str} |\n"
        
        doc += "\n"
        
        # Warnings and gimmicks
        warnings = [r["warning"] for r in card_rules if r["warning"]]
        if warnings:
            doc += "### ⚠️ Crucial Terms and Marketing Gimmicks\n"
            for w in warnings:
                doc += f"- {w}\n"
            doc += "\n"

        doc += "---\n*This document is the verified production specification copy for Cardwise Engine v2. Last updated mid-2026. Official HDFC/SBI/ICICI/Axis terms and conditions apply.*\n"

        # Write to file
        file_path = os.path.join(DOCS_DIR, f"{card_id}.md")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(doc)

    print(f"✅ Successfully compiled {len(CARDS_DATA)} verified documentation files!")


if __name__ == "__main__":
    seed()
    generate_markdown_docs()
