import React, { useState, useMemo } from 'react';
import { EnergyDataPoint } from '../types/energy';
import { Download, Search, CheckCircle2, Filter } from 'lucide-react';

interface RawDataSectionProps {
  data: EnergyDataPoint[];
}

export const RawDataSection: React.FC<RawDataSectionProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [protoFilter, setProtoFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter & Sort
  const processedData = useMemo(() => {
    let result = [...data];

    if (protoFilter !== 'all') {
      result = result.filter(d => d.protocole_source.includes(protoFilter));
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.protocole_source.toLowerCase().includes(q) ||
        d.timestamp.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [data, protoFilter, searchTerm, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  // Export CSV avec Horodatage positionné en première colonne à gauche
  const handleExportCSV = () => {
    const headers = [
      "timestamp",
      "conso_totale_kwh",
      "conso_froid_kwh",
      "conso_compresseurs_kwh",
      "conso_fours_kwh",
      "conso_auxiliaires_kwh",
      "temperature_ext_degc",
      "volume_production_tonnes",
      "taux_charge_pct",
      "pression_air_bar",
      "dju_froid",
      "protocole_source"
    ];

    const rows = processedData.map(d => [
      `"${d.timestamp}"`,
      d.conso_totale_kwh,
      d.conso_froid_kwh,
      d.conso_compresseurs_kwh,
      d.conso_fours_kwh,
      d.conso_auxiliaires_kwh,
      d.temperature_ext_degc,
      d.volume_production_tonnes,
      d.taux_charge_pct,
      d.pression_air_bar,
      d.dju_froid,
      `"${d.protocole_source}"`
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `donnees_brutes_energetiques_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Données de Mesure Brutes Récupérées
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Enregistrement métrologique</span>
            <span aria-hidden="true">·</span>
            <span>{processedData.length} enregistrements filtrés sur {data.length}</span>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Barre d'outils et de filtres */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une mesure..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Filtre protocole */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Source :</span>
            <select
              value={protoFilter}
              onChange={(e) => {
                setProtoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
            >
              <option value="all">Toutes sources</option>
              <option value="OPC-UA">OPC-UA uniquement</option>
              <option value="MQTT">MQTT uniquement</option>
              <option value="Modbus">Modbus TCP</option>
            </select>
          </div>

          {/* Tri chronologique */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Ordre :</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
            >
              <option value="desc">Plus récent en premier</option>
              <option value="asc">Plus ancien en premier</option>
            </select>
          </div>
        </div>

        {/* Lignes par page */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Lignes :</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* TABLEAU INTERACTIF DES MESURES BRUTES */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                {/* 1 : TIMESTAMP POSITIONNÉ TOUT À GAUCHE */}
                <th className="p-3 text-left whitespace-nowrap bg-slate-200/70 text-slate-900 border-r border-slate-200 font-mono">
                  Timestamp (Horodatage)
                </th>

                {/* 2 à 11 : MESURES, CAPTEURS ET VARIABLES */}
                <th className="p-3 text-right whitespace-nowrap bg-slate-100/90 font-mono">Conso Totale (kWh)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-blue-700">Froid NH3 (kWh)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-emerald-700">Air Comprimé (kWh)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-rose-700">Fours Cuisson (kWh)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-amber-700">Auxiliaires (kWh)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-slate-800">T° Ext (°C)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-slate-800">Prod (t)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-slate-800">Charge (%)</th>
                <th className="p-3 text-right whitespace-nowrap font-mono text-slate-800">Pression (bar)</th>
                <th className="p-3 whitespace-nowrap text-slate-700">Protocole Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  {/* TIMESTAMP TOUT À GAUCHE */}
                  <td className="p-3 text-left font-mono font-semibold text-slate-900 bg-slate-50/70 border-r border-slate-200 whitespace-nowrap tabular-nums">
                    {new Date(d.timestamp).toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>

                  {/* Mesures et variables */}
                  <td className="p-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {d.conso_totale_kwh.toFixed(1)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800 tabular-nums">
                    {d.conso_froid_kwh.toFixed(1)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800 tabular-nums">
                    {d.conso_compresseurs_kwh.toFixed(1)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800 tabular-nums">
                    {d.conso_fours_kwh.toFixed(1)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800 tabular-nums">
                    {d.conso_auxiliaires_kwh.toFixed(1)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700 tabular-nums">
                    {d.temperature_ext_degc.toFixed(1)} °C
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700 tabular-nums">
                    {d.volume_production_tonnes.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700 tabular-nums">
                    {d.taux_charge_pct.toFixed(1)} %
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700 tabular-nums">
                    {d.pression_air_bar.toFixed(2)}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600 font-medium">
                    <span className="text-[11px] font-mono">{d.protocole_source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Page <strong className="text-slate-900">{currentPage}</strong> sur{' '}
            <strong className="text-slate-900">{totalPages}</strong> ({processedData.length} lignes au total)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 font-medium"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 font-medium"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
