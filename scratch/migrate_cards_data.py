import sqlite3
import os

DB_PATH = "cardwise_production.db"
DOCS_DIR = "card_docs"

# 1. Banks mapping validation (Sensible support information)
BANK_INFO = {
    "HDFC": ("HDFC Bank", "1800-202-6161", "support@hdfcbank.com"),
    "SBI": ("State Bank of India", "1800-11-2211", "contactcentre@sbi.co.in"),
    "ICICI": ("ICICI Bank", "1800-200-3344", "customer.care@icicibank.com"),
    "AXIS": ("Axis Bank", "1800-419-5959", "support@axisbank.com"),
    "IDFC": ("IDFC First Bank", "1800-10-888", "care@idfcfirstbank.com"),
    "AMEX": ("American Express", "1800-419-2122", "customercare@americanexpress.com"),
    "YES": ("Yes Bank", "1800-1200", "customercare@yesbank.in"),
    "ONECARD": ("OneCard / FPL Technologies", "1800-572-7575", "support@getonecard.app"),
    "SC": ("Standard Chartered Bank", "1800-345-5000", "customer.care@sc.com"),
    "AU": ("AU Small Finance Bank", "1800-1200-699", "support@aubank.in"),
    "FEDERAL": ("Federal Bank", "1800-425-1199", "contact@federalbank.co.in"),
    "PNB": ("Punjab National Bank", "1800-180-2222", "care@pnb.co.in"),
    "CANARA": ("Canara Bank", "1800-425-0018", "hocancard@canarabank.com"),
    "HSBC": ("HSBC India", "1800-266-3456", "customer.care@hsbc.co.in"),
}

