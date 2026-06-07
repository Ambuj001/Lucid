import os
import sqlite3

DB_PATH = "cardwise_production.db"

def run_migration():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Alter 'banks' table to add portal URL and name columns if not present
    cursor.execute("PRAGMA table_info(banks)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "redemption_portal_url" not in columns:
        print("Adding column 'redemption_portal_url' to table 'banks'...")
        cursor.execute("ALTER TABLE banks ADD COLUMN redemption_portal_url TEXT;")
    if "redemption_portal_name" not in columns:
        print("Adding column 'redemption_portal_name' to table 'banks'...")
        cursor.execute("ALTER TABLE banks ADD COLUMN redemption_portal_name TEXT;")

    # 2. Create the 'card_transfer_partners' table
    print("Creating 'card_transfer_partners' table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS card_transfer_partners (
        partner_id TEXT NOT NULL,
        ecosystem_id TEXT NOT NULL,
        partner_name TEXT NOT NULL,
        program_name TEXT NOT NULL,
        partner_type TEXT NOT NULL CHECK (partner_type IN ('airline', 'hotel')),
        transfer_ratio TEXT NOT NULL,
        rate_multiplier REAL NOT NULL,
        value_per_mile REAL NOT NULL,
        alliance TEXT,
        partner_group TEXT,
        partner_domain TEXT NOT NULL,
        redemption_url TEXT NOT NULL,
        brand_color TEXT NOT NULL,
        description TEXT,
        PRIMARY KEY (ecosystem_id, partner_id)
    );
    """)

    # 3. Seed / Update Bank portal details
    print("Seeding bank redemption portal metadata...")
    bank_portals = [
        ("HDFC", "https://www.hdfcbanksmartbuy.com", "SmartBuy / Rewards360"),
        ("AXIS", "https://traveledge.axisbank.co.in", "Travel EDGE"),
        ("AMEX", "https://www.americanexpress.com/en-in/rewards/membership-rewards/", "Membership Rewards"),
        ("ICICI", "https://www.icicibank.com/personal-banking/cards/credit-card/rewards/reward-points-redemption", "iMobile Pay / Rewards"),
        ("SBI", "https://www.sbicard.com/en/personal/benefits/aurum-rewards.page", "SBI AURUM Rewardz Portal")
    ]
    for bank_id, portal_url, portal_name in bank_portals:
        cursor.execute("""
        UPDATE banks 
        SET redemption_portal_url = ?, redemption_portal_name = ?
        WHERE bank_id = ?
        """, (portal_url, portal_name, bank_id))
    
    # 4. Clean and seed transfer partners
    print("Seeding transfer partners...")
    cursor.execute("DELETE FROM card_transfer_partners;")

    partners_data = [
        # HDFC
        ('ba', 'hdfc', 'British Airways', 'Executive Club (Avios)', 'airline', '2:1', 0.5, 1.5, 'Oneworld', 'A', 'britishairways.com', 'https://www.britishairways.com/executive-club', '#075AAA', 'Premium Oneworld partner. Sweet spots: BOM to LHR Club World 51,500 Avios, DEL to DOH 15,000 Avios on Qatar.'),
        ('qa', 'hdfc', 'Qatar Airways', 'Privilege Club', 'airline', '2:1', 0.5, 1.8, 'Oneworld', 'A', 'qatarairways.com', 'https://www.qatarairways.com/en/privilege-club.html', '#5C0632', 'Best business class product globally. Qsuites BOM to DOH 37,500 miles one-way. Exceptional F/J availability.'),
        ('sq', 'hdfc', 'Singapore Airlines', 'KrisFlyer', 'airline', '2:1', 0.5, 1.6, 'Star Alliance', 'A', 'singaporeair.com', 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', '#00256C', 'Premium Star Alliance carrier. DEL to SIN Suites 57,375 miles. KrisFlyer miles are among the most versatile globally.'),
        ('cx', 'hdfc', 'Cathay Pacific', 'Asia Miles', 'airline', '2:1', 0.5, 1.4, 'Oneworld', 'A', 'cathaypacific.com', 'https://www.cathaypacific.com/cx/en_HK/asia-miles.html', '#006564', 'Exceptional F/J product via HKG. BOM to HKG Business 40,000 miles. Strong Oneworld partner redemption network.'),
        ('ac', 'hdfc', 'Air Canada', 'Aeroplan', 'airline', '2:1', 0.5, 1.5, 'Star Alliance', 'A', 'aircanada.com', 'https://www.aircanada.com/aeroplan', '#F01428', 'Powerful Star Alliance redemptions. Dynamic pricing on AC metal, fixed on partners. DEL to YYZ J 70,000 pts.'),
        ('ey', 'hdfc', 'Etihad Airways', 'Etihad Guest', 'airline', '2:1', 0.5, 1.3, 'Independent', 'A', 'etihad.com', 'https://www.etihad.com/en/etihad-guest', '#BD8B13', 'Premium Middle East carrier via AUH. Strong J/F product. BOM to AUH to LHR Business 62,500 miles.'),
        ('tg', 'hdfc', 'Thai Airways', 'Royal Orchid Plus', 'airline', '2:1', 0.5, 1.2, 'Star Alliance', 'A', 'thaiairways.com', 'https://www.thaiairways.com/en/royal-orchid-plus.html', '#3F2785', 'Strong for Asia routes via BKK. DEL to BKK J 35,000 miles. New 787 business class offers excellent value.'),
        ('af', 'hdfc', 'Air France-KLM', 'Flying Blue', 'airline', '1:1', 1.0, 1.2, 'SkyTeam', 'B', 'airfrance.com', 'https://www.flyingblue.com', '#002157', 'Best 1:1 ratio partner. Promo rewards frequently available. BOM to CDG J from 53,000 miles. Dynamic pricing.'),
        ('ak', 'hdfc', 'AirAsia', 'AirAsia Rewards', 'airline', '1:1', 1.0, 0.8, 'LCC', 'B', 'airasia.com', 'https://www.airasia.com/rewards', '#FF0000', 'Budget carrier for SEA routes. Points can offset fare directly. Best for domestic & short-haul SEA flights.'),
        ('ay', 'hdfc', 'Finnair', 'Finnair Plus', 'airline', '1:1', 1.0, 1.1, 'Oneworld', 'B', 'finnair.com', 'https://www.finnair.com/en/finnair-plus', '#0B1560', 'Fastest route to Europe via Helsinki. DEL to HEL J 60,000 points. Avios-convertible via Oneworld. 1:1 transfer.'),
        ('vn', 'hdfc', 'Vietnam Airlines', 'Lotusmiles', 'airline', '1:1', 1.0, 0.9, 'SkyTeam', 'B', 'vietnamairlines.com', 'https://www.vietnamairlines.com/lotusmiles', '#00467F', 'SkyTeam partner for SEA routing. DEL to SGN via HAN Business 42,000 miles. Good availability on own metal.'),
        ('ai', 'hdfc', 'Air India', 'Maharaja Club', 'airline', '2:1', 0.5, 1.0, 'Star Alliance', 'B', 'airindia.com', 'https://www.airindia.com/in/en/fly-maharaja-club.html', '#E31837', 'Domestic & US non-stop routes. BOM to JFK J from 75,000 miles. New A350 product significantly improved.'),
        ('ihg', 'hdfc', 'IHG Hotels', 'IHG One Rewards', 'hotel', '1:1', 1.0, 0.5, 'N/A', 'Hotel', 'ihg.com', 'https://www.ihg.com/one-rewards', '#462E7C', 'InterContinental, Crowne Plaza, Holiday Inn. 1:1 transfer. Points Breaks offer 5,000-40,000 pts/night.'),
        ('wy', 'hdfc', 'Wyndham Hotels', 'Wyndham Rewards', 'hotel', '1:1', 1.0, 0.5, 'N/A', 'Hotel', 'wyndhamhotels.com', 'https://www.wyndhamrewards.com', '#0067B1', 'Flat 15,000 pts/night at any category. Ramada, Days Inn. Go Free nights offer excellent value at premium properties.'),
        ('all', 'hdfc', 'Accor Hotels', 'ALL – Accor Live Limitless', 'hotel', '2:1', 0.5, 1.8, 'N/A', 'Hotel', 'all.accor.com', 'https://all.accor.com', '#1B3C6F', 'Sofitel, Novotel, Pullman, Ibis. 2,000 pts = 1,000 ALL pts (~₹1,800 value). Strong India & Europe presence.'),
        ('itc', 'hdfc', 'ITC Hotels', 'Club ITC', 'hotel', '2:1', 0.5, 2.0, 'N/A', 'Hotel', 'itchotels.com', 'https://www.itchotels.com/in/en/club-itc', '#0E4D3B', 'India\'s finest luxury hotel chain. Exceptional domestic redemption value. ITC Maurya, Grand Chola, Maratha.'),
        
        # Axis
        ('sq', 'axis', 'Singapore Airlines', 'KrisFlyer', 'airline', '1:4', 4.0, 1.6, 'Star Alliance', 'A', 'singaporeair.com', 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', '#00256C', 'Top-tier Star Alliance carrier. Suites Class is the pinnacle of luxury. DEL to SIN Suites 57,375 miles. 1:4 transfer ratio.'),
        ('ac', 'axis', 'Air Canada', 'Aeroplan', 'airline', '1:4', 4.0, 1.5, 'Star Alliance', 'A', 'aircanada.com', 'https://www.aircanada.com/aeroplan', '#F01428', 'Best for North America routing. Star Alliance redemptions. Dynamic + fixed pricing mix. 1:4 transfer ratio.'),
        ('tk', 'axis', 'Turkish Airlines', 'Miles&Smiles', 'airline', '1:4', 4.0, 1.5, 'Star Alliance', 'A', 'turkishairlines.com', 'https://www.turkishairlines.com/en-int/miles-and-smiles/', '#C8102E', 'Largest network globally via IST. IST Lounge is world-class. BOM to IST to EUR J from 45,000 miles. 1:4 transfer ratio.'),
        ('ey', 'axis', 'Etihad Airways', 'Etihad Guest', 'airline', '1:4', 4.0, 1.3, 'Independent', 'A', 'etihad.com', 'https://www.etihad.com/en/etihad-guest', '#BD8B13', 'Premium carrier via Abu Dhabi. Strong J/F product. Good availability to Europe via AUH. 1:4 transfer ratio.'),
        ('jl', 'axis', 'Japan Airlines', 'JAL Mileage Bank', 'airline', '1:4', 4.0, 1.4, 'Oneworld', 'A', 'jal.co.jp', 'https://www.jal.co.jp/en/jmb/', '#CC0000', 'Best for Japan routes. DEL to NRT J from 50,000 miles. Exceptional Japanese hospitality in premium cabins. 1:4 ratio.'),
        ('qf', 'axis', 'Qantas', 'Frequent Flyer', 'airline', '1:4', 4.0, 1.3, 'Oneworld', 'A', 'qantas.com', 'https://www.qantas.com/au/en/frequent-flyer.html', '#E40000', 'Premium Oneworld carrier. Strong for Australia & NZ routes. Classic rewards offer fixed pricing. 1:4 ratio.'),
        ('ua', 'axis', 'United Airlines', 'MileagePlus', 'airline', '1:4', 4.0, 1.2, 'Star Alliance', 'A', 'united.com', 'https://www.united.com/en/us/fly/mileageplus.html', '#002244', 'Largest US Star Alliance carrier. Excursionist Perk adds free stopover. BOM to EWR J from 77,000 miles. 1:4 ratio.'),
        ('af', 'axis', 'Air France-KLM', 'Flying Blue', 'airline', '1:4', 4.0, 1.2, 'SkyTeam', 'B', 'airfrance.com', 'https://www.flyingblue.com', '#002157', 'Best 1:4 transfer value. Promo rewards regularly available. SkyTeam network coverage.'),
        ('ak', 'axis', 'AirAsia', 'AirAsia Rewards', 'airline', '1:4', 4.0, 0.8, 'LCC', 'B', 'airasia.com', 'https://www.airasia.com/rewards', '#FF0000', 'Budget carrier. Direct fare offset. Best for Southeast Asia hops. 1:4 ratio.'),
        ('ba', 'axis', 'British Airways', 'Executive Club (Avios)', 'airline', '1:2', 2.0, 1.5, 'Oneworld', 'B', 'britishairways.com', 'https://www.britishairways.com/executive-club', '#075AAA', 'Avios for short-haul are excellent value. New partner added April 2026. 1:2 transfer ratio on Olympus.'),
        ('ay', 'axis', 'Finnair', 'Finnair Plus', 'airline', '1:2', 2.0, 1.1, 'Oneworld', 'B', 'finnair.com', 'https://www.finnair.com/en/finnair-plus', '#0B1560', 'Fastest Europe via Helsinki. New partner added April 2026. 1:2 transfer ratio.'),
        ('vn', 'axis', 'Vietnam Airlines', 'Lotusmiles', 'airline', '1:2', 2.0, 0.9, 'SkyTeam', 'B', 'vietnamairlines.com', 'https://www.vietnamairlines.com/lotusmiles', '#00467F', 'Good for Vietnam & SEA SkyTeam routing. Hanoi hub connectivity. 1:2 ratio.'),
        ('ai', 'axis', 'Air India', 'Maharaja Club', 'airline', '1:4', 4.0, 1.0, 'Star Alliance', 'B', 'airindia.com', 'https://www.airindia.com/in/en/fly-maharaja-club.html', '#E31837', 'Star Alliance India flag carrier. New fleet with A350s. Direct USA & Europe non-stops. 1:4 ratio.'),
        ('et', 'axis', 'Ethiopian Airlines', 'ShebaMiles', 'airline', '1:4', 4.0, 0.9, 'Star Alliance', 'B', 'ethiopianairlines.com', 'https://www.ethiopianairlines.com/shebamiles', '#009639', 'Africa\'s largest carrier. Addis Ababa hub for African connectivity. 1:4 ratio.'),
        ('sg', 'axis', 'SpiceJet', 'SpiceClub', 'airline', '1:4', 4.0, 0.6, 'LCC', 'B', 'spicejet.com', 'https://www.spicejet.com/spiceclub', '#FF0000', 'Indian LCC. Direct fare offset for domestic travel. Best for short domestic hops. 1:4 ratio.'),
        ('tg', 'axis', 'Thai Airways', 'Royal Orchid Plus', 'airline', '1:4', 4.0, 1.2, 'Star Alliance', 'B', 'thaiairways.com', 'https://www.thaiairways.com/en/royal-orchid-plus.html', '#3F2785', 'Excellent J product. BKK routing for SEA/Australia. Star Alliance partner awards. 1:4 ratio.'),
        ('ihg', 'axis', 'IHG Hotels', 'IHG One Rewards', 'hotel', '1:4', 4.0, 0.5, 'N/A', 'Hotel', 'ihg.com', 'https://www.ihg.com/one-rewards', '#462E7C', 'InterContinental, Crowne Plaza, Holiday Inn. 1:4 transfer ratio.'),
        ('wy', 'axis', 'Wyndham Hotels', 'Wyndham Rewards', 'hotel', '1:4', 4.0, 0.5, 'N/A', 'Hotel', 'wyndhamhotels.com', 'https://www.wyndhamrewards.com', '#0067B1', 'Flat-rate Go Free nights. 15,000 pts per night any category. Ramada, Days Inn network. 1:4 ratio.'),
        ('itc', 'axis', 'ITC Hotels', 'Club ITC', 'hotel', '1:4', 4.0, 2.0, 'N/A', 'Hotel', 'itchotels.com', 'https://www.itchotels.com/in/en/club-itc', '#0E4D3B', 'India\'s finest luxury chain. ITC Maurya, Grand Chola. Excellent domestic redemption value. 1:4 ratio.'),
        ('rad', 'axis', 'Radisson Hotels', 'Radisson Rewards', 'hotel', '1:4', 4.0, 0.6, 'N/A', 'Hotel', 'radissonhotels.com', 'https://www.radissonrewards.com', '#003B71', 'Wide India presence. Radisson Blu, Park Inn. Added April 2026. 1:4 ratio.'),
        ('orch', 'axis', 'Orchid Hotels', 'Orchid Rewards', 'hotel', '1:4', 4.0, 0.5, 'N/A', 'Hotel', 'orchidhotel.com', 'https://www.orchidhotel.com', '#6B2E8A', 'India eco-luxury chain. Mumbai, Pune, Goa properties. Added April 2026. 1:4 ratio.'),
        ('pc', 'axis', 'The Postcard Hotel', 'Postcard Rewards', 'hotel', '1:1', 1.0, 1.5, 'N/A', 'Hotel', 'thepostcardhotel.com', 'https://www.thepostcardhotel.com', '#1A1A1A', 'Boutique luxury properties in Goa, Kumarakom, Dewa Thimphu. Ultra-premium, intimate experiences. 1:1 ratio.'),
 
        # AMEX
        ('sq', 'amex', 'Singapore Airlines', 'KrisFlyer', 'airline', '2:1', 0.5, 1.6, 'Star Alliance', 'A', 'singaporeair.com', 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', '#00256C', 'Premium Star Alliance carrier. Points transfer at 2:1 ratio.'),
        ('ek', 'amex', 'Emirates', 'Skywards', 'airline', '2:1', 0.5, 1.3, 'Independent', 'A', 'emirates.com', 'https://www.emirates.com/in/english/skywards/', '#D71921', 'Emirates Skywards. Great for premium cabins to Dubai. 2:1 transfer ratio.'),
        ('ba', 'amex', 'British Airways', 'Executive Club (Avios)', 'airline', '2:1', 0.5, 1.5, 'Oneworld', 'A', 'britishairways.com', 'https://www.britishairways.com/executive-club', '#075AAA', 'Executive Club Avios. Good for short/medium Oneworld flights. 2:1 ratio.'),
        ('qa', 'amex', 'Qatar Airways', 'Privilege Club', 'airline', '2:1', 0.5, 1.8, 'Oneworld', 'A', 'qatarairways.com', 'https://www.qatarairways.com/en/privilege-club.html', '#5C0632', 'Qatar Privilege Club Avios. World-class Qsuites redemption value. 2:1 ratio.'),
        ('ey', 'amex', 'Etihad Airways', 'Etihad Guest', 'airline', '2:1', 0.5, 1.3, 'Independent', 'A', 'etihad.com', 'https://www.etihad.com/en/etihad-guest', '#BD8B13', 'Etihad Guest transfer option. Scheduled to sunset on June 30, 2026. 2:1 ratio.'),
        ('cx', 'amex', 'Cathay Pacific', 'Asia Miles', 'airline', '2:1', 0.5, 1.4, 'Oneworld', 'A', 'cathaypacific.com', 'https://www.cathaypacific.com/cx/en_HK/asia-miles.html', '#006564', 'Cathay Pacific Asia Miles. Great for East Asia routes via Hong Kong. 2:1 ratio.'),
        ('va', 'amex', 'Virgin Atlantic', 'Flying Club', 'airline', '2:1', 0.5, 1.4, 'SkyTeam', 'A', 'virginatlantic.com', 'https://www.virginatlantic.com/in/en/flying-club', '#E40046', 'Flying Club miles. Extremely low points cost for select routes to UK/USA. 2:1 ratio.'),
        ('mar', 'amex', 'Marriott Hotels', 'Marriott Bonvoy', 'hotel', '1:1', 1.0, 0.8, 'N/A', 'Hotel', 'marriott.com', 'https://www.marriott.com/loyalty.mi', '#000000', 'Marriott Bonvoy. High-value hotel program. 1:1 ratio is excellent for luxury resorts.'),
        ('hil', 'amex', 'Hilton Hotels', 'Hilton Honors', 'hotel', '1:0.9', 0.9, 0.4, 'N/A', 'Hotel', 'hilton.com', 'https://www.hilton.com/en/hilton-honors/', '#00256C', 'Hilton Honors program. Transfer ratio is 1:0.9 (1000 MR = 900 Hilton Points).'),
 
        # ICICI
        ('ai', 'icici', 'Air India', 'Maharaja Club', 'airline', '1:1', 1.0, 1.0, 'Star Alliance', 'A', 'airindia.com', 'https://www.airindia.com/in/en/fly-maharaja-club.html', '#E31837', 'Direct 1:1 transfer to Air India Maharaja Club. 1 ICICI Point = 1 Maharaja Club point. High value for domestic & international non-stop routes.'),

        # SBI
        ('ba', 'sbi', 'British Airways', 'Executive Club (Avios)', 'airline', '1:1', 1.0, 1.5, 'Oneworld', 'A', 'britishairways.com', 'https://www.britishairways.com/executive-club', '#075AAA', 'Executive Club Avios for SBI Aurum. 1:1 transfer ratio.'),
        ('sq', 'sbi', 'Singapore Airlines', 'KrisFlyer', 'airline', '1:1', 1.0, 1.6, 'Star Alliance', 'A', 'singaporeair.com', 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', '#00256C', 'Singapore Airlines KrisFlyer for SBI Aurum. 1:1 transfer ratio.'),
        ('ey', 'sbi', 'Etihad Airways', 'Etihad Guest', 'airline', '1:1', 1.0, 1.3, 'Independent', 'A', 'etihad.com', 'https://www.etihad.com/en/etihad-guest', '#BD8B13', 'Etihad Guest for SBI Aurum. 1:1 transfer ratio.'),
        ('ai', 'sbi', 'Air India', 'Maharaja Club', 'airline', '1:1', 1.0, 1.0, 'Star Alliance', 'B', 'airindia.com', 'https://www.airindia.com/in/en/fly-maharaja-club.html', '#E31837', 'Air India Maharaja Club. 1:1 transfer ratio for Aurum and Air India Signature credit cards.'),
        ('ihg', 'sbi', 'IHG Hotels', 'IHG One Rewards', 'hotel', '1:1', 1.0, 0.5, 'N/A', 'Hotel', 'ihg.com', 'https://www.ihg.com/one-rewards', '#462E7C', 'IHG One Rewards for SBI Aurum. 1:1 transfer ratio.'),
        ('wy', 'sbi', 'Wyndham Hotels', 'Wyndham Rewards', 'hotel', '1:1', 1.0, 0.5, 'N/A', 'Hotel', 'wyndhamhotels.com', 'https://www.wyndhamrewards.com', '#0067B1', 'Wyndham Rewards for SBI Aurum. 1:1 transfer ratio.'),
        ('all', 'sbi', 'Accor Hotels', 'ALL – Accor Live Limitless', 'hotel', '2:1', 0.5, 1.8, 'N/A', 'Hotel', 'all.accor.com', 'https://all.accor.com', '#1B3C6F', 'ALL Accor Live Limitless for SBI Aurum. 2:1 transfer ratio (2 Aurum Points = 1 ALL Point).'),
        ('itc', 'sbi', 'ITC Hotels', 'Club ITC', 'hotel', '1:1', 1.0, 2.0, 'N/A', 'Hotel', 'itchotels.com', 'https://www.itchotels.com/in/en/club-itc', '#0E4D3B', 'Club ITC for SBI Aurum. 1:1 transfer ratio. Premium luxury hotels in India.')
    ]

    cursor.executemany("""
    INSERT INTO card_transfer_partners (
        partner_id, ecosystem_id, partner_name, program_name, partner_type, 
        transfer_ratio, rate_multiplier, value_per_mile, alliance, 
        partner_group, partner_domain, redemption_url, brand_color, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, partners_data)

    conn.commit()
    conn.close()
    print("Database migration completed and transfer partners seeded successfully.")

if __name__ == "__main__":
    run_migration()
