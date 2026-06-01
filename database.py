import sqlite3
import json
from datetime import datetime

class FinancialExtractionDB:
    def __init__(self, db_path="financial_extraction.db"):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Pipeline Runs / System Tracking Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS extraction_runs (
                    run_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    task_type TEXT NOT NULL,
                    raw_payload TEXT,
                    status TEXT NOT NULL,
                    error_message TEXT
                )
            """)

            # 2. Task Type A: Document Change Monitor Metadata
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS card_change_monitors (
                    monitor_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id INTEGER NOT NULL,
                    bank_name TEXT,
                    card_name TEXT,
                    has_material_changes INTEGER NOT NULL,
                    is_gimmicky INTEGER NOT NULL,
                    gimmick_severity TEXT,
                    gimmick_reasoning TEXT,
                    FOREIGN KEY (run_id) REFERENCES extraction_runs(run_id)
                )
            """)

            # 3. Task Type A: Modifications Detail Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS card_modifications (
                    modification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    monitor_id INTEGER NOT NULL,
                    scope TEXT NOT NULL,
                    mcc_code TEXT,
                    affected_category TEXT,
                    previous_rule_value TEXT,
                    new_rule_value TEXT,
                    effective_date TEXT,
                    FOREIGN KEY (monitor_id) REFERENCES card_change_monitors(monitor_id)
                )
            """)

            # 4. Task Type B: X (Twitter) Deals Table
            # Note: Unique index on card_bank, merchant_target, offer_nature for deduplication
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS live_deals (
                    deal_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id INTEGER NOT NULL,
                    card_bank TEXT NOT NULL,
                    card_variant TEXT,
                    network_type TEXT NOT NULL,
                    merchant_target TEXT NOT NULL,
                    offer_nature TEXT NOT NULL,
                    calculated_benefit_percentage REAL,
                    raw_deal_summary TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (run_id) REFERENCES extraction_runs(run_id)
                )
            """)
            
            cursor.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_deals_dedup 
                ON live_deals (card_bank, merchant_target, offer_nature)
            """)
            
            conn.commit()

    def log_run(self, task_type, raw_payload, status, error_message=None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO extraction_runs (timestamp, task_type, raw_payload, status, error_message)
                VALUES (?, ?, ?, ?, ?)
            """, (datetime.utcnow().isoformat(), task_type, raw_payload, status, error_message))
            conn.commit()
            return cursor.lastrowid

    def save_task_a_result(self, run_id, result_json):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Insert monitor metadata
                card_ident = result_json.get("card_identification") or {}
                gimmick_eval = result_json.get("gimmick_evaluation") or {}
                
                cursor.execute("""
                    INSERT INTO card_change_monitors (
                        run_id, bank_name, card_name, has_material_changes, 
                        is_gimmicky, gimmick_severity, gimmick_reasoning
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    run_id,
                    card_ident.get("bank_name"),
                    card_ident.get("card_name"),
                    1 if result_json.get("has_material_changes") else 0,
                    1 if gimmick_eval.get("is_gimmicky") else 0,
                    gimmick_eval.get("severity"),
                    gimmick_eval.get("reasoning")
                ))
                monitor_id = cursor.lastrowid

                # Insert modifications
                for mod in result_json.get("modifications", []):
                    cursor.execute("""
                        INSERT INTO card_modifications (
                            monitor_id, scope, mcc_code, affected_category, 
                            previous_rule_value, new_rule_value, effective_date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        monitor_id,
                        mod.get("scope"),
                        mod.get("mcc_code"),
                        mod.get("affected_category"),
                        mod.get("previous_rule_value"),
                        mod.get("new_rule_value"),
                        mod.get("effective_date")
                    ))
                
                conn.commit()
                return monitor_id
        except Exception as e:
            self.log_run_error(run_id, str(e))
            raise e

    def save_task_b_result(self, run_id, result_json):
        if not result_json.get("is_actionable_deal"):
            return None
        
        deal_info = result_json.get("extracted_deal")
        if not deal_info:
            return None

        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO live_deals (
                        run_id, card_bank, card_variant, network_type, 
                        merchant_target, offer_nature, calculated_benefit_percentage, 
                        raw_deal_summary, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    run_id,
                    deal_info.get("card_bank"),
                    deal_info.get("card_variant"),
                    deal_info.get("network_type"),
                    deal_info.get("merchant_target"),
                    deal_info.get("offer_nature"),
                    deal_info.get("calculated_benefit_percentage"),
                    deal_info.get("raw_deal_summary"),
                    datetime.utcnow().isoformat()
                ))
                conn.commit()
                return cursor.lastrowid
        except sqlite3.IntegrityError:
            # Handle deduplication discard silently as mandated
            conn.rollback()
            return None
        except Exception as e:
            self.log_run_error(run_id, str(e))
            raise e

    def log_run_error(self, run_id, error_message):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE extraction_runs 
                SET status = 'FAILED', error_message = ? 
                WHERE run_id = ?
            """, (error_message, run_id))
            conn.commit()
