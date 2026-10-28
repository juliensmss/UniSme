import React, { useState, useMemo } from 'react';
import { EnergyDataPoint } from '../types/energy';
import { calculateRegression, calculateCorrelationMatrix } from '../utils/statistics';
import { Network, TrendingUp, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';

interface CorrelationSectionProps {
  data: EnergyDataPoint[];
}

export const CorrelationSection: React.FC<CorrelationSectionProps> = ({ data }) => {
  // Target energy variable (Y)
  const [targetVar, setTargetVar] = useState<keyof EnergyDataPoint>('conso_totale_kwh');
  // Independent explanatory factor (X)
  const [driverVar, setDriverVar] = useState<keyof EnergyDataPoint>('volume_production_tonnes');
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);

  const labelsMap: Record<string, string> = {
    conso_totale_kwh: 'Consommation Totale (kWh)',
    conso_froid_kwh: 'Froid Industriel (kWh)',
    conso_compresseurs_kwh: 'Air Comprimé (kWh)',
    conso_fours_kwh: 'Fours & Cuisson (kWh)',
    conso_auxiliaires_kwh: 'Auxiliaires & Utilités (kWh)',
    temperature_ext_degc: 'Température Extérieure (°C)',
    volume_production_tonnes: 'Volume de Production (tonnes)',
    taux_charge_pct: 'Taux de Charge (%)',
    pression_air_bar: 'Pression Air Comprimé (bar)',
    dju_froid: 'DJU Froid (Degrés-Jours)'
  };

  const targetOptions: (keyof EnergyDataPoint)[] = [
    'conso_totale_kwh',
    'conso_froid_kwh',
    'conso_compresseurs_kwh',
    'conso_fours_kwh',
    'conso_auxiliaires_kwh'
  ];

  const driverOptions: (keyof EnergyDataPoint)[] = [
    'volume_production_tonnes',
    'temperature_ext_degc',
    'taux_charge_pct',
    'pression_air_bar',
    'dju_froid'
  ];

  // Calculate Regression
  const regression = useMemo(() => {
    return calculateRegression(data, driverVar, targetVar);
  }, [data, driverVar, targetVar]);

  // All numeric columns for heatmap
  const allNumericKeys: (keyof EnergyDataPoint)[] = [
    'conso_totale_kwh',
    'conso_froid_kwh',
    'conso_compresseurs_kwh',
    'conso_fours_kwh',
    'conso_auxiliaires_kwh',
    'temperature_ext_degc',
    'volume_production_tonnes',
    'taux_charge_pct',
    'pression_air_bar',
    'dju_froid'
  ];

  const correlation = useMemo(() => {
    return calculateCorrelationMatrix(data, allNumericKeys);
  }, [data]);

  // Scatter plot geometry
  const width = 800;
  const height = 340;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };

  const bounds = useMemo(() => {
    if (regression.points.length === 0) {
      return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    }
    const xs = regression.points.map(p => p.x);
    const ys = regression.points.map(p => p.y);
    const minX = Math.floor(Math.min(...xs));
    const maxX = Math.ceil(Math.max(...xs));
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    return {
      minX: Math.max(0, minX - (maxX - minX) * 0.05),
      maxX: maxX + (maxX - minX) * 0.05,
      minY: Math.max(0, minY - (maxY - minY) * 0.05),
      maxY: maxY + (maxY - minY) * 0.05
    };
  }, [regression]);

  const mapX = (x: number) => {
    const range = bounds.maxX - bounds.minX || 1;
    return padding.left + ((x - bounds.minX) / range) * (width - padding.left - padding.right);
  };

  const mapY = (y: number) => {
    const range = bounds.maxY - bounds.minY || 1;
    return height - padding.bottom - ((y - bounds.minY) / range) * (height - padding.top - padding.bottom);
  };

  // Color helper for Heatmap (-1 to +1)
  const getHeatmapColor = (val: number) => {
    if (val === 1) return '#0F172A'; // Self
    if (val > 0) {
      // Red gradient for positive correlation
      const opacity = Math.min(1, Math.max(0.08, val));
      return `rgba(220, 38, 38, ${opacity})`;
    } else {
      // Blue gradient for negative correlation
      const opacity = Math.min(1, Math.max(0.08, Math.abs(val)));
      return `rgba(37, 99, 235, ${opacity})`;
    }
  };

  const getTextColor = (val: number) => {
    if (Math.abs(val) > 0.65 || val === 1) return '#FFFFFF';
    return '#1E293B';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Analyse des Facteurs Pertinents & Corrélations
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Norme ISO 50001:2018 §6.3 c) & §6.5</span>
            <span aria-hidden="true">·</span>
            <span>Modélisation statistique de la SER (EnB) et IPÉ (EnPI)</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md font-mono">
          R² = {regression.r2.toFixed(3)} | r = {regression.r.toFixed(3)}
        </div>
      </div>

      {/* Cadre Méthodologique & Pourquoi de cet onglet (ISO 50001 §6.3 / ISO 50006) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-700 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Pourquoi analyser les Facteurs Pertinents & Corrélations ?
            </h3>
            <p className="text-xs text-emerald-300 font-medium mt-0.5">
              Objectif méthodologique : Identifier les variables d'influence clés pour construire des Indicateurs de Performance Énergétique (IPÉ) fiables et ajustés.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2.5 border-t border-slate-700/70 text-xs">
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>1. Isoler les Facteurs Influents</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              La consommation ne varie pas par hasard : elle est pilotée par la météo (T° Ext / DJU), les cadences de production (tonnes), le taux de charge des lignes ou la pression réseau.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>2. Modéliser la SER de Référence</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Le calcul de corrélation (r) et de régression (R²) permet d'établir une droite de référence fiable <span className="font-mono text-white">Y = a·X + b</span> modélisant la consommation normale attendue.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>3. Établir des IPÉ Ajustés</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              En neutralisant l'effet des variables non maîtrisables (climat, à-coups de commande), vous mesurez la performance énergétique intrinsèque réelle de vos équipements.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Sélecteurs dynamiques de variables */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">
          1. Sélection Dynamique des Variables d'Étude
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Conformément au §6.3 c) 1), identifiez l'impact des variables d'influence (charge, climat, cadence) sur chaque UES.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Variable cible dépendante (Y - Consommation UES ou Totale) :
            </label>
            <select
              value={targetVar}
              onChange={(e) => setTargetVar(e.target.value as keyof EnergyDataPoint)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800"
            >
              {targetOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {labelsMap[opt]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Facteur pertinent explicatif (X - Variable d'influence) :
            </label>
            <select
              value={driverVar}
              onChange={(e) => setDriverVar(e.target.value as keyof EnergyDataPoint)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800"
            >
              {driverOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {labelsMap[opt]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Métriques statistiques de la régression */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[11px] text-slate-500 block">R² (Détermination)</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {regression.r2.toFixed(3)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {regression.r2 >= 0.70 ? 'Forte corrélation (Validé)' : 'Corrélation modérée'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Pearson (r)</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {regression.r > 0 ? `+${regression.r.toFixed(3)}` : regression.r.toFixed(3)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {regression.r > 0 ? 'Couplage positif' : 'Couplage inverse'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Sensibilité (Pente a)</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {regression.slope.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">kWh consommés par unité</span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Talon Fixe (b)</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {regression.intercept.toFixed(1)} kWh
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Consommation hors charge</span>
          </div>
        </div>
      </div>

      {/* 2. Nuage de points avec Droite de Tendance */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              2. Nuage de Points & Droite de Régression Linéaire (y = ax + b)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Modélisation de référence pour l'ajustement de la SER (ISO 50001 §6.5 & ISO 50006).
            </p>
          </div>

          <div className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
            y = {regression.slope.toFixed(2)}x + {regression.intercept.toFixed(1)}
          </div>
        </div>

        {/* SVG Scatter Plot */}
        <div className="relative overflow-hidden w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none bg-slate-50/50 rounded border border-slate-100"
          >
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = height - padding.bottom - pct * (height - padding.top - padding.bottom);
              const val = Math.round(bounds.minY + pct * (bounds.maxY - bounds.minY));
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94A3B8"
                    className="font-mono tabular-nums"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Grid vertical lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const x = padding.left + pct * (width - padding.left - padding.right);
              const val = Math.round(bounds.minX + pct * (bounds.maxX - bounds.minX));
              return (
                <g key={idx}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#94A3B8"
                    className="font-mono tabular-nums"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Regression Line */}
            {regression.trendline.length === 2 && (
              <line
                x1={mapX(regression.trendline[0].x)}
                y1={mapY(regression.trendline[0].y)}
                x2={mapX(regression.trendline[1].x)}
                y2={mapY(regression.trendline[1].y)}
                stroke="#DC2626"
                strokeWidth="2.5"
              />
            )}

            {/* Scatter points */}
            {regression.points.map((p, idx) => (
              <circle
                key={idx}
                cx={mapX(p.x)}
                cy={mapY(p.y)}
                r="3.5"
                fill="#2563EB"
                fillOpacity="0.55"
                stroke="#1D4ED8"
                strokeWidth="0.8"
                onMouseEnter={() => setHoverPoint(p)}
                className="cursor-pointer hover:r-5 hover:fill-slate-900 transition-all"
              />
            ))}

            {/* Axis Titles */}
            <text
              x={width / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="11"
              fill="#475569"
              fontWeight="600"
            >
              {labelsMap[driverVar]} (X)
            </text>
            <text
              x={-height / 2}
              y={16}
              transform="rotate(-90)"
              textAnchor="middle"
              fontSize="11"
              fill="#475569"
              fontWeight="600"
            >
              {labelsMap[targetVar]} (Y)
            </text>
          </svg>

          {/* Hover indicator */}
          {hoverPoint && (
            <div className="mt-2 text-xs font-mono text-slate-700 bg-slate-100 p-2 rounded inline-block">
              Point : X = <strong>{hoverPoint.x.toFixed(2)}</strong> | Y = <strong>{hoverPoint.y.toFixed(2)}</strong>
            </div>
          )}
        </div>

        {/* Interprétation ISO 50001 */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
          <strong className="text-slate-900 font-semibold block mb-1">
            Recommandation pour la Situation Énergétique de Référence (SER) :
          </strong>
          {regression.r2 >= 0.70 ? (
            <p>
              Le coefficient de détermination <strong>R² = {regression.r2.toFixed(3)}</strong> atteste que{' '}
              <strong>{(regression.r2 * 100).toFixed(1)}%</strong> des variations de consommation sont directement expliquées par ce facteur.
              Cette relation linéaire est <strong>statistiquement robuste</strong> et doit servir de base d'ajustement normalisé pour la comparaison des IPÉ.
            </p>
          ) : (
            <p>
              Le coefficient <strong>R² = {regression.r2.toFixed(3)}</strong> indique que ce facteur seul n'explique pas la totalité des fluctuations.
              Il convient de tester une régression multivariable (ex: température + production simultanées) ou d'isoler les régimes de marche.
            </p>
          )}
        </div>
      </div>

      {/* 3. Matrice de Corrélation Globale (Heatmap) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              3. Matrice de Corrélation Globale (Carte Thermique / Heatmap)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calcul exhaustif des coefficients de Pearson (r) entre toutes les grandeurs physiques et énergétiques.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">r ∈ [-1.0 ; +1.0]</span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-semibold text-slate-500">Variables</th>
                {correlation.keys.map((k) => (
                  <th key={k} className="p-2 text-[10px] font-bold text-slate-700 max-w-[90px] truncate" title={labelsMap[k]}>
                    {labelsMap[k]?.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlation.matrix.map((row, i) => {
                const rowKey = correlation.keys[i];
                return (
                  <tr key={rowKey}>
                    <td className="p-2 text-left font-medium text-slate-900 max-w-[140px] truncate" title={labelsMap[rowKey]}>
                      {labelsMap[rowKey]}
                    </td>
                    {row.map((val, j) => {
                      const colKey = correlation.keys[j];
                      const bgColor = getHeatmapColor(val);
                      const textColor = getTextColor(val);
                      return (
                        <td
                          key={colKey}
                          style={{ backgroundColor: bgColor, color: textColor }}
                          className="p-2 font-mono font-semibold tabular-nums border border-white text-[11px] transition-transform hover:scale-110 cursor-pointer"
                          title={`${labelsMap[rowKey]} ↔ ${labelsMap[colKey]} : r = ${val > 0 ? '+' : ''}${val}`}
                        >
                          {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(37, 99, 235, 0.8)' }} />
            <span>Forte corrélation négative (-1.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-slate-100 border border-slate-300" />
            <span>Indépendance (0.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(220, 38, 38, 0.8)' }} />
            <span>Forte corrélation positive (+1.0)</span>
          </div>
        </div>
      </div>

      {/* 4. Tableau de Synthèse des Facteurs d'Influence pour le Rapport SMÉ */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
          4. Synthèse d'Identification des Facteurs Pertinents par UES (Conforme ISO 50001 §6.3)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Usage Énergétique Significatif (UES)</th>
                <th className="p-3">Facteur Pertinent Principal</th>
                <th className="p-3 text-right">Coefficient r</th>
                <th className="p-3">Recommandation d'Ajustement Méthodologique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-900">UES-01 : Centrale Froid (NH3)</td>
                <td className="p-3 text-slate-700">Température extérieure & DJU Froid</td>
                <td className="p-3 text-right font-mono font-bold text-red-600">+0.84</td>
                <td className="p-3 text-slate-600">
                  Intégrer la température dans la baseline SER. Corriger l'IPÉ pour neutraliser l'effet des vagues de chaleur estivales.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">UES-02 : Fours & Procédés Thermiques</td>
                <td className="p-3 text-slate-700">Volume de production (tonnes)</td>
                <td className="p-3 text-right font-mono font-bold text-red-600">+0.92</td>
                <td className="p-3 text-slate-600">
                  Définir l'IPÉ en kWh/tonne produite avec prise en compte explicite du talon fixe de maintien en température de nuit.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">UES-03 : Air Comprimé</td>
                <td className="p-3 text-slate-700">Volume produit + Pression de consigne</td>
                <td className="p-3 text-right font-mono font-bold text-red-600">+0.81</td>
                <td className="p-3 text-slate-600">
                  Surveiller le débit résiduel nocturne le dimanche soir pour quantifier immédiatement l'apparition de nouvelles fuites.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">UES-04 : Utilités & Chauffage</td>
                <td className="p-3 text-slate-700">Température extérieure</td>
                <td className="p-3 text-right font-mono font-bold text-blue-600">-0.62</td>
                <td className="p-3 text-slate-600">
                  Régulation dynamique de la loi d'eau de chauffage selon les horaires de présence du personnel.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
