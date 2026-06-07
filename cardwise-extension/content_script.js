// ═══════════════════════════════════════════════════════════
// CARDWISE — Content Script (Paperpillar Inspired Sidebar)
// Detects checkout page → extracts domain + price + product →
// calls background worker → renders closed Shadow DOM right side panel
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  const DOMAIN = location.hostname.replace('www.', '');
  let bannerInjected = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  // ── Checkout detection & price extraction ─────────────────
  function isCheckoutPage() {
    const host = location.hostname.toLowerCase();
    const url = location.href.toLowerCase();
    const path = location.pathname.toLowerCase();

    // ── Amazon product & cart pages only ──
    if (host.includes('amazon.in') || host.includes('amazon.com')) {
      return (
        path.includes('/dp/') ||
        path.includes('/gp/product/') ||
        path.includes('/gp/cart/') ||
        path.includes('/gp/buy/')
      );
    }

    // ── Flipkart product & cart pages only ──
    if (host.includes('flipkart.com')) {
      return (
        path.includes('/p/') ||
        url.includes('checkout') ||
        url.includes('/cart')
      );
    }

    // ── Myntra product pages ──
    if (host.includes('myntra.com')) {
      // Myntra product URLs: /buy/<name>/<id> or have numeric segment
      return (
        path.includes('/buy/') ||
        url.includes('checkout') ||
        url.includes('/cart') ||
        /\/\d{6,}/.test(path) // product ID in URL
      );
    }

    // ── Ajio product pages ──
    if (host.includes('ajio.com')) {
      return (
        path.includes('/p/') ||
        url.includes('checkout') ||
        url.includes('/bag')
      );
    }

    // ── Nykaa product pages ──
    if (host.includes('nykaa.com')) {
      return (
        path.includes('/p/') ||
        url.includes('checkout') ||
        url.includes('/cart')
      );
    }

    // ── Meesho product pages ──
    if (host.includes('meesho.com')) {
      return (
        url.includes('/product') ||
        url.includes('checkout') ||
        url.includes('/cart')
      );
    }

    // ── Croma product pages ──
    if (host.includes('croma.com')) {
      return (
        url.includes('/p/') ||
        url.includes('/product') ||
        url.includes('checkout') ||
        url.includes('/cart')
      );
    }

    // ── Food/Delivery — show on cart/checkout only, not listing ──
    if (host.includes('swiggy.com') || host.includes('zomato.com') ||
        host.includes('blinkit.com') || host.includes('bigbasket.com') ||
        host.includes('zepto.com')) {
      return (
        url.includes('checkout') ||
        url.includes('/cart') ||
        url.includes('/order')
      );
    }

    // ── Travel — show on booking/checkout pages only ──
    if (host.includes('irctc.co.in') || host.includes('makemytrip.com') ||
        host.includes('goibibo.com') || host.includes('cleartrip.com')) {
      return (
        url.includes('booking') ||
        url.includes('checkout') ||
        url.includes('payment') ||
        url.includes('/review')
      );
    }

    // ── Generic fallback: only if URL has strong product/cart signals ──
    const strongIndicators = [
      'checkout', '/cart', '/payment', '/order/confirm',
      '/dp/', '/gp/product/', '/p/', '/buy/'
    ];
    if (strongIndicators.some(i => url.includes(i))) {
      // Also verify a real price exists (not fallback 999)
      try {
        const price = extractPrice();
        if (price && price > 0 && price !== 999) return true;
      } catch (e) {}
    }

    return false;
  }

  function extractPrice() {
    const selectors = [
      // Amazon
      '.grand-total-price', '#subtotals-marketplace-table .a-color-price',
      '#orderSummary .a-color-price', '.a-price-whole',
      // Flipkart
      'div._2Tpdn3 ._30jeq3', '.CxhGGd ._2p6Di8 ._30jeq3',
      // Myntra/Ajio/Nykaa common
      '.pdp-price', '.pdp__price', '.pdpProductPrice',
      // Generic
      '[class*="grand-total"]', '[class*="order-total"]',
      '[class*="cart-total"]', '[class*="checkout-total"]',
      '[id*="grand-total"]', '[id*="order-total"]',
    ];

    // First pass: explicit selectors
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          const raw = el.textContent.replace(/[₹,\s]/g, '');
          const val = parseFloat(raw);
          if (!isNaN(val) && val > 0) return val;
        }
      } catch (e) {}
    }

    // Second pass: common meta tags and structured data
    try {
      // Meta itemprop or open graph price
      const metaPrice = document.querySelector('meta[itemprop="price"]') ||
                        document.querySelector('meta[property="product:price:amount"]') ||
                        document.querySelector('meta[property="og:price:amount"]') ||
                        document.querySelector('meta[name="twitter:data1"]');
      if (metaPrice && metaPrice.content) {
        const p = parseFloat(metaPrice.content.replace(/[₹,\s]/g, ''));
        if (!isNaN(p) && p > 0) return p;
      }

      // Schema.org JSON-LD
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => s.textContent).filter(Boolean);
      for (const txt of ld) {
        try {
          const json = JSON.parse(txt);
          // Support arrays and single objects
          const objs = Array.isArray(json) ? json : [json];
          for (const obj of objs) {
            const offers = obj && (obj.offers || obj['@graph']?.find?.(n => n.offers)?.offers);
            if (offers) {
              const price = parseFloat(offers.price || offers.priceCurrency || 0);
              if (!isNaN(price) && price > 0) return price;
            }
          }
        } catch (e) {}
      }
    } catch (e) {}

    // Fallback: find largest price-like text on page
    try {
      const priceCandidates = [...document.querySelectorAll('[class*="price"], [id*="price"], [class*="amount"]')]
        .map(el => el && el.textContent ? el.textContent.replace(/[₹,\s]/g, '') : '')
        .map(txt => parseFloat(txt))
        .filter(v => !isNaN(v) && v > 10 && v < 1000000);
      if (priceCandidates.length) return Math.max(...priceCandidates);
    } catch (e) {}

    return 999; // demo fallback
  }

  function extractProductTitle() {
    const selectors = [
      // Amazon
      '#productTitle', '.a-size-medium.sc-product-title', '.sc-grid-item-product-title', '.a-list-item a.a-link-normal span',
      // Flipkart
      '.B_NuCI', '._2-K1gG', '.IRpwTa', '._2Kn22P',
      // Myntra/Ajio/Nykaa
      '.pdp-title', '.pdp-name', '.pdpProductName',
      // Generic
      '[class*="product-name"]', '[class*="product-title"]',
      '[class*="item-title"]', '[class*="cart-item-name"]',
    ];

    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          const text = el.textContent.trim();
          if (text) return text;
        }
      } catch (e) {}
    }

    // Meta tags (og:title / twitter:title) and document title
    try {
      const og = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]');
      if (og && og.content) return og.content.trim();
      if (document.title) return document.title.trim();
      const titleEl = document.querySelector('title');
      if (titleEl && titleEl.textContent) return titleEl.textContent.trim();
    } catch (e) {}

    return "Cart items checkout"; // fallback
  }

  // ── Main flow ─────────────────────────────────────────────
  async function run() {
    if (bannerInjected) return;
    if (!isCheckoutPage()) {
      // Retry a few times for SPAs that load content after initial page load
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(run, 1500);
      }
      return;
    }

    let amount = extractPrice();
    if (isNaN(amount) || amount <= 0) {
      amount = 999;
    }
    const title = extractProductTitle() || "Shopping items";
    const url = location.href;
    bannerInjected = true;
    retryCount = 0;

    // Show loading panel first
    const panelHost = injectLoadingPanel();

    // Request recommendation from background
    let result;
    try {
      result = await new Promise((resolve, reject) => {
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
    } catch (err) {
      console.warn("CardWise: background message failed:", err.message);
      // Still show the panel — user is on a shopping site
      renderLoginPrompt(panelHost);
      return;
    }

    if (!result || result.error === 'NOT_LOGGED_IN') {
      renderLoginPrompt(panelHost);
    } else if (result.error) {
      renderError(panelHost, result.error);
    } else {
      renderRecommendation(panelHost, result, amount, title);
    }
  }

  // ── Inject Shadow DOM host ─────────────────────────────────
  function getShadow(host) {
    if (!host._cwShadow) {
      host._cwShadow = host.attachShadow({ mode: 'closed' });
    }
    return host._cwShadow;
  }

  function injectLoadingPanel() {
    let host = document.getElementById('cw-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'cw-host';
      document.body.appendChild(host);
    }

    const shadow = getShadow(host);
    shadow.innerHTML = BASE_STYLES + `
      <div class="cardwise-panel" id="cw-panel">
        <div class="panel-header">
          <div class="brand">
            <div class="brand-icon">⚡</div>
            <div>
              <div class="brand-text">CARDWISE</div>
              <div class="brand-sub">Smart Card Intelligence</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="status-dot"></div>
            <button class="minimize-btn" id="cw-minimize">✕</button>
          </div>
        </div>
        <div class="panel-body loading-state">
          <div class="spinner"></div>
          <div class="loading-text">Analyzing checkout cards...</div>
        </div>
      </div>
      <div class="cardwise-badge hidden" id="cw-badge">⚡</div>`;

    setupCollapseBehavior(host);
    return host;
  }

  // ── Render: Login Prompt ───────────────────────────────────
  function renderLoginPrompt(host) {
    const shadow = getShadow(host);
    shadow.innerHTML = BASE_STYLES + `
      <div class="cardwise-panel" id="cw-panel">
        <div class="panel-header">
          <div class="brand">
            <div class="brand-icon">⚡</div>
            <div>
              <div class="brand-text">CARDWISE</div>
              <div class="brand-sub">Smart Card Intelligence</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="status-dot"></div>
            <button class="minimize-btn" id="cw-minimize">✕</button>
          </div>
        </div>
        <div class="panel-body login-prompt">
          <div class="hero-icon">⚡</div>
          <h3>Login Required</h3>
          <p>Login to get your personalized credit card recommendations and cashbacks.</p>
          <button class="cta-btn" id="cw-login-btn">LOGIN NOW</button>
        </div>
      </div>
      <div class="cardwise-badge hidden" id="cw-badge">⚡</div>`;

    shadow.getElementById('cw-login-btn').onclick = () => chrome.runtime.sendMessage({ type: 'OPEN_LOGIN_PAGE' });
    setupCollapseBehavior(host);
  }

  // ── Render: Error ────────────────────────────────────
  function renderError(host, errMsg) {
    const shadow = getShadow(host);
    shadow.innerHTML = BASE_STYLES + `
      <div class="cardwise-panel" id="cw-panel">
        <div class="panel-header">
          <div class="brand">
            <div class="brand-icon">⚡</div>
            <div>
              <div class="brand-text">CARDWISE</div>
              <div class="brand-sub">Smart Card Intelligence</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="status-dot"></div>
            <button class="minimize-btn" id="cw-minimize">✕</button>
          </div>
        </div>
        <div class="panel-body error-state">
          <div class="error-icon">⚠️</div>
          <h3>Analysis Failed</h3>
          <p>${errMsg || "Something went wrong while evaluating cards."}</p>
        </div>
      </div>
      <div class="cardwise-badge hidden" id="cw-badge">⚡</div>`;

    setupCollapseBehavior(host);
  }

  function getCardGradient(issuer) {
    const issuerLower = (issuer || '').toLowerCase();
    if (issuerLower.includes('sbi')) {
      return 'linear-gradient(135deg, #FF2E93 0%, #6a1b29 100%)';
    } else if (issuerLower.includes('hdfc')) {
      return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    } else if (issuerLower.includes('icici')) {
      return 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)';
    } else if (issuerLower.includes('axis')) {
      return 'linear-gradient(135deg, #512da8 0%, #800080 100%)';
    } else if (issuerLower.includes('kotak')) {
      return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
    } else if (issuerLower.includes('american') || issuerLower.includes('amex')) {
      return 'linear-gradient(135deg, #111111 0%, #444444 100%)';
    }
    return 'linear-gradient(135deg, #141e30 0%, #243b55 100%)';
  }

  // ── Render: Full Recommendation Sidebar ────────────────────
  function renderRecommendation(host, data, amount, title) {
    const shadow = getShadow(host);

    const bestCard = data.top_recommendation;
    const remainingBalance = bestCard.available_balance - amount;
    const spent = bestCard.card_limit - bestCard.available_balance;
    const utilizationPct = bestCard.card_limit > 0 ? (spent / bestCard.card_limit) * 100 : 0;
    const postUtilizationPct = bestCard.card_limit > 0 ? ((spent + amount) / bestCard.card_limit) * 100 : 0;

    const prices = (data.price_history || []).map(p => p.price_inr);
    let linePath = '';
    let dots = '';
    let dateLabels = '';

    if (prices.length > 1) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;
      
      const points = data.price_history.map((item, idx) => {
        const x = idx * (300 / (prices.length - 1));
        const y = 45 - ((item.price_inr - minPrice) / priceRange * 35);
        return { x, y, price: item.price_inr, date: item.date };
      });

      linePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
      dots = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#FF2E93" stroke="#000" stroke-width="1.5" title="₹${p.price}"></circle>`).join('');
      dateLabels = `
        <span class="chart-date start">${data.price_history[0].date}</span>
        <span class="chart-date end">${data.price_history[data.price_history.length - 1].date}</span>
      `;
    }

    const alternativeCardsHTML = (data.alternative_cards_matrix || []).map(c => `
      <div class="alt-card-row" style="background: ${getCardGradient(c.issuer)}">
        <div class="shine"></div>
        <div class="alt-card-left">
          <div class="alt-card-name">${c.nickname || c.card_name}</div>
          <div class="alt-card-meta">${c.issuer} · ${(c.card_category || 'Platinum').toUpperCase()}</div>
          <div class="alt-card-multiplier">${c.multiplier_label}</div>
        </div>
        <div class="alt-card-right">
          <div class="alt-card-saving">Save ₹${c.net_saving}</div>
          <div class="alt-card-yield">+${c.net_yield_percentage.toFixed(1)}% yield</div>
        </div>
      </div>`).join('');

    shadow.innerHTML = BASE_STYLES + `
      <div class="cardwise-panel" id="cw-panel">
        <div class="panel-header">
          <div class="brand">
            <div class="brand-icon">⚡</div>
            <div>
              <div class="brand-text">CARDWISE</div>
              <div class="brand-sub">Smart Card Intelligence</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="status-dot"></div>
            <button class="minimize-btn" id="cw-minimize">✕</button>
          </div>
        </div>
        <div class="panel-body">
          
          <!-- E-Com Header Details -->
          <div class="checkout-header-glow">
            <div class="merchant-badge">SHOPPING AT ${location.hostname.replace('www.','').toUpperCase()}</div>
            <div class="price-savings-row">
              <div class="price-tile">
                <div class="hdr-lbl">CART TOTAL</div>
                <div class="hdr-val">₹${amount.toLocaleString('en-IN')}</div>
              </div>
              <div class="price-tile savings">
                <div class="hdr-lbl pink">EST. SAVINGS</div>
                <div class="hdr-val pink">₹${bestCard.net_saving.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <!-- Price Trend -->
          <div class="price-history-section shadow-box">
            <div class="section-header-row">
              <span class="section-title">PRICE HISTORY</span>
              <span class="evaluation-badge badge-${(data.price_evaluation_badge || 'GOOD_DEAL').toLowerCase()}">
                ${(data.price_evaluation_badge || 'GOOD DEAL').replace('_', ' ')}
              </span>
            </div>
            <div class="chart-container">
              ${prices.length > 1 ? `
                <svg class="price-chart" viewBox="0 0 300 50" width="100%" height="50">
                  <path d="${linePath}" fill="none" stroke="#FF2E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  ${dots}
                </svg>
                <div class="chart-labels-row">
                  ${dateLabels}
                </div>
              ` : `<div style="text-align:center; font-size:11px; color:#555; padding:5px 0;">No history available</div>`}
            </div>
          </div>

          <!-- Best Recommended Hero Card -->
          <div>
            <div class="section-title">BEST CARD TO SWIPE</div>
            <div class="fintech-card" style="background: ${getCardGradient(bestCard.issuer)}">
              <div class="shine"></div>
              <div class="card-header">
                <span class="card-issuer">${bestCard.issuer.toUpperCase()}</span>
                <span class="card-network-badge">${(bestCard.card_network || 'Visa').toUpperCase()}</span>
              </div>
              
              <div class="card-chip-row">
                <div class="card-chip"></div>
                <span class="card-category-label">${(bestCard.card_category || 'Platinum').toUpperCase()}</span>
              </div>

              <div class="card-mid">
                <h2 class="card-nickname">${bestCard.nickname || bestCard.card_name}</h2>
                <span class="card-official-name">${bestCard.card_name}</span>
              </div>

              <div class="card-footer">
                <div class="card-yield">${bestCard.cashback_pct}% CASHBACK</div>
                <div class="card-saving">SAVES ₹${bestCard.net_saving}</div>
              </div>
            </div>
          </div>

          <!-- Credit Utilization Tracker -->
          <div class="utilization-section shadow-box">
            <div class="section-title">CREDIT UTILIZATION</div>
            <div class="util-row">
              <span>Credit Limit:</span>
              <span class="util-val">₹${bestCard.card_limit.toLocaleString('en-IN')}</span>
            </div>
            <div class="util-row">
              <span>Available Balance:</span>
              <span class="util-val">₹${bestCard.available_balance.toLocaleString('en-IN')}</span>
            </div>
            <div class="util-row highlight">
              <span>Remaining Balance:</span>
              <span class="util-val remaining-val ${remainingBalance < 0 ? 'warning-text' : ''}">
                ₹${remainingBalance.toLocaleString('en-IN')}
              </span>
            </div>
            
            <!-- Limit Warning Alert -->
            ${remainingBalance < 0 ? `
              <div class="limit-warning">
                🚨 LIMIT ALERT: Purchase exceeds available credit limit of ₹${bestCard.available_balance.toLocaleString('en-IN')}!
              </div>
            ` : ''}

            <!-- Utilization Progress Bar -->
            <div class="util-progress-wrap">
              <div class="util-progress-bar" style="width: ${Math.min(utilizationPct, 100)}%"></div>
              ${remainingBalance >= 0 ? `
                <div class="util-progress-bar-purchase" style="left: ${Math.min(utilizationPct, 100)}%; width: ${Math.min(postUtilizationPct - utilizationPct, 100 - utilizationPct)}%"></div>
              ` : ''}
            </div>
            <div class="util-progress-labels">
              <span>Current Spent: ${utilizationPct.toFixed(0)}%</span>
              <span>After Swipe: ${Math.min(postUtilizationPct, 100).toFixed(0)}%</span>
            </div>
          </div>

          <!-- Strategy Alert -->
          ${bestCard.strategy_alert ? `
            <div class="strategy-alert-glow">
              <div style="font-size: 8px; font-weight:900; color:#FF2E93; letter-spacing:1px; margin-bottom:4px;">💡 SWIPE STRATEGY</div>
              ${bestCard.strategy_alert}
            </div>
          ` : ''}

          <!-- Alternative Recommendations -->
          ${alternativeCardsHTML ? `
            <div>
              <div class="section-title">ALTERNATIVE REWARDS</div>
              <div class="alternatives-list">
                ${alternativeCardsHTML}
              </div>
            </div>
          ` : ''}

        </div>
      </div>
      <div class="cardwise-badge hidden" id="cw-badge">⚡</div>`;

    setupCollapseBehavior(host);
  }

  // ── Setup minimize / collapse actions (Draggable C Badge) ──────────────────────
  function setupCollapseBehavior(host) {
    const shadow = getShadow(host);
    const panel = shadow.getElementById('cw-panel');
    const badge = shadow.getElementById('cw-badge');
    const minimizeBtn = shadow.getElementById('cw-minimize');

    if (minimizeBtn && panel && badge) {
      minimizeBtn.onclick = () => {
        panel.classList.add('collapsed');
        badge.classList.remove('hidden');
      };

      let isDragging = false;
      let startY = 0;
      let startTop = 0;
      let hasMoved = false;

      const onStart = (clientY) => {
        isDragging = true;
        startY = clientY;
        const rect = badge.getBoundingClientRect();
        startTop = rect.top;
        badge.style.transition = 'none';
        hasMoved = false;
      };

      const onMove = (clientY) => {
        if (!isDragging) return;
        const deltaY = clientY - startY;
        if (Math.abs(deltaY) > 5) {
          hasMoved = true;
        }
        let newTop = startTop + deltaY;
        const badgeHeight = badge.offsetHeight;
        const windowHeight = window.innerHeight;

        // Restrict within viewport boundaries
        if (newTop < 10) newTop = 10;
        if (newTop > windowHeight - badgeHeight - 10) newTop = windowHeight - badgeHeight - 10;

        badge.style.top = newTop + 'px';
        badge.style.transform = 'none'; // Override CSS translateY(-50%)
      };

      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        badge.style.transition = 'transform 0.2s ease, background 0.2s';
        if (!hasMoved) {
          // If it was a simple click, open the panel
          badge.classList.add('hidden');
          panel.classList.remove('collapsed');
        }
        hasMoved = false;
      };

      // Mouse events
      badge.onmousedown = (e) => {
        if (e.button !== 0) return; // Only left click
        onStart(e.clientY);
        e.preventDefault();
      };

      window.addEventListener('mousemove', (e) => {
        onMove(e.clientY);
      });

      window.addEventListener('mouseup', () => {
        onEnd();
      });

      // Touch events
      badge.ontouchstart = (e) => {
        onStart(e.touches[0].clientY);
      };

      window.addEventListener('touchmove', (e) => {
        onMove(e.touches[0].clientY);
      }, { passive: false });

      window.addEventListener('touchend', () => {
        onEnd();
      });
    }
  }

  // ── Shadow DOM Styles — Matches Popup Light Theme ─────────
  const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    .cardwise-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      bottom: 20px;
      width: 380px;
      background: #F8F9FA;
      border: 1px solid rgba(0,0,0,0.07);
      box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      color: #1A1D20;
      overflow: hidden;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @keyframes slideIn {
      from { transform: translateX(420px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .cardwise-panel.collapsed {
      transform: translateX(420px);
      opacity: 0;
      pointer-events: none;
    }
    
    /* ── Header — matches popup .header ── */
    .panel-header {
      padding: 14px 20px;
      background: #FFFFFF;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      width: 28px;
      height: 28px;
      background: #FF2E93;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #fff;
      font-weight: 900;
      flex-shrink: 0;
    }
    .brand-text {
      font-size: 11px;
      font-weight: 900;
      color: #1A1D20;
      letter-spacing: 1.5px;
    }
    .brand-sub {
      font-size: 8px;
      color: #868E96;
      letter-spacing: 0.3px;
      margin-top: 1px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FF2E93;
      box-shadow: 0 0 8px rgba(255,46,147,0.5);
      animation: pulseDot 2s infinite;
    }
    @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }
    
    .minimize-btn {
      background: none;
      border: none;
      color: #868E96;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
      padding: 4px 8px;
      transition: color 0.2s;
      border-radius: 6px;
    }
    .minimize-btn:hover { color: #FF2E93; }
    
    /* ── Panel body ── */
    .panel-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #F8F9FA;
    }

    /* ── Loading state ── */
    .loading-state {
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #868E96;
      flex: 1;
    }
    .spinner {
      width: 22px;
      height: 22px;
      border: 2px solid rgba(0,0,0,0.05);
      border-top-color: #FF2E93;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text {
      font-size: 12px;
      font-weight: 600;
      color: #868E96;
      letter-spacing: 0.3px;
    }
    
    /* ── Login Prompt ── */
    .login-prompt {
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 16px;
      padding: 30px 20px;
      flex: 1;
    }
    .hero-icon {
      width: 52px;
      height: 52px;
      background: #FF2E93;
      color: #fff;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 4px;
      box-shadow: 0 8px 20px rgba(255,46,147,0.3);
    }
    .login-prompt h3 {
      font-size: 16px;
      font-weight: 800;
      color: #1A1D20;
    }
    .login-prompt p {
      font-size: 12px;
      color: #868E96;
      line-height: 1.6;
    }
    .cta-btn {
      width: 100%;
      background: #FF2E93;
      color: #FFFFFF;
      border: none;
      padding: 13px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 1.5px;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      border-radius: 12px;
      margin-top: 8px;
      box-shadow: 0 8px 20px rgba(255,46,147,0.25);
    }
    .cta-btn:hover { background: #e0277f; transform: translateY(-1px); }
    
    /* ── Error state ── */
    .error-state {
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 12px;
      flex: 1;
      padding: 20px;
    }
    .error-icon { font-size: 36px; }
    .error-state h3 { font-size: 14px; font-weight: 800; color: #1A1D20; }
    .error-state p  { font-size: 11px; color: #868E96; }
    
    /* ── Scrollbar ── */
    .panel-body::-webkit-scrollbar { width: 4px; }
    .panel-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

    /* ── Checkout header — matches popup cart/savings tiles ── */
    .checkout-header-glow {
      background: #FFFFFF;
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 14px;
      padding: 14px 16px;
    }
    .merchant-badge {
      font-size: 8px;
      font-weight: 900;
      color: #868E96;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
    }
    .price-savings-row {
      display: flex;
      gap: 8px;
    }
    .price-tile {
      flex: 1;
      background: #F8F9FA;
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 10px;
      padding: 10px 12px;
    }
    .price-tile.savings {
      background: rgba(255,46,147,0.04);
      border-color: rgba(255,46,147,0.12);
    }
    .hdr-lbl {
      font-size: 8px;
      font-weight: 900;
      color: #868E96;
      letter-spacing: 1px;
      margin-bottom: 3px;
    }
    .hdr-lbl.pink { color: rgba(255,46,147,0.8); }
    .hdr-val {
      font-size: 18px;
      font-weight: 900;
      color: #1A1D20;
    }
    .hdr-val.pink { color: #FF2E93; }

    /* ── White card panels ── */
    .shadow-box {
      background: #FFFFFF;
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 14px;
      padding: 14px 16px;
    }

    .section-title {
      font-size: 9px;
      font-weight: 900;
      color: #868E96;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }

    /* ── Price Trend ── */
    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .evaluation-badge {
      font-size: 8px;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 1px;
    }
    .badge-historic_low { background: rgba(34,197,94,0.08); color: #16a34a; border: 1px solid rgba(34,197,94,0.2); }
    .badge-good_deal    { background: rgba(59,130,246,0.08); color: #2563eb; border: 1px solid rgba(59,130,246,0.2); }
    .chart-container { background: #F8F9FA; border-radius: 10px; padding: 10px; border: 1px solid rgba(0,0,0,0.04); }
    .chart-labels-row { display: flex; justify-content: space-between; margin-top: 6px; }
    .chart-date { font-size: 8px; color: #ADB5BD; }

    /* ── Credit Card (CRED style) ── */
    .fintech-card {
      border-radius: 16px;
      padding: 20px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      aspect-ratio: 1.586;
      position: relative;
      box-shadow: 0 12px 32px rgba(0,0,0,0.22);
      border: 1px solid rgba(255,255,255,0.1);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .fintech-card:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(0,0,0,0.28); }
    .shine {
      position: absolute; inset: 0;
      background: linear-gradient(105deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
      pointer-events: none;
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .card-issuer { font-size: 9px; font-weight: 900; letter-spacing: 1.5px; opacity: 0.65; }
    .card-network-badge { font-size: 11px; font-weight: 900; letter-spacing: 1px; }
    .card-chip-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    .card-chip { background: #d4af37; width: 32px; height: 22px; border-radius: 4px; opacity: 0.9; }
    .card-category-label { font-size: 8px; font-weight: 900; letter-spacing: 1.5px; opacity: 0.5; }
    .card-mid { margin-top: 10px; }
    .card-nickname { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
    .card-official-name { font-size: 9px; opacity: 0.5; margin-top: 2px; display: block; }
    .card-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; }
    .card-yield {
      font-size: 8px; font-weight: 900;
      background: rgba(255,255,255,0.15);
      padding: 3px 8px; border-radius: 4px; letter-spacing: 1px;
    }
    .card-saving {
      font-size: 13px; font-weight: 900;
      color: #FF2E93;
      text-shadow: 0 0 12px rgba(255,46,147,0.4);
    }

    /* ── Credit Utilization ── */
    .utilization-section { display: flex; flex-direction: column; gap: 8px; }
    .util-row {
      display: flex; justify-content: space-between;
      font-size: 11px; color: #868E96;
    }
    .util-row.highlight {
      color: #1A1D20; font-weight: 700;
      border-top: 1px solid rgba(0,0,0,0.05); padding-top: 6px;
    }
    .util-val { font-weight: 800; color: #1A1D20; }
    .remaining-val.warning-text { color: #ef4444 !important; }
    .limit-warning {
      background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
      color: #dc2626; padding: 8px 12px; border-radius: 10px;
      font-size: 10px; font-weight: 800; line-height: 1.4; text-align: center;
      animation: pulseWarn 2s infinite;
    }
    @keyframes pulseWarn { 0%,100%{opacity:1} 50%{opacity:0.65} }
    .util-progress-wrap {
      height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px;
      overflow: hidden; position: relative; margin-top: 4px;
    }
    .util-progress-bar {
      height: 100%; background: #DEE2E6; border-radius: 3px;
      position: absolute; left: 0; top: 0;
    }
    .util-progress-bar-purchase {
      height: 100%; background: #FF2E93;
      position: absolute; top: 0;
      box-shadow: 0 0 6px rgba(255,46,147,0.4);
    }
    .util-progress-labels {
      display: flex; justify-content: space-between;
      font-size: 8px; color: #ADB5BD; font-weight: 700;
    }

    /* ── Strategy Alert — matches popup hint-bar ── */
    .strategy-alert-glow {
      background: rgba(255,46,147,0.04);
      border: 1px solid rgba(255,46,147,0.1);
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 11px; line-height: 1.5; color: #868E96;
    }

    /* ── Alternative Cards ── */
    .alternatives-list { display: flex; flex-direction: column; gap: 8px; }
    .alt-card-row {
      border-radius: 12px; padding: 14px 16px;
      display: flex; justify-content: space-between; align-items: center;
      position: relative; overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .alt-card-row:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); }
    .alt-card-left { z-index: 1; }
    .alt-card-name { font-size: 12px; font-weight: 800; color: #fff; }
    .alt-card-meta { font-size: 9px; opacity: 0.55; margin-top: 1px; color: #fff; }
    .alt-card-multiplier { font-size: 9px; color: #FF2E93; font-weight: 700; margin-top: 4px; }
    .alt-card-right { text-align: right; z-index: 1; }
    .alt-card-saving { font-size: 13px; font-weight: 900; color: #FF2E93; text-shadow: 0 0 10px rgba(255,46,147,0.3); }
    .alt-card-yield { font-size: 9px; opacity: 0.55; margin-top: 2px; color: #fff; }

    /* ── Floating "C" badge ── */
    .cardwise-badge {
      position: fixed; top: 50%; right: 0;
      transform: translateY(-50%);
      width: 40px; height: 40px;
      background: #FF2E93; color: #fff;
      border-radius: 50% 0 0 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 900;
      cursor: pointer;
      box-shadow: -3px 4px 16px rgba(255,46,147,0.35);
      z-index: 2147483647;
      transition: transform 0.2s ease, background 0.2s;
    }
    .cardwise-badge:hover { transform: translateY(-50%) scale(1.1); background: #e0277f; }
    .hidden { display: none !important; }
  </style>`;

  // Listen for messages from popup to get current checkout details
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_EXTRACTED_DETAILS") {
      sendResponse({
        amount: extractPrice(),
        title: extractProductTitle()
      });
    }
  });

  // ── Watch for checkout page navigation (SPAs) ─────────────
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      bannerInjected = false;
      retryCount = 0;
      // Remove old panel if it exists
      const oldHost = document.getElementById('cw-host');
      if (oldHost) oldHost.remove();
      setTimeout(run, 1000);
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Initial run — faster start (1s instead of 2.5s)
  setTimeout(run, 1000);

})();
