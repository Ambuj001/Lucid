'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CardwiseRedemptionMatrix from './redemption/page';

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

const SHOP_PARTNERS_LIST = [
  { 
    name: 'Amazon India', 
    domain: 'amazon.in', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', 
    color: '#FF9900',
    affiliate_rate: 8.5,
    type: 'Shopping',
    affiliate_url: 'https://www.amazon.in/?tag=cardwise-21',
    description: 'Electronics, fashion, pantry, and daily essentials.'
  },
  { 
    name: 'Flipkart', 
    domain: 'flipkart.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg', 
    color: '#2874F0',
    affiliate_rate: 7.0,
    type: 'Shopping',
    affiliate_url: 'https://www.flipkart.com/?affid=cardwise',
    description: 'Gadgets, appliances, apparel, and furniture.'
  },
  { 
    name: 'Myntra', 
    domain: 'myntra.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.svg', 
    color: '#F13F70',
    affiliate_rate: 6.5,
    type: 'Fashion',
    affiliate_url: 'https://www.myntra.com/?affid=cardwise-fashion',
    description: 'Clothing, footwear, accessories, and cosmetics.'
  },
  { 
    name: 'Ajio', 
    domain: 'ajio.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/AJIO_Logo.svg', 
    color: '#2F3E46',
    affiliate_rate: 8.0,
    type: 'Fashion',
    affiliate_url: 'https://www.ajio.com/',
    description: 'Trendy apparel, footwear, and curated fashion lines.'
  },
  { 
    name: 'Nykaa', 
    domain: 'nykaa.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Nykaa_Logo.svg', 
    color: '#FC2779',
    affiliate_rate: 5.5,
    type: 'Beauty',
    affiliate_url: 'https://www.nykaa.com/',
    description: 'Cosmetics, personal care, and wellness products.'
  },
  { 
    name: 'Tata CLiQ', 
    domain: 'tatacliq.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Tata_Cliq_Logo.svg', 
    color: '#E21E26',
    affiliate_rate: 6.0,
    type: 'Shopping',
    affiliate_url: 'https://www.tatacliq.com/',
    description: 'Multi-brand electronics, home, and apparel.'
  },
  { 
    name: 'Reliance Digital', 
    domain: 'reliancedigital.in', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Reliance_Digital_logo.svg', 
    color: '#E21D24',
    affiliate_rate: 4.5,
    type: 'Electronics',
    affiliate_url: 'https://www.reliancedigital.in/',
    description: 'Consumer electronics, smartphones, and computers.'
  },
  { 
    name: 'Swiggy', 
    domain: 'swiggy.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.svg', 
    color: '#FC8019',
    affiliate_rate: 4.0,
    type: 'Food & Grocery',
    affiliate_url: 'https://www.swiggy.com/',
    description: 'Restaurant deliveries and instant groceries.'
  },
  { 
    name: 'Zomato', 
    domain: 'zomato.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg', 
    color: '#CB202D',
    affiliate_rate: 3.5,
    type: 'Food & Dining',
    affiliate_url: 'https://www.zomato.com/',
    description: 'Food ordering, deliveries, and dining reservations.'
  },
  { 
    name: 'BookMyShow', 
    domain: 'bookmyshow.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bookmyshow-logoid.png', 
    color: '#EC193C',
    affiliate_rate: 5.0,
    type: 'Entertainment',
    affiliate_url: 'https://in.bookmyshow.com/',
    description: 'Movie tickets, concerts, events, and plays.'
  },
  { 
    name: 'MakeMyTrip', 
    domain: 'makemytrip.com', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Makemytrip_logo.svg', 
    color: '#004C8F',
    affiliate_rate: 4.8,
    type: 'Travel',
    affiliate_url: 'https://www.makemytrip.com/',
    description: 'Flight booking, hotel reservations, and holidays.'
  }
];

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
  return { value: baseYield, trick: "Standard Base Rate" };
};

