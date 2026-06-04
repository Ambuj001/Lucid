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
    <div className="bg-[#F8FAFC] text-[#0F172A] p-8 min-h-screen font-sans m-4">
      {/* Structural Header Layout Block */}
      <div className="border-b border-slate-200 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase text-[#0F172A]">cardwise. // ASSET_PORTFOLIO</h1>
          <p className="text-xs text-[#64748B] mt-1 uppercase tracking-widest">Manual card matrix authorization configuration</p>
        </div>
        <button className="btn-spectral uppercase text-xs px-4 py-2 tracking-tight rounded-xl">
          + PROVISION_NEW_ASSET
        </button>
      </div>

      {/* Grid Allocation Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeUserCards.map((card) => (
          <div 
            key={card.card_id} 
            className="bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Spectral Accent Stripe */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>

            <div className="pl-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{card.bank_name}</span>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-lg tracking-tighter">
                  {card.base_yield}% BASE_YIELD
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] uppercase mt-1 tracking-tight">{card.card_variant}</h3>
            </div>

            <div className="mt-8 pl-3">
              {card.gimmick_alert ? (
                <div className="bg-slate-50 border-l-2 border-indigo-500 p-3 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-black text-indigo-400 uppercase block tracking-widest">⚠️ INTERCEPTED_TRAP</span>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{card.gimmick_alert}</p>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 border border-slate-200 rounded-xl">
                  <p className="text-xs text-[#64748B] italic uppercase text-[10px] tracking-tight">Status: Clean structural mapping profile loaded.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 pl-3 flex justify-end gap-2">
              <button className="border border-slate-200 hover:border-indigo-500/50 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 uppercase text-[10px] px-3 py-1.5 transition-colors rounded-lg">
                VIEW_RULES
              </button>
              <button className="border border-slate-200 hover:border-red-500/50 text-[#64748B] hover:text-red-400 uppercase text-[10px] px-3 py-1.5 transition-colors rounded-lg">
                PURGE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
