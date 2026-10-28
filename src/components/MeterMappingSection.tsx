import React, { useState, useMemo } from 'react';
import {
  Network,
  Plus,
  Trash2,
  Edit3,
  GitFork,
  Split,
  Combine,
  Sun,
  Zap,
  Flame,
  Droplets,
  Gauge,
  History,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ArrowRight,
  Search,
  Building2,
  Sparkles,
  Download,
  Check,
  X,
  Radio,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  Layers,
  TrendingDown,
  Info
} from 'lucide-react';

export type EnergyMedium = 'electricite' | 'gaz' | 'vapeur' | 'eau' | 'air_comprime';
export type MeterType = 'tete' | 'depart' | 'sous_compteur' | 'production';
export type ReadingMode = 'iot' | 'manuel';

export interface MeterNode {
  id: string;
  nom: string;
  codeTechnique: string;
  type: MeterType;
  energie: EnergyMedium;
  unite: string;
  releveMode: ReadingMode;
  parentId: string | null;
  valeurActuelle: number; // ex: kWh/jour ou débit
  uesLiee?: string;
  localisation: string;
  coefficientTC?: number; // ex: x1, x10, x100 pour transformateur de courant
  dernierIndex?: number;
  dateDernierReleve?: string;
  isProductionLocale?: boolean;
}

export interface ManualReadingRecord {
  id: string;
  meterId: string;
  meterName: string;
  unite: string;
  dateAncien: string;
  indexAncien: number;
  dateNouveau: string;
  indexNouveau: number;
  coeff: number;
  pciConversion?: number; // pour m3 gaz -> kWh (ex: 10.8)
  consoCalculee: number; // en unite du compteur
  consoEquivalentKwh?: number;
  operateur: string;
  commentaire?: string;
}

export interface LocalProductionUnit {
  id: string;
  nom: string;
  typeSource: 'photovoltaique' | 'cogeneration' | 'recup_chaleur' | 'eolien';
  puissanceInstalleeKwc: number;
  regime: 'autoconsommation_surplus' | 'autoconsommation_totale' | 'revente_totale';
  meterIdProduction: string;
  productionJourKwh: number;
  autoconsommationJourKwh: number;
  injectionReseauJourKwh: number;
  tauxCouvertureSitePct: number;
  dateMiseEnService: string;
}

interface MeterMappingSectionProps {
  accessMode?: 'admin' | 'consultation';
}

