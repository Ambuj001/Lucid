import React from 'react';

interface CardwiseCardMetadata {
  card_id: string;
  bank_name: string;
  card_variant: string;
  base_yield: number;
  gimmick_alert: string | null;
}

interface WalletDeckProps {
  activeUserCards: CardwiseCardMetadata[];
}

export const WalletDeckComponent: React.FC<WalletDeckProps> = ({ activeUserCards }) => {
  return (
    <div className="bg-black text-white p-8 min-h-screen font-mono border border-zinc-800 m-4">
      {/* Structural Header Layout Block */}
      <div className="border-b border-zinc-800 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase text-white">CARDWISE // ASSET_PORTFOLIO</h1>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">Manual card matrix authorization configuration</p>
        </div>
        <button className="bg-white hover:bg-[#FF2E93] hover:text-white text-black font-bold uppercase text-xs px-4 py-2 tracking-tight transition-colors duration-150 border border-white rounded-none">
          + PROVISION_NEW_ASSET
        </button>
      </div>

      {/* Grid Allocation Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeUserCards.map((card) => (
          <div 
            key={card.card_id} 
            className="bg-[#0A0A0A] border border-zinc-800 hover:border-[#FF2E93] p-6 flex flex-col justify-between transition-all duration-200 rounded-none relative"
          >
            {/* Visual Pink Accent Tag for Active Identification */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF2E93]"></div>

            <div className="pl-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{card.bank_name}</span>
                <span className="text-xs text-[#FF2E93] bg-[#FF2E93]/10 font-bold px-2 py-0.5 tracking-tighter">
                  {card.base_yield}% BASE_YIELD
                </span>
              </div>
              <h3 className="text-lg font-bold text-white uppercase mt-1 tracking-tight">{card.card_variant}</h3>
            </div>

            <div className="mt-8 pl-2">
              {card.gimmick_alert ? (
                <div className="bg-black border-l-2 border-[#FF2E93] p-3 border border-zinc-900 rounded-none">
                  <span className="text-[10px] font-black text-[#FF2E93] uppercase block tracking-widest">⚠️ INTERCEPTED_TRAP</span>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{card.gimmick_alert}</p>
                </div>
              ) : (
                <div className="bg-black p-3 border border-zinc-900 rounded-none">
                  <p className="text-xs text-zinc-500 italic uppercase text-[10px] tracking-tight">Status: Clean structural mapping profile loaded.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-900 pl-2 flex justify-end gap-2">
              <button className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white uppercase text-[10px] px-3 py-1.5 transition-colors rounded-none">
                VIEW_RULES
              </button>
              <button className="border border-zinc-800 hover:border-red-600 text-zinc-500 hover:text-red-500 uppercase text-[10px] px-3 py-1.5 transition-colors rounded-none">
                PURGE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
