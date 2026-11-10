import React from 'react';
import { ArrowLeft, Sparkles, RotateCcw, ShieldCheck, Factory } from 'lucide-react';

interface SandboxBannerProps {
  onBackToLanding: () => void;
  onRequestQuote: () => void;
  onResetData: () => void;
  companyName?: string;
}

export const SandboxBanner: React.FC<SandboxBannerProps> = ({
  onBackToLanding,
  onRequestQuote,
  onResetData,
  companyName = 'Usine Val-de-Loire (VDL-01)'
}) => {
  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-md z-40 sticky top-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors font-medium shrink-0 cursor-pointer text-[11px]"
          title="Retourner à la page commerciale UniSme"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Site Commercial</span>
        </button>

        <span className="hidden md:inline-block text-slate-600">|</span>

        <div className="flex items-center gap-1.5 truncate">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            VERSION DÉMO
          </span>
          <span className="text-slate-300 truncate hidden sm:inline">
            Périmètre industriel actif : <strong className="text-white font-semibold">{companyName}</strong>
          </span>
          <span className="text-slate-400 hidden lg:inline text-[11px]">
            · Données réelles ISO 50001 (UES, IPÉ, seuils, PDCA)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onResetData}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] cursor-pointer"
          title="Réinitialiser les données de la démo"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">Réinitialiser</span>
        </button>

        <button
          onClick={onRequestQuote}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nous contacter</span>
        </button>
      </div>
    </div>
  );
};
