import sys
import os
import json
from pipeline import extract_financial_data
from database import FinancialExtractionDB

# Add simple mock data for offline testing
MOCK_PAYLOAD_A = """
<current_stored_schema_json>
{
  "bank_name": "HDFC Bank",
  "card_name": "Regalia Gold",
  "rewards": {
    "base_rate": "4 reward points per Rs 150",
    "exclusions": ["Fuel", "Wallet load"]
  }
}
</current_stored_schema_json>
<raw_new_scraped_text>
HDFC Bank Regalia Gold Terms update (Effective 2026-06-01):
1. Base rewards rate unchanged.
2. Fuel and Wallet loads continue to be excluded.
3. In addition, Rent Payments (MCC 6513) and Government Transactions (MCC 9399) will be excluded from reward points.
4. Utility spends capped at 2,000 points monthly.
</raw_new_scraped_text>
"""

MOCK_PAYLOAD_B = """
Tweet from @CardExpert:
🔥 BUG ALERT! HDFC Tata Neu Infinity Rupay card is currently giving 5% cashback on Zomato spends instead of the standard 1.5% base rate! Working for all users via Tata Neu app checkout. Go grab it!
"""

def print_db_summary(db_path="financial_extraction.db"):
    db = FinancialExtractionDB(db_path=db_path)
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        print("\n--- EXTRACTION RUNS ---")
        cursor.execute("SELECT run_id, timestamp, task_type, status, error_message FROM extraction_runs")
        for row in cursor.fetchall():
            print(f"Run #{row[0]} | Time: {row[1]} | Task: {row[2]} | Status: {row[3]} | Error: {row[4]}")
            
        print("\n--- CARD CHANGE MONITORS (TYPE A) ---")
        cursor.execute("SELECT monitor_id, bank_name, card_name, has_material_changes, gimmick_severity FROM card_change_monitors")
        for row in cursor.fetchall():
            print(f"Monitor #{row[0]} | Bank: {row[1]} | Card: {row[2]} | Changes: {row[3]} | Severity: {row[4]}")
            
        print("\n--- ACTIVE DEALS (TYPE B) ---")
        cursor.execute("SELECT deal_id, card_bank, card_variant, merchant_target, offer_nature, calculated_benefit_percentage, raw_deal_summary FROM live_deals")
        for row in cursor.fetchall():
            print(f"Deal #{row[0]} | Bank: {row[1]} | Variant: {row[2]} | Merchant: {row[3]} | Nature: {row[4]} | Benefit: {row[5]}% | Summary: {row[6]}")

def main():
    db_path = "financial_extraction.db"
    
    if len(sys.argv) > 1 and sys.argv[1] == "--status":
        print_db_summary(db_path)
        return
        
    print("Financial Data Extraction Engine Local Driver")
    print("---------------------------------------------")
    
    # Check for API Key
    if not os.environ.get("GEMINI_API_KEY") and not os.environ.get("PRODUCTION_ENV_KEY"):
        print("WARNING: GEMINI_API_KEY environment variable is not set. Real API calls will fail.")
        print("To run with real API calls, run: export GEMINI_API_KEY='your-key'")
        print("Displaying DB initialization status:")
        print_db_summary(db_path)
        return

    # Run Type A extraction
    print("\nRunning extraction for Task Type A (T&C Monitor)...")
    try:
        res = extract_financial_data(MOCK_PAYLOAD_A, task_type="TYPE_A", db_path=db_path)
        print("Extraction Succeeded. Output:")
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(f"Task Type A Failed: {e}")

    # Run Type B extraction
    print("\nRunning extraction for Task Type B (Deal Tracker)...")
    try:
        res = extract_financial_data(MOCK_PAYLOAD_B, task_type="TYPE_B", db_path=db_path)
        print("Extraction Succeeded. Output:")
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(f"Task Type B Failed: {e}")

    # Display status
    print_db_summary(db_path)

if __name__ == "__main__":
    main()
