'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = 'http://localhost:8000/api/v1';

const FIREBASE_API_KEY = "AIzaSyDN3dvnybGVVmnc0lgyCxdwenA7hNX0scg";

function isFirebaseEnabled() {
  return typeof FIREBASE_API_KEY === 'string' && FIREBASE_API_KEY.trim() !== '';
}

const GOOGLE_CLIENT_ID = "50876595542-06vq0vrp5hktvu6cii3g1ugfa0ijv1c4.apps.googleusercontent.com" as string; // REPLACE WITH GOOGLE CLIENT ID FROM FIREBASE CONSOLE

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(
    params.get('tab') === 'register' ? 'register' : 'login'
  );
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return '';
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  };

  const setCookie = (name: string, value: string, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };

  useEffect(() => {
    const tk = localStorage.getItem('cw_token') || getCookie('cw_token');
    const emailStr = localStorage.getItem('cw_email') || getCookie('cw_email');
    if (tk && emailStr) {
      localStorage.setItem('cw_token', tk);
      localStorage.setItem('cw_email', emailStr);
      router.replace('/dashboard');
    }
  }, [router]);

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "dark", size: "large", width: 356 }
        );
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, [tab]);

  async function handleGoogleSignIn(response: any) {
    setError(''); setLoading(true);
    try {
      const credential = response.credential;
      if (!isFirebaseEnabled()) {
        throw new Error("Firebase API key is not configured.");
      }

      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postBody: `id_token=${credential}&providerId=google.com`,
          requestUri: "http://localhost",
          returnIdpCredential: true,
          returnSecureToken: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Google Login failed');

      localStorage.setItem('cw_token', data.idToken);
      localStorage.setItem('cw_email', data.email);
      setCookie('cw_token', data.idToken);
      setCookie('cw_email', data.email);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Google Sign-In failed');
    } finally { setLoading(false); }
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let token = "";
      if (isFirebaseEnabled()) {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass, returnSecureToken: true })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Firebase Login failed');
        token = data.idToken;
      } else {
        const form = new URLSearchParams({ username: email, password: pass });
        const res  = await fetch(`${API}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        token = data.access_token;
      }
      localStorage.setItem('cw_token', token);
      localStorage.setItem('cw_email', email);
      setCookie('cw_token', token);
      setCookie('cw_email', email);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message.includes('fetch') ? 'Connection failed. Check network or local API.' : e.message);
    } finally { setLoading(false); }
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      let token = "";
      if (isFirebaseEnabled()) {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass, returnSecureToken: true })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Firebase Registration failed');
        token = data.idToken;
      } else {
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        
        // Auto login
        const form = new URLSearchParams({ username: email, password: pass });
        const loginRes = await fetch(`${API}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });
        const loginData = await loginRes.json();
        token = loginData.access_token;
      }

      setSuccess('Account created! Signing you in...');
      localStorage.setItem('cw_token', token);
      localStorage.setItem('cw_email', email);
      setCookie('cw_token', token);
      setCookie('cw_email', email);
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (e: any) {
      setError(e.message.includes('fetch') ? 'Connection failed. Check network or local API.' : e.message);
    } finally { setLoading(false); }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 },
    box:  { width: '100%', maxWidth: 420, background: '#080808', border: '1px solid #1a1a1a' },
    top:  { background: '#000', borderBottom: '1px solid #1a1a1a', padding: '24px 32px' },
    logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
    logoBox: { width: 36, height: 36, background: '#FF2E93', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#000' },
    logoName: { fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 2 },
    tagline: { fontSize: 12, color: '#444', letterSpacing: 1 },
    tabs: { display: 'flex', borderBottom: '1px solid #1a1a1a' },
    tab: { flex: 1, padding: '14px', textAlign: 'center' as const, fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: 'pointer', background: 'none', border: 'none', transition: 'all .15s' },
    body: { padding: 32, display: 'flex', flexDirection: 'column', gap: 16 },
    errBox: { background: '#1a0008', border: '1px solid #FF2E93', color: '#FF2E93', padding: '10px 14px', fontSize: 12 },
    okBox:  { background: '#001a08', border: '1px solid #22c55e', color: '#22c55e', padding: '10px 14px', fontSize: 12 },
    group: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: 10, fontWeight: 900, color: '#444', letterSpacing: 2 },
    input: { width: '100%', padding: '11px 14px', background: '#111', border: '1px solid #222', color: '#fff', fontSize: 13, outline: 'none' },
    btn:   { width: '100%', padding: 13, background: '#FF2E93', color: '#000', border: 'none', fontSize: 12, fontWeight: 900, letterSpacing: 2 },
    orRow: { display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 0 0' },
    line:  { flex: 1, height: 1, background: '#1a1a1a' },
    orText: { fontSize: 9, color: '#444', fontWeight: 900, letterSpacing: 1 },
    switchRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, marginTop: 12 },
    link: { background: 'none', border: 'none', color: '#FF2E93', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    backLink: { marginTop: 20, fontSize: 12, color: '#333', textAlign: 'center' as const },
  };

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.top}>
          <div style={s.logoRow}>
            <div style={s.logoBox}>⚡</div>
            <span style={s.logoName}>CARDWISE</span>
          </div>
          <div style={s.tagline}>MAXIMIZE EVERY CARD SWIPE</div>
        </div>

        <div style={s.tabs}>
          {(['login','register'] as const).map(t => (
            <button key={t} style={{
              ...s.tab,
              color: tab === t ? '#FF2E93' : '#444',
              borderBottom: tab === t ? '2px solid #FF2E93' : '2px solid transparent',
            }} onClick={() => { setTab(t); setError(''); setSuccess(''); }}>
              {t === 'login' ? 'SIGN IN' : 'REGISTER'}
            </button>
          ))}
        </div>

        <div style={s.body}>
          {error   && <div style={s.errBox}>{error}</div>}
          {success && <div style={s.okBox}>{success}</div>}

          <form onSubmit={tab === 'login' ? doLogin : doRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={s.group}>
              <label style={s.label}>EMAIL ADDRESS</label>
              <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                onFocus={e => (e.target.style.borderColor = '#FF2E93')}
                onBlur={e => (e.target.style.borderColor = '#222')} />
            </div>
            <div style={s.group}>
              <label style={s.label}>PASSWORD</label>
              <input style={s.input} type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder={tab === 'register' ? 'Min 6 characters' : 'Enter password'} required minLength={tab === 'register' ? 6 : 1}
                onFocus={e => (e.target.style.borderColor = '#FF2E93')}
                onBlur={e => (e.target.style.borderColor = '#222')} />
            </div>
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? '...' : tab === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
            </button>
          </form>

          {GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" && (
            <>
              <div style={s.orRow}>
                <div style={s.line}></div>
                <span style={s.orText}>{tab === 'login' ? 'OR SIGN IN WITH' : 'OR REGISTER WITH'}</span>
                <div style={s.line}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div id="google-signin-btn"></div>
              </div>
            </>
          )}

          <div style={s.switchRow}>
            <span style={{ color: '#444' }}>
              {tab === 'login' ? "Don't have an account?" : 'Already registered?'}
            </span>
            <button style={s.link} onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}>
              {tab === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
      <div style={s.backLink}>
        <button style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 12 }}
          onClick={() => router.push('/')}>← Back to Home</button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
