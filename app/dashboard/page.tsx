'use client';

import React, { useState, useEffect } from 'react';

const bankRedemptionLinks: Record<string, { redeemUrl: string; multiplierUrl: string; portalName: string; multiplierName: string }> = {
  HDFC: {
    redeemUrl: "https://mycards.hdfcbank.com",
    multiplierUrl: "https://smartbuy.hdfcbank.com",
    portalName: "HDFC MyCards & Rewards Portal",
    multiplierName: "HDFC SmartBuy (10X Multipliers)"
  },
  SBI: {
    redeemUrl: "https://www.sbirewardz.com",
    multiplierUrl: "https://www.sbicard.com/en/personal/benefits/reward-points.page",
    portalName: "SBI Rewardz Loyalty Ledger",
    multiplierName: "SBI Card Milestones & Acceleration"
  },
  ICICI: {
    redeemUrl: "https://www.icicipoints.com",
    multiplierUrl: "https://www.icicibank.com/offers",
    portalName: "ICICI Rewards Catalog",
    multiplierName: "ICICI Bank Offers & Delights"
  },
  AXIS: {
    redeemUrl: "https://edge.axisbank.co.in",
    multiplierUrl: "https://grabdeals.axisbank.in",
    portalName: "Axis EDGE Rewards Portal",
    multiplierName: "Axis Grab Deals (10X Multiplier)"
  },
  IDFC: {
    redeemUrl: "https://rewardz.idfcfirstbank.com",
    multiplierUrl: "https://www.idfcfirstbank.com/credit-card/rewards",
    portalName: "IDFC First Rewardz Portal",
    multiplierName: "IDFC Credit Card Milestone Benefits"
  },
  INDUS: {
    redeemUrl: "https://www.indusmoments.com",
    multiplierUrl: "https://www.indusind.com/in/en/personal/cards/offers.html",
    portalName: "Indus Moments Travel Rewards Portal",
    multiplierName: "IndusInd Bank Card Offers"
  },
  AMEX: {
    redeemUrl: "https://www.americanexpress.com/in/rewards",
    multiplierUrl: "https://www.americanexpress.com/in/benefits/reward-multiplier",
    portalName: "Amex Membership Rewards Portal",
    multiplierName: "Amex Reward Multiplier (5X Points)"
  },
  KOTAK: {
    redeemUrl: "https://www.kotakrewardz.com",
    multiplierUrl: "https://www.kotak.com/en/offers.html",
    portalName: "Kotak Rewardz Portal",
    multiplierName: "Kotak Bank Card Offers & Deals"
  },
  YES: {
    redeemUrl: "https://www.yesrewardz.com",
    multiplierUrl: "https://www.yesbank.in/personal-banking/cards/offers",
    portalName: "Yes Rewardz Portal",
    multiplierName: "Yes Bank Offers & Promos"
  }
};

const getCardMockupStyle = (card: any) => {
  const bank = (card.bank_id || '').toUpperCase();
  const network = (card.card_network || '').toUpperCase();
  const cardId = (card.card_id || '').toLowerCase();
  
  // Defaults
  let bgColor = "#1e293b"; // Slate default solid
  let textColor = "text-white";
  let textMutedColor = "text-slate-400";
  let chipColor = "bg-gradient-to-br from-amber-400 to-yellow-600"; // Gold chip
  let cardBorder = "border-[#334155]";
  
  if (cardId.includes('infinia')) {
    // HDFC Infinia - Luxury Matte Black
    bgColor = "#0A0A0C";
    chipColor = "bg-gradient-to-br from-slate-400 to-slate-200"; // Silver chip
    cardBorder = "border-[#27272a]";
  } else if (cardId.includes('regalia')) {
    // HDFC Regalia - Black & Gold
    bgColor = "#141416";
    cardBorder = "border-[#3f3f46]/40";
  } else if (bank === 'HDFC') {
    // HDFC Solid Deep Blue
    bgColor = "#031C3C";
    cardBorder = "border-[#1E3A8A]/35";
  } else if (cardId.includes('aurum')) {
    // SBI Aurum - Obsidian Black Gold
    bgColor = "#060608";
    cardBorder = "border-amber-500/20";
  } else if (bank === 'SBI') {
    // SBI Sky Blue
    bgColor = "#005691";
    cardBorder = "border-[#0369a1]/40";
  } else if (cardId.includes('magnus')) {
    // Axis Magnus - Premium Burgundy Crimson
    bgColor = "#3B0515";
    cardBorder = "border-amber-500/20";
  } else if (cardId.includes('atlas')) {
    // Axis Atlas - Forest Teal
    bgColor = "#062E25";
    chipColor = "bg-gradient-to-br from-slate-400 to-slate-200";
    cardBorder = "border-teal-900/40";
  } else if (bank === 'AXIS') {
    // Axis Burgundy
    bgColor = "#4E0927";
    cardBorder = "border-pink-900/30";
  } else if (cardId.includes('emeralde')) {
    // ICICI Emeralde - Emerald Green
    bgColor = "#022B22";
    cardBorder = "border-emerald-900/30";
  } else if (cardId.includes('sapphiro')) {
    // ICICI Sapphiro - Sapphire Blue
    bgColor = "#0A1B3B";
    chipColor = "bg-gradient-to-br from-slate-400 to-slate-200";
    cardBorder = "border-blue-900/30";
  } else if (bank === 'ICICI') {
    // ICICI Corporate Blue/Orange
    bgColor = "#0E244B";
    cardBorder = "border-blue-900/20";
  } else if (cardId.includes('platinum') && bank === 'AMEX') {
    // Amex Platinum - Brushed Metal Silver/Platinum
    bgColor = "#E2E2E6";
    textColor = "text-[#1C1C1E]";
    textMutedColor = "text-slate-500";
    chipColor = "bg-gradient-to-br from-slate-400 to-slate-200";
    cardBorder = "border-slate-300";
  } else if (cardId.includes('gold') && bank === 'AMEX') {
    // Amex Gold - Classic Yellow Gold
    bgColor = "#E5B63D";
    textColor = "text-[#1C1C1E]";
    textMutedColor = "text-[#3A3010]";
    cardBorder = "border-amber-600/30";
  } else if (bank === 'AMEX') {
    // Amex Green
    bgColor = "#046A38";
    cardBorder = "border-emerald-800/30";
  } else if (cardId.includes('wealth')) {
    // IDFC Wealth - Premium Matte Charcoal
    bgColor = "#141416";
    cardBorder = "border-[#2E2E33]";
  } else if (bank === 'IDFC') {
    // IDFC Maroon
    bgColor = "#6B1D2F";
    cardBorder = "border-red-950/40";
  } else if (bank === 'INDUS') {
    // IndusInd Golden Brown
    bgColor = "#593108";
    cardBorder = "border-amber-900/30";
  } else if (bank === 'KOTAK') {
    // Kotak Deep Navy
    bgColor = "#0A1D37";
    cardBorder = "border-blue-950/40";
  } else if (bank === 'YES') {
    // Yes Bank Blue
    bgColor = "#053E77";
    cardBorder = "border-blue-800/30";
  } else if (network === 'RUPAY') {
    // RuPay Select Royal Indigo
    bgColor = "#171438";
    cardBorder = "border-indigo-900/40";
  }

  return {
    background: bgColor,
    textColor,
    textMutedColor,
    chipColor,
    glassBorder: cardBorder
  };
};

const renderNetworkLogo = (networkName: string) => {
  const net = (networkName || '').toUpperCase();
  if (net === 'VISA') {
    return (
      <span className="text-[10px] font-black italic tracking-widest text-white/90">
        <span className="text-amber-400">V</span>ISA
      </span>
    );
  }
  if (net === 'MASTERCARD' || net === 'MASTER') {
    return (
      <div className="flex items-center -space-x-1">
        <div className="w-3 h-3 rounded-full bg-rose-500/90"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500/90"></div>
      </div>
    );
  }
  if (net === 'RUPAY') {
    return (
      <span className="text-[10px] font-black italic tracking-tighter text-white/95 flex items-center">
        RuPay<span className="text-amber-400 font-bold ml-0.5">Select</span>
      </span>
    );
  }
  if (net === 'AMEX' || net === 'AMERICAN EXPRESS') {
    return (
      <span className="text-[8px] font-black px-1 py-0.5 bg-sky-600/90 text-white rounded font-sans tracking-tighter leading-none border border-sky-400/20">
        AMEX
      </span>
    );
  }
  return <span className="text-[8px] font-bold opacity-80 text-white/90">{net}</span>;
};

