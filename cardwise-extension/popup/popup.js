// ═══════════════════════════════════════════════════════════
// CARDWISE — Popup Script
// Auth sync + live card recommendations from current tab
// ═══════════════════════════════════════════════════════════

const API = 'http://localhost:3000/api/v1';
let session = null;

// Card issuer gradients (matching content script)
function getCardGradient(issuer) {
  const i = (issuer || '').toLowerCase();
  if (i.includes('sbi'))    return 'linear-gradient(135deg, #FF2E93 0%, #6a1b29 100%)';
  if (i.includes('hdfc'))   return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
  if (i.includes('icici'))  return 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)';
  if (i.includes('axis'))   return 'linear-gradient(135deg, #512da8 0%, #800080 100%)';
  if (i.includes('kotak'))  return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
  if (i.includes('amex') || i.includes('american')) return 'linear-gradient(135deg, #111 0%, #444 100%)';
  return 'linear-gradient(135deg, #141e30 0%, #243b55 100%)';
}

document.addEventListener('DOMContentLoaded', async () => {
  bindUI();

  // Retrieve existing session
  const { cw_session } = await chrome.storage.local.get('cw_session');
  if (cw_session?.token) {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${cw_session.token}` }
      });
      if (res.ok) {
        session = cw_session;
        setLoggedIn(session);
        return;
      } else if (res.status === 401) {
        await chrome.storage.local.remove('cw_session');
      } else {
        session = cw_session;
        setLoggedIn(session);
        return;
      }
    } catch (e) {
      // Network failure — assume offline, keep session
      session = cw_session;
      setLoggedIn(session);
      return;
    }
  }
  setLoggedOut();
});

// Real-time sync when session changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.cw_session) {
    const newSession = changes.cw_session.newValue;
    if (newSession?.token) {
      session = newSession;
      setLoggedIn(session);
    } else {
      session = null;
      setLoggedOut();
    }
  }
});

// ── Live Suggestions: fetch from current tab ───────────────
async function loadSuggestionsForCurrentTab() {
  if (!session?.token) return;

  const suggestionsSection = document.getElementById('suggestions-section');
  const loadingEl = document.getElementById('suggestions-loading');
  const errorEl   = document.getElementById('suggestions-error');
  const resultEl  = document.getElementById('suggestions-result');
  const badgeEl   = document.getElementById('site-name-badge');

  suggestionsSection.classList.remove('hidden');
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  resultEl.classList.add('hidden');

  try {
    // Get active tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) throw new Error('no_tab');

    const url  = tab.url;
    const host = new URL(url).hostname.replace('www.', '');

    // Only show on supported shopping domains
    const shoppingDomains = [
      'amazon.in', 'flipkart.com', 'myntra.com', 'swiggy.com', 'zomato.com',
      'ajio.com', 'meesho.com', 'nykaa.com', 'irctc.co.in', 'makemytrip.com',
      'goibibo.com', 'bigbasket.com', 'blinkit.com', 'croma.com'
    ];
    const isShopSite = shoppingDomains.some(d => host.includes(d));

    if (!isShopSite) {
      // Not on a shopping site — hide the whole section
      suggestionsSection.classList.add('hidden');
      return;
    }

    // Show site badge
    if (badgeEl) badgeEl.textContent = host.split('.')[0].toUpperCase();

    // Query active tab's content script for extracted amount and title
    let amount = 999;
    let title = tab.title || 'Shopping page';
    try {
      const details = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: 'GET_EXTRACTED_DETAILS' }, res => {
          if (chrome.runtime.lastError || !res) {
            resolve(null);
          } else {
            resolve(res);
          }
        });
      });
      if (details) {
        if (details.amount && !isNaN(details.amount)) amount = details.amount;
        if (details.title) title = details.title;
      }
    } catch (e) {
      console.warn("Could not fetch details from content script:", e);
    }

    // Ask background to call EXTENSION_INTERCEPT with the exact amount & title
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'EXTENSION_INTERCEPT',
        payload: { url, title, amount }
      }, res => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(res);
        }
      });
    });

    loadingEl.classList.add('hidden');

    if (!result || result.error === 'NOT_LOGGED_IN') {
      errorEl.textContent = 'Please login to see recommendations.';
      errorEl.classList.remove('hidden');
      return;
    }

    if (result.error) {
      errorEl.textContent = result.error || 'Could not fetch recommendations. Make sure the CardWise server is running.';
      errorEl.classList.remove('hidden');
      return;
    }

    // Render the result
    renderPopupSuggestion(result, amount);
    resultEl.classList.remove('hidden');

  } catch (err) {
    loadingEl.classList.add('hidden');
    errorEl.textContent = 'Open a shopping site (Amazon, Flipkart, etc.) to see card recommendations here.';
    errorEl.classList.remove('hidden');
    console.warn('CardWise popup suggestion error:', err.message);
  }
}

function renderPopupSuggestion(data, amount) {
  const best = data.top_recommendation;
  if (!best) return;

  const displayAmount = amount || data.extracted_cart_total || 999;

  // Best card display
  const cardEl = document.getElementById('popup-best-card');
  if (cardEl) cardEl.style.background = getCardGradient(best.issuer);

  setText('popup-card-issuer',   best.issuer?.toUpperCase() || '');
  setText('popup-card-name',     best.nickname || best.card_name || '');
  setText('popup-card-official', best.card_name || '');
  setText('popup-card-saving',   `₹${(best.net_saving || 0).toLocaleString('en-IN')}`);
  setText('popup-cashback-badge',`${best.cashback_pct || 0}% CASHBACK`);
  setText('popup-balance',       best.available_balance != null ? `Bal: ₹${best.available_balance.toLocaleString('en-IN')}` : '');

  // Cart & savings row
  setText('popup-amount',  `₹${displayAmount.toLocaleString('en-IN')}`);
  setText('popup-saving',  `₹${(best.net_saving || 0).toLocaleString('en-IN')}`);

  // Strategy tip
  if (best.strategy_alert) {
    setText('popup-strategy-text', best.strategy_alert);
    document.getElementById('popup-strategy')?.classList.remove('hidden');
  } else {
    document.getElementById('popup-strategy')?.classList.add('hidden');
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── UI Bindings ────────────────────────────────────────────
function bindUI() {
  const btnOpenLogin = document.getElementById('btn-open-login');
  if (btnOpenLogin) {
    btnOpenLogin.onclick = () => {
      chrome.runtime.sendMessage({ type: "OPEN_LOGIN_PAGE" });
    };
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.onclick = doLogout;

  const btnPromoDashboard = document.getElementById('btn-promo-dashboard');
  if (btnPromoDashboard) {
    btnPromoDashboard.onclick = () => {
      chrome.tabs.create({ url: 'http://localhost:3001/dashboard' });
    };
  }

  const linkDashboard = document.getElementById('link-dashboard');
  if (linkDashboard) {
    linkDashboard.onclick = (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3001/dashboard' });
    };
  }

  const linkHistory = document.getElementById('link-history');
  if (linkHistory) {
    linkHistory.onclick = (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3001/dashboard/history' });
    };
  }

  const backLogin = document.getElementById('back-login');
  if (backLogin) backLogin.onclick = () => showScreen('screen-home');

  const backRegister = document.getElementById('back-register');
  if (backRegister) backRegister.onclick = () => setupAuthListeners();
}

const setupAuthListeners = () => {
  const createBtn = document.getElementById('createAccountBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3001/dashboard?auth=register' });
    });
  }

  const signinBtn = document.getElementById('signInBtn');
  if (signinBtn) {
    signinBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3001/dashboard?auth=login' });
    });
  }
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
}

async function doLogout() {
  session = null;
  await chrome.storage.local.remove('cw_session');
  setLoggedOut();
}

function setLoggedIn(s) {
  const stripOut    = document.getElementById('strip-out');
  const stripIn     = document.getElementById('strip-in');
  const userEmail   = document.getElementById('user-email');
  const avatarLetter = document.getElementById('avatar-letter');

  if (stripOut) stripOut.classList.add('hidden');
  if (stripIn)  stripIn.classList.remove('hidden');
  if (userEmail) userEmail.textContent = s.email;
  if (avatarLetter && s.email) {
    avatarLetter.textContent = s.email.charAt(0).toUpperCase();
  }

  // Load live suggestions for current tab
  loadSuggestionsForCurrentTab();
}

function setLoggedOut() {
  const stripIn  = document.getElementById('strip-in');
  const stripOut = document.getElementById('strip-out');
  const suggestionsSection = document.getElementById('suggestions-section');

  if (stripIn)  stripIn.classList.add('hidden');
  if (stripOut) stripOut.classList.remove('hidden');
  if (suggestionsSection) suggestionsSection.classList.add('hidden');
}
