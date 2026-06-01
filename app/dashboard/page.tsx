'use client';

import { useState, useEffect } from 'react';

export default function LucidDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [myWalletCards, setMyWalletCards] = useState([]);

  const CURRENT_USER_ID = "usr_prod_101_lucid";

  // Function to pull user asset items from the server database rows
  const fetchMyWalletInventory = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/user/portfolio/list?user_id=${CURRENT_USER_ID}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMyWalletCards(data);
      } else {
        setMyWalletCards([]);
      }
    } catch (error) {
      console.error("Failed to fetch wallet contents:", error);
    }
  };

  // Run the data fetch routine immediately when the user opens the dashboard panel
  useEffect(() => {
    fetchMyWalletInventory();
  }, []);

  const handleSearchInput = async (userInput: string) => {
    setSearchQuery(userInput);
    if (userInput.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/cards/search?query=${userInput}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Connection failure:", error);
    }
  };

  const provisionCardToWallet = async (cardId: string, cardName: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: CURRENT_USER_ID, card_id: cardId }),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage(`SUCCESS // PROVISIONED: ${cardName}`);
        setSearchQuery('');
        setSearchResults([]);
        
        // Instant sync: reload the card asset inventory display grid
        fetchMyWalletInventory();
        
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (error) {
      setStatusMessage('ERROR // FAILED_TO_PROVISION_ASSET');
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-8 font-mono flex flex-col items-center justify-start pt-16">
      
      {/* SECTION 1: SEARCH AND ONBOARDING SELECTOR MODULE */}
      <div className="w-full max-w-4xl border border-zinc-800 p-6 bg-[#0A0A0A] rounded-none mb-10">
        <h2 className="text-xs uppercase tracking-widest text-[#FF2E93] font-bold mb-4">
          PORTFOLIO_PROVISION_SYSTEM
        </h2>

        {statusMessage && (
          <div className="border border-[#FF2E93] bg-[#FF2E93]/10 text-white text-[11px] p-3 mb-4 font-bold tracking-tight uppercase rounded-none">
            {statusMessage}
          </div>
        )}

        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="TYPE TO QUERY BLOCKCHAIN / DEVALUATION MATRIX (E.G. CASHBACK, INFINIA)..."
          className="w-full bg-black border border-zinc-800 focus:border-[#FF2E93] p-4 text-xs font-mono text-white outline-none rounded-none uppercase transition-colors"
        />

        {searchResults.length > 0 && (
          <div className="border-x border-b border-zinc-800 bg-black mt-2 rounded-none max-h-64 overflow-y-auto">
            {searchResults.map((card: any) => (
              <div 
                key={card.card_id}
                onClick={() => provisionCardToWallet(card.card_id, card.card_name)}
                className="p-4 border-b border-zinc-900 hover:bg-[#0A0A0A] cursor-pointer flex justify-between items-center group transition-colors rounded-none"
              >
                <span className="text-xs font-bold tracking-tight group-hover:text-[#FF2E93]">
                  {card.bank_id} // {card.card_name}
                </span>
                <span className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-none uppercase group-hover:border-[#FF2E93] group-hover:text-white">
                  + ADD_TO_WALLET
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: THE BRUTALIST PORTFOLIO GRID INVENTORY VIEW */}
      <div className="w-full max-w-4xl">
        <div className="border-b border-zinc-800 pb-3 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            ACTIVE_PORTFOLIO_LEDGER ({myWalletCards.length})
          </h3>
        </div>

        {myWalletCards.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500 uppercase tracking-wider">
            NO ASSETS MOUNTED IN CURRENT USER WALLET SESSION. USE MATRIX SELECTOR ABOVE.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myWalletCards.map((card: any) => (
              <div 
                key={card.wallet_entry_id} 
                className="bg-[#0A0A0A] border border-zinc-800 p-5 relative rounded-none flex flex-col justify-between"
              >
                {/* Structural Hot Pink Sharp Accent Line Edge Indicator */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FF2E93]"></div>
                
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-1">
                    <span>{card.bank_id}</span>
                    <span className="border border-zinc-900 px-1 text-zinc-400">{card.card_network}</span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{card.card_name}</h4>
                </div>

                <div className="mt-8 flex justify-between items-center pt-3 border-t border-zinc-900 text-[10px] uppercase font-bold tracking-tight text-zinc-400">
                  <span>STATUS: ACTIVE</span>
                  <span className="text-zinc-600">ID: {card.card_id.slice(3, 10)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
