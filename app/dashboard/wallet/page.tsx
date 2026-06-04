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
    <div className="bg-[#F9F9FB] min-h-screen text-[#1A1D20] font-sans antialiased p-10 flex flex-col items-center justify-center">
      <div className="bg-white border border-[#E9ECEF] p-8 rounded-2xl shadow-sm max-w-xl w-full space-y-6">
        
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-widest text-blue-600 font-bold">
            Onboarding & Asset Configuration
          </label>
          <h2 className="text-xl font-bold text-zinc-950">Search & Provision Cards</h2>
          <p className="text-xs text-zinc-500">Query the production credit directory to link a card variant to user {CURRENT_USER_ID}.</p>
        </div>

        {/* Input Panel with rounded borders */}
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => executeCardSearch(e.target.value)}
            placeholder="Search bank or card name (e.g. SBI Cashback, Infinia)..."
            className="w-full bg-[#F8F9FA] border border-[#E9ECEF] focus:border-blue-500 rounded-xl p-4 text-sm text-[#1A1D20] outline-none transition-colors"
          />

          {/* Results list panel */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E9ECEF] rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchResults.map((card: any) => (
                <div 
                  key={card.card_id}
                  onClick={() => addCardToPortfolio(card.card_id, card.card_name)}
                  className="p-4 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer flex justify-between items-center transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{card.bank_id}</span>
                    <h4 className="text-sm font-bold text-zinc-900">{card.card_name}</h4>
                  </div>
                  <span className="text-[10px] text-zinc-500 border border-[#E9ECEF] px-2 py-0.5 rounded-lg bg-zinc-50">
                    {card.card_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-100 text-blue-700">
            {message}
          </div>
        )}

        <div className="pt-4 border-t border-[#E9ECEF] flex justify-between text-xs text-zinc-400">
          <span>Active User Session: {CURRENT_USER_ID}</span>
          <a href="/dashboard" className="text-blue-600 hover:underline font-semibold">Back to Dashboard</a>
        </div>

      </div>
    </div>
  );
}
