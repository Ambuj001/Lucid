import os
import json
from google import genai
from google.genai import types
from database import FinancialExtractionDB

SYSTEM_PROMPT = """ROLE AND CONTEXT:
You are a highly specialized production data extraction engine for Indian financial instruments. Your single responsibility is to analyze unstructured texts (web page snapshots, PDF text dumps, and X social media posts) and transform them into precise, production-ready JSON data models. You must strip away marketing fluff, interpret footnotes, translate points-to-cash valuations mathematically, and flag structured gimmicks.

STRICT OPERATIONAL DIRECTIVES:
1. NO PLACEHOLDERS: Do not emit example domains, mock numbers, or generalized names. If a value is missing or unclear from the source, return null for that field.
2. ABSOLUTE ISOLATION: Output ONLY valid, parsable JSON. Do not write introductory prose ("Here is the parsed data:"), conversational wrap-ups, or markdown fences outside the main JSON payload unless executing inside a programmatic string stream.
3. ENTITY MATURITY: You must translate complex reward terminology into concrete decimal values. For example, "5 reward points for every Rs. 150 spent where 1 point = Re. 1" must be calculated as a 3.33% net cash-equivalent reward percentage (5 / 150 * 1).

-----------------------------------------------------------------------
TASK TYPE A: BANK T&C WEB / PDF CHANGE MONITOR
Input provided will contain: <current_stored_schema_json> and <raw_new_scraped_text>.

You must cross-reference the texts to identify changes. Output format must precisely mirror this production JSON structure:

{
  "has_material_changes": true,
  "card_identification": {
    "bank_name": "string",
    "card_name": "string"
  },
  "modifications": [
    {
      "scope": "REWARD_RATE" | "EXCLUSION" | "CAP" | "PERK",
      "mcc_code": "string_or_null",
      "affected_category": "string",
      "previous_rule_value": "string",
      "new_rule_value": "string",
      "effective_date": "YYYY-MM-DD_or_null"
    }
  ],
  "gimmick_evaluation": {
    "is_gimmicky": true,
    "severity": "HIGH" | "LOW" | "NONE",
    "reasoning": "Plain text analysis explaining the restriction (e.g., 'Advertised 10% cashback is hard-capped at Rs. 150 monthly, rendering the accelerator worthless after Rs. 1,500 of platform spend.')"
  }
}

-----------------------------------------------------------------------
TASK TYPE B: X (TWITTER) LIVE BUG & FLASH DEAL TRACKER
Input provided will contain a raw tweet dump from specific financial profiles.

Your goal is to parse the raw text to verify if a valid transaction glitch, pricing bug, or live flash reward offer is present. Analyze the content dynamically to isolate the exact card entity and target merchant.

Output structure:
{
  "is_actionable_deal": true,
  "confidence_score": 0.00, 
  "extracted_deal": {
    "card_bank": "string",
    "card_variant": "string",
    "network_type": "VISA" | "MASTERCARD" | "RUPAY" | "AMEX" | "ANY",
    "merchant_target": "string",
    "offer_nature": "BUG_GLITCH" | "FLASH_DISCOUNT" | "MILESTONE_PROMO",
    "calculated_benefit_percentage": 0.00,
    "raw_deal_summary": "Concise headline explaining the exact transaction mechanism to exploit."
  }
}

DEDUPLICATION MANDATE FOR TYPE B:
Extract the data points with structural parity. If the core tuple matches an active system profile (same card_bank, same merchant_target, same offer_nature), the orchestration tier will discard it to prevent spamming notifications.
"""

def extract_financial_data(raw_payload, task_type="TYPE_A", db_path="financial_extraction.db"):
    db = FinancialExtractionDB(db_path=db_path)
    run_id = db.log_run(task_type, raw_payload, "STARTED")

    try:
        # Check for Gemini API key. Use standard environment variable GEMINI_API_KEY.
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            # Fallback to check if user has set it under a different name
            api_key = os.environ.get("PRODUCTION_ENV_KEY")
            
        if not api_key:
            raise ValueError("API Key is missing. Please set GEMINI_API_KEY or PRODUCTION_ENV_KEY environment variable.")

        # Initialize the Google GenAI client
        client = genai.Client(api_key=api_key)
        
        # Build prompt content
        user_prompt = f"Execute parsing for {task_type}. Data: {raw_payload}"
        
        # Request completion
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json"
            )
        )
        
        raw_text = response.text.strip()
        parsed_json = json.loads(raw_text)
        
        # Save results in the database
        if task_type == "TYPE_A":
            db.save_task_a_result(run_id, parsed_json)
        elif task_type == "TYPE_B":
            db.save_task_b_result(run_id, parsed_json)
        else:
            raise ValueError(f"Unknown task type: {task_type}")

        # Update run status to COMPLETED
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE extraction_runs SET status = 'COMPLETED' WHERE run_id = ?", (run_id,))
            conn.commit()

        return parsed_json

    except Exception as e:
        db.log_run_error(run_id, str(e))
        raise e
