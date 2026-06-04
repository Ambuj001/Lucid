'use client';

import { useState } from 'react';

export default function WalletOnboardingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const CURRENT_USER_ID = "usr_prod_101_cardwise";

  const executeCardSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/cards/search?query=${val}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error("Failed to fetch cards:", e);
      setSearchResults([]);
    }
  };

  const addCardToPortfolio = async (cardId: string, cardName: string) => {
    setLoading(true);
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
        setMessage(`Successfully provisioned ${cardName} to your active wallet portfolio!`);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        setMessage(`Failed to provision: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to contact the backend server.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans antialiased p-10 flex flex-col items-center justify-center relative">
      {/* Ambient glow */}
      <div className="spectral-glow w-[400px] h-[400px] top-20 right-1/4 fixed" />
      
      <div className="glass-pane p-8 rounded-2xl max-w-xl w-full space-y-6 relative z-10 anim-fade-in-up">
        
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-widest text-indigo-400 font-bold">
            Onboarding & Asset Configuration
          </label>
          <h2 className="text-xl font-bold text-[#0F172A]">Search & Provision Cards</h2>
          <p className="text-xs text-[#64748B]">Query the production credit directory to link a card variant to user {CURRENT_USER_ID}.</p>
        </div>

        {/* Input Panel */}
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => executeCardSearch(e.target.value)}
            placeholder="Search bank or card name (e.g. SBI Cashback, Infinia)..."
            className="w-full glass-input rounded-xl p-4 text-sm"
          />

          {/* Results list panel */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl z-10 max-h-60 overflow-y-auto">
              {searchResults.map((card: any) => (
                <div 
                  key={card.card_id}
                  onClick={() => addCardToPortfolio(card.card_id, card.card_name)}
                  className="p-4 border-b border-slate-200/50 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{card.bank_id}</span>
                    <h4 className="text-sm font-bold text-[#0F172A]">{card.card_name}</h4>
                  </div>
                  <span className="text-[10px] text-[#64748B] border border-slate-200 px-2 py-0.5 rounded-lg bg-slate-50">
                    {card.card_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            {message}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-[#64748B]">
          <span>Active User Session: {CURRENT_USER_ID}</span>
          <a href="/dashboard" className="text-indigo-400 hover:underline font-semibold">Back to Dashboard</a>
        </div>

      </div>
    </div>
  );
}
