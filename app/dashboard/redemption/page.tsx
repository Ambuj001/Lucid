'use client';

import React, { useState, useEffect } from 'react';

// Top 20 Indian credit card issuing banks and their loyalty program metrics
const BANK_REWARD_METRICS = [
  {
    bank_id: 'HDFC',
    bank_name: 'HDFC Bank',
    logo_letter: 'H',
    portal_name: 'HDFC MyCards & SmartBuy Portal',
    portal_url: 'https://mycards.hdfcbank.com/',
    category: 'private',
    cards: [
      { id: 'hdfc_infinia', name: 'Infinia Metal Edition', ratio: 1.00, note: 'Valid at ₹1.00 only when redeemed via SmartBuy travel/flights.' },
      { id: 'hdfc_regalia', name: 'Regalia Gold', ratio: 0.50, note: 'Redeemed via SmartBuy products catalog or flight portals.' },
      { id: 'hdfc_millennia', name: 'Millennia CashBack', ratio: 1.00, note: '1 CashPoint = ₹1.00 statement credit.' }
    ],
    terms: 'Reward points expire automatically after 2 to 3 years depending on the variant. Rental and fuel spends are completely excluded from baseline point accruals.'
  },
  {
    bank_id: 'SBI',
    bank_name: 'SBI Card',
    logo_letter: 'S',
    portal_name: 'SBI Card Reward Store Portal',
    portal_url: 'https://www.sbicard.com/en/webapps/oauth/login',
    category: 'public',
    cards: [
      { id: 'sbi_cashback', name: 'SBI CashBack Card', ratio: 1.00, note: 'Cashback auto-credits straight to your statement balance within 2 cycles.' },
      { id: 'sbi_prime', name: 'SBI Card Prime', ratio: 0.25, note: '4 Points = ₹1.00. Flat cash redemption fees of ₹99 + GST applies.' },
      { id: 'sbi_aurum', name: 'SBI Aurum', ratio: 1.00, note: '1 Pt = ₹1.00 on flights/hotels. Ratios scale lower for general cash redemption.' }
    ],
    terms: 'A dynamic redemption convenience fee of ₹99 plus applicable taxes is levied on every separate reward catalog settlement transaction.'
  },
  {
    bank_id: 'AXIS',
    bank_name: 'Axis Bank',
    logo_letter: 'X',
    portal_name: 'Axis EDGE Rewards & Travel EDGE',
    portal_url: 'https://edgerewards.axisbank.co.in/',
    category: 'private',
    cards: [
      { id: 'axis_atlas', name: 'Axis Atlas (Edge Miles)', ratio: 1.00, note: '1 Edge Mile = ₹1.00 when redeemed on Axis Travel EDGE portal.' },
      { id: 'axis_magnus', name: 'Magnus / Reserve', ratio: 0.20, note: 'Standard points catalog conversion. Partnership transfer ratios vary.' },
      { id: 'axis_flipkart', name: 'Flipkart Axis Cashback', ratio: 1.00, note: 'Cashback auto-credits straight to statement balance.' }
    ],
    terms: 'Edge rewards have dynamic transfer caps per calendar year to partners. Convenience fees apply to select catalog items.'
  },
  {
    bank_id: 'AMEX',
    bank_name: 'American Express',
    logo_letter: 'A',
    portal_name: 'Amex Membership Rewards',
    portal_url: 'https://www.americanexpress.com/in/rewards/membership-rewards/',
    category: 'foreign',
    cards: [
      { id: 'amex_plat_travel', name: 'Platinum Travel Card', ratio: 0.40, note: 'Value scales to ₹0.50+ when transferring points to Marriott Bonvoy.' },
      { id: 'amex_mrcc', name: 'Membership Rewards Card (MRCC)', ratio: 0.25, note: 'Optimized best when taking the 18,000 or 24,000 Karat Gold Collection statement options.' },
      { id: 'amex_gold', name: 'Gold Card', ratio: 0.33, note: 'Optimized best when redeeming points for 24 Karat Gold Collection vouchers.' }
    ],
    terms: 'Amex Membership Rewards points do not have an expiration date, provided your card account remains active and in good standing.'
  },
  {
    bank_id: 'ICICI',
    bank_name: 'ICICI Bank',
    logo_letter: 'I',
    portal_name: 'iMobile Pay Reward Points Portal',
    portal_url: 'https://www.icicibank.com/',
    category: 'private',
    cards: [
      { id: 'icici_amazon', name: 'Amazon Pay ICICI', ratio: 1.00, note: 'Auto-credited to Amazon Pay balance at 1 Point = ₹1.00 value.' },
      { id: 'icici_emeralde', name: 'Emeralde / Sapphiro', ratio: 0.25, note: '1 Point = ₹0.25 statement cash credit or product catalog value.' }
    ],
    terms: 'Convenience redemption fees of ₹99 plus taxes applicable for physical rewards catalog deliveries.'
  },
  {
    bank_id: 'KOTAK',
    bank_name: 'Kotak Mahindra Bank',
    logo_letter: 'K',
    portal_name: 'Kotak Rewards Portal',
    portal_url: 'https://www.kotak.com/',
    category: 'private',
    cards: [
      { id: 'kotak_white', name: 'Kotak White Card', ratio: 1.00, note: 'White Pass value scales up to ₹1.00 when redeemed for flights/vouchers.' },
      { id: 'kotak_league', name: 'League / Royale Gold', ratio: 0.10, note: 'Standard reward points catalog value. 1 Point = ₹0.10.' }
    ],
    terms: 'Points expire after 2 years. Selected co-branded programs have variable redemption caps.'
  },
  {
    bank_id: 'IDFC',
    bank_name: 'IDFC FIRST Bank',
    logo_letter: 'D',
    portal_name: 'IDFC FIRST Rewards Portal',
    portal_url: 'https://www.idfcfirstbank.com/',
    category: 'private',
    cards: [
      { id: 'idfc_wealth', name: 'IDFC Wealth / Select', ratio: 0.25, note: 'Points never expire. 1 Reward Point = ₹0.25 value.' },
      { id: 'idfc_millennia', name: 'IDFC FIRST Millennia', ratio: 0.25, note: '1 Reward Point = ₹0.25. Redeemable for catalog products and voucher store.' }
    ],
    terms: 'Points do not expire. Zero cash redemption fees on statement credit points settlement.'
  },
  {
    bank_id: 'RBL',
    bank_name: 'RBL Bank',
    logo_letter: 'R',
    portal_name: 'RBL Rewards Store Portal',
    portal_url: 'https://www.rblrewards.com/',
    category: 'private',
    cards: [
      { id: 'rbl_world_safari', name: 'World Safari Card', ratio: 0.25, note: '1 Point = ₹0.25 value when redeemed for flights and hotels.' },
      { id: 'rbl_shoprite', name: 'Shoprite / Platinum Max', ratio: 0.25, note: '1 Point = ₹0.25. Best value on voucher redemptions.' }
    ],
    terms: 'Rewards catalog redemptions carry a flat handling fee of ₹99 plus taxes.'
  },
  {
    bank_id: 'HSBC',
    bank_name: 'HSBC India',
    logo_letter: 'S',
    portal_name: 'HSBC Rewards Catalog',
    portal_url: 'https://www.hsbc.co.in/',
    category: 'foreign',
    cards: [
      { id: 'hsbc_cashback', name: 'HSBC Cashback Card', ratio: 1.00, note: '1 Point = ₹1.00 auto-credited to statement balance monthly.' },
      { id: 'hsbc_premier', name: 'HSBC Premier Card', ratio: 0.25, note: '1 Point = ₹0.25 on catalog rewards or premium airline miles transfers.' }
    ],
    terms: 'Baseline points have a 3-year validity. Auto-cashback cards have no statement credit fees.'
  },
  {
    bank_id: 'SC',
    bank_name: 'Standard Chartered',
    logo_letter: 'C',
    portal_name: 'SC 360° Rewards Portal',
    portal_url: 'https://360rewards.standardchartered.co.in/',
    category: 'foreign',
    cards: [
      { id: 'sc_ultimate', name: 'SC Ultimate Card', ratio: 1.00, note: '1 Point = ₹1.00 only when redeemed via SC 360 portal for travel/vouchers.' },
      { id: 'sc_manhattan', name: 'SC Manhattan Card', ratio: 0.25, note: 'Standard catalog rewards value. 1 Point = ₹0.25.' }
    ],
    terms: 'Convenience redemption fees of ₹99 plus taxes apply. Points expire after 3 years.'
  },
  {
    bank_id: 'YES',
    bank_name: 'Yes Bank',
    logo_letter: 'Y',
    portal_name: 'Yes Rewardz Portal',
    portal_url: 'https://www.yesrewardz.com/',
    category: 'private',
    cards: [
      { id: 'yes_private', name: 'Yes Private Prime', ratio: 0.25, note: '1 Point = ₹0.25. Premium airline miles transfer ratios scale higher.' },
      { id: 'yes_first', name: 'Yes First Exclusive', ratio: 0.25, note: '1 Point = ₹0.25. Redeemed on Yes Rewardz portal for flights.' }
    ],
    terms: 'Convenience fees apply to select vouchers. Fuel surcharge waiver spends do not earn reward points.'
  },
  {
    bank_id: 'INDUSIND',
    bank_name: 'IndusInd Bank',
    logo_letter: 'N',
    portal_name: 'IndusMoments Portal',
    portal_url: 'https://www.indusind.com/',
    category: 'private',
    cards: [
      { id: 'indus_pioneer', name: 'Pioneer Heritage', ratio: 1.00, note: '1 Point = ₹1.00 cash credit statement balance.' },
      { id: 'indus_legend', name: 'IndusInd Legend Card', ratio: 0.75, note: '1 Point = ₹0.75 cash credit or voucher value.' }
    ],
    terms: 'Reward points do not expire and can be converted to cash credit with zero redemption fee.'
  },
  {
    bank_id: 'BOB',
    bank_name: 'BOBCARD',
    logo_letter: 'B',
    portal_name: 'BOB Financial Rewards Portal',
    portal_url: 'https://www.bobfinancial.com/',
    category: 'public',
    cards: [
      { id: 'bob_eterna', name: 'Eterna Card', ratio: 0.25, note: '1 Reward Point = ₹0.25 cash back or voucher credit.' },
      { id: 'bob_premier', name: 'Premier / Select Card', ratio: 0.25, note: '1 Reward Point = ₹0.25 cash statement credit.' }
    ],
    terms: 'Minimum block of 1000 points required to initiate redemption processing.'
  },
  {
    bank_id: 'AU',
    bank_name: 'AU Small Finance Bank',
    logo_letter: 'U',
    portal_name: 'AU Bank Rewards Portal',
    portal_url: 'https://www.aubank.in/',
    category: 'private',
    cards: [
      { id: 'au_zenith', name: 'Zenith Credit Card', ratio: 0.25, note: '1 Point = ₹0.25 on flight/hotel bookings or e-vouchers.' },
      { id: 'au_vetta', name: 'Vetta Credit Card', ratio: 0.25, note: '1 Point = ₹0.25 statement credit or catalog purchases.' }
    ],
    terms: 'Points expire after 2 years. Catalog redemptions have flat processing fees.'
  },
  {
    bank_id: 'ONECARD',
    bank_name: 'OneCard',
    logo_letter: 'O',
    portal_name: 'OneCard Mobile Application',
    portal_url: 'https://getonecard.app/',
    category: 'fintech',
    cards: [
      { id: 'onecard_metal', name: 'OneCard Metal Card', ratio: 0.10, note: '10 Reward Points = ₹1.00 statement credit cash value.' }
    ],
    terms: 'Points have lifetime validity. Points can be instantly redeemed inside the app for transactions eraser or cashback.'
  },
  {
    bank_id: 'FEDERAL',
    bank_name: 'Federal Bank',
    logo_letter: 'F',
    portal_name: 'Federal Rewards Store',
    portal_url: 'https://www.federalrewards.in/',
    category: 'private',
    cards: [
      { id: 'fed_celesta', name: 'Celesta Credit Card', ratio: 0.25, note: '1 Reward Point = ₹0.25 value. Premium lounge benefits access.' },
      { id: 'fed_imperio', name: 'Imperio Credit Card', ratio: 0.25, note: '1 Reward Point = ₹0.25 on the Federal rewards platform.' }
    ],
    terms: 'Minimum redemption limit of 1000 points. Excludes fuel surcharge waiver spends.'
  },
  {
    bank_id: 'CITI',
    bank_name: 'Citi India (now Axis)',
    logo_letter: 'T',
    portal_name: 'Axis Citibank Transition Portal',
    portal_url: 'https://www.citibank.co.in/',
    category: 'private',
    cards: [
      { id: 'citi_prestige', name: 'Citi Prestige', ratio: 1.00, note: '1 Point = ₹1.00 on travel reservations. Other redemptions vary.' },
      { id: 'citi_pm', name: 'Citi PremierMiles', ratio: 0.45, note: '1 Mile = ₹0.45 on flight/hotel redemptions.' }
    ],
    terms: 'Citibank portfolios transitioned to Axis Bank. Points values are maintained under identical policies.'
  },
  {
    bank_id: 'DBS',
    bank_name: 'DBS Bank India',
    logo_letter: 'L',
    portal_name: 'DBS Card+ Mobile App',
    portal_url: 'https://www.dbs.com/in/',
    category: 'foreign',
    cards: [
      { id: 'dbs_vantage', name: 'DBS Vantage Card', ratio: 0.25, note: '1 Point = ₹0.25 value on travel or curated statement vouchers.' },
      { id: 'dbs_spark', name: 'DBS Spark Card', ratio: 0.20, note: '1 Point = ₹0.20 on statement redemptions.' }
    ],
    terms: 'Vantage points never expire. Spark points expire after 3 years.'
  },
  {
    bank_id: 'PNB',
    bank_name: 'Punjab National Bank',
    logo_letter: 'P',
    portal_name: 'PNB Rewardz Store',
    portal_url: 'https://www.pnbrewardz.com/',
    category: 'public',
    cards: [
      { id: 'pnb_rupay_select', name: 'PNB RuPay Select', ratio: 0.25, note: '1 Reward Point = ₹0.25 on PNB Rewardz catalog.' }
    ],
    terms: 'Points expire after 3 years. Excludes EMI transaction conversion spends.'
  },
  {
    bank_id: 'CANARA',
    bank_name: 'Canara Bank',
    logo_letter: 'C',
    portal_name: 'Canara Bank Rewards Portal',
    portal_url: 'https://www.canarabank.in/',
    category: 'public',
    cards: [
      { id: 'canara_visa', name: 'Canara Bank Visa Card', ratio: 0.25, note: '1 Reward Point = ₹0.25 value inside the Canara rewards portal.' }
    ],
    terms: 'Convenience fees waived. points validity scales to 3 years.'
  }
];