// ─── FALLBACK TRANSFER PARTNERS DATA ──────────────────────────────────────────────
const FALLBACK_TRANSFER_PARTNERS: Record<string, any[]> = {
  hdfc: [
    { id: 'ba', name: 'British Airways', program: 'Executive Club (Avios)', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.5, alliance: 'Oneworld', group: 'A', domain: 'britishairways.com', url: 'https://www.britishairways.com/executive-club', color: '#075AAA', desc: 'Premium Oneworld partner. Sweet spots: BOM→LHR Club World 51,500 Avios, DEL→DOH 15,000 Avios on Qatar.' },
    { id: 'qa', name: 'Qatar Airways', program: 'Privilege Club', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.8, alliance: 'Oneworld', group: 'A', domain: 'qatarairways.com', url: 'https://www.qatarairways.com/en/privilege-club.html', color: '#5C0632', desc: 'Best business class product globally. Qsuites BOM→DOH 37,500 miles one-way. Exceptional F/J availability.' },
    { id: 'sq', name: 'Singapore Airlines', program: 'KrisFlyer', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.6, alliance: 'Star Alliance', group: 'A', domain: 'singaporeair.com', url: 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', color: '#00256C', desc: 'Premium Star Alliance carrier. DEL→SIN Suites 57,375 miles. KrisFlyer miles are among the most versatile globally.' },
    { id: 'cx', name: 'Cathay Pacific', program: 'Asia Miles', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.4, alliance: 'Oneworld', group: 'A', domain: 'cathaypacific.com', url: 'https://www.cathaypacific.com/cx/en_HK/asia-miles.html', color: '#006564', desc: 'Exceptional F/J product via HKG. BOM→HKG Business 40,000 miles. Strong Oneworld partner redemption network.' },
    { id: 'ac', name: 'Air Canada', program: 'Aeroplan', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.5, alliance: 'Star Alliance', group: 'A', domain: 'aircanada.com', url: 'https://www.aircanada.com/aeroplan', color: '#F01428', desc: 'Powerful Star Alliance redemptions. Dynamic pricing on AC metal, fixed on partners. DEL→YYZ J 70,000 pts.' },
    { id: 'ey', name: 'Etihad Airways', program: 'Etihad Guest', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.3, alliance: 'Independent', group: 'A', domain: 'etihad.com', url: 'https://www.etihad.com/en/etihad-guest', color: '#BD8B13', desc: 'Premium Middle East carrier via AUH. Strong J/F product. BOM→AUH→LHR Business 62,500 miles.' },
    { id: 'tg', name: 'Thai Airways', program: 'Royal Orchid Plus', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.2, alliance: 'Star Alliance', group: 'A', domain: 'thaiairways.com', url: 'https://www.thaiairways.com/en/royal-orchid-plus.html', color: '#3F2785', desc: 'Strong for Asia routes via BKK. DEL→BKK J 35,000 miles. New 787 business class offers excellent value.' },
    { id: 'af', name: 'Air France-KLM', program: 'Flying Blue', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.2, alliance: 'SkyTeam', group: 'B', domain: 'airfrance.com', url: 'https://www.flyingblue.com', color: '#002157', desc: 'Best 1:1 ratio partner. Promo rewards frequently available. BOM→CDG J from 53,000 miles. Dynamic pricing.' },
    { id: 'ak', name: 'AirAsia', program: 'AirAsia Rewards', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 0.8, alliance: 'LCC', group: 'B', domain: 'airasia.com', url: 'https://www.airasia.com/rewards', color: '#FF0000', desc: 'Budget carrier for SEA routes. Points can offset fare directly. Best for domestic & short-haul SEA flights.' },
    { id: 'ay', name: 'Finnair', program: 'Finnair Plus', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.1, alliance: 'Oneworld', group: 'B', domain: 'finnair.com', url: 'https://www.finnair.com/en/finnair-plus', color: '#0B1560', desc: 'Fastest route to Europe via Helsinki. DEL→HEL J 60,000 points. Avios-convertible via Oneworld. 1:1 transfer.' },
    { id: 'vn', name: 'Vietnam Airlines', program: 'Lotusmiles', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 0.9, alliance: 'SkyTeam', group: 'B', domain: 'vietnamairlines.com', url: 'https://www.vietnamairlines.com/lotusmiles', color: '#00467F', desc: 'SkyTeam partner for SEA routing. DEL→SGN via HAN Business 42,000 miles. Good availability on own metal.' },
    { id: 'ai', name: 'Air India', program: 'Maharaja Club', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.0, alliance: 'Star Alliance', group: 'B', domain: 'airindia.com', url: 'https://www.airindia.com/in/en/fly-maharaja-club.html', color: '#E31837', desc: 'Domestic & US non-stop routes. BOM→JFK J from 75,000 miles. New A350 product significantly improved.' },
    { id: 'ihg', name: 'IHG Hotels', program: 'IHG One Rewards', type: 'hotel', ratio: '1:1', rateNum: 1.0, valuePerMile: 0.5, alliance: 'N/A', group: 'Hotel', domain: 'ihg.com', url: 'https://www.ihg.com/one-rewards', color: '#462E7C', desc: 'InterContinental, Crowne Plaza, Holiday Inn. 1:1 transfer. Points Breaks offer 5,000-40,000 pts/night.' },
    { id: 'wy', name: 'Wyndham Hotels', program: 'Wyndham Rewards', type: 'hotel', ratio: '1:1', rateNum: 1.0, valuePerMile: 0.5, alliance: 'N/A', group: 'Hotel', domain: 'wyndhamhotels.com', url: 'https://www.wyndhamrewards.com', color: '#0067B1', desc: 'Flat 15,000 pts/night at any category. Ramada, Days Inn. Go Free nights offer excellent value at premium properties.' },
    { id: 'all', name: 'Accor Hotels', program: 'ALL – Accor Live Limitless', type: 'hotel', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.8, alliance: 'N/A', group: 'Hotel', domain: 'all.accor.com', url: 'https://all.accor.com', color: '#1B3C6F', desc: 'Sofitel, Novotel, Pullman, Ibis. 2,000 pts = 1,000 ALL pts (~₹1,800 value). Strong India & Europe presence.' },
    { id: 'itc', name: 'ITC Hotels', program: 'Club ITC', type: 'hotel', ratio: '2:1', rateNum: 0.5, valuePerMile: 2.0, alliance: 'N/A', group: 'Hotel', domain: 'itchotels.com', url: 'https://www.itchotels.com/in/en/club-itc', color: '#0E4D3B', desc: 'India\'s finest luxury hotel chain. Exceptional domestic redemption value. ITC Maurya, Grand Chola, Maratha.' },
  ],
  axis: [
    { id: 'sq', name: 'Singapore Airlines', program: 'KrisFlyer', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.6, alliance: 'Star Alliance', group: 'A', domain: 'singaporeair.com', url: 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', color: '#00256C', desc: 'Top-tier Star Alliance carrier. Suites Class is the pinnacle of luxury. DEL→SIN Suites 57,375 miles. 1:4 transfer ratio.' },
    { id: 'ac', name: 'Air Canada', program: 'Aeroplan', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.5, alliance: 'Star Alliance', group: 'A', domain: 'aircanada.com', url: 'https://www.aircanada.com/aeroplan', color: '#F01428', desc: 'Best for North America routing. Star Alliance redemptions. Dynamic + fixed pricing mix. 1:4 transfer ratio.' },
    { id: 'tk', name: 'Turkish Airlines', program: 'Miles&Smiles', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.5, alliance: 'Star Alliance', group: 'A', domain: 'turkishairlines.com', url: 'https://www.turkishairlines.com/en-int/miles-and-smiles/', color: '#C8102E', desc: 'Largest network globally via IST. IST Lounge is world-class. BOM→IST→EUR J from 45,000 miles. 1:4 transfer ratio.' },
    { id: 'ey', name: 'Etihad Airways', program: 'Etihad Guest', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.3, alliance: 'Independent', group: 'A', domain: 'etihad.com', url: 'https://www.etihad.com/en/etihad-guest', color: '#BD8B13', desc: 'Premium carrier via Abu Dhabi. Strong J/F product. Good availability to Europe via AUH. 1:4 transfer ratio.' },
    { id: 'jl', name: 'Japan Airlines', program: 'JAL / JMB', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.4, alliance: 'Oneworld', group: 'A', domain: 'jal.co.jp', url: 'https://www.jal.co.jp/en/jmb/', color: '#CC0000', desc: 'Best for Japan routes. DEL→NRT J from 50,000 miles. Exceptional Japanese hospitality in premium cabins. 1:4 ratio.' },
    { id: 'qf', name: 'Qantas', program: 'Frequent Flyer', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.3, alliance: 'Oneworld', group: 'A', domain: 'qantas.com', url: 'https://www.qantas.com/au/en/frequent-flyer.html', color: '#E40000', desc: 'Premium Oneworld carrier. Strong for Australia & NZ routes. Classic rewards offer fixed pricing. 1:4 ratio.' },
    { id: 'ua', name: 'United Airlines', program: 'MileagePlus', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.2, alliance: 'Star Alliance', group: 'A', domain: 'united.com', url: 'https://www.united.com/en/us/fly/mileageplus.html', color: '#002244', desc: 'Largest US Star Alliance carrier. Excursionist Perk adds free stopover. BOM→EWR J from 77,000 miles. 1:4 ratio.' },
    { id: 'af', name: 'Air France-KLM', program: 'Flying Blue', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.2, alliance: 'SkyTeam', group: 'B', domain: 'airfrance.com', url: 'https://www.flyingblue.com', color: '#002157', desc: 'Best 1:4 transfer value. Promo rewards regularly available. SkyTeam network coverage.' },
    { id: 'ak', name: 'AirAsia', program: 'AirAsia Rewards', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 0.8, alliance: 'LCC', group: 'B', domain: 'airasia.com', url: 'https://www.airasia.com/rewards', color: '#FF0000', desc: 'Budget carrier. Direct fare offset. Best for Southeast Asia hops. 1:4 ratio.' },
    { id: 'ba', name: 'British Airways', program: 'Executive Club (Avios)', type: 'airline', ratio: '1:2', rateNum: 2.0, valuePerMile: 1.5, alliance: 'Oneworld', group: 'B', domain: 'britishairways.com', url: 'https://www.britishairways.com/executive-club', color: '#075AAA', desc: 'Avios for short-haul are excellent value. New partner added April 2026. 1:2 transfer ratio on Olympus.' },
    { id: 'ay', name: 'Finnair', program: 'Finnair Plus', type: 'airline', ratio: '1:2', rateNum: 2.0, valuePerMile: 1.1, alliance: 'Oneworld', group: 'B', domain: 'finnair.com', url: 'https://www.finnair.com/en/finnair-plus', color: '#0B1560', desc: 'Fastest Europe via Helsinki. New partner added April 2026. 1:2 transfer ratio.' },
    { id: 'vn', name: 'Vietnam Airlines', program: 'Lotusmiles', type: 'airline', ratio: '1:2', rateNum: 2.0, valuePerMile: 0.9, alliance: 'SkyTeam', group: 'B', domain: 'vietnamairlines.com', url: 'https://www.vietnamairlines.com/lotusmiles', color: '#00467F', desc: 'Good for Vietnam & SEA SkyTeam routing. Hanoi hub connectivity. 1:2 ratio.' },
    { id: 'ai', name: 'Air India', program: 'Maharaja Club', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.0, alliance: 'Star Alliance', group: 'B', domain: 'airindia.com', url: 'https://www.airindia.com/in/en/fly-maharaja-club.html', color: '#E31837', desc: 'Star Alliance India flag carrier. New fleet with A350s. Direct USA & Europe non-stops. 1:4 ratio.' },
    { id: 'et', name: 'Ethiopian Airlines', program: 'ShebaMiles', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 0.9, alliance: 'Star Alliance', group: 'B', domain: 'ethiopianairlines.com', url: 'https://www.ethiopianairlines.com/shebamiles', color: '#009639', desc: 'Africa\'s largest carrier. Addis Ababa hub for African connectivity. 1:4 ratio.' },
    { id: 'sg', name: 'SpiceJet', program: 'SpiceClub', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 0.6, alliance: 'LCC', group: 'B', domain: 'spicejet.com', url: 'https://www.spicejet.com/spiceclub', color: '#FF0000', desc: 'Indian LCC. Direct fare offset for domestic travel. Best for short domestic hops. 1:4 ratio.' },
    { id: 'tg', name: 'Thai Airways', program: 'Royal Orchid Plus', type: 'airline', ratio: '1:4', rateNum: 4.0, valuePerMile: 1.2, alliance: 'Star Alliance', group: 'B', domain: 'thaiairways.com', url: 'https://www.thaiairways.com/en/royal-orchid-plus.html', color: '#3F2785', desc: 'Excellent J product. BKK routing for SEA/Australia. Star Alliance partner awards. 1:4 ratio.' },
    { id: 'ihg', name: 'IHG Hotels', program: 'IHG One Rewards', type: 'hotel', ratio: '1:4', rateNum: 4.0, valuePerMile: 0.5, alliance: 'N/A', group: 'Hotel', domain: 'ihg.com', url: 'https://www.ihg.com/one-rewards', color: '#462E7C', desc: 'InterContinental, Crowne Plaza, Holiday Inn. 1:4 transfer ratio.' },
    { id: 'wy', name: 'Wyndham Hotels', program: 'Wyndham Rewards', type: 'hotel', ratio: '1:4', rateNum: 4.0, valuePerMile: 0.5, alliance: 'N/A', group: 'Hotel', domain: 'wyndhamhotels.com', url: 'https://www.wyndhamrewards.com', color: '#0067B1', desc: 'Flat-rate Go Free nights. 15,000 pts per night any category. Ramada, Days Inn network. 1:4 ratio.' },
    { id: 'itc', name: 'ITC Hotels', program: 'Club ITC', type: 'hotel', ratio: '1:4', rateNum: 4.0, valuePerMile: 2.0, alliance: 'N/A', group: 'Hotel', domain: 'itchotels.com', url: 'https://www.itchotels.com/in/en/club-itc', color: '#0E4D3B', desc: 'India\'s finest luxury chain. ITC Maurya, Grand Chola. Excellent domestic redemption value. 1:4 ratio.' },
    { id: 'rad', name: 'Radisson Hotels', program: 'Radisson Rewards', type: 'hotel', ratio: '1:4', rateNum: 4.0, valuePerMile: 0.6, alliance: 'N/A', group: 'Hotel', domain: 'radissonhotels.com', url: 'https://www.radissonrewards.com', color: '#003B71', desc: 'Wide India presence. Radisson Blu, Park Inn. Added April 2026. 1:4 ratio.' },
    { id: 'orch', name: 'Orchid Hotels', program: 'Orchid Rewards', type: 'hotel', ratio: '1:4', rateNum: 4.0, valuePerMile: 0.5, alliance: 'N/A', group: 'Hotel', domain: 'orchidhotel.com', url: 'https://www.orchidhotel.com', color: '#6B2E8A', desc: 'India eco-luxury chain. Mumbai, Pune, Goa properties. Added April 2026. 1:4 ratio.' },
    { id: 'pc', name: 'The Postcard Hotel', program: 'Postcard Rewards', type: 'hotel', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.5, alliance: 'N/A', group: 'Hotel', domain: 'thepostcardhotel.com', url: 'https://www.thepostcardhotel.com', color: '#1A1A1A', desc: 'Boutique luxury properties in Goa, Kumarakom, Dewa Thimphu. Ultra-premium, intimate experiences. 1:1 ratio.' },
  ],
  amex: [
    { id: 'sq', name: 'Singapore Airlines', program: 'KrisFlyer', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.6, alliance: 'Star Alliance', group: 'A', domain: 'singaporeair.com', url: 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', color: '#00256C', desc: 'Premium Star Alliance carrier. Points transfer at 2:1 ratio.' },
    { id: 'ek', name: 'Emirates', program: 'Skywards', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.3, alliance: 'Independent', group: 'A', domain: 'emirates.com', url: 'https://www.emirates.com/in/english/skywards/', color: '#D71921', desc: 'Emirates Skywards. Great for premium cabins to Dubai. 2:1 transfer ratio.' },
    { id: 'ba', name: 'British Airways', program: 'Executive Club (Avios)', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.5, alliance: 'Oneworld', group: 'A', domain: 'britishairways.com', url: 'https://www.britishairways.com/executive-club', color: '#075AAA', desc: 'Executive Club Avios. Good for short/medium Oneworld flights. 2:1 ratio.' },
    { id: 'qa', name: 'Qatar Airways', program: 'Privilege Club', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.8, alliance: 'Oneworld', group: 'A', domain: 'qatarairways.com', url: 'https://www.qatarairways.com/en/privilege-club.html', color: '#5C0632', desc: 'Qatar Privilege Club Avios. World-class Qsuites redemption value. 2:1 ratio.' },
    { id: 'ey', name: 'Etihad Airways', program: 'Etihad Guest', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.3, alliance: 'Independent', group: 'A', domain: 'etihad.com', url: 'https://www.etihad.com/en/etihad-guest', color: '#BD8B13', desc: 'Etihad Guest transfer option. Scheduled to sunset on June 30, 2026. 2:1 ratio.' },
    { id: 'cx', name: 'Cathay Pacific', program: 'Asia Miles', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.4, alliance: 'Oneworld', group: 'A', domain: 'cathaypacific.com', url: 'https://www.cathaypacific.com/cx/en_HK/asia-miles.html', color: '#006564', desc: 'Cathay Pacific Asia Miles. Great for East Asia routes via Hong Kong. 2:1 ratio.' },
    { id: 'va', name: 'Virgin Atlantic', program: 'Flying Club', type: 'airline', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.4, alliance: 'SkyTeam', group: 'A', domain: 'virginatlantic.com', url: 'https://www.virginatlantic.com/in/en/flying-club', color: '#E40046', desc: 'Flying Club miles. Extremely low points cost for select routes to UK/USA. 2:1 ratio.' },
    { id: 'mar', name: 'Marriott Hotels', program: 'Marriott Bonvoy', type: 'hotel', ratio: '1:1', rateNum: 1.0, valuePerMile: 0.8, alliance: 'N/A', group: 'Hotel', domain: 'marriott.com', url: 'https://www.marriott.com/loyalty.mi', color: '#000000', desc: 'Marriott Bonvoy. High-value hotel program. 1:1 ratio is excellent for luxury resorts.' },
    { id: 'hil', name: 'Hilton Hotels', program: 'Hilton Honors', type: 'hotel', ratio: '1:0.9', rateNum: 0.9, valuePerMile: 0.4, alliance: 'N/A', group: 'Hotel', domain: 'hilton.com', url: 'https://www.hilton.com/en/hilton-honors/', color: '#00256C', desc: 'Hilton Honors program. Transfer ratio is 1:0.9 (1000 MR = 900 Hilton Points).' },
  ],
  icici: [
    { id: 'ai', name: 'Air India', program: 'Maharaja Club', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.0, alliance: 'Star Alliance', group: 'A', domain: 'airindia.com', url: 'https://www.airindia.com/in/en/fly-maharaja-club.html', color: '#E31837', desc: 'Direct 1:1 transfer to Air India Maharaja Club. 1 ICICI Point = 1 Maharaja Club point. High value for domestic & international non-stop routes.' },
  ],
  sbi: [
    { id: 'ba', name: 'British Airways', program: 'Executive Club (Avios)', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.5, alliance: 'Oneworld', group: 'A', domain: 'britishairways.com', url: 'https://www.britishairways.com/executive-club', color: '#075AAA', desc: 'Executive Club Avios for SBI Aurum. Sweet spots: BOM to LHR Club World 51,500 Avios, DEL to DOH 15,000 Avios on Qatar. 1:1 transfer ratio.' },
    { id: 'sq', name: 'Singapore Airlines', program: 'KrisFlyer', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.6, alliance: 'Star Alliance', group: 'A', domain: 'singaporeair.com', url: 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/', color: '#00256C', desc: 'Singapore Airlines KrisFlyer for SBI Aurum. Premium Suites & First Class awards. DEL to SIN Suites 57,375 miles. 1:1 ratio.' },
    { id: 'ey', name: 'Etihad Airways', program: 'Etihad Guest', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.3, alliance: 'Independent', group: 'A', domain: 'etihad.com', url: 'https://www.etihad.com/en/etihad-guest', color: '#BD8B13', desc: 'Etihad Guest for SBI Aurum. Premium flights via AUH. Good award availability for Middle East & Europe routing. 1:1 ratio.' },
    { id: 'ai', name: 'Air India', program: 'Maharaja Club', type: 'airline', ratio: '1:1', rateNum: 1.0, valuePerMile: 1.0, alliance: 'Star Alliance', group: 'B', domain: 'airindia.com', url: 'https://www.airindia.com/in/en/fly-maharaja-club.html', color: '#E31837', desc: 'Air India Maharaja Club. Direct non-stop flights to USA/UK. 1:1 ratio for Aurum and Air India Signature credit cards.' },
    { id: 'ihg', name: 'IHG Hotels', program: 'IHG One Rewards', type: 'hotel', ratio: '1:1', rateNum: 1.0, valuePerMile: 0.5, alliance: 'N/A', group: 'Hotel', domain: 'ihg.com', url: 'https://www.ihg.com/one-rewards', color: '#462E7C', desc: 'IHG One Rewards for SBI Aurum. InterContinental, Holiday Inn, Crowne Plaza. 1:1 ratio.' },
    { id: 'wy', name: 'Wyndham Hotels', program: 'Wyndham Rewards', type: 'hotel', ratio: '1:1', rateNum: 1.0, valuePerMile: 0.5, alliance: 'N/A', group: 'Hotel', domain: 'wyndhamhotels.com', url: 'https://www.wyndhamrewards.com', color: '#0067B1', desc: 'Wyndham Rewards for SBI Aurum. Flat 15,000 pts/night at any category. Go Free nights offer excellent value. 1:1 ratio.' },
    { id: 'all', name: 'Accor Hotels', program: 'ALL – Accor Live Limitless', type: 'hotel', ratio: '2:1', rateNum: 0.5, valuePerMile: 1.8, alliance: 'N/A', group: 'Hotel', domain: 'all.accor.com', url: 'https://all.accor.com', color: '#1B3C6F', desc: 'ALL Accor Live Limitless for SBI Aurum. 2:1 transfer ratio (2 Aurum Points = 1 ALL Point). Sofitel, Novotel, Pullman, Ibis.' },
    { id: 'itc', name: 'ITC Hotels', program: 'Club ITC', type: 'hotel', ratio: '1:1', rateNum: 1.0, valuePerMile: 2.0, alliance: 'N/A', group: 'Hotel', domain: 'itchotels.com', url: 'https://www.itchotels.com/in/en/club-itc', color: '#0E4D3B', desc: 'Club ITC for SBI Aurum. 1:1 transfer ratio. Premium luxury hotels in India. ITC Maurya, Grand Chola, Maratha.' }
  ]
};

const BankLogo = ({ id, className = "h-8 object-contain" }: { id: string; className?: string }) => {
  const normalized = (id || '').toLowerCase();
  if (normalized === 'hdfc_infinia' || normalized === 'hdfc') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#004B87"/>
        <rect x="10" y="10" width="20" height="20" stroke="white" strokeWidth="4.5" fill="none"/>
        <rect x="18" y="18" width="4" height="4" fill="white"/>
        <rect x="18" y="0" width="4" height="10" fill="white"/>
        <rect x="18" y="30" width="4" height="10" fill="white"/>
        <rect x="0" y="18" width="10" height="4" fill="white"/>
        <rect x="30" y="18" width="10" height="4" fill="white"/>
      </svg>
    );
  }
  if (normalized === 'axis_olympus' || normalized === 'axis') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2L2 38H12L20 19L28 38H38L20 2Z" fill="#97144D"/>
        <path d="M20 19L15 29H25L20 19Z" fill="white"/>
      </svg>
    );
  }
  if (normalized === 'amex_platinum' || normalized === 'amex') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#001A9C"/>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">AMEX</text>
      </svg>
    );
  }
  if (normalized === 'icici_emeralde' || normalized === 'icici') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#FF6F00"/>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Georgia, serif" fontStyle="italic">i</text>
      </svg>
    );
  }
  if (normalized === 'sbi' || normalized === 'sbi_aurum' || normalized === 'sbi_card') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#00A4E4"/>
        <circle cx="20" cy="20" r="6" fill="white"/>
        <rect x="18" y="20" width="4" height="18" fill="white"/>
      </svg>
    );
  }
  return null;
};