const getBoostedYield = (cardId: string, categoryMcc: string, baseYield: number) => {
  const cId = (cardId || '').toLowerCase();
  
  // HDFC Infinia
  if (cId.includes('infinia')) {
    if (categoryMcc === '4511') return { value: 16.67, trick: "5X SmartBuy Flights / Vouchers" };
    if (categoryMcc === '5812') return { value: 16.67, trick: "Gyftr Instant Vouchers (5X)" };
    if (categoryMcc === '5310') return { value: 16.67, trick: "Gyftr Instant Vouchers (5X)" };
    if (categoryMcc === 'DEFAULT') return { value: 16.67, trick: "Gyftr/SmartBuy Multiplier" };
    return { value: baseYield, trick: "Standard Base Rate" };
  }
  
  // HDFC Regalia
  if (cId.includes('regalia')) {
    if (categoryMcc === '4511') return { value: 6.67, trick: "5X SmartBuy Travel Multiplier" };
    if (categoryMcc === '5310') return { value: 6.67, trick: "SmartBuy Voucher Portal" };
    return { value: baseYield, trick: "Standard Base Rate" };
  }

  // Axis Atlas
  if (cId.includes('atlas')) {
    if (categoryMcc === '4511') return { value: 15.0, trick: "3X EdgeMiles (Transfer 1:2 Partner)" };
    if (categoryMcc === 'DEFAULT' || categoryMcc === '5310') return { value: 4.0, trick: "1:2 Airline/Hotel Partner Transfer" };
    return { value: baseYield * 2, trick: "1:2 Airline Partner Transfer" };
  }

  // Axis Magnus
  if (cId.includes('magnus')) {
    if (categoryMcc === 'DEFAULT') return { value: 4.8, trick: "5X Grab Deals Acceleration" };
    if (categoryMcc === '5310') return { value: 9.6, trick: "10X Grab Deals Shopping" };
    return { value: baseYield * 1.5, trick: "Grab Deals Offers" };
  }

  // Amex Platinum
  if (cId.includes('amex_platinum') || cId.includes('amex') || cId.includes('platinum')) {
    if (categoryMcc === '5310') return { value: 6.0, trick: "5X Reward Multiplier on Shopping" };
    if (categoryMcc === '4511') return { value: 6.0, trick: "5X Reward Multiplier on Travel" };
    return { value: baseYield * 3.0, trick: "Golden/Marriott 3:1 Points Transfer" };
  }

  // RuPay Select Cards
  if (cId.includes('rupay_select') || cId.includes('rupay')) {
    if (categoryMcc === 'DEFAULT' || categoryMcc === '5812') return { value: 8.5, trick: "Spa/Cab quarterly coupons value return" };
    return { value: baseYield + 4.0, trick: "Select Wellness platform perks" };
  }

  // General default fallback
  return { value: baseYield * 1.5, trick: "Milestone voucher achievements" };
};

