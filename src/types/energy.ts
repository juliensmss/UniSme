export interface EnergyDataPoint {
  id: string;
  conso_totale_kwh: number;
  conso_froid_kwh: number;
  conso_compresseurs_kwh: number;
  conso_fours_kwh: number;
  conso_auxiliaires_kwh: number;
  temperature_ext_degc: number;
  volume_production_tonnes: number;
  taux_charge_pct: number;
  pression_air_bar: number;
  dju_froid: number;
  protocole_source: 'OPC-UA (Gateway S7-1500)' | 'MQTT (IoT Edge Sensor)' | 'Modbus TCP/IP' | 'Fichier Importé' | 'OPC-UA (Direct Push)' | 'MQTT (Sensor Stream)';
  timestamp: string; // STRICTEMENT TOUT À DROITE DANS LE TABLEAU
}

export interface UESItem {
  id: string;
  nom: string;
  vecteur: string;
  part_conso: number;
  facteurs: string;
  responsable: string;
  couleur?: string;
}

export interface IPEItem {
  id: string;
  nom: string;
  ues: string;
  unite: string;
  valeur_actuelle: number;
  valeur_ser: number;
  ecart_pct: number;
  objectif: string;
}

export interface ActionItem {
  id: string;
  titre: string;
  ues: string;
  responsable: string;
  echeance: string;
  gain_vise_kwh: number;
  statut: 'Planifié' | 'En cours' | 'Terminé';
  budget_keuros: number;
  origine_swot?: string; // ID or title of linked weakness/threat
}

export interface AuditItem {
  id: string;
  domaine: string;
  auditeur: string;
  date: string;
  resultat: string;
  points_sensibles: string;
}

export interface NonConformiteItem {
  id: string;
  date_constat: string;
  ues: string;
  description: string;
  cause_racine: string;
  action_corrective: string;
  responsable: string;
  statut: 'En cours' | 'Clôturée';
  date_cloture: string;
}

export interface SWOTItem {
  id: string;
  categorie: 'forces' | 'faiblesses' | 'opportunites' | 'menaces';
  titre: string;
  description: string;
  impact: 'Majeur' | 'Moyen' | 'Mineur';
  actionLieeId?: string;
}

export interface StakeholderDetailedItem {
  id: string;
  entite: string;
  influence: number; // 1 to 4
  interet: number; // 1 to 4
  actionMatrice: 'Gérer avec attention' | 'Maintenir informés' | 'Maintenir satisfaits' | 'Surveiller';
  moyenFreqCom: string;
  role: string;
  attentes: string;
  actionsMener: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  verification: 'Conforme' | 'En cours' | 'Planifié' | 'À auditer';
}

export interface RegressionStats {
  slope: number;
  intercept: number;
  r2: number;
  r: number;
  points: { x: number; y: number }[];
  trendline: { x: number; y: number }[];
}

export type RACIRole = 'R' | 'A' | 'C' | 'I' | '-';

export interface RACIItem {
  id: string;
  activite: string;
  direction: RACIRole;
  referentEnergie: RACIRole;
  maintenanceUtilites: RACIRole;
  production: RACIRole;
  achatsTravaux: RACIRole;
  operateurs: RACIRole;
}

export interface EnergyPolicy {
  titre: string;
  version: string;
  dateSignature: string;
  signataireNom: string;
  signatairePoste: string;
  siteConcerne: string;
  textePolitique: string;
  cibleChiffree: string;
  statut: 'Validée & Signée' | 'En cours de révision' | 'Brouillon';
}

export interface CompetenceProofItem {
  id: string;
  poste: string;
  titulaire?: string;
  qualification: string;
  ues: string;
  statutValidite: string;
  modePreuve: 'fichier' | 'lien';
  fichierNom?: string;
  fichierTaille?: string;
  fichierDate?: string;
  lienGedUrl?: string;
  commentaire?: string;
}

export interface ThresholdAlertRule {
  id: string;
  nom: string;
  variableKey: keyof EnergyDataPoint;
  variableLabel: string;
  operateur: '>' | '<' | '>=' | '<=';
  seuil: number;
  unite: string;
  severite: 'Critique' | 'Majeur' | 'Avertissement';
  ues: string;
  active: boolean;
  messageAction: string;
}

export interface ActiveAlertEvent {
  id: string;
  ruleId: string;
  titre: string;
  severite: 'Critique' | 'Majeur' | 'Avertissement';
  valeurMesuree: number;
  seuil: number;
  unite: string;
  operateur: string;
  ues: string;
  horodatage: string;
  acquittee: boolean;
  messageAction: string;
}
