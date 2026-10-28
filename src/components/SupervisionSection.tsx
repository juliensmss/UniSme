import React, { useState, useMemo } from 'react';
import { EnergyDataPoint } from '../types/energy';
import {
  Activity,
  Zap,
  ArrowDownRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Layers,
  Thermometer,
  Boxes,
  Gauge
} from 'lucide-react';

interface SupervisionSectionProps {
  data: EnergyDataPoint[];
}

export interface MetricSeriesConfig {
  key: keyof EnergyDataPoint;
  label: string;
  shortLabel: string;
  unit: string;
  category: 'energie' | 'influence' | 'process';
  color: string;
  strokeWidth: number;
}

export const AVAILABLE_CHRONO_SERIES: MetricSeriesConfig[] = [
  { key: 'conso_totale_kwh', label: 'Conso Totale (kWh)', shortLabel: 'Total', unit: 'kWh', category: 'energie', color: '#0F172A', strokeWidth: 2.4 },
  { key: 'conso_froid_kwh', label: 'Froid NH3 (kWh)', shortLabel: 'Froid', unit: 'kWh', category: 'energie', color: '#2563EB', strokeWidth: 2.0 },
  { key: 'conso_compresseurs_kwh', label: 'Air Comprimé (kWh)', shortLabel: 'Air Comp.', unit: 'kWh', category: 'energie', color: '#059669', strokeWidth: 2.0 },
  { key: 'conso_fours_kwh', label: 'Fours Cuisson (kWh)', shortLabel: 'Fours', unit: 'kWh', category: 'energie', color: '#E11D48', strokeWidth: 2.0 },
  { key: 'conso_auxiliaires_kwh', label: 'Auxiliaires (kWh)', shortLabel: 'Auxiliaires', unit: 'kWh', category: 'energie', color: '#D97706', strokeWidth: 1.8 },
  { key: 'temperature_ext_degc', label: 'T° Ext (°C)', shortLabel: 'T° Ext', unit: '°C', category: 'influence', color: '#0284C7', strokeWidth: 2.0 },
  { key: 'volume_production_tonnes', label: 'Prod (t)', shortLabel: 'Prod', unit: 't', category: 'influence', color: '#7C3AED', strokeWidth: 2.0 },
  { key: 'taux_charge_pct', label: 'Charge (%)', shortLabel: 'Charge', unit: '%', category: 'influence', color: '#4F46E5', strokeWidth: 1.8 },
  { key: 'pression_air_bar', label: 'Pression (bar)', shortLabel: 'Pression', unit: 'bar', category: 'process', color: '#0D9488', strokeWidth: 1.8 }
];

