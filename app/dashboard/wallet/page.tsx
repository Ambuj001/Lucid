'use client';
import { useState } from 'react';

export default function WalletOnboardingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // The Fetching Function
  const executeCardSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Directly hitting your local backend engine endpoint
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

  return (
    <div className="bg-black text-white p-8 font-mono min-h-screen">
      <div className="border border-zinc-800 p-6 max-w-xl">
        <label className="block text-xs uppercase tracking-widest text-[#FF2E93] font-bold mb-2">
          SEARCH_AND_PROVISION_CARD_ASSET
        </label>
        
        {/* Stark Input Panel: No Rounded Corners */}
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => executeCardSearch(e.target.value)}
          placeholder="ENTER BANK OR VARIANT NAME..."
          className="w-full bg-[#0A0A0A] border border-zinc-800 focus:border-[#FF2E93] p-3 text-sm font-mono text-white outline-none rounded-none"
        />

        {/* Results Matrix panel */}
        {searchResults.length > 0 && (
          <div className="border-x border-b border-zinc-800 bg-black mt-2 max-h-60 overflow-y-auto rounded-none">
            {searchResults.map((card: any) => (
              <div 
                key={card.card_id}
                className="p-3 border-b border-zinc-900 hover:bg-[#0A0A0A] cursor-pointer flex justify-between items-center transition-colors rounded-none"
              >
                <span className="text-xs uppercase tracking-tight font-bold">{card.bank_id} // {card.card_name}</span>
                <span className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-none">{card.card_type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
