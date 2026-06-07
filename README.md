# CardWise AI — Complete System

## 🚀 Quick Start (3 PowerShell windows)

---

### Window 1 — Backend API
```powershell
cd C:\Users\ujjaw\OneDrive\Desktop\extension\cardwise-api
docker-compose up -d
python -m pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
→ API at http://localhost:8000
→ Swagger docs at http://localhost:8000/docs

---

### Window 2 — Dashboard
```powershell
cd C:\Users\ujjaw\OneDrive\Desktop\extension\cardwise-dashboard
npm run dev
```
→ Dashboard at http://localhost:3000

---

### Window 3 — Extension
1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select folder: `C:\Users\ujjaw\OneDrive\Desktop\extension\cardwise-extension`

---

## 🧪 Test the Full Flow

1. Open http://localhost:3000 → Register → Add your cards
2. Go to https://www.amazon.in → search any product → click it
3. Add to cart → go to cart page
4. **CardWise AI banner appears at the bottom** with best card recommendation

---

## 📁 Project Structure
```
extension/
├── cardwise-api/           FastAPI Backend + PostgreSQL
│   ├── main.py
│   ├── models.py           users, cards, user_wallets, recommendation_logs
│   ├── routers/
│   │   ├── auth.py         JWT login/register
│   │   ├── cards.py        wallet CRUD
│   │   └── engine.py       9-Step Recommendation Engine
│   ├── seed.py             8 Indian credit cards
│   └── docker-compose.yml  PostgreSQL
│
├── cardwise-dashboard/     Next.js 14 Web App
│   └── src/app/
│       ├── page.tsx        Landing page
│       ├── login/          Auth page
│       └── dashboard/      Wallet + History
│
└── cardwise-extension/     Chrome MV3 Extension
    ├── manifest.json
    ├── background.js       JWT + API bridge
    ├── content_script.js   Checkout detection + Shadow DOM banner
    └── popup/              Login/Wallet popup
```

## 🎨 Design System
- Background: `#000000` / `#080808`
- Accent: `#FF2E93` (pink)
- Text: `#FFFFFF`
- Border-radius: `0px` (sharp edges)
