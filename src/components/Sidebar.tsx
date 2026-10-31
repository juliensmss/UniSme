import React from 'react';
import {
  BarChart2,
  BookOpen,
  Activity,
  Bell,
  Building2,
  Sparkles,
  ShieldCheck,
  X,
  Network
} from 'lucide-react';

interface SidebarProps {
  currentPillar: 'sme' | 'supervision';
  activeSection: string;
  onSelectSection: (pillar: 'sme' | 'supervision', section: string) => void;
  onOpenNormeModal: () => void;
  onOpenCommercialModal: () => void;
  accessMode?: 'admin' | 'consultation';
  activeAlertCount?: number;
  siteMode?: 'monosite' | 'multisite';
  selectedSiteName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPillar,
  activeSection,
  onSelectSection,
  onOpenNormeModal,
  onOpenCommercialModal,
  accessMode = 'admin',
  activeAlertCount = 0,
  siteMode = 'monosite',
  selectedSiteName = 'Usine Val-de-Loire (VDL-01)',
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  // Détection des sections actives
  const isSmePillar = currentPillar === 'sme';
  const isSupervisionView = currentPillar === 'supervision' && activeSection === 'supervision';
  const isAlertesView = currentPillar === 'supervision' && activeSection === 'alertes';
  const isConfigView = currentPillar === 'supervision' && ['cartographie', 'ingestion', 'raw_data', 'correlations'].includes(activeSection);

  // Listes des IDs pour la sélection automatique
  const smeSubIds = ['intro', 'plan', 'do', 'check', 'act'];
  const configSubIds = ['cartographie', 'ingestion', 'raw_data', 'correlations'];

