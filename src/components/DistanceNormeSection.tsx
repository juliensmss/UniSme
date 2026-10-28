import React, { useState, useMemo } from 'react';
import { ShieldCheck, Award, AlertTriangle, CheckCircle2, ChevronRight, FileCheck2, BarChart3, Filter, RotateCcw } from 'lucide-react';
import { TableColumnFilter } from './TableColumnFilter';

interface AuditCriterion {
  id: string;
  chapitre: string;
  clause: string;
  intitule: string;
  exigence: string;
  statut: 'Conforme' | 'Partiel' | 'Non Conforme' | 'Non Initié';
  commentaire: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
}

interface DistanceNormeSectionProps {
  accessMode?: 'admin' | 'consultation';
}

const initialCriteria: AuditCriterion[] = [
  {
    id: 'CRIT-4.1',
    chapitre: 'Chapitre 4 : Contexte',
    clause: '§4.1 & §4.2',
    intitule: 'Enjeux & Parties intéressées',
    exigence: 'Identification documentée des enjeux internes/externes et des besoins des parties intéressées.',
    statut: 'Conforme',
    commentaire: 'Matrice SWOT énergie et registre des parties intéressées formalisés et validés.',
    priorite: 'Moyenne'
  },
  {
    id: 'CRIT-4.3',
    chapitre: 'Chapitre 4 : Contexte',
    clause: '§4.3',
    intitule: 'Périmètre & Domaine d\'application',
    exigence: 'Délimitation physique et organisationnelle sans exclusion d\'aucun type d\'énergie.',
    statut: 'Conforme',
    commentaire: 'Couvre l\'ensemble des 4 lignes de production et utilités (électricité, gaz, fioul secours).',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-5.2',
    chapitre: 'Chapitre 5 : Leadership',
    clause: '§5.2',
    intitule: 'Politique énergétique formalisée',
    exigence: 'Déclaration signée par la Direction Générale, intégrant l\'engagement à l\'amélioration continue et aux achats sobres.',
    statut: 'Conforme',
    commentaire: 'Politique diffusée sur les panneaux d\'affichage et signée le 15/01/2025.',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-6.3',
    chapitre: 'Chapitre 6 : Planification',
    clause: '§6.3',
    intitule: 'Revue énergétique & Usages Significatifs (UES)',
    exigence: 'Analyse méthodique des données de consommation et identification claire des UES (Pareto > 80%).',
    statut: 'Conforme',
    commentaire: '4 UES documentés : Froid NH3, Fours, Air Comprimé et Utilités.',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-6.4',
    chapitre: 'Chapitre 6 : Planification',
    clause: '§6.4 & §6.5',
    intitule: 'IPÉ, SER & Facteurs pertinents',
    exigence: 'Définition d\'IPÉ pertinents comparés aux situations de référence ajustées des facteurs d\'influence.',
    statut: 'Partiel',
    commentaire: 'IPÉ Froid ajusté aux DJU en place. Ajustement de l\'air comprimé selon la production à consolider.',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-6.6',
    chapitre: 'Chapitre 6 : Planification',
    clause: '§6.6',
    intitule: 'Plan de collecte des données énergétiques',
    exigence: 'Programme documenté définissant les caractéristiques clés, la métrologie et les fréquences de mesure.',
    statut: 'Conforme',
    commentaire: 'Architecture IoT opérationnelle (OPC UA & MQTT avec sous-comptage 96% de l\'énergie).',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-7.2',
    chapitre: 'Chapitre 7 : Support',
    clause: '§7.2 & §7.3',
    intitule: 'Compétence & Sensibilisation',
    exigence: 'Qualification des intervenants ayant une incidence sur les UES et sensibilisation générale.',
    statut: 'Conforme',
    commentaire: 'Référent énergie certifié Lead Implementer ; opérateurs formés aux écogestes.',
    priorite: 'Moyenne'
  },
  {
    id: 'CRIT-8.1',
    chapitre: 'Chapitre 8 : Réalisation',
    clause: '§8.1',
    intitule: 'Planification & Maîtrise opérationnelle',
    exigence: 'Critères de conduite et consignes de maintenance des UES pour prévenir les dérives énergétiques.',
    statut: 'Partiel',
    commentaire: 'Consignes établies en chaufferie et froid. Gammes de maintenance compresseurs à actualiser.',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-8.2',
    chapitre: 'Chapitre 8 : Réalisation',
    clause: '§8.2 & §8.3',
    intitule: 'Conception sobre & Achats énergétiques',
    exigence: 'Prise en compte de la performance énergétique dans les investissements et critères d\'achats d\'équipements.',
    statut: 'Conforme',
    commentaire: 'Critère de performance obligatoire dans tous les cahiers des charges machines > 15 kW.',
    priorite: 'Moyenne'
  },
  {
    id: 'CRIT-9.1',
    chapitre: 'Chapitre 9 : Évaluation',
    clause: '§9.1',
    intitule: 'Surveillance, mesurage et analyse',
    exigence: 'Évaluation régulière de la performance énergétique réelle vs attendue et enquête sur les écarts.',
    statut: 'Conforme',
    commentaire: 'Supervision temps réel et alertes de dérive automatiques configurées.',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-9.2',
    chapitre: 'Chapitre 9 : Évaluation',
    clause: '§9.2',
    intitule: 'Programme des audits internes',
    exigence: 'Audits internes planifiés et menés par des auditeurs formés et impartiaux.',
    statut: 'Partiel',
    commentaire: 'Dernier audit réalisé en mars 2025. Deuxième audit annuel à planifier pour le S2.',
    priorite: 'Haute'
  },
  {
    id: 'CRIT-10.1',
    chapitre: 'Chapitre 10 : Amélioration',
    clause: '§10.1 & §10.2',
    intitule: 'Traitement des NC & Amélioration continue',
    exigence: 'Actions correctives pour éliminer les causes de dérive et démonstration d\'une amélioration mesurable.',
    statut: 'Conforme',
    commentaire: 'Registre des NC/AC actif avec clôture effective et baisse globale de 9.1% de l\'intensité énergétique.',
    priorite: 'Haute'
  }
];