const PARTNER_LOGOS: Record<string, string> = {
  sq: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Singapore_Airlines_Logo.svg/500px-Singapore_Airlines_Logo.svg.png',
  ba: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/BRITISH_AIRWAYS_logo.svg/500px-BRITISH_AIRWAYS_logo.svg.png',
  ey: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Etihad-airways-logo.svg/500px-Etihad-airways-logo.svg.png',
  ai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Air_India_2023.svg/500px-Air_India_2023.svg.png',
  qa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Qatar_Airways_Logo.svg/500px-Qatar_Airways_Logo.svg.png',
  cx: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Cathay_Pacific_logo.svg/500px-Cathay_Pacific_logo.svg.png',
  ac: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Air_Canada_Logo.svg/500px-Air_Canada_Logo.svg.png',
  tg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Thai_Airways_Logo.svg/500px-Thai_Airways_Logo.svg.png',
  af: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Air_France-KLM_logo.svg/500px-Air_France-KLM_logo.svg.png',
  ak: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/500px-AirAsia_New_Logo.svg.png',
  ay: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Finnair_logo.svg/500px-Finnair_logo.svg.png',
  vn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vietnam_Airlines_Logo.svg/500px-Vietnam_Airlines_Logo.svg.png',
  ihg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/InterContinental_Hotels_Group_logo_2017.svg/500px-InterContinental_Hotels_Group_logo_2017.svg.png',
  wy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Wyndham_Hotels_%26_Resorts_logo.svg/500px-Wyndham_Hotels_%26_Resorts_logo.svg.png',
  all: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/AccorHotels_Logo_2016.svg/500px-AccorHotels_Logo_2016.svg.png',
  itc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/ITC_Limited_logo.svg/500px-ITC_Limited_logo.svg.png',
  tk: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Turkish_Airlines_logo.svg/500px-Turkish_Airlines_logo.svg.png',
  jl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Japan_Airlines_logo_2011.svg/500px-Japan_Airlines_logo_2011.svg.png',
  qf: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Qantas_Logo_2016.svg/500px-Qantas_Logo_2016.svg.png',
  ua: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/United_Airlines_Logo.svg/500px-United_Airlines_Logo.svg.png',
  rad: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Radisson_Hotel_Group_Logo.svg/500px-Radisson_Hotel_Group_Logo.svg.png',
  ek: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Emirates_logo.svg/500px-Emirates_logo.svg.png',
  va: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Virgin_Atlantic_logo.svg/500px-Virgin_Atlantic_logo.svg.png',
  mar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Marriott_International_Logo.svg/500px-Marriott_International_Logo.svg.png',
  hil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Hilton_Worldwide_logo.svg/500px-Hilton_Worldwide_logo.svg.png',
  pc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Postcard_Hotel_Logo_Icon.svg/500px-Postcard_Hotel_Logo_Icon.svg.png'
};

