import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PDCASection } from './components/PDCASection';
import { IngestionSection } from './components/IngestionSection';
import { SupervisionSection } from './components/SupervisionSection';
import { RawDataSection } from './components/RawDataSection';
import { CorrelationSection } from './components/CorrelationSection';
import { ThresholdAlertsSection } from './components/ThresholdAlertsSection';
import { MeterMappingSection } from './components/MeterMappingSection';
import { CommercialModal } from './components/CommercialModal';
import { ISOReferenceModal } from './components/ISOReferenceModal';

import {
  generateInitialEnergyData,
  initialUES,
  initialIPEs,
  initialActions,
  initialAudits,
  initialNonConformites,
  initialSWOT,
  initialDetailedStakeholders,
  initialPolicy,
  initialRACI,
  initialCompetences,
  initialSites,
  initialAlertRules
} from './data/initialData';
import {
  EnergyDataPoint,
  ActionItem,
  EnergyPolicy,
  RACIItem,
  CompetenceProofItem,
  ThresholdAlertRule,
  NonConformiteItem
} from './types/energy';
import {
  Shield,
  Eye,
  Bell,
  ChevronDown,
  CheckCircle2,
  Check,
  Sparkles,
  Menu,
  Layers,
  CalendarCheck,
  AlertCircle,
  Network,
  Radio,
  Table,
  GitBranch,
  ShieldCheck,
  BarChart2
} from 'lucide-react';

