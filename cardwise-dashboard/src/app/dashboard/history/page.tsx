'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:8000/api/v1';
interface Log { id: number; domain: string; mcc: string; best_card_name: string; transaction_amount: number; net_saving: number; reason: string; created_at: string; }

function Navbar({ email, onLogout }: { email: string; onLogout: () => void }) {
  const router = useRouter();
  const s: Record<string, React.CSSProperties> = {
    nav: { background: '#000', borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100 },
    left: { display: 'flex', alignItems: 'center', gap: 32 },
    logoBox: { width: 32, height: 32, background: '#FF2E93', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#000' },
    logoText: { fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: 2 },
    navLink: { fontSize: 11, fontWeight: 700, color: '#444', letterSpacing: 1.5, cursor: 'pointer', background: 'none', border: 'none' },
    right: { display: 'flex', alignItems: 'center', gap: 16 },
    email: { fontSize: 11, color: '#444' },
    logout: { background: 'none', border: '1px solid #222', color: '#555', padding: '6px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' },
  };
  return (
    <nav style={s.nav}>
      <div style={s.left}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={s.logoBox}>⚡</div>
          <span style={s.logoText}>CARDWISE</span>
        </div>
        <button style={s.navLink} onClick={() => router.push('/dashboard')}
          onMouseEnter={e=>(e.currentTarget.style.color='#FF2E93')} onMouseLeave={e=>(e.currentTarget.style.color='#444')}>WALLET</button>
        <button style={{ ...s.navLink, color: '#FF2E93' }} onClick={() => router.push('/dashboard/history')}>HISTORY</button>
      </div>
      <div style={s.right}>
        <span style={s.email}>{email}</span>
        <button style={s.logout} onClick={onLogout}>SIGN OUT</button>
      </div>
    </nav>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [logs, setLogs]   = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem('cw_token');
  const logout = () => { localStorage.removeItem('cw_token'); localStorage.removeItem('cw_email'); router.push('/login'); };

  const load = useCallback(async () => {
    const tk = token();
    if (!tk) { router.replace('/login'); return; }
    setEmail(localStorage.getItem('cw_email') || '');
    try {
      const res = await fetch(`${API}/logs`, { headers: { Authorization: `Bearer ${tk}` } });
      if (res.ok) setLogs(await res.json());
    } catch(e) {}
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const totalSaved  = logs.reduce((s, l) => s + (l.net_saving || 0), 0);
  const bestSaving  = logs.length ? Math.max(...logs.map(l => l.net_saving || 0)) : 0;
  const uniqueSites = new Set(logs.map(l => l.domain)).size;

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#080808' },
    main: { maxWidth: 1100, margin: '0 auto', padding: '32px' },
    title: { fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -.5, marginBottom: 4 },
    sub:   { fontSize: 13, color: '#444', marginBottom: 32 },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: '#1a1a1a', marginBottom: 32 },
    stat:  { background: '#080808', padding: '24px 28px' },
    statL: { fontSize: 10, fontWeight: 900, color: '#444', letterSpacing: 2, marginBottom: 8 },
    statV: { fontSize: 28, fontWeight: 900, color: '#FF2E93' },
    thead: { fontSize: 10, fontWeight: 900, color: '#444', letterSpacing: 2 },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th:    { padding: '10px 16px', textAlign: 'left' as const, fontSize: 10, fontWeight: 900, color: '#444', letterSpacing: 2, borderBottom: '1px solid #1a1a1a' },
    td:    { padding: '14px 16px', borderBottom: '1px solid #111', fontSize: 12 },
    empty: { textAlign: 'center' as const, padding: 80, color: '#333' },
  };

  function fmtDate(d: string) {
    return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={s.page}>
      <Navbar email={email} onLogout={logout} />
      <main style={s.main}>
        <div style={s.title}>RECOMMENDATION HISTORY</div>
        <div style={s.sub}>Every time the AI recommended a card at checkout — logged automatically.</div>

        <div style={s.stats}>
          <div style={s.stat}><div style={s.statL}>TOTAL SAVED</div><div style={s.statV}>₹{totalSaved.toFixed(0)}</div></div>
          <div style={s.stat}><div style={s.statL}>BEST SINGLE SAVE</div><div style={s.statV}>₹{bestSaving.toFixed(0)}</div></div>
          <div style={s.stat}><div style={s.statL}>SITES ANALYZED</div><div style={s.statV}>{uniqueSites}</div></div>
        </div>

        {loading ? (
          <div style={s.empty}>Loading history...</div>
        ) : logs.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
            <div style={{ color: '#444', fontSize: 13 }}>No recommendations yet.</div>
            <div style={{ color: '#333', fontSize: 12, marginTop: 8 }}>Shop on Amazon, Flipkart, or Swiggy with the extension active.</div>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['SITE','CATEGORY','BEST CARD','AMOUNT','SAVED','REASON','DATE'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ background: '#080808' }}
                  onMouseEnter={e => (e.currentTarget.style.background='#0d0d0d')}
                  onMouseLeave={e => (e.currentTarget.style.background='#080808')}>
                  <td style={s.td}><span style={{ color: '#fff', fontWeight: 600 }}>{log.domain}</span></td>
                  <td style={s.td}><span style={{ fontSize: 10, color: '#555', background: '#111', padding: '3px 8px', border: '1px solid #1a1a1a', letterSpacing: 1 }}>{log.mcc || '—'}</span></td>
                  <td style={s.td}><span style={{ color: '#FF2E93', fontWeight: 700 }}>{log.best_card_name || '—'}</span></td>
                  <td style={s.td}><span style={{ color: '#888' }}>₹{(log.transaction_amount || 0).toLocaleString('en-IN')}</span></td>
                  <td style={s.td}><span style={{ color: (log.net_saving || 0) > 0 ? '#22c55e' : '#444', fontWeight: 700 }}>₹{(log.net_saving || 0).toFixed(0)}</span></td>
                  <td style={{ ...s.td, maxWidth: 220 }}><span style={{ color: '#555', fontSize: 11 }}>{log.reason || '—'}</span></td>
                  <td style={s.td}><span style={{ color: '#333', fontSize: 11 }}>{fmtDate(log.created_at)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
