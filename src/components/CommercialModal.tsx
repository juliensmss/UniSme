import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Check,
  ShieldCheck,
  Clock,
  Loader2,
  Sparkles
} from 'lucide-react';

interface CommercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModel?: string;
}

export const CommercialModal: React.FC<CommercialModalProps> = ({
  isOpen,
  onClose,
  defaultModel = 'Solution UniSme'
}) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [objet, setObjet] = useState<string>(defaultModel);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const objetOptions = [
    { id: 'Solution UniSme', label: 'Solution UniSme' },
    { id: 'Conseil ISO 50001', label: 'Conseil ISO 50001' },
    { id: 'Partenariat & Cabinets / Auditeurs', label: 'Partenariat & Cabinets / Auditeurs' },
    { id: 'Autre / Question générale', label: 'Autre / Question générale' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setErrorMsg('Veuillez renseigner votre Nom, Prénom et Adresse e-mail professionnelle.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: 'd742ecac-6c3d-4878-9b71-cb775de4064d',
          subject: `[UniSme] Demande : ${objet} - ${entreprise || `${prenom} ${nom}`}`,
          from_name: `${prenom} ${nom}`,
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          entreprise: entreprise.trim() || 'Non renseigné',
          objet_selectionne: objet,
          message: message.trim() || 'Aucun message spécifique renseigné'
        })
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(result.message || 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.');
      }
    } catch {
      setErrorMsg('Impossible de contacter le service d’envoi. Vérifiez votre connexion internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setNom('');
    setPrenom('');
    setEmail('');
    setEntreprise('');
    setObjet('Solution UniSme');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Moderne & Épuré */}
        <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Déployer la solution UniSme
              </h2>
              <p className="text-xs text-slate-400">
                Transmettez votre demande pour échanger avec notre équipe
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

        {isSubmitted ? (
          /* Confirmation d'envoi */
          <div className="p-8 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">
                Message envoyé avec succès !
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Merci <strong>{prenom} {nom}</strong>. Votre demande concernant{' '}
                <span className="font-semibold text-emerald-700">« {objet} »</span> a bien été transmise à notre équipe.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 text-left flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nous reviendrons vers vous à l'adresse <strong>{email}</strong> sous 24 heures ouvrées.</span>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* 1. Coordonnées sur deux colonnes */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
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
                    Adresse e-mail <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sophie.dupont@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entreprise / Organisation
                  </label>
                  <input
                    type="text"
                    placeholder="Industrie Agroalimentaire SAS"
                    value={entreprise}
                    onChange={(e) => setEntreprise(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Sélecteur d'Objet en grille de tags cliquables */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
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
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
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

            {/* 3. Grand champ de texte libre (Votre message) */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                3. Votre message
              </label>
              <textarea
                rows={4}
                required
                placeholder="Précisez vos besoins, le contexte de votre usine ou vos questions techniques..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white placeholder:text-slate-400"
              />
            </div>

            {/* 4. Bouton d'action large et bien visible en bas */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
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
                    <Send className="w-4 h-4" />
                    <span>Envoyer la demande</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Données confidentielles · Aucun engagement · Réponse sous 24h</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
