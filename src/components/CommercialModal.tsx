import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Zap,
  Users2,
  Check,
  ShieldCheck,
  Clock,
  Award,
  FileCheck2,
  HelpCircle
} from 'lucide-react';

interface CommercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModel?: 'Solution SaaS' | 'Conseil ISO 50001' | 'Partenariat';
}

export const CommercialModal: React.FC<CommercialModalProps> = ({
  isOpen,
  onClose,
  defaultModel = 'Solution SaaS'
}) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [formuleSaas, setFormuleSaas] = useState<'mensuel' | 'annuel' | 'trial'>('annuel');
  const [typeConseil, setTypeConseil] = useState<string>('certification_initiale');
  const [typePartenariat, setTypePartenariat] = useState<string>('deploiement_clients');
  const [situationNorme, setSituationNorme] = useState<string>('en_cours');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const commercialModels = [
    {
      id: 'Solution SaaS',
      label: 'Solution SaaS',
      titre: 'Solution SaaS (Sans ou Avec engagement)',
      badge: '100% Logiciel & Autonome',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Zap,
      description:
        'Accès direct et immédiat à la plateforme pour digitaliser votre SMÉ, piloter vos UES/IPÉ et vos plans d’actions. Formule mensuelle sans engagement ou annuelle économique (2 mois offerts).'
    },
    {
      id: 'Conseil ISO 50001',
      label: 'Conseil ISO 50001',
      titre: 'Besoin de conseil en ISO 50001',
      badge: 'Accompagnement Méthodologique',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Award,
      description:
        'Accompagnement sur-mesure pour bâtir, structurer ou certifier votre Système de Management de l’Énergie : revue énergétique, identification des UES & IPÉ de référence, et préparation à l’audit.'
    },
    {
      id: 'Partenariat',
      label: 'Partenariat Cabinets & Auditeurs',
      titre: 'Partenariat Cabinets & Auditeurs',
      badge: 'Bureaux d’études & Auditeurs',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Users2,
      description:
        'Pour les consultants en efficacité énergétique, auditeurs tierce partie et bureaux d’études : déployez UniSme chez vos clients industriels, apport d’affaires et conditions partenaires privilégiées.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setErrorMsg('Veuillez renseigner votre Nom, Prénom et Adresse email professionnelle.');
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
    setSelectedModel('Solution SaaS');
    setFormuleSaas('annuel');
    setTypeConseil('certification_initiale');
    setTypePartenariat('deploiement_clients');
    setSituationNorme('en_cours');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec identité sobre & professionnelle */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offres & Déploiement</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Déployer la solution UniSme (ISO 50001)
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Choisissez le format adapté à vos besoins : Solution SaaS directe (avec ou sans engagement), Conseil & accompagnement ISO 50001, ou Partenariat cabinets de conseil.
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
                Merci <strong>{prenom} {nom}</strong>. Votre demande pour{' '}
                <span className="font-semibold text-emerald-700">« {selectedModel} »</span> a bien été enregistrée.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Prise de contact sous 24 heures ouvrées</span>
              </div>
              <p>
                Un référent prendra contact avec vous à l'adresse <strong>{email}</strong> afin de vous transmettre les accès, le devis ou les éléments de cadrage méthodologique.
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
            {/* 1. Sélection visuelle du modèle (3 Options exclusives) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Choisissez votre option d'intérêt
                </label>
                <span className="text-[11px] text-slate-400">
                  Sélectionnez un modèle pour adapter le formulaire
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {commercialModels.map((m) => {
                  const isSelected = selectedModel === m.id;
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
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
                        <span className="text-slate-400">
                          {isSelected ? 'Sélectionné' : 'Sélectionner'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sous-options contextuelles selon le modèle sélectionné */}
              {selectedModel === 'Solution SaaS' && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      Précisez la formule SaaS souhaitée :
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">100% autonome · Sans installation de matériel</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        formuleSaas === 'annuel'
                          ? 'bg-white border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white/60 border-emerald-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="formuleSaas"
                        checked={formuleSaas === 'annuel'}
                        onChange={() => setFormuleSaas('annuel')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div>Formule Annuelle</div>
                        <div className="text-[10px] text-emerald-600 font-normal">Engagement 12 mois (2 mois offerts)</div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        formuleSaas === 'mensuel'
                          ? 'bg-white border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white/60 border-emerald-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="formuleSaas"
                        checked={formuleSaas === 'mensuel'}
                        onChange={() => setFormuleSaas('mensuel')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div>Formule Mensuelle</div>
                        <div className="text-[10px] text-slate-500 font-normal">Sans engagement · Résiliable par mois</div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        formuleSaas === 'trial'
                          ? 'bg-white border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white/60 border-emerald-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="formuleSaas"
                        checked={formuleSaas === 'trial'}
                        onChange={() => setFormuleSaas('trial')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div>Essai Gratuit 14 jours</div>
                        <div className="text-[10px] text-slate-500 font-normal">Accès direct · Sans carte bancaire</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {selectedModel === 'Conseil ISO 50001' && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Précisez la nature de votre besoin en conseil :
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">Accompagnement expert SMÉ</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        typeConseil === 'certification_initiale'
                          ? 'bg-white border-amber-500 text-amber-950 font-bold shadow-xs'
                          : 'bg-white/60 border-amber-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="typeConseil"
                        checked={typeConseil === 'certification_initiale'}
                        onChange={() => setTypeConseil('certification_initiale')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div>Certification Initiale</div>
                        <div className="text-[10px] text-slate-500 font-normal">Structuration complète du SMÉ</div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        typeConseil === 'audit_blanc'
                          ? 'bg-white border-amber-500 text-amber-950 font-bold shadow-xs'
                          : 'bg-white/60 border-amber-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="typeConseil"
                        checked={typeConseil === 'audit_blanc'}
                        onChange={() => setTypeConseil('audit_blanc')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div>Audit Blanc & Diagnostic</div>
                        <div className="text-[10px] text-slate-500 font-normal">Revue de maturité & écarts</div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        typeConseil === 'renouvellement'
                          ? 'bg-white border-amber-500 text-amber-950 font-bold shadow-xs'
                          : 'bg-white/60 border-amber-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="typeConseil"
                        checked={typeConseil === 'renouvellement'}
                        onChange={() => setTypeConseil('renouvellement')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div>Optimisation & Maintien</div>
                        <div className="text-[10px] text-slate-500 font-normal">Audit de renouvellement ou suivi</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {selectedModel === 'Partenariat' && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Users2 className="w-3.5 h-3.5 text-indigo-600" />
                      Type de collaboration cabinet / auditeur :
                    </span>
                    <span className="text-[11px] text-indigo-700 font-medium">Bureaux d’études & Auditeurs indépendants</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        typePartenariat === 'deploiement_clients'
                          ? 'bg-white border-indigo-500 text-indigo-950 font-bold shadow-xs'
                          : 'bg-white/60 border-indigo-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="typePartenariat"
                        checked={typePartenariat === 'deploiement_clients'}
                        onChange={() => setTypePartenariat('deploiement_clients')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div>Équiper mes clients industriels</div>
                        <div className="text-[10px] text-slate-500 font-normal">Déploiement logiciel pour votre portefeuille clients</div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        typePartenariat === 'apport_affaires'
                          ? 'bg-white border-indigo-500 text-indigo-950 font-bold shadow-xs'
                          : 'bg-white/60 border-indigo-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="typePartenariat"
                        checked={typePartenariat === 'apport_affaires'}
                        onChange={() => setTypePartenariat('apport_affaires')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div>Apport d’affaires & Recommandation</div>
                        <div className="text-[10px] text-slate-500 font-normal">Commissionnement et mise en relation qualifiée</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Formulaire de Qualification B2B */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Vos coordonnées & Contexte de l'établissement
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
                    Numéro de téléphone <span className="text-slate-400 text-[10px]">(Prise de contact rapide)</span>
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

              {/* Ligne Entreprise & Situation ISO 50001 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entreprise / Usine / Cabinet
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
                    Situation vis-à-vis de l’ISO 50001
                  </label>
                  <select
                    value={situationNorme}
                    onChange={(e) => setSituationNorme(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium text-slate-800"
                  >
                    <option value="en_cours">Projet de certification en cours (&lt; 12 mois)</option>
                    <option value="deja_certifie">Déjà certifié ISO 50001 (Optimisation & Digitalisation)</option>
                    <option value="pas_de_demarche">Pas de projet ISO 50001 (Supervision énergétique seule)</option>
                    <option value="consultant">Cabinet de conseil / Auditeur externe</option>
                  </select>
                </div>
              </div>

              {/* Message / Champ Libre */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Précisions sur votre projet ou questions <span className="text-slate-400 text-[10px]">(Facultatif)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez vos UES clés (air comprimé, vapeur, froid...), le nombre de sites ou vos attentes spécifiques..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* Footer avec bouton Envoyer vert et réassurances */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Données confidentielles · Aucun matériel à installer par nos soins</span>
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
                    <span>
                      {selectedModel === 'Solution SaaS'
                        ? 'Demander les accès / Devis SaaS'
                        : selectedModel === 'Conseil ISO 50001'
                        ? 'Demander un accompagnement Conseil'
                        : 'Déposer une demande Partenaire'}
                    </span>
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