const getPartnerLogoUrl = (partner: any) => {
  if (!partner) return '';
  return PARTNER_LOGOS[partner.id] || `https://www.google.com/s2/favicons?domain=${partner.domain}&sz=128`;
};

export default function CardwiseDashboard() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
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
  const [redirectingPartner, setRedirectingPartner] = useState<any | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // Redemption Matrix Rules State
  const [masterRules, setMasterRules] = useState<any[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  // Vacation Planner calculator states
  const [vacationCard, setVacationCard] = useState('');
  const [vacationPoints, setVacationPoints] = useState('5000');
  const [vacationPartner, setVacationPartner] = useState('');
  const [selectedEcosystem, setSelectedEcosystem] = useState('hdfc');
  const [partnerFilter, setPartnerFilter] = useState<'all' | 'airline' | 'hotel'>('all');
  const [selectedTransferPartner, setSelectedTransferPartner] = useState<any>(null);
  const [aiTripQuery, setAiTripQuery] = useState('');
  const [aiTripResponse, setAiTripResponse] = useState<any>(null);
  const [aiTripLoading, setAiTripLoading] = useState(false);
  const [transferPartners, setTransferPartners] = useState<Record<string, any[]>>(FALLBACK_TRANSFER_PARTNERS);
  const [banksData, setBanksData] = useState<any[]>([]);

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

  // Cardwise AI Chat States
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user'|'ai', text: string, image?: string, url?: string, timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [chatUrlInput, setChatUrlInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const chatFileInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState("usr_prod_101_cardwise");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const CURRENT_USER_ID = currentUserId;

  // User Financial Profile States
  const [profileName, setProfileName] = useState('Ambuj Tiwari');
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
        setProfileName(data.name || 'Ambuj Tiwari');
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
          name: profileName,
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
  
  const fetchTransferPartners = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/engine/transfer-partners');
      const data = await res.json();
      if (data.partners) {
        setTransferPartners(data.partners);
      }
      if (data.banks) {
        setBanksData(data.banks);
      }
    } catch (e) {
      console.error("Failed to fetch transfer partners from API, falling back to local list:", e);
    }
  };

  // Verify token session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('cardwise_auth_token') || localStorage.getItem('cw_token');
      if (token) {
        try {
          const res = await fetch('http://localhost:3000/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUserId(data.user_id);
            setCurrentUserEmail(data.email_address);
            setIsAuth(true);
          } else {
            localStorage.removeItem('cardwise_auth_token');
            localStorage.removeItem('cw_token');
            localStorage.removeItem('cw_email');
          }
        } catch (e) {
          console.error("Session verification failed:", e);
        }
      }
    };
    checkSession();

    fetchMasterRules();
    fetchDealsFeed();
    fetchXLivePosts();
    fetchTransferPartners();

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

  // Fetch user-specific items on user ID update
  useEffect(() => {
    fetchWalletInventory();
    fetchUserProfile();
  }, [currentUserId]);



  // Fetch shop partners top yields on load/wallet change
  useEffect(() => {
    if (myWalletCards.length > 0) {
      evaluateShopPartners();
    } else {
      setPartnerYields({});
    }
  }, [myWalletCards]);

  const evaluateShopPartners = async () => {
    const yieldsMap: Record<string, any> = {};

    try {
      await Promise.all(SHOP_PARTNERS_LIST.map(async (p) => {
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
          yieldsMap[p.name] = { display_label: 'No active card recommended', yield_percentage: 0 };
        }
      }));
    } catch (e) {
      console.error("Failed to evaluate shop partners in parallel:", e);
    }

    setPartnerYields(yieldsMap);
  };

  // Outbound affiliate redirect countdown effect
  useEffect(() => {
    if (!redirectingPartner) return;
    setRedirectCountdown(3);

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.open(redirectingPartner.affiliate_url, '_blank');
          setRedirectingPartner(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [redirectingPartner]);

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

  // Remove Card from User Portfolio
  const removeCardFromPortfolio = async (cardId: string, cardName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${cardName} from your active portfolio?`)) {
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/portfolio/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: CURRENT_USER_ID,
          card_id: cardId
        })
      });
      const data = await response.json();
      if (data.success) {
        setWidgetMessage(`Successfully removed ${cardName}!`);
        setSelectedDetailCard(null);
        setSelectedCardRules([]);
        fetchWalletInventory();
        setTimeout(() => setWidgetMessage(''), 4000);
      } else {
        setWidgetMessage(`Failed to remove card: ${data.error || 'Unknown error'}`);
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

  const runCardwiseChat = async (textMessage?: string, quickActionText?: string) => {
    const queryText = quickActionText || textMessage || chatInput;
    if (!queryText.trim() && !chatImagePreview) return;

    // Build user message
    const userMsg = {
      role: 'user' as const,
      text: queryText,
      image: chatImagePreview || undefined,
      url: chatUrlInput || undefined,
      timestamp: new Date()
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    
    setChatInput('');
    setChatImagePreview(null);
    setChatUrlInput('');
    setShowUrlInput(false);
    setChatLoading(true);

    // Scroll to bottom immediately
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const response = await fetch('http://localhost:3000/api/v1/engine/cardwise-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          image_base64: userMsg.image,
          url: userMsg.url,
          user_id: CURRENT_USER_ID,
          history: updatedMessages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai' as const,
          text: data.reply,
          timestamp: new Date()
        }
      ]);

    } catch (e: any) {
      console.error("Cardwise AI chat error:", e);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai' as const,
          text: `⚠️ **Error connecting to Cardwise AI**: ${e.message || 'Unknown network error'}. Please verify server status and try again.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Image size exceeds the 4MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setChatImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image size exceeds the 4MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy coupon to clipboard helper
  const handleCopyCoupon = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedDealId(id);
    setTimeout(() => setCopiedDealId(null), 3000);
  };

  // Get active partners based on selected ecosystem and filter
  const getActivePartners = () => {
    const partners = transferPartners[selectedEcosystem] || [];
    if (partnerFilter === 'all') return partners;
    return partners.filter(p => p.type === partnerFilter);
  };

  // Vacation Planner conversions — now partner-data-driven
  const getConvertedMiles = () => {
    const pts = parseFloat(vacationPoints) || 0;
    if (vacationPartner && selectedEcosystem) {
      const partners = transferPartners[selectedEcosystem] || [];
      const partner = partners.find((p: any) => p.id === vacationPartner);
      if (partner) {
        const miles = pts * partner.rateNum;
        const value = miles * partner.valuePerMile;
        return {
          miles,
          value,
          desc: `Transfer Ratio: ${partner.ratio}. ${partner.name} ${partner.program}. Value: ~₹${partner.valuePerMile.toFixed(1)}/mile.`
        };
      }
    }
    // Fallback
    return {
      miles: pts * 0.25,
      value: pts * 0.25 * 1.0,
      desc: "Select a card and transfer partner to see conversion details."
    };
  };

  const getBankPortalInfo = () => {
    const ecoToBankId: Record<string, string> = {
      hdfc: 'HDFC',
      hdfc_infinia: 'HDFC',
      axis: 'AXIS',
      axis_olympus: 'AXIS',
      amex: 'AMEX',
      amex_platinum: 'AMEX',
      icici: 'ICICI',
      icici_emeralde: 'ICICI',
      sbi: 'SBI'
    };
    const bankId = ecoToBankId[selectedEcosystem];
    const bank = banksData.find(b => b.bank_id === bankId);
    if (bank) {
      return {
        url: bank.redemption_portal_url,
        name: bank.redemption_portal_name,
        domain: bankId === 'AMEX' ? 'americanexpress.com' : bankId === 'HDFC' ? 'hdfcbank.com' : bankId === 'AXIS' ? 'axisbank.com' : bankId === 'SBI' ? 'sbicard.com' : 'icicibank.com'
      };
    }
    const fallbacks: Record<string, any> = {
      hdfc: { url: 'https://www.hdfcbanksmartbuy.com', name: 'SmartBuy / Rewards360', domain: 'hdfcbank.com' },
      hdfc_infinia: { url: 'https://www.hdfcbanksmartbuy.com', name: 'SmartBuy / Rewards360', domain: 'hdfcbank.com' },
      axis: { url: 'https://traveledge.axisbank.co.in', name: 'Travel EDGE', domain: 'axisbank.com' },
      axis_olympus: { url: 'https://traveledge.axisbank.co.in', name: 'Travel EDGE', domain: 'axisbank.com' },
      amex: { url: 'https://www.americanexpress.com/en-in/rewards/membership-rewards/', name: 'Membership Rewards', domain: 'americanexpress.com' },
      amex_platinum: { url: 'https://www.americanexpress.com/en-in/rewards/membership-rewards/', name: 'Membership Rewards', domain: 'americanexpress.com' },
      icici: { url: 'https://www.icicibank.com/personal-banking/cards/credit-card/rewards/reward-points-redemption', name: 'iMobile Pay / Rewards', domain: 'icicibank.com' },
      icici_emeralde: { url: 'https://www.icicibank.com/personal-banking/cards/credit-card/rewards/reward-points-redemption', name: 'iMobile Pay / Rewards', domain: 'icicibank.com' },
      sbi: { url: 'https://www.sbicard.com/en/personal/benefits/aurum-rewards.page', name: 'SBI AURUM Rewardz Portal', domain: 'sbicard.com' }
    };
    return fallbacks[selectedEcosystem] || { url: '', name: '', domain: '' };
  };

  // AI Trip Advisor handler
  const handleAiTripQuery = async () => {
    if (!aiTripQuery.trim()) return;
    setAiTripLoading(true);
    setAiTripResponse(null);
    try {
      const resp = await fetch('http://localhost:3000/api/v1/engine/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `VACATION PLANNING CONTEXT: ${aiTripQuery}. User has cards: ${myWalletCards.map((c: any) => c.card_name).join(', ')}. Analyze transfer partner options and suggest optimal point redemption strategy for this trip.`,
          user_id: CURRENT_USER_ID,
          host_domain: 'vacation_planner'
        })
      });
      const data = await resp.json();
      setAiTripResponse(data);
    } catch (err) {
      setAiTripResponse({ error: 'AI_TRIP_PLANNING_FAULT', details: 'Failed to reach Cardwise AI engine.' });
    }
    setAiTripLoading(false);
  };


  const conversion = getConvertedMiles();
  const totalSpends = (Number(spendDining) || 0) + (Number(spendGrocery) || 0) + (Number(spendShopping) || 0) + (Number(spendUtilities) || 0) + (Number(spendTravel) || 0) + (Number(spendFuel) || 0) + (Number(spendInsurance) || 0) + (Number(spendRent) || 0) + (Number(spendOthers) || 0) || 1;


  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] min-h-screen font-sans antialiased relative overflow-x-hidden">
      
      {/* Ambient drifting backdrop layers */}
      <div className="env-layer">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="noise-layer"></div>

      {/* Sidebar background glowing orb */}
      <div className="fixed top-12 left-[-120px] w-[350px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-transparent rounded-full filter blur-[80px] pointer-events-none z-0"></div>

      {/* APPLE MUSIC STYLE LIQUID GLASS SIDEBAR */}
      <aside 
        style={{
          backdropFilter: 'blur(40px) saturate(210%)',
          WebkitBackdropFilter: 'blur(40px) saturate(210%)',
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
        }}
        className="fixed top-0 left-0 h-screen w-64 z-[90] hidden md:flex flex-col justify-between py-8 px-6 border-r border-slate-200/40 shadow-[4px_0_24px_rgba(0,0,0,0.01)]"
      >
        {/* Top Area: Brand & Logo */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/10">C</div>
            <span 
              className="text-lg font-black tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: '#0F172A' }}
            >
              cardwise.
            </span>
          </div>

          {/* Navigation menu */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'extension', label: 'Try Extension', icon: '🧩' },
              { id: 'ai_suggest', label: 'Cardwise AI', icon: '🧠', highlight: true },
              { id: 'portfolio', label: 'My Portfolio', icon: '💳' },
              { id: 'profile', label: 'Financial Profile', icon: '📈' },
              { id: 'shop', label: 'Shop Partners', icon: '🛍️' },
              { id: 'redemption', label: 'Redemption Matrix', icon: '🎯' },
              { id: 'vacation', label: 'Vacation Planner', icon: '🌴' },
              { id: 'limited_offers', label: 'Limited Offers', icon: '🔥' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/85 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-indigo-600 font-extrabold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-500/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {tab.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: User info & actions */}
        <div className="space-y-4 border-t border-slate-200/40 pt-6 px-2">
          {isAuth ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account</span>
                <span className="text-xs font-semibold text-slate-700 truncate max-w-full" title={currentUserEmail}>
                  {currentUserEmail}
                </span>
              </div>
              
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    const token = localStorage.getItem('cardwise_auth_token') || '';
                    navigator.clipboard.writeText(token);
                    alert("Sync Key copied to clipboard! You can load this into your extension.");
                  }}
                  className="w-full py-2 text-[10px] font-extrabold tracking-wider bg-pink-500 hover:bg-pink-600 transition-colors text-white rounded-xl uppercase text-center"
                >
                  Copy Sync Key
                </button>
                
                <button
                  onClick={() => {
                    localStorage.removeItem('cardwise_auth_token');
                    localStorage.removeItem('cw_token');
                    localStorage.removeItem('cw_email');
                    document.cookie = 'cardwise_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'cw_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'cw_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    setIsAuth(false);
                    setCurrentUserId("usr_prod_101_cardwise");
                    router.push('/login');
                  }}
                  className="w-full py-2 text-[10px] font-extrabold tracking-wider border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl uppercase transition-colors text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 text-[10px] font-extrabold tracking-wider bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-xl uppercase text-center shadow-md shadow-indigo-500/10"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE COMPACT NAV PILL */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] glass-pane px-4 py-2.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'ai_suggest', label: 'AI' },
          { id: 'portfolio', label: 'Portfolio' },
          { id: 'shop', label: 'Shop' },
          { id: 'redemption', label: 'Redemption' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-extrabold transition-colors duration-200 ${
                isActive ? 'text-indigo-600' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DYNAMIC VIEWS CONTROLLER AREA */}
      <main className="pt-8 md:pt-12 px-4 md:px-8 md:pl-72 pb-24 w-full max-w-7xl mx-auto relative z-10">
        
        {/* Mobile-only Top Brand Header */}
        <div className="md:hidden flex items-center justify-between w-full pb-5 border-b border-slate-200/60 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">C</div>
            <span className="text-lg font-black tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#0F172A' }}>cardwise.</span>
          </div>
          {isAuth && (
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
              {currentUserEmail.split('@')[0]}
            </span>
          )}
        </div>

        {activeTab === 'extension' && (
          <div className="max-w-4xl space-y-6 relative z-10 anim-fade-in-up">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-display font-extrabold tracking-tighter text-[#0F172A]">Try Browser Extension</h2>
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
                <h2 className="text-2xl font-display font-bold tracking-tight text-[#0F172A]">Financial Profile & AI Wallet Audit</h2>
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Ambuj Tiwari"
                      className="w-full glass-input rounded-xl p-3 text-sm"
                    />
                  </div>
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
                <h2 className="text-2xl font-display font-bold tracking-tight text-[#0F172A]">My Active Portfolio</h2>
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
            <div className="glass-pane p-6 rounded-2xl relative z-30">
              <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-bold mb-3">
                ➕ PROVISION NEW ASSET TO PORTFOLIO
              </h3>
              
              <div className="relative z-20">
                <input 
                  type="text"
                  value={widgetSearchQuery}
                  onChange={(e) => handleWidgetCardSearch(e.target.value)}
                  placeholder="Enter Bank or Variant Name (e.g. SBI, HDFC)..."
                  className="w-full glass-input rounded-xl p-3 text-sm"
                />

                {widgetSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto">
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
          <div className="max-w-6xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight text-[#0F172A]">Shop Direct Partners</h2>
                <p className="text-sm text-[#64748B] mt-1">Top-yielding credit cards combined with CashKaro-style affiliate commissions.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Center Column: Shopping Hub Table */}
              <div className="lg:col-span-2 glass-pane rounded-2xl overflow-hidden shadow-sm">
                <div className="border-b border-[#E2E8F0] p-6 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">Smart Shopping Partner Hub</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Stack credit card rewards with direct affiliate cashback for maximum savings.</p>
                  </div>
                  <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2.5 py-1 rounded-lg">
                    {SHOP_PARTNERS_LIST.length} Brands Available
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                        <th className="p-4 pl-6">Merchant Partner</th>
                        <th className="p-4">Best Card Yield</th>
                        <th className="p-4 text-center">Affiliate Rate</th>
                        <th className="p-4 text-center">Combined Yield</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {SHOP_PARTNERS_LIST.map((shop) => {
                        const optimal = partnerYields[shop.name];
                        const ccYield = optimal ? (optimal.yield_percentage || 0) : 0;
                        const combinedYield = ccYield + shop.affiliate_rate;

                        return (
                          <tr key={shop.name} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 p-1.5 flex items-center justify-center shadow-xs shrink-0">
                                  <img src={shop.logo} alt={shop.name} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div>
                                  <span className="font-bold text-[#0F172A] block text-xs md:text-sm">{shop.name}</span>
                                  <span className="text-[10px] text-[#94A3B8] font-mono leading-tight block mt-0.5">{shop.domain} • {shop.type}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {optimal ? (
                                <div className="space-y-0.5">
                                  <span className="text-xs font-bold text-[#0F172A] block truncate max-w-[140px]">
                                    {optimal.display_label || 'None'}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded-md">
                                    +{ccYield.toFixed(1)}% Rewards
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-[#64748B] italic">No cards added</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                                +{shop.affiliate_rate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center gap-0.5 text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2.5 py-1.5 rounded-xl shadow-xs">
                                💥 {combinedYield.toFixed(1)}% Savings
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => runPartnerAnalysis(shop.name, shop.domain)}
                                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                                    selectedPartnerForAnalysis === shop.name
                                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                                      : 'bg-white hover:bg-slate-50 border-slate-200 text-[#64748B] hover:text-[#0F172A]'
                                  }`}
                                >
                                  Analyze
                                </button>
                                <button 
                                  onClick={() => setRedirectingPartner(shop)}
                                  style={{ backgroundColor: shop.color }}
                                  className="text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
                                >
                                  Shop & Earn ↗
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Side Analysis & Stacking Guide */}
              <div className="lg:col-span-1 space-y-4">
                <div className="glass-pane p-6 rounded-2xl flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-bold border-b border-slate-100 pb-2">
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
                                  <h4 className="text-xs font-bold text-[#0F172A]">{rec.display_label}</h4>
                                </div>
                                {rec.gimmick_alert && (
                                  <p className="text-[9px] text-amber-700 mt-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{rec.gimmick_alert}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-indigo-600 block">+{rec.yield_percentage}%</span>
                                <span className="text-[9px] text-[#64748B] block">CC Yield</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#64748B] italic">No recommendations calculated. Add cards to your active portfolio ledger to match rules.</p>
                      )
                    ) : (
                      <p className="text-xs text-[#64748B] italic">Click "Analyze" on any direct brand partner to compute the dynamic yielding comparison tier lists.</p>
                    )}

                    {/* Strategic Optimization Guide */}
                    {selectedPartnerForAnalysis && (
                      <div className="bg-indigo-50/30 border border-indigo-100/60 p-4 rounded-2xl space-y-2 mt-4">
                        <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                          💡 Strategic Stacking Guide
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {(() => {
                            const partner = SHOP_PARTNERS_LIST.find(p => p.name === selectedPartnerForAnalysis);
                            if (!partner) return "Check card accelerator portals and GyFTR voucher multipliers to stack savings.";
                            
                            if (partner.name.includes('Amazon')) {
                              return "Pro-Tip: Buy Amazon Pay gift vouchers on HDFC SmartBuy / GyFTR using Infinia to earn 5X reward points (16.6% yield) instead of shopping directly at 1%!";
                            } else if (partner.name.includes('Flipkart')) {
                              return "Pro-Tip: Purchase Flipkart vouchers via Axis EDGE Rewards/Grab Deals using Olympus/Magnus for up to 5X reward points!";
                            } else if (partner.name.includes('Myntra')) {
                              return "Pro-Tip: Buy Myntra vouchers on GyFTR for a flat 7% discount or 5X rewards, then stack with Cardwise affiliate tracking for up to 23% total value!";
                            } else if (partner.name.includes('Ajio')) {
                              return "Pro-Tip: Check Grab Deals / SmartBuy portals for Ajio voucher promotions. Stacking vouchers with affiliate commission yields maximum savings.";
                            } else if (partner.name.includes('Nykaa')) {
                              return "Pro-Tip: Use HDFC Infinia on SmartBuy GyFTR to buy Nykaa vouchers for 5X reward points (16.6% value) before applying the affiliate tracking!";
                            } else if (partner.name.includes('Tata')) {
                              return "Pro-Tip: Tata CLiQ orders offer flat 5X points on Amex Reward Multiplier. Stack with the 6% affiliate rate for over 11% savings!";
                            } else if (partner.name.includes('Reliance')) {
                              return "Pro-Tip: For high-value electronics, compare HDFC SmartBuy vs Grab Deals. Purchasing vouchers first always beats direct card swipes.";
                            } else if (partner.name.includes('Swiggy')) {
                              return "Pro-Tip: Use Swiggy HDFC Bank credit card directly for flat 10% cashback on Swiggy, or buy Swiggy vouchers via GyFTR for 5X rewards!";
                            } else if (partner.name.includes('Zomato')) {
                              return "Pro-Tip: Zomato payments via card often trigger food category bonuses (e.g. 5X on select cards). Stack with the affiliate link to optimize your meal cost.";
                            } else if (partner.name.includes('BookMyShow')) {
                              return "Pro-Tip: Skip reward points and use the BOGO (Buy One Get One Free) ticket privileges on premium cards (Infinia, Axis Magnus, ICICI Emeralde) directly on BMS!";
                            } else if (partner.name.includes('MakeMyTrip')) {
                              return "Pro-Tip: Look out for bank-specific flight discount codes (e.g. HDFCMMT, AXISMMT) before checkout to stack direct discounts with points + affiliate rates.";
                            }
                            return "Check card accelerator portals and GyFTR voucher multipliers to stack savings.";
                          })()}
                        </p>
                      </div>
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
          </div>
        )}

        {/* TAB 4: REDEMPTION MATRIX */}
        {activeTab === 'redemption' && (
          <CardwiseRedemptionMatrix />
        )}

        {/* TAB 5: CARDWISE AI CONVERSATIONAL HUB */}
        {activeTab === 'ai_suggest' && (
          <div 
            className="max-w-4xl w-full mx-auto flex flex-col h-[calc(100vh-8rem)] relative z-10 anim-fade-in-up"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag-over overlay */}
            {isDragOver && (
              <div className="drag-overlay animate-pulse">
                <div className="text-center text-indigo-600 space-y-2">
                  <span className="text-4xl">📎</span>
                  <p className="font-bold text-sm">Drop your image here to upload</p>
                </div>
              </div>
            )}

            {/* Header Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 mb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-display font-extrabold tracking-tight text-[#0F172A]">Cardwise AI</h2>
                  <span className="text-[10px] font-black tracking-wider px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full uppercase shadow-sm">Gemini 3.1 Pro</span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  {myWalletCards.length} {myWalletCards.length === 1 ? 'card' : 'cards'} in wallet · active strategy: <span className="font-bold text-[#0F172A]">{profileGoal.replace('_', ' ')}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs bg-indigo-50 border border-indigo-100/50 rounded-xl px-3 py-1.5 font-semibold text-indigo-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                AI Core Active
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 pb-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl shadow-sm border border-indigo-100/50 animate-bounce">
                    🧠
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-lg font-bold text-[#0F172A]">Welcome to Cardwise AI</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Ask me anything about maximizing rewards, comparing credit card limits, finding checkout deals, or mapping point-to-mile transfer ratios. You can also drag in images or paste product links!
                    </p>
                  </div>

                  {/* Quick Action Chips */}
                  <div className="grid grid-cols-2 gap-3 max-w-xl w-full pt-4">
                    {[
                      "Which card for Amazon ₹5K order?",
                      "Analyze my monthly spending",
                      "Best transfer partner for Bali trip",
                      "Compare HDFC Infinia vs Axis Atlas"
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => runCardwiseChat(undefined, chip)}
                        className="text-xs text-left p-3.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition-all font-semibold text-[#0F172A] shadow-sm hover:scale-[1.01]"
                      >
                        {chip} →
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} anim-scale-in`}>
                        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                          
                          {/* Image Attachment (inline preview) */}
                          {msg.image && (
                            <div className="mb-3 max-w-xs relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                              <img src={msg.image} alt="User upload" className="w-full h-auto object-cover max-h-48" />
                            </div>
                          )}

                          {/* Link Attachment (inline preview) */}
                          {msg.url && (
                            <div className="mb-3 flex items-center gap-3 p-2.5 rounded-xl border border-[#E2E8F0] bg-slate-50/50 max-w-sm">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xs shrink-0 font-bold">🔗</div>
                              <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">Pasted Context Link</p>
                                <a href={msg.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline block truncate">
                                  {msg.url}
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Message Text (Markdown formatting helper) */}
                          <div className="whitespace-pre-wrap select-text text-sm">
                            {msg.text.split('\n').map((line, lIdx) => {
                              let content: React.ReactNode = line;
                              
                              if (line.includes('**')) {
                                const parts = line.split('**');
                                content = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-black">{part}</strong> : part);
                              }

                              if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                                return (
                                  <li key={lIdx} className="ml-4 list-disc pl-1 mt-1">
                                    {line.replace(/^[\-\*]\s+/, '')}
                                  </li>
                                );
                              }

                              return (
                                <p key={lIdx} className="mb-1 leading-relaxed">
                                  {content}
                                </p>
                              );
                            })}
                          </div>

                          <div className="text-[9px] mt-2 block font-medium text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Chat Loading / Typing state */}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input Dock */}
            <div className="border border-slate-200/85 bg-white rounded-2xl p-3 shadow-md shrink-0">
              
              {/* Optional URL bar */}
              {showUrlInput && (
                <div className="flex items-center gap-2 mb-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 anim-scale-in">
                  <span className="text-xs">🔗</span>
                  <input
                    type="text"
                    value={chatUrlInput}
                    onChange={(e) => setChatUrlInput(e.target.value)}
                    placeholder="Paste context URL (e.g. product/deal link)..."
                    className="flex-1 bg-transparent text-xs text-[#0F172A] focus:outline-none placeholder:text-[#94A3B8]"
                  />
                  <button 
                    onClick={() => { setChatUrlInput(''); setShowUrlInput(false); }}
                    className="text-slate-400 hover:text-rose-500 font-bold text-xs"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Optional Image Preview card */}
              {chatImagePreview && (
                <div className="flex items-center gap-3 mb-3 bg-slate-50 border border-slate-200 rounded-xl p-2 max-w-xs relative anim-scale-in">
                  <img src={chatImagePreview} alt="Upload preview" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Image Attached</p>
                    <p className="text-[9px] text-[#64748B] truncate">Ready to analyze</p>
                  </div>
                  <button 
                    onClick={() => setChatImagePreview(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Image Attach Button */}
                <button
                  onClick={() => chatFileInputRef.current?.click()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    chatImagePreview ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' : 'bg-slate-50 hover:bg-slate-100 text-[#64748B]'
                  }`}
                  title="Attach image (e.g. checkout screenshot)"
                >
                  📎
                </button>
                <input
                  type="file"
                  ref={chatFileInputRef}
                  onChange={handleChatImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Paste URL Button */}
                <button
                  onClick={() => setShowUrlInput(prev => !prev)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    showUrlInput ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' : 'bg-slate-50 hover:bg-slate-100 text-[#64748B]'
                  }`}
                  title="Attach deal or product URL"
                >
                  🔗
                </button>

                {/* Text input area */}
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      runCardwiseChat();
                    }
                  }}
                  placeholder="Ask Cardwise AI: Which card fits this checkout best? How to optimize points?"
                  className="flex-1 bg-transparent text-sm text-[#0F172A] focus:outline-none placeholder:text-[#94A3B8] resize-none h-10 py-2.5 max-h-24"
                />

                {/* Send Button */}
                <button
                  onClick={() => runCardwiseChat()}
                  disabled={chatLoading || (!chatInput.trim() && !chatImagePreview)}
                  className="btn-spectral px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
                >
                  <span>Send</span>
                  <span>⚡</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: VACATION & TRANSFER HUB — Professional Grade */}
        {activeTab === 'vacation' && (
          <div className="max-w-6xl space-y-6">

            {/* ── PARTNER DETAIL MODAL ── */}
            {selectedTransferPartner && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTransferPartner(null)}>
                <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header with brand color */}
                  <div className="p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${selectedTransferPartner.color}, ${selectedTransferPartner.color}dd)` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <img src={getPartnerLogoUrl(selectedTransferPartner)} referrerPolicy="no-referrer" alt={selectedTransferPartner.name} className="w-14 h-14 rounded-xl bg-white/20 p-1.5 backdrop-blur-sm shadow-lg object-contain" />
                      <div>
                        <h3 className="text-xl font-black">{selectedTransferPartner.name}</h3>
                        <p className="text-sm font-medium opacity-90">{selectedTransferPartner.program}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedTransferPartner(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors text-white font-bold text-sm">✕</button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-5">
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Transfer Ratio</p>
                        <p className="text-lg font-black text-[#0F172A] mt-0.5">{selectedTransferPartner.ratio}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Value/Mile</p>
                        <p className="text-lg font-black text-emerald-600 mt-0.5">₹{selectedTransferPartner.valuePerMile.toFixed(1)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Alliance</p>
                        <p className="text-sm font-bold text-[#0F172A] mt-1">{selectedTransferPartner.alliance}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1.5">Redemption Strategy</p>
                      <p className="text-sm text-[#334155] leading-relaxed">{selectedTransferPartner.desc}</p>
                    </div>

                    {/* Transfer Group */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase ${selectedTransferPartner.group === 'A' ? 'bg-amber-500/10 text-amber-600 border border-amber-200' : selectedTransferPartner.group === 'B' ? 'bg-blue-500/10 text-blue-600 border border-blue-200' : 'bg-purple-500/10 text-purple-600 border border-purple-200'}`}>
                        Group {selectedTransferPartner.group}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase ${selectedTransferPartner.type === 'airline' ? 'bg-sky-500/10 text-sky-600 border border-sky-200' : 'bg-amber-500/10 text-amber-600 border border-amber-200'}`}>
                        {selectedTransferPartner.type === 'airline' ? '✈️ Airline' : '🏨 Hotel'}
                      </span>
                    </div>

                    {/* Portal Links */}
                    <div className="space-y-2">
                      <a href={selectedTransferPartner.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between w-full bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl px-5 py-3.5 transition-colors group">
                        <div className="flex items-center gap-3">
                          <img src={getPartnerLogoUrl(selectedTransferPartner)} referrerPolicy="no-referrer" alt="" className="w-5 h-5 rounded object-contain" />
                          <span className="text-sm font-bold">Open {selectedTransferPartner.name} Official Site</span>
                        </div>
                        <span className="text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                      </a>
                      {(() => {
                        const portal = getBankPortalInfo();
                        if (!portal.url) return null;
                        return (
                          <a href={portal.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-5 flex items-center justify-center shrink-0">
                                <BankLogo id={selectedEcosystem} className="h-4 max-w-full object-contain" />
                              </div>
                              <span className="text-sm font-semibold text-[#0F172A]">{portal.name} Portal</span>
                            </div>
                            <span className="text-xs font-mono text-[#64748B] group-hover:text-[#0F172A] transition-colors">↗</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PAGE HEADER ── */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight text-[#0F172A]">Vacation & Transfer Hub</h2>
                <p className="text-sm text-[#64748B] mt-1">Manage airline & hotel point transfers across your premium card ecosystems.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Goal Sync: {profileGoal.replace('_', ' ')}</span>
              </div>
            </div>

            {/* ── AI TRIP ADVISOR (Full Width, Top) ── */}
            <div className="glass-pane rounded-2xl p-6 space-y-4 border-2 border-indigo-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">🧠</div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] font-display">Cardwise AI Trip Advisor</h3>
                  <p className="text-[11px] text-[#64748B]">Powered by Gemini 3.1 Pro — Get personalized transfer recommendations based on your wallet & points.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={aiTripQuery}
                  onChange={(e) => setAiTripQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiTripQuery()}
                  placeholder="e.g., Plan my 7-day Europe trip using Infinia points for 2 adults..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
                <button
                  onClick={handleAiTripQuery}
                  disabled={aiTripLoading || !aiTripQuery.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/10"
                >
                  {aiTripLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Analyzing...
                    </span>
                  ) : 'Ask AI'}
                </button>
              </div>

              {/* AI Response */}
              {aiTripResponse && (
                <div className="bg-gradient-to-br from-indigo-50/50 to-violet-50/30 border border-indigo-100 rounded-xl p-5 space-y-3 anim-scale-in">
                  {aiTripResponse.error ? (
                    <div className="text-sm text-red-500 font-medium">{aiTripResponse.details || 'An error occurred.'}</div>
                  ) : (
                    <>
                      {aiTripResponse.top_recommendations && aiTripResponse.top_recommendations.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-2">AI Recommended Cards</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {aiTripResponse.top_recommendations.slice(0, 3).map((rec: any, idx: number) => (
                              <div key={idx} className="bg-white rounded-lg p-3 flex items-center gap-3 border border-slate-100 shadow-sm">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-[#64748B]'}`}>#{idx+1}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[#0F172A] truncate">{rec.card_name || rec.card_id}</p>
                                  <p className="text-[10px] text-[#64748B]">{rec.yield_pct}% reward yield • ~₹{rec.net_savings} savings</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiTripResponse.ai_insight && (
                        <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-1.5">AI Analysis</p>
                          <p className="text-sm text-[#334155] leading-relaxed">{aiTripResponse.ai_insight}</p>
                        </div>
                      )}
                      {aiTripResponse.flags && aiTripResponse.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {aiTripResponse.flags.map((flag: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-md">{flag}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Best card for flights to Europe?',
                  'Optimize 50K Infinia points for Bali trip',
                  'Compare Singapore vs Qatar transfer value',
                  'Hotel strategy for 7 nights in Goa'
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setAiTripQuery(prompt); }}
                    className="text-[11px] font-medium text-[#64748B] hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg px-3 py-1.5 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* ── ECOSYSTEM SELECTOR ── */}
            <div className="flex items-center gap-3">
              {[
                { id: 'hdfc', label: 'HDFC Bank', count: (transferPartners.hdfc || transferPartners.hdfc_infinia || []).length, color: '#004B87', domain: 'hdfcbank.com' },
                { id: 'axis', label: 'Axis Bank', count: (transferPartners.axis || transferPartners.axis_olympus || []).length, color: '#97144D', domain: 'axisbank.com' },
                { id: 'sbi', label: 'SBI Card', count: (transferPartners.sbi || []).length, color: '#00A4E4', domain: 'sbicard.com' },
                { id: 'amex', label: 'American Express', count: (transferPartners.amex || transferPartners.amex_platinum || []).length, color: '#001A9C', domain: 'americanexpress.com' },
                { id: 'icici', label: 'ICICI Bank', count: (transferPartners.icici || transferPartners.icici_emeralde || []).length, color: '#FF6F00', domain: 'icicibank.com' }
              ].map((eco) => (
                <button
                  key={eco.id}
                  onClick={() => { setSelectedEcosystem(eco.id); setVacationPartner(''); }}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    selectedEcosystem === eco.id 
                      ? 'border-indigo-300 bg-white shadow-lg shadow-indigo-500/5 scale-[1.02]' 
                      : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-16 h-8 flex items-center justify-center shrink-0">
                    <BankLogo id={eco.id} className="h-6 max-w-full object-contain" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${selectedEcosystem === eco.id ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{eco.label}</p>
                    <p className="text-[10px] text-[#94A3B8]">{eco.count} transfer partners</p>
                  </div>
                  {selectedEcosystem === eco.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>
                  )}
                </button>
              ))}
            </div>

            {/* ── MAIN CONTENT GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Column: Mileage Calculator */}
              <div className="lg:col-span-1 space-y-4">
                <div className="glass-pane p-5 rounded-2xl space-y-4 sticky top-6">
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#64748B] font-black flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600 text-[9px]">⚡</span>
                    MILEAGE CALCULATOR
                  </h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">Portfolio Card</label>
                    <select 
                      value={vacationCard} 
                      onChange={(e) => setVacationCard(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    >
                      {myWalletCards.map((c: any) => (
                        <option key={c.card_id} value={c.card_id}>{c.card_name}</option>
                      ))}
                      {myWalletCards.length === 0 && <option value="">No active cards</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">Points Quantity</label>
                    <input 
                      type="number"
                      value={vacationPoints}
                      onChange={(e) => setVacationPoints(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">Transfer Partner</label>
                    <select 
                      value={vacationPartner} 
                      onChange={(e) => setVacationPartner(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    >
                      <option value="">Select partner...</option>
                      {(transferPartners[selectedEcosystem] || []).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.type === 'airline' ? '✈️' : '🏨'} {p.name} ({p.ratio})</option>
                      ))}
                    </select>
                  </div>

                  {/* Results Panel */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 rounded-xl space-y-2.5 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Transfer Miles</span>
                      <span className="text-sm font-black text-[#0F172A] font-mono">{conversion.miles.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Cash Value</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">~₹{conversion.value.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/50">
                      <p className="text-[10px] text-[#64748B] leading-relaxed">{conversion.desc}</p>
                    </div>
                  </div>

                  {/* Bank Transfer Portal Link */}
                  {(() => {
                    const portal = getBankPortalInfo();
                    if (!portal.url) return null;
                    
                    const bankColors: Record<string, string> = {
                      hdfc: 'bg-[#004B87] hover:bg-[#003A6B]',
                      hdfc_infinia: 'bg-[#004B87] hover:bg-[#003A6B]',
                      axis: 'bg-[#97144D] hover:bg-[#7A103F]',
                      axis_olympus: 'bg-[#97144D] hover:bg-[#7A103F]',
                      amex: 'bg-[#001A9C] hover:bg-[#001375]',
                      amex_platinum: 'bg-[#001A9C] hover:bg-[#001375]',
                      icici: 'bg-[#FF6F00] hover:bg-[#CC5900]',
                      icici_emeralde: 'bg-[#FF6F00] hover:bg-[#CC5900]',
                      sbi: 'bg-[#00A4E4] hover:bg-[#0089BE]'
                    };
                    const colorClass = bankColors[selectedEcosystem] || 'bg-[#0F172A] hover:bg-[#1E293B]';

                    return (
                      <a href={portal.url} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2.5 w-full ${colorClass} text-white rounded-xl px-4 py-2.5 transition-all text-xs font-bold shadow-sm hover:scale-[1.01]`}>
                        <div className="w-10 h-5 flex items-center justify-center shrink-0 bg-white/10 rounded px-1">
                          <BankLogo id={selectedEcosystem} className="h-3 max-w-full object-contain brightness-0 invert" />
                        </div>
                        Open {portal.name} ↗
                      </a>
                    );
                  })()}
                </div>
              </div>

              {/* Right Column: Partner Grid */}
              <div className="lg:col-span-3 space-y-6">

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  {[
                    { id: 'all' as const, label: 'All Partners', icon: '🌐' },
                    { id: 'airline' as const, label: 'Airlines', icon: '✈️' },
                    { id: 'hotel' as const, label: 'Hotels', icon: '🏨' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPartnerFilter(f.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        partnerFilter === f.id 
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md' 
                          : 'bg-white text-[#64748B] border-slate-200 hover:bg-slate-50 hover:text-[#0F172A]'
                      }`}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                  <span className="ml-auto text-[11px] text-[#94A3B8] font-semibold">
                    {getActivePartners().length} partners available
                  </span>
                </div>

                {/* Partner Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {getActivePartners().map((partner: any) => (
                    <button
                      key={partner.id}
                      onClick={() => setSelectedTransferPartner(partner)}
                      className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 overflow-hidden bg-white">
                          <img 
                            src={getPartnerLogoUrl(partner)} 
                            referrerPolicy="no-referrer" 
                            alt={partner.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-indigo-600 transition-colors">{partner.name}</h4>
                          <p className="text-[10px] text-[#94A3B8] font-medium truncate">{partner.program}</p>
                        </div>
                        <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8]">→</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${partner.type === 'airline' ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {partner.type === 'airline' ? '✈️' : '🏨'} {partner.type}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-50 text-[#64748B] border border-slate-100 font-mono">
                          {partner.ratio}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                          ₹{partner.valuePerMile}/mi
                        </span>
                        {partner.alliance !== 'N/A' && partner.alliance !== 'LCC' && partner.alliance !== 'Independent' && (
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-violet-50 text-violet-500 border border-violet-100">
                            {partner.alliance}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Transfer Caps Info */}
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm shrink-0">⚠️</div>
                  <div>
                    <p className="text-xs font-bold text-amber-700">Transfer Limits & Important Notes</p>
                    {selectedEcosystem === 'hdfc' || selectedEcosystem === 'hdfc_infinia' ? (
                      <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">
                        Monthly transfer cap: 1.5L points via SmartBuy/Rewards360. Transfer in multiples of 100. All transfers are final and non-reversible. Always verify current ratios on SmartBuy portal.
                      </p>
                    ) : selectedEcosystem === 'sbi' ? (
                      <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">
                        SBI AURUM & Co-branded Point Transfers: Convert points to British Airways, Singapore Airlines, Etihad Guest, Air India, ITC Hotels, IHG, Wyndham (at 1:1 ratio), and ALL Accor Live Limitless (at 2:1 ratio). All transfers are final and non-reversible. Credit times vary between 3-7 business days.
                      </p>
                    ) : selectedEcosystem === 'axis' || selectedEcosystem === 'axis_olympus' ? (
                      <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">
                        Olympus annual cap: 750K points (150K Group A + 600K Group B). Min transfer: 300 EDGE Points / 500 EDGE Miles. As of Apr 2, 2026: Accor, Marriott, Qatar removed. BA, Finnair, Vietnam Airlines added.
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">
                        Redemption rules are governed by the respective issuer bank loyalty program guidelines. Transfers are final and non-reversible. Check partner sites directly for the latest award availability.
                      </p>
                    )}
                  </div>
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
                <h2 className="text-2xl font-display font-bold tracking-tight text-[#0F172A]">Explore Card Offers</h2>
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

      </main>

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
                          <span className="text-[#0F172A] font-bold text-[11px]">{post.source_x_profile && post.source_x_profile.startsWith('@') ? post.source_x_profile : `@${post.source_x_profile || 'AmazingCreditC'}`}</span>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => removeCardFromPortfolio(selectedDetailCard.card_id, selectedDetailCard.card_name)}
                  className="px-3.5 py-1.5 rounded-xl border border-red-200 hover:border-red-300 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5 shadow-sm bg-white"
                  title="Remove Card from Active Wallet"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Card
                </button>
                <button 
                  onClick={() => { setSelectedDetailCard(null); setSelectedCardRules([]); }}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors bg-white shadow-sm font-bold"
                >
                  ✕
                </button>
              </div>
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

                          {selectedDetailCard.official_link && (
                            <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex flex-col justify-between space-y-3 md:col-span-2 shadow-sm">
                              <div>
                                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Official specs & terms</span>
                                <h5 className="text-xs font-bold text-[#0F172A] mt-1">{selectedDetailCard.card_name} Product Page</h5>
                              </div>
                              <a 
                                href={selectedDetailCard.official_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-center bg-slate-950 hover:bg-slate-800 text-white font-bold text-[10px] py-2 px-3 rounded-lg transition-colors block"
                              >
                                View Official Card Page ↗
                              </a>
                            </div>
                          )}
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

      {/* ── AFFILIATE REDIRECT MODAL ── */}
      {redirectingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 text-center transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-200">
            
            {/* Logos and Connection Animation */}
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
                cw
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                <span className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-2 flex items-center justify-center shadow-lg">
                <img src={redirectingPartner.logo} alt={redirectingPartner.name} className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            {/* Header */}
            <div>
              <h3 className="text-xl font-black text-[#0F172A]">Securing Affiliate Commission</h3>
              <p className="text-xs text-[#64748B] mt-1">Connecting to {redirectingPartner.name} with CashKaro-grade tracking.</p>
            </div>

            {/* Checklist */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Affiliate Referral Link Secured</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Cardwise Unique Click ID Embedded</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Optimal Card Reward Yield Pre-Selected</span>
              </div>
            </div>

            {/* Math Breakdown */}
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Credit Card Yield:</span>
                <span className="font-bold text-slate-800">
                  +{partnerYields[redirectingPartner.name]?.yield_percentage || 0}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Affiliate Commission:</span>
                <span className="font-bold text-emerald-600">+{redirectingPartner.affiliate_rate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm font-black text-indigo-700 border-t border-indigo-100 pt-2 mt-1">
                <span>Total Combined Savings:</span>
                <span>
                  {((partnerYields[redirectingPartner.name]?.yield_percentage || 0) + redirectingPartner.affiliate_rate).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Bar & Countdown */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${((3 - redirectCountdown) / 3) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#64748B] italic">
                Redirecting in <span className="font-bold text-indigo-600 font-mono text-sm">{redirectCountdown}</span> seconds...
              </p>
            </div>

            {/* Manual controls */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setRedirectingPartner(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <a 
                href={redirectingPartner.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setRedirectingPartner(null)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl text-center shadow-md shadow-indigo-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
              >
                Open Shop Now
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
