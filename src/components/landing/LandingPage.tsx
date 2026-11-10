import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  TrendingDown,
  ArrowRight,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Cpu,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  BarChart3,
  Bell,
  Database,
  Calculator,
  Play,
  HelpCircle,
  FileText,
  Mail,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { recordLeadInFirestore } from '../../lib/firebase';

interface LandingPageProps {
  onEnterDirectDemo: () => void;
  onOpenSandboxModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDirectDemo,
  onOpenSandboxModal
}) => {
  // Navigation fluide par ancre
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Triple-clic secret sur le logo pour accès direct Développeur / Admin
  const logoClickCountRef = useRef<number>(0);
  const logoClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      onEnterDirectDemo();
    } else {
      logoClickTimerRef.current = setTimeout(() => {
        logoClickCountRef.current = 0;
      }, 700);
    }
  };

  // Raccourci développeur secret (Alt + D) pour basculer directement sur la solution démo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'd') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd')) {
        e.preventDefault();
        onEnterDirectDemo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnterDirectDemo]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // State pour le mockup interactif dans la Hero
  const [heroMockupTab, setHeroMockupTab] = useState<'supervision' | 'pdca'>('supervision');

  // State pour les 4 piliers interactifs
  const [activePillarTab, setActivePillarTab] = useState<number>(0);

  // State pour le simulateur de ROI (DAF)
  const [annualEnergyBill, setAnnualEnergyBill] = useState<number>(650000); // 650 k€
  const [estimatedGainPercent, setEstimatedGainPercent] = useState<number>(11); // 11%

  // Calculs ROI
  const grossSavings = Math.round((annualEnergyBill * estimatedGainPercent) / 100);
  const estimatedCost = Math.round(annualEnergyBill * 0.012); // ~1.2% du budget énergie
  const netSavings = Math.max(0, grossSavings - estimatedCost);
  const paybackDays = Math.max(12, Math.round((estimatedCost / grossSavings) * 365));

  // State pour la FAQ (accordéon)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // State pour le formulaire de conversion final
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [objet, setObjet] = useState<string>('Solution UniSme');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const objetOptions = [
    { id: 'Solution UniSme', label: 'Solution UniSme' },
    { id: 'Conseil ISO 50001', label: 'Conseil ISO 50001' },
    { id: 'Partenariat & Cabinets / Auditeurs', label: 'Partenariat & Cabinets / Auditeurs' },
    { id: 'Autre / Question générale', label: 'Autre / Question' }
  ];

  const handleSelectFormula = (formulaObjet: string) => {
    setObjet(formulaObjet);
    scrollToSection('contact-section');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setFormError('Veuillez renseigner votre Nom, Prénom et Adresse e-mail professionnelle.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      // 1. Enregistrement en base de données Cloud Firestore (Collection 'leads')
      recordLeadInFirestore({
        nom,
        prenom,
        email,
        entreprise,
        source: 'contact_form',
        objet,
        message
      });

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: 'd742ecac-6c3d-4878-9b71-cb775de4064d',
          subject: `[UniSme Landing] Demande : ${objet} - ${entreprise || `${prenom} ${nom}`}`,
          from_name: `${prenom} ${nom}`,
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          entreprise: entreprise.trim() || 'Non renseigné',
          objet_selectionne: objet,
          message: message.trim() || 'Aucune précision complémentaire saisie'
        })
      });

      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setFormError(result.message || 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.');
      }
    } catch {
      setFormError('Impossible de contacter le service d’envoi. Vérifiez votre connexion internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          BANDEAU TOUT EN HAUT EN NOIR (Strictement conservé en noir)
          Zone 1: Brand wordmark
          Zone 2: Liens de navigation
          Zone 3: CTA direct démo & sandbox
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark (Triple-clic secret pour accès direct Développeur) */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer select-none"
            title="UniSme"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-md shadow-emerald-950">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
              UniSme
            </span>
          </div>

          {/* Zone 2: Navigation Links (visible sur ordinateurs, tablettes et vues fenêtrées dès sm: 640px) */}
          <nav className="hidden sm:flex items-center gap-3 md:gap-6 lg:gap-8 text-xs sm:text-sm font-medium text-slate-200">
            <button
              onClick={() => scrollToSection('probleme')}
              className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              Pourquoi UniSme
            </button>
            <button
              onClick={() => scrollToSection('piliers')}
              className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              Fonctionnalités
            </button>
            <button
              onClick={() => scrollToSection('formules')}
              className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              Formule
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              FAQ
            </button>
          </nav>

          {/* Zone 3: Onglet Contact + Primary CTA + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => scrollToSection('contact-section')}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 border border-slate-800/80 hover:border-slate-700"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contact</span>
            </button>

            <button
              onClick={onOpenSandboxModal}
              className="px-3 sm:px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-all shadow-md shadow-emerald-950/40 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>🚀 Tester la version démo</span>
            </button>

            {/* Bouton Hamburger pour très petits écrans (< 640px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Menu de navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu déroulant mobile si écran < 640px */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-slate-950/98 border-t border-slate-800 px-4 py-3 space-y-1 shadow-xl">
            <button
              onClick={() => {
                scrollToSection('probleme');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2.5 px-3 text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              Pourquoi UniSme
            </button>
            <button
              onClick={() => {
                scrollToSection('piliers');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2.5 px-3 text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              Fonctionnalités
            </button>
            <button
              onClick={() => {
                scrollToSection('formules');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2.5 px-3 text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              Formule
            </button>
            <button
              onClick={() => {
                scrollToSection('faq');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2.5 px-3 text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                scrollToSection('contact-section');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2.5 px-3 text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          1. SECTION HÉROÏQUE (Fond Blanc & Épuré)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white">
        {/* Halo subtil de teinte vert émeraude */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-emerald-100/40 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-48 right-10 w-96 h-96 bg-blue-100/30 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Badge de positionnement épuré */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plateforme SaaS ISO 50001 & Supervision Énergétique</span>
            </div>

            {/* Titre Fort (Épuré & Raffiné - font-semibold tracking-tight) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 text-balance leading-[1.15]">
              Simplifiez votre SMÉ. Maîtrisez vos flux énergétiques en temps réel.
            </h1>

            {/* Sous-titre Explicatif */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              L'unique plateforme combinant management de l'énergie (ISO 50001) et supervision en temps réel des consommations et facteurs influents, sans investissement matériel lourd.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onOpenSandboxModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀 Tester la démo en direct</span>
              </button>

              <button
                onClick={() => scrollToSection('contact-section')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Nous contacter</span>
              </button>
            </div>

            {/* Preuves d'assurance */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                Sans engagement
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                Déploiement en &lt; 24h
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                100 % conforme ISO 50001:2018
              </span>
            </div>
          </div>

          {/* VISUEL D'IMPACT : Mockup Interactif Conjoint Courbes de Charge & PDCA */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden ring-1 ring-slate-900/5">
            {/* Fenêtre OS Chrome Bar */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                <span className="ml-2 text-xs text-slate-400 font-mono hidden sm:inline">
                  unisme.app / Usine Val-de-Loire (VDL-01)
                </span>
              </div>

              {/* Segmented control fonctionnel pour explorer les deux facettes */}
              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setHeroMockupTab('supervision')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    heroMockupTab === 'supervision'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Supervision & Courbes de Charge
                </button>
                <button
                  onClick={() => setHeroMockupTab('pdca')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    heroMockupTab === 'pdca'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ Management Normatif ISO 50001
                </button>
              </div>
            </div>

            {/* Vue Mockup Interactive */}
            <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100">
              {heroMockupTab === 'supervision' ? (
                /* Facette Supervision Énergétique & Courbe de Charge */
                <div className="space-y-4">
                  {/* KPI Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-semibold">Consommation Totale Active</div>
                      <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">2 840 kWh</div>
                      <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <TrendingDown className="w-3 h-3" />
                        <span>-8.4% vs SER Référence</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-semibold">UES 1 : Four Traitement</div>
                      <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">1 245 kWh</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Ratio IPÉ : 0.82 kWh/pièce</div>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-semibold">UES 2 : Air Comprimé</div>
                      <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">420 kWh</div>
                      <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Talon week-end : nominal</div>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-semibold">Score Conformité Audit</div>
                      <div className="text-xl font-bold text-emerald-600 tabular-nums mt-1">96 %</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Statut : Audit-Ready</div>
                    </div>
                  </div>

                  {/* Graphique Courbe de charge simulé */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">Courbe de Charge — Réel vs Situation Énergétique de Référence (SER)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Restitution temps réel avec détection des dépassements d'objectifs</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-3 h-0.5 bg-slate-400 rounded-full"></span>
                          SER Baseline
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <span className="w-3 h-0.5 bg-emerald-600 rounded-full"></span>
                          Consommation Réelle
                        </span>
                      </div>
                    </div>

                    {/* SVG Curve */}
                    <div className="h-44 w-full">
                      <svg viewBox="0 0 800 160" className="w-full h-full preserve-3d overflow-visible">
                        <defs>
                          <linearGradient id="realGradLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Lignes de repère douces */}
                        <line x1="0" y1="40" x2="800" y2="40" stroke="#E2E8F0" strokeDasharray="3 3" />
                        <line x1="0" y1="80" x2="800" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                        <line x1="0" y1="120" x2="800" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />

                        {/* Baseline SER (gris pointillés) */}
                        <path
                          d="M 0 110 Q 150 70 300 75 T 500 55 T 800 65"
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />

                        {/* Zone remplie Réel */}
                        <path
                          d="M 0 125 Q 150 85 300 90 T 500 70 T 800 80 L 800 160 L 0 160 Z"
                          fill="url(#realGradLight)"
                        />

                        {/* Courbe Réelle (verte émeraude) */}
                        <path
                          d="M 0 125 Q 150 85 300 90 T 500 70 T 800 80"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="2.5"
                        />

                        {/* Point d'anomalie détectée */}
                        <circle cx="480" cy="72" r="4" fill="#059669" />
                        <circle cx="480" cy="72" r="9" fill="#10B981" opacity="0.4" className="animate-ping" />
                      </svg>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 border-t border-slate-100 pt-2">
                      <span>00:00 (Nuit)</span>
                      <span>06:00 (Poste 1)</span>
                      <span>12:00 (Creux)</span>
                      <span>18:00 (Poste 2)</span>
                      <span>23:59</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Facette Management ISO 50001 & Planification PDCA */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
                        <span>1. PLAN (§4-§6)</span>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-slate-900 font-bold">Revue Énergétique & UES</p>
                      <p className="text-[11px] text-slate-600 mt-1">4 Usages Énergétiques Significatifs définis avec facteurs d'influence.</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs text-blue-700 font-bold mb-1">
                        <span>2. DO (§7-§8)</span>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-slate-900 font-bold">Plan d'Actions & Maîtrise</p>
                      <p className="text-[11px] text-slate-600 mt-1">7 actions budgétées, économies mesurées selon IPMVP.</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
                        <span>3. CHECK (§9)</span>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Actif</span>
                      </div>
                      <p className="text-xs text-slate-900 font-bold">Audit Interne & Non-Conf.</p>
                      <p className="text-[11px] text-slate-600 mt-1">Traçabilité complète des preuves d'audit et écarts constatés.</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs text-amber-700 font-bold mb-1">
                        <span>4. ACT (§10)</span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Planifié</span>
                      </div>
                      <p className="text-xs text-slate-900 font-bold">Revue de Direction</p>
                      <p className="text-[11px] text-slate-600 mt-1">Génération automatisée du dossier de revue pour certificateur.</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-900">Gouvernance Collaborative & Rôles RBAC (§5.3)</span>
                      <p className="text-xs text-emerald-800">
                        Admin, Équipe Énergie, Opérateurs de ligne et Auditeurs externes disposent d'interfaces adaptées sans risque d'altération des formules.
                      </p>
                    </div>
                    <button
                      onClick={onOpenSandboxModal}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer shadow-xs"
                    >
                      Explorer le module SMÉ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LA PREUVE SOCIALE & LE PROBLÈME (Pourquoi les solutions actuelles échouent)
      ───────────────────────────────────────────────────────────── */}
      <section id="probleme" className="py-20 bg-slate-50 border-t border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              L'Impasse Méthodologique en Industrie
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-2">
              Pourquoi les démarches ISO 50001 s'essoufflent après la certification ?
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              La plupart des entreprises oscillent entre des fichiers Excel fragiles et des progiciels d'ingénieurs surdimensionnés.
            </p>
          </div>

          {/* Grille comparative 3 colonnes avec mise en valeur UniSme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Colonne 1: Tableurs Excel */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Les limites des tableurs Excel</h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Risques majeurs d'erreurs de formules et cellules corrompues.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Perte de traçabilité historique lors des changements de personnel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Absence d'alertes en temps réel : les dérives sont découvertes à la facture.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Préparation des audits de renouvellement source de panique et d'heures perdues.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 text-[11px] text-slate-500 font-mono">
                Résultat : ~35h perdues par audit / Aucune détection proactive
              </div>
            </div>

            {/* Colonne 2: Logiciels EMS Pure Players */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Les logiciels EMS "Pure Players"</h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Outils d'automatisme complexes conçus uniquement pour spécialistes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Déploiements lourds exigeant des mois de paramétrage informatique.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Inadaptés à la gouvernance documentaire normative (revue, compétences, RACI).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Coûts d'intégration démesurés bloquant le retour sur investissement.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 text-[11px] text-slate-500 font-mono">
                Résultat : Outil déserté par les équipes opérationnelles
              </div>
            </div>

            {/* Colonne 3: L'Approche Unique UniSme (Mise en valeur épurée) */}
            <div className="bg-white border-2 border-emerald-600 ring-4 ring-emerald-500/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Solution Hybride</span>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">L'approche unique d'UniSme</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  L'alliance parfaite entre la technicité terrain (mesures, compteurs, dérives) et la gouvernance managériale (conformité, plans d'actions, audits).
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span>Conformité ISO 50001:2018 intégrée nativement dans chaque écran.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span>Supervision continue avec calcul automatique des ratios IPÉ / SER.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span>Audit-Ready permanent : export des bilans et preuves d'audit en 1 clic.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-emerald-100 mt-6">
                <button
                  onClick={onOpenSandboxModal}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Tester cette approche en démo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. LES 4 PILIERS FONCTIONNELS — La Valeur Produit
      ───────────────────────────────────────────────────────────── */}
      <section id="piliers" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Conçu pour le Terrain & les Audits
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-2">
              Les 4 Piliers Fonctionnels de la Suite UniSme
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Tout ce dont votre usine a besoin pour piloter ses flux énergétiques et garantir sa certification sans stress.
            </p>
          </div>

          {/* Sélecteur de Pilier façon Tabs Modernes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
            {[
              {
                title: 'Digitalisation ISO 50001',
                badge: 'PDCA Normatif',
                icon: ShieldCheck
              },
              {
                title: 'Supervision Temps Réel',
                badge: 'SER vs Réel',
                icon: Activity
              },
              {
                title: 'Centre d\'Alertes',
                badge: 'Dérives & Talons',
                icon: Bell
              },
              {
                title: 'Intégration Universelle',
                badge: 'IoT, Modbus, CSV',
                icon: Database
              }
            ].map((p, idx) => {
              const IconComp = p.icon;
              const isSelected = activePillarTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePillarTab(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-2 border-emerald-600 ring-2 ring-emerald-500/10 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-[10px] text-slate-500 font-mono font-medium">{p.badge}</span>
                  </div>
                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-slate-950' : 'text-slate-700'}`}>
                    {p.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Affichage Détaillé du Pilier Sélectionné */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            {activePillarTab === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span>PILIER 1 : DIGITALISATION ISO 50001 (PDCA)</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                    Suppression des méthodes disparates et pilotage centralisé
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Fini les classeurs éparpillés. UniSme structure votre système de management selon la stricte arborescence de la norme ISO 50001:2018 :
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Revue Énergétique (§6.3) :</strong> Identification guidée des Usages Énergétiques Significatifs (UES) et facteurs statiques.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Indicateurs IPÉ & SER (§6.4) :</strong> Définition des formules de performance énergétique et modélisation de référence.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Plan d'Actions (§6.2) :</strong> Budgétisation, suivi des gains prévus vs mesurés, et calcul automatique des économies d'énergie.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Revue de Management (§9.3) :</strong> Consolidation automatique pour le comité de direction et les auditeurs certificateurs.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Revue Énergétique Industrielle</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">Conforme §6.3</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-700 font-medium">UES 1 : Fours Traitement Thermique</span>
                      <span className="font-bold text-emerald-700">43.8% conso usine</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-700 font-medium">UES 2 : Centrale Air Comprimé</span>
                      <span className="font-bold text-emerald-700">14.8% conso usine</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-700 font-medium">UES 3 : Groupe Froid & Pompes</span>
                      <span className="font-bold text-emerald-700">11.2% conso usine</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePillarTab === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700">
                    <Activity className="w-4 h-4" />
                    <span>PILIER 2 : SUPERVISION TEMPS RÉEL & COURBES DE CHARGE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                    Restitution multisources unifiée et superposition SER vs réel
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Comparez instantanément votre consommation constatée par rapport à votre Situation Énergétique de Référence (SER).
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Multi-Fluides unifiés :</strong> Électricité générale, gaz naturel de chauffe, débit d'air comprimé, eau glacée.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Cartographie & Sous-Comptage :</strong> Arborescence des compteurs généraux aux départs machines par atelier.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Corrélation des facteurs pertinents :</strong> Prise en compte de la production (tonnes, pièces) et DJU climatiques.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Superposition Énergétique Actuelle</span>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">10 min pas de temps</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Écart mesuré vs SER :</span>
                      <span className="text-emerald-700 font-bold">-214 kWh (-7.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ratio IPÉ moyen de la journée :</span>
                      <span className="text-slate-900 font-mono font-semibold">0.84 kWh / kg produit</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-600 h-full w-[85%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePillarTab === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700">
                    <Bell className="w-4 h-4" />
                    <span>PILIER 3 : CENTRE D'ALERTES AUTOMATIQUE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                    Détection proactive des dérives de talons et des surconsommations
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Ne laissez plus des compresseurs tourner à vide pendant les week-ends ou des thermostats défaillants gaspiller des milliers d'euros.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Surveillance des talons hors production :</strong> Alerte immédiate dès que la puissance dépasse le talon garanti.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Règles de seuils configurables :</strong> Seuils d'alerte personnalisés sur n'importe quel compteur ou indicateur IPÉ.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Acquittement & Traçabilité :</strong> Saisie de la cause de l'anomalie par l'équipe terrain pour justification d'audit.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Journal des Écarts & Alertes</span>
                    <span className="text-[10px] text-amber-700 font-mono font-bold">1 active</span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-700">
                      <span>Dérive Talon Air Comprimé Week-End</span>
                      <span className="text-[10px] font-mono">Samedi 03:15</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Puissance mesurée : 68 kW (Seuil max talon : 35 kW). Fuite probable réseau Bâtiment C.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePillarTab === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-700">
                    <Database className="w-4 h-4" />
                    <span>PILIER 4 : INTÉGRATION UNIVERSELLE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                    Connexion directe aux automates ou simple import CSV sans bloquer votre DSI
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    UniSme est conçu pour s'adapter à toutes les architectures industrielles, qu'elles soient ultra-connectées ou en cours de modernisation.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Protocoles Industriels standards :</strong> Modbus TCP/RTU, MQTT, passerelles IoT cellulaires 4G autonomes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Import Manuel CSV / Excel :</strong> Glisser-déposer universel pour intégrer des historiques Enedis / GRDF ou des exports de supervision.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Zéro impact DSI :</strong> Fonctionne en SaaS sécurisé ou via passerelle 4G indépendante du réseau bureautique.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Sources d'Ingestion Supportées</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">100% Plug & Play</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                      📶 Passerelle 4G IoT
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                      ⚡ Modbus TCP / RTU
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                      📊 Fichiers CSV / Excel
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                      🔄 Courbes Enedis / GRDF
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. LES FORMULES & PARTENARIATS SAAS
      ───────────────────────────────────────────────────────────── */}
      <section id="formules" className="py-20 bg-slate-50 border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Formules Adaptées à Votre Rythme
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-2">
              Les Formules & Partenariats SaaS UniSme
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Une tarification claire dimensionnée selon le nombre d'ateliers et de compteurs, sans coût caché.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Formule Mensuelle */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Test & Agilité
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">Formule Mensuelle</h3>
                <div className="text-xs text-emerald-700 font-bold">Sans engagement</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accès immédiat et flexible. Idéal pour tester la solution sur vos données réelles à votre rythme, résiliable mensuellement.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Accès complet au cycle PDCA ISO 50001</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supervision temps réel et alertes sur seuil</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Import de fichiers CSV & tableurs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Support standard par e-mail</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => handleSelectFormula('Solution UniSme')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Choisir la Formule Mensuelle
                </button>
              </div>
            </div>

            {/* Formule Annuelle (Mise en avant) */}
            <div className="bg-emerald-50/70 border-2 border-emerald-600 rounded-2xl p-6 flex flex-col justify-between shadow-xl ring-4 ring-emerald-500/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Standard Industrie
              </div>

              <div className="space-y-4 mt-1">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Accompagnement & Pérennité
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">Formule Annuelle</h3>
                <div className="text-xs text-emerald-700 font-bold">Engagement 12 mois</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  La solution standard pour l'industrie. Conçue pour accompagner l'ensemble de votre cycle de certification ISO 50001 avec un accompagnement et un paramétrage initial privilégiés.
                </p>
                <ul className="space-y-2 text-xs text-slate-800 pt-2 border-t border-emerald-200/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    <span>Tous les avantages de la formule mensuelle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    <span>Paramétrage initial des UES & formules IPÉ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    <span>Assistance à la préparation de l'audit de certification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    <span>Support ingénieur dédié et prioritaire</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-emerald-200">
                <button
                  onClick={() => handleSelectFormula('Solution UniSme')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
                >
                  Choisir la Formule Annuelle
                </button>
              </div>
            </div>

            {/* Offre Partenaires & Cabinets de Conseil */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Auditeurs & Bureaux d'Études
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">Partenaires & Cabinets</h3>
                <div className="text-xs text-purple-700 font-bold">Marque blanche & Multi-tenants</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Déployez UniSme directement auprès de vos clients industriels en tant qu'auditeur ou bureau d'études partenaire.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600" />
                    <span>Console multi-sites pour auditer plusieurs usines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600" />
                    <span>Possibilité de personnalisation marque blanche</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600" />
                    <span>Accords de commissionnement et remises volume</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600" />
                    <span>Formation complète de vos consultants</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => handleSelectFormula('Partenariat & Cabinets / Auditeurs')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Devenir Cabinet Partenaire
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. LE ROI & LES ARGUMENTS FINANCIERS — Le discours pour le DAF
      ───────────────────────────────────────────────────────────── */}
      <section id="roi" className="py-20 bg-white border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Rentabilité Immédiate
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-2">
              Le ROI & Les Arguments Financiers pour votre Direction
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              UniSme ne constitue pas une charge supplémentaire, mais un levier direct d'économies budgétaires auto-financé dès le premier mois.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Arg 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="text-2xl font-black text-emerald-600 tabular-nums">&lt; 1 % à 1,5 %</div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">Poids budgétaire minime</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le coût annuel d'UniSme représente moins de 1,5 % de la facture énergétique d'un site industriel moyen. L'effort d'investissement est négligeable face aux gains attendus.
              </p>
            </div>

            {/* Arg 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="text-2xl font-black text-emerald-600 tabular-nums">Dès le 1er Mois</div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">Amortissement immédiat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Une seule fuite d'air comprimé détectée rapidement ou un groupe froid oublié en fonctionnement le week-end suffit à rentabiliser l'abonnement pour toute l'année.
              </p>
            </div>

            {/* Arg 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="text-2xl font-black text-emerald-600 tabular-nums">-60 % Conseil</div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">Économie massive d'audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Réduction drastique des honoraires de conseil externe grâce à l'automatisation de la documentation normative et la conformité permanente en mode "Audit-Ready".
              </p>
            </div>
          </div>

          {/* SIMULATEUR INTERACTIF DE ROI */}
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2.5 mb-6 text-slate-900">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold tracking-tight">Simulateur d'Économies Énergétiques & Retour sur Investissement</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders de réglage */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-700 font-semibold">Facture Énergétique Annuelle de l'Usine</span>
                    <span className="text-emerald-700 font-mono font-bold text-sm">
                      {annualEnergyBill.toLocaleString('fr-FR')} € / an
                    </span>
                  </div>
                  <input
                    type="range"
                    min={150000}
                    max={3000000}
                    step={25000}
                    value={annualEnergyBill}
                    onChange={(e) => setAnnualEnergyBill(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>150 k€</span>
                    <span>1,5 M€</span>
                    <span>3,0 M€</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-700 font-semibold">Gain Énergétique Visé (Norme ISO 50001)</span>
                    <span className="text-emerald-700 font-mono font-bold text-sm">
                      {estimatedGainPercent} % de réduction
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={1}
                    value={estimatedGainPercent}
                    onChange={(e) => setEstimatedGainPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>5% (Prudent)</span>
                    <span>11% (Moyenne industrielle)</span>
                    <span>20% (Optimisé)</span>
                  </div>
                </div>
              </div>

              {/* Résultats simulés (Carte élégante contrastée) */}
              <div className="bg-slate-950 text-white rounded-xl p-5 space-y-4 shadow-lg border border-slate-800">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Économies Énergétiques Annuelles Estimées</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums">
                    + {grossSavings.toLocaleString('fr-FR')} € / an
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Bénéfice Net Première Année</span>
                    <div className="font-bold text-white tabular-nums mt-0.5">
                      + {netSavings.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Temps d'Amortissement (Payback)</span>
                    <div className="font-bold text-emerald-400 tabular-nums mt-0.5">
                      ~ {paybackDays} jours
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => scrollToSection('contact-section')}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Valider cette estimation avec un ingénieur</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LA FAQ — Traitement des objections
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-b border-slate-200 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Questions Fréquentes
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-2">
              Foire Aux Questions & Réponses Techniques
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Toutes les réponses pour votre Responsable Énergie, votre Responsable Maintenance et votre DSI.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Dois-je acheter du matériel spécifique ?",
                a: "Non, UniSme est 100 % logicielle. Elle s'interface directement avec votre parc de compteurs existants, vos automates (Modbus TCP/RTU, MQTT) ou simplement via des imports de courbes de charge réguliers (fichiers CSV, exports Enedis/GRDF). Aucun remplacement d'équipement n'est nécessaire."
              },
              {
                q: "Comment sont sécurisées nos données industrielles ?",
                a: "Vos données industrielles et consommations sont stockées sur une infrastructure souveraine hébergée en France et en Europe, certifiée ISO 27001 et conforme aux exigences RGPD et NIS2. Chaque site bénéficie d'un cloisonnement étanche garantissant la confidentialité absolue de vos métriques de production."
              },
              {
                q: "Combien de temps prend le déploiement ?",
                a: "Moins de 24 heures pour une mise en route opérationnelle. Contrairement aux projets informatiques lourds, l'initialisation de vos UES et l'import de vos premières données de mesure se font immédiatement grâce à notre structure pré-paramétrée selon la norme ISO 50001:2018."
              },
              {
                q: "La solution est-elle reconnue lors des audits AFNOR ou Bureau Veritas ?",
                a: "Absolument. UniSme a été spécialement modélisée en miroir des chapitres 4 à 10 de la norme NF EN ISO 50001:2018. Les auditeurs certificateurs disposent d'un profil dédié en lecture seule leur permettant d'accéder instantanément à la matrice SWOT, aux justifications des UES, aux formules IPÉ/SER et aux bilans d'actions chiffrés."
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:text-emerald-700 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. LE FORMULAIRE DE CONVERSION FINAL
      ───────────────────────────────────────────────────────────── */}
      <section id="contact-section" className="py-20 bg-white relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Contact & Échange
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-2">
              Prendre Contact avec l'Équipe UniSme
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Une question, un besoin d'échange sur vos flux ou votre démarche ISO 50001 ?
            </p>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header du Formulaire */}
            <div className="bg-slate-950 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-white leading-tight">
                    Prendre contact avec l'équipe UniSme
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Confidentiel</span>
              </div>
            </div>

            {isSubmitted ? (
              <div className="p-8 sm:p-12 text-center space-y-5 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    Demande transmise avec succès !
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Merci <strong>{prenom} {nom}</strong>. Votre demande concernant{' '}
                    <span className="font-semibold text-emerald-700">« {objet} »</span> a bien été transmise à notre équipe technique.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Un ingénieur énergie reviendra vers vous à l'adresse <strong>{email}</strong> sous 24 heures.</span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage('');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Envoyer un autre message
                  </button>

                  <button
                    onClick={onEnterDirectDemo}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Explorer la Démo UniSme
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6">
                {formError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {formError}
                  </div>
                )}

                {/* 1. Vos Coordonnées */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Vos coordonnées
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nom <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dupont"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Prénom <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sophie"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Adresse e-mail professionnelle <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sophie.dupont@usine-industrielle.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Entreprise / Usine
                      </label>
                      <input
                        type="text"
                        placeholder="Manufacture Val-de-Loire SAS"
                        value={entreprise}
                        onChange={(e) => setEntreprise(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Objet de votre demande (Tags cliquables) */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Objet de votre demande
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {objetOptions.map((opt) => {
                      const isSelected = objet === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setObjet(opt.id)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Champ Libre (Votre message) */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Précisez vos UES ou vos attentes particulières
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Précisez vos UES, le contexte de votre usine ou vos questions techniques..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder:text-slate-400 text-slate-900"
                  />
                </div>

                {/* 4. Bouton d'action */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSubmitting
                        ? 'bg-emerald-700 text-emerald-100 cursor-not-allowed opacity-80'
                        : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Envoyer la demande</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER (Élégant et sobre)
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-sm">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>UniSme</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Management & Supervision de l'Énergie selon la norme NF EN ISO 50001:2018.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <span>Hébergement Souverain UE</span>
            <span>·</span>
            <span>Certifié ISO 27001</span>
            <span>·</span>
            <span>Conformité RGPD & NIS2</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