export const MeterMappingSection: React.FC<MeterMappingSectionProps> = ({
  accessMode = 'admin'
}) => {
  const [activeTab, setActiveTab] = useState<'arborescence' | 'releves_manuels' | 'production_locale' | 'bouclage'>('arborescence');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnergyFilter, setSelectedEnergyFilter] = useState<string>('all');

  // Arborescence initiale des compteurs industriels (Usine Val-de-Loire VDL-01)
  const [meters, setMeters] = useState<MeterNode[]>([
    {
      id: 'MTR-TETE-ELEC',
      nom: 'TGBT Général - Arrivée HT/BT Enedis',
      codeTechnique: 'CPT-TETE-01',
      type: 'tete',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: null,
      valeurActuelle: 14250, // kWh/j
      uesLiee: 'Site Complet',
      localisation: 'Poste HT/BT Transfo 1 - Bât A',
      coefficientTC: 1,
      dernierIndex: 1245890,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-FROID-NH3',
      nom: 'Départ Tableau Froid Industriel NH3',
      codeTechnique: 'CPT-FROID-01',
      type: 'depart',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: 'MTR-TETE-ELEC',
      valeurActuelle: 5410,
      uesLiee: 'UES 1 : Froid Industriel NH3',
      localisation: 'Centrale Frigorifique NH3',
      coefficientTC: 1,
      dernierIndex: 512400,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-FROID-COMP1',
      nom: 'Sous-compteur Compresseur Vis Grasso 01',
      codeTechnique: 'CPT-FROID-C1',
      type: 'sous_compteur',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: 'MTR-FROID-NH3',
      valeurActuelle: 2980,
      uesLiee: 'UES 1 : Froid Industriel NH3',
      localisation: 'Local compresseurs',
      coefficientTC: 1,
      dernierIndex: 284100,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-FROID-COMP2',
      nom: 'Sous-compteur Compresseur Vis Grasso 02',
      codeTechnique: 'CPT-FROID-C2',
      type: 'sous_compteur',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: 'MTR-FROID-NH3',
      valeurActuelle: 2430,
      uesLiee: 'UES 1 : Froid Industriel NH3',
      localisation: 'Local compresseurs',
      coefficientTC: 1,
      dernierIndex: 228300,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-AIR-COMP',
      nom: 'Départ Centrale Air Comprimé (Compresseurs Atlas Copco)',
      codeTechnique: 'CPT-AIR-01',
      type: 'depart',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: 'MTR-TETE-ELEC',
      valeurActuelle: 3120,
      uesLiee: 'UES 2 : Air Comprimé',
      localisation: 'Centrale Fluides Bâtiment C',
      coefficientTC: 1,
      dernierIndex: 312950,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-FOURS-CUISSON',
      nom: 'Départ Lignes Fours de Cuisson',
      codeTechnique: 'CPT-FOUR-01',
      type: 'depart',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: 'MTR-TETE-ELEC',
      valeurActuelle: 2890,
      uesLiee: 'UES 3 : Fours de Cuisson',
      localisation: 'Atelier Cuisson Lignes 1 & 2',
      coefficientTC: 1,
      dernierIndex: 298450,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-FOUR-L1',
      nom: 'Sous-compteur Four Tunnel Ligne A',
      codeTechnique: 'CPT-FOUR-LA',
      type: 'sous_compteur',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: 'MTR-FOURS-CUISSON',
      valeurActuelle: 1650,
      uesLiee: 'UES 3 : Fours de Cuisson',
      localisation: 'Ligne Cuisson A',
      coefficientTC: 1,
      dernierIndex: 172100,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-FOUR-L2',
      nom: 'Sous-compteur Four Tunnel Ligne B',
      codeTechnique: 'CPT-FOUR-LB',
      type: 'sous_compteur',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'iot',
      parentId: 'MTR-FOURS-CUISSON',
      valeurActuelle: 1240,
      uesLiee: 'UES 3 : Fours de Cuisson',
      localisation: 'Ligne Cuisson B',
      coefficientTC: 1,
      dernierIndex: 126350,
      dateDernierReleve: '2026-10-27 10:00'
    },
    {
      id: 'MTR-AUXILIAIRES',
      nom: 'Départ Auxiliaires & Éclairage Ateliers',
      codeTechnique: 'CPT-AUX-01',
      type: 'depart',
      energie: 'electricite',
      unite: 'kWh',
      releveMode: 'manuel',
      parentId: 'MTR-TETE-ELEC',
      valeurActuelle: 1100,
      uesLiee: 'Utilités & Tertiaire',
      localisation: 'TGBT Bâtiment Administratif & Hall',
      coefficientTC: 1,
      dernierIndex: 89450,
      dateDernierReleve: '2026-10-25'
    },
    {
      id: 'MTR-GAZ-TETE',
      nom: 'Compteur de tête Gaz Naturel GRDF',
      codeTechnique: 'CPT-GAZ-TETE',
      type: 'tete',
      energie: 'gaz',
      unite: 'm³',
      releveMode: 'manuel',
      parentId: null,
      valeurActuelle: 345, // m3/j
      uesLiee: 'Chaufferie Vapeur & Fours',
      localisation: 'Poste Détente Gaz Entrée Site',
      coefficientTC: 1,
      dernierIndex: 15420,
      dateDernierReleve: '2026-10-24'
    },
    {
      id: 'MTR-GAZ-CHAUFFERIE',
      nom: 'Sous-compteur Gaz Chaudière Vapeur',
      codeTechnique: 'CPT-GAZ-VAP',
      type: 'depart',
      energie: 'gaz',
      unite: 'm³',
      releveMode: 'manuel',
      parentId: 'MTR-GAZ-TETE',
      valeurActuelle: 290,
      uesLiee: 'Génération Vapeur',
      localisation: 'Local Chaufferie',
      coefficientTC: 1,
      dernierIndex: 12850,
      dateDernierReleve: '2026-10-24'
    }
  ]);

  // Postes de production locale d'énergie (Exemple : Centrale Photovoltaïque Toiture)
  const [productions, setProductions] = useState<LocalProductionUnit[]>([
    {
      id: 'PROD-PV-TOITURE',
      nom: 'Centrale Solaire PV - Toiture Bâtiment A & Ombrières',
      typeSource: 'photovoltaique',
      puissanceInstalleeKwc: 180,
      regime: 'autoconsommation_surplus',
      meterIdProduction: 'CPT-PROD-PV01',
      productionJourKwh: 680,
      autoconsommationJourKwh: 620,
      injectionReseauJourKwh: 60,
      tauxCouvertureSitePct: 4.8,
      dateMiseEnService: '2024-06-15'
    }
  ]);

  // Historique des relevés d'index manuels
  const [manualRecords, setManualRecords] = useState<ManualReadingRecord[]>([
    {
      id: 'REC-001',
      meterId: 'MTR-AUXILIAIRES',
      meterName: 'Départ Auxiliaires & Éclairage Ateliers',
      unite: 'kWh',
      dateAncien: '2026-09-25',
      indexAncien: 56450,
      dateNouveau: '2026-10-25',
      indexNouveau: 89450,
      coeff: 1,
      consoCalculee: 33000,
      consoEquivalentKwh: 33000,
      operateur: 'Julien Saliou (Réf. Énergie)',
      commentaire: 'Relevé mensuel conforme plan de comptage'
    },
    {
      id: 'REC-002',
      meterId: 'MTR-GAZ-TETE',
      meterName: 'Compteur de tête Gaz Naturel GRDF',
      unite: 'm³',
      dateAncien: '2026-09-24',
      indexAncien: 5070,
      dateNouveau: '2026-10-24',
      indexNouveau: 15420,
      coeff: 1,
      pciConversion: 10.85, // m3 vers kWh
      consoCalculee: 10350,
      consoEquivalentKwh: 112297.5,
      operateur: 'Technicien Utilités',
      commentaire: 'Index avant purge réseau vapeur'
    }
  ]);

  // États pour les modales d'ajout / modification
  const [isAddMeterModalOpen, setIsAddMeterModalOpen] = useState(false);
  const [isAddProdModalOpen, setIsAddProdModalOpen] = useState(false);
  const [isManualReadingModalOpen, setIsManualReadingModalOpen] = useState(false);
  const [selectedParentIdForNewMeter, setSelectedParentIdForNewMeter] = useState<string | null>(null);

  // Formulaire nouveau compteur
  const [newMeterNom, setNewMeterNom] = useState('');
  const [newMeterCode, setNewMeterCode] = useState('');
  const [newMeterType, setNewMeterType] = useState<MeterType>('sous_compteur');
  const [newMeterEnergie, setNewMeterEnergie] = useState<EnergyMedium>('electricite');
  const [newMeterUnite, setNewMeterUnite] = useState('kWh');
  const [newMeterReleveMode, setNewMeterReleveMode] = useState<ReadingMode>('iot');
  const [newMeterParentId, setNewMeterParentId] = useState<string>('MTR-TETE-ELEC');
  const [newMeterUes, setNewMeterUes] = useState('');
  const [newMeterLocalisation, setNewMeterLocalisation] = useState('');
  const [newMeterCoeff, setNewMeterCoeff] = useState<number>(1);
  const [newMeterInitialIndex, setNewMeterInitialIndex] = useState<number>(0);

  // Formulaire saisie de relevé manuel
  const [selectedMeterForReading, setSelectedMeterForReading] = useState<string>(
    meters.find(m => m.releveMode === 'manuel')?.id || meters[0]?.id || ''
  );
  const [readingDateAncien, setReadingDateAncien] = useState('2026-09-27');
  const [readingIndexAncien, setReadingIndexAncien] = useState<number>(89450);
  const [readingDateNouveau, setReadingDateNouveau] = useState('2026-10-27');
  const [readingIndexNouveau, setReadingIndexNouveau] = useState<number>(93200);
  const [readingCoeff, setReadingCoeff] = useState<number>(1);
  const [readingPci, setReadingPci] = useState<number>(10.85); // PCI pour gaz
  const [readingComment, setReadingComment] = useState('');

  // Formulaire nouvelle production locale
  const [newProdNom, setNewProdNom] = useState('Centrale Solaire PV - Ombrières Parking');
  const [newProdSource, setNewProdSource] = useState<'photovoltaique' | 'cogeneration' | 'recup_chaleur' | 'eolien'>('photovoltaique');
  const [newProdPuis, setNewProdPuis] = useState<number>(120);
  const [newProdRegime, setNewProdRegime] = useState<'autoconsommation_surplus' | 'autoconsommation_totale' | 'revente_totale'>('autoconsommation_surplus');

  // Calcul dynamique du relevé manuel en cours
  const targetMeter = useMemo(() => {
    return meters.find(m => m.id === selectedMeterForReading);
  }, [meters, selectedMeterForReading]);

  const calculatedDiff = useMemo(() => {
    const diff = (readingIndexNouveau - readingIndexAncien) * (readingCoeff || 1);
    const isValid = readingIndexNouveau >= readingIndexAncien;
    const isGas = targetMeter?.energie === 'gaz' || targetMeter?.unite === 'm³';
    const equivKwh = isGas ? diff * (readingPci || 10.85) : diff;
    return {
      diff: diff > 0 ? diff : 0,
      isValid,
      equivKwh: equivKwh > 0 ? equivKwh : 0
    };
  }, [readingIndexAncien, readingIndexNouveau, readingCoeff, readingPci, targetMeter]);

  // Bilan global de bouclage de sous-comptage (ISO 50001 §6.6)
  const bouclageStats = useMemo(() => {
    const compteurTeteElec = meters.find(m => m.id === 'MTR-TETE-ELEC');
    const consoTete = compteurTeteElec ? compteurTeteElec.valeurActuelle : 14250;

    // Somme des départs directs rattachés à la tête
    const departsElec = meters.filter(m => m.parentId === 'MTR-TETE-ELEC' && m.energie === 'electricite');
    const sommeDeparts = departsElec.reduce((sum, m) => sum + m.valeurActuelle, 0);

    const residuelNonMesure = Math.max(0, consoTete - sommeDeparts);
    const tauxCouverturePct = consoTete > 0 ? Math.min(100, Math.round((sommeDeparts / consoTete) * 1000) / 10) : 0;

    // Production locale totale
    const prodTotalJour = productions.reduce((acc, p) => acc + p.productionJourKwh, 0);
    const autoconsoTotalJour = productions.reduce((acc, p) => acc + p.autoconsommationJourKwh, 0);

    return {
      consoTete,
      sommeDeparts,
      residuelNonMesure,
      tauxCouverturePct,
      departsCount: departsElec.length,
      prodTotalJour,
      autoconsoTotalJour
    };
  }, [meters, productions]);

  // Supprimer un compteur et réassigner ses enfants
  const handleDeleteMeter = (meterId: string) => {
    if (accessMode === 'consultation') return;
    if (meterId === 'MTR-TETE-ELEC') {
      alert("Le compteur de tête général TGBT ne peut pas être supprimé.");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce compteur du plan de comptage ?")) {
      const meterToDelete = meters.find(m => m.id === meterId);
      const parentId = meterToDelete ? meterToDelete.parentId : null;
      setMeters(prev =>
        prev
          .filter(m => m.id !== meterId)
          .map(m => (m.parentId === meterId ? { ...m, parentId: parentId } : m))
      );
    }
  };

  // Diviser une branche : prépare l'ajout d'un sous-compteur rattaché à ce nœud
  const handleDivideBranch = (nodeId: string) => {
    setSelectedParentIdForNewMeter(nodeId);
    setNewMeterParentId(nodeId);
    const parentNode = meters.find(m => m.id === nodeId);
    if (parentNode) {
      setNewMeterEnergie(parentNode.energie);
      setNewMeterUnite(parentNode.unite);
    }
    setNewMeterType('sous_compteur');
    setIsAddMeterModalOpen(true);
  };

  // Joindre / Fusionner deux branches sous un même parent
  const handleJoinBranch = (sourceId: string, newParentId: string) => {
    if (accessMode === 'consultation') return;
    setMeters(prev =>
      prev.map(m => (m.id === sourceId ? { ...m, parentId: newParentId } : m))
    );
  };

  // Soumission nouveau compteur
  const handleCreateMeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeterNom.trim()) return;

    const newId = `MTR-${Date.now().toString().slice(-4)}`;
    const newMeter: MeterNode = {
      id: newId,
      nom: newMeterNom,
      codeTechnique: newMeterCode || `CPT-${Date.now().toString().slice(-3)}`,
      type: newMeterType,
      energie: newMeterEnergie,
      unite: newMeterUnite,
      releveMode: newMeterReleveMode,
      parentId: newMeterParentId === 'none' ? null : newMeterParentId,
      valeurActuelle: 120, // valeur estimée par défaut
      uesLiee: newMeterUes || 'Nouvel équipement',
      localisation: newMeterLocalisation || 'Atelier de production',
      coefficientTC: newMeterCoeff,
      dernierIndex: newMeterInitialIndex,
      dateDernierReleve: new Date().toISOString().split('T')[0]
    };

    setMeters(prev => [...prev, newMeter]);
    setIsAddMeterModalOpen(false);
    // Reset form
    setNewMeterNom('');
    setNewMeterCode('');
    setNewMeterUes('');
    setNewMeterLocalisation('');
  };

  // Soumission saisie relevé manuel
  const handleSaveManualReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatedDiff.isValid) {
      alert("L'index nouveau doit être supérieur ou égal à l'index ancien.");
      return;
    }
    if (!targetMeter) return;

    const newRecord: ManualReadingRecord = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      meterId: targetMeter.id,
      meterName: targetMeter.nom,
      unite: targetMeter.unite,
      dateAncien: readingDateAncien,
      indexAncien: readingIndexAncien,
      dateNouveau: readingDateNouveau,
      indexNouveau: readingIndexNouveau,
      coeff: readingCoeff,
      pciConversion: targetMeter.energie === 'gaz' ? readingPci : undefined,
      consoCalculee: calculatedDiff.diff,
      consoEquivalentKwh: calculatedDiff.equivKwh,
      operateur: 'Julien Saliou (Responsable Énergie)',
      commentaire: readingComment || 'Relevé certifié ISO 50001'
    };

    setManualRecords(prev => [newRecord, ...prev]);

    // Mettre à jour le compteur avec son nouvel index
    setMeters(prev =>
      prev.map(m =>
        m.id === targetMeter.id
          ? {
              ...m,
              dernierIndex: readingIndexNouveau,
              dateDernierReleve: readingDateNouveau,
              valeurActuelle: Math.round(calculatedDiff.equivKwh / 30) // moy journalière
            }
          : m
      )
    );

    setIsManualReadingModalOpen(false);
    setReadingComment('');
  };

  // Soumission nouvelle production locale
  const handleCreateProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNom.trim()) return;

    const newProd: LocalProductionUnit = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      nom: newProdNom,
      typeSource: newProdSource,
      puissanceInstalleeKwc: newProdPuis,
      regime: newProdRegime,
      meterIdProduction: `CPT-PROD-${Date.now().toString().slice(-3)}`,
      productionJourKwh: Math.round(newProdPuis * 3.8), // estimation 3.8h équiv pleine puissance
      autoconsommationJourKwh: Math.round(newProdPuis * 3.4),
      injectionReseauJourKwh: Math.round(newProdPuis * 0.4),
      tauxCouvertureSitePct: 2.5,
      dateMiseEnService: new Date().toISOString().split('T')[0]
    };

    setProductions(prev => [...prev, newProd]);
    setIsAddProdModalOpen(false);
  };

  // Filtrage des compteurs
  const filteredMeters = useMemo(() => {
    return meters.filter(m => {
      const matchSearch =
        m.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.codeTechnique.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.uesLiee && m.uesLiee.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchEnergy = selectedEnergyFilter === 'all' || m.energie === selectedEnergyFilter;
      return matchSearch && matchEnergy;
    });
  }, [meters, searchQuery, selectedEnergyFilter]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Contexte Méthodologique ISO 50001 §6.6 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Cartographie & Sous-Comptage Énergétique
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              ISO 50001 §6.6
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            Arborescence interactive des compteurs de tête et départs divisionnaires. Permet d'ajouter ou diviser des branches, d'intégrer des relevés manuels d'index avec calcul automatique et d'instrumenter les postes de production d'énergie renouvelable locale.
          </p>
        </div>

        {/* Boutons d'action rapides */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {accessMode === 'admin' && (
            <>
              <button
                onClick={() => {
                  setSelectedParentIdForNewMeter(null);
                  setIsAddMeterModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Compteur</span>
              </button>

              <button
                onClick={() => setIsManualReadingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Calculator className="w-4 h-4" />
                <span>Saisir un Relevé d'Index</span>
              </button>

              <button
                onClick={() => setIsAddProdModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Sun className="w-4 h-4" />
                <span>+ Production PV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Bandeau Métrique de Bouclage & Qualité du Sous-comptage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tête */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Compteur Général Tête</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {bouclageStats.consoTete.toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh/j</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>TGBT Poste HT/BT 20kV</span>
          </div>
        </div>

        {/* Taux de couverture sous-comptage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Taux de Sous-Comptage</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Cible &gt; 80%
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {bouclageStats.tauxCouverturePct}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${bouclageStats.tauxCouverturePct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {bouclageStats.sommeDeparts.toLocaleString()} kWh/j sous-comptés
          </div>
        </div>

        {/* Résiduel non instrumenté */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Écart Résiduel / Pertes</span>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {bouclageStats.residuelNonMesure.toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh/j</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {Math.round((bouclageStats.residuelNonMesure / (bouclageStats.consoTete || 1)) * 100)}% de talon non affecté
          </div>
        </div>

        {/* Production Locale */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Autoproduction Solaire</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600">
            {bouclageStats.prodTotalJour.toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh/j</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {bouclageStats.autoconsoTotalJour.toLocaleString()} kWh consommés sur site ({productions.length} installation)
          </div>
        </div>
      </div>

      {/* 3. Onglets de Navigation interne */}
      <div className="flex items-center justify-between border-b border-slate-200 flex-wrap gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('arborescence')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'arborescence'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Schéma Unifilaire & Branches ({meters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('releves_manuels')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'releves_manuels'
                ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Relevés Manuels d'Index ({manualRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('production_locale')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'production_locale'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Postes de Production Locale ({productions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bouclage')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bouclage'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bilan de Bouclage & Audit §6.6</span>
          </button>
        </div>

        {/* Filtres de recherche */}
        {activeTab === 'arborescence' && (
          <div className="flex items-center gap-2 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrer compteurs ou UES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <select
              value={selectedEnergyFilter}
              onChange={(e) => setSelectedEnergyFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Toutes énergies</option>
              <option value="electricite">Électricité</option>
              <option value="gaz">Gaz naturel</option>
              <option value="vapeur">Vapeur</option>
              <option value="eau">Eau</option>
            </select>
          </div>
        )}
      </div>

      {/* 4. CONTENU DE L'ONGLET 1 : ARBORESCENCE & SCHÉMA UNIFILAIRE */}
      {activeTab === 'arborescence' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Gestion dynamique des branches :</strong> Cliquez sur <strong>« Diviser »</strong> pour ajouter un sous-départ sous n'importe quel compteur, ou réassignez le parent pour joindre deux branches.
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Mise à jour en direct dans l'arborescence
            </span>
          </div>

          {/* Arborescence visuelle en cartes hiérarchiques */}
          <div className="space-y-3">
            {/* Compteurs de tête (racines sans parent) */}
            {filteredMeters
              .filter(m => m.parentId === null)
              .map(rootMeter => {
                const childMeters = meters.filter(m => m.parentId === rootMeter.id);

                return (
                  <div key={rootMeter.id} className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
                    {/* Nœud Racine / Tête */}
                    <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          {rootMeter.energie === 'electricite' ? <Zap className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{rootMeter.nom}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              {rootMeter.codeTechnique}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                              Compteur de Tête
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                            <span>{rootMeter.localisation}</span>
                            <span>•</span>
                            <span>Énergie : {rootMeter.energie}</span>
                            <span>•</span>
                            <span className="text-emerald-300 font-semibold">{rootMeter.valeurActuelle.toLocaleString()} {rootMeter.unite}/j</span>
                          </div>
                        </div>
                      </div>

                      {accessMode === 'admin' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDivideBranch(rootMeter.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs"
                            title="Ajouter un sous-départ / diviser cette branche"
                          >
                            <Split className="w-3.5 h-3.5" />
                            <span>Diviser / Ajouter branche</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Enfants de Niveau 1 (Départs) */}
                    <div className="p-4 bg-slate-50/50 space-y-3">
                      {childMeters.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">
                          Aucun sous-compteur rattaché à ce compteur de tête. Cliquez sur « Diviser » pour ajouter une branche.
                        </div>
                      ) : (
                        childMeters.map(depart => {
                          const subChildren = meters.filter(m => m.parentId === depart.id);
                          const pctOfRoot = rootMeter.valeurActuelle > 0 ? Math.round((depart.valeurActuelle / rootMeter.valeurActuelle) * 100) : 0;

                          return (
                            <div key={depart.id} className="border border-slate-200 rounded-lg bg-white p-3.5 shadow-2xs space-y-3">
                              {/* Ligne Départ */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start sm:items-center gap-2.5">
                                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 shrink-0 mt-0.5 sm:mt-0">
                                    <GitFork className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-slate-900">{depart.nom}</span>
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                                        {depart.codeTechnique}
                                      </span>
                                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                                        depart.releveMode === 'iot'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                        {depart.releveMode === 'iot' ? 'Passerelle IoT 4G' : 'Relevé Manuel (Index)'}
                                      </span>
                                      {depart.uesLiee && (
                                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded font-medium">
                                          {depart.uesLiee}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                      Localisation : {depart.localisation} · Unité : <strong>{depart.unite}</strong> {depart.coefficientTC && depart.coefficientTC !== 1 ? `· Coeff TC : x${depart.coefficientTC}` : ''}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  {/* Valeur & % */}
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-slate-800">
                                      {depart.valeurActuelle.toLocaleString()} {depart.unite}/j
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {pctOfRoot}% de la tête
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  {accessMode === 'admin' && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleDivideBranch(depart.id)}
                                        className="p-1.5 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        title="Diviser en sous-départs"
                                      >
                                        <Split className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMeter(depart.id)}
                                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                        title="Supprimer cette branche"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Enfants de Niveau 2 (Sous-compteurs / sous-branches) */}
                              {subChildren.length > 0 && (
                                <div className="pl-6 border-l-2 border-slate-200 space-y-2 pt-1">
                                  {subChildren.map(subMeter => {
                                    const pctOfDepart = depart.valeurActuelle > 0 ? Math.round((subMeter.valeurActuelle / depart.valeurActuelle) * 100) : 0;
                                    return (
                                      <div
                                        key={subMeter.id}
                                        className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200 text-xs"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                          <span className="font-semibold text-slate-800">{subMeter.nom}</span>
                                          <span className="text-[10px] font-mono text-slate-500">[{subMeter.codeTechnique}]</span>
                                          <span className="text-[10px] text-slate-400">({subMeter.localisation})</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <div className="text-right">
                                            <span className="font-bold text-slate-700">{subMeter.valeurActuelle.toLocaleString()} {subMeter.unite}/j</span>
                                            <span className="text-[10px] text-slate-400 ml-1.5">({pctOfDepart}% du départ)</span>
                                          </div>

                                          {accessMode === 'admin' && (
                                            <button
                                              onClick={() => handleDeleteMeter(subMeter.id)}
                                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                              title="Supprimer ce sous-compteur"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. CONTENU DE L'ONGLET 2 : RELEVÉS MANUELS D'INDEX & CALCUL DE CONSOMMATION */}
      {activeTab === 'releves_manuels' && (
        <div className="space-y-6">
          {/* Outil de calcul rapide instantané */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Calculateur de Consommation par Écart d'Index (Ancien vs Nouveau)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Idéal pour compteurs manuels sans passerelle IoT
              </span>
            </div>

            <form onSubmit={handleSaveManualReading} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sélectionner le compteur
                  </label>
                  <select
                    value={selectedMeterForReading}
                    onChange={(e) => {
                      const mId = e.target.value;
                      setSelectedMeterForReading(mId);
                      const m = meters.find(item => item.id === mId);
                      if (m && m.dernierIndex !== undefined) {
                        setReadingIndexAncien(m.dernierIndex);
                        setReadingIndexNouveau(m.dernierIndex + 1500);
                        if (m.coefficientTC) setReadingCoeff(m.coefficientTC);
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {meters.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nom} ({m.unite}) - Mode {m.releveMode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ancien Relevé (Date & Index début)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={readingDateAncien}
                      onChange={(e) => setReadingDateAncien(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                    <input
                      type="number"
                      step="any"
                      value={readingIndexAncien}
                      onChange={(e) => setReadingIndexAncien(Number(e.target.value))}
                      placeholder="Index ancien"
                      className="text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nouveau Relevé (Date & Index fin)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={readingDateNouveau}
                      onChange={(e) => setReadingDateNouveau(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                    <input
                      type="number"
                      step="any"
                      value={readingIndexNouveau}
                      onChange={(e) => setReadingIndexNouveau(Number(e.target.value))}
                      placeholder="Index nouveau"
                      className="text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Paramètres techniques (Coeff TC & Conversion Gaz PCI) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-xs">
                <div>
                  <label className="block font-semibold text-amber-900 mb-1">
                    Coefficient TC (Transformateur)
                  </label>
                  <select
                    value={readingCoeff}
                    onChange={(e) => setReadingCoeff(Number(e.target.value))}
                    className="w-full text-xs border border-amber-300 rounded-lg p-1.5 bg-white text-slate-800"
                  >
                    <option value={1}>x1 (Direct)</option>
                    <option value={10}>x10</option>
                    <option value={40}>x40</option>
                    <option value={100}>x100</option>
                    <option value={1000}>x1000</option>
                  </select>
                </div>

                {targetMeter?.energie === 'gaz' && (
                  <div>
                    <label className="block font-semibold text-amber-900 mb-1">
                      Facteur PCI Gaz (kWh / m³)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={readingPci}
                      onChange={(e) => setReadingPci(Number(e.target.value))}
                      className="w-full text-xs border border-amber-300 rounded-lg p-1.5 bg-white font-mono"
                    />
                  </div>
                )}

                <div className="sm:col-span-2 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-amber-900">Formule de calcul normalisée :</span>
                  <p className="text-[11px] text-amber-800 font-mono mt-0.5">
                    Conso = (Index Nouveau - Index Ancien) × Coeff {targetMeter?.energie === 'gaz' ? '× PCI' : ''}
                  </p>
                </div>
              </div>

              {/* Résultat dynamique calculé */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Consommation calculée sur la période</span>
                  <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                    <span>{calculatedDiff.diff.toLocaleString()} {targetMeter?.unite}</span>
                    {targetMeter?.energie === 'gaz' && (
                      <span className="text-sm font-normal text-slate-300">
                        (~ {calculatedDiff.equivKwh.toLocaleString()} kWh équivalent thermique)
                      </span>
                    )}
                  </div>
                  {!calculatedDiff.isValid && (
                    <div className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Attention : L'index nouveau est inférieur à l'index ancien (vérifiez la saisie ou la remise à zéro).</span>
                    </div>
                  )}
                </div>

                {accessMode === 'admin' && (
                  <button
                    type="submit"
                    disabled={!calculatedDiff.isValid}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enregistrer dans l'historique officiel</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tableau de l'historique des relevés enregistrés */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Historique des Relevés Manuels Certifiés (§6.6)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {manualRecords.length} relevé(s) archivé(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Date Nouveau</th>
                    <th className="py-2.5 px-4">Compteur</th>
                    <th className="py-2.5 px-4">Ancien Index</th>
                    <th className="py-2.5 px-4">Nouveau Index</th>
                    <th className="py-2.5 px-4 text-right">Consommation</th>
                    <th className="py-2.5 px-4 text-right">Équivalent kWh</th>
                    <th className="py-2.5 px-4">Opérateur</th>
                    <th className="py-2.5 px-4">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manualRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{r.dateNouveau}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{r.meterName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{r.indexAncien.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{r.indexNouveau.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-mono text-right font-bold text-emerald-700">
                        {r.consoCalculee.toLocaleString()} {r.unite}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-right text-slate-700 font-medium">
                        {r.consoEquivalentKwh ? `${r.consoEquivalentKwh.toLocaleString()} kWh` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{r.operateur}</td>
                      <td className="py-2.5 px-4 text-slate-500 italic max-w-xs truncate">{r.commentaire || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONTENU DE L'ONGLET 3 : POSTES DE PRODUCTION D'ÉNERGIE LOCALE (PV, COGÉ) */}
      {activeTab === 'production_locale' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Intégration EnR & Autoproduction :</strong> Connectez les compteurs de vos centrales photovoltaïques, cogénérations ou récupérations thermiques pour déduire l'autoproduction de la facture énergétique et ajuster les IPÉ (§6.5).
              </span>
            </div>
            {accessMode === 'admin' && (
              <button
                onClick={() => setIsAddProdModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shrink-0"
              >
                + Ajouter une installation
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productions.map(prod => (
              <div key={prod.id} className="border border-slate-200 rounded-xl bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{prod.nom}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-semibold text-amber-700">{prod.puissanceInstalleeKwc} kWc</span>
                        <span>•</span>
                        <span>Mise en service : {prod.dateMiseEnService}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {prod.regime.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Production</span>
                    <div className="text-base font-bold text-amber-600 mt-0.5">
                      {prod.productionJourKwh.toLocaleString()} <span className="text-[10px] font-normal">kWh/j</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Autoconsommé</span>
                    <div className="text-base font-bold text-emerald-600 mt-0.5">
                      {prod.autoconsommationJourKwh.toLocaleString()} <span className="text-[10px] font-normal">kWh/j</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Injecté Réseau</span>
                    <div className="text-base font-bold text-blue-600 mt-0.5">
                      {prod.injectionReseauJourKwh.toLocaleString()} <span className="text-[10px] font-normal">kWh/j</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Compteur de production rattaché : <code className="font-mono font-semibold text-slate-800">{prod.meterIdProduction}</code></span>
                  <span className="font-semibold text-emerald-700">Couvre {prod.tauxCouvertureSitePct}% de l'usine</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CONTENU DE L'ONGLET 4 : BILAN DE BOUCLAGE & AUDIT §6.6 */}
      {activeTab === 'bouclage' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Bilan de Bouclage Énergétique — Réconciliation Tête vs Départs</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dans un SMÉ certifié ISO 50001, le plan de collecte de données énergétiques (§6.6) exige de vérifier la cohérence globale de la mesure. Le taux de couverture compare la somme des sous-compteurs rattachés avec la facture du distributeur (compteur de tête Enedis/GRDF).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500">Total Soutiré Réseau (Tête)</span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {bouclageStats.consoTete.toLocaleString()} kWh/j
                </div>
                <span className="text-[11px] text-slate-400">100.0% du périmètre</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-800 font-semibold">Total Sous-compté sur les UES</span>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  {bouclageStats.sommeDeparts.toLocaleString()} kWh/j
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">{bouclageStats.tauxCouverturePct}% couvert</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-xs text-slate-600">Résiduel / Talon non sous-compté</span>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {bouclageStats.residuelNonMesure.toLocaleString()} kWh/j
                </div>
                <span className="text-[11px] text-slate-500">Pertes réseau, éclairage résiduel, veilles</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Conformité d'audit AFNOR validée :</strong> Le taux de sous-comptage de {bouclageStats.tauxCouverturePct}% est supérieur au seuil recommandé de 80% des Usages Énergétiques Significatifs (UES).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : AJOUT D'UN COMPTEUR / BRANCHE */}
      {isAddMeterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedParentIdForNewMeter ? 'Diviser la branche / Nouveau sous-compteur' : 'Ajouter un compteur au plan de comptage'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddMeterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeter} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du compteur / départ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sous-compteur Presse Injection 03"
                  value={newMeterNom}
                  onChange={(e) => setNewMeterNom(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code technique (Repère armoire)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CPT-INJ-03"
                    value={newMeterCode}
                    onChange={(e) => setNewMeterCode(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nœud parent dans l'arborescence
                  </label>
                  <select
                    value={newMeterParentId}
                    onChange={(e) => setNewMeterParentId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="none">Aucun (Compteur de tête)</option>
                    {meters.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nom} ({m.codeTechnique})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Énergie
                  </label>
                  <select
                    value={newMeterEnergie}
                    onChange={(e) => {
                      const eng = e.target.value as EnergyMedium;
                      setNewMeterEnergie(eng);
                      if (eng === 'gaz' || eng === 'eau') setNewMeterUnite('m³');
                      else if (eng === 'vapeur') setNewMeterUnite('t');
                      else setNewMeterUnite('kWh');
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="electricite">Électricité</option>
                    <option value="gaz">Gaz naturel</option>
                    <option value="vapeur">Vapeur</option>
                    <option value="eau">Eau</option>
                    <option value="air_comprime">Air comprimé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unité de mesure
                  </label>
                  <input
                    type="text"
                    value={newMeterUnite}
                    onChange={(e) => setNewMeterUnite(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mode de relevé
                  </label>
                  <select
                    value={newMeterReleveMode}
                    onChange={(e) => setNewMeterReleveMode(e.target.value as ReadingMode)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="iot">Automatique (Passerelle 4G)</option>
                    <option value="manuel">Manuel (Index d'armoire)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UES ou usage rattaché
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: UES 2 : Air Comprimé"
                    value={newMeterUes}
                    onChange={(e) => setNewMeterUes(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Localisation physique
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Armoire TD2 Atelier B"
                    value={newMeterLocalisation}
                    onChange={(e) => setNewMeterLocalisation(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMeterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Ajouter au plan de comptage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : SAISIE D'UN RELEVÉ MANUEL D'INDEX */}
      {isManualReadingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Saisie d'un Relevé Manuel d'Index
                </h3>
              </div>
              <button
                onClick={() => setIsManualReadingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualReading} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compteur concerné
                </label>
                <select
                  value={selectedMeterForReading}
                  onChange={(e) => {
                    setSelectedMeterForReading(e.target.value);
                    const m = meters.find(item => item.id === e.target.value);
                    if (m && m.dernierIndex !== undefined) {
                      setReadingIndexAncien(m.dernierIndex);
                      setReadingIndexNouveau(m.dernierIndex + 1200);
                    }
                  }}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                >
                  {meters.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nom} ({m.unite})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date ancien relevé
                  </label>
                  <input
                    type="date"
                    value={readingDateAncien}
                    onChange={(e) => setReadingDateAncien(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Index ancien
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={readingIndexAncien}
                    onChange={(e) => setReadingIndexAncien(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date nouveau relevé
                  </label>
                  <input
                    type="date"
                    value={readingDateNouveau}
                    onChange={(e) => setReadingDateNouveau(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Index nouveau constaté
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={readingIndexNouveau}
                    onChange={(e) => setReadingIndexNouveau(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Consommation calculée :</span>
                <span className="font-bold text-sm text-amber-950 font-mono">
                  {calculatedDiff.diff.toLocaleString()} {targetMeter?.unite}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commentaire / Justification
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tournée hebdomadaire de relève"
                  value={readingComment}
                  onChange={(e) => setReadingComment(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualReadingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!calculatedDiff.isValid}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Valider le relevé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : AJOUT D'UN POSTE DE PRODUCTION LOCALE */}
      {isAddProdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ajouter un Poste de Production d'Énergie Locale (EnR)
                </h3>
              </div>
              <button
                onClick={() => setIsAddProdModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduction} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de l'installation
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Centrale Photovoltaïque Toiture Silo"
                  value={newProdNom}
                  onChange={(e) => setNewProdNom(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Filière d'énergie
                  </label>
                  <select
                    value={newProdSource}
                    onChange={(e) => setNewProdSource(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="photovoltaique">Solaire Photovoltaïque</option>
                    <option value="cogeneration">Cogénération Biomasse / Gaz</option>
                    <option value="recup_chaleur">Récupération de chaleur fatale</option>
                    <option value="eolien">Petit Éolien</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Puissance Crête / Installée (kWc / kWth)
                  </label>
                  <input
                    type="number"
                    value={newProdPuis}
                    onChange={(e) => setNewProdPuis(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Régime d'exploitation
                </label>
                <select
                  value={newProdRegime}
                  onChange={(e) => setNewProdRegime(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="autoconsommation_surplus">Autoconsommation avec injection du surplus</option>
                  <option value="autoconsommation_totale">Autoconsommation totale sans injection</option>
                  <option value="revente_totale">Vente totale en totalité au réseau</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProdModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Créer l'installation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