export const SupervisionSection: React.FC<SupervisionSectionProps> = ({ data }) => {
  // Mode de fenêtre : 'daily' (jour par jour avec navigation) ou 'horizon' (24h, 7j, 30j, Tout)
  const [windowMode, setWindowMode] = useState<'daily' | 'horizon'>('daily');
  const [timeHorizon, setTimeHorizon] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  
  // Séries sélectionnées pour juxtaposition sur le chronogramme
  const [selectedSeriesKeys, setSelectedSeriesKeys] = useState<string[]>([
    'conso_totale_kwh',
    'conso_froid_kwh',
    'conso_compresseurs_kwh'
  ]);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Extraction de la liste unique des jours disponibles (du plus récent au plus ancien)
  const availableDays = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(d => {
      const dayKey = d.timestamp.slice(0, 10);
      if (!map.has(dayKey)) {
        const dateObj = new Date(d.timestamp);
        const formatted = dateObj.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        map.set(dayKey, formatted);
      }
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [data]);

  // Jour sélectionné par défaut : le dernier jour disponible
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    if (data.length > 0) {
      return data[data.length - 1].timestamp.slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  });

  // Navigation jour par jour
  const currentDayIndex = availableDays.findIndex(d => d.key === selectedDay);
  const handlePrevDay = () => {
    if (currentDayIndex < availableDays.length - 1) {
      setSelectedDay(availableDays[currentDayIndex + 1].key);
    }
  };
  const handleNextDay = () => {
    if (currentDayIndex > 0) {
      setSelectedDay(availableDays[currentDayIndex - 1].key);
    }
  };

  // Filtrage des données selon la fenêtre active
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    if (windowMode === 'daily') {
      const dayData = data.filter(d => d.timestamp.startsWith(selectedDay));
      return dayData.length > 0 ? dayData : data.slice(-24);
    }

    if (timeHorizon === '24h') return data.slice(-24);
    if (timeHorizon === '7d') return data.slice(-24 * 7);
    if (timeHorizon === '30d') return data.slice(-24 * 30);
    return data;
  }, [data, windowMode, selectedDay, timeHorizon]);

  // Toggle ou sélection d'une série
  const toggleSeries = (key: string) => {
    setSelectedSeriesKeys(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // conserver au moins une série
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Presets rapides de juxtaposition
  const setPreset = (type: 'all' | 'kwh' | 'energy_vs_prod' | 'energy_vs_weather' | 'default') => {
    if (type === 'all') {
      setSelectedSeriesKeys(AVAILABLE_CHRONO_SERIES.map(s => s.key));
    } else if (type === 'kwh') {
      setSelectedSeriesKeys([
        'conso_totale_kwh',
        'conso_froid_kwh',
        'conso_compresseurs_kwh',
        'conso_fours_kwh',
        'conso_auxiliaires_kwh'
      ]);
    } else if (type === 'energy_vs_prod') {
      setSelectedSeriesKeys(['conso_totale_kwh', 'volume_production_tonnes', 'taux_charge_pct']);
    } else if (type === 'energy_vs_weather') {
      setSelectedSeriesKeys(['conso_totale_kwh', 'conso_froid_kwh', 'temperature_ext_degc']);
    } else {
      setSelectedSeriesKeys(['conso_totale_kwh', 'conso_froid_kwh', 'conso_compresseurs_kwh']);
    }
  };

  // Métriques agrégées
  const metrics = useMemo(() => {
    if (filteredData.length === 0) {
      return { totalConso: 0, avgPower: 0, totalProd: 0, avgIpe: 0 };
    }
    const totalConso = filteredData.reduce((acc, d) => acc + d.conso_totale_kwh, 0);
    const avgPower = totalConso / filteredData.length;
    const totalProd = filteredData.reduce((acc, d) => acc + d.volume_production_tonnes, 0);
    const avgIpe = totalProd > 0 ? totalConso / totalProd : 0;
    return { totalConso, avgPower, totalProd, avgIpe };
  }, [filteredData]);

  // Répartition par UES
  const uesBreakdown = useMemo(() => {
    if (filteredData.length === 0) return { froid: 0, air: 0, fours: 0, aux: 0 };
    const froid = filteredData.reduce((acc, d) => acc + d.conso_froid_kwh, 0);
    const air = filteredData.reduce((acc, d) => acc + d.conso_compresseurs_kwh, 0);
    const fours = filteredData.reduce((acc, d) => acc + d.conso_fours_kwh, 0);
    const aux = filteredData.reduce((acc, d) => acc + d.conso_auxiliaires_kwh, 0);
    const sum = (froid + air + fours + aux) || 1;
    return {
      froid: Math.round((froid / sum) * 1000) / 10,
      air: Math.round((air / sum) * 1000) / 10,
      fours: Math.round((fours / sum) * 1000) / 10,
      aux: Math.round((aux / sum) * 1000) / 10
    };
  }, [filteredData]);

  // Profil moyen 24h
  const hourlyProfile = useMemo(() => {
    const buckets: { hour: number; total: number; count: number }[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: 0,
      count: 0
    }));

    filteredData.forEach(d => {
      const h = new Date(d.timestamp).getHours();
      buckets[h].total += d.conso_totale_kwh;
      buckets[h].count += 1;
    });

    return buckets.map(b => ({
      hour: b.hour,
      avg: b.count > 0 ? Math.round((b.total / b.count) * 10) / 10 : 0
    }));
  }, [filteredData]);

  const maxHourly = Math.max(...hourlyProfile.map(h => h.avg), 10);

  // Géométrie du chronogramme SVG
  const chartWidth = 950;
  const chartHeight = 260;
  const padding = { top: 25, right: 35, bottom: 35, left: 55 };
  const usableHeight = chartHeight - padding.top - padding.bottom;
  const usableWidth = chartWidth - padding.left - padding.right;

  // Calcul du max pour les séries en kWh
  const maxKwh = useMemo(() => {
    if (filteredData.length === 0) return 250;
    const kwhKeys = ['conso_totale_kwh', 'conso_froid_kwh', 'conso_compresseurs_kwh', 'conso_fours_kwh', 'conso_auxiliaires_kwh'] as const;
    let high = 0;
    filteredData.forEach(d => {
      kwhKeys.forEach(k => {
        if (d[k] > high) high = d[k];
      });
    });
    return Math.ceil(high * 1.1) || 250;
  }, [filteredData]);

  // Calcul des min/max pour chaque série afin de garantir une juxtaposition propre même pour les unités hétérogènes (°C, t, %, bar)
  const seriesMinMax = useMemo(() => {
    const res: Record<string, { min: number; max: number }> = {};
    AVAILABLE_CHRONO_SERIES.forEach(s => {
      if (filteredData.length === 0) {
        res[s.key] = { min: 0, max: 100 };
        return;
      }
      const vals = filteredData.map(d => Number(d[s.key]) || 0);
      let min = Math.min(...vals);
      let max = Math.max(...vals);
      if (s.unit === 'kWh') {
        min = 0;
        max = maxKwh;
      } else {
        // Marge de 10% pour les courbes d'influence
        const span = max - min || 1;
        min = Math.floor(min - span * 0.1);
        max = Math.ceil(max + span * 0.1);
      }
      res[s.key] = { min, max };
    });
    return res;
  }, [filteredData, maxKwh]);

  const getX = (index: number) => {
    const step = filteredData.length > 1 ? usableWidth / (filteredData.length - 1) : usableWidth;
    return padding.left + index * step;
  };

  const getY = (val: number, key: keyof EnergyDataPoint) => {
    const mm = seriesMinMax[key] || { min: 0, max: 100 };
    const span = mm.max - mm.min || 1;
    const ratio = Math.max(0, Math.min(1, (val - mm.min) / span));
    return chartHeight - padding.bottom - ratio * usableHeight;
  };

  // Génération des chemins SVG pour chaque série active
  const activeSeriesPaths = useMemo(() => {
    return selectedSeriesKeys.map(key => {
      const config = AVAILABLE_CHRONO_SERIES.find(s => s.key === key);
      if (!config || filteredData.length === 0) return null;

      const path = filteredData.reduce((acc, d, i) => {
        const x = getX(i);
        const y = getY(Number(d[key as keyof EnergyDataPoint]) || 0, key as keyof EnergyDataPoint);
        return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      }, '');

      return {
        ...config,
        path
      };
    }).filter(Boolean) as (MetricSeriesConfig & { path: string })[];
  }, [selectedSeriesKeys, filteredData, seriesMinMax]);

  return (
    <div className="space-y-6">
      {/* En-tête avec bascule de fenêtre */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Supervision Énergétique des UES & IPÉ
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Télémesure horosynchrone continue</span>
            <span aria-hidden="true">·</span>
            <span>{filteredData.length} relevés analysés</span>
          </div>
        </div>

        {/* Sélecteur de mode de fenêtre temporelle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setWindowMode('daily')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                windowMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fenêtre Jour par Jour</span>
            </button>
            <button
              onClick={() => setWindowMode('horizon')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                windowMode === 'horizon'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue Périodique (7j / 30j)
            </button>
          </div>

          {/* Si mode Périodique */}
          {windowMode === 'horizon' && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
              {(['24h', '7d', '30d', 'all'] as const).map(horizon => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    timeHorizon === horizon
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {horizon === '24h' ? '24h' : horizon === '7d' ? '7 Jours' : horizon === '30d' ? '30 Jours' : 'Tout'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Barre de navigation "Jour par Jour" */}
      {windowMode === 'daily' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Fenêtre Quotidienne :</span>
            </span>

            {/* Sélecteur de date */}
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {availableDays.map(d => (
                <option key={d.key} value={d.key}>
                  {d.label.charAt(0).toUpperCase() + d.label.slice(1)} ({d.key})
                </option>
              ))}
            </select>
          </div>

          {/* Boutons Jour Précédent / Jour Suivant */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={handlePrevDay}
              disabled={currentDayIndex >= availableDays.length - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Reculer d'un jour"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Jour précédent</span>
            </button>

            <button
              onClick={handleNextDay}
              disabled={currentDayIndex <= 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Avancer d'un jour"
            >
              <span>Jour suivant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Indicateurs Clés de la fenêtre sélectionnée */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 font-medium block">Consommation Totale Cumulée</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {Math.round(metrics.totalConso).toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-slate-500">kWh</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {windowMode === 'daily' ? `Sur la journée du ${selectedDay}` : 'Sur la période filtrée'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 font-medium block">Puissance Moyenne Horosynchrone</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.avgPower.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">kW moy</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Régime opérationnel</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 font-medium block">Volume de Production Cumulé</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.totalProd.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">tonnes</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Facteur d'activité usine</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 font-medium block">IPÉ Spécifique Global (Site)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.avgIpe.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">kWh/tonne</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Conforme à la trajectoire SER</span>
          </div>
        </div>
      </div>

      {/* CHRONOGRAMME AVEC CHOIX ET JUXTAPOSITION DES SÉRIES */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        
        {/* Titre & Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Chronogramme de Consommation & Facteurs d'Influence</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Juxtaposez plusieurs mesures simultanément pour comparer les dérives d'usages et les variables de procédé.
            </p>
          </div>

          {/* Raccourcis / Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Raccourcis :</span>
            <button
              onClick={() => setPreset('default')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
            >
              Défaut (Total + Froid + Air)
            </button>
            <button
              onClick={() => setPreset('kwh')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
            >
              Tous les UES (kWh)
            </button>
            <button
              onClick={() => setPreset('energy_vs_prod')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
            >
              Énergie vs Prod
            </button>
            <button
              onClick={() => setPreset('energy_vs_weather')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
            >
              Énergie vs Météo
            </button>
            <button
              onClick={() => setPreset('all')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] transition-colors"
            >
              Tout juxtaposer ({AVAILABLE_CHRONO_SERIES.length})
            </button>
          </div>
        </div>

        {/* 1. SÉLECTEUR INTERACTIF DES 9 VARIABLES À JUXTAPOSER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Données à juxtaposer sur le graphique ({selectedSeriesKeys.length} active(s)) :</span>
            </span>
            <span className="text-[11px] text-slate-400">Cliquez sur un bouton pour l'ajouter ou la masquer</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CHRONO_SERIES.map((s) => {
              const isSelected = selectedSeriesKeys.includes(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  style={{
                    borderColor: isSelected ? s.color : '#E2E8F0',
                    backgroundColor: isSelected ? `${s.color}15` : '#FFFFFF'
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    isSelected ? 'shadow-2xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span style={{ color: isSelected ? s.color : '#475569' }}>
                    {s.label}
                  </span>
                  {isSelected && (
                    <Check className="w-3 h-3 stroke-[3]" style={{ color: s.color }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. GRAPHIQUE SVG MULTI-SÉRIES */}
        <div className="relative overflow-hidden w-full pt-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Lignes horizontales de référence */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = chartHeight - padding.bottom - pct * usableHeight;
              const val = Math.round(pct * maxKwh);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
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

            {/* Tracé de toutes les courbes actives juxtaposées */}
            {activeSeriesPaths.map(s => (
              <path
                key={s.key}
                d={s.path}
                fill="none"
                stroke={s.color}
                strokeWidth={s.strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={hoverIndex !== null ? 0.9 : 1}
              />
            ))}

            {/* Guide vertical lors du survol */}
            {hoverIndex !== null && hoverIndex < filteredData.length && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={chartHeight - padding.bottom}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {activeSeriesPaths.map(s => (
                  <circle
                    key={s.key}
                    cx={getX(hoverIndex)}
                    cy={getY(Number(filteredData[hoverIndex][s.key]) || 0, s.key as keyof EnergyDataPoint)}
                    r="4.5"
                    fill={s.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                ))}
              </g>
            )}

            {/* Graduations sur l'axe X (Heures si vue journalière, ou Dates) */}
            {filteredData.length > 0 && [0, Math.floor(filteredData.length / 4), Math.floor(filteredData.length / 2), Math.floor((3 * filteredData.length) / 4), filteredData.length - 1].map(idx => {
              const item = filteredData[idx];
              if (!item) return null;
              const dateObj = new Date(item.timestamp);
              const label = windowMode === 'daily'
                ? `${dateObj.getHours().toString().padStart(2, '0')}h00`
                : `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

              return (
                <text
                  key={idx}
                  x={getX(idx)}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  className="font-mono"
                >
                  {label}
                </text>
              );
            })}

            {/* Zones interactives de détection du survol */}
            {filteredData.map((_, i) => (
              <rect
                key={i}
                x={getX(i) - (usableWidth / filteredData.length) / 2}
                y={padding.top}
                width={usableWidth / filteredData.length}
                height={usableHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                className="cursor-crosshair"
              />
            ))}
          </svg>

          {/* Infobulle dynamique multi-séries */}
          {hoverIndex !== null && hoverIndex < filteredData.length && (
            <div className="mt-3 p-3 bg-slate-950 text-white rounded-xl text-xs shadow-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-400">
                <span className="font-mono font-semibold text-white">
                  📅 {new Date(filteredData[hoverIndex].timestamp).toLocaleString('fr-FR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Point #{hoverIndex + 1}
                </span>
              </div>

              {/* Liste des valeurs juxtaposées pour ce point exact */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {activeSeriesPaths.map(s => {
                  const val = Number(filteredData[hoverIndex][s.key]) || 0;
                  return (
                    <div key={s.key} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                        <span className="text-[10px] text-slate-400 truncate">{s.shortLabel}</span>
                      </div>
                      <div className="font-mono font-bold text-white text-xs tabular-nums">
                        {val.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">{s.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profil 24h & Répartition UES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profil Moyen Journalier */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">
            Profil Moyen Journalier (Cycle 24h)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Charge moyenne en kW par heure du jour mettant en évidence les heures creuses (nuit) et pleines (postes jour).
          </p>

          <div className="h-44 flex items-end gap-1.5 pt-4">
            {hourlyProfile.map(item => {
              const heightPct = Math.round((item.avg / maxHourly) * 100);
              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {item.hour}h : {item.avg} kW
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-slate-800 hover:bg-emerald-600 transition-colors rounded-t"
                  />
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    {item.hour % 3 === 0 ? `${item.hour}h` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Répartition Énergétique par UES */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">
              Répartition Énergétique par Usages (Revue §6.3)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Poids relatif des installations consommatrices d'énergie dans le bilan global.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Centrale Froid Industriel (NH3)</span>
                  <span className="font-mono font-bold text-slate-900">{uesBreakdown.froid}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${uesBreakdown.froid}%` }} className="h-full bg-blue-600 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Fours & Lignes de Cuisson</span>
                  <span className="font-mono font-bold text-slate-900">{uesBreakdown.fours}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${uesBreakdown.fours}%` }} className="h-full bg-rose-600 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Centrale Air Comprimé</span>
                  <span className="font-mono font-bold text-slate-900">{uesBreakdown.air}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${uesBreakdown.air}%` }} className="h-full bg-emerald-600 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Auxiliaires & Bâtiments</span>
                  <span className="font-mono font-bold text-slate-900">{uesBreakdown.aux}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${uesBreakdown.aux}%` }} className="h-full bg-amber-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Couverture mesurée par sous-comptage direct : <strong>96.4%</strong> de l'énergie entrante.
          </div>
        </div>

      </div>
    </div>
  );
};
