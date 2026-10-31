import React, { useState, useMemo } from 'react';
import {
  UESItem,
  IPEItem,
  ActionItem,
  AuditItem,
  NonConformiteItem,
  SWOTItem,
  StakeholderDetailedItem,
  RACIItem,
  RACIRole,
  EnergyPolicy,
  CompetenceProofItem
} from '../types/energy';
import { initialPolicy, initialRACI, initialCompetences } from '../data/initialData';
import { DistanceNormeSection } from './DistanceNormeSection';
import { TableColumnFilter } from './TableColumnFilter';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  User,
  Target,
  Shield,
  ShieldCheck,
  Layers,
  FileText,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ExternalLink,
  Edit3,
  Check,
  Building,
  Users,
  Upload,
  Link as LinkIcon,
  FileCheck,
  Printer,
  RotateCcw,
  Trash2,
  Paperclip,
  Download,
  Copy,
  Eye,
  Award,
  CheckSquare,
  Search,
  Filter,
  Lock,
  Activity,
  BarChart2,
  Network,
  CalendarCheck,
  X
} from 'lucide-react';

export interface EnergyObjectiveItem {
  id: string;
  titre: string;
  ues: string;
  cibleChiffree: string;
  echeance: string;
  responsable: string;
  statut: 'En cours' | 'Atteint' | 'Planifié' | 'À risque';
  indicateurIpeLie: string;
  actionLieeId?: string;
  gainViseKwh?: number;
}

interface PDCASectionProps {
  uesList: UESItem[];
  ipeList: IPEItem[];
  actions: ActionItem[];
  setActions: React.Dispatch<React.SetStateAction<ActionItem[]>>;
  audits: AuditItem[];
  nonConformites: NonConformiteItem[];
  setNonConformites: React.Dispatch<React.SetStateAction<NonConformiteItem[]>>;
  stakeholders: StakeholderDetailedItem[];
  setStakeholders: React.Dispatch<React.SetStateAction<StakeholderDetailedItem[]>>;
  swotItems: SWOTItem[];
  setSwotItems: React.Dispatch<React.SetStateAction<SWOTItem[]>>;
  policy?: EnergyPolicy;
  setPolicy?: React.Dispatch<React.SetStateAction<EnergyPolicy>>;
  raciItems?: RACIItem[];
  setRaciItems?: React.Dispatch<React.SetStateAction<RACIItem[]>>;
  competences?: CompetenceProofItem[];
  setCompetences?: React.Dispatch<React.SetStateAction<CompetenceProofItem[]>>;
  step?: 'intro' | 'plan' | 'do' | 'check' | 'act';
  onStepChange?: (step: 'intro' | 'plan' | 'do' | 'check' | 'act') => void;
  onRequestCreateActionFromRisk?: (riskTitle: string, riskId: string) => void;
  accessMode?: 'admin' | 'consultation';
  onNavigateToSupervision?: () => void;
  onNavigateToCartographie?: () => void;
}

