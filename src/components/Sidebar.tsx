import React from 'react';
import {
  CalendarCheck,
  Layers,
  CheckCircle2,
  AlertCircle,
  Radio,
  BarChart2,
  GitBranch,
  Table,
  BookOpen,
  Activity,
  Bell,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
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
  // Pilier 1 avec les 4 étapes classiques du cycle PDCA
  const smeItems = [
    { id: 'plan', label: 'Plan (Planifier)', icon: Layers, badge: '§4-§5-§6' },
    { id: 'do', label: 'Do (Réaliser)', icon: CalendarCheck, badge: '§7-§8' },
    { id: 'check', label: 'Check (Vérifier)', icon: CheckCircle2, badge: '§9' },
    { id: 'act', label: 'Act (Agir)', icon: AlertCircle, badge: '§10' }
  ];

  const supervisionItems = [
    { id: 'supervision', label: 'Supervision UES & IPÉ', icon: BarChart2, badge: 'Flux' },
    { id: 'alertes', label: 'Alertes sur Seuil', icon: Bell, badge: activeAlertCount > 0 ? `${activeAlertCount} active(s)` : 'Seuils' },
    { id: 'correlations', label: 'Facteurs & Corrélations', icon: GitBranch, badge: 'Stats' },
    { id: 'raw_data', label: 'Données Brutes', icon: Table, badge: 'Horodatage ➔' },
    { id: 'cartographie', label: 'Cartographie & Compteurs', icon: Network, badge: 'Arbo' },
    { id: 'ingestion', label: 'Passerelle & Ingestion', icon: Radio, badge: 'IoT' }
  ];

  const handleItemClick = (pillar: 'sme' | 'supervision', sectionId: string) => {
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
        isCollapsed ? 'p-2.5 justify-center flex-col gap-2' : 'p-4 justify-between gap-3'
      }`}>
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div
            className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs cursor-pointer hover:bg-emerald-500/30 transition-colors"
            title="UniSme — Management & Supervision ISO 50001"
            onClick={onToggleCollapse}
          >
            <Activity className="w-5 h-5" />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                <span>UniSme</span>
                <span className="text-[10px] font-mono px-1 py-0.2 bg-emerald-950/80 text-emerald-400 rounded border border-emerald-800/60 font-semibold">
                  ISO 50001
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 truncate">Management & Supervision</p>
            </div>
          )}
        </div>

        {/* Bouton Réduire / Agrandir (Desktop / Tablet) */}
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Masquer le texte (mode icônes uniquement)"
            aria-label="Réduire la barre latérale"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}

        {isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Déplier la barre latérale"
            aria-label="Agrandir la barre latérale"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Bouton Fermer sur Mobile Drawer */}
        {isMobileOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer le menu"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Périmètre Monosite Certifié */}
      {!isCollapsed ? (
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800">
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
          className="py-2.5 flex flex-col items-center border-b border-slate-800 bg-slate-950/70 cursor-pointer"
          title={`Périmètre Monosite : ${selectedSiteName}`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[9px] font-mono text-emerald-400/90 font-bold mt-0.5">VDL</span>
        </div>
      )}

      {/* Navigation Sections */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-1.5 space-y-4' : 'p-3 space-y-6'}`}>
        
        {/* PILIER 1 : SMÉ (SYSTÈME DE MANAGEMENT) */}
        <div>
          {!isCollapsed ? (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1. SMÉ (Management)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">PDCA</span>
            </div>
          ) : (
            <div className="flex justify-center pb-2 pt-1" title="1. SMÉ (Management) — Cycle PDCA">
              <div className="w-7 h-7 rounded-md bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            {smeItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentPillar === 'sme' && activeSection === item.id;
              
              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick('sme', item.id)}
                    title={`${item.label} (${item.badge})`}
                    className={`w-full h-10 rounded-lg flex items-center justify-center transition-all relative ${
                      isSelected
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-400 rounded-r"></span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick('sme', item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PILIER 2 : ANALYSE ET SUPERVISION */}
        <div>
          {!isCollapsed ? (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-blue-400 shrink-0" />
                <span>2. Analyse & Supervision</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Data</span>
            </div>
          ) : (
            <div className="flex justify-center pb-2 pt-2 border-t border-slate-800/80" title="2. Analyse & Supervision — Flux & Indicateurs">
              <div className="w-7 h-7 rounded-md bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 shadow-2xs">
                <LineChart className="w-4 h-4" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            {supervisionItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentPillar === 'supervision' && activeSection === item.id;
              const hasAlertBadge = item.id === 'alertes' && activeAlertCount > 0;

              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick('supervision', item.id)}
                    title={`${item.label} (${item.badge})`}
                    className={`w-full h-10 rounded-lg flex items-center justify-center transition-all relative ${
                      isSelected
                        ? 'bg-slate-800 text-blue-400 border border-blue-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {hasAlertBadge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse"></span>
                    )}
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-400 rounded-r"></span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick('supervision', item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    hasAlertBadge
                      ? 'bg-rose-500/20 text-rose-300 font-bold'
                      : isSelected ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Actions & Outils Techniques */}
      <div className={`border-t border-slate-800 bg-slate-950/70 transition-all ${
        isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-2.5'
      }`}>
        <button
          onClick={onOpenNormeModal}
          title="Référentiel NF EN ISO 50001:2018"
          className={`w-full flex items-center rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors ${
            isCollapsed ? 'justify-center p-2.5 h-10' : 'gap-2 px-3 py-2'
          }`}
        >
          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Référentiel ISO 50001</span>}
        </button>

        <div className={`border-t border-slate-800/80 ${isCollapsed ? 'pt-1.5' : 'pt-2 space-y-2'}`}>
          {!isCollapsed && (
            <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Déploiement & Offres</span>
              <span className="font-semibold text-emerald-400 text-[10px] bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                B2B
              </span>
            </div>
          )}

          <button
            onClick={onOpenCommercialModal}
            className={`w-full flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold transition-all shadow-md group ${
              isCollapsed ? 'justify-center p-2.5 h-10' : 'justify-center gap-2 px-3 py-2.5 text-xs'
            }`}
            title="Demander un déploiement SaaS, PoC pilote ou Partenariat"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 group-hover:rotate-12 transition-transform shrink-0" />
            {!isCollapsed && <span>Déployer la Solution</span>}
            {!isCollapsed && <ArrowRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />}
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
          <div className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