export default function CardwiseDashboard() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [myWalletCards, setMyWalletCards] = useState<any[]>([]);
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

  // Card Details Modal States
  const [selectedDetailCard, setSelectedDetailCard] = useState<any>(null);
  const [selectedCardRules, setSelectedCardRules] = useState<any[]>([]);
  const [rulesDetailsLoading, setRulesDetailsLoading] = useState(false);
  const [showBoostedRewards, setShowBoostedRewards] = useState(false);

  // Fetch user's active wallet
  const fetchWalletInventory = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/user/portfolio/list?user_id=${CURRENT_USER_ID}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMyWalletCards(data);
        if (data.length > 0) {
          setVacationCard(data[0].card_id);
        }
      } else {
        setMyWalletCards([]);
      }
    } catch (error) {
      console.error("Failed to fetch wallet inventory:", error);
    }
  };

  const fetchCardDetails = async (card: any) => {
    setSelectedDetailCard(card);
    setRulesDetailsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/v1/cards/rules?card_id=" + card.card_id);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSelectedCardRules(data);
      } else {
        setSelectedCardRules([]);
      }
    } catch (error) {
      console.error("Failed to fetch detailed card rules:", error);
      setSelectedCardRules([]);
    } finally {
      setRulesDetailsLoading(false);
    }
  };

  const calculateCardSpendRouting = (cardId: string) => {
    const spendCategories = [
      { key: "spend_dining_inr", label: "Dining & Food Delivery", mcc: "5812", stateVal: spendDining },
      { key: "spend_grocery_inr", label: "Grocery & Supermarket", mcc: "5411", stateVal: spendGrocery },
      { key: "spend_shopping_inr", label: "Retail & Online Shopping", mcc: "5310", stateVal: spendShopping },
      { key: "spend_utilities_inr", label: "Utilities & Bills", mcc: "4900", stateVal: spendUtilities },
      { key: "spend_travel_inr", label: "Flights & Hotel Travel", mcc: "4511", stateVal: spendTravel },
      { key: "spend_fuel_inr", label: "Fuel & Transport", mcc: "5541", stateVal: spendFuel },
      { key: "spend_insurance_inr", label: "Insurance Premium", mcc: "6300", stateVal: spendInsurance },
      { key: "spend_rent_inr", label: "Rent Payments", mcc: "6552", stateVal: spendRent },
      { key: "spend_others_inr", label: "Miscellaneous / Others", mcc: "DEFAULT", stateVal: spendOthers }
    ];

    const routedCategories = [];
    let totalRoutedSpend = 0;
    let totalRoutedRewards = 0;

    for (const cat of spendCategories) {
      const monthlySpendVal = parseFloat(cat.stateVal) || 0;
      if (monthlySpendVal <= 0) continue;

      let winningCardId = "";
      let bestYield = -1;

      for (const card of myWalletCards) {
        const cardRules = masterRules.filter(r => r.card_id === card.card_id);
        const rule = cardRules.find(r => r.mcc_code === cat.mcc) || cardRules.find(r => r.mcc_code === 'DEFAULT');

        let pointValuation = rule ? rule.point_to_inr_valuation : 1.0;
        if (profileGoal === 'CASHBACK') {
          if (card.card_id === 'in_hdfc_infinia_metal') pointValuation = 0.50;
          else if (card.card_id === 'in_hdfc_regalia_gold') pointValuation = 0.20;
          else if (card.card_id === 'in_axis_atlas_credit') pointValuation = 0.50;
          else if (card.card_id === 'in_axis_magnus_credit') pointValuation = 0.10;
          else if (card.card_id.toLowerCase().includes('amex') || card.bank_id === 'AMEX') pointValuation = 0.20;
        } else if (profileGoal === 'AIRMILES') {
          if (card.card_id === 'in_axis_atlas_credit') pointValuation = 2.0;
        }

        const yieldPct = rule ? (rule.base_reward_percentage * pointValuation) : 0.5;
        if (yieldPct > bestYield) {
          bestYield = yieldPct;
          winningCardId = card.card_id;
        }
      }

      if (winningCardId === cardId) {
        const catRewards = (monthlySpendVal * bestYield) / 100;
        routedCategories.push({
          label: cat.label,
          spend: monthlySpendVal,
          yieldPct: parseFloat(bestYield.toFixed(2)),
          rewards: parseFloat(catRewards.toFixed(2))
        });
        totalRoutedSpend += monthlySpendVal;
        totalRoutedRewards += catRewards;
      }
    }

    return {
      routedCategories,
      totalRoutedSpend,
      totalRoutedRewards
    };
  };

  // Fetch all master rules for redemption matrix
  const fetchMasterRules = async () => {
    setRulesLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/cards/rules');
      const data = await response.json();
      if (Array.isArray(data)) {
        setMasterRules(data);
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
        fetch('http://localhost:3000/api/v1/deals/top-picks'),
        fetch('http://localhost:3000/api/v1/deals/structured'),
      ]);
      const topData = await topRes.json();
      const structData = await structRes.json();
      if (Array.isArray(topData)) setTopPicks(topData);
      if (structData.deals) setStructuredDeals(structData);
      setFeedCountdown(240);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    } finally {
      if (!silent) setDealsLoading(false);
    }
  };

  const fetchFilteredDeals = async (category: string, cardType: string) => {
    try {
      const params = new URLSearchParams();
      if (category !== 'ALL') params.set('category', category);
      if (cardType !== 'ALL') params.set('card_type', cardType);
      const res = await fetch(`http://localhost:3000/api/v1/deals/structured?${params.toString()}`);
      const data = await res.json();
      if (data.deals) setStructuredDeals(data);
    } catch (e) {
      console.error('Filter fetch error:', e);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/user/profile?user_id=${CURRENT_USER_ID}`);
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
        
        // Auto-run audit calculations immediately once profile details are loaded
        setTimeout(() => {
          runProfileAudit();
        }, 100);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const saveUserProfile = async () => {
    setProfileLoading(true);
    setProfileMessage('');
    try {
      const res = await fetch('http://localhost:3000/api/v1/user/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const data = await res.json();
      if (data.success) {
        setProfileMessage("Financial Profile successfully updated in database!");
        // Re-trigger wallet optimization audit to refresh score & suggestions
        runProfileAudit();
        setTimeout(() => setProfileMessage(''), 5000);
      } else {
        setProfileMessage(`Failed to save: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      setProfileMessage("Network error saving profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const runProfileAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/user/profile/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: CURRENT_USER_ID })
      });
      const data = await res.json();
      if (data && !data.error) {
        setAuditResult(data);
      }
    } catch (err) {
      console.error("Failed to run profile audit:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Fetch live X deal posts for mini widget
  const fetchXLivePosts = async (silent = false) => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/deals/feed');
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
      // silently ignore if backend not ready
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
        const response = await fetch('http://localhost:3000/api/v1/engine/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkout_domain: p.domain,
            raw_prompt: '1000',
            user_id: CURRENT_USER_ID
          })
        });
        const result = await response.json();
        if (result.recommendations && result.recommendations.length > 0) {
          yieldsMap[p.name] = result.recommendations[0];
        } else {
          yieldsMap[p.name] = { display_label: 'No active card recommended', yield_percentage: 0 };
        }
      } catch (error) {
        console.error(`Failed to evaluate partner ${p.name}:`, error);
      }
    }

    setPartnerYields(yieldsMap);
  };

  const runPartnerAnalysis = async (partnerName: string, domain: string) => {
    setSelectedPartnerForAnalysis(partnerName);
    try {
      const response = await fetch('http://localhost:3000/api/v1/engine/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkout_domain: domain,
          raw_prompt: '1000',
          user_id: CURRENT_USER_ID
        })
      });
      const result = await response.json();
      if (result.recommendations) {
        setPartnerAnalysisResults(result.recommendations);
      } else {
        setPartnerAnalysisResults([]);
      }
    } catch (error) {
      console.error("Partner analysis error:", error);
      setPartnerAnalysisResults([]);
    }
  };

  // Simulated browser extension checkout query
  const runExtensionSimulation = async () => {
    if (!extDomain) return;
    setExtLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/engine/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkout_domain: extDomain,
          raw_prompt: extAmount,
          user_id: CURRENT_USER_ID
        })
      });
      const data = await response.json();
      setExtResult(data);
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
      const response = await fetch(`http://localhost:3000/api/v1/cards/search?query=${val}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setWidgetSearchResults(data);
      } else {
        setWidgetSearchResults([]);
      }
    } catch (e) {
      console.error(e);
      setWidgetSearchResults([]);
    }
  };

  // Add Card to User Portfolio
  const addCardToPortfolio = async (cardId: string, cardName: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: CURRENT_USER_ID,
          card_id: cardId
        })
      });
      const data = await response.json();
      if (data.success) {
        setWidgetMessage(`Successfully provisioned ${cardName}!`);
        setWidgetSearchQuery('');
        setWidgetSearchResults([]);
        fetchWalletInventory();
        setTimeout(() => setWidgetMessage(''), 4000);
      } else {
        setWidgetMessage(`Failed to provision: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      setWidgetMessage("Failed to contact the backend server.");
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
      const response = await fetch('http://localhost:3000/api/v1/engine/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  const totalSpends = (Number(spendDining) || 0) + (Number(spendGrocery) || 0) + (Number(spendShopping) || 0) + (Number(spendUtilities) || 0) + (Number(spendTravel) || 0) + (Number(spendFuel) || 0) + (Number(spendInsurance) || 0) + (Number(spendRent) || 0) + (Number(spendOthers) || 0) || 1;


  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans antialiased flex">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <div className="w-64 bg-white border-r border-[#E2E8F0] p-6 flex flex-col justify-between shadow-[2px_0_12px_rgba(0,0,0,0.015)]">
        <div>
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-500/10">C</div>
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">cardwise.</span>
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
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-100/50 shadow-sm font-semibold' 
                    : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
          <p className="text-xs font-semibold text-[#0F172A]">Team: 2 Engineers</p>
          <span className="text-[10px] text-[#64748B] block mt-0.5">V1.0.0 Stable Ready</span>
        </div>
      </div>

      {/* DYNAMIC VIEWS CONTROLLER AREA */}
      <div className="flex-1 p-10 overflow-y-auto relative">
        {/* Spectral glow orbs for ambient background */}
        <div className="spectral-glow w-[500px] h-[500px] -top-40 -right-40 fixed" />
        <div className="spectral-glow-sm w-[400px] h-[400px] top-1/2 -left-60 fixed" />
        
        {/* TAB 1: TRY EXTENSION PREVIEW */}
        {activeTab === 'extension' && (
          <div className="max-w-4xl space-y-6 relative z-10 anim-fade-in-up">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter text-[#0F172A]">Try Browser Extension</h2>
                <p className="text-sm text-[#64748B] mt-1">Simulate live optimization on checkout gateways with your active wallet.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="glass-pane p-8 rounded-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B]">Simulator Inputs</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Target Checkout Domain</label>
                  <input 
                    type="text"
                    value={extDomain}
                    onChange={(e) => setExtDomain(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-sm"
                    placeholder="e.g. zomato.com"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['amazon.in', 'zomato.com', 'swiggy.com', 'billdesk.com', 'government.gov.in'].map((dom) => (
                      <button 
                        key={dom}
                        onClick={() => setExtDomain(dom)}
                        className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors border border-slate-200"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Transaction Value (INR)</label>
                  <input 
                    type="number"
                    value={extAmount}
                    onChange={(e) => setExtAmount(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-sm"
                    placeholder="e.g. 1500"
                  />
                </div>

                <button 
                  onClick={runExtensionSimulation}
                  disabled={extLoading}
                  className="w-full btn-spectral text-xs py-3 rounded-xl"
                >
                  {extLoading ? 'EVALUATING ROUTING...' : 'RUN SIMULATOR'}
                </button>
              </div>

              {/* Visual Browser Shadow DOM Mockup */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">💡 LIVE OVERLAY SHADOW DOM</span>
                    <span className="text-[9px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-2 py-0.5 rounded-full">INJECTED</span>
                  </div>

                  <p className="text-xs text-[#64748B] uppercase font-bold tracking-wider">Checkout Total</p>
                  <p className="text-3xl font-black mt-1 text-[#0F172A]">₹{(parseFloat(extAmount) || 0).toLocaleString('en-IN')}</p>

                  <div className="mt-6 border-t border-slate-200 pt-4 space-y-3">
                    {extResult ? (
                      extResult.recommendations && extResult.recommendations.length > 0 ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              {extResult.recommendations[0].action_badge}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              Yield: {extResult.recommendations[0].yield_percentage}% Net
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-bold text-[#0F172A]">
                            💳 Use your <span className="text-indigo-400">{extResult.recommendations[0].display_label}</span>
                          </p>
                          <p className="text-xs font-semibold text-green-600 mt-1">
                            Save ₹{extResult.recommendations[0].calculated_savings_inr.toLocaleString('en-IN')} instantly!
                          </p>
                          {extResult.recommendations[0].gimmick_alert && (
                            <p className="text-xs text-[#64748B] italic mt-2 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                              {extResult.recommendations[0].gimmick_alert}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                          ⚠️ No cards in your portfolio match this MCC category or your portfolio is empty.
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-[#64748B] italic">Configure merchant values and hit Run Simulator to verify optimal routing logic.</p>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-[#64748B] text-right mt-4">
                  Routing MCC Code: <span className="font-bold text-[#64748B]">{extResult ? extResult.mcc_identified : 'None'}</span>
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
                <p className="text-sm text-[#64748B] mt-1">Configure your spending habits and reward preferences to audit your wallet card combination.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Config Form */}
              <div className="lg:col-span-2 glass-pane p-8 rounded-2xl space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-bold text-[#0F172A]">Demographics & Reward Preferences</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Used by our optimization engine to match card fee thresholds and target reward structures.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">User Age</label>
                    <input 
                      type="number"
                      value={profileAge}
                      onChange={(e) => setProfileAge(e.target.value)}
                      className="w-full glass-input rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Annual Income (INR)</label>
                    <input 
                      type="number"
                      value={profileIncome}
                      onChange={(e) => setProfileIncome(e.target.value)}
                      className="w-full glass-input rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Primary Reward Goal</label>
                    <select
                      value={profileGoal}
                      onChange={(e) => setProfileGoal(e.target.value)}
                      className="w-full glass-input rounded-xl p-3 text-sm font-medium"
                    >
                      <option value="MAX_YIELD" className="bg-white text-[#0F172A]">Maximize Net Yield (Recommended)</option>
                      <option value="CASHBACK" className="bg-white text-[#0F172A]">Direct CashBack/Statement Credit</option>
                      <option value="AIRMILES" className="bg-white text-[#0F172A]">Frequent Flyer / Airmiles</option>
                      <option value="HOTEL_POINTS" className="bg-white text-[#0F172A]">Hotel Loyalty Points</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">Category-Wise Average Monthly Spends</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Please provide realistic monthly estimate levels in INR.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">🍔 Dining & Food Delivery</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendDining) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendDining}
                        onChange={(e) => setSpendDining(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendDining) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">🛒 Grocery & Supermarket</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendGrocery) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendGrocery}
                        onChange={(e) => setSpendGrocery(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendGrocery) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">🛍️ Retail & Online Shopping</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendShopping) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendShopping}
                        onChange={(e) => setSpendShopping(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendShopping) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">⚡ Utilities & Bill Payments</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendUtilities) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendUtilities}
                        onChange={(e) => setSpendUtilities(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendUtilities) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">✈️ Flights & Hotel Travel</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendTravel) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendTravel}
                        onChange={(e) => setSpendTravel(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendTravel) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">⛽ Fuel & Transport</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendFuel) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendFuel}
                        onChange={(e) => setSpendFuel(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendFuel) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">🛡️ Insurance Premium</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendInsurance) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendInsurance}
                        onChange={(e) => setSpendInsurance(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendInsurance) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">🏠 Rent Payments</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendRent) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendRent}
                        onChange={(e) => setSpendRent(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendRent) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">☕ Miscellaneous / Others</label>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round(((Number(spendOthers) || 0) / totalSpends) * 100)}% weight
                        </span>
                      </div>
                      <input 
                        type="number"
                        value={spendOthers}
                        onChange={(e) => setSpendOthers(e.target.value)}
                        className="w-full glass-input rounded-xl p-3 text-sm shadow-inner"
                      />
                      <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(((Number(spendOthers) || 0) / totalSpends) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                  <button 
                    onClick={saveUserProfile}
                    disabled={profileLoading}
                    className="btn-spectral text-xs px-6 py-3.5 rounded-xl"
                  >
                    {profileLoading ? "SAVING PROFILE..." : "SAVE FINANCIAL PROFILE"}
                  </button>
                  {profileMessage && (
                    <span className="text-xs text-emerald-400 font-semibold">{profileMessage}</span>
                  )}
                </div>
              </div>

              {/* AI Wallet Optimization Audit Side Dashboard */}
              <div className="space-y-6">
                <div className="glass-pane p-8 rounded-2xl shadow-glow space-y-6 relative overflow-hidden">
                  <div className="spectral-glow-sm w-[200px] h-[200px] -top-20 -right-20" />
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-indigo-400 font-black">AI Orchestrated Optimization</label>
                    <h3 className="text-lg font-bold text-[#0F172A]">Wallet Audit Dashboard</h3>
                    <p className="text-[#64748B] text-[11px] leading-relaxed">Run the core optimization algorithm to verify leaks and request new instrument provision upgrades.</p>
                  </div>

                  <button 
                    onClick={runProfileAudit}
                    disabled={auditLoading}
                    className="w-full btn-spectral text-xs py-3.5 rounded-xl relative z-10"
                  >
                    {auditLoading ? "SIMULATING REWARDS..." : "RUN AI WALLET AUDIT"}
                  </button>
                </div>

                {auditResult && (
                  <div className="glass-pane p-6 rounded-2xl space-y-6">
                    
                    {/* Optimization Score */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Optimization Score</h4>
                        <span className="text-[10px] text-[#64748B]">Current vs Max Possible yield</span>
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
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Current Rewards</span>
                        <span className="text-base font-bold text-[#0F172A]">₹{Math.round(auditResult.current_annual_rewards).toLocaleString('en-IN')}<span className="text-[10px] text-[#64748B]">/yr</span></span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Optimal Yield</span>
                        <span className="text-base font-bold text-[#0F172A]">₹{Math.round(auditResult.optimal_annual_rewards).toLocaleString('en-IN')}<span className="text-[10px] text-[#64748B]">/yr</span></span>
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
                        <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Top Recommended Additions</h4>
                        <div className="space-y-2">
                          {auditResult.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block leading-none mb-1">{rec.bank_id}</span>
                                <span className="text-xs font-bold text-[#0F172A] block">{rec.card_name}</span>
                                <span className="text-[10px] text-[#64748B]">Target: {rec.target_categories.join(', ')}</span>
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
                      <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl p-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider block text-indigo-400 font-bold">AI Portfolio Review</span>
                        <div className="text-xs leading-relaxed text-[#64748B] font-medium space-y-1.5 whitespace-pre-line">
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
                <p className="text-sm text-[#64748B] mt-1">Manually provision and review your card inventory tracks.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Quick Provisioning Widget Box */}
            <div className="glass-pane p-6 rounded-2xl">
              <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-bold mb-3">
                ➕ PROVISION NEW ASSET TO PORTFOLIO
              </h3>
              
              <div className="relative">
                <input 
                  type="text"
                  value={widgetSearchQuery}
                  onChange={(e) => handleWidgetCardSearch(e.target.value)}
                  placeholder="Enter Bank or Variant Name (e.g. SBI, HDFC)..."
                  className="w-full glass-input rounded-xl p-3 text-sm"
                />

                {widgetSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-10 max-h-60 overflow-y-auto">
                    {widgetSearchResults.map((card: any) => (
                      <div 
                        key={card.card_id}
                        onClick={() => addCardToPortfolio(card.card_id, card.card_name)}
                        className="p-4 border-b border-slate-200/50 hover:bg-slate-50/50 cursor-pointer flex justify-between items-center transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div>
                          <span className="text-xs uppercase tracking-wide font-bold text-[#64748B]">{card.bank_id}</span>
                          <h4 className="text-sm font-bold text-[#0F172A]">{card.card_name}</h4>
                        </div>
                        <button className="btn-spectral text-xs font-bold px-3 py-1.5 rounded-lg">
                          + Provision
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {widgetMessage && (
                <div className="mt-3 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 p-2.5 rounded-xl">
                  {widgetMessage}
                </div>
              )}
            </div>

            {/* Wallet deck list */}
            {myWalletCards.length === 0 ? (
              <div className="bg-slate-50/50 border border-dashed border-slate-200 p-12 rounded-2xl text-center text-sm text-[#64748B]">
                NO ASSETS CURRENTLY PROVISIONED IN WALLET. USE THE SEARCH BLOCK ABOVE TO MOUNT CARDS.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myWalletCards.map((card: any) => {
                  const mockup = getCardMockupStyle(card);
                  return (
                    <div 
                      key={card.wallet_entry_id} 
                      onClick={() => fetchCardDetails(card)}
                      style={{ 
                        backgroundColor: mockup.background,
                        boxShadow: "0 8px 20px -6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      }}
                      className={`p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border ${mockup.glassBorder}`}
                    >

                      {/* Card Top: Bank name and Network logo */}
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <span className={`text-[11px] font-black tracking-widest uppercase block ${mockup.textColor}`}>
                            {card.bank_id}
                          </span>
                          <span className={`font-mono text-[8px] tracking-widest uppercase block opacity-75 ${mockup.textMutedColor}`}>
                            {card.card_type === 'DEBIT' ? 'DEBIT' : card.card_type === 'FOREX' ? 'FOREX' : 'CREDIT'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* EMV chip representation */}
                          <div className={`w-6 h-4.5 rounded-md relative overflow-hidden flex flex-col justify-between p-0.5 border border-black/10 ${mockup.chipColor}`}>
                            <div className="border-b border-black/10 h-[30%]" />
                            <div className="border-b border-black/10 h-[30%] flex justify-between">
                              <div className="border-r border-black/10 w-[30%]" />
                              <div className="border-l border-black/10 w-[30%]" />
                            </div>
                            <div className="h-[30%]" />
                          </div>
                        </div>
                      </div>

                      {/* Card Center: Card Name */}
                      <div className="z-10 my-1">
                        <h4 className={`text-sm md:text-base font-extrabold tracking-tight leading-tight drop-shadow-sm line-clamp-1 ${mockup.textColor}`}>
                          {card.card_name}
                        </h4>
                        <div className={`font-mono text-[9px] md:text-[10px] tracking-[0.25em] opacity-80 mt-1.5 ${mockup.textMutedColor}`}>
                          •••• •••• •••• 8824
                        </div>
                      </div>

                      {/* Card Bottom: Holder Name & Network logo */}
                      <div className="flex justify-between items-end z-10 border-t border-white/10 pt-2.5">
                        <div>
                          <span className={`font-mono text-[8px] tracking-wider uppercase block opacity-60 ${mockup.textMutedColor}`}>
                            CARDHOLDER
                          </span>
                          <span className={`font-mono text-[9px] md:text-[10px] font-bold tracking-widest ${mockup.textColor}`}>
                            AMBUJ TIWARI
                          </span>
                        </div>
                        <div>
                          {renderNetworkLogo(card.card_network)}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                <p className="text-sm text-[#64748B] mt-1">Top-yielding credit cards ranked by online brand portals in your portfolio.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-pane rounded-2xl overflow-hidden shadow-sm">
              <div className="border-b border-[#E2E8F0] p-6 bg-slate-50/50">
                <h3 className="text-base font-bold text-[#0F172A]">Direct Brand Partner Matrix</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Compare live transaction yields for major online shopping, food delivery, and flight booking portals.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      <th className="p-4 pl-6">Merchant Partner</th>
                      <th className="p-4">Best Card Match</th>
                      <th className="p-4 text-center">Net Yield</th>
                      <th className="p-4 text-right pr-6">Dynamic Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] bg-white">
                    {[
                      { name: 'Amazon.in Spends', domain: 'amazon.in', logo: 'A', bg: 'bg-amber-50 text-amber-600' },
                      { name: 'Zomato & Swiggy Delivery', domain: 'zomato.com', logo: 'Z', bg: 'bg-red-50 text-red-600' },
                      { name: 'Flipkart Retail', domain: 'flipkart.com', logo: 'F', bg: 'bg-blue-50 text-blue-600' }
                    ].map((shop) => {
                      const optimal = partnerYields[shop.name];
                      return (
                        <tr key={shop.name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${shop.bg}`}>{shop.logo}</div>
                              <span className="font-bold text-[#0F172A]">{shop.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {optimal ? (
                              <span className="font-semibold text-[#0F172A] bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg text-xs">
                                {optimal.display_label || 'None'}
                              </span>
                            ) : (
                              <span className="text-xs text-[#64748B] italic">No cards added</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {optimal ? (
                              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                {optimal.yield_percentage || optimal.yield_percentage === 0 ? optimal.yield_percentage : 0}%
                              </span>
                            ) : (
                              <span className="text-xs text-[#64748B]">—</span>
                            )}
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button 
                              onClick={() => runPartnerAnalysis(shop.name, shop.domain)}
                              className="bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
                            >
                              Analyze Matrix
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

              {/* Side Analysis Results View */}
              <div className="glass-pane p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-bold mb-4">
                    🔍 MATRIX ANALYSIS: {selectedPartnerForAnalysis || 'None Selected'}
                  </h3>
                  
                  {selectedPartnerForAnalysis ? (
                    partnerAnalysisResults.length > 0 ? (
                      <div className="space-y-3">
                        {partnerAnalysisResults.map((rec) => (
                          <div key={rec.card_id} className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#64748B]">#{rec.rank}</span>
                                <h4 className="text-sm font-bold text-[#0F172A]">{rec.display_label}</h4>
                              </div>
                              {rec.gimmick_alert && (
                                <p className="text-[10px] text-amber-400 mt-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{rec.gimmick_alert}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-indigo-400 block">{rec.yield_percentage}%</span>
                              <span className="text-[10px] text-[#64748B] block">Net Yield</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#64748B] italic">No recommendations calculated. Add cards to your active portfolio ledger to match rules.</p>
                    )
                  ) : (
                    <p className="text-xs text-[#64748B] italic">Click "Analyze Matrix" on any direct brand partner to compute the dynamic yielding comparison tier lists.</p>
                  )}
                </div>

                {selectedPartnerForAnalysis && (
                  <div className="text-[10px] text-[#64748B] border-t border-slate-200 pt-3 mt-4">
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
                <p className="text-sm text-[#64748B] mt-1">Convert raw reward ledger points to true fractional INR values directly from rules database.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="glass-pane rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-bold">ACTIVE DATABASE EXTRAPOLATION RULES</h3>
              </div>

              {rulesLoading ? (
                <div className="p-8 text-center text-sm text-[#64748B]">Loading rules ledger...</div>
              ) : masterRules.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#64748B]">No database rules found. Seed your database.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                        <th className="p-4 pl-6">Card Variant</th>
                        <th className="p-4">Category MCC</th>
                        <th className="p-4 text-center">Base Yield</th>
                        <th className="p-4 text-right pr-6">INR Valuation / Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {masterRules.map((rule) => {
                        const isExcl = rule.is_completely_excluded === 1 || rule.is_completely_excluded === true;
                        return (
                          <React.Fragment key={rule.rule_id}>
                            <tr className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 pl-6 font-bold text-[#0F172A]">
                                {rule.card_name} <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md font-medium text-[#64748B] uppercase ml-2">{rule.card_type}</span>
                              </td>
                              <td className="p-4 text-[#64748B] font-mono text-xs">{rule.mcc_code}</td>
                              <td className="p-4 text-center">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isExcl ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                  {isExcl ? 'EXCLUDED' : `${rule.base_reward_percentage}%`}
                                </span>
                              </td>
                              <td className="p-4 text-right pr-6 font-mono font-bold text-[#0F172A]">
                                ₹{rule.point_to_inr_valuation.toFixed(2)}
                              </td>
                            </tr>
                            {rule.gimmick_warning_text && (
                              <tr>
                                <td colSpan={4} className="p-3 pl-6 bg-amber-50/50 border-t border-b border-amber-100/50">
                                  <div className="text-[11px] text-amber-800 flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span className="font-medium">Gimmick Warning: {rule.gimmick_warning_text}</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
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
                <p className="text-sm text-[#64748B] mt-1">Input target transaction metadata for instant evaluation tracking.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="glass-pane p-8 rounded-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Natural Language Transaction Prompt</label>
                <textarea 
                  value={aiPromptString}
                  onChange={(e) => setAiPromptString(e.target.value)}
                  placeholder="Ex: Ordering dinner on Zomato for Rs 1250..."
                  className="w-full glass-input text-sm p-4 rounded-xl h-24 resize-none"
                />
              </div>

              <button 
                onClick={runEngineEvaluation}
                className="btn-spectral text-xs px-6 py-3.5 rounded-xl"
              >
                ANALYZE TRANSACTION PROMPT
              </button>

              {parsedResultPayload && (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex gap-4 text-xs font-semibold text-[#64748B]">
                    <div>CATEGORY DETECTED: <span className="text-indigo-400 font-bold">{parsedResultPayload.parsed_category}</span></div>
                    <div>AMOUNT EXTRACTED: <span className="text-[#0F172A] font-bold">₹{parsedResultPayload.extracted_amount}</span></div>
                  </div>

                  {parsedResultPayload.personalized_tip && (
                    <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl p-4 text-xs leading-relaxed font-medium">
                      💡 <span className="font-bold">Smart Tip:</span> {parsedResultPayload.personalized_tip}
                    </div>
                  )}

                  <div className="space-y-3">
                    {parsedResultPayload.sorted_results.map((rec: any, idx: number) => (
                      <div key={idx} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl flex justify-between items-center shadow-sm relative overflow-hidden">
                        {idx === 0 && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600" />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">Rank #{idx + 1}</span>
                            <span className="text-sm font-bold text-[#0F172A]">{rec.card_name}</span>
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-[#64748B] px-1.5 py-0.2 rounded-md font-medium uppercase">{rec.card_type}</span>
                          </div>
                          {rec.warning_flag && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg font-medium mt-1 flex items-center gap-1.5">
                              <span>⚠️</span> {rec.warning_flag}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">+{rec.reward_yield_pct}% Yield</span>
                          {rec.net_savings_inr > 0 && (
                            <span className="text-xs text-[#64748B] font-bold block mt-1.5">Saves ₹{rec.net_savings_inr}</span>
                          )}
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
                <p className="text-sm text-[#64748B] mt-1">Optimize point transfers to premium airline networks and hotel programs.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Mileage Calculator */}
              <div className="glass-pane p-6 rounded-2xl col-span-1 space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-bold">MILAGE TRANSFER CALCULATOR</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Select Active Portfolio Card</label>
                  <select 
                    value={vacationCard} 
                    onChange={(e) => setVacationCard(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-sm"
                  >
                    {myWalletCards.map(c => (
                      <option key={c.card_id} value={c.card_id}>{c.card_name}</option>
                    ))}
                    {myWalletCards.length === 0 && <option value="">No active cards</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Card Points Quantity</label>
                  <input 
                    type="number"
                    value={vacationPoints}
                    onChange={(e) => setVacationPoints(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Destination Partner</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setVacationPartner('avios')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${vacationPartner === 'avios' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'}`}
                    >
                      Avios (Airline)
                    </button>
                    <button 
                      onClick={() => setVacationPartner('all')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${vacationPartner === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'}`}
                    >
                      Accor ALL (Hotel)
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-[#64748B]">
                    <span>ESTIMATED TRANSFER MILES:</span>
                    <span className="text-sm font-bold text-[#0F172A] font-mono">{conversion.miles.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-[#64748B]">
                    <span>CASH EQUIVALENT VALUATION:</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">~₹{conversion.value.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-[#64748B] leading-relaxed">
                      {conversion.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partners list cards */}
              <div className="col-span-2 space-y-6">
                <div className="glass-pane p-6 rounded-2xl">
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-1 rounded-md uppercase">Hotel Network Partner</span>
                  <h4 className="text-lg font-bold mt-2 text-[#0F172A]">Accor Live Limitless (ALL)</h4>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Transfer Rate: 2,000 Edge Points = 1,000 ALL Points (Value: ~₹1,800 hotel credit). 
                    Accor Hotels (e.g. Novotel, Pullman, Sofitel, Ibis) offers excellent point redemption rates in India and Europe at approximately ₹1.80 per point.
                  </p>
                </div>
                <div className="glass-pane p-6 rounded-2xl">
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold px-2.5 py-1 rounded-md uppercase">Airline Network Partner</span>
                  <h4 className="text-lg font-bold mt-2 text-[#0F172A]">Avios Mileage Transfer</h4>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
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
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Explore Card Offers</h2>
                <p className="text-sm text-[#64748B] mt-1">Best credit & debit card deals curated from India's top fintech creators. Auto-refreshes every 4 min.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={() => fetchDealsFeed()}
                  disabled={dealsLoading}
                  className="bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 text-[#0F172A] text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  {dealsLoading ? 'Refreshing...' : '↻ Refresh'}
                </button>
              </div>
            </div>


            {/* ── LIVE DEALS HEADER NOTE ── */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-slate-200 backdrop-blur-xl rounded-2xl px-5 py-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <p className="text-[11px] text-[#64748B]">
                Live deal feed from <span className="text-[#0F172A] font-bold">@AmazingCreditC</span> & top Indian fintech creators — see the <span className="text-indigo-400 font-semibold">mini X widget</span> at the bottom-right for real-time posts.
              </p>
              <a href="https://x.com/AmazingCreditC" target="_blank" rel="noopener noreferrer"
                className="ml-auto shrink-0 flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Open on X ↗
              </a>
            </div>


            {/* ── TOP 10 BEST OFFERS LEADERBOARD ── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center text-amber-900 font-black text-sm">★</div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Top 10 Best Offers</h3>
                  <p className="text-[11px] text-[#64748B]">Highest value picks curated from all creators, sorted by cashback yield</p>
                </div>
              </div>

              {topPicks.length === 0 ? (
                <div className="glass-pane border-dashed rounded-2xl p-8 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-[#64748B]">Loading top picks...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPicks.map((deal: any, idx: number) => (
                    <div
                      key={deal.deal_id}
                      className="glass-pane-hover rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Rank badge */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        idx === 0 ? 'bg-amber-500/10 text-amber-700 border-amber-200' :
                        idx === 1 ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        idx === 2 ? 'bg-orange-500/10 text-orange-700 border-orange-200' :
                        'bg-slate-50 text-[#64748B] border-slate-100'
                      }`}>
                        #{idx + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">{deal.source_x_profile}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            deal.card_type === 'FOREX' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            deal.card_type === 'DEBIT' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>{deal.card_type}</span>
                          <span className="text-[10px] font-semibold text-[#64748B] capitalize">{(deal.deal_category || '').toLowerCase().replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A] leading-snug truncate">{deal.deal_headline.replace(/^🔥 TOP PICK: /, '')}</p>
                      </div>

                      {/* Yield badge */}
                      <div className="shrink-0 text-right">
                        <div className={`text-lg font-black ${
                          deal.yield_pct >= 10 ? 'text-emerald-600' :
                          deal.yield_pct >= 5 ? 'text-indigo-400' :
                          deal.yield_pct >= 2 ? 'text-amber-600' : 'text-[#64748B]'
                        }`}>{deal.yield_pct}%</div>
                        <div className="text-[10px] text-[#64748B] font-medium">yield</div>
                      </div>

                      {/* Coupon copy */}
                      {deal.coupon_code !== 'NOT_REQUIRED' && (
                        <div className="shrink-0">
                          <button
                            onClick={() => { navigator.clipboard.writeText(deal.coupon_code); setCopiedDealId(deal.deal_id); setTimeout(()=>setCopiedDealId(null),2000); }}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                              copiedDealId === deal.deal_id ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white border border-slate-200 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
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
                  <h3 className="text-base font-bold text-[#0F172A]">All Active Deals</h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{structuredDeals.total} deals across {structuredDeals.categories.length} categories</p>
                </div>

                {/* Card Type Toggle */}
                <div className="flex items-center gap-1 bg-white/[0.06] rounded-xl p-1">
                  {(['ALL', 'CREDIT', 'DEBIT', 'FOREX'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setActiveDealCardType(t);
                        fetchFilteredDeals(activeDealCategory, t);
                      }}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        activeDealCardType === t ? 'bg-indigo-600 text-white shadow-sm border border-indigo-600' : 'text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 border border-slate-200'
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
                    activeDealCategory === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-100 text-[#64748B] border border-slate-200 hover:border-slate-300 hover:text-[#0F172A]'
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
                        activeDealCategory === key ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-100 text-[#64748B] border border-slate-200 hover:border-slate-300 hover:text-[#0F172A]'
                      }`}
                    >
                      {label}
                    </button>
                  ))
                }
              </div>

              {/* Deals Grid */}
              {structuredDeals.deals.length === 0 ? (
                <div className="glass-pane border-dashed rounded-2xl p-12 text-center">
                  <p className="text-sm text-[#64748B]">No deals match your selected filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {structuredDeals.deals.map((deal: any) => (
                    <div
                      key={deal.deal_id}
                      className={`bg-white border border-[#E2E8F0] shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${
                        deal.is_top_pick ? 'border-amber-400 bg-amber-50/20 shadow-amber-100/50' : ''
                      }`}
                    >
                      {deal.is_top_pick === 1 && (
                        <div className="flex justify-end mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">★ Top Pick</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">{deal.source_x_profile}</span>
                          <span className={`text-[10px] font-black ${
                            deal.yield_pct >= 10 ? 'text-emerald-600' :
                            deal.yield_pct >= 5 ? 'text-indigo-400' :
                            deal.yield_pct >= 2 ? 'text-amber-600' : 'text-[#64748B]'
                          }`}>{deal.yield_pct}% yield</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wide">{deal.target_merchant}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            deal.card_type === 'FOREX' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            deal.card_type === 'DEBIT' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}>{deal.card_type}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0F172A] leading-snug">{deal.deal_headline.replace(/^🔥 TOP PICK: /, '')}</h4>
                        <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">{deal.raw_copied_text}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold text-[#64748B] truncate">
                            {deal.coupon_code === 'NOT_REQUIRED' ? 'No code needed' : deal.coupon_code}
                          </div>
                          {deal.coupon_code !== 'NOT_REQUIRED' && (
                            <button
                              onClick={() => { navigator.clipboard.writeText(deal.coupon_code); setCopiedDealId(deal.deal_id); setTimeout(()=>setCopiedDealId(null),2000); }}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                                copiedDealId === deal.deal_id ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white border border-slate-200 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                              }`}
                            >
                              {copiedDealId === deal.deal_id ? '✓' : 'Copy'}
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-[#64748B]">Expires {deal.expires_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── TRUSTED SOURCES STRIP ── */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-3">Trusted Creators on X</p>
              <div className="flex flex-wrap gap-2">
                {['@AmazingCreditC','@CardExpertIn','@TechnoFino','@Cardmafia_in','@CardInsiderIn','@RupeeSaving'].map(acc => (
                  <a
                    key={acc}
                    href={`https://x.com/${acc.replace('@','')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                      acc === '@AmazingCreditC' ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white border border-slate-200 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
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
            className="w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '420px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-black text-xs">A</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
                </div>
                <div>
                  <p className="text-[#0F172A] font-black text-xs leading-none">@AmazingCreditC</p>
                  <p className="text-[#64748B] text-[9px] mt-0.5">Card deals · India</p>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border transition-all ${
                  xWidgetPulse ? 'bg-emerald-400/30 text-emerald-300 border-emerald-400/50 scale-110' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                }`}>● LIVE</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchXLivePosts()}
                  className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors rounded-full hover:bg-slate-100 text-xs"
                  title="Refresh"
                >↻</button>
                <button
                  onClick={() => setXWidgetOpen(false)}
                  className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors rounded-full hover:bg-slate-100 text-xs"
                >✕</button>
              </div>
            </div>

            {/* Posts feed */}
            <div className="overflow-y-auto flex-1 divide-y divide-[#E2E8F0]">
              {xLivePosts.length === 0 ? (
                <div className="p-5 text-center">
                  <div className="inline-block w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                  <p className="text-[11px] text-[#64748B]">Fetching live deals...</p>
                </div>
              ) : (
                xLivePosts.map((post: any, i: number) => (
                  <div key={post.deal_id ?? i} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-default">
                    <div className="flex items-start gap-2.5">
                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[9px] shrink-0 mt-0.5">
                        {(post.source_x_profile || 'X').charAt(1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[#0F172A] font-bold text-[11px]">@{post.source_x_profile || 'AmazingCreditC'}</span>
                          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-indigo-400 shrink-0"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81-0.67-1.31-1.91-2.19-3.34-2.19-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91 1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/></svg>
                          {post.discovered_at && (
                            <span className="text-[#64748B] text-[9px] ml-auto shrink-0">
                              {new Date(post.discovered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2">
                          {post.deal_headline || post.raw_copied_text || 'New deal posted'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {post.target_merchant && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
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
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
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
            <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[9px] text-[#64748B]">Polls every 30s</span>
              <a
                href="https://x.com/AmazingCreditC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >See all on X →</a>
            </div>
          </div>
        )}

        {/* Toggle pill button */}
        <button
          onClick={() => setXWidgetOpen(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg transition-all duration-200 ${
            xWidgetOpen
              ? 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-indigo-500/50'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span className="text-[11px] font-bold">Live Deals</span>
          {xLivePosts.length > 0 && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full transition-all ${
              xWidgetPulse ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-[#64748B]'
            }`}>{xLivePosts.length}</span>
          )}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {/* ── CARD DETAILED INSPECTOR MODAL ── */}
      {selectedDetailCard && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md z-50 flex items-center justify-center p-4 anim-fade-in-up">
          <div className="bg-white border border-[#E2E8F0] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] anim-scale-in">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                  <span>{selectedDetailCard.bank_id}</span>
                  <span>•</span>
                  <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-semibold">{selectedDetailCard.card_network}</span>
                  <span>•</span>
                  <span>{selectedDetailCard.card_type}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mt-1">{selectedDetailCard.card_name}</h3>
              </div>
              <button 
                onClick={() => { setSelectedDetailCard(null); setSelectedCardRules([]); }}
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors bg-white shadow-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Panel: Highlights & Spends */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Highlights */}
                <div className="bg-slate-50/50 border border-slate-200/60 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-[#64748B] font-bold">⭐ HIGHLIGHTED FEATURES</h4>
                  <ul className="text-xs text-slate-700 space-y-2">
                    {selectedDetailCard.card_type === 'FOREX' ? (
                      <>
                        <li className="flex items-start gap-2"><span>🌍</span> <span><strong>0% Forex Markup</strong> markup on live exchange rates.</span></li>
                        <li className="flex items-start gap-2"><span>💼</span> <span><strong>Multi-Currency pockets</strong> to hedge transaction values.</span></li>
                        <li className="flex items-start gap-2"><span>✈️</span> <span><strong>Lounge Access:</strong> 1 complimentary international visit per quarter.</span></li>
                      </>
                    ) : selectedDetailCard.card_type === 'DEBIT' && selectedDetailCard.card_network === 'RUPAY' ? (
                      <>
                        <li className="flex items-start gap-2"><span>🥗</span> <span><strong>RuPay Select Wellness:</strong> Complimentary health checkups, gym passes, and spa/salon vouchers.</span></li>
                        <li className="flex items-start gap-2"><span>✈️</span> <span><strong>Lounge Access:</strong> 1 domestic lounge visit per quarter + 2 international per year.</span></li>
                        <li className="flex items-start gap-2"><span>🛡️</span> <span><strong>Accident Insurance:</strong> Coverage up to ₹10 Lakhs.</span></li>
                        <li className="flex items-start gap-2"><span>🚕</span> <span><strong>Cab Discounts:</strong> ₹100 complimentary coupon per quarter.</span></li>
                      </>
                    ) : selectedDetailCard.card_type === 'DEBIT' ? (
                      <>
                        <li className="flex items-start gap-2"><span>🏦</span> <span><strong>Linked Account:</strong> Direct settlement from bank balances.</span></li>
                        <li className="flex items-start gap-2"><span>✈️</span> <span><strong>Lounge Access:</strong> 1 domestic lounge visit per quarter (spend-based).</span></li>
                        <li className="flex items-start gap-2"><span>🛡️</span> <span><strong>Insurance Cover:</strong> Protection up to ₹5 Lakhs.</span></li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2"><span>💳</span> <span><strong>Credit Limit:</strong> Subject to bank-authorized monthly line credit.</span></li>
                        {parseFloat(selectedDetailCard.annual_fee_inr || '0') >= 10000 ? (
                          <>
                            <li className="flex items-start gap-2"><span>⛳</span> <span><strong>Premium Concierge:</strong> Unlimited lounge access & complimentary golf rounds.</span></li>
                            <li className="flex items-start gap-2"><span>⛓️</span> <span><strong>Metal Form:</strong> Premium weight metal structure form factor.</span></li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2"><span>🎁</span> <span><strong>Rewards & Perks:</strong> Surcharge waivers & milestone voucher options.</span></li>
                            <li className="flex items-start gap-2"><span>✈️</span> <span><strong>Lounge Access:</strong> 4 domestic lounge visits per year.</span></li>
                          </>
                        )}
                      </>
                    )}
                  </ul>
                </div>

                {/* Spends */}
                {(() => {
                  const stats = calculateCardSpendRouting(selectedDetailCard.card_id);
                  return (
                    <div className="bg-slate-50/50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs uppercase tracking-widest text-[#64748B] font-bold">📈 SPEND TRACKER (VIA CARDWISE)</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-center">
                          <span className="text-[10px] text-[#64748B] font-bold uppercase block leading-none mb-1">Routed / Month</span>
                          <span className="text-sm font-bold text-[#0F172A]">₹{stats.totalRoutedSpend.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-center">
                          <span className="text-[10px] text-[#64748B] font-bold uppercase block leading-none mb-1">Rewards / Month</span>
                          <span className="text-sm font-bold text-emerald-600">₹{Math.round(stats.totalRoutedRewards).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="border-t border-[#E2E8F0] pt-3">
                        <span className="text-[10px] text-[#64748B] font-bold uppercase block mb-1">Total Tracked Spends (YTD)</span>
                        <div className="flex justify-between items-center bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-800">
                          <span>{"Spends: ₹" + (stats.totalRoutedSpend * 6).toLocaleString('en-IN')}</span>
                          <span className="text-emerald-600">{"+₹" + Math.round(stats.totalRoutedRewards * 6).toLocaleString('en-IN') + " net"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-[#64748B] font-bold uppercase block">Active Optimized Categories</span>
                        {stats.routedCategories.length === 0 ? (
                          <p className="text-[11px] text-[#64748B] italic bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                            ⚠️ This card is currently idle in your wallet. Other cards in your wallet have higher reward rates for all categories.
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {stats.routedCategories.map((c, i) => (
                              <div key={i} className="flex justify-between items-center text-[11px] font-semibold text-slate-700 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg">
                                <span>{c.label}</span>
                                <span className="font-mono font-bold text-[#0F172A]">{"₹" + c.spend.toLocaleString() + " (" + c.yieldPct + "%)"}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Right Panel: Rewards Matrix & Links */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Rewards Matrix */}
                <div className="bg-slate-50/50 border border-slate-200/60 p-5 rounded-2xl space-y-3 flex-1 flex flex-col">
                  <div className="flex justify-between items-center pb-1">
                    <h4 className="text-xs uppercase tracking-widest text-[#64748B] font-bold">📊 DETAILED REWARDS MATRIX</h4>
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-sm text-[10px]">
                      <button
                        onClick={() => setShowBoostedRewards(false)}
                        className={`px-2 py-1 rounded-md font-semibold transition-all ${!showBoostedRewards ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Base Yield
                      </button>
                      <button
                        onClick={() => setShowBoostedRewards(true)}
                        className={`px-2 py-1 rounded-md font-semibold transition-all ${showBoostedRewards ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        🔥 Boosted Multipliers
                      </button>
                    </div>
                  </div>
                  
                  {rulesDetailsLoading ? (
                    <div className="py-12 text-center text-xs text-[#64748B] italic">Loading reward mechanics...</div>
                  ) : selectedCardRules.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#64748B] italic">No custom rules configured. Standard base rate applies.</div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase">
                            <th className="p-3 pl-4">Category</th>
                            <th className="p-3 text-center">Net Yield</th>
                            <th className="p-3 text-right pr-4">Monthly Cap</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {selectedCardRules.map((rule, idx) => {
                            const isExcl = rule.is_completely_excluded === 1 || rule.is_completely_excluded === true;
                            let netYield = rule.base_reward_percentage;
                            if (profileGoal === 'CASHBACK') {
                              if (selectedDetailCard.card_id === 'in_hdfc_infinia_metal') netYield *= 0.50;
                              else if (selectedDetailCard.card_id === 'in_hdfc_regalia_gold') netYield *= 0.20;
                              else if (selectedDetailCard.card_id === 'in_axis_atlas_credit') netYield *= 0.50;
                              else if (selectedDetailCard.card_id === 'in_axis_magnus_credit') netYield *= 0.10;
                              else if (selectedDetailCard.card_id.toLowerCase().includes('amex') || selectedDetailCard.bank_id === 'AMEX') netYield *= 0.20;
                            } else if (profileGoal === 'AIRMILES') {
                              if (selectedDetailCard.card_id === 'in_axis_atlas_credit') netYield *= 2.0;
                            }
                            
                            const boosted = getBoostedYield(selectedDetailCard.card_id, rule.mcc_code, netYield);
                            const finalYield = showBoostedRewards && !isExcl ? boosted.value : netYield;
                            const trickUsed = showBoostedRewards && !isExcl ? boosted.trick : null;
                            
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 pl-4">
                                  <div className="font-bold text-[#0F172A]">{rule.mcc_category_name || 'General Default'}</div>
                                  {trickUsed && (
                                    <div className="text-[10px] text-indigo-600 font-bold mt-0.5 leading-tight flex items-center gap-1">
                                      <span>⚡ {trickUsed}</span>
                                    </div>
                                  )}
                                  {rule.gimmick_warning_text && !trickUsed && (
                                    <div className="text-[10px] text-amber-700 mt-0.5 leading-tight">{rule.gimmick_warning_text}</div>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <span className={isExcl ? "font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700" : "font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"}>
                                    {isExcl ? "0%" : parseFloat(finalYield.toFixed(2)) + "%"}
                                  </span>
                                </td>
                                <td className="p-3 text-right pr-4 font-mono font-medium text-slate-600">
                                  {rule.monthly_capping_inr ? "₹" + rule.monthly_capping_inr : 'No Limit'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Redirect Links */}
                <div className="bg-slate-50/50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-[#64748B] font-bold">🔗 REDEMPTION & MULTIPLIERS PORTALS</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const bankKey = (selectedDetailCard.bank_id || '').toUpperCase();
                      const links = bankRedemptionLinks[bankKey] || {
                        redeemUrl: "https://www.google.com",
                        multiplierUrl: "https://www.google.com",
                        portalName: "Rewards Catalog Portal",
                        multiplierName: "Card Accelerator Deals"
                      };
                      
                      const redeemUrl = selectedDetailCard.card_network === 'RUPAY' 
                        ? "https://www.rupay.co.in/rupay-select" 
                        : links.redeemUrl;
                      const portalName = selectedDetailCard.card_network === 'RUPAY' 
                        ? "RuPay Select Wellness & Rewards Portal" 
                        : links.portalName;

                      return (
                        <>
                          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex flex-col justify-between space-y-3">
                            <div>
                              <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Rewards Catalog</span>
                              <h5 className="text-xs font-bold text-[#0F172A] mt-1">{portalName}</h5>
                            </div>
                            <a 
                              href={redeemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 px-3 rounded-lg transition-colors block"
                            >
                              Redeem Points ↗
                            </a>
                          </div>

                          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex flex-col justify-between space-y-3">
                            <div>
                              <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Point Multiplier</span>
                              <h5 className="text-xs font-bold text-[#0F172A] mt-1">{links.multiplierName}</h5>
                            </div>
                            <a 
                              href={links.multiplierUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-center border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-[10px] py-2 px-3 rounded-lg transition-colors block"
                            >
                              Access Accelerator ↗
                            </a>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