export const PDCASection: React.FC<PDCASectionProps> = ({
  uesList,
  ipeList,
  actions,
  setActions,
  audits,
  nonConformites,
  setNonConformites,
  stakeholders,
  setStakeholders,
  swotItems,
  setSwotItems,
  policy: externalPolicy,
  setPolicy: externalSetPolicy,
  raciItems: externalRaci,
  setRaciItems: externalSetRaci,
  competences: externalCompetences,
  setCompetences: externalSetCompetences,
  step = 'intro',
  onStepChange,
  onRequestCreateActionFromRisk,
  accessMode = 'admin',
  onNavigateToSupervision,
  onNavigateToCartographie
}) => {
  const [internalStep, setInternalStep] = useState<'intro' | 'plan' | 'do' | 'check' | 'act'>(step);
  const activeStep = step || internalStep;
  const setActiveStep = (newStep: 'intro' | 'plan' | 'do' | 'check' | 'act') => {
    setInternalStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  // Check sub-tab: 'ipe_ser' | 'distance_norme' | 'audits' (Suivi IPÉ vs SER placé en premier à gauche)
  const [checkSubTab, setCheckSubTab] = useState<'ipe_ser' | 'distance_norme' | 'audits'>('ipe_ser');

  // Périmètre & Domaine d'application (Champs libres éditables)
  const [perimetrePhysique, setPerimetrePhysique] = useState(
    "Site industriel de Val-de-Loire comprenant les bâtiments A (Production lignes 1-4), B (Conditionnement & Stockage froid), C (Centrale air comprimé & Chaufferie vapeur) et les réseaux extérieurs de distribution."
  );
  const [domaineApplication, setDomaineApplication] = useState(
    "Activités de transformation agro-industrielle, conditionnement, utilités industrielles associées. Aucune énergie exclue : électricité (HTA/BT), gaz naturel réseau, vapeur d'eau surchauffée et fioul de secours."
  );
  const [isPerimetreSaved, setIsPerimetreSaved] = useState(false);

  // SWOT: Formulaire d'ajout
  const [showAddSWOT, setShowAddSWOT] = useState(false);
  const [newSWOTCategory, setNewSWOTCategory] = useState<'forces' | 'faiblesses' | 'opportunites' | 'menaces'>('faiblesses');
  const [newSWOTTitre, setNewSWOTTitre] = useState('');
  const [newSWOTDesc, setNewSWOTDesc] = useState('');
  const [newSWOTImpact, setNewSWOTImpact] = useState<'Majeur' | 'Moyen' | 'Mineur'>('Majeur');

  // §6.2 : Objectifs et Cibles Énergétiques
  const [objectives, setObjectives] = useState<EnergyObjectiveItem[]>([
    {
      id: 'OBJ-01',
      titre: "Réduire le ratio spécifique d'électricité du Froid NH3 de 7% par tonne produite",
      ues: 'UES 1 : Froid Industriel NH3',
      cibleChiffree: '-7% (soit -280 MWh/an)',
      echeance: '2026-12-31',
      responsable: 'Julien Saliou (Responsable Énergie)',
      statut: 'En cours',
      indicateurIpeLie: 'IPÉ-01 : kWh/t réfrigérée',
      actionLieeId: 'ACT-101',
      gainViseKwh: 280000
    },
    {
      id: 'OBJ-02',
      titre: "Éliminer 80% des fuites d'air comprimé et abaisser la pression réseau de 7.5 à 6.5 bar",
      ues: 'UES 2 : Air Comprimé',
      cibleChiffree: '-12% (soit -145 MWh/an)',
      echeance: '2026-06-30',
      responsable: 'Technicien Utilités / Maintenance',
      statut: 'En cours',
      indicateurIpeLie: 'IPÉ-02 : kWh/Nm³ air comprimé',
      actionLieeId: 'ACT-102',
      gainViseKwh: 145000
    },
    {
      id: 'OBJ-03',
      titre: "Optimiser la régulation thermique et l'isolation des voûtes des fours tunnel A & B",
      ues: 'UES 3 : Fours de Cuisson',
      cibleChiffree: '-5% (soit -95 MWh/an)',
      echeance: '2026-10-31',
      responsable: "Chef d'Atelier Cuisson",
      statut: 'Planifié',
      indicateurIpeLie: 'IPÉ-03 : kWh/t cuite',
      actionLieeId: 'ACT-103',
      gainViseKwh: 95000
    },
    {
      id: 'OBJ-04',
      titre: 'Déployer la centrale solaire PV en toiture pour couvrir au moins 5% des besoins électriques',
      ues: 'Site Global',
      cibleChiffree: 'Autoproduction >= 240 MWh/an',
      echeance: '2026-07-15',
      responsable: 'Direction Technique & Travaux Neufs',
      statut: 'Atteint',
      indicateurIpeLie: "Taux d'autoproduction EnR",
      actionLieeId: 'ACT-104',
      gainViseKwh: 240000
    }
  ]);
  const [isAddObjectiveModalOpen, setIsAddObjectiveModalOpen] = useState(false);
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [objFormTitre, setObjFormTitre] = useState('');
  const [objFormUes, setObjFormUes] = useState('UES 1 : Froid Industriel NH3');
  const [objFormCible, setObjFormCible] = useState('');
  const [objFormEcheance, setObjFormEcheance] = useState('2026-12-31');
  const [objFormResponsable, setObjFormResponsable] = useState('Julien Saliou (Responsable Énergie)');
  const [objFormStatut, setObjFormStatut] = useState<'En cours' | 'Atteint' | 'Planifié' | 'À risque'>('En cours');
  const [objFormIpe, setObjFormIpe] = useState('IPÉ-01 : kWh/t réfrigérée');

  // §6.3 : Document officiel de Revue Énergétique (PDF ou GED)
  const [revueDoc, setRevueDoc] = useState<{
    type: 'pdf' | 'ged';
    nom: string;
    urlOuChemin: string;
    dateValidation: string;
    taille?: string;
    validePar: string;
  }>({
    type: 'pdf',
    nom: 'Rapport_Revue_Energetique_Annuelle_2025_2026_VDL.pdf',
    urlOuChemin: '/documents/revue-energetique-2025-2026-vdl.pdf',
    dateValidation: '2026-02-15',
    taille: '4.2 Mo',
    validePar: 'Julien Saliou (Réf. Énergie) & Direction Industrielle'
  });
  const [isDocRevueModalOpen, setIsDocRevueModalOpen] = useState(false);
  const [docInputType, setDocInputType] = useState<'pdf' | 'ged'>('pdf');
  const [docInputNom, setDocInputNom] = useState('Rapport_Revue_Energetique_Annuelle_2025_2026_VDL.pdf');
  const [docInputUrl, setDocInputUrl] = useState('https://ged.valdeloire-industrie.fr/energie/revue-2026.pdf');
  const [docInputDate, setDocInputDate] = useState('2026-02-15');
  const [docInputValidePar, setDocInputValidePar] = useState('Julien Saliou (Réf. Énergie) & Direction Industrielle');

  // §6.4 & §6.5 : Sélecteur de période d'évolution IPÉ vs SER
  const [selectedIpePeriod, setSelectedIpePeriod] = useState<'mois' | 'trimestre' | 'annee' | 'ser_ref' | 'glissant'>('mois');

  // Parties Prenantes: Formulaire d'ajout
  const [showAddStakeholder, setShowAddStakeholder] = useState(false);
  const [newStkEntite, setNewStkEntite] = useState('');
  const [newStkInfluence, setNewStkInfluence] = useState<number>(3);
  const [newStkInteret, setNewStkInteret] = useState<number>(3);
  const [newStkRole, setNewStkRole] = useState('');
  const [newStkAttentes, setNewStkAttentes] = useState('');
  const [newStkMoyenCom, setNewStkMoyenCom] = useState('');
  const [newStkAction, setNewStkAction] = useState('');
  const [newStkPriorite, setNewStkPriorite] = useState<'Haute' | 'Moyenne' | 'Basse'>('Haute');
  const [newStkVerif, setNewStkVerif] = useState<'Conforme' | 'En cours' | 'Planifié' | 'À auditer'>('En cours');

  // Actions: Formulaire d'ajout
  const [showAddAction, setShowAddAction] = useState(false);
  const [newActionTitre, setNewActionTitre] = useState('');
  const [newActionUES, setNewActionUES] = useState(uesList[0]?.nom || 'Air Comprimé');
  const [newActionResp, setNewActionResp] = useState('');
  const [newActionGain, setNewActionGain] = useState(25000);
  const [newActionBudget, setNewActionBudget] = useState(5.0);
  const [newActionEcheance, setNewActionEcheance] = useState('2025-10-31');

  // Non-Conformités: Formulaire d'ajout
  const [showAddNC, setShowAddNC] = useState(false);
  const [newNCDescription, setNewNCDescription] = useState('');
  const [newNCCause, setNewNCCause] = useState('');
  const [newNCCorrection, setNewNCCorrection] = useState('');
  const [newNCUES, setNewNCUES] = useState(uesList[0]?.nom || 'Froid Industriel');
  const [newNCResp, setNewNCResp] = useState('Responsable Utilités');

  // Chapitre 5 : Politique Énergétique et Matrice RACI
  const [policy, setPolicy] = useState<EnergyPolicy>(externalPolicy || initialPolicy);
  const [raciItems, setRaciItems] = useState<RACIItem[]>(externalRaci || initialRACI);
  const [policySaved, setPolicySaved] = useState(false);
  const [copiedPolicy, setCopiedPolicy] = useState(false);
  const [showAddRACI, setShowAddRACI] = useState(false);
  const [newRACIActivite, setNewRACIActivite] = useState('');
  const [newRACIDir, setNewRACIDir] = useState<RACIRole>('A');
  const [newRACIRef, setNewRACIRef] = useState<RACIRole>('R');
  const [newRACIMaint, setNewRACIMaint] = useState<RACIRole>('C');
  const [newRACIProd, setNewRACIProd] = useState<RACIRole>('C');
  const [newRACIAchats, setNewRACIAchats] = useState<RACIRole>('I');
  const [newRACIOp, setNewRACIOp] = useState<RACIRole>('I');

  // Chapitre 7.2 : Compétences, Habilitations & Preuves documentaires
  const [competences, setCompetences] = useState<CompetenceProofItem[]>(externalCompetences || initialCompetences);
  const [showAddComp, setShowAddComp] = useState(false);
  const [newCompPoste, setNewCompPoste] = useState('');
  const [newCompTitulaire, setNewCompTitulaire] = useState('');
  const [newCompQualif, setNewCompQualif] = useState('');
  const [newCompUES, setNewCompUES] = useState('Transversal (Toutes UES)');
  const [newCompValidite, setNewCompValidite] = useState('Habilité (2026)');
  const [newCompMode, setNewCompMode] = useState<'fichier' | 'lien'>('fichier');
  const [newCompFichierNom, setNewCompFichierNom] = useState('');
  const [newCompLien, setNewCompLien] = useState('');
  const [newCompCommentaire, setNewCompCommentaire] = useState('');
  const [previewDoc, setPreviewDoc] = useState<CompetenceProofItem | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<string | null>(null);

  // =========================================================================
  // FILTRAGE DIRECT PAR BOUTONS SUR LES COLONNES (5 TABLEAUX SMÉ)
  // =========================================================================

  // 1. Matrice & Analyse des Parties Prenantes (§4.2)
  const [stkColFilters, setStkColFilters] = useState<Record<string, string>>({
    entite: '',
    influence: '',
    interet: '',
    actionMatrice: '',
    communication: '',
    role: '',
    attentes: '',
    actionsMener: '',
    priorite: '',
    verification: ''
  });
  const [stkSortCol, setStkSortCol] = useState<string | null>(null);
  const [stkSortDir, setStkSortDir] = useState<'asc' | 'desc' | null>(null);

  const updateStkColFilter = (colKey: string, val: string) => {
    setStkColFilters(prev => ({
      ...prev,
      [colKey]: val === 'Tous' || val === 'Toutes' ? '' : val
    }));
  };

  const resetAllStkFilters = () => {
    setStkColFilters({
      entite: '',
      influence: '',
      interet: '',
      actionMatrice: '',
      communication: '',
      role: '',
      attentes: '',
      actionsMener: '',
      priorite: '',
      verification: ''
    });
    setStkSortCol(null);
    setStkSortDir(null);
  };

  const hasActiveStkFilters = Object.values(stkColFilters).some(v => Boolean(v && v.trim() !== ''));
  const activeStkCount = Object.values(stkColFilters).filter(v => Boolean(v && v.trim() !== '')).length;

  // Options pour Parties Prenantes
  const stkInfluenceOptions = useMemo(() => [
    { value: '4', label: '4 - Décisionnel (Rouge)' },
    { value: '3', label: '3 - Significatif (Orange)' },
    { value: '2', label: '2 - Modéré (Vert)' },
    { value: '1', label: '1 - Faible (Gris)' }
  ], []);

  const stkInteretOptions = useMemo(() => [
    { value: '4', label: '4 - Critique (Rouge)' },
    { value: '3', label: '3 - Fort (Jaune)' },
    { value: '2', label: '2 - Modéré (Vert)' },
    { value: '1', label: '1 - Faible (Gris)' }
  ], []);

  const stkActionMatriceOptions = useMemo(() => [
    { value: 'Gérer avec attention', label: 'Gérer avec attention' },
    { value: 'Maintenir satisfaits', label: 'Maintenir satisfaits' },
    { value: 'Maintenir informés', label: 'Maintenir informés' },
    { value: 'Surveillance minimale', label: 'Surveillance minimale' }
  ], []);

  const stkPrioriteOptions = useMemo(() => [
    { value: 'Haute', label: 'Haute' },
    { value: 'Moyenne', label: 'Moyenne' },
    { value: 'Basse', label: 'Basse' }
  ], []);

  const stkVerifOptions = useMemo(() => [
    { value: 'Conforme', label: 'Conforme' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Planifié', label: 'Planifié' },
    { value: 'À auditer', label: 'À auditer' }
  ], []);

  const filteredStakeholders = useMemo(() => {
    let result = stakeholders.filter(s => {
      if (stkColFilters.entite && !s.entite.toLowerCase().includes(stkColFilters.entite.toLowerCase())) return false;
      if (stkColFilters.influence && s.influence !== Number(stkColFilters.influence)) return false;
      if (stkColFilters.interet && s.interet !== Number(stkColFilters.interet)) return false;
      if (stkColFilters.actionMatrice && s.actionMatrice !== stkColFilters.actionMatrice) return false;
      if (stkColFilters.communication && !s.moyenFreqCom.toLowerCase().includes(stkColFilters.communication.toLowerCase())) return false;
      if (stkColFilters.role && !s.role.toLowerCase().includes(stkColFilters.role.toLowerCase())) return false;
      if (stkColFilters.attentes && !s.attentes.toLowerCase().includes(stkColFilters.attentes.toLowerCase())) return false;
      if (stkColFilters.actionsMener && !s.actionsMener.toLowerCase().includes(stkColFilters.actionsMener.toLowerCase())) return false;
      if (stkColFilters.priorite && s.priorite !== stkColFilters.priorite) return false;
      if (stkColFilters.verification && s.verification !== stkColFilters.verification) return false;
      return true;
    });

    if (stkSortCol && stkSortDir) {
      result = [...result].sort((a, b) => {
        let valA = (a as any)[stkSortCol] || '';
        let valB = (b as any)[stkSortCol] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return stkSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return stkSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [stakeholders, stkColFilters, stkSortCol, stkSortDir]);

  // 2. Filtres Matrice RACI (§5.3)
  const [raciColFilters, setRaciColFilters] = useState<Record<string, string>>({
    activite: '',
    direction: '',
    referentEnergie: '',
    maintenanceUtilites: '',
    production: '',
    achatsTravaux: '',
    operateurs: ''
  });
  const [raciSortCol, setRaciSortCol] = useState<string | null>(null);
  const [raciSortDir, setRaciSortDir] = useState<'asc' | 'desc' | null>(null);

  const updateRaciColFilter = (colKey: string, val: string) => {
    setRaciColFilters(prev => ({
      ...prev,
      [colKey]: val === 'Tous' || val === 'Toutes' ? '' : val
    }));
  };

  const resetAllRaciFilters = () => {
    setRaciColFilters({
      activite: '',
      direction: '',
      referentEnergie: '',
      maintenanceUtilites: '',
      production: '',
      achatsTravaux: '',
      operateurs: ''
    });
    setRaciSortCol(null);
    setRaciSortDir(null);
  };

  const hasActiveRaciFilters = Object.values(raciColFilters).some(v => Boolean(v && v.trim() !== ''));
  const activeRaciCount = Object.values(raciColFilters).filter(v => Boolean(v && v.trim() !== '')).length;

  const raciRoleOptions = useMemo(() => [
    { value: 'R', label: 'R - Réalise (Responsible)' },
    { value: 'A', label: 'A - Approuve (Accountable)' },
    { value: 'C', label: 'C - Consulté (Consulted)' },
    { value: 'I', label: 'I - Informé (Informed)' },
    { value: '-', label: '- Sans attribution' }
  ], []);

  const filteredRaciItems = useMemo(() => {
    let result = raciItems.filter(r => {
      if (raciColFilters.activite && !r.activite.toLowerCase().includes(raciColFilters.activite.toLowerCase())) return false;
      if (raciColFilters.direction && r.direction !== raciColFilters.direction) return false;
      if (raciColFilters.referentEnergie && r.referentEnergie !== raciColFilters.referentEnergie) return false;
      if (raciColFilters.maintenanceUtilites && r.maintenanceUtilites !== raciColFilters.maintenanceUtilites) return false;
      if (raciColFilters.production && r.production !== raciColFilters.production) return false;
      if (raciColFilters.achatsTravaux && r.achatsTravaux !== raciColFilters.achatsTravaux) return false;
      if (raciColFilters.operateurs && r.operateurs !== raciColFilters.operateurs) return false;
      return true;
    });

    if (raciSortCol && raciSortDir) {
      result = [...result].sort((a, b) => {
        let valA = (a as any)[raciSortCol] || '';
        let valB = (b as any)[raciSortCol] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return raciSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return raciSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [raciItems, raciColFilters, raciSortCol, raciSortDir]);

  // 3. Filtres Revue Énergétique & UES (§6.3)
  const [uesColFilters, setUesColFilters] = useState<Record<string, string>>({
    id: '',
    nom: '',
    vecteur: '',
    facteurs: '',
    responsable: ''
  });
  const [uesSortCol, setUesSortCol] = useState<string | null>(null);
  const [uesSortDir, setUesSortDir] = useState<'asc' | 'desc' | null>(null);

  const updateUesColFilter = (colKey: string, val: string) => {
    setUesColFilters(prev => ({
      ...prev,
      [colKey]: val === 'Tous' || val === 'Toutes' ? '' : val
    }));
  };

  const resetAllUesFilters = () => {
    setUesColFilters({
      id: '',
      nom: '',
      vecteur: '',
      facteurs: '',
      responsable: ''
    });
    setUesSortCol(null);
    setUesSortDir(null);
  };

  const hasActiveUesFilters = Object.values(uesColFilters).some(v => Boolean(v && v.trim() !== ''));
  const activeUesCount = Object.values(uesColFilters).filter(v => Boolean(v && v.trim() !== '')).length;

  const uesVecteurOptions = useMemo(() => [
    { value: 'Électricité', label: 'Électricité' },
    { value: 'Gaz', label: 'Gaz Naturel' },
    { value: 'Vapeur', label: 'Vapeur & Utilités' }
  ], []);

  const filteredUesList = useMemo(() => {
    let result = uesList.filter(u => {
      if (uesColFilters.id && !u.id.toLowerCase().includes(uesColFilters.id.toLowerCase())) return false;
      if (uesColFilters.nom && !u.nom.toLowerCase().includes(uesColFilters.nom.toLowerCase())) return false;
      if (uesColFilters.vecteur && !u.vecteur.toLowerCase().includes(uesColFilters.vecteur.toLowerCase())) return false;
      if (uesColFilters.facteurs && !u.facteurs.toLowerCase().includes(uesColFilters.facteurs.toLowerCase())) return false;
      if (uesColFilters.responsable && !u.responsable.toLowerCase().includes(uesColFilters.responsable.toLowerCase())) return false;
      return true;
    });

    if (uesSortCol && uesSortDir) {
      result = [...result].sort((a, b) => {
        let valA = (a as any)[uesSortCol] || '';
        let valB = (b as any)[uesSortCol] || '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return uesSortDir === 'asc' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return uesSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return uesSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [uesList, uesColFilters, uesSortCol, uesSortDir]);

  // 4. Filtres Plan d'Actions d'Amélioration (§6.2.3 & §8.1)
  const [actionColFilters, setActionColFilters] = useState<Record<string, string>>({
    id: '',
    titre: '',
    origine_swot: '',
    ues: '',
    responsable: '',
    echeance: '',
    statut: ''
  });
  const [actionSortCol, setActionSortCol] = useState<string | null>(null);
  const [actionSortDir, setActionSortDir] = useState<'asc' | 'desc' | null>(null);

  const updateActionColFilter = (colKey: string, val: string) => {
    setActionColFilters(prev => ({
      ...prev,
      [colKey]: val === 'Tous' || val === 'Toutes' ? '' : val
    }));
  };

  const resetAllActionFilters = () => {
    setActionColFilters({
      id: '',
      titre: '',
      origine_swot: '',
      ues: '',
      responsable: '',
      echeance: '',
      statut: ''
    });
    setActionSortCol(null);
    setActionSortDir(null);
  };

  const hasActiveActionFilters = Object.values(actionColFilters).some(v => Boolean(v && v.trim() !== ''));
  const activeActionCount = Object.values(actionColFilters).filter(v => Boolean(v && v.trim() !== '')).length;

  const actionStatutOptions = useMemo(() => [
    { value: 'En cours', label: 'En cours' },
    { value: 'Planifié', label: 'Planifié' },
    { value: 'Réalisé', label: 'Réalisé' },
    { value: 'En retard', label: 'En retard' }
  ], []);

  const actionUESOptions = useMemo(() => {
    return Array.from(new Set(actions.map(a => a.ues))).map(u => ({ value: u, label: u }));
  }, [actions]);

  const filteredActions = useMemo(() => {
    let result = actions.filter(a => {
      if (actionColFilters.id && !a.id.toLowerCase().includes(actionColFilters.id.toLowerCase())) return false;
      if (actionColFilters.titre && !a.titre.toLowerCase().includes(actionColFilters.titre.toLowerCase())) return false;
      if (actionColFilters.origine_swot && (!a.origine_swot || !a.origine_swot.toLowerCase().includes(actionColFilters.origine_swot.toLowerCase()))) return false;
      if (actionColFilters.ues && a.ues !== actionColFilters.ues) return false;
      if (actionColFilters.responsable && !a.responsable.toLowerCase().includes(actionColFilters.responsable.toLowerCase())) return false;
      if (actionColFilters.echeance && !a.echeance.includes(actionColFilters.echeance)) return false;
      if (actionColFilters.statut && a.statut !== actionColFilters.statut) return false;
      return true;
    });

    if (actionSortCol && actionSortDir) {
      result = [...result].sort((a, b) => {
        let valA = (a as any)[actionSortCol] || '';
        let valB = (b as any)[actionSortCol] || '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return actionSortDir === 'asc' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return actionSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return actionSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [actions, actionColFilters, actionSortCol, actionSortDir]);

  // 5. Filtres Non-Conformités et Actions Correctives (§10.1)
  const [ncColFilters, setNcColFilters] = useState<Record<string, string>>({
    id: '',
    date: '',
    ues: '',
    description: '',
    cause_racine: '',
    action_corrective: '',
    responsable: '',
    statut: ''
  });
  const [ncSortCol, setNcSortCol] = useState<string | null>(null);
  const [ncSortDir, setNcSortDir] = useState<'asc' | 'desc' | null>(null);

  const updateNcColFilter = (colKey: string, val: string) => {
    setNcColFilters(prev => ({
      ...prev,
      [colKey]: val === 'Tous' || val === 'Toutes' ? '' : val
    }));
  };

  const resetAllNcFilters = () => {
    setNcColFilters({
      id: '',
      date: '',
      ues: '',
      description: '',
      cause_racine: '',
      action_corrective: '',
      responsable: '',
      statut: ''
    });
    setNcSortCol(null);
    setNcSortDir(null);
  };

  const hasActiveNcFilters = Object.values(ncColFilters).some(v => Boolean(v && v.trim() !== ''));
  const activeNcCount = Object.values(ncColFilters).filter(v => Boolean(v && v.trim() !== '')).length;

  const ncStatutOptions = useMemo(() => [
    { value: 'Ouverte', label: 'Ouverte' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Clôturée', label: 'Clôturée' }
  ], []);

  const ncUESOptions = useMemo(() => {
    return Array.from(new Set(nonConformites.map(n => n.ues))).map(u => ({ value: u, label: u }));
  }, [nonConformites]);

  const filteredNonConformites = useMemo(() => {
    let result = nonConformites.filter(nc => {
      if (ncColFilters.id && !nc.id.toLowerCase().includes(ncColFilters.id.toLowerCase())) return false;
      if (ncColFilters.date && !nc.date_constat.includes(ncColFilters.date)) return false;
      if (ncColFilters.ues && nc.ues !== ncColFilters.ues) return false;
      if (ncColFilters.description && !nc.description.toLowerCase().includes(ncColFilters.description.toLowerCase())) return false;
      if (ncColFilters.cause_racine && !nc.cause_racine.toLowerCase().includes(ncColFilters.cause_racine.toLowerCase())) return false;
      if (ncColFilters.action_corrective && !nc.action_corrective.toLowerCase().includes(ncColFilters.action_corrective.toLowerCase())) return false;
      if (ncColFilters.responsable && !nc.responsable.toLowerCase().includes(ncColFilters.responsable.toLowerCase())) return false;
      if (ncColFilters.statut && nc.statut !== ncColFilters.statut) return false;
      return true;
    });

    if (ncSortCol && ncSortDir) {
      result = [...result].sort((a, b) => {
        let valA = (a as any)[ncSortCol] || '';
        let valB = (b as any)[ncSortCol] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return ncSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return ncSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [nonConformites, ncColFilters, ncSortCol, ncSortDir]);

  // Handlers Chapitre 5
  const handleSavePolicy = () => {
    if (externalSetPolicy) externalSetPolicy(policy);
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2500);
  };

  const handleResetPolicyTemplate = () => {
    setPolicy(prev => ({
      ...prev,
      textePolitique: initialPolicy.textePolitique,
      cibleChiffree: initialPolicy.cibleChiffree
    }));
  };

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(policy.textePolitique);
    setCopiedPolicy(true);
    setTimeout(() => setCopiedPolicy(false), 2000);
  };

  const handleAddRACI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRACIActivite) return;
    const item: RACIItem = {
      id: `RACI-${Date.now().toString().slice(-3)}`,
      activite: newRACIActivite,
      direction: newRACIDir,
      referentEnergie: newRACIRef,
      maintenanceUtilites: newRACIMaint,
      production: newRACIProd,
      achatsTravaux: newRACIAchats,
      operateurs: newRACIOp
    };
    const updated = [...raciItems, item];
    setRaciItems(updated);
    if (externalSetRaci) externalSetRaci(updated);
    setNewRACIActivite('');
    setShowAddRACI(false);
  };

  const handleDeleteRACI = (id: string) => {
    const updated = raciItems.filter(r => r.id !== id);
    setRaciItems(updated);
    if (externalSetRaci) externalSetRaci(updated);
  };

  const handleUpdateRACIRole = (id: string, roleKey: keyof RACIItem, newRole: RACIRole) => {
    const updated = raciItems.map(r => r.id === id ? { ...r, [roleKey]: newRole } : r);
    setRaciItems(updated);
    if (externalSetRaci) externalSetRaci(updated);
  };

  // Handlers Chapitre 7.2
  const handleAddCompetence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompPoste || !newCompQualif) return;
    const item: CompetenceProofItem = {
      id: `COMP-${Date.now().toString().slice(-3)}`,
      poste: newCompPoste,
      titulaire: newCompTitulaire || 'Personnel qualifié',
      qualification: newCompQualif,
      ues: newCompUES,
      statutValidite: newCompValidite,
      modePreuve: newCompMode,
      fichierNom: newCompMode === 'fichier' ? (newCompFichierNom || 'attestation_qualification.pdf') : undefined,
      fichierTaille: newCompMode === 'fichier' ? '920 Ko' : undefined,
      fichierDate: newCompMode === 'fichier' ? new Date().toISOString().split('T')[0] : undefined,
      lienGedUrl: newCompMode === 'lien' ? (newCompLien || 'https://ged.usine-valdeloire.corp/qualif/doc.pdf') : undefined,
      commentaire: newCompCommentaire
    };
    const updated = [...competences, item];
    setCompetences(updated);
    if (externalSetCompetences) externalSetCompetences(updated);
    setNewCompPoste('');
    setNewCompTitulaire('');
    setNewCompQualif('');
    setNewCompFichierNom('');
    setNewCompLien('');
    setNewCompCommentaire('');
    setShowAddComp(false);
  };

  const handleDeleteCompetence = (id: string) => {
    const updated = competences.filter(c => c.id !== id);
    setCompetences(updated);
    if (externalSetCompetences) externalSetCompetences(updated);
  };

  const handleUploadProofFile = (id: string, file: File) => {
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
      : `${(file.size / 1024).toFixed(0)} Ko`;
    const today = new Date().toISOString().split('T')[0];
    const updated = competences.map(c => {
      if (c.id === id) {
        return {
          ...c,
          modePreuve: 'fichier' as const,
          fichierNom: file.name,
          fichierTaille: sizeStr,
          fichierDate: today
        };
      }
      return c;
    });
    setCompetences(updated);
    if (externalSetCompetences) externalSetCompetences(updated);
  };

  const handleUpdateCompetenceLink = (id: string, link: string) => {
    const updated = competences.map(c => {
      if (c.id === id) {
        return {
          ...c,
          modePreuve: 'lien' as const,
          lienGedUrl: link
        };
      }
      return c;
    });
    setCompetences(updated);
    if (externalSetCompetences) externalSetCompetences(updated);
  };

  const handleToggleCompetenceMode = (id: string, mode: 'fichier' | 'lien') => {
    const updated = competences.map(c => {
      if (c.id === id) {
        return {
          ...c,
          modePreuve: mode
        };
      }
      return c;
    });
    setCompetences(updated);
    if (externalSetCompetences) externalSetCompetences(updated);
  };

  const handleCopyLink = (id: string, linkText: string) => {
    navigator.clipboard.writeText(linkText);
    setCopiedLinkIndex(id);
    setTimeout(() => setCopiedLinkIndex(null), 2000);
  };

  // Handlers
  const handleSavePerimetre = () => {
    setIsPerimetreSaved(true);
    setTimeout(() => setIsPerimetreSaved(false), 2500);
  };

  // Handlers §6.2 Objectifs & Cibles
  const handleOpenAddObjective = () => {
    setEditingObjectiveId(null);
    setObjFormTitre('');
    setObjFormUes('UES 1 : Froid Industriel NH3');
    setObjFormCible('');
    setObjFormEcheance('2026-12-31');
    setObjFormResponsable('Julien Saliou (Responsable Énergie)');
    setObjFormStatut('En cours');
    setObjFormIpe('IPÉ-01 : kWh/t réfrigérée');
    setIsAddObjectiveModalOpen(true);
  };

  const handleEditObjective = (obj: EnergyObjectiveItem) => {
    setEditingObjectiveId(obj.id);
    setObjFormTitre(obj.titre);
    setObjFormUes(obj.ues);
    setObjFormCible(obj.cibleChiffree);
    setObjFormEcheance(obj.echeance);
    setObjFormResponsable(obj.responsable);
    setObjFormStatut(obj.statut);
    setObjFormIpe(obj.indicateurIpeLie);
    setIsAddObjectiveModalOpen(true);
  };

  const handleSaveObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objFormTitre.trim() || !objFormCible.trim()) return;

    if (editingObjectiveId) {
      setObjectives(prev =>
        prev.map(o =>
          o.id === editingObjectiveId
            ? {
                ...o,
                titre: objFormTitre,
                ues: objFormUes,
                cibleChiffree: objFormCible,
                echeance: objFormEcheance,
                responsable: objFormResponsable,
                statut: objFormStatut,
                indicateurIpeLie: objFormIpe
              }
            : o
        )
      );
    } else {
      const newObj: EnergyObjectiveItem = {
        id: `OBJ-0${objectives.length + 1}`,
        titre: objFormTitre,
        ues: objFormUes,
        cibleChiffree: objFormCible,
        echeance: objFormEcheance,
        responsable: objFormResponsable,
        statut: objFormStatut,
        indicateurIpeLie: objFormIpe,
        actionLieeId: `ACT-10${actions.length + 1}`,
        gainViseKwh: 100000
      };
      setObjectives(prev => [...prev, newObj]);
    }

    setIsAddObjectiveModalOpen(false);
  };

  const handleDeleteObjective = (id: string) => {
    if (accessMode === 'consultation') return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif / cible énergétique ?")) {
      setObjectives(prev => prev.filter(o => o.id !== id));
    }
  };

  // Handlers §6.3 Document Revue Énergétique
  const handleSaveRevueDoc = (e: React.FormEvent) => {
    e.preventDefault();
    setRevueDoc({
      type: docInputType,
      nom: docInputNom || (docInputType === 'pdf' ? 'Revue_Energetique_2026.pdf' : 'Lien GED Revue Énergétique'),
      urlOuChemin: docInputUrl,
      dateValidation: docInputDate,
      taille: docInputType === 'pdf' ? '3.8 Mo' : undefined,
      validePar: docInputValidePar || 'Julien Saliou & Direction de Site'
    });
    setIsDocRevueModalOpen(false);
  };

  // Helper §6.4 & §6.5 Calcul de l'évolution IPÉ vs SER par période
  const getIpePeriodData = (ipe: IPEItem, period: 'mois' | 'trimestre' | 'annee' | 'ser_ref' | 'glissant') => {
    let factor = 1.0;
    let labelPeriod = 'Dernier Mois (M-1)';
    if (period === 'trimestre') {
      factor = 1.012;
      labelPeriod = 'Trimestre T3 2026';
    } else if (period === 'annee') {
      factor = 0.988;
      labelPeriod = 'Cumul YTD 2026';
    } else if (period === 'ser_ref') {
      factor = ipe.valeur_ser / (ipe.valeur_actuelle || 1);
      labelPeriod = 'Période SER de référence';
    } else if (period === 'glissant') {
      factor = 0.975;
      labelPeriod = '12 Mois Glissants';
    }

    const currentVal = period === 'ser_ref' ? ipe.valeur_ser : Math.round(ipe.valeur_actuelle * factor * 100) / 100;
    const diffPct = period === 'ser_ref' ? 0 : Math.round(((currentVal - ipe.valeur_ser) / ipe.valeur_ser) * 1000) / 10;
    const isImprovement = diffPct <= 0;

    return {
      currentVal,
      diffPct,
      isImprovement,
      labelPeriod
    };
  };

  const handleAddSWOT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSWOTTitre) return;
    const item: SWOTItem = {
      id: `SWOT-${newSWOTCategory[0].toUpperCase()}${Date.now().toString().slice(-3)}`,
      categorie: newSWOTCategory,
      titre: newSWOTTitre,
      description: newSWOTDesc,
      impact: newSWOTImpact
    };
    setSwotItems(prev => [...prev, item]);
    setNewSWOTTitre('');
    setNewSWOTDesc('');
    setShowAddSWOT(false);
  };

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStkEntite) return;
    
    // Déduction action sortante matrice Pouvoir / Intérêt
    let actionMat: StakeholderDetailedItem['actionMatrice'] = 'Surveiller';
    if (newStkInfluence >= 3 && newStkInteret >= 3) {
      actionMat = 'Gérer avec attention';
    } else if (newStkInfluence < 3 && newStkInteret >= 3) {
      actionMat = 'Maintenir informés';
    } else if (newStkInfluence >= 3 && newStkInteret < 3) {
      actionMat = 'Maintenir satisfaits';
    } else {
      actionMat = 'Surveiller';
    }

    const item: StakeholderDetailedItem = {
      id: `STK-${Date.now().toString().slice(-3)}`,
      entite: newStkEntite,
      influence: newStkInfluence,
      interet: newStkInteret,
      actionMatrice: actionMat,
      moyenFreqCom: newStkMoyenCom || 'Point périodique',
      role: newStkRole,
      attentes: newStkAttentes,
      actionsMener: newStkAction,
      priorite: newStkPriorite,
      verification: newStkVerif
    };
    setStakeholders(prev => [...prev, item]);
    setNewStkEntite('');
    setNewStkRole('');
    setNewStkAttentes('');
    setNewStkAction('');
    setShowAddStakeholder(false);
  };

  const handleCreateParadeAction = (swotItem: SWOTItem) => {
    if (onRequestCreateActionFromRisk) {
      onRequestCreateActionFromRisk(swotItem.titre, swotItem.id);
    } else {
      // Pré-remplir l'action et basculer sur 'do'
      setNewActionTitre(`Parade ${swotItem.categorie === 'menaces' ? 'Risque' : 'Faiblesse'} : ${swotItem.titre}`);
      setNewActionResp('Responsable Projets Énergie');
      setShowAddAction(true);
      setActiveStep('do');
    }
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitre) return;
    const item: ActionItem = {
      id: `ACT-10${actions.length + 1}`,
      titre: newActionTitre,
      ues: newActionUES,
      responsable: newActionResp || 'Équipe Projets Énergie',
      echeance: newActionEcheance,
      gain_vise_kwh: Number(newActionGain),
      budget_keuros: Number(newActionBudget),
      statut: 'Planifié'
    };
    setActions(prev => [...prev, item]);
    setNewActionTitre('');
    setShowAddAction(false);
  };

  const handleAddNC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNCDescription) return;
    const nc: NonConformiteItem = {
      id: `NC-25-0${nonConformites.length + 1}`,
      date_constat: new Date().toISOString().split('T')[0],
      ues: newNCUES,
      description: newNCDescription,
      cause_racine: newNCCause || 'Non déterminée à ce stade',
      action_corrective: newNCCorrection || 'Plan d’action en cours de définition',
      responsable: newNCResp,
      statut: 'En cours',
      date_cloture: '-'
    };
    setNonConformites(prev => [...prev, nc]);
    setNewNCDescription('');
    setNewNCCause('');
    setNewNCCorrection('');
    setShowAddNC(false);
  };

  // Helper pour les couleurs du camembert SVG UES
  const uesColors = ['#2563EB', '#DC2626', '#059669', '#D97706'];
  const totalConsoUES = uesList.reduce((acc, u) => acc + u.part_conso, 0) || 100;

  // Calcul des coordonnées du camembert SVG (Pie Chart)
  let cumulativeAngle = 0;
  const pieSlices = uesList.map((ues, idx) => {
    const fraction = ues.part_conso / totalConsoUES;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const r = 90;
    const cx = 100;
    const cy = 100;

    const x1 = cx + r * Math.sin(startAngle);
    const y1 = cy - r * Math.cos(startAngle);
    const x2 = cx + r * Math.sin(endAngle);
    const y2 = cy - r * Math.cos(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      ues,
      color: ues.couleur || uesColors[idx % uesColors.length],
      pathData,
      pct: ues.part_conso
    };
  });

  return (
    <div className="space-y-6">
      {/* En-tête du SMÉ */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          Système de Management de l'Énergie (ISO 50001:2018)
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <span>Amélioration continue méthodique</span>
          <span aria-hidden="true">·</span>
          <span>Chapitres 4 à 10</span>
        </div>
      </div>

      {/* =========================================================================
          ONGLET INTRODUCTION : FONCTIONNEMENT DU SMÉ & DÉMARCHE PDCA ISO 50001
         ========================================================================= */}
      {activeStep === 'intro' && (
        <div className="space-y-6">
          {/* Bannière de présentation générale */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-md space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Norme NF EN ISO 50001:2018</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <span>Cycle d'Amélioration Continue</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <span>Chapitres 4 à 10</span>
              </span>
            </div>

            <div className="space-y-2 max-w-4xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Comprendre le fonctionnement du SMÉ et sa structure PDCA
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Le <strong>Système de Management de l’Énergie (SMÉ)</strong> est une démarche d'organisation et de progrès continu permettant à un établissement industriel de maîtriser ses consommations et de réduire durablement sa facture énergétique ainsi que son empreinte carbone.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                UniSme digitalise rigoureusement l'ensemble des exigences de la norme <strong>ISO 50001:2018</strong>. La méthode s'articule autour des 4 étapes du cycle vertueux <strong>PDCA (Planifier, Réaliser, Vérifier, Agir)</strong>, où chaque étape alimente la suivante pour garantir une performance mesurable et auditable.
              </p>
            </div>
          </div>

          {/* Grille des 4 Piliers PDCA dans la norme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. PLAN */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-xs">
                      P
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">1. PLAN — Planifier</h4>
                      <p className="text-[11px] text-emerald-700 font-semibold">Chapitres 4, 5 et 6 de l'ISO 50001</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    §4 - §6
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Cadrer le système, mobiliser la gouvernance et identifier précisément où et comment l'énergie est consommée dans l'usine.
                </p>

                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs border border-slate-100">
                  <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                    Exigences normatives digitalisées :
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">·</span>
                      <span><strong>§4 Contexte :</strong> Périmètre physique, domaine d'application et analyse SWOT des risques/opportunités.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">·</span>
                      <span><strong>§5 Leadership :</strong> Politique énergétique formelle, engagement de la direction et cibles de réduction.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">·</span>
                      <span><strong>§6 Planification :</strong> Revue énergétique (§6.3), Usages Énergétiques Significatifs (UES), Indicateurs IPÉ (§6.4), et Situations Énergétiques de Référence SER (§6.5).</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('plan')}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
              >
                <span>Accéder à la phase 1 : Plan (Planifier)</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            </div>

            {/* 2. DO */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-xs">
                      D
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">2. DO — Réaliser</h4>
                      <p className="text-[11px] text-blue-700 font-semibold">Chapitres 7 et 8 de l'ISO 50001</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                    §7 - §8
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Engager les équipes opérationnelles, exécuter les actions d'économies d'énergie et sécuriser les pratiques d'exploitation et d'achats.
                </p>

                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs border border-slate-100">
                  <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                    Exigences normatives digitalisées :
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">·</span>
                      <span><strong>§5.3 & §7.2 Rôles & Compétences :</strong> Matrice RACI, registre des preuves de compétences et habilitations clés.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">·</span>
                      <span><strong>§6.2 Plan d'actions opérationnel :</strong> Portefeuille des projets d'efficacité (gains kWh, budgets, échéances).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">·</span>
                      <span><strong>§8.1 à §8.3 Maîtrise & Achats :</strong> Consignes d'exploitation des UES, intégration de l'énergie dans les achats et la conception.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('do')}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition-colors"
              >
                <span>Accéder à la phase 2 : Do (Réaliser)</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
              </button>
            </div>

            {/* 3. CHECK */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-purple-300 transition-all shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-xs">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">3. CHECK — Vérifier</h4>
                      <p className="text-[11px] text-purple-700 font-semibold">Chapitre 9 de l'ISO 50001</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                    §9
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Mesurer les résultats réels, confronter la performance énergétique aux références et auditer la conformité du système.
                </p>

                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs border border-slate-100">
                  <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                    Exigences normatives digitalisées :
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">·</span>
                      <span><strong>§9.1 Surveillance continue :</strong> Mesurage et suivi en continu des IPÉ vs SER (calcul des gains réels en kWh).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">·</span>
                      <span><strong>§9.1.2 Conformité légale :</strong> Veille et évaluation du respect des exigences légales et contractuelles.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">·</span>
                      <span><strong>§9.2 & §9.3 Audits & Revue :</strong> Audits internes périodiques et préparation formelle de la Revue de Direction.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('check')}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold transition-colors"
              >
                <span>Accéder à la phase 3 : Check (Vérifier)</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
              </button>
            </div>

            {/* 4. ACT */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shadow-xs">
                      A
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">4. ACT — Agir</h4>
                      <p className="text-[11px] text-amber-700 font-semibold">Chapitre 10 de l'ISO 50001</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                    §10
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Traiter sans délai les dérives mesurées, éliminer les causes profondes et pérenniser les gains pour le cycle suivant.
                </p>

                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs border border-slate-100">
                  <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                    Exigences normatives digitalisées :
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">·</span>
                      <span><strong>§10.1 Non-conformités :</strong> Registre des dérives détectées (alertes de surconsommation ou écarts d'audits).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">·</span>
                      <span><strong>§10.1 Actions correctives :</strong> Recherche de cause racine et mise en œuvre d'actions curatives ciblées.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">·</span>
                      <span><strong>§10.2 Amélioration continue :</strong> Preuve tangible de l'efficacité du système requise par les auditeurs de certification.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('act')}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
              >
                <span>Accéder à la phase 4 : Act (Agir)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
              </button>
            </div>

          </div>

          {/* Tableau Récapitulatif : Correspondance Norme ISO 50001 & Modules UniSme */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Matrice de correspondance ISO 50001:2018 & Digitalisation UniSme
                </h4>
                <p className="text-[11px] text-slate-500">
                  Vue d'ensemble de la couverture des chapitres de la norme dans l'application
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Conforme ISO 50001
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Chapitre ISO 50001:2018</th>
                    <th className="px-4 py-2.5">Intitulé normatif</th>
                    <th className="px-4 py-2.5">Phase PDCA</th>
                    <th className="px-4 py-2.5">Module dans UniSme</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">Chapitre 4</td>
                    <td className="px-4 py-2.5 text-slate-700">Contexte, parties intéressées & domaine d'application</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px]">Plan</span></td>
                    <td className="px-4 py-2.5 text-slate-600">Périmètre physique, SWOT des risques & matrice des parties prenantes</td>
                    <td className="px-4 py-2.5 text-right"><button onClick={() => setActiveStep('plan')} className="text-emerald-700 hover:underline font-semibold text-[11px]">Ouvrir</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">Chapitre 5</td>
                    <td className="px-4 py-2.5 text-slate-700">Leadership, engagement & politique énergétique</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px]">Plan</span></td>
                    <td className="px-4 py-2.5 text-slate-600">Politique énergétique signée & matrice RACI des rôles</td>
                    <td className="px-4 py-2.5 text-right"><button onClick={() => setActiveStep('plan')} className="text-emerald-700 hover:underline font-semibold text-[11px]">Ouvrir</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">Chapitre 6</td>
                    <td className="px-4 py-2.5 text-slate-700">Planification énergétique, UES, IPÉ, SER & Cibles</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px]">Plan</span></td>
                    <td className="px-4 py-2.5 text-slate-600">Revue énergétique, formules IPÉ/SER & plan de comptage</td>
                    <td className="px-4 py-2.5 text-right"><button onClick={() => setActiveStep('plan')} className="text-emerald-700 hover:underline font-semibold text-[11px]">Ouvrir</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">Chapitre 7</td>
                    <td className="px-4 py-2.5 text-slate-700">Support, compétences, sensibilisation & communication</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[10px]">Do</span></td>
                    <td className="px-4 py-2.5 text-slate-600">Preuves de compétences des référents et opérateurs clés</td>
                    <td className="px-4 py-2.5 text-right"><button onClick={() => setActiveStep('do')} className="text-blue-700 hover:underline font-semibold text-[11px]">Ouvrir</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">Chapitre 8</td>
                    <td className="px-4 py-2.5 text-slate-700">Maîtrise opérationnelle, achats & conception</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[10px]">Do</span></td>
                    <td className="px-4 py-2.5 text-slate-600">Plan d'actions d'économies d'énergie chiffré & consignes d'exploitation</td>
                    <td className="px-4 py-2.5 text-right"><button onClick={() => setActiveStep('do')} className="text-blue-700 hover:underline font-semibold text-[11px]">Ouvrir</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">Chapitre 9</td>
                    <td className="px-4 py-2.5 text-slate-700">Évaluation des performances, audits internes & revue</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold text-[10px]">Check</span></td>
                    <td className="px-4 py-2.5 text-slate-600">Comparaison IPÉ vs SER, grille d'audits internes & revue de direction</td>
                    <td className="px-4 py-2.5 text-right"><button onClick={() => setActiveStep('check')} className="text-purple-700 hover:underline font-semibold text-[11px]">Ouvrir</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">Chapitre 10</td>
                    <td className="px-4 py-2.5 text-slate-700">Amélioration continue, non-conformités & actions correctives</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold text-[10px]">Act</span></td>
                    <td className="px-4 py-2.5 text-slate-600">Registre des non-conformités, analyse des causes & clôture d'écarts</td>
                    <td className="px-4 py-2.5 text-right"><button onClick={() => setActiveStep('act')} className="text-amber-700 hover:underline font-semibold text-[11px]">Ouvrir</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 1 : PLAN (PLANIFIER)
         ========================================================================= */}
      {activeStep === 'plan' && (
        <div className="space-y-8">
          
          {/* SECTION 1 : CHAPITRE 4 - CONTEXTE, PÉRIMÈTRE & DOMAINE D'APPLICATION */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chapitre 4 : Périmètre et Domaine d'Application du SMÉ (§4.3)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saisie en champ libre des limites physiques et organisationnelles pour lesquelles l'organisme a l'autorité de maîtriser son énergie.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">ISO 50001 §4.3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Périmètre physique du SMÉ (Installations, sites, frontières physiques) :
                </label>
                <textarea
                  rows={3}
                  value={perimetrePhysique}
                  onChange={(e) => setPerimetrePhysique(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                  placeholder="Renseignez ici les limites physiques, bâtiments, ateliers, postes de livraison..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Domaine d'application (Procédés, activités et types d'énergie inclus sans exclusion) :
                </label>
                <textarea
                  rows={3}
                  value={domaineApplication}
                  onChange={(e) => setDomaineApplication(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                  placeholder="Renseignez ici les activités, types de fluides (électricité, gaz naturel, vapeur, fioul)..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSavePerimetre}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors shadow-xs"
              >
                {isPerimetreSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isPerimetreSaved ? 'Périmètre Enregistré !' : 'Enregistrer Périmètre & Domaine'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 2 : TABLEAU SWOT TRADUIT EN FRANÇAIS (FORCES, FAIBLESSES, OPPORTUNITÉS, MENACES) */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chapitre 6.1 : Actions à mettre en œuvre face aux risques et opportunités (Matrice SWOT & Parades)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identification des enjeux internes (Forces / Faiblesses) et externes (Opportunités / Menaces-Risques).
                  <strong className="text-slate-800 ml-1">Chaque Faiblesse et Menace dispose d'un lien direct pour créer sa parade dans le Plan d'Actions d'Amélioration Énergétique (§6.2.3 & §8.1).</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveStep('do')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                  title="Consulter le Plan d'Actions d'Amélioration Énergétique (§6.2.3 & §8.1) dans l'étape Do"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Plan d'Actions d'Amélioration Énergétique (§6.2.3 & §8.1) ➔</span>
                </button>

                {accessMode === 'admin' && (
                  <button
                    onClick={() => setShowAddSWOT(!showAddSWOT)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Élément SWOT</span>
                  </button>
                )}
              </div>
            </div>

            {/* Formulaire ajout SWOT */}
            {showAddSWOT && (
              <form onSubmit={handleAddSWOT} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
                <div className="font-semibold text-slate-800">Ajout d'un élément dans la matrice SWOT en champ libre</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Quadrant :</label>
                    <select
                      value={newSWOTCategory}
                      onChange={(e) => setNewSWOTCategory(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    >
                      <option value="forces">Forces (Atouts internes)</option>
                      <option value="faiblesses">Faiblesses (Vulnérabilités internes - lien parade Do)</option>
                      <option value="opportunites">Opportunités (Leviers externes)</option>
                      <option value="menaces">Menaces & Risques (Aléas externes - lien parade Do)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Intitulé / Titre court :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pression compresseur instable"
                      value={newSWOTTitre}
                      onChange={(e) => setNewSWOTTitre(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Impact énergétique estimé :</label>
                    <select
                      value={newSWOTImpact}
                      onChange={(e) => setNewSWOTImpact(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    >
                      <option value="Majeur">Impact Majeur</option>
                      <option value="Moyen">Impact Moyen</option>
                      <option value="Mineur">Impact Mineur</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Description détaillée (champ libre) :</label>
                  <input
                    type="text"
                    placeholder="Précisez le constat, l'équipement concerné ou le contexte..."
                    value={newSWOTDesc}
                    onChange={(e) => setNewSWOTDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSWOT(false)}
                    className="px-3 py-1 text-slate-600 hover:text-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
                  >
                    Enregistrer dans SWOT
                  </button>
                </div>
              </form>
            )}

            {/* GRILLE SWOT 4 QUADRANTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. FORCES */}
              <div className="border border-emerald-200 bg-emerald-50/30 rounded-lg p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Forces (Atouts Internes)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    {swotItems.filter(s => s.categorie === 'forces').length} éléments
                  </span>
                </div>
                <div className="space-y-2">
                  {swotItems.filter(s => s.categorie === 'forces').map((item) => (
                    <div key={item.id} className="p-2.5 bg-white border border-emerald-100 rounded text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{item.titre}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                          {item.impact}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. FAIBLESSES (AVEC LIEN PARADE DO) */}
              <div className="border border-amber-200 bg-amber-50/30 rounded-lg p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Faiblesses (Vulnérabilités Internes)
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono">
                    Lien Parade ➔ Plan d'Action (Do)
                  </span>
                </div>
                <div className="space-y-2">
                  {swotItems.filter(s => s.categorie === 'faiblesses').map((item) => {
                    const actionLiee = actions.find(a => a.id === item.actionLieeId);
                    return (
                      <div key={item.id} className="p-2.5 bg-white border border-amber-200 rounded text-xs shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{item.titre}</span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px]">{item.description}</p>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          {actionLiee ? (
                            <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Parade active : {actionLiee.id} ({actionLiee.statut})
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Aucune parade associée</span>
                          )}

                          <button
                            onClick={() => handleCreateParadeAction(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors"
                            title="Créer une action de parade dans l'onglet Do"
                          >
                            <span>Parade (Do)</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. OPPORTUNITÉS */}
              <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-blue-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    Opportunités (Leviers Externes)
                  </span>
                  <span className="text-[10px] text-blue-700 font-mono">
                    {swotItems.filter(s => s.categorie === 'opportunites').length} éléments
                  </span>
                </div>
                <div className="space-y-2">
                  {swotItems.filter(s => s.categorie === 'opportunites').map((item) => (
                    <div key={item.id} className="p-2.5 bg-white border border-blue-100 rounded text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{item.titre}</span>
                        <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                          {item.impact}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. MENACES / RISQUES (AVEC LIEN PARADE DO) */}
              <div className="border border-rose-200 bg-rose-50/30 rounded-lg p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Menaces & Risques (Aléas Externes)
                  </span>
                  <span className="text-[10px] text-rose-700 font-mono">
                    Lien Parade ➔ Plan d'Action (Do)
                  </span>
                </div>
                <div className="space-y-2">
                  {swotItems.filter(s => s.categorie === 'menaces').map((item) => {
                    const actionLiee = actions.find(a => a.id === item.actionLieeId);
                    return (
                      <div key={item.id} className="p-2.5 bg-white border border-rose-200 rounded text-xs shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{item.titre}</span>
                          <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-medium">
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px]">{item.description}</p>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          {actionLiee ? (
                            <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Parade active : {actionLiee.id}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Risque à couvrir</span>
                          )}

                          <button
                            onClick={() => handleCreateParadeAction(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold transition-colors"
                            title="Créer une action de parade dans l'onglet Do"
                          >
                            <span>Parade (Do)</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3 : ANALYSE DÉTAILLÉE DES PARTIES PRENANTES (EXACTEMENT COMME LE TABLEAU DU DOCUMENT UPLOADÉ) */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chapitre 4.2 : Matrice & Analyse des Parties Prenantes
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identification des acteurs clés, cotation Pouvoir (Influence) & Intérêt, action sortante de la matrice, moyens de communication et vérification des actions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded">
                  {filteredStakeholders.length} / {stakeholders.length} partie(s) affichée(s)
                </span>
                {hasActiveStkFilters && (
                  <button
                    onClick={resetAllStkFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors text-xs font-semibold"
                    title="Effacer tous les filtres de colonnes"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Effacer filtres ({activeStkCount})</span>
                  </button>
                )}
                {accessMode === 'admin' ? (
                  <button
                    onClick={() => setShowAddStakeholder(!showAddStakeholder)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Partie Prenante</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 bg-slate-100 rounded border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Lecture seule (Consultation)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Formulaire ajout Partie Prenante */}
            {showAddStakeholder && (
              <form onSubmit={handleAddStakeholder} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
                <div className="font-semibold text-slate-800">Ajout d'une partie prenante dans la matrice</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Entreprise ou Entité :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Thales, DREAL, CSE..."
                      value={newStkEntite}
                      onChange={(e) => setNewStkEntite(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Influence ou Pouvoir (1 à 4) :</label>
                    <select
                      value={newStkInfluence}
                      onChange={(e) => setNewStkInfluence(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    >
                      <option value={4}>4 - Pouvoir Décisionnel Élevé (Rouge)</option>
                      <option value={3}>3 - Pouvoir Significatif (Orange)</option>
                      <option value={2}>2 - Pouvoir Modéré (Vert)</option>
                      <option value={1}>1 - Pouvoir Faible (Gris)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Intérêt (1 à 4) :</label>
                    <select
                      value={newStkInteret}
                      onChange={(e) => setNewStkInteret(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    >
                      <option value={4}>4 - Intérêt Critique (Rouge)</option>
                      <option value={3}>3 - Intérêt Fort (Jaune)</option>
                      <option value={2}>2 - Intérêt Modéré (Vert)</option>
                      <option value={1}>1 - Intérêt Faible (Gris)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Priorité :</label>
                    <select
                      value={newStkPriorite}
                      onChange={(e) => setNewStkPriorite(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    >
                      <option value="Haute">Haute</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Basse">Basse</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Rôle :</label>
                    <input
                      type="text"
                      placeholder="Ex: Sponsor stratégique, Garant du ROI..."
                      value={newStkRole}
                      onChange={(e) => setNewStkRole(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Attentes envers le SMÉ :</label>
                    <input
                      type="text"
                      placeholder="Ex: Réduction des coûts, conformité ICPE..."
                      value={newStkAttentes}
                      onChange={(e) => setNewStkAttentes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Moyen & Fréquence de communication :</label>
                    <input
                      type="text"
                      placeholder="Ex: Réunion mensuelle, GMAO, reporting..."
                      value={newStkMoyenCom}
                      onChange={(e) => setNewStkMoyenCom(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Actions à mener :</label>
                  <input
                    type="text"
                    placeholder="Ex: Valider l'enveloppe budgétaire, co-construire les consignes..."
                    value={newStkAction}
                    onChange={(e) => setNewStkAction(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddStakeholder(false)}
                    className="px-3 py-1 text-slate-600 hover:text-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
                  >
                    Ajouter au tableau
                  </button>
                </div>
              </form>
            )}

            {/* TABLEAU EXACT COMME LE TABLEUR DE L'IMAGE ATTACHÉE */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#0284C7] text-white font-semibold select-none">
                  <tr>
                    <th className="p-2.5 border-r border-sky-400 min-w-[190px]">
                      <TableColumnFilter
                        title="Entreprise ou Entité"
                        columnKey="entite"
                        theme="sky"
                        filterValue={stkColFilters.entite}
                        onFilterChange={(v) => updateStkColFilter('entite', v)}
                        sortDirection={stkSortCol === 'entite' ? stkSortDir : null}
                        onSort={(dir) => { setStkSortCol(dir ? 'entite' : null); setStkSortDir(dir); }}
                        searchPlaceholder="Ex: Thales, DREAL..."
                      />
                    </th>
                    <th className="p-2.5 text-center border-r border-sky-400 min-w-[150px]">
                      <TableColumnFilter
                        title="Influence (Pouvoir)"
                        columnKey="influence"
                        theme="sky"
                        align="center"
                        filterValue={stkColFilters.influence}
                        onFilterChange={(v) => updateStkColFilter('influence', v)}
                        options={stkInfluenceOptions}
                        sortDirection={stkSortCol === 'influence' ? stkSortDir : null}
                        onSort={(dir) => { setStkSortCol(dir ? 'influence' : null); setStkSortDir(dir); }}
                        dropdownWidth="w-56"
                      />
                    </th>
                    <th className="p-2.5 text-center border-r border-sky-400 min-w-[130px]">
                      <TableColumnFilter
                        title="Intérêt"
                        columnKey="interet"
                        theme="sky"
                        align="center"
                        filterValue={stkColFilters.interet}
                        onFilterChange={(v) => updateStkColFilter('interet', v)}
                        options={stkInteretOptions}
                        sortDirection={stkSortCol === 'interet' ? stkSortDir : null}
                        onSort={(dir) => { setStkSortCol(dir ? 'interet' : null); setStkSortDir(dir); }}
                        dropdownWidth="w-52"
                      />
                    </th>
                    <th className="p-2.5 text-center border-r border-sky-400 min-w-[180px]">
                      <TableColumnFilter
                        title="Action sortante matrice"
                        columnKey="actionMatrice"
                        theme="sky"
                        align="center"
                        filterValue={stkColFilters.actionMatrice}
                        onFilterChange={(v) => updateStkColFilter('actionMatrice', v)}
                        options={stkActionMatriceOptions}
                        dropdownWidth="w-56"
                      />
                    </th>
                    <th className="p-2.5 border-r border-sky-400 min-w-[180px]">
                      <TableColumnFilter
                        title="Moyen & Fréquence communication"
                        columnKey="communication"
                        theme="sky"
                        filterValue={stkColFilters.communication}
                        onFilterChange={(v) => updateStkColFilter('communication', v)}
                        searchPlaceholder="Ex: GMAO, Mensuel..."
                      />
                    </th>
                    <th className="p-2.5 border-r border-sky-400 min-w-[160px]">
                      <TableColumnFilter
                        title="Rôle"
                        columnKey="role"
                        theme="sky"
                        filterValue={stkColFilters.role}
                        onFilterChange={(v) => updateStkColFilter('role', v)}
                        searchPlaceholder="Ex: Sponsor, Exploitant..."
                      />
                    </th>
                    <th className="p-2.5 border-r border-sky-400 min-w-[190px]">
                      <TableColumnFilter
                        title="Attentes de la partie prenante"
                        columnKey="attentes"
                        theme="sky"
                        filterValue={stkColFilters.attentes}
                        onFilterChange={(v) => updateStkColFilter('attentes', v)}
                        searchPlaceholder="Ex: ROI, ICPE, Factures..."
                      />
                    </th>
                    <th className="p-2.5 border-r border-sky-400 min-w-[180px]">
                      <TableColumnFilter
                        title="Actions à mener"
                        columnKey="actionsMener"
                        theme="sky"
                        filterValue={stkColFilters.actionsMener}
                        onFilterChange={(v) => updateStkColFilter('actionsMener', v)}
                        searchPlaceholder="Ex: Valider budget, Former..."
                      />
                    </th>
                    <th className="p-2.5 text-center border-r border-sky-400 min-w-[120px]">
                      <TableColumnFilter
                        title="Priorités"
                        columnKey="priorite"
                        theme="sky"
                        align="center"
                        filterValue={stkColFilters.priorite}
                        onFilterChange={(v) => updateStkColFilter('priorite', v)}
                        options={stkPrioriteOptions}
                        dropdownWidth="w-48"
                      />
                    </th>
                    <th className="p-2.5 text-center min-w-[150px]">
                      <TableColumnFilter
                        title="Vérification des actions"
                        columnKey="verification"
                        theme="sky"
                        align="center"
                        filterValue={stkColFilters.verification}
                        onFilterChange={(v) => updateStkColFilter('verification', v)}
                        options={stkVerifOptions}
                        dropdownWidth="w-52"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStakeholders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                        Aucune partie prenante ne correspond aux critères de filtre sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredStakeholders.map((s) => {
                      // Styles des cellules d'influence / intérêt basés sur le tableau de l'utilisateur
                      const influenceBg =
                        s.influence === 4 ? 'bg-[#F87171] text-white font-bold' :
                        s.influence === 3 ? 'bg-[#FDBA74] text-slate-900 font-bold' :
                        'bg-[#86EFAC] text-slate-900 font-bold';

                      const interetBg =
                        s.interet === 4 ? 'bg-[#F87171] text-white font-bold' :
                        s.interet === 3 ? 'bg-[#FDE047] text-slate-900 font-bold' :
                        'bg-[#86EFAC] text-slate-900 font-bold';

                      const actionSortanteBg =
                        s.actionMatrice === 'Gérer avec attention' ? 'bg-[#FCA5A5] text-slate-900 font-semibold' :
                        s.actionMatrice === 'Maintenir satisfaits' ? 'bg-[#FED7AA] text-slate-900 font-semibold' :
                        'bg-[#BAE6FD] text-slate-900 font-semibold';

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">
                            {s.entite}
                          </td>
                          <td className={`p-3 text-center border-r border-slate-200 ${influenceBg}`}>
                            {s.influence}
                          </td>
                          <td className={`p-3 text-center border-r border-slate-200 ${interetBg}`}>
                            {s.interet}
                          </td>
                          <td className={`p-3 text-center border-r border-slate-200 ${actionSortanteBg}`}>
                            {s.actionMatrice}
                          </td>
                          <td className="p-3 text-slate-600 border-r border-slate-200">
                            {s.moyenFreqCom}
                          </td>
                          <td className="p-3 text-slate-700 border-r border-slate-200">
                            {s.role}
                          </td>
                          <td className="p-3 text-slate-700 border-r border-slate-200">
                            {s.attentes}
                          </td>
                          <td className="p-3 text-slate-800 border-r border-slate-200 font-medium">
                            {s.actionsMener}
                          </td>
                          <td className="p-3 text-center border-r border-slate-200">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.priorite === 'Haute' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {s.priorite}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              s.verification === 'Conforme' ? 'bg-emerald-100 text-emerald-800' :
                              s.verification === 'En cours' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {s.verification}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3B : CHAPITRE 5 - LEADERSHIP, POLITIQUE ÉNERGÉTIQUE & MATRICE RACI
             ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-6">
            
            {/* Header Chapitre 5 */}
            <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chapitre 5 : Leadership & Engagement (ISO 50001:2018)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    §5.1 · §5.2 · §5.3
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Engagement de la Direction Générale, formalisation de la Politique Énergétique et définition de la Matrice RACI des rôles & responsabilités.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {policy.statut}
                </span>
              </div>
            </div>

            {/* PARTIE 1 : TEMPLATE PRÊT À L'EMPLOI POUR LA POLITIQUE ÉNERGÉTIQUE (§5.2) */}
            <div className="border border-slate-200 rounded-lg bg-slate-50/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    §5.2 : Politique Énergétique Formelle (Template Interactif Prêt à l'Emploi)
                  </h4>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetPolicyTemplate}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
                    title="Restaurer le template officiel conforme ISO 50001"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Modèle ISO 50001</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPolicy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
                  >
                    {copiedPolicy ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePolicy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{policySaved ? 'Enregistré ✓' : 'Enregistrer la politique'}</span>
                  </button>
                </div>
              </div>

              {/* Métadonnées de signature de la politique */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded border border-slate-200 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Titre du document :</label>
                  <input
                    type="text"
                    value={policy.titre}
                    onChange={(e) => setPolicy({ ...policy, titre: e.target.value })}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Signataire & Fonction :</label>
                  <input
                    type="text"
                    value={policy.signataireNom}
                    onChange={(e) => setPolicy({ ...policy, signataireNom: e.target.value })}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Date de promulgation :</label>
                  <input
                    type="date"
                    value={policy.dateSignature}
                    onChange={(e) => setPolicy({ ...policy, dateSignature: e.target.value })}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Version & Périmètre :</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={policy.version}
                      onChange={(e) => setPolicy({ ...policy, version: e.target.value })}
                      className="w-20 p-1.5 border border-slate-300 rounded text-xs font-mono text-slate-800"
                      placeholder="V1.0"
                    />
                    <input
                      type="text"
                      value={policy.siteConcerne}
                      onChange={(e) => setPolicy({ ...policy, siteConcerne: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded text-xs text-slate-800"
                      placeholder="Site industriel..."
                    />
                  </div>
                </div>
              </div>

              {/* Cible chiffrée & Corps de texte */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-200/80 p-2.5 rounded text-xs">
                  <Target className="w-4 h-4 text-indigo-700 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold text-indigo-900 mr-2">Cible chiffrée majeure (§5.2 b) :</span>
                    <input
                      type="text"
                      value={policy.cibleChiffree}
                      onChange={(e) => setPolicy({ ...policy, cibleChiffree: e.target.value })}
                      className="bg-white border border-indigo-300 rounded px-2 py-1 text-xs text-indigo-950 font-medium w-full sm:w-auto sm:min-w-[400px] mt-1 sm:mt-0"
                    />
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={policy.textePolitique}
                    onChange={(e) => setPolicy({ ...policy, textePolitique: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-md text-xs font-mono text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
                  />
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>* Conforme aux 5 engagements obligatoires de la norme ISO 50001:2018 §5.2.</span>
                    <span>{policy.textePolitique.length} caractères</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PARTIE 2 : MATRICE RACI DES RÔLES ET RESPONSABILITÉS (§5.3) */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      §5.3 : Matrice RACI des Rôles, Responsabilités et Autorités
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Définition matricielle des niveaux d'intervention pour chaque processus clé du SMÉ.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded">
                    {filteredRaciItems.length} / {raciItems.length} activité(s) affichée(s)
                  </span>
                  {hasActiveRaciFilters && (
                    <button
                      onClick={resetAllRaciFilters}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors text-xs font-semibold"
                      title="Effacer tous les filtres de colonnes RACI"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Effacer filtres ({activeRaciCount})</span>
                    </button>
                  )}
                  {accessMode === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => setShowAddRACI(!showAddRACI)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une activité RACI</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 bg-slate-100 rounded border border-slate-200">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Lecture seule</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Légende RACI */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-700">Légende RACI :</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">R</span>
                  <span className="text-slate-600"><strong>Réalise (Responsible)</strong> : Responsable opérationnel</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center">A</span>
                  <span className="text-slate-600"><strong>Approuve (Accountable)</strong> : Autorité décisionnelle finale</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center">C</span>
                  <span className="text-slate-600"><strong>Consulté (Consulted)</strong> : Sollicité pour expertise</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold text-[11px] flex items-center justify-center">I</span>
                  <span className="text-slate-600"><strong>Informé (Informed)</strong> : Tenu au courant</span>
                </span>
              </div>

              {/* Formulaire d'ajout d'activité RACI en champ libre */}
              {showAddRACI && (
                <form onSubmit={handleAddRACI} className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-3">
                  <div className="font-bold text-xs text-slate-800">Ajouter une activité ou processus en champ libre :</div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Intitulé de l'activité / processus SMÉ :
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Suivi des dérives de consommation en heures creuses..."
                      value={newRACIActivite}
                      onChange={(e) => setNewRACIActivite(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate">Direction Gén. :</span>
                      <select
                        value={newRACIDir}
                        onChange={(e) => setNewRACIDir(e.target.value as RACIRole)}
                        className="w-full p-1 border border-slate-300 rounded font-bold text-center bg-white"
                      >
                        {['R', 'A', 'C', 'I', '-'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate">Pilote Énergie :</span>
                      <select
                        value={newRACIRef}
                        onChange={(e) => setNewRACIRef(e.target.value as RACIRole)}
                        className="w-full p-1 border border-slate-300 rounded font-bold text-center bg-white"
                      >
                        {['R', 'A', 'C', 'I', '-'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate">Maintenance :</span>
                      <select
                        value={newRACIMaint}
                        onChange={(e) => setNewRACIMaint(e.target.value as RACIRole)}
                        className="w-full p-1 border border-slate-300 rounded font-bold text-center bg-white"
                      >
                        {['R', 'A', 'C', 'I', '-'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate">Production :</span>
                      <select
                        value={newRACIProd}
                        onChange={(e) => setNewRACIProd(e.target.value as RACIRole)}
                        className="w-full p-1 border border-slate-300 rounded font-bold text-center bg-white"
                      >
                        {['R', 'A', 'C', 'I', '-'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate">Achats/Travaux :</span>
                      <select
                        value={newRACIAchats}
                        onChange={(e) => setNewRACIAchats(e.target.value as RACIRole)}
                        className="w-full p-1 border border-slate-300 rounded font-bold text-center bg-white"
                      >
                        {['R', 'A', 'C', 'I', '-'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate">Opérateurs :</span>
                      <select
                        value={newRACIOp}
                        onChange={(e) => setNewRACIOp(e.target.value as RACIRole)}
                        className="w-full p-1 border border-slate-300 rounded font-bold text-center bg-white"
                      >
                        {['R', 'A', 'C', 'I', '-'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddRACI(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                    >
                      Ajouter à la matrice
                    </button>
                  </div>
                </form>
              )}

              {/* Tableau interactif RACI */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-800 text-white font-semibold select-none">
                    <tr>
                      <th className="p-2.5 border-r border-slate-700 min-w-[280px]">
                        <TableColumnFilter
                          title="Processus / Activité clé du SMÉ"
                          columnKey="activite"
                          theme="dark"
                          filterValue={raciColFilters.activite}
                          onFilterChange={(v) => updateRaciColFilter('activite', v)}
                          sortDirection={raciSortCol === 'activite' ? raciSortDir : null}
                          onSort={(dir) => { setRaciSortCol(dir ? 'activite' : null); setRaciSortDir(dir); }}
                          searchPlaceholder="Ex: audit, revue, dérives..."
                        />
                      </th>
                      <th className="p-2.5 text-center border-r border-slate-700 min-w-[130px]">
                        <TableColumnFilter
                          title="Direction Générale"
                          columnKey="direction"
                          theme="dark"
                          align="center"
                          filterValue={raciColFilters.direction}
                          onFilterChange={(v) => updateRaciColFilter('direction', v)}
                          options={raciRoleOptions}
                          dropdownWidth="w-56"
                        />
                      </th>
                      <th className="p-2.5 text-center border-r border-slate-700 min-w-[140px]">
                        <TableColumnFilter
                          title="Pilote / Référent Énergie"
                          columnKey="referentEnergie"
                          theme="dark"
                          align="center"
                          filterValue={raciColFilters.referentEnergie}
                          onFilterChange={(v) => updateRaciColFilter('referentEnergie', v)}
                          options={raciRoleOptions}
                          dropdownWidth="w-56"
                        />
                      </th>
                      <th className="p-2.5 text-center border-r border-slate-700 min-w-[140px]">
                        <TableColumnFilter
                          title="Resp. Maint. & Utilités"
                          columnKey="maintenanceUtilites"
                          theme="dark"
                          align="center"
                          filterValue={raciColFilters.maintenanceUtilites}
                          onFilterChange={(v) => updateRaciColFilter('maintenanceUtilites', v)}
                          options={raciRoleOptions}
                          dropdownWidth="w-56"
                        />
                      </th>
                      <th className="p-2.5 text-center border-r border-slate-700 min-w-[140px]">
                        <TableColumnFilter
                          title="Chefs d'Atelier / Prod."
                          columnKey="production"
                          theme="dark"
                          align="center"
                          filterValue={raciColFilters.production}
                          onFilterChange={(v) => updateRaciColFilter('production', v)}
                          options={raciRoleOptions}
                          dropdownWidth="w-56"
                        />
                      </th>
                      <th className="p-2.5 text-center border-r border-slate-700 min-w-[140px]">
                        <TableColumnFilter
                          title="Achats & Travaux Neufs"
                          columnKey="achatsTravaux"
                          theme="dark"
                          align="center"
                          filterValue={raciColFilters.achatsTravaux}
                          onFilterChange={(v) => updateRaciColFilter('achatsTravaux', v)}
                          options={raciRoleOptions}
                          dropdownWidth="w-56"
                        />
                      </th>
                      <th className="p-2.5 text-center border-r border-slate-700 min-w-[130px]">
                        <TableColumnFilter
                          title="Opérateurs Terrain"
                          columnKey="operateurs"
                          theme="dark"
                          align="center"
                          filterValue={raciColFilters.operateurs}
                          onFilterChange={(v) => updateRaciColFilter('operateurs', v)}
                          options={raciRoleOptions}
                          dropdownWidth="w-56"
                        />
                      </th>
                      <th className="p-2.5 text-center w-12 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRaciItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                          Aucun processus RACI ne correspond aux filtres de recherche.
                        </td>
                      </tr>
                    ) : (
                      filteredRaciItems.map((item) => {
                        const getRoleBadge = (role: RACIRole, key: keyof RACIItem) => {
                          const bgClass =
                            role === 'R' ? 'bg-emerald-600 text-white' :
                            role === 'A' ? 'bg-blue-800 text-white' :
                            role === 'C' ? 'bg-amber-500 text-white' :
                            role === 'I' ? 'bg-slate-400 text-white' :
                            'bg-slate-100 text-slate-400';

                          if (accessMode === 'consultation') {
                            return (
                              <span
                                className={`w-7 h-7 rounded-md font-bold text-xs inline-flex items-center justify-center shadow-2xs ${bgClass}`}
                                title={`Rôle : ${role}`}
                              >
                                {role}
                              </span>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                const nextMap: Record<RACIRole, RACIRole> = { 'R': 'A', 'A': 'C', 'C': 'I', 'I': '-', '-': 'R' };
                                handleUpdateRACIRole(item.id, key, nextMap[role]);
                              }}
                              title={`Cliquer pour alterner (R -> A -> C -> I) : Actuellement ${role}`}
                              className={`w-7 h-7 rounded-md font-bold text-xs inline-flex items-center justify-center shadow-2xs hover:scale-105 transition-transform ${bgClass}`}
                            >
                              {role}
                            </button>
                          );
                        };

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-medium text-slate-900 border-r border-slate-200">
                              {item.activite}
                            </td>
                            <td className="p-2 text-center border-r border-slate-200">
                              {getRoleBadge(item.direction, 'direction')}
                            </td>
                            <td className="p-2 text-center border-r border-slate-200">
                              {getRoleBadge(item.referentEnergie, 'referentEnergie')}
                            </td>
                            <td className="p-2 text-center border-r border-slate-200">
                              {getRoleBadge(item.maintenanceUtilites, 'maintenanceUtilites')}
                            </td>
                            <td className="p-2 text-center border-r border-slate-200">
                              {getRoleBadge(item.production, 'production')}
                            </td>
                            <td className="p-2 text-center border-r border-slate-200">
                              {getRoleBadge(item.achatsTravaux, 'achatsTravaux')}
                            </td>
                            <td className="p-2 text-center border-r border-slate-200">
                              {getRoleBadge(item.operateurs, 'operateurs')}
                            </td>
                            <td className="p-2 text-center">
                              {accessMode === 'admin' ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRACI(item.id)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="Supprimer cette ligne RACI"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* SECTION : CHAPITRE 6.2 - OBJECTIFS, CIBLES ÉNERGÉTIQUES ET PLANS D'ACTIONS */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chapitre 6.2 : Objectifs, Cibles Énergétiques et Plans d'Actions
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                    ISO 50001 §6.2
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Définition d'objectifs quantifiables pour les fonctions et niveaux pertinents, cohérents avec la politique énergétique (§5.2) et déployés dans le plan d'actions (§6.2.3).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveStep('do')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                  title="Voir la déclinaison des actions dans l'étape Do (§6.2.3 & §8.1)"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Plan d'Actions (§6.2.3 & §8.1) ➔</span>
                </button>

                {accessMode === 'admin' && (
                  <button
                    onClick={handleOpenAddObjective}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvel Objectif / Cible</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tableau des Objectifs & Cibles */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 select-none">
                  <tr>
                    <th className="p-2.5 w-20 font-bold">Réf</th>
                    <th className="p-2.5 min-w-[240px] font-bold">Objectif / Cible Énergétique</th>
                    <th className="p-2.5 w-44 font-bold">UES Concernée</th>
                    <th className="p-2.5 w-40 font-bold">Cible Chiffrée</th>
                    <th className="p-2.5 w-44 font-bold">Indicateur IPÉ Lié</th>
                    <th className="p-2.5 w-32 font-bold">Échéance</th>
                    <th className="p-2.5 w-28 font-bold">Statut</th>
                    {accessMode === 'admin' && <th className="p-2.5 w-24 text-right font-bold">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {objectives.map((obj) => (
                    <tr key={obj.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-slate-900">{obj.id}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-900">{obj.titre}</div>
                        <div className="text-[11px] text-slate-500">Resp: {obj.responsable}</div>
                      </td>
                      <td className="p-2.5 text-slate-700 font-medium">{obj.ues}</td>
                      <td className="p-2.5 font-mono font-bold text-indigo-700">{obj.cibleChiffree}</td>
                      <td className="p-2.5 text-slate-600 font-mono text-[11px]">{obj.indicateurIpeLie}</td>
                      <td className="p-2.5 text-slate-600 font-mono">{obj.echeance}</td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          obj.statut === 'Atteint'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : obj.statut === 'En cours'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : obj.statut === 'Planifié'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {obj.statut}
                        </span>
                      </td>
                      {accessMode === 'admin' && (
                        <td className="p-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleEditObjective(obj)}
                              className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Modifier cet objectif"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteObjective(obj.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Supprimer cet objectif"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4 : CHAPITRE 6.3 - REVUE ÉNERGÉTIQUE AVEC TABLEAU UES ET CAMEMBERT */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chapitre 6.3 : Revue Énergétique & Usages Énergétiques Significatifs (UES)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identification et hiérarchisation des équipements et procédés consommateurs d'énergie.
                  <strong className="text-slate-800 ml-1">Tableau de consommation et répartition sous forme de camembert (Pie Chart).</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded">
                  {filteredUesList.length} / {uesList.length} UES affiché(s)
                </span>
                {hasActiveUesFilters && (
                  <button
                    onClick={resetAllUesFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors text-xs font-semibold"
                    title="Effacer tous les filtres de colonnes UES"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Effacer filtres ({activeUesCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sous-bloc : Document officiel de la Dernière Revue Énergétique (§6.3) */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  {revueDoc.type === 'pdf' ? <FileText className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{revueDoc.nom}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-200/60 text-emerald-900 border border-emerald-300">
                      {revueDoc.type === 'pdf' ? 'Rapport PDF Officiel' : 'Lien GED / Intranet'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Validé le <strong>{revueDoc.dateValidation}</strong> par {revueDoc.validePar} {revueDoc.taille ? `(${revueDoc.taille})` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <a
                  href={revueDoc.urlOuChemin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (revueDoc.urlOuChemin.startsWith('/')) {
                      e.preventDefault();
                      alert(`Consultation du document officiel : ${revueDoc.nom}\nValidé par : ${revueDoc.validePar}\nDate de validation : ${revueDoc.dateValidation}`);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold shadow-2xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Consulter le rapport officiel</span>
                </a>

                {accessMode === 'admin' && (
                  <button
                    onClick={() => {
                      setDocInputType(revueDoc.type);
                      setDocInputNom(revueDoc.nom);
                      setDocInputUrl(revueDoc.urlOuChemin);
                      setDocInputDate(revueDoc.dateValidation);
                      setDocInputValidePar(revueDoc.validePar);
                      setIsDocRevueModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold shadow-2xs transition-colors"
                    title="Mettre à jour ou remplacer la revue énergétique (PDF ou GED)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Mettre à jour / Remplacer</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* TABLEAU DES UES */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 select-none">
                    <tr>
                      <th className="p-2.5 w-24">
                        <TableColumnFilter
                          title="Réf"
                          columnKey="id"
                          filterValue={uesColFilters.id}
                          onFilterChange={(v) => updateUesColFilter('id', v)}
                          sortDirection={uesSortCol === 'id' ? uesSortDir : null}
                          onSort={(dir) => { setUesSortCol(dir ? 'id' : null); setUesSortDir(dir); }}
                          searchPlaceholder="Ex: UES-01..."
                        />
                      </th>
                      <th className="p-2.5 min-w-[200px]">
                        <TableColumnFilter
                          title="Usage Énergétique Significatif"
                          columnKey="nom"
                          filterValue={uesColFilters.nom}
                          onFilterChange={(v) => updateUesColFilter('nom', v)}
                          sortDirection={uesSortCol === 'nom' ? uesSortDir : null}
                          onSort={(dir) => { setUesSortCol(dir ? 'nom' : null); setUesSortDir(dir); }}
                          searchPlaceholder="Ex: Froid, Fours..."
                        />
                      </th>
                      <th className="p-2.5 w-36">
                        <TableColumnFilter
                          title="Vecteur"
                          columnKey="vecteur"
                          filterValue={uesColFilters.vecteur}
                          onFilterChange={(v) => updateUesColFilter('vecteur', v)}
                          options={uesVecteurOptions}
                          dropdownWidth="w-52"
                        />
                      </th>
                      <th className="p-2.5 w-32 text-right">
                        <TableColumnFilter
                          title="Part (%)"
                          columnKey="partConso"
                          align="right"
                          filterValue=""
                          onFilterChange={() => {}}
                          sortDirection={uesSortCol === 'partConso' ? uesSortDir : null}
                          onSort={(dir) => { setUesSortCol(dir ? 'partConso' : null); setUesSortDir(dir); }}
                          hasSearch={false}
                          dropdownWidth="w-48"
                        />
                      </th>
                      <th className="p-2.5 min-w-[170px]">
                        <TableColumnFilter
                          title="Facteurs pertinents"
                          columnKey="facteurs"
                          filterValue={uesColFilters.facteurs}
                          onFilterChange={(v) => updateUesColFilter('facteurs', v)}
                          searchPlaceholder="Ex: DJU, Tonnes..."
                        />
                      </th>
                      <th className="p-2.5 min-w-[150px]">
                        <TableColumnFilter
                          title="Responsable"
                          columnKey="responsable"
                          filterValue={uesColFilters.responsable}
                          onFilterChange={(v) => updateUesColFilter('responsable', v)}
                          searchPlaceholder="Ex: Dubois, Martin..."
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUesList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                          Aucun UES ne correspond aux critères de filtre.
                        </td>
                      </tr>
                    ) : (
                      filteredUesList.map((ues) => (
                        <tr key={ues.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{ues.id}</td>
                          <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ues.couleur || '#2563EB' }} />
                            {ues.nom}
                          </td>
                          <td className="p-3 text-slate-600">{ues.vecteur}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {ues.part_conso.toFixed(1)} %
                          </td>
                          <td className="p-3 text-slate-600">{ues.facteurs}</td>
                          <td className="p-3 text-slate-600">{ues.responsable}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* CAMEMBERT (PIE CHART SVG INTERACTIF) */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Camembert de Répartition UES
                </span>

                <svg viewBox="0 0 200 200" className="w-48 h-48 select-none">
                  {pieSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="hover:opacity-85 transition-opacity cursor-pointer"
                    >
                      <title>{`${slice.ues.nom} : ${slice.pct}%`}</title>
                    </path>
                  ))}
                  {/* Donut inner circle */}
                  <circle cx="100" cy="100" r="42" fill="#FFFFFF" />
                  <text x="100" y="98" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0F172A">
                    100%
                  </text>
                  <text x="100" y="112" textAnchor="middle" fontSize="8" fill="#64748B">
                    UES Usine
                  </text>
                </svg>

                {/* Légende camembert */}
                <div className="w-full grid grid-cols-2 gap-1.5 mt-3 text-[10px]">
                  {pieSlices.map((slice, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="text-slate-700 truncate" title={slice.ues.nom}>
                        {slice.ues.nom.split(' ')[0]} ({slice.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 5 : CHAPITRE 6.4 & 6.5 - IPÉ & SER AVEC SÉLECTION DE PÉRIODE */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>Chapitres 6.4 & 6.5 : Indicateurs de Performance Énergétique (IPÉ) et Situations de Référence (SER)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    ISO 50006
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Évaluation continue de l'efficacité énergétique par comparaison entre la valeur mesurée sur la période sélectionnée et la situation de référence (SER).
                </p>
              </div>

              {/* Sélecteur de période */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto overflow-x-auto">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2 hidden sm:inline">Période :</span>
                {[
                  { id: 'mois', label: 'Dernier Mois' },
                  { id: 'trimestre', label: 'Trimestre T3' },
                  { id: 'annee', label: 'Année YTD' },
                  { id: 'ser_ref', label: 'Réf SER' },
                  { id: 'glissant', label: '12M Glissants' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedIpePeriod(p.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedIpePeriod === p.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ipeList.map((ipe) => {
                const pData = getIpePeriodData(ipe, selectedIpePeriod);
                return (
                  <div key={ipe.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:border-slate-300 transition-all space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{ipe.id} · {ipe.ues}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                        pData.isImprovement
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {pData.diffPct > 0 ? `+${pData.diffPct}%` : `${pData.diffPct}%`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{ipe.nom}</h4>

                    <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/80">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 text-[11px]">{pData.labelPeriod} :</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{pData.currentVal} {ipe.unite}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 text-[11px]">Situation Réf (SER) :</span>
                        <span className="font-mono text-slate-600">{ipe.valeur_ser} {ipe.unite}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                        <span className="text-slate-500 text-[11px]">Évolution vs SER :</span>
                        <span className={`font-mono font-bold text-xs ${pData.isImprovement ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {pData.diffPct <= 0 ? `${pData.diffPct}% (Gain d'énergie)` : `+${pData.diffPct}% (Dérive)`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 6 : CHAPITRE 6.6 - PLANIFICATION DE LA COLLECTE DE DONNÉES ÉNERGÉTIQUES (PLAN DE COMPTAGE) */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chapitre 6.6 : Planification de la Collecte de Données Énergétiques (Plan de Comptage)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    ISO 50001 §6.6
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  L'organisme doit définir et mettre en œuvre un plan de collecte de données énergétiques adapté à sa taille et à ses UES, précisant les grandeurs mesurées, la fréquence de relève et la métrologie/étalonnage.
                </p>
              </div>

              {/* Bouton de redirection vers la Cartographie des compteurs */}
              <button
                type="button"
                onClick={onNavigateToCartographie}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all group shrink-0"
                title="Consulter et configurer le plan de comptage, l'arborescence des sous-compteurs et l'autoproduction"
              >
                <Network className="w-4 h-4 text-emerald-200" />
                <span>Cartographie & Sous-Comptage Énergétique ➔</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Grille synthétique des exigences métrologiques §6.6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">1. Compteurs de Tête</span>
                <p className="text-slate-600 text-[11px]">
                  Télérelève Enedis (HTA 20 kV) et GRDF gaz au pas 10 min. Base contractuelle et bilan global du site.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-bold text-emerald-700">Pas 10 min · IoT 4G</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">2. Sous-comptage UES</span>
                <p className="text-slate-600 text-[11px]">
                  Sous-compteurs Froid NH3, Compresseurs et Fours de cuisson. Taux de couverture de 87,8% (supérieur au seuil AFNOR &gt;80%).
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-bold text-blue-700">Pas 10 min · Départs TGBT</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">3. Relevés Manuels d'Index</span>
                <p className="text-slate-600 text-[11px]">
                  Tournée hebdomadaire d'index (gaz séchoirs, utilités, eau adoucie). Système certifié ancien vs nouveau relevé.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-bold text-amber-700">Hebdomadaire · Saisie Index</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">4. Étalonnage & Métrologie</span>
                <p className="text-slate-600 text-[11px]">
                  Contrôle périodique annuel des tores de mesure, transformateurs de courant (TC) et étalonnage des transmetteurs de pression.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-bold text-indigo-700">Annuel · Registre d'étalonnage</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          PHASE 2 : DO (RÉALISER)
         ========================================================================= */}
      {activeStep === 'do' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Plan d'Actions d'Amélioration Énergétique (§6.2.3 & §8.1)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mise en œuvre des parades face aux risques et faiblesses identifiés en phase Plan (§4 / §6.1).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded">
                  {filteredActions.length} / {actions.length} action(s) affichée(s)
                </span>
                {hasActiveActionFilters && (
                  <button
                    onClick={resetAllActionFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors text-xs font-semibold"
                    title="Effacer tous les filtres de colonnes du plan d'actions"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Effacer filtres ({activeActionCount})</span>
                  </button>
                )}
                {accessMode === 'admin' ? (
                  <button
                    onClick={() => setShowAddAction(!showAddAction)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvelle Action</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 bg-slate-100 rounded border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Lecture seule</span>
                  </span>
                )}
              </div>
            </div>

            {/* Formulaire ajout action */}
            {showAddAction && (
              <form onSubmit={handleAddAction} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-xs space-y-3">
                <div className="font-semibold text-slate-800">Créer une action / parade énergétique</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Titre de l'action / Parade :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Optimisation pression compresseurs"
                      value={newActionTitre}
                      onChange={(e) => setNewActionTitre(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">UES concerné :</label>
                    <select
                      value={newActionUES}
                      onChange={(e) => setNewActionUES(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    >
                      {uesList.map(u => (
                        <option key={u.id} value={u.nom}>{u.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Pilote / Responsable :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: P. Dubois (Maintenance)"
                      value={newActionResp}
                      onChange={(e) => setNewActionResp(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Gain visé (kWh/an) :</label>
                    <input
                      type="number"
                      value={newActionGain}
                      onChange={(e) => setNewActionGain(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Budget prévisionnel (k€) :</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newActionBudget}
                      onChange={(e) => setNewActionBudget(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Échéance cible :</label>
                    <input
                      type="date"
                      value={newActionEcheance}
                      onChange={(e) => setNewActionEcheance(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAction(false)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
                  >
                    Enregistrer l'action
                  </button>
                </div>
              </form>
            )}

            {/* Tableau des actions */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 select-none">
                  <tr>
                    <th className="p-2.5 w-24">
                      <TableColumnFilter
                        title="Réf"
                        columnKey="id"
                        filterValue={actionColFilters.id}
                        onFilterChange={(v) => updateActionColFilter('id', v)}
                        sortDirection={actionSortCol === 'id' ? actionSortDir : null}
                        onSort={(dir) => { setActionSortCol(dir ? 'id' : null); setActionSortDir(dir); }}
                        searchPlaceholder="Ex: ACT-01..."
                      />
                    </th>
                    <th className="p-2.5 min-w-[220px]">
                      <TableColumnFilter
                        title="Intitulé de l'action"
                        columnKey="titre"
                        filterValue={actionColFilters.titre}
                        onFilterChange={(v) => updateActionColFilter('titre', v)}
                        sortDirection={actionSortCol === 'titre' ? actionSortDir : null}
                        onSort={(dir) => { setActionSortCol(dir ? 'titre' : null); setActionSortDir(dir); }}
                        searchPlaceholder="Ex: compresseurs, LED..."
                      />
                    </th>
                    <th className="p-2.5 min-w-[160px]">
                      <TableColumnFilter
                        title="Origine SWOT / Risque"
                        columnKey="origine_swot"
                        filterValue={actionColFilters.origine_swot}
                        onFilterChange={(v) => updateActionColFilter('origine_swot', v)}
                        searchPlaceholder="Ex: Menace, Faiblesse..."
                      />
                    </th>
                    <th className="p-2.5 min-w-[170px]">
                      <TableColumnFilter
                        title="UES Cible"
                        columnKey="ues"
                        filterValue={actionColFilters.ues}
                        onFilterChange={(v) => updateActionColFilter('ues', v)}
                        options={actionUESOptions}
                        dropdownWidth="w-56"
                      />
                    </th>
                    <th className="p-2.5 min-w-[150px]">
                      <TableColumnFilter
                        title="Pilote"
                        columnKey="responsable"
                        filterValue={actionColFilters.responsable}
                        onFilterChange={(v) => updateActionColFilter('responsable', v)}
                        searchPlaceholder="Ex: Dubois, Lemoine..."
                      />
                    </th>
                    <th className="p-2.5 w-32">
                      <TableColumnFilter
                        title="Échéance"
                        columnKey="echeance"
                        filterValue={actionColFilters.echeance}
                        onFilterChange={(v) => updateActionColFilter('echeance', v)}
                        sortDirection={actionSortCol === 'echeance' ? actionSortDir : null}
                        onSort={(dir) => { setActionSortCol(dir ? 'echeance' : null); setActionSortDir(dir); }}
                        searchPlaceholder="Ex: 2025..."
                      />
                    </th>
                    <th className="p-2.5 w-36 text-right">
                      <TableColumnFilter
                        title="Gain visé (kWh/an)"
                        columnKey="gain_kwh_an"
                        align="right"
                        filterValue=""
                        onFilterChange={() => {}}
                        sortDirection={actionSortCol === 'gain_kwh_an' ? actionSortDir : null}
                        onSort={(dir) => { setActionSortCol(dir ? 'gain_kwh_an' : null); setActionSortDir(dir); }}
                        hasSearch={false}
                        dropdownWidth="w-48"
                      />
                    </th>
                    <th className="p-2.5 w-28 text-right">
                      <TableColumnFilter
                        title="Budget (k€)"
                        columnKey="budget_ke"
                        align="right"
                        filterValue=""
                        onFilterChange={() => {}}
                        sortDirection={actionSortCol === 'budget_ke' ? actionSortDir : null}
                        onSort={(dir) => { setActionSortCol(dir ? 'budget_ke' : null); setActionSortDir(dir); }}
                        hasSearch={false}
                        dropdownWidth="w-48"
                      />
                    </th>
                    <th className="p-2.5 w-32 text-center">
                      <TableColumnFilter
                        title="Statut"
                        columnKey="statut"
                        align="center"
                        filterValue={actionColFilters.statut}
                        onFilterChange={(v) => updateActionColFilter('statut', v)}
                        options={actionStatutOptions}
                        dropdownWidth="w-48"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                        Aucune action ne correspond aux filtres appliqués.
                      </td>
                    </tr>
                  ) : (
                    filteredActions.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-slate-900">{act.id}</td>
                        <td className="p-3 font-medium text-slate-900">{act.titre}</td>
                        <td className="p-3 text-slate-600">
                          {act.origine_swot ? (
                            <span className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {act.origine_swot}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{act.ues}</td>
                        <td className="p-3 text-slate-600">{act.responsable}</td>
                        <td className="p-3 font-mono text-slate-600">{act.echeance}</td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-900">
                          {act.gain_vise_kwh.toLocaleString('fr-FR')}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-700">{act.budget_keuros.toFixed(1)}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              act.statut === 'Terminé'
                                ? 'bg-emerald-100 text-emerald-800'
                                : act.statut === 'En cours'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {act.statut}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chapitre 7.2 : Compétences, Habilitations & Preuves documentaires */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Chapitre 7.2 : Compétences & Habilitations Clés
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      §7.2 Preuves d'Audit
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestion des preuves de qualification exigées lors des audits ISO 50001 : <strong>téléversement direct de fichiers</strong> (PDF, attestations) ou <strong>liens vers votre GED / SharePoint</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddComp(!showAddComp)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une qualification</span>
                </button>
              </div>

              {/* Formulaire d'ajout de qualification & justificatif */}
              {showAddComp && (
                <form onSubmit={handleAddCompetence} className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Nouvelle qualification / compétence à rattacher au SMÉ :</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Poste ou Fonction clé :</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Électriciens Usine, Conducteurs Fours..."
                        value={newCompPoste}
                        onChange={(e) => setNewCompPoste(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Titulaire(s) :</label>
                      <input
                        type="text"
                        placeholder="Ex: Nom de la personne ou équipe"
                        value={newCompTitulaire}
                        onChange={(e) => setNewCompTitulaire(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">UES rattachée :</label>
                      <select
                        value={newCompUES}
                        onChange={(e) => setNewCompUES(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      >
                        <option value="Transversal (Toutes UES)">Transversal (Toutes UES)</option>
                        {uesList.map(u => (
                          <option key={u.id} value={`${u.id} (${u.nom})`}>{u.id} - {u.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Intitulé du titre / qualification :</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Habilitation BR / BC, Stage éco-conduite vapeur..."
                        value={newCompQualif}
                        onChange={(e) => setNewCompQualif(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Statut de validité / Échéance :</label>
                      <input
                        type="text"
                        placeholder="Ex: Habilité (Valide jusqu'en 2027)"
                        value={newCompValidite}
                        onChange={(e) => setNewCompValidite(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>

                  {/* Choix de la méthode de justification documentaire */}
                  <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Méthode de justification de la preuve documentaire (ISO 50001 §7.2) :
                    </label>

                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="modePreuve"
                          checked={newCompMode === 'fichier'}
                          onChange={() => setNewCompMode('fichier')}
                        />
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                          Insérer / Téléverser un fichier justificatif (PDF, image, scan)
                        </span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="modePreuve"
                          checked={newCompMode === 'lien'}
                          onChange={() => setNewCompMode('lien')}
                        />
                        <span className="flex items-center gap-1">
                          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                          Indiquer un lien / URL vers la GED ou le serveur interne
                        </span>
                      </label>
                    </div>

                    {newCompMode === 'fichier' ? (
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-500 block mb-1">Sélectionnez le fichier justificatif :</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewCompFichierNom(e.target.files[0].name);
                            }
                          }}
                          className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                    ) : (
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-500 block mb-1">Lien URL ou chemin réseau vers le dossier GED :</label>
                        <input
                          type="text"
                          placeholder="https://ged.entreprise.com/hse/habilitations/doc.pdf ou \\serveur\rh\..."
                          value={newCompLien}
                          onChange={(e) => setNewCompLien(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddComp(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      Enregistrer la qualification
                    </button>
                  </div>
                </form>
              )}

              {/* Liste des compétences avec gestion des justificatifs */}
              <div className="space-y-3">
                {competences.map((comp) => {
                  const isFileMode = comp.modePreuve === 'fichier';
                  return (
                    <div
                      key={comp.id}
                      className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2.5"
                    >
                      {/* Ligne 1 : Titre du poste & Statut */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{comp.poste}</span>
                            {comp.titulaire && (
                              <span className="text-[11px] text-slate-500 font-medium">({comp.titulaire})</span>
                            )}
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-mono">
                              {comp.ues}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">{comp.qualification}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-emerald-700 font-semibold text-xs px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            {comp.statutValidite}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCompetence(comp.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Supprimer cette compétence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Ligne 2 : ZONE DE JUSTIFICATION (Fichier vs Lien) */}
                      <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        
                        {/* Sélecteur de mode & statut */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type de justificatif :</span>
                          <div className="inline-flex rounded-md shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleToggleCompetenceMode(comp.id, 'fichier')}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-l border ${
                                isFileMode
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                Fichier joint
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleCompetenceMode(comp.id, 'lien')}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-r border-t border-r border-b ${
                                !isFileMode
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                Lien GED
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Contenu selon le mode */}
                        <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                          {isFileMode ? (
                            <div className="flex items-center gap-2 truncate">
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold text-slate-800 truncate block">
                                  {comp.fichierNom || 'attestation_document.pdf'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {comp.fichierTaille || '1.1 Mo'} · Enregistré le {comp.fichierDate || '2024-05-12'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center gap-2 truncate">
                              <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
                              <input
                                type="text"
                                value={comp.lienGedUrl || ''}
                                onChange={(e) => handleUpdateCompetenceLink(comp.id, e.target.value)}
                                placeholder="Indiquez l'URL GED..."
                                className="w-full text-xs font-mono text-blue-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 truncate"
                              />
                            </div>
                          )}

                          {/* Boutons d'actions pour le justificatif */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isFileMode ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(comp)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-medium transition-colors"
                                  title="Consulter le certificat ou l'attestation"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Consulter</span>
                                </button>

                                <label className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[11px] font-medium cursor-pointer transition-colors">
                                  <Upload className="w-3 h-3 text-slate-500" />
                                  <span>Remplacer</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleUploadProofFile(comp.id, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(comp.id, comp.lienGedUrl || '')}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[11px] font-medium transition-colors"
                                  title="Copier le lien GED"
                                >
                                  {copiedLinkIndex === comp.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copié</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-500" />
                                      <span>Copier</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={comp.lienGedUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Ouvrir</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Guide méthodologique pour l'auditeur ISO 50001 */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md text-[11px] text-amber-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Conformité d'audit ISO 50001 §7.2 :</strong> Vous pouvez présenter soit les <em>fichiers numérisés</em> (scans de diplômes, certificats d'organismes agréés), soit les <em>liens GED directs</em> vers votre système de gestion documentaire interne. Les deux approches sont valides dès lors que la preuve de compétence reste consultable et vérifiable le jour de l'audit.
                </div>
              </div>
            </div>

            {/* Chapitre 8.1 : Maîtrise Opérationnelle des UES */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Chapitre 8.1 : Maîtrise Opérationnelle des UES
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Critères et consignes pour éviter toute dérive de consommation.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <p className="font-semibold text-slate-900">UES-03 (Air Comprimé) :</p>
                  <p className="text-slate-600 mt-0.5">
                    Consigne de pression réseau verrouillée à 6.8 bar ± 0.2 bar. Contrôle acoustique hebdomadaire.
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <p className="font-semibold text-slate-900">UES-01 (Froid NH3) :</p>
                  <p className="text-slate-600 mt-0.5">
                    Température de condensation flottante indexée sur la température extérieure pour minimiser le travail compresseur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 3 : CHECK (VÉRIFIER) — AVEC "DISTANCE À LA NORME" À L'INTÉRIEUR
         ========================================================================= */}
      {activeStep === 'check' && (
        <div className="space-y-6">
          {/* Sous-onglets internes de la phase Check */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setCheckSubTab('ipe_ser')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                checkSubTab === 'ipe_ser'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📊 Suivi IPÉ vs SER (§9.1)
            </button>

            <button
              onClick={() => setCheckSubTab('distance_norme')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                checkSubTab === 'distance_norme'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              🧭 Distance à la norme (Audit ISO 50001)
            </button>

            <button
              onClick={() => setCheckSubTab('audits')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                checkSubTab === 'audits'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📋 Audits Internes (§9.2)
            </button>
          </div>

          {/* 1. SUIVI IPÉ vs SER (Désormais placé en tête à gauche) */}
          {checkSubTab === 'ipe_ser' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
              {/* En-tête avec bouton d'accès direct vers Analyse et Supervision */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-600" />
                    Surveillance des IPÉ par rapport aux Situations Énergétiques de Référence (§9.1)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comparaison des performances actuelles avec la situation énergétique de référence ajustée (EnPI vs EnB).
                  </p>
                </div>

                {onNavigateToSupervision && (
                  <button
                    onClick={onNavigateToSupervision}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-2xs hover:shadow-sm shrink-0 border border-slate-800 group"
                    title="Accéder aux graphiques dynamiques et flux de l'onglet Analyse et Supervision"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Supervision Énergétique des UES & IPÉ</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Grille des cartes IPÉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ipeList.map((ipe) => {
                  const isGain = ipe.ecart_pct < 0;
                  return (
                    <div key={ipe.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors shadow-2xs">
                      <span className="text-[11px] font-mono text-slate-500">{ipe.id} · {ipe.ues}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5 mb-2">{ipe.nom}</h4>
                      
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                          {ipe.valeur_actuelle}
                        </span>
                        <span className="text-xs text-slate-500">{ipe.unite}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500">SER Référence :</span>
                        <span className="font-mono text-slate-700">{ipe.valeur_ser}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-slate-500">Écart relatif :</span>
                        <span className={`font-mono font-bold ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {ipe.ecart_pct > 0 ? `+${ipe.ecart_pct}%` : `${ipe.ecart_pct}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bannière passerelle vers le module Supervision continue */}
              {onNavigateToSupervision && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                        Passerelle vers le module Analyse & Supervision en temps réel
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      Visualisez l'évolution temporelle, les séries chronologiques détaillées et la répartition des consommations dans l'espace de Supervision.
                    </p>
                  </div>
                  <button
                    onClick={onNavigateToSupervision}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-2xs shrink-0"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Ouvrir la Supervision des UES & IPÉ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. DISTANCE À LA NORME DANS CHECK */}
          {checkSubTab === 'distance_norme' && (
            <DistanceNormeSection accessMode={accessMode} />
          )}

          {/* 3. AUDITS INTERNES */}
          {checkSubTab === 'audits' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Programme des Audits Internes du SMÉ (§9.2)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Planification méthodique et évaluation objective de la conformité du SMÉ.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">ISO 19011 / ISO 50001 §9.2</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Réf Audit</th>
                      <th className="p-3">Périmètre / Domaine audité</th>
                      <th className="p-3">Auditeur désigné</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Résultat</th>
                      <th className="p-3">Points sensibles / Recommandations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-slate-900">{aud.id}</td>
                        <td className="p-3 font-medium text-slate-900">{aud.domaine}</td>
                        <td className="p-3 text-slate-600">{aud.auditeur}</td>
                        <td className="p-3 font-mono text-slate-600">{aud.date}</td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            {aud.resultat}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{aud.points_sensibles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          PHASE 4 : ACT (AGIR)
         ========================================================================= */}
      {activeStep === 'act' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Non-Conformités et Actions Correctives (§10.1)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Traitement méthodique des dérives énergétiques, élimination des causes racines et vérification d'efficacité.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded">
                  {filteredNonConformites.length} / {nonConformites.length} fiche(s) NC affichée(s)
                </span>
                {hasActiveNcFilters && (
                  <button
                    onClick={resetAllNcFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors text-xs font-semibold"
                    title="Effacer tous les filtres de colonnes NC"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Effacer filtres ({activeNcCount})</span>
                  </button>
                )}
                {accessMode === 'admin' ? (
                  <button
                    onClick={() => setShowAddNC(!showAddNC)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Déclarer une Fiche NC</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 bg-slate-100 rounded border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Lecture seule</span>
                  </span>
                )}
              </div>
            </div>

            {/* Formulaire ajout NC */}
            {showAddNC && (
              <form onSubmit={handleAddNC} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-xs space-y-3">
                <div className="font-semibold text-slate-800">Déclarer un écart ou une non-conformité énergétique</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">UES ou secteur concerné :</label>
                    <select
                      value={newNCUES}
                      onChange={(e) => setNewNCUES(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    >
                      {uesList.map(u => (
                        <option key={u.id} value={u.nom}>{u.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Pilote d'analyse :</label>
                    <input
                      type="text"
                      required
                      value={newNCResp}
                      onChange={(e) => setNewNCResp(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Description de l'écart constaté :</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ex: Surconsommation anormale du circuit d'air comprimé durant le week-end..."
                    value={newNCDescription}
                    onChange={(e) => setNewNCDescription(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Cause racine identifiée (5 Pourquoi) :</label>
                    <input
                      type="text"
                      placeholder="Ex: Électrovanne de purge fuyante"
                      value={newNCCause}
                      onChange={(e) => setNewNCCause(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Action corrective immédiate :</label>
                    <input
                      type="text"
                      placeholder="Ex: Remplacement vanne et réglage régulation"
                      value={newNCCorrection}
                      onChange={(e) => setNewNCCorrection(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddNC(false)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
                  >
                    Enregistrer la fiche
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 select-none">
                  <tr>
                    <th className="p-2.5 w-24">
                      <TableColumnFilter
                        title="Réf NC"
                        columnKey="id"
                        filterValue={ncColFilters.id}
                        onFilterChange={(v) => updateNcColFilter('id', v)}
                        sortDirection={ncSortCol === 'id' ? ncSortDir : null}
                        onSort={(dir) => { setNcSortCol(dir ? 'id' : null); setNcSortDir(dir); }}
                        searchPlaceholder="Ex: NC-01..."
                      />
                    </th>
                    <th className="p-2.5 w-28">
                      <TableColumnFilter
                        title="Date"
                        columnKey="date"
                        filterValue={ncColFilters.date}
                        onFilterChange={(v) => updateNcColFilter('date', v)}
                        sortDirection={ncSortCol === 'date' ? ncSortDir : null}
                        onSort={(dir) => { setNcSortCol(dir ? 'date' : null); setNcSortDir(dir); }}
                        searchPlaceholder="Ex: 2025..."
                      />
                    </th>
                    <th className="p-2.5 min-w-[160px]">
                      <TableColumnFilter
                        title="UES"
                        columnKey="ues"
                        filterValue={ncColFilters.ues}
                        onFilterChange={(v) => updateNcColFilter('ues', v)}
                        options={ncUESOptions}
                        dropdownWidth="w-56"
                      />
                    </th>
                    <th className="p-2.5 min-w-[220px]">
                      <TableColumnFilter
                        title="Constat / Dérive"
                        columnKey="description"
                        filterValue={ncColFilters.description}
                        onFilterChange={(v) => updateNcColFilter('description', v)}
                        searchPlaceholder="Ex: surconsommation, fuite..."
                      />
                    </th>
                    <th className="p-2.5 min-w-[170px]">
                      <TableColumnFilter
                        title="Cause racine"
                        columnKey="cause_racine"
                        filterValue={ncColFilters.cause_racine}
                        onFilterChange={(v) => updateNcColFilter('cause_racine', v)}
                        searchPlaceholder="Ex: électrovanne, encrassement..."
                      />
                    </th>
                    <th className="p-2.5 min-w-[170px]">
                      <TableColumnFilter
                        title="Action corrective"
                        columnKey="action_corrective"
                        filterValue={ncColFilters.action_corrective}
                        onFilterChange={(v) => updateNcColFilter('action_corrective', v)}
                        searchPlaceholder="Ex: remplacement, réglage..."
                      />
                    </th>
                    <th className="p-2.5 min-w-[140px]">
                      <TableColumnFilter
                        title="Responsable"
                        columnKey="responsable"
                        filterValue={ncColFilters.responsable}
                        onFilterChange={(v) => updateNcColFilter('responsable', v)}
                        searchPlaceholder="Ex: Dubois, Martin..."
                      />
                    </th>
                    <th className="p-2.5 w-32 text-center">
                      <TableColumnFilter
                        title="Statut"
                        columnKey="statut"
                        align="center"
                        filterValue={ncColFilters.statut}
                        onFilterChange={(v) => updateNcColFilter('statut', v)}
                        options={ncStatutOptions}
                        dropdownWidth="w-48"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNonConformites.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                        Aucune fiche de non-conformité ne correspond aux critères de filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredNonConformites.map((nc) => (
                      <tr key={nc.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-slate-900">{nc.id}</td>
                        <td className="p-3 font-mono text-slate-600">{nc.date_constat}</td>
                        <td className="p-3 font-medium text-slate-900">{nc.ues}</td>
                        <td className="p-3 text-slate-700">{nc.description}</td>
                        <td className="p-3 text-slate-600">{nc.cause_racine}</td>
                        <td className="p-3 text-slate-600">{nc.action_corrective}</td>
                        <td className="p-3 text-slate-600">{nc.responsable}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              nc.statut === 'Clôturée'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {nc.statut}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revue de Direction */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Revue de Management & Amélioration Continue (§9.3 / §10.2)
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Synthèse des décisions de la direction générale pour garantir l'adéquation permanente du SMÉ et l'amélioration mesurable de la performance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-900 block mb-1">1. Objectifs & Allocations</span>
                <p className="text-slate-600">
                  Reconduction du budget annuel de 35 k€ pour les investissements de performance énergétique sur les UES Froid et Air Comprimé.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-900 block mb-1">2. Ajustement des Références</span>
                <p className="text-slate-600">
                  Validation de la révision de la SER suite à l'extension du bâtiment conditionnement (intégration de la température extérieure dans l'équation IPÉ).
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-900 block mb-1">3. Intégration Métier</span>
                <p className="text-slate-600">
                  Intégration d'un critère énergétique systématique dans tous les appels d'offres machines supérieures à 15 kW.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Prévisualisation du Justificatif Documentaire (§7.2) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold">Justificatif Documentaire de Compétence (§7.2)</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 text-center relative overflow-hidden">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  DOCUMENT CERTIFIÉ CONFORME
                </div>

                <Award className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                <h5 className="font-bold text-slate-900 text-base">{previewDoc.qualification}</h5>
                <p className="text-xs text-slate-600 font-semibold mt-1">{previewDoc.poste}</p>
                {previewDoc.titulaire && (
                  <p className="text-xs text-slate-500">Attribué à : <strong className="text-slate-700">{previewDoc.titulaire}</strong></p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-left text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">UES Associée :</span>
                    <strong className="text-slate-800">{previewDoc.ues}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Validité :</span>
                    <strong className="text-emerald-700">{previewDoc.statutValidite}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fichier archivé :</span>
                    <span className="font-mono text-slate-700 truncate block">{previewDoc.fichierNom || 'attestation.pdf'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Taille & Date :</span>
                    <span className="text-slate-700">{previewDoc.fichierTaille || '1.2 Mo'} ({previewDoc.fichierDate || '2024'})</span>
                  </div>
                </div>

                {previewDoc.commentaire && (
                  <p className="mt-3 text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200 text-left">
                    Note interne : {previewDoc.commentaire}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Réf audit : ISO-50001-COMP-{previewDoc.id}</span>
                <span className="text-emerald-600 font-semibold">Exigibilité §7.2 validée</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Téléchargement de la pièce justificative : ${previewDoc.fichierNom || 'attestation.pdf'}`);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger la pièce</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout / Modification d'un Objectif / Cible Énergétique (§6.2) */}
      {isAddObjectiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingObjectiveId ? "Modifier l'Objectif Énergétique (§6.2)" : "Nouvel Objectif / Cible Énergétique (§6.2)"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddObjectiveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveObjective} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intitulé de l'objectif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réduire la consommation électrique du Froid NH3 de 7%"
                  value={objFormTitre}
                  onChange={(e) => setObjFormTitre(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UES Concernée
                  </label>
                  <select
                    value={objFormUes}
                    onChange={(e) => setObjFormUes(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Site Global">Site Global</option>
                    <option value="UES 1 : Froid Industriel NH3">UES 1 : Froid Industriel NH3</option>
                    <option value="UES 2 : Air Comprimé">UES 2 : Air Comprimé</option>
                    <option value="UES 3 : Fours de Cuisson">UES 3 : Fours de Cuisson</option>
                    <option value="Utilités & Auxiliaires">Utilités & Auxiliaires</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cible chiffrée <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: -7% (soit -280 MWh/an)"
                    value={objFormCible}
                    onChange={(e) => setObjFormCible(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Indicateur IPÉ Lié
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: IPÉ-01 : kWh/t réfrigérée"
                    value={objFormIpe}
                    onChange={(e) => setObjFormIpe(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Échéance cible
                  </label>
                  <input
                    type="date"
                    value={objFormEcheance}
                    onChange={(e) => setObjFormEcheance(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={objFormResponsable}
                    onChange={(e) => setObjFormResponsable(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={objFormStatut}
                    onChange={(e) => setObjFormStatut(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-semibold"
                  >
                    <option value="En cours">En cours</option>
                    <option value="Atteint">Atteint</option>
                    <option value="Planifié">Planifié</option>
                    <option value="À risque">À risque</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddObjectiveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  {editingObjectiveId ? "Enregistrer les modifications" : "Créer l'objectif"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mettre à jour la Revue Énergétique (§6.3 - PDF ou GED) */}
      {isDocRevueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Rattacher la Dernière Revue Énergétique (§6.3)
                </h3>
              </div>
              <button
                onClick={() => setIsDocRevueModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRevueDoc} className="space-y-3.5">
              {/* Type de document : PDF local ou Lien GED */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Type de source documentaire
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocInputType('pdf')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      docInputType === 'pdf'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Fichier PDF Local</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocInputType('ged')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      docInputType === 'ged'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 text-emerald-600" />
                    <span>Lien GED / Intranet</span>
                  </button>
                </div>
              </div>

              {docInputType === 'pdf' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sélectionner un fichier PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setDocInputNom(file.name);
                        setDocInputUrl(`/documents/${file.name}`);
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Fichier actuel : <strong className="text-slate-800">{docInputNom}</strong>
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL du document dans la GED d'entreprise
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://ged.entreprise.com/iso50001/revue-energetique.pdf"
                    value={docInputUrl}
                    onChange={(e) => {
                      setDocInputUrl(e.target.value);
                      setDocInputNom('Lien GED - Revue Énergétique Annuelle');
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de validation officielle
                  </label>
                  <input
                    type="date"
                    value={docInputDate}
                    onChange={(e) => setDocInputDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approbateurs / Signataires
                  </label>
                  <input
                    type="text"
                    value={docInputValidePar}
                    onChange={(e) => setDocInputValidePar(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDocRevueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Valider et enregistrer le document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
