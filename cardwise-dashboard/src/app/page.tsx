'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return '';
      return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
      }, '');
    };

    const tk = localStorage.getItem('cw_token') || getCookie('cw_token');
    const email = localStorage.getItem('cw_email') || getCookie('cw_email');
    if (tk && email && !localStorage.getItem('cw_token')) {
      localStorage.setItem('cw_token', tk);
      localStorage.setItem('cw_email', email);
    }
    setToken(tk);
  }, []);

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column' },
    nav: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 48px', borderBottom: '1px solid #1a1a1a', background: '#000',
      position: 'sticky', top: 0, zIndex: 100,
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    logoBox: {
      width: 36, height: 36, background: '#FF2E93',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 900, color: '#000',
    },
    logoText: { fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 2 },
    navRight: { display: 'flex', gap: 12 },
    btnGhost: {
      background: 'transparent', border: '1px solid #222', color: '#888',
      padding: '8px 20px', fontSize: 12, fontWeight: 700, letterSpacing: 1,
    },
    btnPink: {
      background: '#FF2E93', border: 'none', color: '#000',
      padding: '8px 20px', fontSize: 12, fontWeight: 900, letterSpacing: 1,
    },
    hero: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', textAlign: 'center',
    },
    badge: {
      display: 'inline-block', background: '#1a0008', border: '1px solid #FF2E93',
      color: '#FF2E93', fontSize: 10, fontWeight: 900, letterSpacing: 3,
      padding: '5px 16px', marginBottom: 32,
    },
    h1: { fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: -2, maxWidth: 720 },
    pink: { color: '#FF2E93' },
    sub: { fontSize: 18, color: '#555', marginTop: 24, maxWidth: 520, lineHeight: 1.6 },
    ctaRow: { display: 'flex', gap: 16, marginTop: 48 },
    ctaBig: {
      background: '#FF2E93', color: '#000', border: 'none',
      padding: '16px 40px', fontSize: 14, fontWeight: 900, letterSpacing: 2,
    },
    ctaGhost: {
      background: 'transparent', color: '#fff', border: '1px solid #333',
      padding: '16px 40px', fontSize: 14, fontWeight: 700, letterSpacing: 1,
    },
    features: {
      display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1,
      background: '#1a1a1a', margin: '80px 48px 0', borderTop: '1px solid #1a1a1a',
    },
    feat: { background: '#080808', padding: '40px 32px' },
    featIcon: { fontSize: 28, marginBottom: 16 },
    featTitle: { fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: .5 },
    featDesc: { fontSize: 13, color: '#555', lineHeight: 1.6 },
    flowSection: { padding: '80px 48px', textAlign: 'center' },
    flowTitle: { fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 48 },
    flowGrid: { display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', alignItems: 'center' },
    flowStep: {
      background: '#0d0d0d', border: '1px solid #1a1a1a',
      padding: '20px 24px', minWidth: 140, textAlign: 'center',
    },
    flowNum: { fontSize: 24, fontWeight: 900, color: '#FF2E93', marginBottom: 8 },
    flowLabel: { fontSize: 11, color: '#888', fontWeight: 700, letterSpacing: 1 },
    flowArrow: { color: '#333', fontSize: 20, padding: '0 8px' },
    footer: {
      borderTop: '1px solid #111', padding: '32px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      color: '#333', fontSize: 12,
    },
  };

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.logoBox}>⚡</div>
          <span style={s.logoText}>CARDWISE</span>
        </div>
        <div style={s.navRight}>
          {token ? (
            <button style={s.btnPink} onClick={() => router.push('/dashboard')}>OPEN DASHBOARD</button>
          ) : (
            <>
              <button style={s.btnGhost} onClick={() => router.push('/login')}>SIGN IN</button>
              <button style={s.btnPink} onClick={() => router.push('/login?tab=register')}>GET STARTED FREE</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.badge}>⚡ AI-POWERED CARD INTELLIGENCE</div>
        <h1 style={s.h1}>
          Stop Leaving Money<br /><span style={s.pink}>On The Table</span>
        </h1>
        <p style={s.sub}>
          CARDWISE analyzes your credit cards and tells you exactly which card to swipe
          at checkout — maximizing cashback, rewards, and savings in real-time.
        </p>
        <div style={s.ctaRow}>
          <button style={s.ctaBig} onClick={() => router.push('/login?tab=register')}>
            START SAVING FREE →
          </button>
          <button style={s.ctaGhost} onClick={() => router.push('#how')}>
            SEE HOW IT WORKS
          </button>
        </div>
      </section>

      {/* Features */}
      <div style={s.features}>
        {[
          { icon: '🧠', title: '9-STEP AI ENGINE', desc: 'Analyzes MCC codes, surcharges, rewards, caps, and true yield to find the best card.' },
          { icon: '⚡', title: 'REAL-TIME CHECKOUT', desc: 'Chrome extension detects checkout pages and shows recommendations as you shop.' },
          { icon: '💳', title: 'FULL WALLET SYNC', desc: 'Add all your cards once. CardWise remembers your wallet across all devices.' },
          { icon: '📊', title: 'SAVINGS HISTORY', desc: 'Track how much you\'ve saved over time with detailed recommendation logs.' },
          { icon: '🔒', title: 'SECURE JWT AUTH', desc: 'Your data is protected with industry-standard JWT authentication.' },
          { icon: '🇮🇳', title: '20+ INDIAN SITES', desc: 'Works on Amazon, Flipkart, Swiggy, Zomato, IRCTC, Myntra, and more.' },
        ].map((f) => (
          <div key={f.title} style={s.feat}>
            <div style={s.featIcon}>{f.icon}</div>
            <div style={s.featTitle}>{f.title}</div>
            <div style={s.featDesc}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section style={s.flowSection} id="how">
        <h2 style={s.flowTitle}>THE 9-STEP RECOMMENDATION ENGINE</h2>
        <div style={s.flowGrid}>
          {[
            'JWT VERIFY', 'FETCH CARDS', 'MCC MAP', 'SURCHARGE',
            'REWARDS', 'CAP CHECK', 'TRUE YIELD', 'RANKING', 'AI REASON'
          ].map((step, i) => (
            <>
              <div key={step} style={s.flowStep}>
                <div style={s.flowNum}>{String(i + 1).padStart(2, '0')}</div>
                <div style={s.flowLabel}>{step}</div>
              </div>
              {i < 8 && <div style={s.flowArrow}>→</div>}
            </>
          ))}
        </div>
      </section>

      {/* Banner Preview */}
      <section style={{ padding: '0 48px 80px', textAlign: 'center' }}>
        <div style={{
          background: '#000', border: '2px solid #FF2E93',
          padding: '20px 32px', maxWidth: 600, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 40,
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#FF2E93', letterSpacing: 3, marginBottom: 8 }}>
              ⚡ CARDWISE · BEST CARD
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>SBI CASHBACK CARD</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#FF2E93', marginTop: 4 }}>SAVE ₹500</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>5% cashback on Ecommerce · Best for this checkout</div>
          </div>
          <div style={{ borderLeft: '1px solid #222', paddingLeft: 32 }}>
            <div style={{ fontSize: 9, color: '#444', fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>YOUR CARDS</div>
            {['SBI Cashback · ₹500', 'Amazon ICICI · ₹100', 'Axis Ace · ₹80'].map((c, i) => (
              <div key={c} style={{
                display: 'flex', gap: 8, marginBottom: 6, fontSize: 11,
                color: i === 0 ? '#FF2E93' : '#444', fontWeight: i === 0 ? 800 : 400,
              }}>
                <span>#{i + 1}</span><span>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#333', marginTop: 12, letterSpacing: 1 }}>
          LIVE BANNER INJECTED ON CHECKOUT PAGES
        </p>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ ...s.logoBox, width: 24, height: 24, fontSize: 12 }}>⚡</div>
          <span style={{ fontWeight: 700, color: '#333' }}>CARDWISE</span>
        </div>
        <span>© 2024 CARDWISE — Built for Hackathon</span>
      </footer>
    </div>
  );
}
