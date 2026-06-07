'use client';
import { useState, useEffect } from 'react';

const API = 'http://localhost:8000/api/v1';
const FIREBASE_API_KEY = "AIzaSyDN3dvnybGVVmnc0lgyCxdwenA7hNX0scg";

function isFirebaseEnabled() {
  return typeof FIREBASE_API_KEY === 'string' && FIREBASE_API_KEY.trim() !== '';
}

const GOOGLE_CLIENT_ID = "50876595542-06vq0vrp5hktvu6cii3g1ugfa0ijv1c4.apps.googleusercontent.com" as string; 

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'login' | 'register';
  onSuccess: (token: string, email: string) => void;
}

export default function AuthModal({ isOpen, onClose, initialTab, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update tab when initialTab prop changes
  useEffect(() => {
    setTab(initialTab);
    setError('');
    setSuccess('');
    setEmail('');
    setPass('');
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
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
          { theme: "outline", size: "large", width: 350, shape: "rectangular", text: tab === 'login' ? 'signin_with' : 'signup_with' }
        );
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, [tab, isOpen]);

  if (!isOpen) return null;

  const setCookie = (name: string, value: string, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };

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
      onSuccess(data.idToken, data.email);
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
      onSuccess(token, email);
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
      setTimeout(() => onSuccess(token, email), 800);
    } catch (e: any) {
      setError(e.message.includes('fetch') ? 'Connection failed. Check network or local API.' : e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-100 flex items-center gap-3 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
          >
            ✕
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-200">
            L
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1A1D20]">CARDWISE</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Maximize Yield</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                tab === t 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-xs font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={tab === 'login' ? doLogin : doRegister} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Password</label>
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                placeholder={tab === 'register' ? 'Min 6 characters' : 'Enter password'} 
                required 
                minLength={tab === 'register' ? 6 : 1}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                tab === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'
              )}
            </button>
          </form>

          {GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" && (
            <>
              <div className="flex items-center gap-3 mt-2 mb-1">
                <div className="flex-1 h-px bg-zinc-100"></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {tab === 'login' ? 'Or sign in with' : 'Or register with'}
                </span>
                <div className="flex-1 h-px bg-zinc-100"></div>
              </div>
              <div className="flex justify-center w-full">
                <div id="google-signin-btn" className="w-full overflow-hidden flex justify-center min-h-[40px]"></div>
              </div>
            </>
          )}

          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-zinc-500 font-medium">
            <span>{tab === 'login' ? "Don't have an account?" : 'Already registered?'}</span>
            <button 
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {tab === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
