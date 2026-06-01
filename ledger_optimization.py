import sqlite3
import json
from datetime import datetime

class LedgerOptimizationDB:
    def __init__(self, db_path="financial_extraction.db"):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ledger_updates (
                    update_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    update_execution TEXT NOT NULL,
                    transaction_id TEXT,
                    card_used_id TEXT,
                    calculated_rewards_earned REAL,
                    is_optimized INTEGER,
                    best_card_available_id TEXT,
                    potential_rewards_value REAL,
                    lost_value REAL,
                    insight_notification_string TEXT,
                    spend_added_to_fee_waiver REAL,
                    quota_deduction_triggered TEXT,
                    raw_payload TEXT
                )
            """)
            conn.commit()

    def save_ledger_update(self, result_json):
        ledger = result_json.get("ledger_entry") or {}
        gap = result_json.get("optimization_gap_analysis") or {}
        milestone = result_json.get("portfolio_milestone_updates") or {}
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO ledger_updates (
                    timestamp, update_execution, transaction_id, card_used_id,
                    calculated_rewards_earned, is_optimized, best_card_available_id,
                    potential_rewards_value, lost_value, insight_notification_string,
                    spend_added_to_fee_waiver, quota_deduction_triggered, raw_payload
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.utcnow().isoformat(),
                result_json.get("update_execution", "REJECT_INVALID_DATA"),
                ledger.get("transaction_id"),
                ledger.get("card_used_id"),
                ledger.get("calculated_rewards_earned"),
                1 if ledger.get("is_optimized") else 0 if ledger.get("is_optimized") is not None else None,
                gap.get("best_card_available_id"),
                gap.get("potential_rewards_value"),
                gap.get("lost_value"),
                gap.get("insight_notification_string"),
                milestone.get("spend_added_to_fee_waiver"),
                milestone.get("quota_deduction_triggered"),
                json.dumps(result_json)
            ))
            conn.commit()
            return cursor.lastrowid
