# Cardwise Core Credit Card Optimization Engine

Cardwise is a high-performance credit and debit card reward yield optimization platform tailored for Indian financial instruments. This repository contains the core onboarding, data extraction, MCC resolution, ledger optimization, and backend API structures.

## 🚀 Key Capabilities

- **Onboarding Engine**: Compiles credit/debit card profiles, including fees, waiver thresholds, category-specific exclusions, and lounge access quotas.
- **T&C Change Monitor**: Parses unstructured PDF/Web documents using the Gemini API to detect devaluations, warning traps, and revised multipliers.
- **MCC Domain Resolution**: Matches domain inputs (e.g., `zomato.com` or government portals) to standard ISO 18245 Merchant Category Codes and calculates checkout surcharges.
- **Ledger Optimization & Recommendations**: Evaluates user wallets dynamically to recommend the optimal card to maximize yield at checkout.
- **Stark Design System Layouts**: Includes Tailwind configuration and responsive React components built with zero rounded borders for a minimalist aesthetic.

---

## 📁 Repository Structure

```
├── .github/workflows/
│   └── ci.yml                     # Continuous Integration workflow
├── components/
│   └── WalletDeckComponent.tsx     # Stark/Pink theme portfolio UI component
├── database.py                     # SQLite interface for extraction monitors
├── init_db.py                      # Local SQLite database initialization script
├── ledger_optimization.py          # Ledger tracking & reward analytics database
├── main.py                         # Offline pipeline CLI tester
├── mcc_resolution.py               # Domain-to-MCC mapper & caching module
├── pipeline.py                     # Gemini API document parsing pipeline
├── schema.sql                      # Production PostgreSQL database schema
├── server.js                       # Express.js REST API for yield recommendations
├── tailwind.config.js              # Theme and border purges
└── .gitignore                      # Git path exclusions
```

---

## 🛠️ Getting Started

### 1. Database Setup
To initialize the local SQLite database for development, run:
```bash
python3 init_db.py
```
For production PostgreSQL environments, execute the DDL queries inside `schema.sql` against your instance.

### 2. Run the Express Backend Server
Install dependencies and launch the API server:
```bash
npm install express pg
node server.js
```
The server will run on port `3000` (or `process.env.PORT`).

### 3. Run a Document Analysis CLI Test
Set your Gemini API key and run the pipeline driver:
```bash
export GEMINI_API_KEY="your-key-here"
python3 main.py
```

---

## 🧪 Continuous Integration
Every push or pull request to the `main` branch triggers the **Cardwise CI Pipeline** (`.github/workflows/ci.yml`), which automatically runs syntax checks and dependency checks for both the Node.js API and Python components.
