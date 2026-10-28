import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Building2,
  Sparkles,
  Zap,
  Users2,
  Check,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CommercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModel?: string;
}

export const CommercialModal: React.FC<CommercialModalProps> = ({
  isOpen,
  onClose,
  defaultModel = 'Le modèle SaaS'
}) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [objet, setObjet] = useState(defaultModel);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const commercialModels = [
    {
      id: 'Le modèle SaaS',
      label: 'Le modèle SaaS',
      titre: 'Abonnement SaaS par site',
      badge: 'Le plus rassurant',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Zap,
      description:
        'Facturation mensuelle ou annuelle par site raccordé ou par volume de flux de données traités. Pas de lourds investissements initiaux de licence.'
    },
    {
      id: 'Freemium',
      label: 'Freemium',
      titre: 'PoC Pilote (2 à 3 mois)',
      badge: 'Essai sur 1 UES',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Sparkles,
      description:
        'Déploiement pilote sur une ligne de production ou un seul UES pendant 2 à 3 mois. Mesurez les kWh économisés et validez la simplicité avant engagement.'
    },
    {
      id: 'Le partenariat',
      label: 'Le partenariat',
      titre: 'Partenariat Cabinets de Conseil',
      badge: 'Marque blanche & B2B',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Users2,
      description:
        'Pour les consultants en efficacité énergétique : déploiement en marque blanche ou apporteur d’affaires chez vos clients sans barrière technique.'
    },
    {
      id: 'Autre',
      label: 'Autre',
      titre: 'Projet spécifique ou sur-mesure',
      badge: 'Sur-mesure',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Building2,
      description:
        'Intégration d’automates propriétaires, serveurs sur site (On-Premise), interfaçage ERP ou besoin d’architecture sur-mesure.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setErrorMsg('Veuillez renseigner votre Nom, Prénom et Adresse email.');
      return;
    }
    setErrorMsg('');
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setNom('');
    setPrenom('');
    setEmail('');
    setTelephone('');
    setEntreprise('');
    setObjet('Le modèle SaaS');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec gradient élégant */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commercialisation & Déploiement</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Déployer la solution UniSme (ISO 50001)
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Choisissez le format adapté à votre organisation : abonnement SaaS, PoC pilote sur une UES ou partenariat de conseil.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer la fenêtre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          /* Confirmation d'envoi réussi */
          <div className="p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Demande transmise avec succès !
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Merci <strong>{prenom} {nom}</strong>. Votre intérêt pour{' '}
                <span className="font-semibold text-emerald-700">« {objet} »</span> a bien été enregistré.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Prise de contact sous 24 heures ouvrées</span>
              </div>
              <p>
                Un conseiller technique et commercial prendra attache avec vous à l'adresse <strong>{email}</strong> pour organiser une démonstration personnalisée et adapter le cadrage financier.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              Retour à l'application
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* 1. Sélection visuelle du modèle économique */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Choisissez votre modèle d'intérêt
                </label>
                <span className="text-[11px] text-slate-400">
                  Cliquez sur un bloc pour l'assigner à votre demande
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commercialModels.filter(m => m.id !== 'Autre').map((m) => {
                  const isSelected = objet === m.id;
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setObjet(m.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all text-left flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                            {m.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">{m.titre}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{m.description}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {m.label}
                        </span>
                        <span className="text-slate-400">Sélectionner</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Formulaire de Contact */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Vos coordonnées & Détail de la demande
                </label>
                <span className="text-[11px] text-slate-400">* Champs requis</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Ligne Nom & Prénom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dupont"
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
                    placeholder="Ex: Sophie"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* Ligne Email & Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse email professionnelle <span className="text-rose-500">*</span>
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
                    Numéro de téléphone <span className="text-slate-400 text-[10px]">(Optionnel)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* Ligne Entreprise & Objet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entreprise / Organisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Industrie Agroalimentaire SAS"
                    value={entreprise}
                    onChange={(e) => setEntreprise(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Objet / Modèle souhaité <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={objet}
                    onChange={(e) => setObjet(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium text-slate-800"
                  >
                    <option value="Le modèle SaaS">Le modèle SaaS (Abonnement par site / volume)</option>
                    <option value="Freemium">Freemium (PoC pilote 2-3 mois sur 1 UES)</option>
                    <option value="Le partenariat">Le partenariat (Cabinet de conseil / Marque blanche)</option>
                    <option value="Autre">Autre (Projet spécifique / On-Premise)</option>
                  </select>
                </div>
              </div>

              {/* Message / Champ Libre */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Précisions sur votre besoin <span className="text-slate-400 text-[10px]">(Champ libre)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez votre projet, vos sites ou UES clés, le nombre d'utilisateurs ou vos questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* Footer avec bouton Envoyer vert et gages de confiance */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Données confidentielles · Aucun engagement contractuel</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer la demande</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
