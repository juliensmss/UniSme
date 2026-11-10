import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Lock
} from 'lucide-react';
import { recordLeadInFirestore } from '../../lib/firebase';

interface SandboxLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSandbox: (leadData: { nom: string; prenom: string; email: string; entreprise: string }) => void;
}

export const SandboxLeadModal: React.FC<SandboxLeadModalProps> = ({
  isOpen,
  onClose,
  onStartSandbox
}) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setErrorMsg('Veuillez renseigner votre Nom, Prénom et Adresse e-mail professionnelle.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Veuillez saisir une adresse e-mail professionnelle valide.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      // 1. Enregistrement en base de données Cloud Firestore (Collection 'leads')
      recordLeadInFirestore({
        nom,
        prenom,
        email,
        entreprise,
        source: 'demo_modal',
        objet: 'Accès Démo en direct',
        message: 'Démarrage immédiat d\'une session de démonstration'
      });

      // 2. Notification de secours en tâche de fond pour qualifier le lead
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: 'd742ecac-6c3d-4878-9b71-cb775de4064d',
          subject: `[Démo UniSme] Nouveau testeur : ${prenom} ${nom} (${entreprise || 'Usine'})`,
          from_name: `${prenom} ${nom}`,
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          entreprise: entreprise.trim() || 'Non renseigné',
          objet_selectionne: 'Accès Démo en direct',
          message: 'L\'utilisateur a démarré une session de démo en direct sur la solution UniSme.'
        })
      }).catch(() => {
        // Ignorer l'échec d'envoi réseau pour ne pas bloquer l'accès à la démo
      });

      // Stocker les données de session du visiteur
      const leadPayload = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        entreprise: entreprise.trim() || 'Usine Partenaire'
      };
      localStorage.setItem('unisme_sandbox_user', JSON.stringify(leadPayload));

      // Lancement immédiat de la démo
      setTimeout(() => {
        setIsSubmitting(false);
        onStartSandbox(leadPayload);
      }, 400);

    } catch {
      setIsSubmitting(false);
      onStartSandbox({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        entreprise: entreprise.trim() || 'Usine Partenaire'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Moderne Sombre */}
        <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Tester la démo en direct
              </h2>
              <p className="text-xs text-slate-400">
                Accédez à l'environnement interactif avec données industrielles réelles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avantages Sandbox */}
        <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-6 py-3 text-xs text-emerald-950 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Accès immédiat sans carte bancaire · Démo préconfigurée ISO 50001 (UES, IPÉ, Données réelles)</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Mathieu"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Thomas"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adresse e-mail professionnelle <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="m.thomas@industrie-manufacture.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Votre identifiant de session démo temporaire
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Entreprise / Site industriel
            </label>
            <input
              type="text"
              placeholder="Usine Val-de-Loire SAS"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          {/* Bouton d'entrée dans la démo */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initialisation de votre environnement démo...</span>
                </>
              ) : (
                <>
                  <span>Ouvrir la démo en direct</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Vos coordonnées restent strictement confidentielles · Zéro spam</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