# 2. Master Card Data to Ingest/Update
CARDS_DATA = [
    # Flagship Credit Cards (10)
    {
        "card_id": "in_hdfc_infinia_metal",
        "bank_id": "HDFC",
        "card_name": "HDFC Infinia Metal Edition",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 12500.0,
        "annual_fee_inr": 12500.0,
        "spend_waiver_threshold_inr": 10000000.0,
        "forex_markup_pct": 1.00,
        "lounge_access_domestic": "Unlimited complimentary domestic lounge access for Primary, Add-on, and Guests.",
        "lounge_access_international": "Unlimited complimentary international lounge access for Primary, Add-on, and Guests.",
        "ancillary_benefits": "Unlimited Golf games/coaching, Initial year Club Marriott membership, Rs 3 Crore Air Accidental Insurance cover.",
        "is_cashback_card": 0,
        "official_link": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia-credit-card-metal-edition"
    },
    {
        "card_id": "in_hdfc_diners_black",
        "bank_id": "HDFC",
        "card_name": "HDFC Diners Club Black Metal Edition",
        "card_type": "CREDIT",
        "card_network": "AMEX",
        "joining_fee_inr": 10000.0,
        "annual_fee_inr": 10000.0,
        "spend_waiver_threshold_inr": 800000.0,
        "forex_markup_pct": 2.00,
        "lounge_access_domestic": "Unlimited complimentary domestic lounge access globally for Primary and Add-on cardholders.",
        "lounge_access_international": "Unlimited complimentary international lounge access globally for Primary and Add-on cardholders.",
        "ancillary_benefits": "6 complimentary Golf rounds per quarter globally, Annual complimentary memberships to Forbes Digital, Marriott Bonvoy, Swiggy One on milestones.",
        "is_cashback_card": 0,
        "official_link": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/diners-club-black-metal-edition"
    },
    {
        "card_id": "in_axis_reserve",
        "bank_id": "AXIS",
        "card_name": "Axis Bank Reserve Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 50000.0,
        "annual_fee_inr": 50000.0,
        "spend_waiver_threshold_inr": 3500000.0,
        "forex_markup_pct": 1.50,
        "lounge_access_domestic": "Unlimited domestic lounge access for Primary and Add-on cardholders + 4 complimentary guests visits per instance.",
        "lounge_access_international": "Unlimited international lounge access for Primary and Add-on cardholders + 4 complimentary guests visits per instance.",
        "ancillary_benefits": "40 complimentary domestic airport meet-and-greet services per year, 4 complimentary luxury airport transfers per year, ITC Culinaire Membership.",
        "is_cashback_card": 0,
        "official_link": "https://www.axisbank.com/retail/cards/credit-card/axis-reserve-credit-card"
    },
    {
        "card_id": "in_axis_magnus_credit",
        "bank_id": "AXIS",
        "card_name": "Axis Magnus Credit Card (Burgundy Private)",
        "card_type": "CREDIT",
        "card_network": "MASTERCARD",
        "joining_fee_inr": 30000.0,
        "annual_fee_inr": 30000.0,
        "spend_waiver_threshold_inr": 2500000.0,
        "forex_markup_pct": 1.50,
        "lounge_access_domestic": "Unlimited domestic lounge entries for primary + 8 guest visits per calendar year.",
        "lounge_access_international": "Unlimited international lounge entries for primary + 8 guest visits per calendar year.",
        "ancillary_benefits": "24 complimentary golf rounds or lessons per year, BMS BOGO movie tickets up to Rs 500, dedicated 24/7 Burgundy Private concierge.",
        "is_cashback_card": 0,
        "official_link": "https://www.axisbank.com/retail/cards/credit-card/magnus-credit-card/features-benefits"
    },
    {
        "card_id": "in_amex_platinum_charge",
        "bank_id": "AMEX",
        "card_name": "American Express Platinum Card (Charge Variant)",
        "card_type": "CREDIT",
        "card_network": "AMEX",
        "joining_fee_inr": 60000.0,
        "annual_fee_inr": 60000.0,
        "spend_waiver_threshold_inr": None,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "Unlimited complimentary entry to domestic Centurion and Plaza Premium lounges + 2 accompanying guests.",
        "lounge_access_international": "Unlimited complimentary entry to global Centurion, Delta Sky Clubs, Priority Pass, Plaza Premium lounges + 2 guests.",
        "ancillary_benefits": "Instant programmatic enrollment to Marriott Gold Elite, Hilton Honors Gold, Radisson Premium status, 24/7 Platinum Concierge Desk.",
        "is_cashback_card": 0,
        "official_link": "https://www.americanexpress.com/in/charge-cards/platinum-card/"
    },
    {
        "card_id": "in_sbi_aurum",
        "bank_id": "SBI",
        "card_name": "SBI Aurum Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 10000.0,
        "annual_fee_inr": 10000.0,
        "spend_waiver_threshold_inr": 1200000.0,
        "forex_markup_pct": 1.99,
        "lounge_access_domestic": "Unlimited domestic lounge access for primary cardholders.",
        "lounge_access_international": "4 complimentary international lounge visits per quarter (via Dreamfolks) + 4 guest visits per year.",
        "ancillary_benefits": "4 complimentary airport spa sessions per year, 4 complimentary movie tickets/month via BMS (valued up to Rs 1000/month).",
        "is_cashback_card": 0,
        "official_link": "https://www.sbicard.com/en/personal/credit-cards/super-premium/aurum.page"
    },
    {
        "card_id": "in_icici_emeralde_private_metal",
        "bank_id": "ICICI",
        "card_name": "ICICI Bank Emeralde Private Metal Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 12499.0,
        "annual_fee_inr": 12499.0,
        "spend_waiver_threshold_inr": 1000000.0,
        "forex_markup_pct": 1.50,
        "lounge_access_domestic": "Unlimited domestic airport lounge access for Primary, Add-on, and accompanying Guests.",
        "lounge_access_international": "Unlimited international airport lounge access for Primary, Add-on, and accompanying Guests.",
        "ancillary_benefits": "Unlimited complimentary golf rounds and coaching sessions per month (requires Rs 50k spend in previous cycle), 24/7 Secretarial Concierge.",
        "is_cashback_card": 0,
        "official_link": "https://www.icicibank.com/personal-banking/cards/credit-card/emeralde-private-metal-credit-card"
    },
    {
        "card_id": "in_yes_marquee",
        "bank_id": "YES",
        "card_name": "Yes Bank Marquee Credit Card",
        "card_type": "CREDIT",
        "card_network": "MASTERCARD",
        "joining_fee_inr": 9999.0,
        "annual_fee_inr": 4999.0,
        "spend_waiver_threshold_inr": 1000000.0,
        "forex_markup_pct": 1.75,
        "lounge_access_domestic": "Unlimited domestic lounge visits for Primary, Add-on, and 8 complimentary guest visits per year.",
        "lounge_access_international": "Unlimited international lounge visits for Primary, Add-on, and 8 complimentary guest visits per year.",
        "ancillary_benefits": "BOGO movie tickets on BMS (up to 3 free tickets/month, max Rs 250 each), 4 complimentary golf rounds/lessons per year.",
        "is_cashback_card": 0,
        "official_link": "https://www.yesbank.in/personal-banking/cards/credit-cards/marquee-credit-card"
    },
    {
        "card_id": "in_sc_ultimate",
        "bank_id": "SC",
        "card_name": "Standard Chartered Ultimate Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 7000.0,
        "annual_fee_inr": 7000.0,
        "spend_waiver_threshold_inr": None,
        "forex_markup_pct": 2.00,
        "lounge_access_domestic": "Unlimited domestic airport lounge access.",
        "lounge_access_international": "1 complimentary international lounge visit per month via Priority Pass (requires Rs 20,000 spend in previous cycle).",
        "ancillary_benefits": "1 complimentary golf round/lesson per month, global emergency medical insurance up to Rs 25 Lakhs.",
        "is_cashback_card": 0,
        "official_link": "https://www.sc.com/in/credit-cards/ultimate-credit-card/"
    },
    {
        "card_id": "in_idfc_first_private",
        "bank_id": "IDFC",
        "card_name": "IDFC FIRST Private Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 50000.0,
        "annual_fee_inr": 50000.0,
        "spend_waiver_threshold_inr": 0.0, # LTF for qualified private banking clients
        "forex_markup_pct": 1.50,
        "lounge_access_domestic": "Unlimited domestic lounge access for Primary, Add-on, and 4 accompanying guests.",
        "lounge_access_international": "Unlimited international lounge access for Primary, Add-on, and 4 accompanying guests.",
        "ancillary_benefits": "Unlimited global airport spa sessions via partners, BMS BOGO movie tickets up to Rs 500 discount twice a month.",
        "is_cashback_card": 0,
        "official_link": "https://www.idfcfirstbank.com/credit-card/private-credit-card"
    },

    # Mid-Range Credit Cards (20)
    {
        "card_id": "in_sbi_cashback_credit",
        "bank_id": "SBI",
        "card_name": "SBI Cashback Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 999.0,
        "annual_fee_inr": 999.0,
        "spend_waiver_threshold_inr": 200000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "4 domestic lounge visits per year (capped at 1 per quarter).",
        "lounge_access_international": "None",
        "ancillary_benefits": "1% fuel surcharge waiver (transactions Rs 500-3000, capped at Rs 100/cycle).",
        "is_cashback_card": 1,
        "official_link": "https://www.sbicard.com/en/personal/credit-cards/shopping/cashback-sbi-card.page"
    },
    {
        "card_id": "in_axis_atlas_credit",
        "bank_id": "AXIS",
        "card_name": "Axis Bank Atlas Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 5000.0,
        "annual_fee_inr": 5000.0,
        "spend_waiver_threshold_inr": 1500000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "Up to 18 visits/year (Tier-based via Silver/Gold/Platinum spends).",
        "lounge_access_international": "Up to 12 visits/year (Tier-based via Silver/Gold/Platinum spends).",
        "ancillary_benefits": "Airport concierge and meet-and-greet discounts.",
        "is_cashback_card": 0,
        "official_link": "https://www.axisbank.com/retail/cards/credit-card/axis-bank-atlas-credit-card"
    },
    {
        "card_id": "in_hsbc_live_plus_credit",
        "bank_id": "HSBC",
        "card_name": "HSBC Live+ Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 999.0,
        "annual_fee_inr": 999.0,
        "spend_waiver_threshold_inr": 200000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "4 domestic lounge visits per year (capped at 1 per quarter).",
        "lounge_access_international": "None",
        "ancillary_benefits": "Up to 15% discount on partner restaurants via the HSBC Star Dining program.",
        "is_cashback_card": 1,
        "official_link": "https://www.hsbc.co.in/credit-cards/products/live-plus/"
    },
    {
        "card_id": "in_hdfc_swiggy",
        "bank_id": "HDFC",
        "card_name": "Swiggy HDFC Bank Credit Card",
        "card_type": "CREDIT",
        "card_network": "MASTERCARD",
        "joining_fee_inr": 500.0,
        "annual_fee_inr": 500.0,
        "spend_waiver_threshold_inr": 200000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "4 domestic airport lounge visits per calendar year.",
        "lounge_access_international": "None",
        "ancillary_benefits": "Complimentary 3-month Swiggy One membership on activation.",
        "is_cashback_card": 1,
        "official_link": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/swiggy-hdfc-bank-credit-card"
    },
    {
        "card_id": "in_axis_airtel_credit",
        "bank_id": "AXIS",
        "card_name": "Axis Airtel Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 500.0,
        "annual_fee_inr": 500.0,
        "spend_waiver_threshold_inr": 200000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "4 domestic lounge visits per calendar year.",
        "lounge_access_international": "None",
        "ancillary_benefits": "1% fuel surcharge waiver up to Rs 500/month.",
        "is_cashback_card": 1,
        "official_link": "https://www.axisbank.com/retail/cards/credit-card/airtel-axis-bank-credit-card"
    },
    {
        "card_id": "in_amex_platinum_travel",
        "bank_id": "AMEX",
        "card_name": "Amex Platinum Travel Credit Card",
        "card_type": "CREDIT",
        "card_network": "AMEX",
        "joining_fee_inr": 3500.0,
        "annual_fee_inr": 5000.0,
        "spend_waiver_threshold_inr": None,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "8 domestic lounge visits per calendar year (2 per quarter).",
        "lounge_access_international": "Priority Pass membership with standard US$32 guest fee per visit.",
        "ancillary_benefits": "Milestone MR points (15,000 points at 1.9L spend, 25,000 points + Rs 10k Taj voucher at 4.0L spends) fully offset the fees.",
        "is_cashback_card": 0,
        "official_link": "https://www.americanexpress.com/in/credit-cards/platinum-travel-card/"
    },
    {
        "card_id": "in_amex_gold_charge",
        "bank_id": "AMEX",
        "card_name": "Amex Gold Card (Charge Variant)",
        "card_type": "CREDIT",
        "card_network": "AMEX",
        "joining_fee_inr": 1000.0,
        "annual_fee_inr": 4500.0,
        "spend_waiver_threshold_inr": None,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "None",
        "lounge_access_international": "None",
        "ancillary_benefits": "Up to 20% discount across premium urban restaurants via Amex Dining Program.",
        "is_cashback_card": 0,
        "official_link": "https://www.americanexpress.com/in/charge-cards/gold-card/"
    },
    {
        "card_id": "in_amex_mrcc",
        "bank_id": "AMEX",
        "card_name": "Amex Membership Rewards Credit Card (MRCC)",
        "card_type": "CREDIT",
        "card_network": "AMEX",
        "joining_fee_inr": 1000.0,
        "annual_fee_inr": 4500.0,
        "spend_waiver_threshold_inr": 150000.0, # waived fully at 1.5L, half at 90k
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "None (Basic domestic validations only).",
        "lounge_access_international": "None",
        "ancillary_benefits": "Zero-liability insurance covers for lost card fraudulent reporting.",
        "is_cashback_card": 0,
        "official_link": "https://www.americanexpress.com/in/credit-cards/membership-rewards-card/"
    },
    {
        "card_id": "in_hdfc_tata_neu_infinity",
        "bank_id": "HDFC",
        "card_name": "HDFC Tata Neu Infinity Credit Card",
        "card_type": "CREDIT",
        "card_network": "RUPAY",
        "joining_fee_inr": 1499.0,
        "annual_fee_inr": 1499.0,
        "spend_waiver_threshold_inr": 300000.0,
        "forex_markup_pct": 2.00,
        "lounge_access_domestic": "8 domestic lounge visits per year.",
        "lounge_access_international": "4 international lounge visits per year via Priority Pass.",
        "ancillary_benefits": "1% fuel surcharge waiver capped at Rs 250/cycle.",
        "is_cashback_card": 1, # UPI & NeuCoins act like cashback/direct discount
        "official_link": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/tata-neu-infinity-co-brand-card"
    },
    {
        "card_id": "in_icici_amazon_pay_credit",
        "bank_id": "ICICI",
        "card_name": "ICICI Bank Amazon Pay Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 0.0,
        "annual_fee_inr": 0.0,
        "spend_waiver_threshold_inr": 0.0, # LTF
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "None",
        "lounge_access_international": "None",
        "ancillary_benefits": "1% fuel surcharge waiver across all Indian fuel outlets.",
        "is_cashback_card": 1,
        "official_link": "https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card"
    },
    {
        "card_id": "in_hdfc_regalia_gold",
        "bank_id": "HDFC",
        "card_name": "HDFC Regalia Gold Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 2500.0,
        "annual_fee_inr": 2500.0,
        "spend_waiver_threshold_inr": 300000.0,
        "forex_markup_pct": 2.00,
        "lounge_access_domestic": "12 domestic lounge visits per year (unlimited for self via PP once spend rules are cleared).",
        "lounge_access_international": "6 international lounge visits per year for self and add-on cardholders.",
        "ancillary_benefits": "Complimentary flight insurance cover up to Rs 1 Crore, Uber/ITC vouchers on quarterly spend milestones.",
        "is_cashback_card": 0,
        "official_link": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-gold-credit-card"
    },
    {
        "card_id": "in_hdfc_millennia_credit",
        "bank_id": "HDFC",
        "card_name": "HDFC Millennia Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 1000.0,
        "annual_fee_inr": 1000.0,
        "spend_waiver_threshold_inr": 100000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "4 domestic lounge visits per year (1/quarter).",
        "lounge_access_international": "None",
        "ancillary_benefits": "1% fuel surcharge waiver up to Rs 250/cycle.",
        "is_cashback_card": 1,
        "official_link": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-cards"
    },
    {
        "card_id": "in_axis_ace_credit",
        "bank_id": "AXIS",
        "card_name": "Axis Bank Ace Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 499.0,
        "annual_fee_inr": 499.0,
        "spend_waiver_threshold_inr": 200000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "4 domestic lounge visits per year.",
        "lounge_access_international": "None",
        "ancillary_benefits": "1% fuel surcharge waiver on transactions between Rs 400 and Rs 4000 (capped at Rs 400/month).",
        "is_cashback_card": 1,
        "official_link": "https://www.axisbank.com/retail/cards/credit-card/ace-credit-card"
    },
    {
        "card_id": "in_sc_smart_credit",
        "bank_id": "SC",
        "card_name": "Standard Chartered Smart Credit Card",
        "card_type": "CREDIT",
        "card_network": "MASTERCARD",
        "joining_fee_inr": 499.0,
        "annual_fee_inr": 499.0,
        "spend_waiver_threshold_inr": 120000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "None",
        "lounge_access_international": "None",
        "ancillary_benefits": "Extended interest-free promotional terms on select merchant EMI conversions.",
        "is_cashback_card": 1,
        "official_link": "https://www.sc.com/in/credit-cards/smart-credit-card/"
    },
    {
        "card_id": "in_idfc_first_wealth",
        "bank_id": "IDFC",
        "card_name": "IDFC FIRST Wealth Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 0.0,
        "annual_fee_inr": 0.0,
        "spend_waiver_threshold_inr": 0.0, # LTF
        "forex_markup_pct": 1.99,
        "lounge_access_domestic": "4 domestic lounge visits per quarter (requires Rs 5,000 spend in previous month).",
        "lounge_access_international": "4 international lounge visits + spa sessions per quarter (requires Rs 5,000 spend in previous month).",
        "ancillary_benefits": "BOGO movie tickets on BookMyShow (up to Rs 500 discount twice a month), low currency forex markup.",
        "is_cashback_card": 0,
        "official_link": "https://www.idfcfirstbank.com/credit-card/wealth-credit-card"
    },
    {
        "card_id": "in_onecard_metal",
        "bank_id": "ONECARD",
        "card_name": "OneCard Credit Card (Metallic Variant)",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 0.0,
        "annual_fee_inr": 0.0,
        "spend_waiver_threshold_inr": 0.0, # LTF
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "1 domestic lounge visit per quarter (variant specific on milestones).",
        "lounge_access_international": "None",
        "ancillary_benefits": "App-centric instant fractional reward burning mechanics, zero cross-border markup during promotions.",
        "is_cashback_card": 1,
        "official_link": "https://getonecard.app/"
    },
    {
        "card_id": "in_sbi_prime",
        "bank_id": "SBI",
        "card_name": "SBI Card Prime",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 2999.0,
        "annual_fee_inr": 2999.0,
        "spend_waiver_threshold_inr": 300000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "8 domestic lounge visits per year (capped at 2 per quarter).",
        "lounge_access_international": "4 international lounge visits per year via Priority Pass.",
        "ancillary_benefits": "Trident Hotels Web Privilege Elite Tier membership, Rs 1000 Pizza Hut milestone voucher.",
        "is_cashback_card": 0,
        "official_link": "https://www.sbicard.com/en/personal/credit-cards/lifestyle/sbi-card-prime.page"
    },
    {
        "card_id": "in_axis_select",
        "bank_id": "AXIS",
        "card_name": "Axis Bank Select Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 3000.0,
        "annual_fee_inr": 3000.0,
        "spend_waiver_threshold_inr": 600000.0,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "2 domestic lounge visits per quarter (requires Rs 50k spend in previous cycle).",
        "lounge_access_international": "6 international lounge visits per year via Priority Pass (requires Rs 50k spend in previous cycle).",
        "ancillary_benefits": "BOGO movie tickets on BMS up to Rs 300/month, Axis Dining Delights discounts.",
        "is_cashback_card": 0,
        "official_link": "https://www.axisbank.com/retail/cards/credit-card/axis-select-credit-card"
    },
    {
        "card_id": "in_au_nomad",
        "bank_id": "AU",
        "card_name": "AU Nomad Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 2000.0,
        "annual_fee_inr": 2000.0,
        "spend_waiver_threshold_inr": 250000.0,
        "forex_markup_pct": 0.00,
        "lounge_access_domestic": "Unlimited domestic airport lounge access across India.",
        "lounge_access_international": "Up to 2 international lounge visits per quarter based on spends.",
        "ancillary_benefits": "0% Currency Forex Markup Fee (primary driver for international travelers).",
        "is_cashback_card": 0,
        "official_link": "https://www.aubank.in/personal-banking/credit-cards/au-nomad-credit-card"
    },
    {
        "card_id": "in_federal_celesta",
        "bank_id": "FEDERAL",
        "card_name": "Federal Bank Celesta Credit Card",
        "card_type": "CREDIT",
        "card_network": "VISA",
        "joining_fee_inr": 3000.0,
        "annual_fee_inr": 3000.0,
        "spend_waiver_threshold_inr": 300000.0,
        "forex_markup_pct": 2.00,
        "lounge_access_domestic": "2 domestic lounge access sessions per quarter.",
        "lounge_access_international": "2 international lounge visits per year.",
        "ancillary_benefits": "Personal travel insurance packages up to Rs 50 Lakhs, low forex fee.",
        "is_cashback_card": 0,
        "official_link": "https://www.federalbank.co.in/celesta-credit-card"
    },

    # RuPay Select Debit Cards (3)
    {
        "card_id": "in_pnb_rupay_select_debit",
        "bank_id": "PNB",
        "card_name": "PNB RuPay Select Debit Card",
        "card_type": "DEBIT",
        "card_network": "RUPAY",
        "joining_fee_inr": 500.0,
        "annual_fee_inr": 750.0,
        "spend_waiver_threshold_inr": 0.0, # Waived if transacting once per quarter
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "1 domestic lounge access per calendar quarter.",
        "lounge_access_international": "2 international lounge visits per calendar year.",
        "ancillary_benefits": "RuPay Select Wellness (health checkup, gym, spa, golf), daily limits ₹1.5L ATM / ₹5L POS.",
        "is_cashback_card": 0,
        "official_link": "https://www.pnbcard.in/"
    },
    {
        "card_id": "in_sbi_rupay_select_debit",
        "bank_id": "SBI",
        "card_name": "SBI Wealth RuPay Select Debit Card",
        "card_type": "DEBIT",
        "card_network": "RUPAY",
        "joining_fee_inr": 0.0,
        "annual_fee_inr": 0.0,
        "spend_waiver_threshold_inr": 0.0, # LTF
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "1 domestic lounge access per calendar quarter.",
        "lounge_access_international": "2 international lounge visits per calendar year.",
        "ancillary_benefits": "RuPay Select Wellness (health checkup, gym, spa, golf), daily limits ₹2L ATM / ₹5L POS.",
        "is_cashback_card": 0,
        "official_link": "https://www.sbi.co.in/"
    },
    {
        "card_id": "in_canara_rupay_select_debit",
        "bank_id": "CANARA",
        "card_name": "Canara Bank RuPay Select Debit Card",
        "card_type": "DEBIT",
        "card_network": "RUPAY",
        "joining_fee_inr": 0.0,
        "annual_fee_inr": 300.0,
        "spend_waiver_threshold_inr": None,
        "forex_markup_pct": 3.50,
        "lounge_access_domestic": "1 domestic lounge access per calendar quarter.",
        "lounge_access_international": "2 international lounge visits per calendar year.",
        "ancillary_benefits": "RuPay Select Wellness (health checkup, gym, spa, golf), daily limits ₹1L ATM / ₹5L POS.",
        "is_cashback_card": 0,
        "official_link": "https://www.canarabank.com/"
    }
]