  const handleSelect = (pillar: 'sme' | 'supervision', sectionId: string) => {
    onSelectSection(pillar, sectionId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-slate-900 text-slate-300 select-none overflow-hidden transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Brand Header */}
      <div className={`border-b border-slate-800 flex items-center transition-all ${
        isCollapsed ? 'p-2.5 justify-center flex-col gap-2' : 'p-3 justify-between gap-2'
      }`}>
        <div className={`flex items-center gap-2.5 min-w-0 flex-1 ${isCollapsed ? 'justify-center' : ''}`}>
          <div
            className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs cursor-pointer hover:bg-emerald-500/30 transition-colors"
            title="UniSme — Management & Supervision de l'Énergie"
            onClick={onToggleCollapse}
          >
            <Activity className="w-4 h-4" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1 pr-1">
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-tight">
                <span>UniSme</span>
              </h1>
              <p className="text-[10.5px] text-slate-300 leading-tight break-words whitespace-normal">
                Management & Supervision de l'Énergie
              </p>
            </div>
          )}
        </div>

        {/* Bouton Fermer sur Mobile Drawer uniquement (pas de flèche) */}
        {isMobileOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer le menu"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Périmètre Monosite Certifié */}
      {!isCollapsed ? (
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Périmètre</span>
            </span>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60 font-mono">
              Monosite
            </span>
          </div>
          <div className="font-semibold text-xs text-white truncate" title={selectedSiteName}>
            Usine Val-de-Loire
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="truncate">VDL-01 · Établissement certifié</span>
          </div>
        </div>
      ) : (
        <div
          className="py-2 flex flex-col items-center border-b border-slate-800 bg-slate-950/70 cursor-pointer"
          title={`Périmètre Monosite : ${selectedSiteName}`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[9px] font-mono text-emerald-400/90 font-bold mt-0.5">VDL</span>
        </div>
      )}

      {/* Navigation Principale Épurée (4 Piliers Majeurs < 7 items) */}
      <div className={`flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
        isCollapsed ? 'p-1.5 space-y-1.5' : 'p-2 space-y-1.5'
      }`}>
        
        {/* En-tête de section discrète */}
        {!isCollapsed && (
          <div className="px-2 pt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Principale
          </div>
        )}

        {/* 1. SMÉ (MANAGEMENT DE L'ÉNERGIE) */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => handleSelect('sme', smeSubIds.includes(activeSection) ? activeSection : 'intro')}
              title="SMÉ — Système de Management de l'Énergie"
              className={`w-full h-9 rounded-lg flex items-center justify-center transition-all relative ${
                isSmePillar
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {isSmePillar && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-400 rounded-r"></span>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleSelect('sme', smeSubIds.includes(activeSection) ? activeSection : 'intro')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group ${
                isSmePillar
                  ? 'bg-emerald-950/60 text-white border border-emerald-800/60 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1 rounded-md shrink-0 transition-colors ${
                  isSmePillar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <div className="truncate font-bold text-slate-100">SMÉ</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Management</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                isSmePillar ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                ISO 50001
              </span>
            </button>
          )}
        </div>

        {/* 2. SUPERVISION TEMPS RÉEL */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => handleSelect('supervision', 'supervision')}
              title="Supervision Temps Réel (UES & Indicateurs IPÉ)"
              className={`w-full h-10 rounded-lg flex items-center justify-center transition-all relative ${
                isSupervisionView
                  ? 'bg-slate-800 text-blue-400 border border-blue-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart2 className="w-5 h-5 shrink-0" />
              {isSupervisionView && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-400 rounded-r"></span>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleSelect('supervision', 'supervision')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group ${
                isSupervisionView
                  ? 'bg-blue-950/60 text-white border border-blue-800/60 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1 rounded-md shrink-0 transition-colors ${
                  isSupervisionView ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                }`}>
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <div className="truncate font-bold text-slate-100">Supervision Temps Réel</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Monitoring UES & Ratios IPÉ</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                isSupervisionView ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                Flux
              </span>
            </button>
          )}
        </div>

        {/* 3. CENTRE D'ALERTES & SEUILS */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => handleSelect('supervision', 'alertes')}
              title={`Centre d'Alertes & Seuils (${activeAlertCount} active(s))`}
              className={`w-full h-9 rounded-lg flex items-center justify-center transition-all relative ${
                isAlertesView
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bell className="w-5 h-5 shrink-0" />
              {activeAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse"></span>
              )}
              {isAlertesView && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-amber-400 rounded-r"></span>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleSelect('supervision', 'alertes')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group ${
                isAlertesView
                  ? 'bg-amber-950/60 text-white border border-amber-800/60 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1 rounded-md shrink-0 transition-colors ${
                  activeAlertCount > 0
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : isAlertesView ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 group-hover:text-amber-400'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <div className="truncate font-bold text-slate-100">Centre d'Alertes & Seuils</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Surveillance continue</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                activeAlertCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse'
                  : isAlertesView ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeAlertCount > 0 ? `${activeAlertCount} active(s)` : 'Seuils'}
              </span>
            </button>
          )}
        </div>

        {/* 4. CONFIGURATION & RÉSEAU ⚙️ */}
        <div>
          {isCollapsed ? (
            <button
              onClick={() => handleSelect('supervision', configSubIds.includes(activeSection) ? activeSection : 'cartographie')}
              title="Configuration & Réseau (Cartographie, Passerelle, Données, Corrélations)"
              className={`w-full h-9 rounded-lg flex items-center justify-center transition-all relative ${
                isConfigView
                  ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Network className="w-5 h-5 shrink-0" />
              {isConfigView && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-400 rounded-r"></span>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleSelect('supervision', configSubIds.includes(activeSection) ? activeSection : 'cartographie')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group ${
                isConfigView
                  ? 'bg-indigo-950/60 text-white border border-indigo-800/60 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1 rounded-md shrink-0 transition-colors ${
                  isConfigView ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'
                }`}>
                  <Network className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <div className="truncate font-bold text-slate-100 flex items-center gap-1">
                    <span>Configuration & Réseau</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Compteurs, IoT & Données</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                isConfigView ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                4 outils
              </span>
            </button>
          )}
        </div>

      </div>

      {/* Footer Actions & Outils Techniques (Norme + Déploiement B2B) */}
      <div className={`border-t border-slate-800 bg-slate-950/70 transition-all ${
        isCollapsed ? 'p-1.5 space-y-1.5' : 'p-2 space-y-1.5'
      }`}>
        <button
          onClick={onOpenNormeModal}
          title="Référentiel NF EN ISO 50001:2018"
          className={`w-full flex items-center rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors ${
            isCollapsed ? 'justify-center p-2 h-9' : 'gap-2 px-2.5 py-1.5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Référentiel ISO 50001</span>}
        </button>

        <div className={`border-t border-slate-800/80 ${isCollapsed ? 'pt-1' : 'pt-1.5 space-y-1.5'}`}>
          {!isCollapsed && (
            <div className="px-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Déploiement & Offres</span>
              <span className="font-semibold text-emerald-400 text-[9.5px] bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                B2B
              </span>
            </div>
          )}

          <button
            onClick={onOpenCommercialModal}
            className={`w-full flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold transition-all shadow-md group ${
              isCollapsed ? 'justify-center p-2 h-9' : 'justify-center gap-2 px-3 py-2 text-xs'
            }`}
            title="Déployer UniSme : Solution SaaS, Conseil ISO 50001 ou Partenariat"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 group-hover:rotate-12 transition-transform shrink-0" />
            {!isCollapsed && <span>Déployer la Solution</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Tablet Static Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 z-30 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop semi-transparent */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative z-50 w-64 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
