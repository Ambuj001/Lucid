import sqlite3
import json
from datetime import datetime

class MCCResolutionDB:
    def __init__(self, db_path="financial_extraction.db"):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mcc_resolutions (
                    resolution_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    domain_input TEXT NOT NULL,
                    resolution_status TEXT NOT NULL,
                    primary_domain TEXT,
                    legal_billing_name TEXT,
                    brand_name TEXT,
                    primary_mcc TEXT,
                    sbi_category TEXT,
                    hdfc_category TEXT,
                    is_payment_gateway_aggregator INTEGER,
                    is_government_or_regulated INTEGER,
                    estimated_surcharge_percentage REAL,
                    wallet_load_detected INTEGER,
                    raw_response TEXT
                )
            """)
            conn.commit()

    def save_resolution(self, domain_input, result_json):
        profile = result_json.get("merchant_profile") or {}
        mcc = result_json.get("mcc_mapping") or {}
        env = result_json.get("transaction_environment") or {}
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO mcc_resolutions (
                    timestamp, domain_input, resolution_status, primary_domain,
                    legal_billing_name, brand_name, primary_mcc, sbi_category,
                    hdfc_category, is_payment_gateway_aggregator, is_government_or_regulated,
                    estimated_surcharge_percentage, wallet_load_detected, raw_response
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.utcnow().isoformat(),
                domain_input,
                result_json.get("resolution_status", "UNKNOWN"),
                profile.get("primary_domain"),
                profile.get("legal_billing_name"),
                profile.get("brand_name"),
                mcc.get("primary_mcc"),
                mcc.get("sbi_category"),
                mcc.get("hdfc_category"),
                1 if env.get("is_payment_gateway_aggregator") else 0 if env.get("is_payment_gateway_aggregator") is not None else None,
                1 if env.get("is_government_or_regulated") else 0 if env.get("is_government_or_regulated") is not None else None,
                env.get("estimated_surcharge_percentage"),
                1 if env.get("wallet_load_detected") else 0 if env.get("wallet_load_detected") is not None else None,
                json.dumps(result_json)
            ))
            conn.commit()
            return cursor.lastrowid

    def get_cached_resolution(self, domain_input):
        clean_domain = self.extract_clean_domain(domain_input)
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT raw_response FROM mcc_resolutions 
                WHERE primary_domain = ? OR domain_input = ?
                ORDER BY timestamp DESC LIMIT 1
            """, (clean_domain, domain_input))
            row = cursor.fetchone()
            if row:
                return json.loads(row[0])
        return None

    @staticmethod
    def extract_clean_domain(url_or_domain):
        from urllib.parse import urlparse
        # Strip protocols and parameters
        if "://" not in url_or_domain:
            url_or_domain = "https://" + url_or_domain
        try:
            parsed = urlparse(url_or_domain)
            netloc = parsed.netloc.lower()
            if netloc.startswith("www."):
                netloc = netloc[4:]
            return netloc
        except Exception:
            return url_or_domain.lower().strip()

