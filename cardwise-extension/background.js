// ═══════════════════════════════════════════════════════════
// CARDWISE — Background Service Worker
// Handles JWT storage + calls /engine/evaluate API
// ═══════════════════════════════════════════════════════════

const API_BASE = "http://localhost:3000/api/v1";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EVALUATE_CHECKOUT") {
    handleEvaluate(message.payload).then(sendResponse).catch(err => {
      sendResponse({ error: err.message });
    });
    return true; // keep channel open for async
  }

  if (message.type === "EXTENSION_INTERCEPT") {
    handleExtensionIntercept(message.payload).then(sendResponse).catch(err => {
      sendResponse({ error: err.message });
    });
    return true;
  }

  if (message.type === "GET_SESSION") {
    chrome.storage.local.get("cw_session", result => {
      sendResponse({ session: result.cw_session || null });
    });
    return true;
  }

  if (message.type === "CLEAR_SESSION") {
    chrome.storage.local.remove("cw_session");
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "SYNC_SESSION") {
    const { token, email } = message.payload;
    if (token && email) {
      chrome.storage.local.set({ cw_session: { token, email } }, () => {
        sendResponse({ ok: true });
      });
    } else {
      chrome.storage.local.remove("cw_session", () => {
        sendResponse({ ok: true });
      });
    }
    return true;
  }

  if (message.type === "OPEN_POPUP") {
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup().catch(() => {
        chrome.tabs.create({ url: "http://localhost:3001/dashboard?auth=login" });
      });
    } else {
      chrome.tabs.create({ url: "http://localhost:3001/dashboard?auth=login" });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "OPEN_LOGIN_PAGE") {
    chrome.tabs.create({ url: "http://localhost:3001/dashboard?auth=login" });
    sendResponse({ ok: true });
    return true;
  }
});

// Listen to storage changes and sync back to dashboard tabs and cookies
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.cw_session) {
    const newSession = changes.cw_session.newValue;
    
    // Sync to cookies
    syncToCookies(newSession);

    // Broadcast to dashboard tabs matching http://localhost:3000/*
    chrome.tabs.query({ url: "*://localhost/*" }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: "SESSION_CHANGED",
          payload: newSession || null
        }).catch(() => {}); // Ignore tab communication errors
      });
    });
  }
});

async function handleEvaluate(payload) {
  const { cw_session } = await chrome.storage.local.get("cw_session");
  if (!cw_session?.token) {
    return { error: "NOT_LOGGED_IN" };
  }

  const res = await fetch(`${API_BASE}/engine/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cw_session.token}`,
    },
    body: JSON.stringify({
      checkout_domain: payload.domain,
      declared_transaction_value_inr: payload.amount,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) return { error: "NOT_LOGGED_IN" };
    return { error: err.detail || "API error" };
  }

  return await res.json();
}

async function handleExtensionIntercept(payload) {
  const { cw_session } = await chrome.storage.local.get("cw_session");
  if (!cw_session?.token) {
    return { error: "NOT_LOGGED_IN" };
  }

  const res = await fetch(`${API_BASE}/engine/extension-intercept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cw_session.token}`,
    },
    body: JSON.stringify({
      user_id: cw_session.email,
      current_url: payload.url,
      extracted_product_title: payload.title,
      extracted_cart_total: payload.amount
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) return { error: "NOT_LOGGED_IN" };
    return { error: err.detail || "API error" };
  }

  return await res.json();
}

// Sync from cookies to storage
function syncFromCookies() {
  if (!chrome.cookies) return;
  chrome.cookies.get({ url: 'http://localhost:3001', name: 'cw_token' }, (tokenCookie) => {
    chrome.cookies.get({ url: 'http://localhost:3001', name: 'cw_email' }, (emailCookie) => {
      const token = tokenCookie ? tokenCookie.value : null;
      const email = emailCookie ? decodeURIComponent(emailCookie.value) : null;
      
      chrome.storage.local.get("cw_session", (result) => {
        const currentSession = result.cw_session;
        if (token && email) {
          if (currentSession?.token !== token || currentSession?.email !== email) {
            chrome.storage.local.set({ cw_session: { token, email } });
          }
        } else {
          if (currentSession) {
            chrome.storage.local.remove("cw_session");
          }
        }
      });
    });
  });
}

// Sync from storage to cookies
function syncToCookies(session) {
  if (!chrome.cookies) return;
  if (session?.token && session?.email) {
    chrome.cookies.set({
      url: 'http://localhost:3001',
      name: 'cw_token',
      value: session.token,
      path: '/'
    });
    chrome.cookies.set({
      url: 'http://localhost:3001',
      name: 'cw_email',
      value: encodeURIComponent(session.email),
      path: '/'
    });
  } else {
    chrome.cookies.remove({ url: 'http://localhost:3001', name: 'cw_token' });
    chrome.cookies.remove({ url: 'http://localhost:3001', name: 'cw_email' });
  }
}

// Listen for cookie changes
if (chrome.cookies) {
  chrome.cookies.onChanged.addListener((changeInfo) => {
    const cookie = changeInfo.cookie;
    if (cookie.domain === 'localhost' || cookie.domain === '127.0.0.1') {
      if (cookie.name === 'cw_token' || cookie.name === 'cw_email') {
        syncFromCookies();
      }
    }
  });

  // Run sync on startup/install
  chrome.runtime.onStartup.addListener(syncFromCookies);
  chrome.runtime.onInstalled.addListener(syncFromCookies);
}
