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
  activeDemoUser?: { nom: string; prenom: string; email: string; entreprise: string } | null;
  onClearDemoSession?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDirectDemo,
  onOpenSandboxModal,
  activeDemoUser,
  onClearDemoSession
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
              onClick={activeDemoUser ? onEnterDirectDemo : onOpenSandboxModal}
              className="px-3 sm:px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-all shadow-md shadow-emerald-950/40 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
              title={activeDemoUser ? `Reprendre votre session (${activeDemoUser.prenom} ${activeDemoUser.nom})` : 'Tester la version démo'}
            >
              <span>{activeDemoUser ? '🚀 Reprendre la démo' : '🚀 Tester la version démo'}</span>
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
      <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white">
        {/* Halo subtil de teinte vert émeraude */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-emerald-100/40 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-48 right-10 w-96 h-96 bg-blue-100/30 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Titre Fort (Épuré & Raffiné - font-semibold tracking-tight) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 text-balance leading-[1.15]">
              Simplifiez votre SMEn. Optimisez vos flux énergétiques en temps réel.
            </h1>

            {/* Sous-titre Explicatif */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              L'unique plateforme combinant Système de Management de l'Énergie (ISO 50001) et supervision en temps réel des consommations et facteurs influents, sans investissement matériel lourd.
            </p>

            {/* CTAs avec reconnaissance automatique de session */}
            <div className="pt-2 flex flex-col items-center justify-center gap-2.5">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
                {activeDemoUser ? (
                  <button
                    onClick={onEnterDirectDemo}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀 Reprendre ma démo ({activeDemoUser.prenom})</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenSandboxModal}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀 Tester la démo en direct</span>
                  </button>
                )}

                <button
                  onClick={() => scrollToSection('contact-section')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Nous contacter</span>
                </button>
              </div>

              {activeDemoUser && onClearDemoSession && (
                <p className="text-xs text-slate-500 text-center">
                  Session active : <strong className="text-slate-800 font-semibold">{activeDemoUser.prenom} {activeDemoUser.nom}</strong> ({activeDemoUser.entreprise || 'Usine'}).{' '}
                  <button
                    onClick={onClearDemoSession}
                    className="text-emerald-700 hover:text-emerald-800 underline font-medium cursor-pointer ml-1"
                  >
                    Ce n'est pas vous ? S'inscrire sous un autre nom
                  </button>
                </p>
              )}
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
              Conçu pour le terrain &amp; les audits
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-2">
              Les 4 piliers fonctionnels de la suite UniSme
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Tout ce dont votre entreprise a besoin pour piloter ses flux énergétiques et sécuriser sa démarche ISO 50001.
            </p>
          </div>

          {/* Sélecteur de Pilier façon Tabs Modernes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
            {[
              {
                title: 'Digitalisation ISO 50001',
                badge: 'PDCA normatif',
                icon: ShieldCheck
              },
              {
                title: 'Supervision temps réel',
                badge: 'SER vs réel',
                icon: Activity
              },
              {
                title: 'Centre d\'alertes',
                badge: 'Dérives & talons',
                icon: Bell
              },
              {
                title: 'Intégration universelle',
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
                    <span>Pilier 1 · Digitalisation ISO 50001 (PDCA)</span>
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
                      <span><strong>Revue énergétique (§6.3) :</strong> Identification guidée des Usages Énergétiques Significatifs (UES) et facteurs statiques.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Indicateurs IPÉ &amp; SER (§6.4) :</strong> Définition des formules de performance énergétique et modélisation de référence.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Plan d'actions (§6.2) :</strong> Budgétisation, suivi des gains prévus vs mesurés, et calcul automatique des économies d'énergie.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Revue de management (§9.3) :</strong> Consolidation automatique pour le comité de direction et la préparation des audits.</span>
                    </li>
                  </ul>
                </div>

                {/* Visuel PDCA par chapitre + Revue énergétique */}
                <div className="space-y-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                      <span>Cycle PDCA par chapitre ISO 50001:2018</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-2 py-0.5 rounded">Chapitres 4 à 10</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-800">
                          <span>1. Plan (§4 – §6)</span>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <p className="font-semibold text-slate-900 text-[11px]">Contexte, politique &amp; UES</p>
                        <p className="text-[11px] text-slate-600 leading-snug">Revue énergétique, IPÉ, SER et plan d'actions §6.2.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 space-y-1">
                        <div className="flex items-center justify-between font-bold text-blue-800">
                          <span>2. Do (§7 – §8)</span>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <p className="font-semibold text-slate-900 text-[11px]">Ressources &amp; maîtrise</p>
                        <p className="text-[11px] text-slate-600 leading-snug">Compétences, plan de comptage et maîtrise opérationnelle.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200/80 space-y-1">
                        <div className="flex items-center justify-between font-bold text-purple-800">
                          <span>3. Check (§9)</span>
                          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-purple-200">Suivi</span>
                        </div>
                        <p className="font-semibold text-slate-900 text-[11px]">Surveillance &amp; audit interne</p>
                        <p className="text-[11px] text-slate-600 leading-snug">Évaluation IPÉ/SER et programme d'audits internes.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 space-y-1">
                        <div className="flex items-center justify-between font-bold text-amber-800">
                          <span>4. Act (§10)</span>
                          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">Continu</span>
                        </div>
                        <p className="font-semibold text-slate-900 text-[11px]">Amélioration &amp; revue</p>
                        <p className="text-[11px] text-slate-600 leading-snug">Traitement des non-conformités et actions correctives.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Répartition des UES identifiés</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">Conforme §6.3</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-medium">UES 1 : Fours traitement thermique</span>
                          <span className="font-bold text-emerald-700 tabular-nums">43,8 %</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full w-[44%]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-medium">UES 2 : Centrale air comprimé</span>
                          <span className="font-bold text-blue-700 tabular-nums">14,8 %</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full w-[15%]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-medium">UES 3 : Groupe froid &amp; pompes</span>
                          <span className="font-bold text-amber-700 tabular-nums">11,2 %</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full w-[11%]" />
                        </div>
                      </div>
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
                    <span>Pilier 2 · Supervision temps réel &amp; courbes de charge</span>
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
                      <span><strong>Multi-fluides unifiés :</strong> Électricité générale, gaz naturel de chauffe, débit d'air comprimé, eau glacée.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Cartographie &amp; sous-comptage :</strong> Arborescence des compteurs généraux aux départs machines par atelier.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Corrélation des facteurs pertinents :</strong> Prise en compte de la production (tonnes, pièces) et DJU climatiques.</span>
                    </li>
                  </ul>
                </div>

                {/* Graphique Courbe de charge SER vs Réel */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Courbe de charge — Réel vs SER</div>
                      <div className="text-[11px] text-slate-500">Superposition journalière au pas 10 min</div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-medium">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400"></span>
                        SER référence
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <span className="w-3 h-0.5 bg-emerald-600 rounded-full"></span>
                        Conso réelle
                      </span>
                    </div>
                  </div>

                  {/* Mini KPIs au-dessus du graphique */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
                      <div className="text-[10px] text-slate-500 font-medium">Écart mesuré vs SER</div>
                      <div className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5 tabular-nums">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>-214 kWh (-7,5 %)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Ratio IPÉ moyen</div>
                      <div className="font-bold text-slate-900 font-mono mt-0.5 tabular-nums">0,84 kWh / kg</div>
                    </div>
                  </div>

                  {/* Graphique SVG Courbe de Charge */}
                  <div>
                    <div className="h-36 w-full">
                      <svg viewBox="0 0 600 140" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="pillarLoadCurveGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="30" x2="600" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
                        <line x1="0" y1="70" x2="600" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                        <line x1="0" y1="110" x2="600" y2="110" stroke="#E2E8F0" strokeDasharray="3 3" />

                        {/* Courbe SER (pointillés gris) */}
                        <path
                          d="M 0 100 Q 110 60 225 66 T 375 45 T 600 58"
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />

                        {/* Zone remplie réelle */}
                        <path
                          d="M 0 112 Q 110 74 225 80 T 375 60 T 600 72 L 600 140 L 0 140 Z"
                          fill="url(#pillarLoadCurveGrad)"
                        />

                        {/* Courbe réelle (vert émeraude) */}
                        <path
                          d="M 0 112 Q 110 74 225 80 T 375 60 T 600 72"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="2.5"
                        />

                        {/* Marqueur point courant */}
                        <circle cx="360" cy="62" r="4" fill="#059669" />
                        <circle cx="360" cy="62" r="9" fill="#10B981" opacity="0.35" className="animate-ping" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-2">
                      <span>00:00 (Nuit)</span>
                      <span>06:00 (Poste 1)</span>
                      <span>12:00 (Creux)</span>
                      <span>18:00 (Poste 2)</span>
                      <span>23:59</span>
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
                    <span>Pilier 3 · Centre d'alertes automatique</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                    Détection proactive des dérives de talons et des surconsommations
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Ne laissez plus des compresseurs tourner à vide pendant les week-ends ou des équipements défaillants gaspiller des milliers d'euros.
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
                      <span><strong>Acquittement &amp; traçabilité :</strong> Saisie de la cause de l'anomalie par l'équipe terrain pour justification d'audit.</span>
                    </li>
                  </ul>
                </div>

                {/* Visuel Seuil dépassé + Alerte */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Détection de dépassement de seuil</span>
                    <span className="text-[10px] text-rose-700 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded">1 alerte active</span>
                  </div>
                  <div className="h-24 w-full">
                    <svg viewBox="0 0 500 90" className="w-full h-full overflow-visible">
                      {/* Seuil max talon */}
                      <line x1="0" y1="45" x2="500" y2="45" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="4 4" />
                      <text x="4" y="40" fill="#E11D48" fontSize="10" fontFamily="monospace">Seuil talon : 35 kW</text>
                      {/* Courbe puissance avec pic */}
                      <path
                        d="M 0 65 L 120 63 L 180 62 L 240 20 L 320 22 L 370 60 L 500 62"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                      />
                      <circle cx="280" cy="21" r="4" fill="#E11D48" />
                    </svg>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-700">
                      <span>Dérive talon air comprimé week-end</span>
                      <span className="text-[10px] font-mono">Samedi 03:15</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Puissance mesurée : <strong>68 kW</strong> (seuil max : 35 kW). Fuite probable réseau Bâtiment C.
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
                    <span>Pilier 4 · Intégration universelle</span>
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
                      <span><strong>Protocoles industriels standards :</strong> Modbus TCP/RTU, MQTT, passerelles IoT cellulaires 4G autonomes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Import manuel CSV / Excel :</strong> Glisser-déposer universel pour intégrer des historiques Enedis / GRDF ou des exports de supervision.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Zéro impact DSI :</strong> Fonctionne en SaaS sécurisé ou via passerelle 4G indépendante du réseau bureautique.</span>
                    </li>
                  </ul>
                </div>

                {/* Visuel architecture d'ingestion */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Architecture de collecte des flux</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-2 py-0.5 rounded">Plug &amp; Play</span>
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
                  <div className="flex items-center justify-center text-slate-400 text-[11px] font-mono">
                    ↓ Normalisation &amp; contrôle qualité automatique ↓
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-950">Moteur UniSme (IPÉ, SER, Alertes)</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">Temps réel</span>
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
                q: "Comment UniSme facilite-t-il les audits de certification ISO 50001 ?",
                a: "UniSme centralise et structure l'ensemble des éléments exigés par la norme NF EN ISO 50001:2018 (revue énergétique §6.3, indicateurs IPÉ §6.4, plans d'actions §6.2 et revues de management §9.3). Lors des audits menés par les organismes certificateurs (AFNOR, Bureau Veritas, DNV, etc.), votre équipe dispose immédiatement d'un dossier documenté, traçable et chiffré avec un profil dédié en lecture seule, ce qui divise par deux le temps de préparation."
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

                {/* Message d'aiguillage vers la démo en haut de page */}
                <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-slate-600 leading-relaxed">
                  💡 <span className="italic">Vous souhaitez tester l'outil immédiatement ? Vous pouvez cliquer directement sur le bouton <button type="button" onClick={activeDemoUser ? onEnterDirectDemo : onOpenSandboxModal} className="font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer">'Tester la version démo'</button> en haut de page.</span>
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
        </div>
      </footer>
    </div>
  );
};
