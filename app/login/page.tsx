'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = 'http://localhost:3000/api/v1/auth';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle URL auth parameter (?auth=login or ?auth=register)
  useEffect(() => {
    const authType = searchParams?.get('auth');
    if (authType === 'login' || authType === 'register') {
      setTab(authType);
    }
  }, [searchParams]);

  // Sync token to cookies for Chrome extension to capture
  const setSessionCookies = (token: string, userEmail: string) => {
    const days = 30;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    
    // Set for both localhost and specific domain if needed
    document.cookie = `cardwise_auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
    document.cookie = `cw_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
    document.cookie = `cw_email=${encodeURIComponent(userEmail)}; expires=${expires}; path=/; SameSite=Lax`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'register') {
        // Registration
        const res = await fetch(`${API}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || 'Registration failed');
        }

        setSuccess('Account created successfully! Logging in...');
        
        // Auto-login after registration
        const formParams = new URLSearchParams();
        formParams.append('username', email);
        formParams.append('password', password);

        const loginRes = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formParams.toString(),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          throw new Error(loginData.detail || 'Auto-login failed');
        }

        const token = loginData.access_token;
        localStorage.setItem('cardwise_auth_token', token);
        localStorage.setItem('cw_token', token);
        localStorage.setItem('cw_email', email);
        setSessionCookies(token, email);

        setTimeout(() => {
          router.replace('/dashboard');
        }, 1000);
      } else {
        // Sign In
        const formParams = new URLSearchParams();
        formParams.append('username', email);
        formParams.append('password', password);

        const res = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formParams.toString(),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || 'Incorrect email or password');
        }

        const token = data.access_token;
        localStorage.setItem('cardwise_auth_token', token);
        localStorage.setItem('cw_token', token);
        localStorage.setItem('cw_email', email);
        setSessionCookies(token, email);

        setSuccess('Access granted. Welcome back.');
        setTimeout(() => {
          router.replace('/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050507] flex flex-col justify-center items-center px-4 overflow-hidden font-sans select-none">
      {/* Glow Ambient Blurs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-pink-500/[0.04] rounded-full blur-[100px] md:blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-blue-500/[0.03] rounded-full blur-[120px] md:blur-[220px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-[420px]">
        {/* Logo and Premium Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-black font-black text-xl mb-4 shadow-lg shadow-pink-500/20">
            ⚡
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-cabinet mb-1">
            CARDWISE
          </h1>
          <p className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">
            ULTRA-PREMIUM REWARD OPTIMIZER
          </p>
        </div>

        {/* Liquid Glass Login Container */}
        <div className="bg-white/[0.01] border border-white/[0.06] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-black/90">
          
          {/* Tab Selector */}
          <div className="flex border-b border-white/[0.06] mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${
                tab === 'login' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${
                tab === 'register' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 font-semibold tracking-wide">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 font-semibold tracking-wide animate-pulse">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-[9px] font-black tracking-widest uppercase text-white/50 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-pink-500/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black tracking-widest uppercase text-white/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-pink-500/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-black text-xs font-black tracking-widest uppercase py-3.5 rounded-xl transition-all shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 active:scale-[0.98]"
            >
              {loading ? 'Processing...' : tab === 'login' ? 'SIGN IN →' : 'REGISTER →'}
            </button>
          </form>
        </div>

        {/* Back navigation */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[10px] font-semibold tracking-widest text-white/30 hover:text-white/60 transition-colors uppercase"
          >
            ← Skip to Dashboard (Guest Mode)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="text-pink-500 animate-pulse text-sm font-black tracking-widest uppercase">LOADING CARDWISE...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
