// ═══════════════════════════════════════════════════════════
// CARDWISE — Dashboard Sync Script
// Runs on http://localhost:3000 to sync session to/from extension
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  function syncToExtension() {
    const token = localStorage.getItem('cw_token');
    const email = localStorage.getItem('cw_email');

    chrome.runtime.sendMessage({
      type: 'SYNC_SESSION',
      payload: { token, email }
    }).catch(() => {}); // catch extension API errors if extension reloaded
  }

  // Run on initial load
  syncToExtension();

  // Watch for changes to localStorage from dashboard page
  window.addEventListener('storage', (e) => {
    if (e.key === 'cw_token' || e.key === 'cw_email') {
      syncToExtension();
    }
  });

  // Periodically check in case Next.js routing changes localStorage directly
  let lastToken = localStorage.getItem('cw_token');
  setInterval(() => {
    const currentToken = localStorage.getItem('cw_token');
    if (currentToken !== lastToken) {
      lastToken = currentToken;
      syncToExtension();
    }
  }, 1000);

  // Listen to messages from extension background script (for sync back to dashboard)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SESSION_CHANGED") {
      const newSession = message.payload;
      if (newSession?.token && newSession?.email) {
        localStorage.setItem('cw_token', newSession.token);
        localStorage.setItem('cw_email', newSession.email);
      } else {
        localStorage.removeItem('cw_token');
        localStorage.removeItem('cw_email');
      }
      sendResponse({ ok: true });
    }
  });

})();
