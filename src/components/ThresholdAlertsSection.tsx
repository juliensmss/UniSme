import React, { useState, useMemo } from 'react';
import { EnergyDataPoint, ThresholdAlertRule, ActiveAlertEvent } from '../types/energy';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Trash2,
  Sliders,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  Activity,
  Flame,
  Zap,
  Wind
} from 'lucide-react';

interface ThresholdAlertsSectionProps {
  data: EnergyDataPoint[];
  alertRules: ThresholdAlertRule[];
  setAlertRules: React.Dispatch<React.SetStateAction<ThresholdAlertRule[]>>;
  accessMode?: 'admin' | 'consultation';
  onNavigateToAct?: (ncTitle: string, ues: string) => void;
}

export const ThresholdAlertsSection: React.FC<ThresholdAlertsSectionProps> = ({
  data,
  alertRules,
  setAlertRules,
  accessMode = 'admin',
  onNavigateToAct
}) => {
  const [showAddRule, setShowAddRule] = useState(false);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [filterSeverite, setFilterSeverite] = useState<string>('Toutes');

  // Formulaire nouvelle règle
  const [newRuleNom, setNewRuleNom] = useState('');
  const [newRuleVar, setNewRuleVar] = useState<keyof EnergyDataPoint>('conso_totale_kwh');
  const [newRuleVarLabel, setNewRuleVarLabel] = useState('Consommation Totale Appelée');
  const [newRuleOp, setNewRuleOp] = useState<'>' | '<' | '>=' | '<='>('>');
  const [newRuleSeuil, setNewRuleSeuil] = useState<number>(200);
  const [newRuleUnite, setNewRuleUnite] = useState('kWh/h');
  const [newRuleSeverite, setNewRuleSeverite] = useState<'Critique' | 'Majeur' | 'Avertissement'>('Critique');
  const [newRuleUES, setNewRuleUES] = useState('Global Site');
  const [newRuleMessage, setNewRuleMessage] = useState('');

  // Latest measurements (current point)
  const latestPoint = useMemo(() => {
    return data.length > 0 ? data[data.length - 1] : null;
  }, [data]);

  // Évaluation des alertes actives en temps réel sur les dernières données
  const activeAlerts: ActiveAlertEvent[] = useMemo(() => {
    if (!latestPoint) return [];
    const events: ActiveAlertEvent[] = [];

    // On analyse les 5 derniers points horaires pour détecter d'éventuelles dérives récentes
    const recentPoints = data.slice(-5);

    alertRules.filter(r => r.active).forEach(rule => {
      // Regarder si le point le plus récent déclenche la règle
      const val = Number(latestPoint[rule.variableKey]);
      let isTriggered = false;
      if (rule.operateur === '>') isTriggered = val > rule.seuil;
      else if (rule.operateur === '<') isTriggered = val < rule.seuil;
      else if (rule.operateur === '>=') isTriggered = val >= rule.seuil;
      else if (rule.operateur === '<=') isTriggered = val <= rule.seuil;

      if (isTriggered) {
        events.push({
          id: `ALERT-${rule.id}-${latestPoint.id}`,
          ruleId: rule.id,
          titre: rule.nom,
          severite: rule.severite,
          valeurMesuree: val,
          seuil: rule.seuil,
          unite: rule.unite,
          operateur: rule.operateur,
          ues: rule.ues,
          horodatage: latestPoint.timestamp,
          acquittee: acknowledgedAlerts.includes(`ALERT-${rule.id}-${latestPoint.id}`),
          messageAction: rule.messageAction
        });
      }
    });

    return events;
  }, [data, latestPoint, alertRules, acknowledgedAlerts]);

  const handleAcknowledge = (id: string) => {
    if (!acknowledgedAlerts.includes(id)) {
      setAcknowledgedAlerts(prev => [...prev, id]);
    }
  };

  const handleToggleRule = (id: string) => {
    if (accessMode === 'consultation') return;
    setAlertRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDeleteRule = (id: string) => {
    if (accessMode === 'consultation') return;
    setAlertRules(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleNom || accessMode === 'consultation') return;
    const rule: ThresholdAlertRule = {
      id: `RULE-0${alertRules.length + 1}`,
      nom: newRuleNom,
      variableKey: newRuleVar,
      variableLabel: newRuleVarLabel,
      operateur: newRuleOp,
      seuil: Number(newRuleSeuil),
      unite: newRuleUnite,
      severite: newRuleSeverite,
      ues: newRuleUES,
      active: true,
      messageAction: newRuleMessage || 'Vérifier la consigne de régulation et contacter le responsable UES.'
    };
    setAlertRules(prev => [...prev, rule]);
    setNewRuleNom('');
    setNewRuleMessage('');
    setShowAddRule(false);
  };

  const filteredAlerts = activeAlerts.filter(a => {
    if (filterSeverite === 'Toutes') return true;
    return a.severite === filterSeverite;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-600 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Surveillance Continue & Alertes sur Seuil Métier
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                ISO 50001 §6.6 / §9.1
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Détection automatique des dérives de consommation, chutes de pression et dépassements de puissances souscrites.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {accessMode === 'admin' ? (
              <button
                type="button"
                onClick={() => setShowAddRule(!showAddRule)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Configurer un nouveau seuil</span>
              </button>
            ) : (
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                Mode Consultation (Lecture seule)
              </span>
            )}
          </div>
        </div>

        {/* 4 KPIs de Surveillance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Alertes Actives Temps Réel</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${activeAlerts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {activeAlerts.length}
              </span>
              <span className="text-xs text-slate-400">sur derniers flux</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Alertes Critiques</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-red-600">
                {activeAlerts.filter(a => a.severite === 'Critique').length}
              </span>
              <span className="text-xs text-slate-400">priorité haute</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Règles de Seuil Actives</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {alertRules.filter(r => r.active).length} / {alertRules.length}
              </span>
              <span className="text-xs text-slate-400">surveillance 24/7</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Dernier relevé horosynchrone</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs font-mono font-semibold text-slate-800 truncate">
                {latestPoint ? new Date(latestPoint.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">Connecté</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORMULAIRE D'AJOUT D'UNE RÈGLE DE SEUIL */}
      {showAddRule && accessMode === 'admin' && (
        <form onSubmit={handleAddRuleSubmit} className="bg-white border border-slate-300 rounded-lg p-5 space-y-4 shadow-sm">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Paramétrage d'un nouveau seuil d'alerte énergétique :</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Intitulé de l'alerte :</label>
              <input
                type="text"
                required
                placeholder="Ex: Pression Air Comprimé critique réservoir tampon..."
                value={newRuleNom}
                onChange={(e) => setNewRuleNom(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Variable mesurée :</label>
              <select
                value={newRuleVar}
                onChange={(e) => {
                  const val = e.target.value as keyof EnergyDataPoint;
                  setNewRuleVar(val);
                  if (val === 'pression_air_bar') {
                    setNewRuleVarLabel('Pression Air Comprimé');
                    setNewRuleUnite('bar');
                    setNewRuleOp('<');
                    setNewRuleSeuil(6.2);
                    setNewRuleUES('UES-03 (Air Comprimé)');
                  } else if (val === 'conso_froid_kwh') {
                    setNewRuleVarLabel('Consommation Froid NH3');
                    setNewRuleUnite('kWh/h');
                    setNewRuleOp('>');
                    setNewRuleSeuil(130);
                    setNewRuleUES('UES-01 (Froid NH3)');
                  } else if (val === 'conso_fours_kwh') {
                    setNewRuleVarLabel('Consommation Fours');
                    setNewRuleUnite('kWh/h');
                    setNewRuleOp('>');
                    setNewRuleSeuil(220);
                    setNewRuleUES('UES-02 (Fours)');
                  } else {
                    setNewRuleVarLabel('Consommation Totale');
                    setNewRuleUnite('kWh/h');
                    setNewRuleOp('>');
                    setNewRuleSeuil(200);
                    setNewRuleUES('Global Site');
                  }
                }}
                className="w-full p-2 border border-slate-300 rounded bg-white"
              >
                <option value="conso_totale_kwh">Consommation Totale (kWh/h)</option>
                <option value="pression_air_bar">Pression Air Comprimé (bar)</option>
                <option value="conso_froid_kwh">Consommation Froid NH3 (kWh/h)</option>
                <option value="conso_fours_kwh">Consommation Fours (kWh/h)</option>
                <option value="conso_compresseurs_kwh">Consommation Compresseurs (kWh/h)</option>
                <option value="conso_auxiliaires_kwh">Consommation Auxiliaires (kWh/h)</option>
                <option value="temperature_ext_degc">Température Extérieure (°C)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">UES rattachée :</label>
              <input
                type="text"
                value={newRuleUES}
                onChange={(e) => setNewRuleUES(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Condition :</label>
              <select
                value={newRuleOp}
                onChange={(e) => setNewRuleOp(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded bg-white font-mono font-bold text-center"
              >
                <option value=">">&gt; Supérieur strict</option>
                <option value="<">&lt; Inférieur strict</option>
                <option value=">=">&gt;= Supérieur ou égal</option>
                <option value="<=">&lt;= Inférieur ou égal</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Valeur de seuil :</label>
              <input
                type="number"
                step="0.1"
                required
                value={newRuleSeuil}
                onChange={(e) => setNewRuleSeuil(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Unité :</label>
              <input
                type="text"
                value={newRuleUnite}
                onChange={(e) => setNewRuleUnite(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sévérité :</label>
              <select
                value={newRuleSeverite}
                onChange={(e) => setNewRuleSeverite(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded bg-white font-semibold"
              >
                <option value="Critique">Critique (Rouge)</option>
                <option value="Majeur">Majeur (Orange)</option>
                <option value="Avertissement">Avertissement (Jaune)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Consigne d'action immédiate / Message d'alerte :
            </label>
            <input
              type="text"
              placeholder="Ex: Vérifier la purge automatique et réenclencher compresseur..."
              value={newRuleMessage}
              onChange={(e) => setNewRuleMessage(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddRule(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-slate-900 text-white rounded font-bold hover:bg-slate-800 transition-colors"
            >
              Enregistrer la règle de surveillance
            </button>
          </div>
        </form>
      )}

      {/* SECTION 1 : FLUX DES ALERTES ACTIVES */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Dérives Détectées en Temps Réel ({filteredAlerts.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Filtrer sévérité :</span>
            <select
              value={filterSeverite}
              onChange={(e) => setFilterSeverite(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-700"
            >
              <option value="Toutes">Toutes les alertes</option>
              <option value="Critique">Critique uniquement</option>
              <option value="Majeur">Majeur</option>
              <option value="Avertissement">Avertissement</option>
            </select>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">Aucun dépassement de seuil critique actuellement</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Toutes les consommations et pressions d'utilités respectent les seuils configurés.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isCrit = alert.severite === 'Critique';
              const isMaj = alert.severite === 'Majeur';
              const borderClass = isCrit ? 'border-red-300 bg-red-50/40' : isMaj ? 'border-amber-300 bg-amber-50/40' : 'border-yellow-200 bg-yellow-50/30';
              const badgeClass = isCrit ? 'bg-red-100 text-red-800 border-red-200' : isMaj ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200';

              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors ${borderClass}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                        {alert.severite.toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-900">{alert.titre}</span>
                      <span className="text-[10px] font-mono text-slate-500">· {alert.ues}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-700">
                      <span>
                        Mesuré : <strong className="font-mono text-slate-900">{alert.valeurMesuree.toFixed(1)} {alert.unite}</strong>
                      </span>
                      <span className="text-slate-400">|</span>
                      <span>
                        Seuil consigné : <span className="font-mono">{alert.operateur} {alert.seuil} {alert.unite}</span>
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.horodatage).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium">
                      ↳ Consigne : {alert.messageAction}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {alert.acquittee ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acquittée
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
                      >
                        Acquitter
                      </button>
                    )}

                    {onNavigateToAct && (
                      <button
                        type="button"
                        onClick={() => onNavigateToAct(alert.titre, alert.ues)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-2xs"
                        title="Créer une fiche de non-conformité dans l'onglet Act"
                      >
                        <span>Créer NC (Act)</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2 : TABLEAU DES RÈGLES DE SEUIL CONFIGURÉES */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Référentiel des Seuils & Consignes de Surveillance</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Seuils critiques et consignes opérationnelles conformément aux exigences de maîtrise ISO 50001 §8.1.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-800 text-white font-semibold">
              <tr>
                <th className="p-3 border-r border-slate-700">Règle</th>
                <th className="p-3 border-r border-slate-700">Variable surveillée</th>
                <th className="p-3 text-center border-r border-slate-700">Opérateur & Seuil</th>
                <th className="p-3 border-r border-slate-700">UES Concernée</th>
                <th className="p-3 text-center border-r border-slate-700">Sévérité</th>
                <th className="p-3 border-r border-slate-700">Consigne / Action</th>
                <th className="p-3 text-center border-r border-slate-700">Actif</th>
                {accessMode === 'admin' && <th className="p-3 text-center w-12">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alertRules.map((rule) => {
                return (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">
                      {rule.nom}
                    </td>
                    <td className="p-3 text-slate-700 border-r border-slate-200 font-mono">
                      {rule.variableLabel}
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 font-mono font-bold text-slate-900">
                      {rule.operateur} {rule.seuil} {rule.unite}
                    </td>
                    <td className="p-3 text-slate-600 border-r border-slate-200">
                      {rule.ues}
                    </td>
                    <td className="p-3 text-center border-r border-slate-200">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.severite === 'Critique' ? 'bg-red-100 text-red-800' :
                        rule.severite === 'Majeur' ? 'bg-amber-100 text-amber-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rule.severite}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 border-r border-slate-200 max-w-[260px] truncate" title={rule.messageAction}>
                      {rule.messageAction}
                    </td>
                    <td className="p-3 text-center border-r border-slate-200">
                      <button
                        type="button"
                        disabled={accessMode === 'consultation'}
                        onClick={() => handleToggleRule(rule.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center ${
                          rule.active ? 'bg-emerald-600' : 'bg-slate-300'
                        } ${accessMode === 'consultation' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          rule.active ? 'translate-x-4' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    {accessMode === 'admin' && (
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Supprimer la règle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
