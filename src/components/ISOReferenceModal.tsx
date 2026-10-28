import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  Paperclip,
  Link as LinkIcon,
  Check,
  Edit3,
  FileText,
  Upload,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface ISOReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ISOReferenceModal: React.FC<ISOReferenceModalProps> = ({ isOpen, onClose }) => {
  // Gestion du document de référence rattaché par l'organisme (Fichier PDF ou Lien GED)
  const [docMode, setDocMode] = useState<'fichier' | 'lien'>('fichier');
  const [attachedFileName, setAttachedFileName] = useState<string>('Manuel_SME_ISO_50001_v2024.pdf');
  const [gedUrl, setGedUrl] = useState<string>('https://ged.valdeloire-industrie.fr/qualite/sme/norme-iso-50001-2018.pdf');
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [tempFileName, setTempFileName] = useState('');
  const [tempGedUrl, setTempGedUrl] = useState('');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (docMode === 'fichier' && tempFileName) {
      setAttachedFileName(tempFileName);
    } else if (docMode === 'lien' && tempGedUrl) {
      setGedUrl(tempGedUrl);
    }
    setIsEditingDoc(false);
  };

  const toggleChapter = (chapNum: number) => {
    setExpandedChapter(prev => prev === chapNum ? null : chapNum);
  };

  const chapters = [
    {
      num: 4,
      titre: "Chapitre 4 : Contexte de l'organisme",
      badge: 'Contexte & Périmètre',
      resume: "Compréhension des enjeux stratégiques, des parties intéressées et définition stricte du périmètre d'application sans exclusion d'énergie.",
      exigences: [
        {
          code: '§4.1',
          nom: "Compréhension de l'organisme et de son contexte",
          detail: "Identification formalisée des facteurs internes (parc machines, vétusté, compétences) et externes (réglementation thermique, hausses tarifaires de l'énergie, climat local) influant sur la performance."
        },
        {
          code: '§4.2',
          nom: "Compréhension des besoins et attentes des parties intéressées",
          detail: "Recensement des exigences légales (audit énergétique obligatoire, ICPE, décret tertiaire) et des attentes des parties prenantes clés (Direction, DREAL, riverains, clients)."
        },
        {
          code: '§4.3',
          nom: "Détermination du domaine d'application du SMÉ",
          detail: "Délimitation explicite des frontières physiques, géographiques et organisationnelles. La norme ISO 50001:2018 proscrit expressément d'exclure une forme d'énergie du périmètre certifié."
        },
        {
          code: '§4.4',
          nom: "Système de management de l'énergie",
          detail: "Établissement, mise en œuvre, tenue à jour et amélioration continue du système selon le cycle PDCA."
        }
      ]
    },
    {
      num: 5,
      titre: "Chapitre 5 : Leadership & Engagement de la Direction",
      badge: 'Gouvernance & Rôles',
      resume: "Implication active du top management, publication d'une politique énergétique engageante et désignation de l'équipe de management de l'énergie.",
      exigences: [
        {
          code: '§5.1',
          nom: "Leadership et engagement",
          detail: "La direction doit s'assurer que la politique et les objectifs énergétiques sont compatibles avec l'orientation stratégique de l'entreprise, et allouer les ressources humaines et financières requises."
        },
        {
          code: '§5.2',
          nom: "Politique énergétique",
          detail: "Déclaration formelle écrite signée par la direction. Elle doit contenir un engagement d'amélioration continue, l'engagement de mise à disposition des ressources, le soutien aux achats éco-performants et le respect des exigences légales."
        },
        {
          code: '§5.3',
          nom: "Rôles, responsabilités et autorités au sein de l'organisation",
          detail: "Nomination du Référent Énergie et constitution de l'Équipe SMÉ pluridisciplinaire (Production, Maintenance, Achats). Définition des pouvoirs via une matrice de responsabilités (ex: matrice RACI)."
        }
      ]
    },
    {
      num: 6,
      titre: "Chapitre 6 : Planification Énergétique",
      badge: 'Cœur Méthodologique',
      resume: "Revue énergétique exhaustive, identification des UES, modélisation des SER, calcul des IPÉ et formalisation des plans d'actions chiffrés.",
      exigences: [
        {
          code: '§6.1',
          nom: "Actions à mettre en œuvre face aux risques et opportunités",
          detail: "Évaluation préventive des aléas pouvant compromettre les résultats visés ou générer des surconsommations imprévues."
        },
        {
          code: '§6.2',
          nom: "Objectifs, cibles énergétiques et planification pour les atteindre",
          detail: "Définition d'objectifs chiffrés (ex: -12% de kWh/t à horizon 2026), avec calendrier, budget alloué, méthodes d'évaluation et pilotes désignés."
        },
        {
          code: '§6.3',
          nom: "Revue énergétique méthodique",
          detail: "Analyse des consommations passées et présentes, identification des Usages Énergétiques Significatifs (UES), identification des variables d'influence pertinentes et estimation des consommations futures."
        },
        {
          code: '§6.4',
          nom: "Indicateurs de Performance Énergétique (IPÉ / EnPI)",
          detail: "Définition de ratios quantifiables (kWh/tonne, kWh/DJU, kW moyen) permettant de mesurer les variations de performance."
        },
        {
          code: '§6.5',
          nom: "Situation Énergétique de Référence (SER / EnB)",
          detail: "Établissement d'une période de référence représentative et ajustement statistique mathématique en cas de variation des facteurs pertinents."
        },
        {
          code: '§6.6',
          nom: "Plan de collecte de données énergétiques (Plan de comptage)",
          detail: "Spécification des grandeurs mesurées, fréquences d'échantillonnage, précision des capteurs et chaîne de traçabilité des données."
        }
      ]
    },
    {
      num: 7,
      titre: "Chapitre 7 : Support & Moyens",
      badge: 'Ressources & Compétences',
      resume: "Allocation des ressources matérielles, développement des compétences critiques pour les UES et gestion documentaire structurée.",
      exigences: [
        {
          code: '§7.1',
          nom: "Ressources et moyens",
          detail: "Fourniture des instruments de mesure, des sous-compteurs étalonnés et des outils logiciels de suivi."
        },
        {
          code: '§7.2',
          nom: "Compétences des intervenants sur les UES",
          detail: "Garantir que toute personne dont les actions impactent les UES possède la formation et l'habilitation requises (titres, certificats de conduite de chaufferie, frigoristes, régleurs)."
        },
        {
          code: '§7.3',
          nom: "Sensibilisation du personnel",
          detail: "Campagnes de sensibilisation aux écogestes métiers et explication des conséquences directes des dérives de réglage sur le bilan énergétique."
        },
        {
          code: '§7.5',
          nom: "Informations documentées",
          detail: "Création, actualisation et conservation des preuves exigées par la norme (enregistrements de comptage, rapports d'audits, justificatifs de compétences)."
        }
      ]
    },
    {
      num: 8,
      titre: "Chapitre 8 : Réalisation des Activités Opérationnelles",
      badge: 'Maîtrise & Achats',
      resume: "Maîtrise opérationnelle des UES, consignes de conduite et de maintenance, conception sobre et achats éco-performants.",
      exigences: [
        {
          code: '§8.1',
          nom: "Maîtrise opérationnelle des UES",
          detail: "Établissement de consignes de réglage strictes (plages de pression d'air comprimé, températures de consigne, arrêts automatiques en cas d'inactivité) et maintenance préventive des équipements énergivores."
        },
        {
          code: '§8.2',
          nom: "Conception éco-performante (Design)",
          detail: "Prise en compte systématique de l'efficacité énergétique lors de la rénovation de lignes ou de la construction de nouvelles installations."
        },
        {
          code: '§8.3',
          nom: "Approvisionnement en produits, équipements et services énergétiques",
          detail: "Intégration de critères de coût global de possession (TCO) et de performance énergétique minimale dans les cahiers des charges d'achats."
        }
      ]
    },
    {
      num: 9,
      titre: "Chapitre 9 : Évaluation de la Performance",
      badge: 'Surveillance & Audits',
      resume: "Suivi continu des indicateurs IPÉ vs SER, respect de la conformité légale, réalisation des audits internes et revue de direction.",
      exigences: [
        {
          code: '§9.1',
          nom: "Surveillance, mesurage, analyse et évaluation",
          detail: "Vérification régulière que les consommations mesurées restent alignées avec les modèles théoriques de référence. Identification immédiate des dérives non justifiées."
        },
        {
          code: '§9.2',
          nom: "Audit interne du SMÉ",
          detail: "Planification périodique d'audits méthodiques indépendants pour vérifier la conformité du système aux exigences de la norme ISO 50001."
        },
        {
          code: '§9.3',
          nom: "Revue de management par la direction",
          detail: "Bilan annuel formel dressé par la Direction : examen du statut des actions antérieures, analyse de l'atteinte des cibles énergétiques et validation des orientations futures."
        }
      ]
    },
    {
      num: 10,
      titre: "Chapitre 10 : Amélioration",
      badge: 'Progrès Continu',
      resume: "Traitement réactif des non-conformités, recherche des causes racines et démonstration factuelle de l'amélioration continue.",
      exigences: [
        {
          code: '§10.1',
          nom: "Non-conformité et actions correctives",
          detail: "Traitement documenté des écarts (dépassement de seuil, panne de compteur, dérive UES) : analyse des causes premières (5 Pourquoi, Ishikawa) et application d'actions correctives durables."
        },
        {
          code: '§10.2',
          nom: "Amélioration continue de la performance énergétique",
          detail: "L'organisme doit démontrer de façon tangible et vérifiable qu'il a amélioré son efficacité énergétique (réduction effective de l'IPÉ par rapport à la situation de référence SER)."
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Référentiel Normatif NF EN ISO 50001:2018
              </h3>
              <p className="text-[11px] text-slate-300">
                Systèmes de management de l'énergie — Exigences et recommandations de mise en œuvre
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
            title="Fermer la fenêtre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content déroulant */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* BANDEAU DOCUMENT OFFICIEL RATTACHÉ : PDF OU LIEN GED */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  {docMode === 'fichier' ? <Paperclip className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Document Normatif Rattaché à votre SMÉ
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {docMode === 'fichier' ? 'Fichier PDF interne' : 'Lien GED / Intranet'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-md">
                    {docMode === 'fichier' ? attachedFileName : gedUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {docMode === 'lien' && gedUrl && (
                  <a
                    href={gedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    <span>Ouvrir dans la GED</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingDoc(!isEditingDoc);
                    setTempFileName(attachedFileName);
                    setTempGedUrl(gedUrl);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEditingDoc ? 'Fermer' : 'Remplacer / Modifier'}</span>
                </button>
              </div>
            </div>

            {/* Formulaire pour attacher un nouveau PDF ou spécifier un lien GED */}
            {isEditingDoc && (
              <form onSubmit={handleSaveDoc} className="pt-3 border-t border-slate-200 space-y-3 bg-white p-3.5 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Format de la source :</span>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setDocMode('fichier')}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                        docMode === 'fichier' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>Fichier PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocMode('lien')}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                        docMode === 'lien' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Lien GED / Réseau</span>
                    </button>
                  </div>
                </div>

                {docMode === 'fichier' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      Sélectionner le document PDF interne (procédure, manuel ou copie officielle) :
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setTempFileName(e.target.files[0].name);
                          }
                        }}
                        className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      URL ou chemin intranet GED :
                    </label>
                    <input
                      type="text"
                      placeholder="https://ged.entreprise.com/sme/norme-iso-50001.pdf ou \\serveur\qualite\..."
                      value={tempGedUrl}
                      onChange={(e) => setTempGedUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingDoc(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Enregistrer la référence</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* DÉFINITIONS CLÉS ARTICLE 3 */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2.5 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Définitions Fondamentales de la Norme (Article 3)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                <strong className="text-slate-900 block mb-1 text-xs">§3.5.6 Usage Énergétique Significatif (UES / SEU)</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Usage de l'énergie représentant une part importante de la consommation énergétique globale et/ou offrant un potentiel considérable d'amélioration de la performance énergétique.
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                <strong className="text-slate-900 block mb-1 text-xs">§3.4.4 Indicateur de Performance Énergétique (IPÉ / EnPI)</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Mesure ou unité de performance énergétique définie par l'organisme (ex: ratio simple kWh/t, valeur absolue kW, ou modèle multivarié de régression mathématique).
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                <strong className="text-slate-900 block mb-1 text-xs">§3.4.7 Situation Énergétique de Référence (SER / EnB)</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Référence quantifiée servant de base pour la comparaison de performances énergétiques sur une période représentative spécifiée, servant d'étalon avant et après mise en œuvre des actions.
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                <strong className="text-slate-900 block mb-1 text-xs">§3.4.9 Facteur Pertinent & §3.4.10 Ajustement</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Facteur quantifiable ayant une incidence significative sur la performance énergétique et soumis à des variations courantes (météo, cadence, tonnage) exigeant un ajustement pour une comparaison impartiale.
                </p>
              </div>
            </div>
          </div>

          {/* DÉTAIL COMPLET DE LA NORME PAR CHAPITRE (STRUCTURE HLS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Exigences Détaillées par Chapitre (Structure Universelle HLS)</span>
              </h4>
              <span className="text-[11px] text-slate-400">Cliquez sur un chapitre pour déplier son contenu</span>
            </div>

            <div className="space-y-2.5">
              {chapters.map((chap) => {
                const isExpanded = expandedChapter === chap.num;
                return (
                  <div
                    key={chap.num}
                    className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all shadow-2xs"
                  >
                    {/* En-tête du chapitre cliquable */}
                    <div
                      onClick={() => toggleChapter(chap.num)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{chap.titre}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                            {chap.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{chap.resume}</p>
                      </div>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-700" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Exigences détaillées du chapitre si déplié */}
                    {isExpanded && (
                      <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Clauses et attendus d'audit ISO 50001 :
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {chap.exigences.map((ex) => (
                            <div key={ex.code} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-emerald-700 text-[11px]">{ex.code}</span>
                                <span className="font-semibold text-slate-900 text-xs">{ex.nom}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{ex.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Conforme aux audits d'accréditation <strong>AFNOR Certification</strong> / Cofrac
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