export default function App() {
  const [currentPillar, setCurrentPillar] = useState<'sme' | 'supervision'>('sme');
  const [activeSection, setActiveSection] = useState<string>('plan');

  // État de masquage / réduction de la barre latérale en mode icônes seules
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  // État du volet mobile (drawer)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Mode d'accès : Administrateur (droits complets) ou Consultation (lecture seule / audit)
  const [accessMode, setAccessMode] = useState<'admin' | 'consultation'>('admin');

  // Menu Profil & Rôle utilisateur (Option 1)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermeture du menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Périmètre Monosite (Usine Val-de-Loire VDL-01)
  const siteMode = 'monosite';
  const selectedSiteId = 'val_de_loire';

  // Données Énergétiques & Règles d'Alertes sur Seuil
  const [data, setData] = useState<EnergyDataPoint[]>(() => generateInitialEnergyData(45));
  const [alertRules, setAlertRules] = useState<ThresholdAlertRule[]>(initialAlertRules);

  const [uesList] = useState(initialUES);
  const [ipeList] = useState(initialIPEs);
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [audits] = useState(initialAudits);
  const [nonConformites, setNonConformites] = useState<NonConformiteItem[]>(initialNonConformites);
  const [swotItems, setSwotItems] = useState(initialSWOT);
  const [stakeholders, setStakeholders] = useState(initialDetailedStakeholders);
  const [policy, setPolicy] = useState<EnergyPolicy>(initialPolicy);
  const [raciItems, setRaciItems] = useState<RACIItem[]>(initialRACI);
  const [competences, setCompetences] = useState<CompetenceProofItem[]>(initialCompetences);

  const [isNormeModalOpen, setIsNormeModalOpen] = useState(false);
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);

  // Calcul dynamique des alertes sur seuil actives sur le point de mesure le plus récent
  const activeAlertCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const latestPoint = data[data.length - 1];
    return alertRules.filter(r => r.active).reduce((cnt, rule) => {
      const val = Number(latestPoint[rule.variableKey]);
      let isTriggered = false;
      if (rule.operateur === '>') isTriggered = val > rule.seuil;
      else if (rule.operateur === '<') isTriggered = val < rule.seuil;
      else if (rule.operateur === '>=') isTriggered = val >= rule.seuil;
      else if (rule.operateur === '<=') isTriggered = val <= rule.seuil;
      return isTriggered ? cnt + 1 : cnt;
    }, 0);
  }, [data, alertRules]);

  // Nom du site actif pour affichage (Périmètre Monosite)
  const currentSiteName = 'Usine Val-de-Loire (VDL-01)';

  const handleSelectSection = (pillar: 'sme' | 'supervision', section: string) => {
    setCurrentPillar(pillar);
    setActiveSection(section);
  };

  // Création directe d'une parade / action depuis une faiblesse ou un risque SWOT
  const handleCreateActionFromRisk = (riskTitle: string, riskId: string) => {
    const newActId = `ACT-10${actions.length + 1}`;
    const newAction: ActionItem = {
      id: newActId,
      titre: `Parade face au risque : ${riskTitle}`,
      ues: 'Air Comprimé',
      responsable: 'Pilote Projet Énergie',
      echeance: '2025-11-30',
      gain_vise_kwh: 25000,
      budget_keuros: 4.5,
      statut: 'Planifié',
      origine_swot: `${riskId} : ${riskTitle}`
    };

    setActions(prev => [...prev, newAction]);
    setSwotItems(prev => prev.map(s => s.id === riskId ? { ...s, actionLieeId: newActId } : s));
    setCurrentPillar('sme');
    setActiveSection('do');
  };

  // Création automatique d'une fiche NC et bascule vers Act depuis une Alerte sur Seuil
  const handleNavigateToActFromAlert = (ncTitle: string, ues: string) => {
    const newNC: NonConformiteItem = {
      id: `NC-ALERT-${Date.now().toString().slice(-4)}`,
      date_constat: new Date().toISOString().split('T')[0],
      ues: ues || 'Froid Industriel',
      description: `Dérive mesurée lors de la surveillance en temps réel : ${ncTitle}`,
      cause_racine: 'Dépassement du seuil critique paramétré en supervision continue',
      action_corrective: 'Contrôle immédiat des régulations automates et vérification du sous-comptage',
      responsable: 'Responsable Maintenance / Utilités',
      statut: 'En cours',
      date_cloture: '-'
    };
    setNonConformites(prev => [newNC, ...prev]);
    setCurrentPillar('sme');
    setActiveSection('act');
  };

  return (
    // Disposition figée : h-screen avec overflow-hidden garantissant que le menu latéral
    // et l'en-tête restent immobiles et parfaitement ancrés lors du défilement
    <div className="h-screen w-screen overflow-hidden bg-slate-100/70 text-slate-900 flex font-sans">
      
      {/* 1. Menu Latéral à Gauche (Sidebar) Fixe & Rétractable */}
      <Sidebar
        currentPillar={currentPillar}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenNormeModal={() => setIsNormeModalOpen(true)}
        onOpenCommercialModal={() => setIsCommercialModalOpen(true)}
        accessMode={accessMode}
        activeAlertCount={activeAlertCount}
        siteMode="monosite"
        selectedSiteName={currentSiteName}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* 2. Conteneur Principal (En-tête Figé en haut + Zone de Défilement interne) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Entête Figé Épuré & Adaptatif Mobile / Tablette / PC */}
        <header className="shrink-0 z-20 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shadow-2xs">
          
          {/* Bouton Hamburger Mobile + Fil d'Ariane & Contexte de Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Bouton Hamburger visible uniquement sur mobile (< md) */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
              title="Ouvrir le menu de navigation"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 min-w-0">
              <span className="font-bold text-slate-900 truncate">
                {currentPillar === 'sme'
                  ? 'SMÉ (Cycle PDCA)'
                  : activeSection === 'supervision'
                  ? 'Supervision Temps Réel'
                  : activeSection === 'alertes'
                  ? 'Centre d\'Alertes'
                  : 'Configuration & Réseau'}
              </span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold truncate">
                {activeSection === 'plan' ? '1. Plan (Planifier)' :
                 activeSection === 'do' ? '2. Do (Réaliser)' :
                 activeSection === 'check' ? '3. Check (Vérifier)' :
                 activeSection === 'act' ? '4. Act (Agir)' :
                 activeSection === 'supervision' ? 'UES & Ratios IPÉ' :
                 activeSection === 'alertes' ? 'Surveillance sur Seuils' :
                 activeSection === 'cartographie' ? 'Cartographie & Sous-Comptage' :
                 activeSection === 'ingestion' ? 'Passerelle 4G & Ingestion IoT' :
                 activeSection === 'raw_data' ? 'Données Brutes Horodatées' :
                 activeSection === 'correlations' ? 'Facteurs Pertinents & Corrélations' :
                 activeSection.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Contrôles de Droite Épurés : Offres & Déploiement + Cloche d'Alertes + Menu Profil Utilisateur */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Bouton Accès aux Offres & Déploiement B2B */}
            <button
              onClick={() => setIsCommercialModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors shadow-2xs"
              title="Découvrir les offres (Solution SaaS, Conseil ISO 50001, Partenariat)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Offres & Déploiement</span>
              <span className="sm:hidden">Offres</span>
            </button>
            
            {/* Cloche d'alerte sur seuil opérationnelle */}
            <button
              onClick={() => handleSelectSection('supervision', 'alertes')}
              className={`relative p-2 rounded-lg border transition-colors ${
                activeAlertCount > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 animate-pulse'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              title={activeAlertCount > 0 ? `${activeAlertCount} alerte(s) seuil active(s) - Cliquer pour ouvrir` : 'Alertes de supervision énergétique'}
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Menu Profil Utilisateur & Mode d'accès (Option 1) */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs focus:outline-none focus:ring-2 focus:ring-slate-400/20 shadow-2xs"
                title="Gérer les droits d'accès et le profil utilisateur"
              >
                {/* Avatar initiales */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                  JS
                </div>
                
                {/* Identité & badge mode actuel */}
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-800 leading-tight">Ju. Saliou</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 leading-tight">
                    {accessMode === 'admin' ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                        <Eye className="w-2.5 h-2.5" /> Consultation
                      </span>
                    )}
                  </div>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  {/* En-tête profil */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Julien Saliou</p>
                    <p className="text-[11px] text-slate-500 truncate">referent.energie@valdeloire-industrie.fr</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Périmètre : Usine Val-de-Loire (VDL-01)
                    </div>
                  </div>

                  {/* Section Rôle & Droits d'accès */}
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Rôle & Droits d'accès
                    </div>

                    <button
                      onClick={() => {
                        setAccessMode('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        accessMode === 'admin'
                          ? 'bg-emerald-50 text-emerald-950 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          accessMode === 'admin' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <div>Administrateur</div>
                          <div className="text-[10px] text-slate-500 font-normal">Droits complets d'édition et paramétrage</div>
                        </div>
                      </div>
                      {accessMode === 'admin' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>

                    <button
                      onClick={() => {
                        setAccessMode('consultation');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        accessMode === 'consultation'
                          ? 'bg-amber-50 text-amber-950 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          accessMode === 'consultation' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <div>Consultation / Audit</div>
                          <div className="text-[10px] text-slate-500 font-normal">Lecture seule et revue d'audit ISO 50001</div>
                        </div>
                      </div>
                      {accessMode === 'consultation' && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Barre de Sous-Onglets Horizontaux Figée (Reste 100% visible lors du défilement vertical) */}
        {currentPillar === 'sme' && (
          <nav
            aria-label="Sous-onglets du Cycle PDCA"
            className="shrink-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2 shadow-2xs"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hidden md:inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cycle PDCA</span>
                </span>

                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
                  {[
                    { id: 'plan', label: '1. Plan (Planifier)', badge: '§4-§6', icon: Layers },
                    { id: 'do', label: '2. Do (Réaliser)', badge: '§7-§8', icon: CalendarCheck },
                    { id: 'check', label: '3. Check (Vérifier)', badge: '§9', icon: CheckCircle2 },
                    { id: 'act', label: '4. Act (Agir)', badge: '§10', icon: AlertCircle }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isTabActive = activeSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectSection('sme', tab.id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                          isTabActive
                            ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded hidden sm:inline-block ${
                          isTabActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/70 text-slate-500'
                        }`}>
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Raccourci contextuel rapide vers la cartographie des compteurs (§6.6) */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <span className="text-[11px] text-slate-400">Collecte (§6.6) :</span>
                <button
                  onClick={() => handleSelectSection('supervision', 'cartographie')}
                  className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 transition-colors inline-flex items-center gap-1.5 font-medium"
                  title="Aller directement à la cartographie & sous-comptage énergétique"
                >
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cartographie & Compteurs</span>
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* Barre de Sous-Onglets Horizontaux Figée pour Configuration & Réseau */}
        {currentPillar === 'supervision' && ['cartographie', 'ingestion', 'raw_data', 'correlations'].includes(activeSection) && (
          <nav
            aria-label="Sous-onglets Métrologie & Configuration"
            className="shrink-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2 shadow-2xs"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 hidden md:inline-flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Configuration & Réseau</span>
                </span>

                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
                  {[
                    { id: 'cartographie', label: 'Cartographie & Compteurs', badge: 'Arborescence', icon: Network },
                    { id: 'ingestion', label: 'Passerelle & Ingestion IoT', badge: '4G / Modbus', icon: Radio },
                    { id: 'raw_data', label: 'Données Brutes', badge: 'Horodatage & CSV', icon: Table },
                    { id: 'correlations', label: 'Facteurs & Corrélations', badge: 'Stats & R²', icon: GitBranch }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isTabActive = activeSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectSection('supervision', tab.id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                          isTabActive
                            ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded hidden sm:inline-block ${
                          isTabActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200/70 text-slate-500'
                        }`}>
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Raccourci vers la Supervision Temps Réel */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <button
                  onClick={() => handleSelectSection('supervision', 'supervision')}
                  className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 transition-colors inline-flex items-center gap-1.5 font-medium"
                  title="Accéder au monitoring des UES et ratios IPÉ"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Voir la Supervision Temps Réel</span>
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* 3. Zone de Contenu Déroulante Verticalement (L'en-tête et la barre latérale restent figés) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
          
          {/* Bannière informative si Mode Consultation */}
          {accessMode === 'consultation' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Mode Consultation actif :</strong> Vous visualisez les tableaux, matrices et indicateurs en mode lecture seule (idéal pour auditeurs internes et revue de conformité ISO 50001).
                </span>
              </div>
              <button
                onClick={() => setAccessMode('admin')}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded font-semibold text-amber-900 transition-colors shrink-0"
              >
                Passer en mode Admin
              </button>
            </div>
          )}

          {/* PILIER 1 : SMÉ (SYSTÈME DE MANAGEMENT DE L'ÉNERGIE) */}
          {currentPillar === 'sme' && (
            <PDCASection
              uesList={uesList}
              ipeList={ipeList}
              actions={actions}
              setActions={setActions}
              audits={audits}
              nonConformites={nonConformites}
              setNonConformites={setNonConformites}
              stakeholders={stakeholders}
              setStakeholders={setStakeholders}
              swotItems={swotItems}
              setSwotItems={setSwotItems}
              policy={policy}
              setPolicy={setPolicy}
              raciItems={raciItems}
              setRaciItems={setRaciItems}
              competences={competences}
              setCompetences={setCompetences}
              step={activeSection as any}
              onStepChange={(newStep) => setActiveSection(newStep)}
              onRequestCreateActionFromRisk={handleCreateActionFromRisk}
              accessMode={accessMode}
              onNavigateToSupervision={() => handleSelectSection('supervision', 'supervision')}
              onNavigateToCartographie={() => handleSelectSection('supervision', 'cartographie')}
            />
          )}

          {/* PILIER 2 : ANALYSE ET SUPERVISION */}
          {currentPillar === 'supervision' && activeSection === 'ingestion' && (
            <IngestionSection data={data} setData={setData} />
          )}

          {currentPillar === 'supervision' && activeSection === 'supervision' && (
            <SupervisionSection data={data} />
          )}

          {currentPillar === 'supervision' && activeSection === 'alertes' && (
            <ThresholdAlertsSection
              data={data}
              alertRules={alertRules}
              setAlertRules={setAlertRules}
              accessMode={accessMode}
              onNavigateToAct={handleNavigateToActFromAlert}
            />
          )}

          {currentPillar === 'supervision' && activeSection === 'correlations' && (
            <CorrelationSection data={data} />
          )}

          {currentPillar === 'supervision' && activeSection === 'raw_data' && (
            <RawDataSection data={data} />
          )}

          {currentPillar === 'supervision' && activeSection === 'cartographie' && (
            <MeterMappingSection accessMode={accessMode} />
          )}

        </main>
      </div>

      {/* Modal Référentiel NF EN ISO 50001:2018 */}
      <ISOReferenceModal
        isOpen={isNormeModalOpen}
        onClose={() => setIsNormeModalOpen(false)}
      />

      {/* Modal Commercial & Demande de Déploiement (SaaS, PoC, Partenariat) */}
      <CommercialModal
        isOpen={isCommercialModalOpen}
        onClose={() => setIsCommercialModalOpen(false)}
      />
    </div>
  );
}