// Factual Indian PSU Debit Card Variants Database sourced from TechnoFino & X
const RUPAY_DEBIT_CARDS = [
  {
    bank_id: 'SBI',
    bank_name: 'State Bank of India',
    logo_letter: 'S',
    variants: [
      {
        name: 'SBI RuPay Select Debit Card',
        issuance_fee: 300,
        annual_fee: 350,
        limits: { atm: '₹50,000 / day', pos: '₹2,00,000 / day' },
        lounge: '2 Complimentary domestic lounge visits per quarter (requires min. ₹5,000 spend in the previous quarter).',
        spa: '1 Complimentary Spa session per calendar year via the RuPay Select Portal.',
        health: '1 Complimentary comprehensive health checkup per year (thyroid, lipid, CBC, etc.).',
        gym: '1 Month complimentary gym pass (Anytime Fitness/Gold\'s Gym) or Fitpass access per year.',
        golf: '1 Complimentary Golf coaching lesson or round per year.',
        insurance: '₹10 Lakhs Personal Accidental Death Cover + Permanent Total Disability Cover.',
        other: '24/7 Premium Concierge support, dining discounts, and occasional utility/movie offers.',
        avg_cash_value: 4800,
        explanation: 'Premium wellness & lounge powerhouse. Sourced from TechnoFino: Spa, health checkup, and gym pass must be claimed on the official RuPay Select portal. Lounge access requires swiping ₹5,000 in POS/online spends in the previous quarter.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'SBI Platinum International Debit Card (Visa/MC)',
        issuance_fee: 300,
        annual_fee: 325,
        limits: { atm: '₹1,00,000 / day', pos: '₹2,00,000 / day' },
        lounge: '1 Complimentary domestic lounge visit per quarter (subject to network lounge availability).',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹5 Lakhs Personal Accident (Death) Insurance cover.',
        other: 'Earns 2 SBI Rewardz points for every ₹200 spent. High ATM cash withdrawal limit.',
        avg_cash_value: 1200,
        explanation: 'Ideal for customers needing high withdrawal limits. Rewards rate offers a 0.50% return. Note: lounge access rules have been tightened on standard Platinum cards, verify active lounge listings.',
        benefitValues: { lounge: 1600, spa: 0, health: 0, gym: 0, golf: 0, insurance: 250 }
      },
      {
        name: 'SBI Gold International Debit Card (Visa/MC)',
        issuance_fee: 100,
        annual_fee: 250,
        limits: { atm: '₹50,000 / day', pos: '₹2,00,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹2 Lakhs Personal Accident Insurance cover.',
        other: 'Earns 1.5 SBI Rewardz points for every ₹200 spent. Purchase protection cover up to ₹5,000.',
        avg_cash_value: 500,
        explanation: 'Basic mid-tier card. Sourced from forums: Provides standard purchase protection cover for online deliveries, but lacks premium travel or lifestyle perks.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 100 }
      },
      {
        name: 'SBI Global International Debit Card (Visa/MC/RuPay)',
        issuance_fee: 0,
        annual_fee: 200,
        limits: { atm: '₹40,000 / day', pos: '₹75,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: 'Not Available.',
        other: 'Earns 1 SBI Rewardz point for every ₹200 spent. Zero fuel surcharge waiver.',
        avg_cash_value: 200,
        explanation: 'SBI\'s default issue card. Sourced from X/TechnoFino: Useful for everyday transactions, but carries zero premium wellness or lounge access perks.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 0 }
      }
    ]
  },
  {
    bank_id: 'CANARA',
    bank_name: 'Canara Bank',
    logo_letter: 'C',
    variants: [
      {
        name: 'Canara RuPay Select Debit Card',
        issuance_fee: 250,
        annual_fee: 1000,
        limits: { atm: '₹1,00,000 / day', pos: '₹5,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter) + 2 International Lounge visits per year.',
        spa: '1 Complimentary Spa session per calendar year via RuPay Select Portal.',
        health: '1 Complimentary Comprehensive Health check-up per year.',
        gym: '1 Month complimentary premium gym/fitness center membership pass.',
        golf: '1 Complimentary Golf coaching lesson or round per year.',
        insurance: '₹10 Lakhs Personal Accidental Death / Total Disability cover + ₹50,000 Baggage Cover.',
        other: 'Zero convenience fees on rewards catalog redemptions and tailored high daily ATM limits.',
        avg_cash_value: 5800,
        explanation: 'Outstanding debit card for domestic and international travelers. TechnoFino Insight: Annual fee is fully waived if holding premium account segments like Canara SB Gold or Premium Salary.',
        benefitValues: { lounge: 4200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 750 }
      },
      {
        name: 'Canara Platinum Debit Card (Visa/MC/RuPay)',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹1,00,000 / day', pos: '₹5,00,000 / day' },
        lounge: '1 Complimentary domestic lounge visit per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹2 Lakhs Personal Accident (Death) Insurance cover.',
        other: 'Purchase protection cover up to ₹25,000. High ATM/POS transaction limits.',
        avg_cash_value: 1500,
        explanation: 'Provides high transaction limits at a low annual maintenance charge of ₹250. Sourced from forums: lounge access terms require active quarterly spend verification.',
        benefitValues: { lounge: 1600, spa: 0, health: 0, gym: 0, golf: 0, insurance: 150 }
      },
      {
        name: 'Canara Classic Debit Card (Visa/MC/RuPay)',
        issuance_fee: 0,
        annual_fee: 200,
        limits: { atm: '₹75,000 / day', pos: '₹2,00,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Personal Accident Cover.',
        other: 'Basic transaction capabilities, accepted at all domestic ATMs.',
        avg_cash_value: 150,
        explanation: 'General entry-level card for daily ATM withdrawals and offline shopping, but holds no premium lifestyle benefits.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'PNB',
    bank_name: 'Punjab National Bank',
    logo_letter: 'P',
    variants: [
      {
        name: 'PNB RuPay Select Debit Card',
        issuance_fee: 600,
        annual_fee: 500,
        limits: { atm: '₹1,50,000 / day', pos: '₹5,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter) + 2 International Lounge visits per year.',
        spa: '1 Complimentary Spa session per calendar year via the RuPay portal.',
        health: '1 Complimentary Comprehensive Health check-up screening per year.',
        gym: '1 Month complimentary gym/fitness membership pass.',
        golf: '1 Complimentary Golf lesson or round per year.',
        insurance: '₹10 Lakhs Personal Accidental Death cover.',
        other: '24/7 concierge assistance, shopping cashback offers, and high ATM limits.',
        avg_cash_value: 5000,
        explanation: 'PNB Select offers extensive limits and full wellness vault access. Sourced from TechnoFino: AMC is ₹500, but standard NPCI wellness benefits offset this charge for active cardholders.',
        benefitValues: { lounge: 4200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'PNB RuPay Platinum Debit Card',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹1,00,000 / day', pos: '₹3,00,000 / day' },
        lounge: '1 Complimentary domestic lounge visit per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹2 Lakhs Personal Accident (Death) Insurance cover.',
        other: 'Exclusive merchant discounts on online transactions and dining portals.',
        avg_cash_value: 1200,
        explanation: 'Safe daily card with moderate spending limits and basic domestic lounge benefits.',
        benefitValues: { lounge: 1600, spa: 0, health: 0, gym: 0, golf: 0, insurance: 150 }
      },
      {
        name: 'PNB Classic Debit Card (Visa/MC/RuPay)',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹25,000 / day', pos: '₹60,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Personal Accident Cover.',
        other: 'Basic transactions, accepted at all domestic ATMs.',
        avg_cash_value: 100,
        explanation: 'Entry-level savings card. Sourced from forums: Best for basic cash withdrawals, but carries zero travel or wellness benefits.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'BOB',
    bank_name: 'Bank of Baroda',
    logo_letter: 'B',
    variants: [
      {
        name: 'BOB World RuPay Select Debit Card',
        issuance_fee: 300,
        annual_fee: 300,
        limits: { atm: '₹1,00,000 / day', pos: '₹5,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter + 2 International Lounge visits per year.',
        spa: '1 Complimentary Spa session per calendar year via RuPay Select Portal.',
        health: '1 Complimentary Health Check-up check.',
        gym: '1 Month complimentary gym pass.',
        golf: '1 Complimentary Golf coaching lesson.',
        insurance: '₹10 Lakhs Personal Accidental cover.',
        other: 'bob World shopping deals, annual fees waived for premium account segments.',
        avg_cash_value: 5200,
        explanation: 'Sourced from forums: Highly popular for international lounge capability. Annual fee is waived for Baroda Advantage premium accounts.',
        benefitValues: { lounge: 4200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'BOB World Platinum Debit Card (Visa/MC/RuPay)',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹50,000 / day', pos: '₹2,50,000 / day' },
        lounge: '1 Domestic Lounge visit per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹2 Lakhs Accidental cover.',
        other: 'High POS transaction limits and shopping discount tie-ups.',
        avg_cash_value: 1200,
        explanation: 'Mid-tier debit card offering high limits at low annual charges.',
        benefitValues: { lounge: 1600, spa: 0, health: 0, gym: 0, golf: 0, insurance: 150 }
      },
      {
        name: 'BOB World Classic Debit Card (Visa/MC/RuPay)',
        issuance_fee: 0,
        annual_fee: 200,
        limits: { atm: '₹25,000 / day', pos: '₹50,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Everyday transaction card, widely accepted.',
        avg_cash_value: 100,
        explanation: 'Basic card for savings account holders with no premium benefits.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'UNION',
    bank_name: 'Union Bank of India',
    logo_letter: 'U',
    variants: [
      {
        name: 'Union Bank RuPay Select Debit Card',
        issuance_fee: 0,
        annual_fee: 200,
        limits: { atm: '₹1,00,000 / day', pos: '₹5,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: '1 Complimentary Spa session per calendar year.',
        health: '1 Complimentary Comprehensive Health check-up per year.',
        gym: '1 Month complimentary fitness membership pass.',
        golf: '1 Complimentary Golf coaching lesson or round per year.',
        insurance: '₹10 Lakhs Accidental Death / Total Disability cover.',
        other: 'BMS movie ticket discounts, regular cashback campaigns.',
        avg_cash_value: 5400,
        explanation: 'Unanimously rated as the highest-yielding card on TechnoFino due to the ₹200 fee, ₹0 issuance, and complete NPCI benefits.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'Union Bank Platinum Debit Card (Visa/MC/RuPay)',
        issuance_fee: 0,
        annual_fee: 200,
        limits: { atm: '₹1,00,000 / day', pos: '₹3,00,000 / day' },
        lounge: '1 Domestic Lounge visit per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹2 Lakhs Accidental cover.',
        other: 'Complimentary personal accidental insurance cover.',
        avg_cash_value: 1200,
        explanation: 'Cost-effective alternative for customers needing basic domestic lounge access.',
        benefitValues: { lounge: 1600, spa: 0, health: 0, gym: 0, golf: 0, insurance: 150 }
      },
      {
        name: 'Union Bank Classic Debit Card',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹25,000 / day', pos: '₹50,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Basic daily transaction card.',
        avg_cash_value: 100,
        explanation: 'Default debit card for general savings accounts with zero premium rewards.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'CENTRAL',
    bank_name: 'Central Bank of India',
    logo_letter: 'C',
    variants: [
      {
        name: 'Central Bank RuPay Select Debit Card',
        issuance_fee: 200,
        annual_fee: 200,
        limits: { atm: '₹1,00,000 / day', pos: '₹4,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: '1 Complimentary Spa session per calendar year.',
        health: '1 Complimentary Health Check-up voucher.',
        gym: '1 Month complimentary fitness center access pass.',
        golf: '1 Complimentary Golf coaching round.',
        insurance: '₹10 Lakhs Accidental cover.',
        other: 'Online shopping deals and utility payment discounts.',
        avg_cash_value: 4900,
        explanation: 'Extremely cost-effective. Best for entry-level premium segment, offering high-value wellness perks at minimal AMC.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'Central Bank Classic Debit Card',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹40,000 / day', pos: '₹1,00,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Basic transactions and cash withdrawal.',
        avg_cash_value: 100,
        explanation: 'Standard issues card with no travel or wellness rewards.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'BOI',
    bank_name: 'Bank of India',
    logo_letter: 'B',
    variants: [
      {
        name: 'BOI RuPay Select Debit Card',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹50,000 / day', pos: '₹5,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: '1 Complimentary Spa session per calendar year.',
        health: '1 Complimentary Health Check-up screening.',
        gym: '1 Month complimentary fitness pass.',
        golf: '1 Complimentary Golf lesson.',
        insurance: '₹10 Lakhs Personal Accidental Death cover.',
        other: '24/7 Premium Concierge support and shopping deals.',
        avg_cash_value: 4700,
        explanation: 'Highly reliable and stable fee levels. Fits wellness and travel requirements at low maintenance costs.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'BOI Platinum Debit Card',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹50,000 / day', pos: '₹2,50,000 / day' },
        lounge: '1 Domestic Lounge visit per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹2 Lakhs Accidental cover.',
        other: 'Special discounts on retail and grocery spends.',
        avg_cash_value: 1200,
        explanation: 'Ideal for basic travelers needing moderate withdrawal limits.',
        benefitValues: { lounge: 1600, spa: 0, health: 0, gym: 0, golf: 0, insurance: 150 }
      },
      {
        name: 'BOI Classic Debit Card',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹15,000 / day', pos: '₹50,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Everyday cash withdrawal card.',
        avg_cash_value: 100,
        explanation: 'Basic card for savings account holders with no premium benefits.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'INDIAN',
    bank_name: 'Indian Bank',
    logo_letter: 'I',
    variants: [
      {
        name: 'Indian Bank RuPay Select Debit Card',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹50,000 / day', pos: '₹5,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: '1 Complimentary Spa session per calendar year.',
        health: '1 Complimentary Health Check-up check.',
        gym: '1 Month complimentary fitness membership pass.',
        golf: '1 Complimentary Golf lesson.',
        insurance: '₹10 Lakhs Accidental Death / Total Disability cover.',
        other: 'Airport lounge and helper concierge desks.',
        avg_cash_value: 4600,
        explanation: 'Offered primarily to Ind Premium savings accounts. Standard un-devalued wellness features.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'Indian Bank Classic Debit Card',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹25,000 / day', pos: '₹50,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Basic transactions.',
        avg_cash_value: 100,
        explanation: 'Default issue card for savings accounts, lacking any reward programs.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'MAHARASHTRA',
    bank_name: 'Bank of Maharashtra',
    logo_letter: 'M',
    variants: [
      {
        name: 'MahaBank RuPay Select Debit Card',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹1,00,000 / day', pos: '₹4,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: '1 Complimentary Spa session per calendar year.',
        health: '1 Complimentary Health Check-up check.',
        gym: '1 Month complimentary fitness membership pass.',
        golf: '1 Complimentary Golf round per year.',
        insurance: '₹10 Lakhs Accidental Death cover.',
        other: 'Annual Maintenance Charges waived for high-value savings segments.',
        avg_cash_value: 4950,
        explanation: 'Annual fees are waived for BSS 25 Premium accounts, turning the card into a Lifetime Free (LTF) high-value package.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'MahaBank Classic Debit Card',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹20,000 / day', pos: '₹50,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Basic transaction capabilities.',
        avg_cash_value: 100,
        explanation: 'Default card for regular saving accounts with zero lounge or spa benefits.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'UCO',
    bank_name: 'UCO Bank',
    logo_letter: 'U',
    variants: [
      {
        name: 'UCO RuPay Select Debit Card',
        issuance_fee: 200,
        annual_fee: 200,
        limits: { atm: '₹50,000 / day', pos: '₹2,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: '1 Complimentary Spa session per calendar year.',
        health: '1 Complimentary Health Check-up screening.',
        gym: '1 Month complimentary gym pass.',
        golf: '1 Complimentary Golf lesson.',
        insurance: '₹10 Lakhs Accidental cover.',
        other: 'UCO bank merchant cashbacks and premium shopping tie-ups.',
        avg_cash_value: 4650,
        explanation: 'Cost-effective premium card. Standard NPCI Select wellness benefits at a low ₹200 fee.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'UCO Classic Debit Card',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹25,000 / day', pos: '₹50,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Basic ATM withdrawals.',
        avg_cash_value: 100,
        explanation: 'Entry-level savings card with no reward programs.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  },
  {
    bank_id: 'IOB',
    bank_name: 'Indian Overseas Bank',
    logo_letter: 'I',
    variants: [
      {
        name: 'IOB RuPay Select Debit Card',
        issuance_fee: 250,
        annual_fee: 250,
        limits: { atm: '₹50,000 / day', pos: '₹5,00,000 / day' },
        lounge: '2 Domestic Lounge visits per quarter (requires min. ₹5,000 spend in previous quarter).',
        spa: '1 Complimentary Spa session per calendar year.',
        health: '1 Complimentary Health Check-up check.',
        gym: '1 Month complimentary gym pass.',
        golf: '1 Complimentary Golf coaching round.',
        insurance: '₹10 Lakhs Personal Accidental cover.',
        other: 'First year annual maintenance fee is waived. Movie ticket promotions.',
        avg_cash_value: 4600,
        explanation: 'First year annual maintenance waiver makes it low risk. Sourced from reviews: Accidental insurance cover is a strong add-on.',
        benefitValues: { lounge: 3200, spa: 1500, health: 1200, gym: 1500, golf: 1500, insurance: 500 }
      },
      {
        name: 'IOB Classic Debit Card',
        issuance_fee: 0,
        annual_fee: 150,
        limits: { atm: '₹20,000 / day', pos: '₹50,000 / day' },
        lounge: 'Not Available.',
        spa: 'Not Available.',
        health: 'Not Available.',
        gym: 'Not Available.',
        golf: 'Not Available.',
        insurance: '₹1 Lakh Accidental cover.',
        other: 'Basic transactions.',
        avg_cash_value: 100,
        explanation: 'Standard debit card for everyday transactions without rewards.',
        benefitValues: { lounge: 0, spa: 0, health: 0, gym: 0, golf: 0, insurance: 50 }
      }
    ]
  }
];

export default function CardwiseRedemptionMatrix() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBank, setSelectedBank] = useState(BANK_REWARD_METRICS[0]);
  const [selectedCard, setSelectedCard] = useState(BANK_REWARD_METRICS[0].cards[0]);
  const [pointsCount, setPointsCount] = useState<number>(10000);
  const [calculatedValue, setCalculatedValue] = useState<number>(10000);

  // RuPay Select Debit Cards State variables
  const [selectedRupayBank, setSelectedRupayBank] = useState(RUPAY_DEBIT_CARDS[0]);
  const [selectedRupayVariant, setSelectedRupayVariant] = useState(RUPAY_DEBIT_CARDS[0].variants[0]);
  
  // Custom yield benefits checklist state
  const [rupayBenefits, setRupayBenefits] = useState({
    lounge: true,
    spa: true,
    health: true,
    gym: true,
    golf: true,
    insurance: true
  });
  const [customRupayValue, setCustomRupayValue] = useState<number>(4800);

  // Filter banks based on search query and category selector
  const filteredBanks = BANK_REWARD_METRICS.filter(bank => {
    const matchesSearch = bank.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bank.bank_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || bank.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle bank changes
  const handleBankChange = (bankId: string) => {
    const targetBank = BANK_REWARD_METRICS.find(b => b.bank_id === bankId);
    if (targetBank) {
      setSelectedBank(targetBank);
      setSelectedCard(targetBank.cards[0]);
    }
  };

  // Synchronize when active selection is filtered out
  useEffect(() => {
    if (filteredBanks.length > 0 && !filteredBanks.find(b => b.bank_id === selectedBank.bank_id)) {
      setSelectedBank(filteredBanks[0]);
      setSelectedCard(filteredBanks[0].cards[0]);
    }
  }, [filteredBanks, selectedBank]);

  // Live calculation matching points allocation to real valuations
  useEffect(() => {
    if (selectedCard) {
      const result = pointsCount * selectedCard.ratio;
      setCalculatedValue(result);
    }
  }, [pointsCount, selectedCard]);

  // Reset variant selection when RuPay Bank changes
  const handleRupayBankChange = (bank: typeof RUPAY_DEBIT_CARDS[0]) => {
    setSelectedRupayBank(bank);
    setSelectedRupayVariant(bank.variants[0]);
  };

  // Dynamic RuPay Select custom value calculator loop
  useEffect(() => {
    let baseValue = 0;
    const values = selectedRupayVariant.benefitValues;
    
    if (rupayBenefits.lounge && values.lounge > 0) baseValue += values.lounge;
    if (rupayBenefits.spa && values.spa > 0) baseValue += values.spa;
    if (rupayBenefits.health && values.health > 0) baseValue += values.health;
    if (rupayBenefits.gym && values.gym > 0) baseValue += values.gym;
    if (rupayBenefits.golf && values.golf > 0) baseValue += values.golf;
    if (rupayBenefits.insurance && values.insurance > 0) baseValue += values.insurance;

    // Subtract annual fee to get net gain
    const netGain = baseValue - selectedRupayVariant.annual_fee;
    setCustomRupayValue(netGain);
  }, [rupayBenefits, selectedRupayVariant]);

  // Benefit toggle handler
  const toggleRupayBenefit = (benefitKey: keyof typeof rupayBenefits) => {
    setRupayBenefits(prev => ({
      ...prev,
      [benefitKey]: !prev[benefitKey]
    }));
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 p-6 md:p-10 font-sans relative overflow-hidden">
      
      {/* SOFT LIGHT MODE PASTEL DECORATION BLOB EFFECTS */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/5 filter blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/5 filter blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="border-b border-slate-200 pb-6 mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 z-10 relative">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-bold uppercase block">
            CORE_RESOURCES // CONVERT_LEDGER_POINTS
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Reward Redemption Matrix</h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Evaluate exact points-to-INR conversions for the top 20 credit card issuing banks in India with full transparency.
          </p>
        </div>
        <div>
          <div className="bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 inline-flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            20_BANKS_SYNCED: ACTIVE
          </div>
        </div>
      </div>

      {/* SEARCH AND PILL FILTERS SECTION */}
      <div className="mb-8 space-y-4 z-10 relative">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
              🔍
            </span>
            <input 
              type="text"
              placeholder="Search among 20 banks (e.g. HDFC, Amex, ICICI...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3.5 pl-10 rounded-2xl text-sm text-slate-800 shadow-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Banks' },
              { id: 'private', label: 'Private Sector' },
              { id: 'public', label: 'Public Sector' },
              { id: 'foreign', label: 'Foreign / International' },
              { id: 'fintech', label: 'Fintech Cards' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setActiveCategory(pill.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all whitespace-nowrap border ${
                  activeCategory === pill.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: CREDIT CARD REDEMPTION SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative items-start mb-16">
        
        {/* LEFT COLUMN: CONVERSION CALCULATOR */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100/50 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">
              CALCULATOR_CORE_V2
            </span>
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
              Light Mode
            </span>
          </div>

          {/* 1. SELECT TARGET ISSUING BANK */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Select Issuing Institution</label>
            <div className="relative">
              <select 
                value={selectedBank.bank_id}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm p-4 rounded-2xl outline-none text-slate-800 transition-colors cursor-pointer appearance-none font-semibold shadow-inner"
              >
                {filteredBanks.length === 0 ? (
                  <option disabled value="">No banks match your filters</option>
                ) : (
                  filteredBanks.map(b => (
                    <option key={b.bank_id} value={b.bank_id}>{b.bank_name}</option>
                  ))
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* 2. SELECT SPECIFIC CARD VARIANT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Select Specific Card Variant</label>
            <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {selectedBank?.cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all flex justify-between items-center ${
                    selectedCard.id === card.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{card.name}</span>
                  <span className="font-mono text-[11px] opacity-75 shrink-0 bg-white border border-slate-200/60 px-2 py-0.5 rounded shadow-sm text-indigo-600 font-bold">
                    1 Pt = ₹{card.ratio.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. INPUT QUANTITY VALUE BLOCK */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Accumulated Points Count</label>
            <input 
              type="number"
              value={pointsCount}
              onChange={(e) => setPointsCount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Enter points value..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-4 rounded-2xl text-sm font-mono font-bold text-slate-800 outline-none transition-colors shadow-inner"
            />
          </div>

          {/* 4. PREMIUM TRUE CONVERSION YIELD SCREEN */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50/20 to-transparent border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-indigo-600 uppercase tracking-wider block font-black">REAL_CASH_EQUIVALENT</span>
              <p className="text-3xl font-black font-mono tracking-tight text-slate-900">₹{calculatedValue.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-[10px] font-mono px-3 py-2 bg-white/80 border border-slate-100 rounded-xl text-slate-600 max-w-full sm:max-w-[190px] leading-relaxed shadow-sm">
              {selectedCard?.note}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OFFICIAL PORTALS AND METRIC DRAWER */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100/50">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-4 font-bold border-b border-slate-100 pb-2">
              SECURE_AUTHORIZED_PORTALS
            </span>

            {/* Direct Portal Redirection Widget */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 shadow-sm shrink-0">
                  {selectedBank.logo_letter}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">{selectedBank.bank_name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedBank.portal_name}</p>
                </div>
              </div>
              
              <a 
                href={selectedBank.portal_url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-indigo-200 flex items-center gap-2 uppercase tracking-tight"
              >
                Launch Official Portal
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>

            {/* Terms Drawer and Guidance Section */}
            <div className="mt-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200/70 p-4 rounded-2xl flex gap-3 shadow-sm">
                <span className="text-lg shrink-0">⚠️</span>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest font-mono block">CRITICAL_HIDDEN_TERMS_SUMMARY</span>
                  <p className="text-xs text-amber-900 leading-relaxed font-semibold">{selectedBank.terms}</p>
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex gap-3 shadow-sm">
                <span className="text-lg shrink-0">💎</span>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest font-mono block">CARDWISE_OPTIMIZATION_INSIGHT</span>
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    Always cross-reference point transfers with domestic and international airline alliances. Shifting specific institutional reward miles to external carrier pipelines can often double your transactional yield value.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick List Overview Card of all loaded banks */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">
              Quick Reference Directory ({filteredBanks.length} Banks Available)
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {filteredBanks.map(b => (
                <button
                  key={b.bank_id}
                  onClick={() => handleBankChange(b.bank_id)}
                  className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border ${
                    selectedBank.bank_id === b.bank_id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:border-slate-300 hover:bg-slate-100/50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-[10px] flex items-center justify-center font-black ${
                      selectedBank.bank_id === b.bank_id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {b.logo_letter}
                    </span>
                    <span className="truncate">{b.bank_name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: RUPAY SELECT & PREMIUM DEBIT CARDS DIRECTORY (PSU BANKS) */}
      <div className="border-t border-slate-200 pt-10 z-10 relative">
        <div className="space-y-1.5 mb-8">
          <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-bold uppercase block">
            PREMIUM_WELLNESS_VAULT // DEBIT_CARD_BENEFITS
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">PSU Banks Premium Debit Cards Directory</h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Explore authentic annual maintenance charges, spend rules, and compare all classic, platinum, and premium RuPay Select card variants from Indian PSU banks.
          </p>
        </div>

        {/* RUPAY LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: RUPAY DEBIT CARDS DIRECTORY LIST */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-md shadow-slate-100/50 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2">
              Select Issuing PSU Bank ({RUPAY_DEBIT_CARDS.length} Banks)
            </h3>
            
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {RUPAY_DEBIT_CARDS.map(bank => (
                <button
                  key={bank.bank_name}
                  onClick={() => handleRupayBankChange(bank)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedRupayBank.bank_id === bank.bank_id
                      ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center font-black ${
                        selectedRupayBank.bank_id === bank.bank_id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {bank.logo_letter}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-tight">{bank.bank_name}</h4>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{bank.variants.length} Card Variants</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      ₹{bank.variants[0].annual_fee} - ₹{bank.variants[bank.variants.length - 1].annual_fee}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: RUPAY BENEFITS MATRIX & INTERACTIVE YIELD ESTIMATOR */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100/50 space-y-6">
            
            {/* Card Variant Selector Tabs */}
            <div className="border-b border-slate-200 pb-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block mb-2">Available Card Variants</label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {selectedRupayBank.variants.map(variant => (
                  <button
                    key={variant.name}
                    onClick={() => setSelectedRupayVariant(variant)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                      selectedRupayVariant.name === variant.name
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedRupayBank.bank_name}</h3>
                <p className="text-xs font-black text-indigo-600 mt-0.5">{selectedRupayVariant.name}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-bold bg-slate-50 px-2.5 py-1 rounded-xl text-slate-600 border border-slate-200">
                  Issuance: {selectedRupayVariant.issuance_fee === 0 ? 'FREE' : `₹${selectedRupayVariant.issuance_fee}`}
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-50 px-2.5 py-1 rounded-xl text-slate-600 border border-slate-200">
                  Annual AMC: ₹{selectedRupayVariant.annual_fee}
                </span>
              </div>
            </div>

            {/* Factual Transaction Limits Section */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl shadow-sm">
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">ATM CASH WITHDRAWAL LIMIT</span>
                <span className="text-xs font-bold text-slate-700">{selectedRupayVariant.limits.atm}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">POS / E-COMMERCE LIMIT</span>
                <span className="text-xs font-bold text-slate-700">{selectedRupayVariant.limits.pos}</span>
              </div>
            </div>

            {/* List of Benefits */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                Detailed Feature & Benefit Coverage
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                <div className={`p-3.5 rounded-2xl border transition-colors ${
                  selectedRupayVariant.benefitValues.lounge > 0 
                    ? 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50' 
                    : 'bg-slate-100/30 border-slate-100 opacity-60'
                }`}>
                  <div className="flex gap-2.5">
                    <span className="text-lg">✈️</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Airport Lounge Access</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{selectedRupayVariant.lounge}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-colors ${
                  selectedRupayVariant.benefitValues.spa > 0 
                    ? 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50' 
                    : 'bg-slate-100/30 border-slate-100 opacity-60'
                }`}>
                  <div className="flex gap-2.5">
                    <span className="text-lg">🥗</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Complimentary Spa / Salon</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{selectedRupayVariant.spa}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-colors ${
                  selectedRupayVariant.benefitValues.health > 0 
                    ? 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50' 
                    : 'bg-slate-100/30 border-slate-100 opacity-60'
                }`}>
                  <div className="flex gap-2.5">
                    <span className="text-lg">🩺</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Preventive Health Checkup</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{selectedRupayVariant.health}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-colors ${
                  selectedRupayVariant.benefitValues.gym > 0 
                    ? 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50' 
                    : 'bg-slate-100/30 border-slate-100 opacity-60'
                }`}>
                  <div className="flex gap-2.5">
                    <span className="text-lg">💪</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Gym & Fitness Access</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{selectedRupayVariant.gym}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-colors ${
                  selectedRupayVariant.benefitValues.golf > 0 
                    ? 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50' 
                    : 'bg-slate-100/30 border-slate-100 opacity-60'
                }`}>
                  <div className="flex gap-2.5">
                    <span className="text-lg">⛳</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Golf Green Rounds / Lessons</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{selectedRupayVariant.golf}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-colors ${
                  selectedRupayVariant.benefitValues.insurance > 0 
                    ? 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50' 
                    : 'bg-slate-100/30 border-slate-100 opacity-60'
                }`}>
                  <div className="flex gap-2.5">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Accident & Baggage Cover</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{selectedRupayVariant.insurance}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Other card perks details */}
            {selectedRupayVariant.other && (
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">ADDITIONAL CARD SPECIFIC EXCLUSIVES</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-1">{selectedRupayVariant.other}</p>
              </div>
            )}

            {/* TechnoFino Insight Box */}
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3 shadow-sm">
              <span className="text-lg shrink-0">💡</span>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest font-mono block">TECHNOFINO & X COMMUNITY INSIGHTS</span>
                <p className="text-xs text-indigo-950 leading-relaxed font-medium">{selectedRupayVariant.explanation}</p>
              </div>
            </div>

            {/* INTERACTIVE BENEFIT CALCULATOR */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-200 pb-2">
                Estimate Your Custom Cash Yield Value
              </h4>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                Check the benefits you plan to utilize this year to calculate your personalized net reward value (incorporating the card\'s annual fee). Benefits unavailable on your selected card variant are disabled.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'lounge', label: 'Airport Lounge Access', displayVal: '₹3,200' },
                  { key: 'spa', label: 'Spa / Salon Vouchers', displayVal: '₹1,500' },
                  { key: 'health', label: 'Preventive Health Checkup', displayVal: '₹1,200' },
                  { key: 'gym', label: '1 Month Gym Pass', displayVal: '₹1,500' },
                  { key: 'golf', label: 'Golf Coaching Sessions', displayVal: '₹1,500' },
                  { key: 'insurance', label: 'Personal Accident Cover', displayVal: '₹500' }
                ].map(item => {
                  const isAvailable = (selectedRupayVariant.benefitValues as any)[item.key] > 0;
                  const isChecked = rupayBenefits[item.key as keyof typeof rupayBenefits] && isAvailable;
                  
                  return (
                    <button
                      key={item.key}
                      disabled={!isAvailable}
                      onClick={() => toggleRupayBenefit(item.key as keyof typeof rupayBenefits)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        !isAvailable
                          ? 'bg-slate-100/30 border-slate-100 opacity-40 cursor-not-allowed text-slate-400'
                          : isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold leading-tight">{item.label}</span>
                      <span className={`text-[11px] font-mono mt-1 font-bold ${
                        !isAvailable 
                          ? 'text-slate-400'
                          : isChecked 
                            ? 'text-indigo-200' 
                            : 'text-indigo-600'
                      }`}>
                        {isAvailable ? item.displayVal : 'Not Available'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Net Reward Output Screen */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-6 -translate-y-6"></div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-indigo-300 uppercase tracking-widest block font-bold">YOUR_CUSTOM_NET_GAIN</span>
                  <p className="text-2xl font-black font-mono tracking-tight text-white">
                    ₹{customRupayValue.toLocaleString('en-IN')} / year
                  </p>
                </div>
                <div className="text-[9px] font-mono bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 text-slate-300 max-w-full sm:max-w-[190px] leading-relaxed">
                  Formula: Checked Value (₹{customRupayValue + selectedRupayVariant.annual_fee}) - Fee (₹{selectedRupayVariant.annual_fee})
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