export const DistanceNormeSection: React.FC<DistanceNormeSectionProps> = ({ accessMode = 'admin' }) => {
  const [criteria, setCriteria] = useState<AuditCriterion[]>(initialCriteria);
  // Filtres directs par colonne
  const [colFilters, setColFilters] = useState<Record<string, string>>({
    clause: '',
    intitule: '',
    commentaire: '',
    statut: '',
    priorite: ''
  });

  // Tri par colonne
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const updateColFilter = (colKey: string, val: string) => {
    setColFilters(prev => ({
      ...prev,
      [colKey]: val === 'Tous' || val === 'Toutes' ? '' : val
    }));
  };

  const handleSort = (columnKey: string, direction: 'asc' | 'desc' | null) => {
    if (!direction) {
      setSortColumn(null);
      setSortDirection(null);
    } else {
      setSortColumn(columnKey);
      setSortDirection(direction);
    }
  };

  // Scoring
  const stats = useMemo(() => {
    let scoreTotal = 0;
    const maxScore = criteria.length * 100;
    let conformeCount = 0;
    let partielCount = 0;
    let nonConformeCount = 0;
    let nonInitieCount = 0;

    criteria.forEach(c => {
      if (c.statut === 'Conforme') {
        scoreTotal += 100;
        conformeCount += 1;
      } else if (c.statut === 'Partiel') {
        scoreTotal += 50;
        partielCount += 1;
      } else if (c.statut === 'Non Conforme') {
        scoreTotal += 0;
        nonConformeCount += 1;
      } else {
        scoreTotal += 0;
        nonInitieCount += 1;
      }
    });

    const conformitePct = Math.round((scoreTotal / maxScore) * 100);

    // Breakdown per chapter
    const chapterBreakdown = Array.from(new Set(criteria.map(c => c.chapitre))).map(chap => {
      const items = criteria.filter(c => c.chapitre === chap);
      const pts = items.reduce((acc, it) => {
        if (it.statut === 'Conforme') return acc + 100;
        if (it.statut === 'Partiel') return acc + 50;
        return acc;
      }, 0);
      const maxPts = items.length * 100;
      return {
        chapitre: chap,
        score: Math.round((pts / maxPts) * 100),
        total: items.length
      };
    });

    return {
      conformitePct,
      conformeCount,
      partielCount,
      nonConformeCount,
      nonInitieCount,
      totalCount: criteria.length,
      chapterBreakdown
    };
  }, [criteria]);

  const updateStatut = (id: string, newStatut: AuditCriterion['statut']) => {
    if (accessMode === 'consultation') return;
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, statut: newStatut } : c));
  };

  const resetAllFilters = () => {
    setColFilters({
      clause: '',
      intitule: '',
      commentaire: '',
      statut: '',
      priorite: ''
    });
    setSortColumn(null);
    setSortDirection(null);
  };

  const hasActiveFilters = Object.values(colFilters).some(v => Boolean(v && v.trim() !== ''));
  const activeFiltersCount = Object.values(colFilters).filter(v => Boolean(v && v.trim() !== '')).length;

  // Options prédéfinies pour les menus déroulants
  const statutOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    criteria.forEach(c => {
      counts[c.statut] = (counts[c.statut] || 0) + 1;
    });
    return [
      { value: 'Conforme', label: 'Conforme (100%)', count: counts['Conforme'] || 0 },
      { value: 'Partiel', label: 'Partiel (50%)', count: counts['Partiel'] || 0 },
      { value: 'Non Conforme', label: 'Non Conforme (0%)', count: counts['Non Conforme'] || 0 },
      { value: 'Non Initié', label: 'Non Initié (0%)', count: counts['Non Initié'] || 0 },
    ];
  }, [criteria]);

  const prioriteOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    criteria.forEach(c => {
      counts[c.priorite] = (counts[c.priorite] || 0) + 1;
    });
    return [
      { value: 'Haute', label: 'Haute', count: counts['Haute'] || 0 },
      { value: 'Moyenne', label: 'Moyenne', count: counts['Moyenne'] || 0 },
      { value: 'Basse', label: 'Basse', count: counts['Basse'] || 0 },
    ];
  }, [criteria]);

  const filteredCriteria = useMemo(() => {
    let result = criteria.filter(c => {
      if (colFilters.clause) {
        const q = colFilters.clause.toLowerCase();
        if (!c.clause.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
      }
      if (colFilters.intitule) {
        const q = colFilters.intitule.toLowerCase();
        if (!c.intitule.toLowerCase().includes(q) && !c.exigence.toLowerCase().includes(q) && !c.chapitre.toLowerCase().includes(q)) return false;
      }
      if (colFilters.commentaire) {
        const q = colFilters.commentaire.toLowerCase();
        if (!c.commentaire.toLowerCase().includes(q)) return false;
      }
      if (colFilters.statut && c.statut !== colFilters.statut) return false;
      if (colFilters.priorite && c.priorite !== colFilters.priorite) return false;
      return true;
    });

    if (sortColumn && sortDirection) {
      result = [...result].sort((a, b) => {
        let valA = (a as any)[sortColumn] || '';
        let valB = (b as any)[sortColumn] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [criteria, colFilters, sortColumn, sortDirection]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Évaluation de la Distance à la Norme ISO 50001:2018
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Audit interne & Auto-évaluation méthodique</span>
            <span aria-hidden="true">·</span>
            <span>Exigences normatives Chapitres 4 à 10</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Taux de Conformité Global</span>
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {stats.conformitePct} %
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold font-mono text-sm">
            {stats.conformitePct >= 80 ? 'A' : stats.conformitePct >= 60 ? 'B' : 'C'}
          </div>
        </div>
      </div>

      {/* Résumé exécutif & Maturité par Chapitre */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Synthèse globale */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Niveau de Maturité Normative
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Diagnostic d'état des lieux pour certifier le site ou préparer la visite de renouvellement AFNOR.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-700">Exigences conformes (100%) :</span>
                <span className="font-mono font-bold text-emerald-700">{stats.conformeCount} / {stats.totalCount}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-700">Conformité partielle (50%) :</span>
                <span className="font-mono font-bold text-amber-700">{stats.partielCount} / {stats.totalCount}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-700">Non conformités (0%) :</span>
                <span className="font-mono font-bold text-rose-700">{stats.nonConformeCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            {stats.conformitePct >= 85 ? (
              <span className="text-emerald-700 font-semibold">
                ✓ Système prêt pour l'audit de certification externe ISO 50001:2018.
              </span>
            ) : (
              <span className="text-amber-700 font-semibold">
                ⚠ Écarts identifiés nécessitant la finalisation des plans d'actions avant audit.
              </span>
            )}
          </div>
        </div>

        {/* Profil de conformité par chapitre */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Couverture Normative par Chapitre ISO 50001
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Visualisation des forces et points de vigilance selon la structure High Level Structure (HLS).
          </p>

          <div className="space-y-3">
            {stats.chapterBreakdown.map((item) => (
              <div key={item.chapitre} className="text-xs">
                <div className="flex justify-between items-center mb-1 font-medium text-slate-700">
                  <span>{item.chapitre}</span>
                  <span className="font-mono font-bold text-slate-900">{item.score} %</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.score}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.score >= 80
                        ? 'bg-emerald-600'
                        : item.score >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grille détaillée d'auto-évaluation */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-slate-700" />
              Grille d'Évaluation des Exigences ISO 50001
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtrage et tri directement via les boutons sur chaque colonne ci-dessous. {accessMode === 'consultation' ? '(Mode Consultation : lecture seule)' : 'Cliquez sur les statuts pour mettre à jour l\'évaluation en direct.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-medium">
              {filteredCriteria.length} / {criteria.length} exigence(s) affichée(s)
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors text-xs font-semibold"
                title="Réinitialiser tous les filtres de colonnes"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Effacer filtres ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 select-none">
              <tr>
                <th className="p-3 w-36">
                  <TableColumnFilter
                    title="Clause"
                    columnKey="clause"
                    filterValue={colFilters.clause}
                    onFilterChange={(v) => updateColFilter('clause', v)}
                    sortDirection={sortColumn === 'clause' ? sortDirection : null}
                    onSort={(dir) => handleSort('clause', dir)}
                    searchPlaceholder="Ex: §6.3, CRIT..."
                  />
                </th>
                <th className="p-3 min-w-[280px]">
                  <TableColumnFilter
                    title="Exigence Normative & Objectif"
                    columnKey="intitule"
                    filterValue={colFilters.intitule}
                    onFilterChange={(v) => updateColFilter('intitule', v)}
                    sortDirection={sortColumn === 'intitule' ? sortDirection : null}
                    onSort={(dir) => handleSort('intitule', dir)}
                    searchPlaceholder="Ex: Revue, IPÉ, audit..."
                  />
                </th>
                <th className="p-3 min-w-[250px]">
                  <TableColumnFilter
                    title="Preuve & Constat d'Implémentation"
                    columnKey="commentaire"
                    filterValue={colFilters.commentaire}
                    onFilterChange={(v) => updateColFilter('commentaire', v)}
                    searchPlaceholder="Ex: IoT, validé, politique..."
                  />
                </th>
                <th className="p-3 w-44 text-center">
                  <TableColumnFilter
                    title="Statut d'évaluation"
                    columnKey="statut"
                    filterValue={colFilters.statut}
                    onFilterChange={(v) => updateColFilter('statut', v)}
                    options={statutOptions}
                    align="center"
                    dropdownWidth="w-56"
                  />
                </th>
                <th className="p-3 w-36 text-center">
                  <TableColumnFilter
                    title="Priorité"
                    columnKey="priorite"
                    filterValue={colFilters.priorite}
                    onFilterChange={(v) => updateColFilter('priorite', v)}
                    options={prioriteOptions}
                    align="center"
                    dropdownWidth="w-48"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCriteria.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                    Aucune exigence ne correspond aux filtres appliqués.
                  </td>
                </tr>
              ) : (
                filteredCriteria.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-900">
                      <div>{c.clause}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{c.id}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">{c.intitule}</span>
                      <p className="text-slate-600 mt-0.5">{c.exigence}</p>
                    </td>
                    <td className="p-3 text-slate-700 bg-slate-50/30">
                      {c.commentaire}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {accessMode === 'consultation' ? (
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-1 rounded border ${
                            c.statut === 'Conforme'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : c.statut === 'Partiel'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : c.statut === 'Non Conforme'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {c.statut}
                        </span>
                      ) : (
                        <select
                          value={c.statut}
                          onChange={(e) => updateStatut(c.id, e.target.value as AuditCriterion['statut'])}
                          className={`text-xs font-semibold px-2 py-1 rounded border cursor-pointer focus:outline-none ${
                            c.statut === 'Conforme'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : c.statut === 'Partiel'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : c.statut === 'Non Conforme'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Conforme">Conforme (100%)</option>
                          <option value="Partiel">Partiel (50%)</option>
                          <option value="Non Conforme">Non Conforme (0%)</option>
                          <option value="Non Initié">Non Initié (0%)</option>
                        </select>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          c.priorite === 'Haute'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : c.priorite === 'Moyenne'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.priorite}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
