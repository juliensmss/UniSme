import React, { useState, useEffect } from 'react';
import { EnergyDataPoint } from '../types/energy';
import { Upload, Cpu, Radio, Play, Pause, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { generateInitialEnergyData } from '../data/initialData';

interface IngestionSectionProps {
  data: EnergyDataPoint[];
  setData: React.Dispatch<React.SetStateAction<EnergyDataPoint[]>>;
}

export const IngestionSection: React.FC<IngestionSectionProps> = ({ data, setData }) => {
  const [opcActive, setOpcActive] = useState(true);
  const [mqttActive, setMqttActive] = useState(true);
  const [autoStream, setAutoStream] = useState(false);
  const [streamFrequency, setStreamFrequency] = useState(3);
  const [recentPackets, setRecentPackets] = useState<Array<{ id: string; time: string; proto: string; power: number }>>([
    { id: 'pkt-101', time: new Date().toLocaleTimeString(), proto: 'OPC-UA (S7-1500)', power: 174.2 },
    { id: 'pkt-102', time: new Date(Date.now() - 4000).toLocaleTimeString(), proto: 'MQTT (Sparkplug B)', power: 168.8 },
    { id: 'pkt-103', time: new Date(Date.now() - 8000).toLocaleTimeString(), proto: 'OPC-UA (S7-1500)', power: 182.1 }
  ]);

  // Inject a single measurement
  const injectMeasurement = () => {
    const lastPoint = data[data.length - 1];
    const lastDate = lastPoint ? new Date(lastPoint.timestamp) : new Date();
    const newDate = new Date(lastDate.getTime() + 3600 * 1000);

    const tempExt = Math.round((16.0 + (Math.random() - 0.5) * 4) * 10) / 10;
    const prod = Math.round(Math.max(0, 18.0 + (Math.random() - 0.5) * 5) * 100) / 100;
    const charge = Math.round(Math.min(100, (prod / 25) * 100) * 10) / 10;
    const pression = Math.round((6.8 + (Math.random() - 0.5) * 0.2) * 100) / 100;

    const froid = Math.round((45 + 3.8 * Math.max(0, tempExt) + 1.2 * prod + (Math.random() - 0.5) * 4) * 100) / 100;
    const air = Math.round((35 + 4.2 * prod + (Math.random() - 0.5) * 3) * 100) / 100;
    const fours = Math.round((60 + 8.5 * prod + (Math.random() - 0.5) * 6) * 100) / 100;
    const aux = Math.round((25 + 0.3 * prod + (Math.random() - 0.5) * 2) * 100) / 100;
    const total = Math.round((froid + air + fours + aux) * 100) / 100;

    const proto: EnergyDataPoint['protocole_source'] = opcActive
      ? 'OPC-UA (Direct Push)'
      : 'MQTT (Sensor Stream)';

    const newPoint: EnergyDataPoint = {
      id: `meas-${data.length + 1}`,
      conso_totale_kwh: total,
      conso_froid_kwh: froid,
      conso_compresseurs_kwh: air,
      conso_fours_kwh: fours,
      conso_auxiliaires_kwh: aux,
      temperature_ext_degc: tempExt,
      volume_production_tonnes: prod,
      taux_charge_pct: charge,
      pression_air_bar: pression,
      dju_froid: Math.round(Math.max(0, tempExt - 18) * 100) / 100,
      protocole_source: proto,
      timestamp: newDate.toISOString() // Strictly far right in the table
    };

    setData(prev => [...prev, newPoint]);
    setRecentPackets(prev => [
      { id: `pkt-${Date.now()}`, time: new Date().toLocaleTimeString(), proto, power: total },
      ...prev.slice(0, 5)
    ]);
  };

  // Auto-stream effect
  useEffect(() => {
    if (!autoStream) return;
    const timer = setInterval(() => {
      injectMeasurement();
    }, streamFrequency * 1000);
    return () => clearInterval(timer);
  }, [autoStream, streamFrequency, data]);

  // CSV File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) return;

        const separator = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

        const parsedData: EnergyDataPoint[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
          if (values.length < headers.length) continue;

          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx];
          });

          const total = parseFloat(rowObj['conso_totale_kwh'] || '150');
          const froid = parseFloat(rowObj['conso_froid_kwh'] || '60');
          const air = parseFloat(rowObj['conso_compresseurs_kwh'] || '40');
          const fours = parseFloat(rowObj['conso_fours_kwh'] || '80');
          const aux = parseFloat(rowObj['conso_auxiliaires_kwh'] || '20');

          parsedData.push({
            id: `import-${i}`,
            conso_totale_kwh: isNaN(total) ? 150 : total,
            conso_froid_kwh: isNaN(froid) ? 60 : froid,
            conso_compresseurs_kwh: isNaN(air) ? 40 : air,
            conso_fours_kwh: isNaN(fours) ? 80 : fours,
            conso_auxiliaires_kwh: isNaN(aux) ? 20 : aux,
            temperature_ext_degc: parseFloat(rowObj['temperature_ext_degc'] || '15'),
            volume_production_tonnes: parseFloat(rowObj['volume_production_tonnes'] || '18'),
            taux_charge_pct: parseFloat(rowObj['taux_charge_pct'] || '75'),
            pression_air_bar: parseFloat(rowObj['pression_air_bar'] || '6.8'),
            dju_froid: parseFloat(rowObj['dju_froid'] || '0'),
            protocole_source: 'Fichier Importé',
            timestamp: rowObj['timestamp'] || new Date().toISOString()
          });
        }

        if (parsedData.length > 0) {
          setData(parsedData);
          alert(`Importation réussie : ${parsedData.length} lignes de mesures intégrées avec succès.`);
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier CSV. Assurez-vous d'un format délimité valide.");
      }
    };
    reader.readAsText(file);
  };

  const resetStandardData = () => {
    setData(generateInitialEnergyData(45));
    setAutoStream(false);
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Ingestion Multi-Sources & Passerelles Industrielles
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Protocoles ouverts : OPC UA & MQTT</span>
            <span aria-hidden="true">·</span>
            <span>Import CSV / Excel</span>
            <span aria-hidden="true">·</span>
            <span>{data.length} mesures en mémoire</span>
          </div>
        </div>

        <button
          onClick={resetStandardData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Régénérer jeu étalon (45 jours)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Import de fichiers */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Importation de fichiers (CSV / Excel)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Format délimité</span>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Chargez vos fichiers de relevés énergétiques issus de centrales d'acquisition ou de télé-relève fournisseur.
          </p>

          <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-800">Cliquez pour téléverser un fichier CSV ou Excel</span>
            <span className="text-[11px] text-slate-500 mt-1">Colonnes acceptées : consommations UES, production, température, timestamp</span>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">Règle de normalisation automatique :</span>
            Quel que soit l'ordre des colonnes dans le fichier importé, la plateforme garantit que les variables de mesure se placent à gauche et que le <code>timestamp</code> est repositionné tout à droite.
          </div>
        </div>

        {/* Module 2: Passerelles IoT & Protocoles Ouverts */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Passerelles Industrielles Connectées
              </h3>
              <span className="text-xs text-slate-400 font-mono">Simulateur Actif</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Liaisons aux automates programmables et capteurs connectés d'usine sans serveur intermédiaire lourd.
            </p>

            <div className="space-y-3">
              {/* OPC UA */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Serveur OPC UA (IEC 62541)</span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Connecté</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    opc.tcp://192.168.1.120:4840/SiemensS7-1500
                  </p>
                </div>
                <button
                  onClick={() => setOpcActive(!opcActive)}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    opcActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {opcActive ? 'Actif' : 'Pause'}
                </button>
              </div>

              {/* MQTT */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Broker MQTT (Sparkplug B)</span>
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">Connecté</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    mqtt://broker.industrial-iot.local:1883/factory/#
                  </p>
                </div>
                <button
                  onClick={() => setMqttActive(!mqttActive)}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    mqttActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {mqttActive ? 'Actif' : 'Pause'}
                </button>
              </div>
            </div>
          </div>

          {/* Contrôles de simulation temps réel */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={injectMeasurement}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
              >
                + Injecter 1 mesure
              </button>
              <button
                onClick={() => setAutoStream(!autoStream)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  autoStream
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {autoStream ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{autoStream ? 'Arrêter le flux continu' : 'Flux continu'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Cadence :</span>
              <select
                value={streamFrequency}
                onChange={(e) => setStreamFrequency(Number(e.target.value))}
                className="bg-slate-100 border border-slate-300 rounded px-1.5 py-1 text-xs"
              >
                <option value={1}>1 seconde</option>
                <option value={3}>3 secondes</option>
                <option value={5}>5 secondes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trames récentes en direct */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4 text-slate-600" />
          Journal d'Acquisition des Trames Télémesure Récentes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentPackets.map((pkt) => (
            <div key={pkt.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center">
              <div>
                <span className="font-mono text-[11px] text-slate-500">{pkt.time}</span>
                <p className="font-semibold text-slate-900 mt-0.5">{pkt.proto}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">{pkt.power} kW</span>
                <span className="block text-[10px] text-emerald-600">Reçu OK</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
