'use client'; // Required in Next.js for interactive pages using state handlers

import { useState } from 'react';

export default function LucidDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // This function automatically calls your backend when the user types
  const handleSearchInput = async (userInput: string) => {
    setSearchQuery(userInput);

    // Don't waste server power if the user only typed 1 letter
    if (userInput.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // 1. Fetch data from your local backend waiter running on port 3000
      const response = await fetch(`http://localhost:3000/api/v1/cards/search?query=${userInput}`);
      
      // 2. Turn the raw server string response into a clean JavaScript array
      const data = await response.json();
      
      // 3. Save the results into our component state to trigger a UI render
      setSearchResults(data);
    } catch (error) {
      console.error("Failed to connect to Lucid backend:", error);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-8 font-mono flex flex-col items-center justify-start pt-24">
      <div className="w-full max-w-lg border border-zinc-800 p-6 bg-[#0A0A0A] rounded-none">
        
        {/* Stark Minimal Header */}
        <h2 className="text-xs uppercase tracking-widest text-[#FF2E93] font-bold mb-4">
          PORTFOLIO_PROVISION_SYSTEM
        </h2>

        {/* Input Bar: Flat Sharp Edges (0px border radius) */}
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="TYPE TO QUERY DATABASE (e.g. Cashback, Infinia)..."
          className="w-full bg-black border border-zinc-800 focus:border-[#FF2E93] p-4 text-xs font-mono text-white outline-none rounded-none uppercase transition-colors"
        />

        {/* Results Stream Matrix */}
        {searchResults.length > 0 && (
          <div className="border-x border-b border-zinc-800 bg-black mt-2 rounded-none max-h-64 overflow-y-auto">
            {searchResults.map((card: any) => (
              <div 
                key={card.card_id}
                className="p-4 border-b border-zinc-900 hover:bg-[#0A0A0A] cursor-pointer flex justify-between items-center group transition-colors rounded-none"
              >
                <span className="text-xs font-bold tracking-tight group-hover:text-[#FF2E93]">
                  {card.bank_id} // {card.card_name}
                </span>
                <span className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-none uppercase">
                  {card.card_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
