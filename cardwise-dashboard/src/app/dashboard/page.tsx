'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '../../components/AuthModal';
import CreditCard from '../../components/CreditCard';

function CardwiseDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const auth = searchParams?.get('auth');
    if (auth === 'login' || auth === 'register') {
      setAuthModalTab(auth);
      setAuthModalOpen(true);
    }
  }, [searchParams]);


  useEffect(() => {
    const tk = localStorage.getItem('cw_token');
    const em = localStorage.getItem('cw_email');
    if (!tk) {
      setIsAuth(false);
    } else {
      setIsAuth(true);
      if (em) setEmail(em);
    }
  }, [router]);

  useEffect(() => {
    if (isAuth) {
      fetchWalletInventory();
    }
  }, [isAuth]);

  const handleLogout = () => {
    localStorage.removeItem('cw_token');
    localStorage.removeItem('cw_email');
    document.cookie = 'cw_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'cw_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuth(false);
    router.push('/login');
  };

  const copySyncKey = () => {
    const token = localStorage.getItem('cw_token') || '';
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [activeTab, setActiveTab] = useState('portfolio');
  const [myWalletCards, setMyWalletCards] = useState<any[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [editCardholderName, setEditCardholderName] = useState('');
  const [editLast4, setEditLast4] = useState('');
  const [editCardNetwork, setEditCardNetwork] = useState('');
  const [editCardCategory, setEditCardCategory] = useState('');
  const [editCardLimit, setEditCardLimit] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [aiPromptString, setAiPromptString] = useState('');
  const [parsedResultPayload, setParsedResultPayload] = useState<any>(null);

  // Try Extension Simulator States
  const [extDomain, setExtDomain] = useState('amazon.in');
  const [extAmount, setExtAmount] = useState('5000');
  const [extResult, setExtResult] = useState<any>(null);
  const [extLoading, setExtLoading] = useState(false);

  // Shop Partners Matrix States
  const [partnerYields, setPartnerYields] = useState<Record<string, any>>({});
  const [selectedPartnerForAnalysis, setSelectedPartnerForAnalysis] = useState<string | null>(null);
  const [partnerAnalysisResults, setPartnerAnalysisResults] = useState<any[]>([]);

  // Redemption Matrix Rules State
  const [masterRules, setMasterRules] = useState<any[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  // Vacation Planner calculator states
  const [vacationCard, setVacationCard] = useState('');
  const [vacationPoints, setVacationPoints] = useState('5000');
  const [vacationPartner, setVacationPartner] = useState('avios');

  // Search & Provision Widget inside Portfolio tab
  const [widgetSearchQuery, setWidgetSearchQuery] = useState('');
  const [widgetSearchResults, setWidgetSearchResults] = useState<any[]>([]);
  const [widgetMessage, setWidgetMessage] = useState('');

  // Explore Offers — Rich Structured State
  const [topPicks, setTopPicks] = useState<any[]>([]);
  const [structuredDeals, setStructuredDeals] = useState<{total: number, categories: string[], grouped: Record<string, any[]>, deals: any[]}>({total: 0, categories: [], grouped: {}, deals: []});
  const [dealsLoading, setDealsLoading] = useState(false);
  const [copiedDealId, setCopiedDealId] = useState<number | null>(null);
  const [feedCountdown, setFeedCountdown] = useState(240);
  const [activeDealCategory, setActiveDealCategory] = useState('ALL');
  const [activeDealCardType, setActiveDealCardType] = useState('ALL');
  const [dealsFeed, setDealsFeed] = useState<{recent: any[], older_summary: any[], last_refreshed: string | null, next_refresh_in_seconds: number, total_active_deals: number}>({
    recent: [], older_summary: [], last_refreshed: null, next_refresh_in_seconds: 240, total_active_deals: 0
  });

  // Mini X widget state
  const [xWidgetOpen, setXWidgetOpen] = useState(true);
  const [xLivePosts, setXLivePosts] = useState<any[]>([]);
  const [xWidgetPulse, setXWidgetPulse] = useState(false);

  const CURRENT_USER_ID = "usr_prod_101_cardwise";

  // User Financial Profile States
  const [profileAge, setProfileAge] = useState('29');
  const [profileIncome, setProfileIncome] = useState('2400000');
  const [profileGoal, setProfileGoal] = useState('MAX_YIELD');
  const [spendDining, setSpendDining] = useState('15000');
  const [spendGrocery, setSpendGrocery] = useState('10000');
  const [spendShopping, setSpendShopping] = useState('25000');
  const [spendUtilities, setSpendUtilities] = useState('8000');
  const [spendTravel, setSpendTravel] = useState('20000');
  const [spendFuel, setSpendFuel] = useState('5000');
  const [spendInsurance, setSpendInsurance] = useState('4000');
  const [spendRent, setSpendRent] = useState('30000');
  const [spendOthers, setSpendOthers] = useState('10000');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // AI Audit States
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Fetch user's active wallet
  const fetchWalletInventory = async () => {
    setWalletLoading(true);
    try {
      const tk = localStorage.getItem('cw_token');
      if (!tk) {
        setMyWalletCards([]);
        return;
      }
      const response = await fetch('http://localhost:8000/api/v1/wallet', {
        headers: { Authorization: `Bearer ${tk}` }
      });
      const data = await response.json();
      const walletCards = Array.isArray(data) ? data : Array.isArray(data?.wallet) ? data.wallet : [];
      setMyWalletCards(walletCards);
      if (walletCards.length > 0) {
        setVacationCard(walletCards[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch wallet inventory:", error);
      setMyWalletCards([]);
    } finally {
      setWalletLoading(false);
    }
  };

  // Fetch all master rules for redemption matrix (from /cards endpoint)
  const fetchMasterRules = async () => {
    setRulesLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/cards');
      const data = await response.json();
      if (Array.isArray(data)) {
        // Flatten card rules into a flat list for table display
        const flatRules: any[] = [];
        data.forEach((card: any) => {
          (card.rules || []).forEach((rule: any, i: number) => {
            flatRules.push({
              rule_id: `${card.id}_${i}`,
              card_name: card.name,
              card_type: card.network,
              mcc_code: rule.categories?.join(', ') || 'ALL',
              base_reward_percentage: rule.cashback_pct || (rule.points_per_100 * 0.25) || 0,
              point_to_inr_valuation: rule.points_per_100 > 0 ? 0.25 : 0,
              is_completely_excluded: 0,
              gimmick_warning_text: rule.cap_monthly && rule.cap_monthly < 50000 ? `Monthly cap: ₹${rule.cap_monthly}` : null,
            });
          });
        });
        setMasterRules(flatRules);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    } finally {
      setRulesLoading(false);
    }
  };

  // Fetch structured deals feed (recent + older summary)
  const fetchDealsFeed = async (silent = false) => {
    if (!silent) setDealsLoading(true);
    try {
      const [topRes, structRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/deals/top-picks').catch(() => null),
        fetch('http://localhost:8000/api/v1/deals/structured').catch(() => null),
      ]);
      if (topRes?.ok) { const topData = await topRes.json(); if (Array.isArray(topData)) setTopPicks(topData); }
      if (structRes?.ok) { const structData = await structRes.json(); if (structData.deals) setStructuredDeals(structData); }
      setFeedCountdown(240);
    } catch (error) {
      // silently ignore if backend deals not yet running
    } finally {
      if (!silent) setDealsLoading(false);
    }
  };

  const fetchFilteredDeals = async (category: string, cardType: string) => {
    try {
      const params = new URLSearchParams();
      if (category !== 'ALL') params.set('category', category);
      if (cardType !== 'ALL') params.set('card_type', cardType);
      const res = await fetch(`http://localhost:8000/api/v1/deals/structured?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.deals) setStructuredDeals(data);
    } catch (e) {
      // ignore
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/user/profile?user_id=${CURRENT_USER_ID}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && !data.error) {
        setProfileAge(String(data.age || 29));
        setProfileIncome(String(data.annual_income_inr || 2400000));
        setProfileGoal(data.reward_goal || 'MAX_YIELD');
        setSpendDining(String(data.spend_dining_inr || 15000));
        setSpendGrocery(String(data.spend_grocery_inr || 10000));
        setSpendShopping(String(data.spend_shopping_inr || 25000));
        setSpendUtilities(String(data.spend_utilities_inr || 8000));
        setSpendTravel(String(data.spend_travel_inr || 20000));
        setSpendFuel(String(data.spend_fuel_inr || 5000));
        setSpendInsurance(String(data.spend_insurance_inr || 4000));
        setSpendRent(String(data.spend_rent_inr || 30000));
        setSpendOthers(String(data.spend_others_inr || 10000));
      }
    } catch (err) {
      // ignore if profile API not available
    }
  };

  const saveUserProfile = async () => {
    setProfileLoading(true);
    setProfileMessage('');
    try {
      const res = await fetch('http://localhost:8000/api/v1/user/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cw_token')}` },
        body: JSON.stringify({
          user_id: CURRENT_USER_ID,
          age: parseInt(profileAge),
          annual_income_inr: parseFloat(profileIncome),
          reward_goal: profileGoal,
          spend_dining_inr: parseFloat(spendDining),
          spend_grocery_inr: parseFloat(spendGrocery),
          spend_shopping_inr: parseFloat(spendShopping),
          spend_utilities_inr: parseFloat(spendUtilities),
          spend_travel_inr: parseFloat(spendTravel),
          spend_fuel_inr: parseFloat(spendFuel),
          spend_insurance_inr: parseFloat(spendInsurance),
          spend_rent_inr: parseFloat(spendRent),
          spend_others_inr: parseFloat(spendOthers)
        })
      });
      if (res.ok) {
        setProfileMessage("Financial Profile successfully updated!");
        setTimeout(() => setProfileMessage(''), 5000);
      } else {
        setProfileMessage(`Failed to save profile.`);
      }
    } catch (err) {
      setProfileMessage("Profile save feature requires backend extension.");
    } finally {
      setProfileLoading(false);
    }
  };

  const runProfileAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/user/profile/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cw_token')}` },
        body: JSON.stringify({ user_id: CURRENT_USER_ID })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && !data.error) {
        setAuditResult(data);
      }
    } catch (err) {
      // ignore
    } finally {
      setAuditLoading(false);
    }
  };

  // Fetch live X deal posts for mini widget
  const fetchXLivePosts = async (silent = false) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/deals/feed');
      if (!res.ok) return;
      const data = await res.json();
      const posts = [...(data.recent || []), ...(data.older_summary || [])].slice(0, 8);
      setXLivePosts(prev => {
        const hasNew = posts.length > 0 && (!prev.length || posts[0]?.deal_id !== prev[0]?.deal_id);
        if (hasNew && !silent) {
          setXWidgetPulse(true);
          setTimeout(() => setXWidgetPulse(false), 1500);
        }
        return posts;
      });
    } catch (e) {
      // silently ignore if deals backend not running
    }
  };

  useEffect(() => {
    fetchWalletInventory();
    fetchMasterRules();
    fetchDealsFeed();
    fetchXLivePosts();
    fetchUserProfile();

    // Auto-refresh deals feed every 4 minutes (matches backend poll interval)
    const feedRefreshInterval = setInterval(() => fetchDealsFeed(true), 4 * 60 * 1000);

    // X widget real-time poll every 30 seconds
    const xPollInterval = setInterval(() => fetchXLivePosts(true), 30 * 1000);

    // Countdown ticker — updates every second
    const countdownInterval = setInterval(() => {
      setFeedCountdown(prev => (prev <= 1 ? 240 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(feedRefreshInterval);
      clearInterval(xPollInterval);
      clearInterval(countdownInterval);
    };
  }, []);



  // Fetch shop partners top yields on load/wallet change
  useEffect(() => {
    if (myWalletCards.length > 0) {
      evaluateShopPartners();
    } else {
      setPartnerYields({});
    }
  }, [myWalletCards]);

  const evaluateShopPartners = async () => {
    const partners = [
      { name: 'Amazon.in Spends', domain: 'amazon.in' },
      { name: 'Zomato & Swiggy Delivery', domain: 'zomato.com' },
      { name: 'Flipkart Retail', domain: 'flipkart.com' }
    ];

    const yieldsMap: Record<string, any> = {};

    for (const p of partners) {
      try {
        const response = await fetch('http://localhost:8000/api/v1/engine/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cw_token')}` },
          body: JSON.stringify({
            checkout_domain: p.domain,
            declared_transaction_value_inr: 1000
          })
        });
        if (!response.ok) continue;
        const result = await response.json();
        if (result.rankings && result.rankings.length > 0) {
          const top = result.rankings[0];
          yieldsMap[p.name] = { display_label: top.card_name, yield_percentage: top.net_yield_pct };
        } else {
          yieldsMap[p.name] = { display_label: 'No active card recommended', yield_percentage: 0 };
        }
      } catch (error) {
        // ignore
      }
    }

    setPartnerYields(yieldsMap);
  };

  const runPartnerAnalysis = async (partnerName: string, domain: string) => {
    setSelectedPartnerForAnalysis(partnerName);
    try {
      const response = await fetch('http://localhost:8000/api/v1/engine/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cw_token')}` },
        body: JSON.stringify({
          checkout_domain: domain,
          declared_transaction_value_inr: 1000
        })
      });
      if (!response.ok) { setPartnerAnalysisResults([]); return; }
      const result = await response.json();
      if (result.rankings) {
        setPartnerAnalysisResults(result.rankings.map((r: any) => ({
          ...r,
          display_label: r.card_name,
          yield_percentage: r.net_yield_pct,
          gimmick_alert: null
        })));
      } else {
        setPartnerAnalysisResults([]);
      }
    } catch (error) {
      setPartnerAnalysisResults([]);
    }
  };

  // Simulated browser extension checkout query
  const runExtensionSimulation = async () => {
    if (!extDomain) return;
    setExtLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/engine/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cw_token')}` },
        body: JSON.stringify({
          checkout_domain: extDomain,
          declared_transaction_value_inr: parseFloat(extAmount) || 1000
        })
      });
      const data = await response.json();
      // Adapt to existing UI format
      if (data.rankings) {
        setExtResult({
          ...data,
          mcc_identified: data.mcc_identified,
          recommendations: data.rankings.map((r: any) => ({
            ...r,
            action_badge: r.badge || 'RANKED',
            yield_percentage: r.net_yield_pct,
            display_label: r.card_name,
            calculated_savings_inr: r.net_saving_inr,
            gimmick_alert: null
          }))
        });
      }
    } catch (error) {
      console.error("Extension simulator run failed:", error);
    } finally {
      setExtLoading(false);
    }
  };

  // Onboarding Widget Card Search
  const handleWidgetCardSearch = async (val: string) => {
    setWidgetSearchQuery(val);
    if (val.length < 2) {
      setWidgetSearchResults([]);
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/v1/cards');
      const data = await response.json();
      if (Array.isArray(data)) {
        const q = val.toLowerCase();
        const filtered = data.filter((c: any) =>
          c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q)
        );
        setWidgetSearchResults(filtered.map((c: any) => ({
          card_id: c.id,
          bank_id: c.issuer,
          card_name: c.name
        })));
      } else {
        setWidgetSearchResults([]);
      }
    } catch (e) {
      setWidgetSearchResults([]);
    }
  };

  // Add Card to User Portfolio
  const addCardToPortfolio = async (cardId: string, cardName: string) => {
    try {
      const tk = localStorage.getItem('cw_token');
      if (!tk) { setWidgetMessage('Please sign in first.'); return; }
      const response = await fetch('http://localhost:8000/api/v1/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ card_id: cardId })
      });
      if (response.ok) {
        setWidgetMessage(`✓ ${cardName} added to your portfolio!`);
        setWidgetSearchQuery('');
        setWidgetSearchResults([]);
        fetchWalletInventory();
        setTimeout(() => setWidgetMessage(''), 4000);
      } else {
        const err = await response.json().catch(() => ({}));
        setWidgetMessage(err.detail || 'Failed to add card.');
        setTimeout(() => setWidgetMessage(''), 4000);
      }
    } catch (error) {
      setWidgetMessage('Connection failed. Is the API server running?');
      setTimeout(() => setWidgetMessage(''), 5000);
    }
  };

  // Delete Card from Portfolio
  const deleteCardFromPortfolio = async (cardId: string) => {
    try {
      const tk = localStorage.getItem('cw_token');
      if (!tk) return;
      const response = await fetch(`http://localhost:8000/api/v1/wallet/${cardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tk}` }
      });
      if (response.ok) {
        fetchWalletInventory();
      }
    } catch (error) {
      console.error('Delete card failed:', error);
    }
  };

  // Open Edit Modal
  const openEditCard = (card: any) => {
    setEditingCard(card);
    // Parse existing nickname
    const parts = (card.nickname || '').split('|');
    setEditCardholderName(parts[0] || '');
    setEditLast4(parts[1] || '8824');
    setEditCardNetwork(card.card_network || card.network || '');
    setEditCardCategory(card.card_category || 'Platinum');
    setEditCardLimit(String(card.card_limit || 100000));
    setEditMessage('');
  };

  // Save Card Details
  const saveCardDetails = async () => {
    if (!editingCard) return;
    setEditLoading(true);
    setEditMessage('');
    try {
      const tk = localStorage.getItem('cw_token');
      const nickname = `${editCardholderName.trim() || 'CARD HOLDER'}|${editLast4.trim() || '0000'}`;
      const response = await fetch(`http://localhost:8000/api/v1/wallet/${editingCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({
          nickname,
          card_network: editCardNetwork,
          card_category: editCardCategory,
          card_limit: parseFloat(editCardLimit) || 100000,
        })
      });
      if (response.ok) {
        setEditMessage('✓ Card details saved!');
        fetchWalletInventory();
        setTimeout(() => { setEditingCard(null); setEditMessage(''); }, 1200);
      } else {
        setEditMessage('Failed to save. Try again.');
      }
    } catch {
      setEditMessage('Connection error.');
    } finally {
      setEditLoading(false);
    }
  };

  // Client-side NLP parser for AI suggestion prompts
  const parsePromptNLP = (text: string) => {
    const cleanText = text.toLowerCase();
    
    // Extract transaction amounts (e.g. ₹79,900 or 1500)
    let amount = 1000; // default benchmark
    const amtMatch = cleanText.match(/(?:rs\.?|inr|₹)\s?([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s?(?:rs|inr|rupees|bucks)/i);
    if (amtMatch) {
      const parsedVal = parseFloat((amtMatch[1] || amtMatch[2]).replace(/,/g, ''));
      if (!isNaN(parsedVal)) amount = parsedVal;
    } else {
      // Look for any raw number > 100
      const numbers = cleanText.match(/\b\d{3,}\b/g);
      if (numbers && numbers.length > 0) {
        amount = parseFloat(numbers[0]);
      }
    }

    // Resolve domains/brands
    let domain = 'amazon.in';
    let brandName = 'Amazon';
    
    if (cleanText.includes('zomato')) {
      domain = 'zomato.com';
      brandName = 'Zomato';
    } else if (cleanText.includes('swiggy')) {
      domain = 'swiggy.com';
      brandName = 'Swiggy';
    } else if (cleanText.includes('flipkart')) {
      domain = 'flipkart.com';
      brandName = 'Flipkart';
    } else if (cleanText.includes('croma')) {
      domain = 'croma.com';
      brandName = 'Croma';
    } else if (cleanText.includes('gov') || cleanText.includes('tax') || cleanText.includes('passport')) {
      domain = 'government.gov.in';
      brandName = 'Government Services';
    } else if (cleanText.includes('utility') || cleanText.includes('electric') || cleanText.includes('water') || cleanText.includes('billdesk')) {
      domain = 'billdesk.com';
      brandName = 'Utility Payments';
    }

    return { amount, domain, brandName };
  };

  const runEngineEvaluation = async () => {
    if (!aiPromptString) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/engine/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cw_token')}` },
        body: JSON.stringify({
          prompt: aiPromptString,
          user_id: "usr_prod_101_cardwise"
        })
      });

      const data = await response.json();
      setParsedResultPayload(data);
    } catch (e) {
      console.error("AI Parse evaluation failed:", e);
    }
  };

  // Copy coupon to clipboard helper
  const handleCopyCoupon = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedDealId(id);
    setTimeout(() => setCopiedDealId(null), 3000);
  };

  // Vacation Planner conversions
  const getConvertedMiles = () => {
    const pts = parseFloat(vacationPoints) || 0;
    if (vacationCard === 'in_hdfc_infinia_metal') {
      if (vacationPartner === 'all') {
        // Accor ALL: 2000 points = 1000 ALL Points
        return {
          miles: pts * 0.5,
          value: pts * 0.5 * 1.8, // ALL point is worth approx 1.8 INR
          desc: "Transfer Ratio: 2:1. Accor Live Limitless points offer premium hotel rewards."
        };
      } else {
        // Avios Transfer: 1:1 ratio
        return {
          miles: pts * 1.0,
          value: pts * 1.0 * 1.2, // Avios average value ~1.2 INR
          desc: "Transfer Ratio: 1:1. Optimize directly for BA/Qatar airways business awards."
        };
      }
    } else {
      // General baseline card transfer ratios
      return {
        miles: pts * 0.25,
        value: pts * 0.25 * 1.0,
        desc: "Baseline card tier: standard 4:1 conversion ratio applied."
      };
    }
  };

  const conversion = getConvertedMiles();

  return (
    <div className="bg-[#F9F9FB] min-h-screen text-[#1A1D20] font-sans antialiased flex">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <div className="w-64 bg-white border-r border-[#E9ECEF] p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-200">c</div>
            <span className="text-lg font-bold tracking-tight text-[#1A1D20]">CARDWISE</span>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'extension', label: 'Try Extension' },
              { id: 'portfolio', label: 'My Portfolio' },
              { id: 'profile', label: 'Financial Profile' },
              { id: 'shop', label: 'Shop Partners' },
              { id: 'redemption', label: 'Reward Redemption' },
              { id: 'ai_suggest', label: 'AI Suggestion' },
              { id: 'vacation', label: 'Vacation Planner' },
              { id: 'limited_offers', label: 'Limited Offers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
          <p className="text-xs font-semibold text-zinc-700">Team: 2 Engineers</p>
          <span className="text-[10px] text-zinc-400 block mt-0.5">V1.0.0 Stable Ready</span>
        </div>
      </div>

      {/* DYNAMIC VIEWS CONTROLLER AREA */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* TOP NAVBAR FOR AUTHENTICATION */}
        <div className="flex justify-end items-center mb-10 pb-4 border-b border-zinc-200/50">
          <div className="flex items-center gap-3">
            {isAuth ? (
              <>
                <span className="text-xs font-bold text-zinc-500 mr-2">{email}</span>
                <button onClick={copySyncKey} className="px-4 py-2 text-xs font-bold bg-[#FF2E93] hover:bg-[#E01E79] transition-colors text-white rounded-lg shadow-sm shadow-pink-200">
                  {copied ? 'KEY COPIED!' : 'COPY SYNC KEY'}
                </button>
                <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-lg transition-colors">
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }} className="px-4 py-2 text-xs font-bold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-lg transition-colors">
                  SIGN IN
                </button>
                <button onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true); }} className="px-4 py-2 text-xs font-bold bg-[#FF2E93] hover:bg-[#E01E79] transition-colors text-white rounded-lg shadow-sm shadow-pink-200">
                  CREATE ACCOUNT
                </button>
              </>
            )}
          </div>
        </div>

        
        {/* TAB 1: TRY EXTENSION PREVIEW */}
        {activeTab === 'extension' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Try Browser Extension</h2>
                <p className="text-sm text-zinc-500 mt-1">Simulate live optimization on checkout gateways with your active wallet.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="bg-white border border-[#E9ECEF] p-8 rounded-2xl shadow-sm relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Simulator Inputs</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Target Checkout Domain</label>
                  <input 
                    type="text"
                    value={extDomain}
                    onChange={(e) => setExtDomain(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                    placeholder="e.g. zomato.com"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['amazon.in', 'zomato.com', 'swiggy.com', 'billdesk.com', 'government.gov.in'].map((dom) => (
                      <button 
                        key={dom}
                        onClick={() => setExtDomain(dom)}
                        className="text-[10px] font-bold px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-colors"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Transaction Value (INR)</label>
                  <input 
                    type="number"
                    value={extAmount}
                    onChange={(e) => setExtAmount(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                    placeholder="e.g. 1500"
                  />
                </div>

                <button 
                  onClick={runExtensionSimulation}
                  disabled={extLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-100 transition-colors"
                >
                  {extLoading ? 'EVALUATING ROUTING...' : 'RUN SIMULATOR'}
                </button>
              </div>

              {/* Visual Browser Shadow DOM Mockup */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">💡 LIVE OVERLAY SHADOW DOM</span>
                    <span className="text-[9px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">INJECTED</span>
                  </div>

                  <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Checkout Total</p>
                  <p className="text-3xl font-black mt-1">₹{(parseFloat(extAmount) || 0).toLocaleString('en-IN')}</p>

                  <div className="mt-6 border-t border-zinc-200 pt-4 space-y-3">
                    {extResult ? (
                      extResult.recommendations && extResult.recommendations.length > 0 ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-700">
                              {extResult.recommendations[0].action_badge}
                            </span>
                            <span className="text-xs text-zinc-500">
                              Yield: {extResult.recommendations[0].yield_percentage}% Net
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-bold text-zinc-800">
                            💳 Use your <span className="text-blue-600">{extResult.recommendations[0].display_label}</span>
                          </p>
                          <p className="text-xs font-semibold text-green-600 mt-1">
                            Save ₹{extResult.recommendations[0].calculated_savings_inr.toLocaleString('en-IN')} instantly!
                          </p>
                          {extResult.recommendations[0].gimmick_alert && (
                            <p className="text-xs text-zinc-500 italic mt-2 bg-white border border-zinc-100 p-2.5 rounded-lg">
                              {extResult.recommendations[0].gimmick_alert}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-100 p-3 rounded-lg">
                          ⚠️ No cards in your portfolio match this MCC category or your portfolio is empty.
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-zinc-400 italic">Configure merchant values and hit Run Simulator to verify optimal routing logic.</p>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-zinc-400 text-right mt-4">
                  Routing MCC Code: <span className="font-bold text-zinc-700">{extResult ? extResult.mcc_identified : 'None'}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: USER PROFILE AND AI AUDIT */}
        {activeTab === 'profile' && (
          <div className="max-w-6xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Financial Profile & AI Wallet Audit</h2>
                <p className="text-sm text-zinc-500 mt-1">Configure your spending habits and reward preferences to audit your wallet card combination.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Config Form */}
              <div className="lg:col-span-2 bg-white border border-[#E9ECEF] p-8 rounded-2xl shadow-sm space-y-6">
                <div className="border-b border-zinc-50 pb-4">
                  <h3 className="text-base font-bold text-zinc-950">Demographics & Reward Preferences</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Used by our optimization engine to match card fee thresholds and target reward structures.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">User Age</label>
                    <input 
                      type="number"
                      value={profileAge}
                      onChange={(e) => setProfileAge(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-blue-500 rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Annual Income (INR)</label>
                    <input 
                      type="number"
                      value={profileIncome}
                      onChange={(e) => setProfileIncome(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-blue-500 rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Primary Reward Goal</label>
                    <select
                      value={profileGoal}
                      onChange={(e) => setProfileGoal(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-blue-500 rounded-xl p-3 text-sm text-[#1A1D20] outline-none font-medium"
                    >
                      <option value="MAX_YIELD">Maximize Net Yield (Recommended)</option>
                      <option value="CASHBACK">Direct CashBack/Statement Credit</option>
                      <option value="AIRMILES">Frequent Flyer / Airmiles</option>
                      <option value="HOTEL_POINTS">Hotel Loyalty Points</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-zinc-50 pt-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-950">Category-Wise Average Monthly Spends</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Please provide realistic monthly estimate levels in INR.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">🍔 Dining & Food Delivery</label>
                      <input 
                        type="number"
                        value={spendDining}
                        onChange={(e) => setSpendDining(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">🛒 Grocery & Supermarket</label>
                      <input 
                        type="number"
                        value={spendGrocery}
                        onChange={(e) => setSpendGrocery(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">🛍️ Retail & Online Shopping</label>
                      <input 
                        type="number"
                        value={spendShopping}
                        onChange={(e) => setSpendShopping(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">⚡ Utilities & Bill Payments</label>
                      <input 
                        type="number"
                        value={spendUtilities}
                        onChange={(e) => setSpendUtilities(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">✈️ Flights & Hotel Travel</label>
                      <input 
                        type="number"
                        value={spendTravel}
                        onChange={(e) => setSpendTravel(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">⛽ Fuel & Transport</label>
                      <input 
                        type="number"
                        value={spendFuel}
                        onChange={(e) => setSpendFuel(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">🛡️ Insurance Premium</label>
                      <input 
                        type="number"
                        value={spendInsurance}
                        onChange={(e) => setSpendInsurance(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">🏠 Rent Payments</label>
                      <input 
                        type="number"
                        value={spendRent}
                        onChange={(e) => setSpendRent(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">☕ Miscellaneous / Others</label>
                      <input 
                        type="number"
                        value={spendOthers}
                        onChange={(e) => setSpendOthers(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm text-[#1A1D20] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-zinc-50">
                  <button 
                    onClick={saveUserProfile}
                    disabled={profileLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-sm transition-all"
                  >
                    {profileLoading ? "SAVING PROFILE..." : "SAVE FINANCIAL PROFILE"}
                  </button>
                  {profileMessage && (
                    <span className="text-xs text-emerald-600 font-semibold">{profileMessage}</span>
                  )}
                </div>
              </div>

              {/* AI Wallet Optimization Audit Side Dashboard */}
              <div className="space-y-6">
                <div className="bg-zinc-950 border border-zinc-900 text-white p-8 rounded-2xl shadow-lg space-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-blue-400 font-black">AI Orchestrated Optimization</label>
                    <h3 className="text-lg font-bold text-white">Wallet Audit Dashboard</h3>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">Run the core optimization algorithm to verify leaks and request new instrument provision upgrades.</p>
                  </div>

                  <button 
                    onClick={runProfileAudit}
                    disabled={auditLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-colors"
                  >
                    {auditLoading ? "SIMULATING REWARDS..." : "RUN AI WALLET AUDIT"}
                  </button>
                </div>

                {auditResult && (
                  <div className="bg-white border border-[#E9ECEF] p-6 rounded-2xl shadow-sm space-y-6">
                    
                    {/* Optimization Score */}
                    <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Optimization Score</h4>
                        <span className="text-[10px] text-zinc-500">Current vs Max Possible yield</span>
                      </div>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-4 ${
                        auditResult.optimization_score >= 80 ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' :
                        auditResult.optimization_score >= 50 ? 'border-amber-500 text-amber-600 bg-amber-50/30' :
                        'border-rose-500 text-rose-600 bg-rose-50/30'
                      }`}>
                        {auditResult.optimization_score}%
                      </div>
                    </div>

                    {/* Rewards Delta */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E9ECEF]">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Current Rewards</span>
                        <span className="text-base font-bold text-zinc-800">₹{Math.round(auditResult.current_annual_rewards).toLocaleString('en-IN')}<span className="text-[10px] text-zinc-400">/yr</span></span>
                      </div>
                      <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E9ECEF]">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Optimal Yield</span>
                        <span className="text-base font-bold text-zinc-800">₹{Math.round(auditResult.optimal_annual_rewards).toLocaleString('en-IN')}<span className="text-[10px] text-zinc-400">/yr</span></span>
                      </div>
                    </div>

                    {/* Potential Leak */}
                    {auditResult.optimal_annual_rewards - auditResult.current_annual_rewards > 0 && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-4 flex justify-between items-center text-xs font-medium">
                        <span>⚠️ Projected Annual Reward Leakage:</span>
                        <span className="font-black text-rose-700">₹{Math.round(auditResult.optimal_annual_rewards - auditResult.current_annual_rewards).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {/* Recommended Cards */}
                    {auditResult.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Top Recommended Additions</h4>
                        <div className="space-y-2">
                          {auditResult.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block leading-none mb-1">{rec.bank_id}</span>
                                <span className="text-xs font-bold text-zinc-800 block">{rec.card_name}</span>
                                <span className="text-[10px] text-zinc-400">Target: {rec.target_categories.join(', ')}</span>
                              </div>
                              <span className="text-xs font-black text-emerald-600 text-right font-mono">
                                +₹{Math.round(rec.annual_savings_inr).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Executive Summary */}
                    {auditResult.audit_summary && (
                      <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider block text-blue-600">AI Portfolio Review</span>
                        <div className="text-xs leading-relaxed text-blue-900 font-medium space-y-1.5 whitespace-pre-line">
                          {auditResult.audit_summary}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PORTFOLIO INTERACTIVE VIEW */}
        {activeTab === 'portfolio' && (
          <div className="max-w-4xl space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">My Active Portfolio</h2>
                <p className="text-sm text-zinc-500 mt-1">Manually provision and review your card inventory tracks.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Quick Provisioning Widget Box */}
            <div className="bg-white border border-[#E9ECEF] p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-3">
                ➕ PROVISION NEW ASSET TO PORTFOLIO
              </h3>
              
              <div className="relative">
                <input 
                  type="text"
                  value={widgetSearchQuery}
                  onChange={(e) => handleWidgetCardSearch(e.target.value)}
                  placeholder="Enter Bank or Variant Name (e.g. SBI, HDFC)..."
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                />

                {widgetSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E9ECEF] rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {widgetSearchResults.map((card: any) => (
                      <div 
                        key={card.card_id}
                        onClick={() => addCardToPortfolio(card.card_id, card.card_name)}
                        className="p-4 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer flex justify-between items-center transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div>
                          <span className="text-xs uppercase tracking-wide font-bold text-zinc-500">{card.bank_id}</span>
                          <h4 className="text-sm font-bold text-zinc-900">{card.card_name}</h4>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                          + Provision
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {widgetMessage && (
                <div className="mt-3 text-xs font-bold text-green-600 bg-green-50 border border-green-100 p-2.5 rounded-xl">
                  {widgetMessage}
                </div>
              )}
            </div>

            {/* Wallet deck — premium credit card grid */}
            {walletLoading ? (
              <div className="bg-white border-2 border-dashed border-zinc-200 p-16 rounded-3xl text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-sm font-bold text-zinc-500">Loading your wallet...</p>
                <p className="text-xs text-zinc-400 mt-1">Fetching cards from your account.</p>
              </div>
            ) : myWalletCards.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-zinc-200 p-16 rounded-3xl text-center">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-sm font-bold text-zinc-500">No cards in your wallet yet.</p>
                <p className="text-xs text-zinc-400 mt-1">Use the search above to provision your first card.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {myWalletCards.map((card: any) => (
                  <CreditCard
                    key={card.id}
                    card={card}
                    onEdit={openEditCard}
                    onDelete={deleteCardFromPortfolio}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHOP PARTNERS */}
        {activeTab === 'shop' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Shop Direct Partners</h2>
                <p className="text-sm text-zinc-500 mt-1">Top-yielding credit cards ranked by online brand portals in your portfolio.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { name: 'Amazon.in Spends', domain: 'amazon.in', logo: 'A' },
                  { name: 'Zomato & Swiggy Delivery', domain: 'zomato.com', logo: 'Z' },
                  { name: 'Flipkart Retail', domain: 'flipkart.com', logo: 'F' }
                ].map((shop) => {
                  const optimal = partnerYields[shop.name];
                  return (
                    <div key={shop.name} className="bg-white border border-[#E9ECEF] p-6 rounded-2xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center font-bold text-zinc-700">{shop.logo}</div>
                        <div>
                          <h4 className="font-bold text-[#1A1D20]">{shop.name}</h4>
                          {optimal ? (
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Top card: <span className="font-semibold text-blue-600">{optimal.display_label || 'None'}</span> ({optimal.yield_percentage || optimal.yield_percentage === 0 ? optimal.yield_percentage : 0}% yield)
                            </p>
                          ) : (
                            <p className="text-xs text-zinc-400 mt-0.5">No calculations loaded. Add cards to portfolio.</p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => runPartnerAnalysis(shop.name, shop.domain)}
                        className="bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-bold px-4 py-2 rounded-xl border border-zinc-200 transition-colors"
                      >
                        Analyze Matrix
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Side Analysis Results View */}
              <div className="bg-white border border-[#E9ECEF] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-4">
                    🔍 MATRIX ANALYSIS: {selectedPartnerForAnalysis || 'None Selected'}
                  </h3>
                  
                  {selectedPartnerForAnalysis ? (
                    partnerAnalysisResults.length > 0 ? (
                      <div className="space-y-3">
                        {partnerAnalysisResults.map((rec) => (
                          <div key={rec.card_id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-zinc-400">#{rec.rank}</span>
                                <h4 className="text-sm font-bold text-zinc-800">{rec.display_label}</h4>
                              </div>
                              {rec.gimmick_alert && (
                                <p className="text-[10px] text-amber-600 mt-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">{rec.gimmick_alert}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-blue-600 block">{rec.yield_percentage}%</span>
                              <span className="text-[10px] text-zinc-400 block">Net Yield</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">No recommendations calculated. Add cards to your active portfolio ledger to match rules.</p>
                    )
                  ) : (
                    <p className="text-xs text-zinc-400 italic">Click "Analyze Matrix" on any direct brand partner to compute the dynamic yielding comparison tier lists.</p>
                  )}
                </div>

                {selectedPartnerForAnalysis && (
                  <div className="text-[10px] text-zinc-400 border-t border-zinc-100 pt-3 mt-4">
                    Evaluation User: <span className="font-bold">{CURRENT_USER_ID}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REDEMPTION MATRIX */}
        {activeTab === 'redemption' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Reward Redemption Matrix</h2>
                <p className="text-sm text-zinc-500 mt-1">Convert raw reward ledger points to true fractional INR values directly from rules database.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="bg-white border border-[#E9ECEF] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold">ACTIVE DATABASE EXTRAPOLATION RULES</h3>
              </div>

              {rulesLoading ? (
                <div className="p-8 text-center text-sm text-zinc-500">Loading rules ledger...</div>
              ) : masterRules.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-400">No database rules found. Seed your database.</div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  <div className="grid grid-cols-5 p-4 text-xs font-bold text-zinc-400 uppercase bg-zinc-50/50">
                    <span className="col-span-2">Card Variant</span>
                    <span>Category MCC</span>
                    <span>Base Yield</span>
                    <span>INR Valuation / Point</span>
                  </div>
                  {masterRules.map((rule) => {
                    const isExcl = rule.is_completely_excluded === 1 || rule.is_completely_excluded === true;
                    return (
                      <div key={rule.rule_id} className="p-4 space-y-2">
                        <div className="grid grid-cols-5 text-sm font-semibold items-center">
                          <span className="col-span-2 text-zinc-900">{rule.card_name} ({rule.card_type})</span>
                          <span className="text-zinc-500 font-mono">{rule.mcc_code}</span>
                          <span className={`${isExcl ? 'text-red-500' : 'text-green-600'} font-bold`}>
                            {isExcl ? 'EXCLUDED (0%)' : `${rule.base_reward_percentage}%`}
                          </span>
                          <span className="text-zinc-700 font-mono">{rule.point_to_inr_valuation.toFixed(2)} INR</span>
                        </div>
                        {rule.gimmick_warning_text && (
                          <div className="text-[11px] bg-amber-50 border border-amber-100 text-amber-700 p-2.5 rounded-xl">
                            {rule.gimmick_warning_text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AI SUGGESTION ENGINE PANEL */}
        {activeTab === 'ai_suggest' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">AI Suggestion Prompt Engine</h2>
                <p className="text-sm text-zinc-500 mt-1">Input target transaction metadata for instant evaluation tracking.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="bg-white border border-[#E9ECEF] p-8 rounded-2xl shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Natural Language Transaction Prompt</label>
                <textarea 
                  value={aiPromptString}
                  onChange={(e) => setAiPromptString(e.target.value)}
                  placeholder="Ex: Ordering dinner on Zomato for Rs 1250..."
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] text-sm p-4 rounded-xl outline-none focus:border-blue-500 transition-colors h-24 resize-none text-[#1A1D20]"
                />
              </div>

              <button 
                onClick={runEngineEvaluation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-sm transition-all"
              >
                ANALYZE TRANSACTION PROMPT
              </button>

              {parsedResultPayload && (
                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <div className="flex gap-4 text-xs font-semibold text-zinc-500">
                    <div>CATEGORY DETECTED: <span className="text-blue-600 font-bold">{parsedResultPayload.parsed_category}</span></div>
                    <div>AMOUNT EXTRACTED: <span className="text-zinc-900 font-bold">₹{parsedResultPayload.extracted_amount}</span></div>
                  </div>

                  {parsedResultPayload.personalized_tip && (
                    <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 text-xs leading-relaxed font-medium">
                      💡 <span className="font-bold">Smart Tip:</span> {parsedResultPayload.personalized_tip}
                    </div>
                  )}

                  <div className="space-y-3">
                    {parsedResultPayload.sorted_results.map((rec: any, idx: number) => (
                      <div key={idx} className="bg-[#F8F9FA] border border-[#E9ECEF] p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1A1D20]">{rec.card_name}</span>
                            <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.2 rounded-md font-medium uppercase">{rec.card_type}</span>
                          </div>
                          {rec.warning_flag && <p className="text-[11px] text-amber-600 font-medium mt-1">⚠️ {rec.warning_flag}</p>}
                        </div>
                        
                        <div className="text-right">
                          <span className="text-sm font-black text-green-600 block">+{rec.reward_yield_pct}% Yield</span>
                          {rec.net_savings_inr > 0 && <span className="text-xs text-zinc-400 font-medium">Saves ₹{rec.net_savings_inr}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: VACATION REWARD PLANNER */}
        {activeTab === 'vacation' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Vacation Point Mileage Planner</h2>
                <p className="text-sm text-zinc-500 mt-1">Optimize point transfers to premium airline networks and hotel programs.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Mileage Calculator */}
              <div className="bg-white border border-[#E9ECEF] p-6 rounded-2xl shadow-sm col-span-1 space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold">MILAGE TRANSFER CALCULATOR</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Select Active Portfolio Card</label>
                  <select 
                    value={vacationCard} 
                    onChange={(e) => setVacationCard(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                  >
                    {myWalletCards.map(c => (
                      <option key={c.card_id} value={c.card_id}>{c.card_name}</option>
                    ))}
                    {myWalletCards.length === 0 && <option value="">No active cards</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Card Points Quantity</label>
                  <input 
                    type="number"
                    value={vacationPoints}
                    onChange={(e) => setVacationPoints(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Destination Partner</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setVacationPartner('avios')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${vacationPartner === 'avios' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-zinc-200 text-zinc-500'}`}
                    >
                      Avios (Airline)
                    </button>
                    <button 
                      onClick={() => setVacationPartner('all')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${vacationPartner === 'all' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-zinc-200 text-zinc-500'}`}
                    >
                      Accor ALL (Hotel)
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 bg-zinc-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                    <span>Received Miles:</span>
                    <span className="text-sm font-bold text-zinc-900">{conversion.miles.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                    <span>Cash Equivalent Value:</span>
                    <span className="text-sm font-bold text-green-600">~₹{conversion.value.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight pt-1 border-t border-zinc-200/50">
                    {conversion.desc}
                  </p>
                </div>
              </div>

              {/* Partners list cards */}
              <div className="col-span-2 space-y-6">
                <div className="bg-white border border-[#E9ECEF] p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md uppercase">Hotel Network Partner</span>
                  <h4 className="text-lg font-bold mt-2 text-zinc-900">Accor Live Limitless (ALL)</h4>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    Transfer Rate: 2,000 Edge Points = 1,000 ALL Points (Value: ~₹1,800 hotel credit). 
                    Accor Hotels (e.g. Novotel, Pullman, Sofitel, Ibis) offers excellent point redemption rates in India and Europe at approximately ₹1.80 per point.
                  </p>
                </div>
                <div className="bg-white border border-[#E9ECEF] p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2.5 py-1 rounded-md uppercase">Airline Network Partner</span>
                  <h4 className="text-lg font-bold mt-2 text-zinc-900">Avios Mileage Transfer</h4>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    Optimize points directly for Qatar Airways Privilege Club or British Airways Executive Club. 
                    Avios mileage awards represent high value yields for premium business cabin seat upgrades on long-haul flights.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: EXPLORE OFFERS — Fully Redesigned */}
        {activeTab === 'limited_offers' && (
          <div className="max-w-5xl space-y-8">

            {/* ── PAGE HEADER ── */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Explore Card Offers</h2>
                <p className="text-sm text-zinc-500 mt-1">Best credit & debit card deals curated from India's top fintech creators. Auto-refreshes every 4 min.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={() => fetchDealsFeed()}
                  disabled={dealsLoading}
                  className="bg-zinc-900 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  {dealsLoading ? 'Refreshing...' : '↻ Refresh'}
                </button>
              </div>
            </div>


            {/* ── LIVE DEALS HEADER NOTE ── */}
            <div className="flex items-center gap-3 bg-[#0f1419] border border-[#1d2d44] rounded-2xl px-5 py-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <p className="text-[11px] text-zinc-400">
                Live deal feed from <span className="text-white font-bold">@AmazingCreditC</span> & top Indian fintech creators — see the <span className="text-blue-400 font-semibold">mini X widget</span> at the bottom-right for real-time posts.
              </p>
              <a href="https://x.com/AmazingCreditC" target="_blank" rel="noopener noreferrer"
                className="ml-auto shrink-0 flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Open on X ↗
              </a>
            </div>


            {/* ── TOP 10 BEST OFFERS LEADERBOARD ── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center text-amber-900 font-black text-sm">★</div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Top 10 Best Offers</h3>
                  <p className="text-[11px] text-zinc-500">Highest value picks curated from all creators, sorted by cashback yield</p>
                </div>
              </div>

              {topPicks.length === 0 ? (
                <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-8 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-zinc-400">Loading top picks...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPicks.map((deal: any, idx: number) => (
                    <div
                      key={deal.deal_id}
                      className="bg-white border border-[#E9ECEF] rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Rank badge */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        idx === 0 ? 'bg-amber-400 text-amber-900' :
                        idx === 1 ? 'bg-zinc-300 text-zinc-700' :
                        idx === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-zinc-100 text-zinc-500'
                      }`}>
                        #{idx + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">{deal.source_x_profile}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            deal.card_type === 'FOREX' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                            deal.card_type === 'DEBIT' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-green-50 text-green-700 border border-green-100'
                          }`}>{deal.card_type}</span>
                          <span className="text-[10px] font-semibold text-zinc-400 capitalize">{(deal.deal_category || '').toLowerCase().replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 leading-snug truncate">{deal.deal_headline.replace(/^🔥 TOP PICK: /, '')}</p>
                      </div>

                      {/* Yield badge */}
                      <div className="shrink-0 text-right">
                        <div className={`text-lg font-black ${
                          deal.yield_pct >= 10 ? 'text-emerald-600' :
                          deal.yield_pct >= 5 ? 'text-blue-600' :
                          deal.yield_pct >= 2 ? 'text-amber-600' : 'text-zinc-600'
                        }`}>{deal.yield_pct}%</div>
                        <div className="text-[10px] text-zinc-400 font-medium">yield</div>
                      </div>

                      {/* Coupon copy */}
                      {deal.coupon_code !== 'NOT_REQUIRED' && (
                        <div className="shrink-0">
                          <button
                            onClick={() => { navigator.clipboard.writeText(deal.coupon_code); setCopiedDealId(deal.deal_id); setTimeout(()=>setCopiedDealId(null),2000); }}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                              copiedDealId === deal.deal_id ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {copiedDealId === deal.deal_id ? '✓ Copied' : `Copy ${deal.coupon_code}`}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── ALL DEALS: FILTER BAR + GRID ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">All Active Deals</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{structuredDeals.total} deals across {structuredDeals.categories.length} categories</p>
                </div>

                {/* Card Type Toggle */}
                <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
                  {(['ALL', 'CREDIT', 'DEBIT', 'FOREX'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setActiveDealCardType(t);
                        fetchFilteredDeals(activeDealCategory, t);
                      }}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        activeDealCardType === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      {t === 'ALL' ? 'All Cards' : t === 'CREDIT' ? '💳 Credit' : t === 'DEBIT' ? '🏧 Debit' : '🌍 Forex'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => { setActiveDealCategory('ALL'); fetchFilteredDeals('ALL', activeDealCardType); }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                    activeDealCategory === 'ALL' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  All Categories
                </button>
                {({
                  ONLINE_SHOPPING: '🛒 Shopping',
                  FOOD_DELIVERY: '🍔 Food',
                  TRAVEL: '✈️ Travel',
                  FUEL: '⛽ Fuel',
                  ENTERTAINMENT: '🎬 Entertainment',
                  GROCERY: '🥦 Grocery',
                  LIFESTYLE: '✨ Lifestyle',
                  UTILITIES: '💡 Utilities',
                  INSURANCE: '🛡️ Insurance',
                  DINING: '🍽️ Dining',
                } as Record<string, string>).constructor === Object &&
                  Object.entries({
                    ONLINE_SHOPPING: '🛒 Shopping',
                    FOOD_DELIVERY: '🍔 Food',
                    TRAVEL: '✈️ Travel',
                    FUEL: '⛽ Fuel',
                    ENTERTAINMENT: '🎬 Entertainment',
                    GROCERY: '🥦 Grocery',
                    LIFESTYLE: '✨ Lifestyle',
                    UTILITIES: '💡 Utilities',
                    INSURANCE: '🛡️ Insurance',
                    DINING: '🍽️ Dining',
                  }).filter(([key]) => structuredDeals.categories.includes(key)).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setActiveDealCategory(key); fetchFilteredDeals(key, activeDealCardType); }}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                        activeDealCategory === key ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))
                }
              </div>

              {/* Deals Grid */}
              {structuredDeals.deals.length === 0 ? (
                <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-12 text-center">
                  <p className="text-sm text-zinc-400">No deals match your selected filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {structuredDeals.deals.map((deal: any) => (
                    <div
                      key={deal.deal_id}
                      className={`bg-white border rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${
                        deal.is_top_pick ? 'border-amber-300 shadow-amber-50 shadow-md' : 'border-[#E9ECEF]'
                      }`}
                    >
                      {deal.is_top_pick === 1 && (
                        <div className="flex justify-end mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">★ Top Pick</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono">{deal.source_x_profile}</span>
                          <span className={`text-[10px] font-black ${
                            deal.yield_pct >= 10 ? 'text-emerald-600' :
                            deal.yield_pct >= 5 ? 'text-blue-600' :
                            deal.yield_pct >= 2 ? 'text-amber-600' : 'text-zinc-500'
                          }`}>{deal.yield_pct}% yield</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">{deal.target_merchant}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            deal.card_type === 'FOREX' ? 'bg-cyan-50 text-cyan-600' :
                            deal.card_type === 'DEBIT' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                          }`}>{deal.card_type}</span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 leading-snug">{deal.deal_headline.replace(/^🔥 TOP PICK: /, '')}</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{deal.raw_copied_text}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#F0F0F0] space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#F8F9FA] border border-[#E9ECEF] px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold text-zinc-700 truncate">
                            {deal.coupon_code === 'NOT_REQUIRED' ? 'No code needed' : deal.coupon_code}
                          </div>
                          {deal.coupon_code !== 'NOT_REQUIRED' && (
                            <button
                              onClick={() => { navigator.clipboard.writeText(deal.coupon_code); setCopiedDealId(deal.deal_id); setTimeout(()=>setCopiedDealId(null),2000); }}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                                copiedDealId === deal.deal_id ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                              }`}
                            >
                              {copiedDealId === deal.deal_id ? '✓' : 'Copy'}
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400">Expires {deal.expires_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── TRUSTED SOURCES STRIP ── */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Trusted Creators on X</p>
              <div className="flex flex-wrap gap-2">
                {['@AmazingCreditC','@CardExpertIn','@TechnoFino','@Cardmafia_in','@CardInsiderIn','@RupeeSaving'].map(acc => (
                  <a
                    key={acc}
                    href={`https://x.com/${acc.replace('@','')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                      acc === '@AmazingCreditC' ? 'bg-blue-900 border-blue-700 text-blue-200 hover:bg-blue-800' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'
                    } font-mono`}
                  >
                    {acc}
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── FLOATING MINI X WIDGET (bottom-right) ── */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Expanded panel */}
        {xWidgetOpen && (
          <div
            className="w-80 bg-[#0f1419] border border-[#1e2d3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '420px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d3d] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-black text-xs">A</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f1419] animate-pulse"></span>
                </div>
                <div>
                  <p className="text-white font-black text-xs leading-none">@AmazingCreditC</p>
                  <p className="text-zinc-500 text-[9px] mt-0.5">Card deals · India</p>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border transition-all ${
                  xWidgetPulse ? 'bg-emerald-400/30 text-emerald-300 border-emerald-400/50 scale-110' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                }`}>● LIVE</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchXLivePosts()}
                  className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/10 text-xs"
                  title="Refresh"
                >↻</button>
                <button
                  onClick={() => setXWidgetOpen(false)}
                  className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/10 text-xs"
                >✕</button>
              </div>
            </div>

            {/* Posts feed */}
            <div className="overflow-y-auto flex-1 divide-y divide-[#1e2d3d]">
              {xLivePosts.length === 0 ? (
                <div className="p-5 text-center">
                  <div className="inline-block w-4 h-4 border-2 border-zinc-600 border-t-blue-400 rounded-full animate-spin mb-2"></div>
                  <p className="text-[11px] text-zinc-500">Fetching live deals...</p>
                </div>
              ) : (
                xLivePosts.map((post: any, i: number) => (
                  <div key={post.deal_id ?? i} className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-default">
                    <div className="flex items-start gap-2.5">
                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-[9px] shrink-0 mt-0.5">
                        {(post.source_x_profile || 'X').charAt(1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-white font-bold text-[11px]">@{post.source_x_profile || 'AmazingCreditC'}</span>
                          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-blue-400 shrink-0"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81-0.67-1.31-1.91-2.19-3.34-2.19-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91 1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/></svg>
                          {post.discovered_at && (
                            <span className="text-zinc-600 text-[9px] ml-auto shrink-0">
                              {new Date(post.discovered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed line-clamp-2">
                          {post.deal_headline || post.raw_copied_text || 'New deal posted'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {post.target_merchant && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                              {post.target_merchant}
                            </span>
                          )}
                          {post.yield_pct > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                              post.yield_pct >= 10 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                              post.yield_pct >= 5 ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' :
                              'bg-amber-500/15 text-amber-400 border-amber-500/20'
                            }`}>
                              {post.yield_pct}% yield
                            </span>
                          )}
                          {post.coupon_code && post.coupon_code !== 'NOT_REQUIRED' && (
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {post.coupon_code}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[#1e2d3d] bg-black/30 flex items-center justify-between shrink-0">
              <span className="text-[9px] text-zinc-600">Polls every 30s</span>
              <a
                href="https://x.com/AmazingCreditC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >See all on X →</a>
            </div>
          </div>
        )}

        {/* Toggle pill button */}
        <button
          onClick={() => setXWidgetOpen(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg transition-all duration-200 ${
            xWidgetOpen
              ? 'bg-[#0f1419] border-[#1e2d3d] text-zinc-400 hover:text-white'
              : 'bg-[#0f1419] border-[#1e2d3d] text-white hover:border-blue-500/50'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span className="text-[11px] font-bold">Live Deals</span>
          {xLivePosts.length > 0 && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full transition-all ${
              xWidgetPulse ? 'bg-blue-500 text-white scale-110' : 'bg-zinc-800 text-zinc-400'
            }`}>{xLivePosts.length}</span>
          )}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>


      {/* AUTH MODAL */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
        onSuccess={(tk, em) => {
          setIsAuth(true);
          setEmail(em);
          setAuthModalOpen(false);
          fetchWalletInventory();
        }}
      />

      {/* EDIT CARD MODAL */}
      {editingCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Edit Card Details</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{editingCard.name}</p>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-7 space-y-4">
              {editMessage && (
                <div className={`text-xs font-semibold px-4 py-3 rounded-xl border ${
                  editMessage.startsWith('✓') 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {editMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    value={editCardholderName}
                    onChange={e => setEditCardholderName(e.target.value.toUpperCase())}
                    placeholder="AMBUJ TIWARI"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editLast4}
                    onChange={e => setEditLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="8824"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Card Network</label>
                  <select
                    value={editCardNetwork}
                    onChange={e => setEditCardNetwork(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Card Tier</label>
                  <select
                    value={editCardCategory}
                    onChange={e => setEditCardCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    <option>Titanium</option>
                    <option>Signature</option>
                    <option>Platinum</option>
                    <option>Gold</option>
                    <option>Infinite</option>
                    <option>World</option>
                    <option>Select</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Card Limit (₹)</label>
                <input
                  type="number"
                  value={editCardLimit}
                  onChange={e => setEditCardLimit(e.target.value)}
                  placeholder="100000"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingCard(null)}
                  className="flex-1 py-3 text-sm font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCardDetails}
                  disabled={editLoading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition-all disabled:opacity-70"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CardwiseDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-zinc-500 font-bold">Loading dashboard...</p>
      </div>
    }>
      <CardwiseDashboardContent />
    </Suspense>
  );
}
