'use client';

import { useState } from 'react';

export default function LucidDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // Hardcoding a dummy user UUID for our MVP phase
  const CURRENT_USER_ID = "usr_prod_101_lucid";

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

  // NEW FUNCTION: Sends the selection back to the server ledger
  const provisionCardToWallet = async (cardId: string, cardName: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/portfolio/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: CURRENT_USER_ID,
          card_id: cardId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage(`SUCCESS // PROVISIONED: ${cardName}`);
        setSearchQuery('');
        setSearchResults([]);
        
        // Clear status alert badge after 4 seconds
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (error) {
      setStatusMessage('ERROR // FAILED_TO_PROVISION_ASSET');
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-8 font-mono flex flex-col items-center justify-start pt-24">
      <div className="w-full max-w-lg border border-zinc-800 p-6 bg-[#0A0A0A] rounded-none">
        
        <h2 className="text-xs uppercase tracking-widest text-[#FF2E93] font-bold mb-4">
          PORTFOLIO_PROVISION_SYSTEM
        </h2>

        {/* Live Notification Indicator Grid Area */}
        {statusMessage && (
          <div className="border border-[#FF2E93] bg-[#FF2E93]/10 text-white text-[11px] p-3 mb-4 font-bold tracking-tight uppercase rounded-none">
            {statusMessage}
          </div>
        )}

        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="TYPE TO QUERY DATABASE (E.G. CASHBACK, INFINIA)..."
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
    </div>
  );
}
