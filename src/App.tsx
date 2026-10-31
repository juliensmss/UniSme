import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PDCASection } from './components/PDCASection';
import { IngestionSection } from './components/IngestionSection';
import { SupervisionSection } from './components/SupervisionSection';
import { RawDataSection } from './components/RawDataSection';
import { CorrelationSection } from './components/CorrelationSection';
import { ThresholdAlertsSection } from './components/ThresholdAlertsSection';
import { MeterMappingSection } from './components/MeterMappingSection';
import { UserAccessSection } from './components/UserAccessSection';
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
  initialAlertRules,
  initialUsers
} from './data/initialData';
import {
  EnergyDataPoint,
  ActionItem,
  EnergyPolicy,
  RACIItem,
  CompetenceProofItem,
  ThresholdAlertRule,
  NonConformiteItem,
  UserRole,
  UserAccountItem
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
  BarChart2,
  BookOpen,
  Zap,
  Wrench,
  Users,
  Lock
} from 'lucide-react';

export default function App() {
  const [currentPillar, setCurrentPillar] = useState<'sme' | 'supervision'>('sme');
  const [activeSection, setActiveSection] = useState<string>('intro');

  // État de masquage / réduction de la barre latérale en mode icônes seules
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  // État du volet mobile (drawer)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Gestion des Profils Utilisateurs & Rôles RBAC (ISO 50001 §5.3)
  const [users, setUsers] = useState<UserAccountItem[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserAccountItem>(initialUsers[0]);

  const userRole: UserRole = currentUser.role;
  // Rétrocompatibilité pour les composants enfants existants
  const accessMode: 'admin' | 'consultation' = (userRole === 'admin' || userRole === 'energy_manager') ? 'admin' : 'consultation';

  const handleSelectRole = (newRole: UserRole) => {
    const representative = users.find(u => u.role === newRole);
    if (representative) {
      setCurrentUser(representative);
    } else {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
    // Si l'utilisateur quitte le profil Admin alors qu'il consultait la gestion des accès, on le redirige
    if (newRole !== 'admin' && activeSection === 'users') {
      setCurrentPillar('sme');
      setActiveSection('intro');
    }
    setIsUserMenuOpen(false);
  };

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
        userRole={userRole}
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
                  ? 'SMÉ'
                  : activeSection === 'users'
                  ? 'Administration'
                  : activeSection === 'supervision'
                  ? 'Supervision Temps Réel'
                  : activeSection === 'alertes'
                  ? 'Centre d\'Alertes'
                  : 'Configuration & Réseau'}
              </span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold truncate">
                {activeSection === 'intro' ? 'Comprendre le SMÉ & PDCA' :
                 activeSection === 'plan' ? '1. Plan (Planifier)' :
                 activeSection === 'do' ? '2. Do (Réaliser)' :
                 activeSection === 'check' ? '3. Check (Vérifier)' :
                 activeSection === 'act' ? '4. Act (Agir)' :
                 activeSection === 'supervision' ? 'UES & Ratios IPÉ' :
                 activeSection === 'alertes' ? 'Surveillance sur Seuils' :
                 activeSection === 'cartographie' ? 'Cartographie & Sous-Comptage' :
                 activeSection === 'ingestion' ? 'Passerelle 4G & Ingestion IoT' :
                 activeSection === 'raw_data' ? 'Données Brutes Horodatées' :
                 activeSection === 'correlations' ? 'Facteurs Pertinents & Corrélations' :
                 activeSection === 'users' ? 'Gestion des Accès & Rôles (RBAC)' :
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

            {/* Menu Profil Utilisateur & Mode d'accès (Option 1 - 4 Rôles RBAC) */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs focus:outline-none focus:ring-2 focus:ring-slate-400/20 shadow-2xs"
                title="Gérer les droits d'accès et changer de profil démo"
              >
                {/* Avatar initiales */}
                <div className={`w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center shadow-2xs ${
                  userRole === 'admin' ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' :
                  userRole === 'energy_manager' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                  userRole === 'operator' ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                  'bg-gradient-to-br from-indigo-600 to-indigo-800'
                }`}>
                  {currentUser.prenom[0]}{currentUser.nom[0]}
                </div>
                
                {/* Identité & badge mode actuel */}
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-800 leading-tight">
                    {currentUser.prenom} {currentUser.nom}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] leading-tight">
                    {userRole === 'admin' ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : userRole === 'energy_manager' ? (
                      <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                        <Zap className="w-2.5 h-2.5" /> Équipe Énergie
                      </span>
                    ) : userRole === 'operator' ? (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                        <Wrench className="w-2.5 h-2.5" /> Opérateur
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-indigo-600 font-semibold">
                        <Eye className="w-2.5 h-2.5" /> Consultation
                      </span>
                    )}
                  </div>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu avec les 4 Profils Utilisateurs Recommandés */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  {/* En-tête profil */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.prenom} {currentUser.nom}</p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Usine Val-de-Loire (VDL-01)
                      </div>
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        Simulateur Démo
                      </span>
                    </div>
                  </div>

                  {/* Section Rôle & Droits d'accès */}
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Profil & Droits d'accès (ISO §5.3)</span>
                    </div>

                    {/* 1. Administrateur */}
                    <button
                      onClick={() => handleSelectRole('admin')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        userRole === 'admin'
                          ? 'bg-emerald-50 text-emerald-950 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          userRole === 'admin' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left truncate">
                          <div className="truncate font-bold text-slate-900">🛡️ 1. Administrateur</div>
                          <div className="text-[10px] text-slate-500 font-normal truncate">Gestion des comptes, accès & paramétrage</div>
                        </div>
                      </div>
                      {userRole === 'admin' && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                    </button>

                    {/* 2. Équipe Énergie */}
                    <button
                      onClick={() => handleSelectRole('energy_manager')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        userRole === 'energy_manager'
                          ? 'bg-blue-50 text-blue-950 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          userRole === 'energy_manager' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left truncate">
                          <div className="truncate font-bold text-slate-900">⚡ 2. Équipe Énergie</div>
                          <div className="text-[10px] text-slate-500 font-normal truncate">Pilotage SMÉ, UES, IPÉ/SER & plan d'actions</div>
                        </div>
                      </div>
                      {userRole === 'energy_manager' && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                    </button>

                    {/* 3. Opérateur Terrain */}
                    <button
                      onClick={() => handleSelectRole('operator')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        userRole === 'operator'
                          ? 'bg-amber-50 text-amber-950 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          userRole === 'operator' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left truncate">
                          <div className="truncate font-bold text-slate-900">🔧 3. Opérateur / Terrain</div>
                          <div className="text-[10px] text-slate-500 font-normal truncate">Surveillance continue & acquittement alertes</div>
                        </div>
                      </div>
                      {userRole === 'operator' && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-1" />}
                    </button>

                    {/* 4. Consultation / Auditeur */}
                    <button
                      onClick={() => handleSelectRole('auditor')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        userRole === 'auditor'
                          ? 'bg-indigo-50 text-indigo-950 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          userRole === 'auditor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left truncate">
                          <div className="truncate font-bold text-slate-900">👁️ 4. Consultation / Audit</div>
                          <div className="text-[10px] text-slate-500 font-normal truncate">Lecture seule & revue d'audit ISO 50001</div>
                        </div>
                      </div>
                      {userRole === 'auditor' && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />}
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
            aria-label="Sous-onglets du SMÉ"
            className="shrink-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-1.5 shadow-2xs"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden md:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>SMÉ</span>
                </span>

                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
                  {[
                    { id: 'intro', label: 'Comprendre le SMÉ', badge: 'Norme & PDCA', icon: BookOpen },
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
                        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium sm:font-semibold transition-all whitespace-nowrap ${
                          isTabActive
                            ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        <Icon className={`w-3 h-3 ${isTabActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded hidden sm:inline-block ${
                          isTabActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/70 text-slate-500'
                        }`}>
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Barre de Sous-Onglets Horizontaux Figée pour Configuration & Réseau */}
        {currentPillar === 'supervision' && ['cartographie', 'ingestion', 'raw_data', 'correlations'].includes(activeSection) && (
          <nav
            aria-label="Sous-onglets Métrologie & Configuration"
            className="shrink-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-1.5 shadow-2xs"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 hidden md:inline-flex items-center gap-1">
                  <Network className="w-3 h-3 text-indigo-600" />
                  <span>Configuration</span>
                </span>

                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
                  {[
                    { id: 'cartographie', label: 'Cartographie & Compteurs', badge: 'Arbo', icon: Network },
                    { id: 'ingestion', label: 'Passerelle & Ingestion IoT', badge: '4G/Modbus', icon: Radio },
                    { id: 'raw_data', label: 'Données Brutes', badge: 'CSV', icon: Table },
                    { id: 'correlations', label: 'Facteurs & Corrélations', badge: 'Stats', icon: GitBranch }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isTabActive = activeSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectSection('supervision', tab.id)}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium sm:font-semibold transition-all whitespace-nowrap ${
                          isTabActive
                            ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        <Icon className={`w-3 h-3 ${isTabActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded hidden sm:inline-block ${
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
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                <button
                  onClick={() => handleSelectSection('supervision', 'supervision')}
                  className="px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 transition-colors inline-flex items-center gap-1 font-medium text-[11px]"
                  title="Accéder au monitoring des UES et ratios IPÉ"
                >
                  <BarChart2 className="w-3 h-3 text-blue-600" />
                  <span>Supervision Temps Réel</span>
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* 3. Zone de Contenu Déroulante Verticalement (L'en-tête et la barre latérale restent figés) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
          
          {/* Bannières informatives selon le Profil Rôle Actif */}
          {userRole === 'energy_manager' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  <strong>Profil Équipe Énergie actif :</strong> Droits complets sur le SMÉ, les UES et les plans d'actions (l'administration des accès est réservée au profil Admin).
                </span>
              </div>
              <button
                onClick={() => handleSelectRole('admin')}
                className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded font-semibold text-blue-900 transition-colors shrink-0"
              >
                Passer en mode Admin
              </button>
            </div>
          )}

          {userRole === 'operator' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Profil Opérateur Terrain actif :</strong> Vue orientée monitoring temps réel et acquittement terrain des dérives d'énergie.
                </span>
              </div>
              <button
                onClick={() => handleSelectRole('admin')}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded font-semibold text-amber-900 transition-colors shrink-0"
              >
                Passer en mode Admin
              </button>
            </div>
          )}

          {userRole === 'auditor' && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-900 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>
                  <strong>Profil Consultation / Auditeur ISO 50001 actif :</strong> Mode lecture seule et vérification des preuves d'audit. Les données et les seuils sont protégés contre toute modification.
                </span>
              </div>
              <button
                onClick={() => handleSelectRole('admin')}
                className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded font-semibold text-indigo-900 transition-colors shrink-0"
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

          {/* PILIER 3 : GESTION DES ACCÈS & RÔLES (ADMIN DÉMO) */}
          {currentPillar === 'supervision' && activeSection === 'users' && (
            userRole === 'admin' ? (
              <UserAccessSection
                users={users}
                setUsers={setUsers}
                currentUserEmail={currentUser.email}
                onSwitchUser={(user) => {
                  setCurrentUser(user);
                  if (user.role !== 'admin') {
                    setCurrentPillar('sme');
                    setActiveSection('intro');
                  }
                }}
                currentRole={userRole}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Accès Réservé au Profil Administrateur
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Conformément à la politique de sécurité RBAC (ISO 50001 §5.3), la gestion des habilitations et l'attribution des droits par adresse e-mail sont strictement réservées au profil Administrateur.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleSelectRole('admin')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Basculer sur le compte Administrateur</span>
                  </button>
                </div>
              </div>
            )
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