# 3. Custom Card Reward Rules Setup (is_completely_excluded, base_reward_percentage, points_multiplier, point_to_inr_valuation, monthly_capping_inr, gimmick_warning_text)
REWARD_RULES = [
    # Infinia
    ("in_hdfc_infinia_metal", "DEFAULT", 0, 3.33, 1.0, 1.0000, None, "Base 3.33% yield (5 reward points per Rs.150 spent, 1 point = Rs.1.00 for travel)."),
    ("in_hdfc_infinia_metal", "7011", 0, 33.33, 1.0, 1.0000, 15000.0, "Hotel bookings via SmartBuy: 10X points (Net yield: 33.33%), capped at 15k bonus points/month."),
    ("in_hdfc_infinia_metal", "5732", 0, 33.33, 1.0, 1.0000, 15000.0, "Apple products via SmartBuy: 10X points (Net yield: 33.33%), capped at 15k bonus points/month."),
    ("in_hdfc_infinia_metal", "5094", 0, 33.33, 1.0, 1.0000, 15000.0, "Tanishq purchases via SmartBuy: 10X points (Net yield: 33.33%), capped at 15k bonus points/month."),
    ("in_hdfc_infinia_metal", "4511", 0, 16.66, 1.0, 1.0000, 15000.0, "Flight bookings via SmartBuy: 5X points (Net yield: 16.66%), capped at 15k bonus points/month."),
    ("in_hdfc_infinia_metal", "5411", 0, 3.33, 1.0, 1.0000, 2000.0, "⚠️ Grocery spends capped at 2,000 points/month."),
    ("in_hdfc_infinia_metal", "6300", 0, 3.33, 1.0, 1.0000, 10000.0, "⚠️ Insurance premiums capped at 10,000 points/month."),
    ("in_hdfc_infinia_metal", "4900", 0, 3.33, 1.0, 1.0000, 2000.0, "⚠️ Utility bills capped at 2,000 points/month."),
    ("in_hdfc_infinia_metal", "4814", 0, 3.33, 1.0, 1.0000, 2000.0, "⚠️ Telecom spends capped at 2,000 points/month."),
    ("in_hdfc_infinia_metal", "4812", 0, 3.33, 1.0, 1.0000, 2000.0, "⚠️ Telecom spends capped at 2,000 points/month."),
    ("in_hdfc_infinia_metal", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded from earning points."),
    ("in_hdfc_infinia_metal", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loads completely excluded from earning points."),
    ("in_hdfc_infinia_metal", "6513", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded from earning points."),
    ("in_hdfc_infinia_metal", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded from earning points."),

    # Diners Club Black Metal
    ("in_hdfc_diners_black", "DEFAULT", 0, 3.33, 1.0, 1.0000, None, "Base 3.33% yield (5 reward points per Rs.150 spent, 1 point = Rs.1.00 for travel)."),
    ("in_hdfc_diners_black", "7011", 0, 33.33, 1.0, 1.0000, 10000.0, "Hotels via SmartBuy: 10X points (Net yield: 33.33%), capped at 10k bonus points/month."),
    ("in_hdfc_diners_black", "5812", 0, 3.33, 1.0, 1.0000, 10000.0, "Dining/Lifestyle brands: 10X points (Net yield: 33.33%), capped at 10k bonus points/month."),
    ("in_hdfc_diners_black", "4511", 0, 16.66, 1.0, 1.0000, 10000.0, "Flights via SmartBuy: 5X points (Net yield: 16.66%), capped at 10k bonus points/month."),
    ("in_hdfc_diners_black", "5411", 0, 3.33, 1.0, 1.0000, 2000.0, "⚠️ Grocery spends capped at 2,000 points/month."),
    ("in_hdfc_diners_black", "6300", 0, 3.33, 1.0, 1.0000, 10000.0, "⚠️ Insurance premiums capped at 10,000 points/month."),
    ("in_hdfc_diners_black", "4900", 0, 3.33, 1.0, 1.0000, 2000.0, "⚠️ Utility bills capped at 2,000 points/month."),
    ("in_hdfc_diners_black", "4814", 0, 3.33, 1.0, 1.0000, 2000.0, "⚠️ Telecom spends capped at 2,000 points/month."),
    ("in_hdfc_diners_black", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded from earning points."),
    ("in_hdfc_diners_black", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loads completely excluded from earning points."),
    ("in_hdfc_diners_black", "6513", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded from earning points."),
    ("in_hdfc_diners_black", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded from earning points."),

    # Axis Reserve
    ("in_axis_reserve", "DEFAULT", 0, 3.00, 1.0, 0.2000, None, "Base: 30 Edge points/Rs.200 domestic. Net yield ~3% based on 5:2 miles transfer valuation (₹0.50/mile)."),
    ("in_axis_reserve", "4511", 0, 3.00, 1.0, 0.2000, None, "Flight bookings. Net yield 3.00% under baseline miles conversion."),
    ("in_axis_reserve", "7011", 0, 3.00, 1.0, 0.2000, None, "Hotel bookings. Net yield 3.00% under baseline miles conversion."),
    ("in_axis_reserve", "5541", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_axis_reserve", "6540", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_axis_reserve", "6513", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_axis_reserve", "9399", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_axis_reserve", "4900", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Utility bills completely excluded."),

    # Axis Magnus (Burgundy Private)
    ("in_axis_magnus_credit", "DEFAULT", 0, 4.80, 1.0, 0.4000, None, "Base: 24 Edge Reward points/Rs.200 (12% point rate). Net yield 4.80% based on 5:4 miles transfer (₹0.50/mile)."),
    ("in_axis_magnus_credit", "4511", 0, 24.00, 5.0, 0.4000, None, "Travel bookings: 5X Edge Reward Points via Axis Travel Edge portal (Net yield: 24.00%)."),
    ("in_axis_magnus_credit", "7011", 0, 24.00, 5.0, 0.4000, None, "Travel bookings: 5X Edge Reward Points via Axis Travel Edge portal (Net yield: 24.00%)."),
    ("in_axis_magnus_credit", "6300", 1, 0.00, 1.0, 0.4000, 0.0, "🚫 Insurance payments completely excluded from rewards."),
    ("in_axis_magnus_credit", "4900", 1, 0.00, 1.0, 0.4000, 0.0, "🚫 Utility bills completely excluded from rewards."),
    ("in_axis_magnus_credit", "5541", 1, 0.00, 1.0, 0.4000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_axis_magnus_credit", "6540", 1, 0.00, 1.0, 0.4000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_axis_magnus_credit", "9399", 1, 0.00, 1.0, 0.4000, 0.0, "🚫 Government transactions completely excluded."),

    # Amex Platinum Charge
    ("in_amex_platinum_charge", "DEFAULT", 0, 2.50, 1.0, 1.0000, None, "Base: 1 MR per Rs.40. Net yield 2.50% based on 1:1 Marriott Bonvoy miles conversion."),
    ("in_amex_platinum_charge", "5311", 0, 12.50, 5.0, 1.0000, None, "Reward Multiplier: 5X MR points (Net yield: 12.50%) on Apple, Tata CLiQ Luxury, Net-A-Porter."),
    ("in_amex_platinum_charge", "5732", 0, 12.50, 5.0, 1.0000, None, "Reward Multiplier: 5X MR points (Net yield: 12.50%) on electronics/Apple Store."),
    ("in_amex_platinum_charge", "5948", 0, 12.50, 5.0, 1.0000, None, "Reward Multiplier: 5X MR points (Net yield: 12.50%) on luxury goods."),
    ("in_amex_platinum_charge", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded from MR points."),
    ("in_amex_platinum_charge", "4900", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Utility bills completely excluded from MR points."),
    ("in_amex_platinum_charge", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded from MR points."),

    # SBI Aurum
    ("in_sbi_aurum", "DEFAULT", 0, 1.00, 1.0, 0.2500, None, "Base: 4 Aurum points per Rs.100 spent (1.00% yield, 1 point = Rs.0.25 on Aurum Portal)."),
    ("in_sbi_aurum", "5541", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Fuel transactions completely excluded."),

    # ICICI Emeralde Private Metal
    ("in_icici_emeralde_private_metal", "DEFAULT", 0, 3.00, 1.0, 0.7500, None, "Base: 4 Reward Points per Rs.100. Net flat yield 3.00% (1 point = Rs.0.75 or 1.00 on travel catalog)."),
    ("in_icici_emeralde_private_metal", "5541", 1, 0.00, 1.0, 0.7500, 0.0, "🚫 Fuel transactions completely excluded."),

    # Yes Marquee
    ("in_yes_marquee", "DEFAULT", 0, 2.25, 1.0, 0.2500, None, "Base: 18 points per Rs.200 offline. Net yield 2.25% (1 point = Rs.0.25 travel/vouchers)."),
    ("in_yes_marquee", "5310", 0, 4.50, 1.0, 0.2500, None, "Online: 36 points per Rs.200 (Net yield: 4.50%), no upper cap."),
    ("in_yes_marquee", "4900", 0, 4.50, 1.0, 0.2500, 1250.0, "⚠️ Utilities & Subscription spends capped at 5,000 points (₹1,250 equivalent)/month."),
    ("in_yes_marquee", "5541", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_yes_marquee", "6513", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Rent payments completely excluded."),
    ("in_yes_marquee", "6540", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Wallet top-ups completely excluded."),

    # SC Ultimate
    ("in_sc_ultimate", "DEFAULT", 0, 3.33, 1.0, 1.0000, None, "Base: 5 Reward points per Rs.150. Net yield 3.33% (1 point = Rs.1.00 high-tier vouchers)."),
    ("in_sc_ultimate", "6300", 0, 3.33, 1.0, 1.0000, 10000.0, "⚠️ Insurance spends capped at 10,000 points (₹10,000 value)/month."),
    ("in_sc_ultimate", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_sc_ultimate", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government tax payments completely excluded."),

    # IDFC FIRST Private
    ("in_idfc_first_private", "DEFAULT", 0, 1.50, 1.0, 0.2500, None, "Base: 6X points offline. Net yield 1.50% (1 point = Rs.0.25 cash value)."),
    ("in_idfc_first_private", "5310", 0, 2.50, 1.0, 0.2500, None, "Online: 10X points (Net yield: 2.50%) up to 30k/month; incremental online is also 10X."),
    ("in_idfc_first_private", "4900", 0, 0.75, 1.0, 0.2500, 500.0, "⚠️ Utilities & Insurance capped at 2,000 points (₹500 value) per statement cycle."),
    ("in_idfc_first_private", "6300", 0, 0.75, 1.0, 0.2500, 500.0, "⚠️ Utilities & Insurance capped at 2,000 points (₹500 value) per statement cycle."),
    ("in_idfc_first_private", "5541", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Fuel spends completely excluded from earning points."),

    # SBI Cashback
    ("in_sbi_cashback_credit", "DEFAULT", 0, 1.00, 1.0, 1.0000, 2000.0, "Base: 1% cashback on offline/POS spends. Capped at ₹2,000 per statement cycle."),
    ("in_sbi_cashback_credit", "5310", 0, 5.00, 1.0, 1.0000, 2000.0, "Online Retail: 5% cashback. Capped at ₹2,000 per statement cycle."),
    ("in_sbi_cashback_credit", "5411", 0, 5.00, 1.0, 1.0000, 2000.0, "Online Groceries: 5% cashback. Capped at ₹2,000 per statement cycle."),
    ("in_sbi_cashback_credit", "7993", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Gaming spends completely excluded."),
    ("in_sbi_cashback_credit", "7994", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Gaming spends completely excluded."),
    ("in_sbi_cashback_credit", "5816", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Gaming spends completely excluded."),
    ("in_sbi_cashback_credit", "4784", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Toll payments completely excluded."),
    ("in_sbi_cashback_credit", "9222", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_sbi_cashback_credit", "9311", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_sbi_cashback_credit", "9402", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_sbi_cashback_credit", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_sbi_cashback_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_sbi_cashback_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_sbi_cashback_credit", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_sbi_cashback_credit", "4900", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Utility bills completely excluded."),
    ("in_sbi_cashback_credit", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded."),
    ("in_sbi_cashback_credit", "8299", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 School & educational services completely excluded."),
    ("in_sbi_cashback_credit", "5094", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Jewelry retail purchases completely excluded."),
    ("in_sbi_cashback_credit", "4112", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Railways completely excluded."),

    # Axis Atlas
    ("in_axis_atlas_credit", "DEFAULT", 0, 4.00, 2.0, 1.0000, None, "Base: 2 Edge Miles per Rs.100. Net yield 4.00% based on 1:2 transfer partners miles value (₹1.00/mile)."),
    ("in_axis_atlas_credit", "4511", 0, 10.00, 5.0, 1.0000, None, "Direct Flights: 5 Edge Miles per Rs.100 (Net yield: 10.00%). Spends above Rs. 2 Lakhs drop to base."),
    ("in_axis_atlas_credit", "7011", 0, 10.00, 5.0, 1.0000, None, "Direct Hotels: 5 Edge Miles per Rs.100 (Net yield: 10.00%). Spends above Rs. 2 Lakhs drop to base."),
    ("in_axis_atlas_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_axis_atlas_credit", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_axis_atlas_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_axis_atlas_credit", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),

    # HSBC Live+
    ("in_hsbc_live_plus_credit", "DEFAULT", 0, 0.50, 1.0, 1.0000, None, "Base: 0.5% cashback on offline/POS spends."),
    ("in_hsbc_live_plus_credit", "5812", 0, 10.00, 1.0, 1.0000, 1000.0, "Dining: 10% cashback. Capped at ₹1,000/month aggregate with groceries."),
    ("in_hsbc_live_plus_credit", "5814", 0, 10.00, 1.0, 1.0000, 1000.0, "Fast Food: 10% cashback. Capped at ₹1,000/month aggregate with groceries."),
    ("in_hsbc_live_plus_credit", "5411", 0, 10.00, 1.0, 1.0000, 1000.0, "Grocery: 10% cashback. Capped at ₹1,000/month aggregate with dining."),
    ("in_hsbc_live_plus_credit", "5310", 0, 1.50, 1.0, 1.0000, None, "Online: 1.5% cashback on online e-commerce shopping."),
    ("in_hsbc_live_plus_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely devalued to 0%."),
    ("in_hsbc_live_plus_credit", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet top-ups completely excluded."),
    ("in_hsbc_live_plus_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_hsbc_live_plus_credit", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded."),

    # Swiggy HDFC
    ("in_hdfc_swiggy", "DEFAULT", 0, 1.00, 1.0, 1.0000, None, "Base: 1% cashback on offline and other spends."),
    ("in_hdfc_swiggy", "5812", 0, 10.00, 1.0, 1.0000, 1500.0, "Swiggy App: 10% cashback (includes food, Instamart, Dineout). Capped at ₹1,500/month."),
    ("in_hdfc_swiggy", "5310", 0, 5.00, 1.0, 1.0000, 1500.0, "Online shopping: 5% cashback on Amazon, Flipkart, etc. Capped at ₹1,500/month."),
    ("in_hdfc_swiggy", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_hdfc_swiggy", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_hdfc_swiggy", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet top-ups completely excluded."),
    ("in_hdfc_swiggy", "4900", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Utility bills completely excluded."),
    ("in_hdfc_swiggy", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_hdfc_swiggy", "5094", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Jewelry transactions completely excluded."),

    # Axis Airtel
    ("in_axis_airtel_credit", "DEFAULT", 0, 1.00, 1.0, 1.0000, None, "Base: 1% cashback on other spends."),
    ("in_axis_airtel_credit", "4814", 0, 25.00, 1.0, 1.0000, 250.0, "Airtel: 25% cashback on Airtel mobile, broadband, and DTH. Capped at ₹250/month."),
    ("in_axis_airtel_credit", "4900", 0, 10.00, 1.0, 1.0000, 250.0, "Utilities: 10% cashback on utility payments via Airtel Thanks App. Capped at ₹250/month."),
    ("in_axis_airtel_credit", "5812", 0, 10.00, 1.0, 1.0000, 500.0, "Dining/Food Apps: 10% cashback on Swiggy, Zomato, BigBasket. Capped at ₹500/month."),
    ("in_axis_airtel_credit", "5411", 0, 10.00, 1.0, 1.0000, 500.0, "Groceries: 10% cashback on BigBasket. Capped at ₹500/month."),
    ("in_axis_airtel_credit", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance payments completely excluded from rewards."),
    ("in_axis_airtel_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_axis_airtel_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_axis_airtel_credit", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet top-ups completely excluded."),

    # Amex Plat Travel
    ("in_amex_platinum_travel", "DEFAULT", 0, 1.00, 1.0, 1.0000, None, "Base: 1 MR per Rs.50. Net yield ~1% before milestone bonuses (~8% net yield on exactly 4L spends)."),
    ("in_amex_platinum_travel", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_amex_platinum_travel", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded."),
    ("in_amex_platinum_travel", "4900", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Utility bills completely excluded."),

    # Amex Gold Charge
    ("in_amex_gold_charge", "DEFAULT", 0, 1.00, 1.0, 1.0000, None, "Base: 1 MR per Rs.50 spent. Includes monthly 1,000 bonus points for 6 transactions of ₹1000+."),
    ("in_amex_gold_charge", "5310", 0, 5.00, 5.0, 1.0000, None, "Reward Multiplier: 5X MR points (Net yield: 5.00%) on Amazon/Flipkart vouchers."),
    ("in_amex_gold_charge", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_amex_gold_charge", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded."),
    ("in_amex_gold_charge", "4900", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Utility bills completely excluded."),

    # Amex MRCC
    ("in_amex_mrcc", "DEFAULT", 0, 1.00, 1.0, 1.0000, None, "Base: 1 MR per Rs.50 spent. Includes monthly milestone rewards (1000 MR for 4 tx of 1500+)."),
    ("in_amex_mrcc", "5310", 0, 2.00, 2.0, 1.0000, None, "Reward Multiplier: 2X MR points (Net yield: 2.00%) on select online merchants."),
    ("in_amex_mrcc", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_amex_mrcc", "4900", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Utility bills completely excluded."),
    ("in_amex_mrcc", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded."),

    # Tata Neu Infinity
    ("in_hdfc_tata_neu_infinity", "DEFAULT", 0, 1.50, 1.0, 1.0000, None, "Base: 1.5% NeuCoins on non-Tata retail spends (1 NeuCoin = Rs. 1.00)."),
    ("in_hdfc_tata_neu_infinity", "5310", 0, 5.00, 1.0, 1.0000, None, "Tata Neu: 5% NeuCoins on purchases via Tata Neu App ecosystem (Croma, BigBasket, 1mg)."),
    ("in_hdfc_tata_neu_infinity", "5411", 0, 5.00, 1.0, 1.0000, None, "Tata Neu Groceries: 5% NeuCoins on BigBasket via Tata Neu App."),
    ("in_hdfc_tata_neu_infinity", "5912", 0, 5.00, 1.0, 1.0000, None, "Tata Neu Health: 5% NeuCoins on 1mg via Tata Neu App."),
    ("in_hdfc_tata_neu_infinity", "4722", 0, 5.00, 1.0, 1.0000, None, "Tata Neu Travel: 5% NeuCoins on Air India/IHCL via Tata Neu App."),
    ("in_hdfc_tata_neu_infinity", "4900", 0, 1.50, 1.0, 1.0000, 2000.0, "⚠️ Utilities: Capped at 2,000 NeuCoins per calendar month."),
    ("in_hdfc_tata_neu_infinity", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_hdfc_tata_neu_infinity", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_hdfc_tata_neu_infinity", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government tax platforms completely excluded."),

    # Amazon Pay ICICI
    ("in_icici_amazon_pay_credit", "DEFAULT", 0, 1.00, 1.0, 1.0000, None, "Base: 1% cashback on offline and non-partner spends. Auto-applied as Amazon Pay Balance."),
    ("in_icici_amazon_pay_credit", "5310", 0, 5.00, 1.0, 1.0000, None, "Amazon Prime: 5% cashback on Amazon shopping. (3% for non-prime members). Uncapped."),
    ("in_icici_amazon_pay_credit", "5812", 0, 2.00, 1.0, 1.0000, None, "Partner Merchants: 2% cashback on dining partners (uncapped)."),
    ("in_icici_amazon_pay_credit", "4900", 0, 2.00, 1.0, 1.0000, None, "Amazon utilities: 2% cashback on bills paid via Amazon Pay."),
    ("in_icici_amazon_pay_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded from cashback."),
    ("in_icici_amazon_pay_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_icici_amazon_pay_credit", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loads completely excluded."),

    # Regalia Gold
    ("in_hdfc_regalia_gold", "DEFAULT", 0, 1.33, 1.0, 0.5000, None, "Base: 4 points per Rs.150 spent. Net yield 1.33% (1 point = Rs.0.50 Gold Travel Portal)."),
    ("in_hdfc_regalia_gold", "5310", 0, 6.67, 5.0, 0.5000, 2000.0, "Marks & Spencer, Myntra, Nykaa, Reliance Digital: 5X points (Net yield: 6.67%), capped at 4,000 points/month."),
    ("in_hdfc_regalia_gold", "4511", 0, 6.67, 5.0, 0.5000, 2000.0, "Flights via SmartBuy: 5X points (Net yield: 6.67%), capped at 4,000 points/month."),
    ("in_hdfc_regalia_gold", "7011", 0, 6.67, 5.0, 0.5000, 2000.0, "Hotels via SmartBuy: 5X points (Net yield: 6.67%), capped at 4,000 points/month."),
    ("in_hdfc_regalia_gold", "4900", 0, 1.33, 1.0, 0.5000, 1000.0, "⚠️ Utilities: Capped at 2,000 points (₹1,000 value)/month."),
    ("in_hdfc_regalia_gold", "6540", 1, 0.00, 1.0, 0.5000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_hdfc_regalia_gold", "6552", 1, 0.00, 1.0, 0.5000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_hdfc_regalia_gold", "9399", 1, 0.00, 1.0, 0.5000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_hdfc_regalia_gold", "5541", 1, 0.00, 1.0, 0.5000, 0.0, "🚫 Fuel spends completely excluded."),

    # Millennia
    ("in_hdfc_millennia_credit", "DEFAULT", 0, 1.00, 1.0, 1.0000, 1000.0, "Base: 1% CashPoints on offline/online general spends. Capped at 1,000 CashPoints/cycle."),
    ("in_hdfc_millennia_credit", "5310", 0, 5.00, 1.0, 1.0000, 1000.0, "Partner Merchants: 5% CashPoints on Amazon, Flipkart, Myntra, Tata CLiQ. Capped at 1,000 CashPoints/cycle."),
    ("in_hdfc_millennia_credit", "5812", 0, 5.00, 1.0, 1.0000, 1000.0, "Partner Apps: 5% CashPoints on Swiggy, Zomato, Uber, BookMyShow. Capped at 1,000 CashPoints/cycle."),
    ("in_hdfc_millennia_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_hdfc_millennia_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_hdfc_millennia_credit", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_hdfc_millennia_credit", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_hdfc_millennia_credit", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded."),

    # Axis Ace
    ("in_axis_ace_credit", "DEFAULT", 0, 1.50, 1.0, 1.0000, None, "Base: Flat 1.5% cashback on general online/offline POS spends. Uncapped."),
    ("in_axis_ace_credit", "4900", 0, 5.00, 1.0, 1.0000, 250.0, "Utilities: 5% cashback via Google Pay. Capped at ₹250/month."),
    ("in_axis_ace_credit", "5812", 0, 4.00, 1.0, 1.0000, None, "Dining/Rides: 4% cashback on Swiggy, Zomato, and Ola (uncapped)."),
    ("in_axis_ace_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_axis_ace_credit", "6540", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Wallet loading completely excluded."),
    ("in_axis_ace_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_axis_ace_credit", "9399", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Government transactions completely excluded."),
    ("in_axis_ace_credit", "8299", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Educational fees completely excluded."),

    # SC Smart
    ("in_sc_smart_credit", "DEFAULT", 0, 1.00, 1.0, 1.0000, None, "Base: 1% cashback on offline spends (uncapped)."),
    ("in_sc_smart_credit", "5310", 0, 2.00, 1.0, 1.0000, 1000.0, "Online: 2% cashback on online retail transactions. Capped at ₹1,000/month."),
    ("in_sc_smart_credit", "5541", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_sc_smart_credit", "6300", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Insurance premiums completely excluded."),
    ("in_sc_smart_credit", "4900", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Utility bills completely excluded."),
    ("in_sc_smart_credit", "6552", 1, 0.00, 1.0, 1.0000, 0.0, "🚫 Rent transactions completely excluded."),

    # IDFC First Wealth
    ("in_idfc_first_wealth", "DEFAULT", 0, 0.75, 1.0, 0.2500, None, "Base: 3X points offline on weekdays. Net yield 0.75% (1 point = Rs.0.25)."),
    ("in_idfc_first_wealth", "5310", 0, 1.50, 1.0, 0.2500, None, "Online: 6X points (Net yield: 1.50%) on online weekday spends up to 30k."),
    ("in_idfc_first_wealth", "4900", 0, 0.75, 1.0, 0.2500, 500.0, "⚠️ Utilities & Insurance capped at 2,000 points (₹500 value) per statement cycle."),
    ("in_idfc_first_wealth", "6300", 0, 0.75, 1.0, 0.2500, 500.0, "⚠️ Utilities & Insurance capped at 2,000 points (₹500 value) per statement cycle."),
    ("in_idfc_first_wealth", "5541", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Fuel spends completely excluded from earning points."),

    # OneCard
    ("in_onecard_metal", "DEFAULT", 0, 0.20, 1.0, 0.1000, None, "Base: 1 point per Rs.50 (0.20% yield, 10 points = Rs.1.00 cash)."),
    ("in_onecard_metal", "5812", 0, 1.00, 5.0, 0.1000, None, "Top 2 Category: 5X points (Net yield: 1.00%) automatically if dining is in top 2 spends (requires spending across 3 categories)."),
    ("in_onecard_metal", "5411", 0, 1.00, 5.0, 0.1000, None, "Top 2 Category: 5X points (Net yield: 1.00%) automatically if groceries is in top 2 spends (requires spending across 3 categories)."),
    ("in_onecard_metal", "6540", 1, 0.00, 1.0, 0.1000, 0.0, "🚫 Wallet loading completely excluded."),

    # SBI Prime
    ("in_sbi_prime", "DEFAULT", 0, 0.50, 1.0, 0.2500, None, "Base: 2 points per Rs.100 spent (0.50% yield, 4 points = Rs.1.00)."),
    ("in_sbi_prime", "5812", 0, 2.50, 5.0, 0.2500, 2500.0, "Dining: 10X points (Net yield: 2.50%). Capped at 10,000 points (₹2,500 value)/month aggregate."),
    ("in_sbi_prime", "5411", 0, 2.50, 5.0, 0.2500, 2500.0, "Groceries: 10X points (Net yield: 2.50%). Capped at 10,000 points (₹2,500 value)/month aggregate."),
    ("in_sbi_prime", "5311", 0, 2.50, 5.0, 0.2500, 2500.0, "Departmental: 10X points (Net yield: 2.50%). Capped at 10,000 points (₹2,500 value)/month aggregate."),
    ("in_sbi_prime", "4900", 0, 5.00, 10.0, 0.2500, None, "Utilities: 20 reward points per Rs.100 spent (Net yield: 5.00%)."),
    ("in_sbi_prime", "5541", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_sbi_prime", "6552", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Rent payments completely excluded."),

    # Axis Select
    ("in_axis_select", "DEFAULT", 0, 0.20, 1.0, 0.2000, None, "Base: 2 Edge points per Rs.200 (0.20% yield, 5:1 transfer ratio)."),
    ("in_axis_select", "5411", 0, 1.00, 5.0, 0.2000, 400.0, "Groceries: 10X points (Net yield: 1.00%), capped at 2,000 Edge points (₹400 value)/billing cycle."),
    ("in_axis_select", "6552", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Rent payments completely excluded."),
    ("in_axis_select", "5541", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_axis_select", "6540", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_axis_select", "6300", 1, 0.00, 1.0, 0.2000, 0.0, "🚫 Insurance premium bills completely excluded."),

    # AU Nomad
    ("in_au_nomad", "DEFAULT", 0, 1.00, 1.0, 0.2500, None, "Base: 1% travel value yield on retail domestic spends."),
    ("in_au_nomad", "4511", 0, 2.00, 2.0, 0.2500, None, "Flights: 2% travel value yield (2 points per Rs.100)."),
    ("in_au_nomad", "7011", 0, 2.00, 2.0, 0.2500, None, "Hotels: 2% travel value yield (2 points per Rs.100)."),
    ("in_au_nomad", "5541", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_au_nomad", "6540", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_au_nomad", "6552", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Rent payments completely excluded."),

    # Federal Celesta
    ("in_federal_celesta", "DEFAULT", 0, 0.25, 1.0, 0.2500, None, "Base: 1X points. Net yield 0.25% (1 point = Rs.0.25)."),
    ("in_federal_celesta", "5812", 0, 0.50, 2.0, 0.2500, 1250.0, "Dining: 2X points (Net yield: 0.50%), capped at 5,000 bonus points (₹1,250 equivalent)/cycle."),
    ("in_federal_celesta", "4511", 0, 0.50, 2.0, 0.2500, 1250.0, "Flights: 2X points (Net yield: 0.50%), capped at 5,000 bonus points (₹1,250 equivalent)/cycle."),
    ("in_federal_celesta", "7011", 0, 0.50, 2.0, 0.2500, 1250.0, "Hotels: 2X points (Net yield: 0.50%), capped at 5,000 bonus points (₹1,250 equivalent)/cycle."),
    ("in_federal_celesta", "5541", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Fuel spends completely excluded."),
    ("in_federal_celesta", "6540", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_federal_celesta", "6552", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Rent payments completely excluded."),

    # PNB RuPay Select
    ("in_pnb_rupay_select_debit", "DEFAULT", 0, 0.25, 1.0, 0.2500, None, "Base: 1 reward point per Rs.100 spent (0.25% yield)."),
    ("in_pnb_rupay_select_debit", "5812", 0, 0.50, 2.0, 0.2500, None, "POS Dining: 2X reward points per Rs.100 spent (0.50% yield)."),
    ("in_pnb_rupay_select_debit", "4511", 0, 0.50, 2.0, 0.2500, None, "POS Travel: 2X reward points per Rs.100 spent (0.50% yield)."),
    ("in_pnb_rupay_select_debit", "7011", 0, 0.50, 2.0, 0.2500, None, "POS Hotels: 2X reward points per Rs.100 spent (0.50% yield)."),
    ("in_pnb_rupay_select_debit", "6540", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Wallet loads completely excluded."),

    # SBI Wealth RuPay Select
    ("in_sbi_rupay_select_debit", "DEFAULT", 0, 0.25, 1.0, 0.5000, None, "Base: 1 point per Rs.200 offline. Net yield 0.25% (1 point = Rs.0.50)."),
    ("in_sbi_rupay_select_debit", "5310", 0, 0.50, 2.0, 0.5000, None, "E-commerce: 2 points per Rs.200 online (Net yield: 0.50%)."),
    ("in_sbi_rupay_select_debit", "6540", 1, 0.00, 1.0, 0.5000, 0.0, "🚫 Wallet loads completely excluded."),
    ("in_sbi_rupay_select_debit", "5541", 1, 0.00, 1.0, 0.5000, 0.0, "🚫 Fuel spends completely excluded from points."),

    # Canara RuPay Select
    ("in_canara_rupay_select_debit", "DEFAULT", 0, 0.25, 1.0, 0.2500, None, "Base: 1 reward point per Rs.100 spent (0.25% yield)."),
    ("in_canara_rupay_select_debit", "6540", 1, 0.00, 1.0, 0.2500, 0.0, "🚫 Wallet loads completely excluded.")
]

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Disable foreign keys temporarily for bulk card resets
    cursor.execute("PRAGMA foreign_keys = OFF;")

    print("🌱 Inserting missing MCC definitions...")
    missing_mccs = [
        ("5732", "Electronics", "Electronic Stores & Apple Products"),
        ("4814", "Telecom", "Telecom Services & Bill Payments"),
        ("4812", "Telecom", "Telecom Equipment & Purchases"),
        ("5311", "Retail", "Department Stores"),
        ("5948", "Retail", "Luggage & Leather Goods"),
        ("7993", "Entertainment", "Digital Gaming & Amusement"),
        ("7994", "Entertainment", "Digital Gaming & Video Games"),
        ("5816", "Entertainment", "Digital Gaming Merchants"),
        ("4784", "Transportation", "Tolls & Road Fees"),
        ("9222", "Government", "Postal Services"),
        ("9311", "Government", "Tax Payments"),
        ("9402", "Government", "Postal & Government Services"),
        ("5814", "Dining", "Fast Food Restaurants"),
    ]
    for mcc, group, name in missing_mccs:
        cursor.execute("""
            INSERT INTO mcc_directory (mcc_code, industry_group, clean_category_name)
            VALUES (?, ?, ?)
            ON CONFLICT(mcc_code) DO NOTHING
        """, (mcc, group, name))

    print("🌱 Inserting/Updating banks validation...")
    for bank_id, info in BANK_INFO.items():
        cursor.execute("""
            INSERT INTO banks (bank_id, display_name, customer_support_phone, grievance_email)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(bank_id) DO UPDATE SET
                display_name = excluded.display_name,
                customer_support_phone = excluded.customer_support_phone,
                grievance_email = excluded.grievance_email
        """, (bank_id, info[0], info[1], info[2]))

    print("🌱 Ingesting cards catalog details...")
    for card in CARDS_DATA:
        cursor.execute("""
            INSERT INTO cards (
                card_id, bank_id, card_name, card_type, card_network,
                joining_fee_inr, annual_fee_inr, spend_waiver_threshold_inr,
                forex_markup_pct, lounge_access_domestic, lounge_access_international,
                ancillary_benefits, is_cashback_card, is_active, official_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT(card_id) DO UPDATE SET
                bank_id = excluded.bank_id,
                card_name = excluded.card_name,
                card_type = excluded.card_type,
                card_network = excluded.card_network,
                joining_fee_inr = excluded.joining_fee_inr,
                annual_fee_inr = excluded.annual_fee_inr,
                spend_waiver_threshold_inr = excluded.spend_waiver_threshold_inr,
                forex_markup_pct = excluded.forex_markup_pct,
                lounge_access_domestic = excluded.lounge_access_domestic,
                lounge_access_international = excluded.lounge_access_international,
                ancillary_benefits = excluded.ancillary_benefits,
                is_cashback_card = excluded.is_cashback_card,
                official_link = excluded.official_link
        """, (
            card["card_id"], card["bank_id"], card["card_name"], card["card_type"], card["card_network"],
            card["joining_fee_inr"], card["annual_fee_inr"], card["spend_waiver_threshold_inr"],
            card["forex_markup_pct"], card["lounge_access_domestic"], card["lounge_access_international"],
            card["ancillary_benefits"], card["is_cashback_card"], card["official_link"]
        ))

    print("🌱 Clearing old rules for the updated cards...")
    card_ids_to_clean = [card["card_id"] for card in CARDS_DATA]
    cursor.execute(
        f"DELETE FROM reward_rules WHERE card_id IN ({','.join('?' for _ in card_ids_to_clean)})",
        card_ids_to_clean
    )

    print("🌱 Seeding detailed reward rules...")
    cursor.executemany(
        """INSERT INTO reward_rules
           (card_id, mcc_code, is_completely_excluded, base_reward_percentage,
            points_multiplier, point_to_inr_valuation, monthly_capping_inr, gimmick_warning_text)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        REWARD_RULES
    )

    conn.commit()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Run a FK check
    fk_check = cursor.execute("PRAGMA foreign_key_check;").fetchall()
    if fk_check:
        print(f"⚠️ Warning: FK violations found: {fk_check}")
    else:
        print("✅ DB migration and rules ingestion completed successfully!")
    
    conn.close()

def generate_markdown_docs():
    """
    Generate the corresponding markdown files under card_docs/ for the updated cards.
    """
    if not os.path.exists(DOCS_DIR):
        os.makedirs(DOCS_DIR)

    bank_names = {b_id: info[0] for b_id, info in BANK_INFO.items()}

    print("📂 Programmatically updating markdown documents in card_docs/...")
    
    for card in CARDS_DATA:
        card_id = card["card_id"]
        bank_name = bank_names.get(card["bank_id"], card["bank_id"])
        
        doc = f"# {card['card_name']}\n\n"
        doc += f"The **{card['card_name']}** is a premium **{card['card_type'].capitalize()}** card issued by **{bank_name}** running on the **{card['card_network']}** network. Below are the verified fee structures, reward policies, exclusions, and card terms.\n\n"
        
        # Fee structure
        doc += "## 💳 Fee and Waiver Structure\n"
        doc += f"- **Joining Fee:** ₹{card['joining_fee_inr']:,.2f} + GST\n"
        doc += f"- **Annual Fee:** ₹{card['annual_fee_inr']:,.2f} + GST\n"
        if card['spend_waiver_threshold_inr'] and card['spend_waiver_threshold_inr'] > 0:
            doc += f"- **Annual Fee Spend Waiver Threshold:** Spends exceeding ₹{card['spend_waiver_threshold_inr']:,.2f} in the previous card anniversary year waive the subsequent year's fee.\n"
        else:
            doc += "- **Annual Fee Spend Waiver Threshold:** N/A (Card is either Lifetime Free or has a non-waivable annual fee structure).\n"
        doc += "\n"

        # Perks & Lounge Access
        doc += "## ✈️ Perks and Lounge Access\n"
        doc += f"- **Forex Markup:** {card['forex_markup_pct']:.2f}% + GST\n"
        doc += f"- **Domestic Lounge:** {card['lounge_access_domestic'] or 'None'}\n"
        doc += f"- **International Lounge:** {card['lounge_access_international'] or 'None'}\n"
        doc += f"- **Ancillary Benefits:** {card['ancillary_benefits'] or 'None'}\n"
        doc += "\n"

        # Reward Rules
        doc += "## 📊 Reward Point Matrix & Category Exclusions\n"
        doc += "This matrix outlines the net cash-equivalent return percentages across different merchant category codes (MCCs):\n\n"
        doc += "| Category / Merchant | MCC Code | Reward Yield | Monthly Cap / Exclusions |\n"
        doc += "| :--- | :--- | :--- | :--- |\n"
        
        card_rules = [r for r in REWARD_RULES if r[0] == card_id]
        # Sort so DEFAULT is at the top
        card_rules.sort(key=lambda r: 0 if r[1] == 'DEFAULT' else 1)
        
        for rule in card_rules:
            mcc = rule[1]
            cat_name = mcc
            if mcc == "DEFAULT":
                cat_name = "**Default / All Other Spends**"
            elif mcc == "7011": cat_name = "Hotels & Accommodations"
            elif mcc == "5732": cat_name = "Electronics"
            elif mcc == "5094": cat_name = "Jewelry"
            elif mcc == "4511": cat_name = "Airlines & Flights"
            elif mcc == "5411": cat_name = "Grocery & Supermarkets"
            elif mcc == "6300": cat_name = "Insurance Premiums"
            elif mcc == "4900": cat_name = "Utilities"
            elif mcc == "4814": cat_name = "Telecom"
            elif mcc == "5812": cat_name = "Dining & Restaurants"
            elif mcc == "5814": cat_name = "Fast Food"
            elif mcc == "5310": cat_name = "E-Commerce Shopping"
            elif mcc == "5541": cat_name = "Fuel & Petrol"
            elif mcc == "6540": cat_name = "Wallet Load"
            elif mcc == "6513" or mcc == "6552": cat_name = "Rent Payments"
            elif mcc == "9399" or mcc == "9222" or mcc == "9311" or mcc == "9402": cat_name = "Government / Taxes"
            
            excluded = rule[2]
            yield_pct = rule[3]
            multiplier = rule[4]
            valuation = rule[5]
            cap = rule[6]
            warning = rule[7]
            
            yield_val = yield_pct * multiplier * valuation
            yield_str = f"{yield_val:.2f}%"
            if excluded:
                yield_str = "0.00% (Excluded)"
            
            cap_str = f"Cap ₹{cap:,.2f}/month" if cap else "No Cap"
            if excluded:
                cap_str = "🚫 Excluded Category"
                
            doc += f"| {cat_name} | `{mcc}` | **{yield_str}** | {cap_str} |\n"
            
        doc += "\n"
        
        warnings = [r[7] for r in card_rules if r[7]]
        if warnings:
            doc += "### ⚠️ Crucial Terms and Marketing Gimmicks\n"
            for w in warnings:
                doc += f"- {w}\n"
            doc += "\n"

        doc += "---\n*This document is the verified production specification copy for Cardwise Engine v2. Last updated mid-2026. Official terms and conditions apply.*\n"

        file_path = os.path.join(DOCS_DIR, f"{card_id}.md")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(doc)
            
    print(f"✅ Successfully compiled documentation for {len(CARDS_DATA)} cards!")

if __name__ == "__main__":
    migrate()
    generate_markdown_docs()
