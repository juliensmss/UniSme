import {
  EnergyDataPoint,
  UESItem,
  IPEItem,
  ActionItem,
  AuditItem,
  NonConformiteItem,
  SWOTItem,
  StakeholderDetailedItem,
  RACIItem,
  EnergyPolicy,
  CompetenceProofItem,
  ThresholdAlertRule,
  UserAccountItem
} from '../types/energy';

export function generateInitialEnergyData(days: number = 45): EnergyDataPoint[] {
  const points: EnergyDataPoint[] = [];
  const now = new Date();
  const startTime = new Date(now.getTime() - days * 24 * 3600 * 1000);

  for (let i = 0; i < days * 24; i++) {
    const d = new Date(startTime.getTime() + i * 3600 * 1000);
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    const hour = d.getHours();
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // External temperature (°C)
    const tempSeasonal = 14 + 8 * Math.sin((2 * Math.PI * dayOfYear) / 365);
    const tempDiurnal = 4 * Math.sin((2 * Math.PI * (hour - 9)) / 24);
    const tempNoise = (Math.random() - 0.5) * 2.4;
    const tempExt = Math.round((tempSeasonal + tempDiurnal + tempNoise) * 10) / 10;

    // Production volume (tonnes)
    const baseProd = isWeekend ? 2.0 : 18.0;
    const shiftMultiplier = (hour >= 6 && hour <= 22) ? 1.0 : 0.45;
    const prodNoise = (Math.random() - 0.5) * 3.0;
    const volumeProduction = Math.round(Math.max(0, Math.min(30, baseProd * shiftMultiplier + prodNoise)) * 100) / 100;

    // Load factor %
    const loadFactor = Math.round(Math.min(100, Math.max(0, (volumeProduction / 25) * 100 + (Math.random() - 0.5) * 6)) * 10) / 10;

    // Compressed air pressure (bar)
    const airPressure = Math.round((6.8 + (Math.random() - 0.5) * 0.3 - volumeProduction * 0.01) * 100) / 100;

    // Heating/cooling degree days
    const djuFroid = Math.round(Math.max(0, tempExt - 18) * 100) / 100;

    // Consumptions by SEU / UES
    const consoFroid = Math.round((45.0 + 3.8 * Math.max(0, tempExt) + 1.2 * volumeProduction + (Math.random() - 0.5) * 6) * 100) / 100;
    const consoAir = Math.round((35.0 + 4.2 * volumeProduction + (Math.random() - 0.5) * 5) * 100) / 100;
    const consoFours = Math.round((60.0 + 8.5 * volumeProduction + (Math.random() - 0.5) * 10) * 100) / 100;
    const consoAux = Math.round((25.0 + 0.3 * volumeProduction + 0.5 * Math.max(0, 15 - tempExt) + (Math.random() - 0.5) * 3) * 100) / 100;
    const consoTotale = Math.round((consoFroid + consoAir + consoFours + consoAux) * 100) / 100;

    // Protocol distribution
    const rand = Math.random();
    let proto: EnergyDataPoint['protocole_source'] = 'OPC-UA (Gateway S7-1500)';
    if (rand < 0.55) {
      proto = 'OPC-UA (Gateway S7-1500)';
    } else if (rand < 0.90) {
      proto = 'MQTT (IoT Edge Sensor)';
    } else {
      proto = 'Modbus TCP/IP';
    }

    points.push({
      id: `meas-${i + 1}`,
      conso_totale_kwh: consoTotale,
      conso_froid_kwh: consoFroid,
      conso_compresseurs_kwh: consoAir,
      conso_fours_kwh: consoFours,
      conso_auxiliaires_kwh: consoAux,
      temperature_ext_degc: tempExt,
      volume_production_tonnes: volumeProduction,
      taux_charge_pct: loadFactor,
      pression_air_bar: airPressure,
      dju_froid: djuFroid,
      protocole_source: proto,
      timestamp: d.toISOString() // Strictly far right in the table
    });
  }

  return points;
}

export const initialUES: UESItem[] = [
  {
    id: "UES-01",
    nom: "Centrale Froid Industriel (NH3)",
    vecteur: "Électricité",
    part_conso: 38.5,
    facteurs: "Température extérieure (°C), Volume produit",
    responsable: "Y. Mercier (Responsable Utilités)",
    couleur: "#2563EB"
  },
  {
    id: "UES-02",
    nom: "Fours & Lignes de Cuisson",
    vecteur: "Gaz Naturel / Élec",
    part_conso: 31.0,
    facteurs: "Volume de production (tonnes), Cadence ligne",
    responsable: "C. Bernard (Chef Procédés)",
    couleur: "#DC2626"
  },
  {
    id: "UES-03",
    nom: "Centrale Air Comprimé (3 compresseurs)",
    vecteur: "Électricité",
    part_conso: 18.2,
    facteurs: "Volume produit, Taux de fuite, Pression consigne",
    responsable: "P. Dubois (Maintenance Industrielle)",
    couleur: "#059669"
  },
  {
    id: "UES-04",
    nom: "Utilités, Chauffage & Bâtiments",
    vecteur: "Électricité & Vapeur",
    part_conso: 12.3,
    facteurs: "DJU, Heures d'ouverture site",
    responsable: "S. Martin (Services Généraux)",
    couleur: "#D97706"
  }
];

export const initialIPEs: IPEItem[] = [
  {
    id: "IPÉ-01",
    nom: "Ratio Spécifique Froid",
    ues: "UES-01 (Froid)",
    unite: "kWh_froid / tonne",
    valeur_actuelle: 7.42,
    valeur_ser: 8.10,
    ecart_pct: -8.4,
    objectif: "≤ 7.50"
  },
  {
    id: "IPÉ-02",
    nom: "Ratio Spécifique Air Comprimé",
    ues: "UES-03 (Air)",
    unite: "kWh / Nm³ air",
    valeur_actuelle: 0.142,
    valeur_ser: 0.158,
    ecart_pct: -10.1,
    objectif: "≤ 0.140"
  },
  {
    id: "IPÉ-03",
    nom: "Intensité Énergétique Globale",
    ues: "Site Global",
    unite: "kWh_total / tonne",
    valeur_actuelle: 18.9,
    valeur_ser: 20.8,
    ecart_pct: -9.1,
    objectif: "≤ 19.0"
  },
  {
    id: "IPÉ-04",
    nom: "Rendement Thermique Fours",
    ues: "UES-02 (Fours)",
    unite: "kWh_gaz / tonne",
    valeur_actuelle: 42.1,
    valeur_ser: 43.5,
    ecart_pct: -3.2,
    objectif: "≤ 41.0"
  }
];

export const initialActions: ActionItem[] = [
  {
    id: "ACT-101",
    titre: "Campagne ultrasons & élimination des fuites d'air",
    ues: "Air Comprimé",
    responsable: "P. Dubois",
    echeance: "2025-06-30",
    gain_vise_kwh: 35000,
    statut: "Terminé",
    budget_keuros: 4.5,
    origine_swot: "Faiblesse : Fuites et pertes de charge sur le compresseur C2"
  },
  {
    id: "ACT-102",
    titre: "Variation électronique de vitesse sur compresseur frigorifique 1",
    ues: "Froid Industriel",
    responsable: "Y. Mercier",
    echeance: "2025-09-15",
    gain_vise_kwh: 78000,
    statut: "En cours",
    budget_keuros: 18.0,
    origine_swot: "Faiblesse : Sensibilité excessive de la centrale froid aux vagues de chaleur"
  },
  {
    id: "ACT-103",
    titre: "Calorifugeage des vannes & réseaux vapeur haute température",
    ues: "Procédés Thermiques",
    responsable: "C. Bernard",
    echeance: "2025-11-30",
    gain_vise_kwh: 42000,
    statut: "Planifié",
    budget_keuros: 9.2,
    origine_swot: "Faiblesse : Dérive de consommation de maintien en veille nocturne"
  },
  {
    id: "ACT-104",
    titre: "Automatisation extinction éclairage LED zones stockage",
    ues: "Bâtiments",
    responsable: "S. Martin",
    echeance: "2025-04-10",
    gain_vise_kwh: 12000,
    statut: "Terminé",
    budget_keuros: 2.8,
    origine_swot: "Opportunité : Décret tertiaire et BACS"
  }
];

export const initialAudits: AuditItem[] = [
  {
    id: "AUD-2024-01",
    domaine: "Revue énergétique et conformité UES",
    auditeur: "Cabinet EnerNorm",
    date: "2024-11-20",
    resultat: "Conforme",
    points_sensibles: "Documentation des SER à actualiser suite aux extensions de ligne"
  },
  {
    id: "AUD-2025-01",
    domaine: "Maîtrise opérationnelle & comptage UES Froid",
    auditeur: "Auditeur Interne Certifié (F. Blanc)",
    date: "2025-03-12",
    resultat: "1 écart mineur",
    points_sensibles: "Étalonnage capteur débit air comprimé en retard de 2 mois"
  }
];

export const initialNonConformites: NonConformiteItem[] = [
  {
    id: "NC-25-01",
    date_constat: "2025-02-14",
    ues: "Air Comprimé",
    description: "Dérive anormale de la consommation en période chômée (> 32 kWh/h)",
    cause_racine: "Électrovanne de purge bloquée ouverte sur cuve tampon",
    action_corrective: "Remplacement kit vanne et ajout alerte seuil SCADA",
    responsable: "P. Dubois",
    statut: "Clôturée",
    date_cloture: "2025-02-18"
  },
  {
    id: "NC-25-02",
    date_constat: "2025-03-02",
    ues: "Froid Industriel",
    description: "Pression de condensation trop haute par temps doux",
    cause_racine: "Encrassement aérocondenseurs circuit 2",
    action_corrective: "Nettoyage haute pression et ajustement consigne régulation",
    responsable: "Y. Mercier",
    statut: "En cours",
    date_cloture: "-"
  }
];

// Matrice SWOT traduite en français (Forces, Faiblesses, Opportunités, Menaces/Risques)
export const initialSWOT: SWOTItem[] = [
  // FORCES (Internes)
  {
    id: "SWOT-F1",
    categorie: "forces",
    titre: "Sous-comptage communicant OPC-UA & MQTT",
    description: "96% de l'énergie entrante suivie en temps réel à l'échelle de chaque atelier et machine.",
    impact: "Majeur"
  },
  {
    id: "SWOT-F2",
    categorie: "forces",
    titre: "Équipe énergie formée et certifiée",
    description: "Référent énergie certifié Lead Implementer ISO 50001 et implication forte de la maintenance.",
    impact: "Majeur"
  },
  {
    id: "SWOT-F3",
    categorie: "forces",
    titre: "Engagement fort de la direction générale",
    description: "Politique formelle intégrée aux objectifs RSE avec un budget d'investissement dédié pérenne.",
    impact: "Moyen"
  },

  // FAIBLESSES (Internes - nécéssitent des parades dans le Plan d'Actions Do)
  {
    id: "SWOT-W1",
    categorie: "faiblesses",
    titre: "Obsolescence et fuites sur compresseur d'air C2",
    description: "Talon de fuite résiduel estimé à 22% de la puissance appelée hors production.",
    impact: "Majeur",
    actionLieeId: "ACT-101"
  },
  {
    id: "SWOT-W2",
    categorie: "faiblesses",
    titre: "Sensibilité de la centrale froid aux canicules",
    description: "Condensation haute en été générant une surconsommation de +15 kWh/h lors des pics à > 30°C.",
    impact: "Majeur",
    actionLieeId: "ACT-102"
  },
  {
    id: "SWOT-W3",
    categorie: "faiblesses",
    titre: "Pertes thermiques sur vannes et circuits vapeur",
    description: "Réseau vapeur secondaire non calorifugé provoquant une surconsommation de gaz chaudière.",
    impact: "Moyen",
    actionLieeId: "ACT-103"
  },

  // OPPORTUNITÉS (Externes)
  {
    id: "SWOT-O1",
    categorie: "opportunites",
    titre: "Subventions & Primes CEE (Fiches IND-UT)",
    description: "Financement à hauteur de 30% à 45% sur variateurs de vitesse et récupérateurs de chaleur.",
    impact: "Majeur"
  },
  {
    id: "SWOT-O2",
    categorie: "opportunites",
    titre: "Valorisation de la chaleur fatale compresseurs",
    description: "Récupération thermique pour préchauffer l'eau de lavage et réduire la consommation de gaz.",
    impact: "Majeur"
  },
  {
    id: "SWOT-O3",
    categorie: "opportunites",
    titre: "Contrats d'effacement tarifaire rémunérés",
    description: "Monétisation de la flexibilité de puissance en période de tension hivernale sur le réseau électrique.",
    impact: "Moyen"
  },

  // MENACES / RISQUES (Externes - nécéssitent des parades dans le Plan d'Actions Do)
  {
    id: "SWOT-T1",
    categorie: "menaces",
    titre: "Volatilité des prix spot électricité et gaz",
    description: "Risque de dérive budgétaire en cas de renouvellement de contrat d'achat sans couverture.",
    impact: "Majeur"
  },
  {
    id: "SWOT-T2",
    categorie: "menaces",
    titre: "Durcissement des exigences ICPE & quotas carbone",
    description: "Risque de pénalités ou obligations de reporting carbone renforcées par la DREAL.",
    impact: "Moyen"
  },
  {
    id: "SWOT-T3",
    categorie: "menaces",
    titre: "Rupture ou délestage réseau en période de pointe",
    description: "Risque d'arrêt brutal de production sur micro-coupures sans système de secours configuré.",
    impact: "Majeur"
  }
];

// Tableau d'analyse des parties prenantes fidèle au document de cadrage (image_bbf1e2de.png)
export const initialDetailedStakeholders: StakeholderDetailedItem[] = [
  {
    id: "STK-01",
    entite: "Direction Générale & Sponsor Stratégique",
    influence: 4,
    interet: 4,
    actionMatrice: "Gérer avec attention",
    moyenFreqCom: "Comité de Direction mensuel / Revue de management annuelle",
    role: "Sponsor stratégique. Définit la politique 'Usine du Futur' et arbitre les grands investissements.",
    attentes: "Réduction des coûts de production, amélioration de la qualité et visibilité en temps réel sur la performance.",
    actionsMener: "Rapports d'avancement des IPÉ et validation des enveloppes budgétaires éco-efficacité.",
    priorite: "Haute",
    verification: "Conforme"
  },
  {
    id: "STK-02",
    entite: "Direction de Production & Chefs de Ligne",
    influence: 4,
    interet: 3,
    actionMatrice: "Gérer avec attention",
    moyenFreqCom: "Point d'ordonnancement hebdomadaire & flash atelier",
    role: "Garant du ROI industriel. Valide l'adéquation de la solution avec les processus de production réels.",
    attentes: "Réduction des coûts énergétiques sans dégradation des cadences ni interruption non programmée.",
    actionsMener: "Co-conception des gammes d'arrêt de ligne et intégration des critères de consigne.",
    priorite: "Haute",
    verification: "En cours"
  },
  {
    id: "STK-03",
    entite: "Équipe Maintenance Industrielle & Utilités",
    influence: 3,
    interet: 4,
    actionMatrice: "Gérer avec attention",
    moyenFreqCom: "Revue GMAO quotidienne & point technique bimensuel",
    role: "Réalise l'implémentation technique et le paramétrage des capteurs et régulateurs sur automate MES.",
    attentes: "Dossier de cadrage figé et techniquement réalisable, télémesure fiable sans faux diagnostics.",
    actionsMener: "Déploiement du programme de détection de fuites ultrasons et étalonnage des débitmètres.",
    priorite: "Haute",
    verification: "En cours"
  },
  {
    id: "STK-04",
    entite: "DREAL / Inspection des Installations Classées (ICPE)",
    influence: 4,
    interet: 2,
    actionMatrice: "Maintenir satisfaits",
    moyenFreqCom: "Rapport annuel GEREP & inspections périodiques",
    role: "Autorité administrative de contrôle de conformité environnementale et maîtrise des rejets.",
    attentes: "Respect rigoureux de l'arrêté préfectoral d'autorisation et conformité aux normes sanitaires.",
    actionsMener: "Veille réglementaire ISO 50001 §4.2 et suivi des consommations spécifiques des UES chaudière.",
    priorite: "Haute",
    verification: "Conforme"
  },
  {
    id: "STK-05",
    entite: "Fournisseur d'Énergie & Gestionnaire Réseau (Enedis/GRTgaz)",
    influence: 2,
    interet: 3,
    actionMatrice: "Maintenir informés",
    moyenFreqCom: "Télé-relève mensuelle & télé-alerte effacement",
    role: "Fourniture contractuelle d'énergie, gestion des raccordements et effacements.",
    attentes: "Prévisibilité de la courbe de charge et respect des puissances souscrites sans dépassement.",
    actionsMener: "Surveillance de la puissance moyenne horosynchrone et optimisation des tarifs de pointe.",
    priorite: "Moyenne",
    verification: "Conforme"
  },
  {
    id: "STK-06",
    entite: "Opérateurs et Personnel d'Exploitation",
    influence: 2,
    interet: 3,
    actionMatrice: "Maintenir informés",
    moyenFreqCom: "Affichage dynamique ateliers & causeries énergie mensuelles",
    role: "Acteurs de terrain appliquant les consignes opérationnelles d'arrêt et d'extinction.",
    attentes: "Simplicité des procédures, maintien des conditions de confort et retour sur les gains générés.",
    actionsMener: "Sessions de sensibilisation écogestes et boîte à idées d'économies d'énergie.",
    priorite: "Moyenne",
    verification: "En cours"
  }
];

export const initialPolicy: EnergyPolicy = {
  titre: "Politique Énergétique Industrielle du Site",
  version: "V3.2",
  dateSignature: "2024-09-01",
  signataireNom: "Jean-Marc Dupont",
  signatairePoste: "Directeur Général d'Usine & Membre du Comité Exécutif",
  siteConcerne: "Usine de Production Val-de-Loire (Ateliers A, B, C & Utilités)",
  cibleChiffree: "Réduire notre intensité énergétique spécifique globale de 12% d'ici fin 2027 par rapport à la situation de référence 2023.",
  textePolitique: `La maîtrise et l'efficacité énergétique constituent des priorités stratégiques absolues pour notre site industriel. Dans le cadre de notre démarche de certification ISO 50001:2018, la Direction Générale s'engage formellement à :

1. Mettre à disposition l'ensemble des informations et des ressources financières, humaines et métrologiques indispensables pour atteindre les objectifs et cibles énergétiques fixés.
2. Promouvoir l'amélioration continue de la performance énergétique, des rendements d'équipements et de l'efficacité globale du Système de Management de l'Énergie (SMÉ).
3. Respecter scrupuleusement la totalité des exigences légales et réglementaires applicables (Code de l'Énergie, arrêtés préfectoraux ICPE, Décret Tertiaire, quotas d'émissions) ainsi que toute autre exigence souscrite.
4. Soutenir activement l'achat de produits, équipements et services énergétiquement performants ayant un impact significatif sur nos Usages Énergétiques Significatifs (UES).
5. Intégrer systématiquement les meilleures technologies disponibles (MTD) et les principes d'éco-conception dans tout projet de travaux neufs, extension ou réfection de nos procédés de fabrication.

Cette politique est communiquée à l'ensemble du personnel du site, mise à la disposition permanente des parties intéressées et réexaminée annuellement en Revue de Management.`,
  statut: "Validée & Signée"
};

export const initialRACI: RACIItem[] = [
  {
    id: "RACI-01",
    activite: "Promulgation, validation & révision de la Politique Énergétique (§5.2)",
    direction: "A",
    referentEnergie: "R",
    maintenanceUtilites: "C",
    production: "C",
    achatsTravaux: "I",
    operateurs: "I"
  },
  {
    id: "RACI-02",
    activite: "Revue énergétique, identification des UES & calcul des bilans (§6.3)",
    direction: "I",
    referentEnergie: "A",
    maintenanceUtilites: "R",
    production: "C",
    achatsTravaux: "I",
    operateurs: "I"
  },
  {
    id: "RACI-03",
    activite: "Établissement des IPÉ et Situations Énergétiques de Référence SER (§6.4/6.5)",
    direction: "I",
    referentEnergie: "A",
    maintenanceUtilites: "R",
    production: "C",
    achatsTravaux: "I",
    operateurs: "I"
  },
  {
    id: "RACI-04",
    activite: "Arbitrage budgétaire et validation des Plans d'Actions d'économies (§6.2)",
    direction: "A",
    referentEnergie: "R",
    maintenanceUtilites: "C",
    production: "C",
    achatsTravaux: "R",
    operateurs: "I"
  },
  {
    id: "RACI-05",
    activite: "Maîtrise opérationnelle quotidienne des UES (consignes, arrêts) (§8.1)",
    direction: "I",
    referentEnergie: "C",
    maintenanceUtilites: "A",
    production: "R",
    achatsTravaux: "I",
    operateurs: "R"
  },
  {
    id: "RACI-06",
    activite: "Intégration de critères énergétiques lors des achats et investissements (§8.2/8.3)",
    direction: "I",
    referentEnergie: "C",
    maintenanceUtilites: "C",
    production: "I",
    achatsTravaux: "R",
    operateurs: "I"
  },
  {
    id: "RACI-07",
    activite: "Surveillance des mesures temps réel et déclaration des dérives/NC (§9.1/10.1)",
    direction: "I",
    referentEnergie: "A",
    maintenanceUtilites: "R",
    production: "R",
    achatsTravaux: "I",
    operateurs: "R"
  },
  {
    id: "RACI-08",
    activite: "Planification et réalisation des audits internes du SMÉ (§9.2)",
    direction: "I",
    referentEnergie: "A",
    maintenanceUtilites: "C",
    production: "C",
    achatsTravaux: "I",
    operateurs: "I"
  },
  {
    id: "RACI-09",
    activite: "Conduite de la Revue de Management annuelle (§9.3)",
    direction: "A",
    referentEnergie: "R",
    maintenanceUtilites: "C",
    production: "C",
    achatsTravaux: "C",
    operateurs: "I"
  }
];

export const initialCompetences: CompetenceProofItem[] = [
  {
    id: "COMP-01",
    poste: "Référent Énergie Site",
    titulaire: "F. Martin (Ingénieur Efficacité Énergétique)",
    qualification: "Certification Lead Implementer ISO 50001 (AFNOR / IRCA)",
    ues: "Transversal (Toutes UES)",
    statutValidite: "Habilité (2026)",
    modePreuve: "fichier",
    fichierNom: "certificat_lead_implementer_50001_afnor.pdf",
    fichierTaille: "1.4 Mo",
    fichierDate: "2024-03-15",
    commentaire: "Formation certifiante de 5 jours avec examen validé avec mention."
  },
  {
    id: "COMP-02",
    poste: "Conducteurs Chaufferie & Vapeur",
    titulaire: "Équipe Maintenance Utilités (3 techniciens)",
    qualification: "Attestation réglage combustion & sécurité brûleurs",
    ues: "UES-02 (Fours & Procédés Thermiques)",
    statutValidite: "100% Qualifiés",
    modePreuve: "lien",
    lienGedUrl: "https://ged.usine-valdeloire.corp/hse/habilitations/chaufferie_vapeur_2025.pdf",
    commentaire: "Habilitations périodiques obligatoires selon réglementation des chaudières industrielles."
  },
  {
    id: "COMP-03",
    poste: "Frigoristes Usine",
    titulaire: "Y. Mercier & J. Dupuis",
    qualification: "Attestation d'aptitude fluide ammoniac NH3",
    ues: "UES-01 (Centrale Froid NH3)",
    statutValidite: "À jour (2025)",
    modePreuve: "fichier",
    fichierNom: "attestation_aptitude_nh3_frigoristes_2024.pdf",
    fichierTaille: "850 Ko",
    fichierDate: "2024-06-20",
    commentaire: "Certificat d'aptitude préfectoral obligatoire pour installations classées ammoniac."
  },
  {
    id: "COMP-04",
    poste: "Technicien Réseau Air Comprimé",
    titulaire: "P. Dubois (Maintenance mécanique)",
    qualification: "Recherche de fuites ultrasons & optimisation réseau",
    ues: "UES-03 (Centrale Air Comprimé)",
    statutValidite: "Qualifié (2025)",
    modePreuve: "lien",
    lienGedUrl: "https://sharepoint.groupe.fr/maintenance/qualif_ultrasons_air.pdf",
    commentaire: "Habilitation d'intervention acoustique et calcul des débits de fuite."
  }
];

export interface SiteInfo {
  id: string;
  nom: string;
  code: string;
  type: string;
  region: string;
  consoAnnuelleMwh: number;
  statutCertif: string;
}

export const initialSites: SiteInfo[] = [
  {
    id: "val_de_loire",
    nom: "Site Val-de-Loire (Usine Nord)",
    code: "VDL-01",
    type: "Site Principal / Agro-Industrie & Conditionnement",
    region: "Centre-Val de Loire, France",
    consoAnnuelleMwh: 14200,
    statutCertif: "Certifié ISO 50001 (Audit S1 2024)"
  },
  {
    id: "rhone_alpes",
    nom: "Site Rhône-Alpes (Procédés Thermiques)",
    code: "RHA-02",
    type: "Fours Industriels & Lignes Traitement Thermique",
    region: "Auvergne-Rhône-Alpes, France",
    consoAnnuelleMwh: 22800,
    statutCertif: "En préparation certification (Échéance 2026)"
  },
  {
    id: "ouest_logistique",
    nom: "Plateforme Ouest (Hub Froid & Stockage)",
    code: "PL-OUEST",
    type: "Entrepôt Frigorifique Basse Température (-22°C)",
    region: "Bretagne / Pays-de-la-Loire, France",
    consoAnnuelleMwh: 6850,
    statutCertif: "Audit Blanc Réalisé"
  }
];

export const initialAlertRules: ThresholdAlertRule[] = [
  {
    id: "RULE-01",
    nom: "Dépassement Puissance Totale Maximale",
    variableKey: "conso_totale_kwh",
    variableLabel: "Consommation Totale Appelée",
    operateur: ">",
    seuil: 220,
    unite: "kWh/h",
    severite: "Critique",
    ues: "Global Site",
    active: true,
    messageAction: "Vérifier l'effacement ou délestage des compresseurs auxiliaires pour éviter dépassement de puissance souscrite."
  },
  {
    id: "RULE-02",
    nom: "Chute de Pression Réseau Air Comprimé",
    variableKey: "pression_air_bar",
    variableLabel: "Pression Air Comprimé",
    operateur: "<",
    seuil: 6.3,
    unite: "bar",
    severite: "Critique",
    ues: "UES-03 (Air Comprimé)",
    active: true,
    messageAction: "Risque de dysfonctionnement des vérins pneumatiques de conditionnement. Enclencher compresseur de secours C3."
  },
  {
    id: "RULE-03",
    nom: "Surconsommation Centrale Froid NH3",
    variableKey: "conso_froid_kwh",
    variableLabel: "Consommation Froid NH3",
    operateur: ">",
    seuil: 140,
    unite: "kWh/h",
    severite: "Majeur",
    ues: "UES-01 (Froid NH3)",
    active: true,
    messageAction: "Contrôler la température de condensation et l'encrassement des aérocondenseurs circuit secondaire."
  },
  {
    id: "RULE-04",
    nom: "Dérive Consommation Fours de Cuisson",
    variableKey: "conso_fours_kwh",
    variableLabel: "Consommation Lignes Fours",
    operateur: ">",
    seuil: 240,
    unite: "kWh/h",
    severite: "Majeur",
    ues: "UES-02 (Fours)",
    active: true,
    messageAction: "Vérifier le débit gaz et le ratio de combustion brûleurs face au volume de production engagé."
  },
  {
    id: "RULE-05",
    nom: "Dérive Consommation Auxiliaires & Talon",
    variableKey: "conso_auxiliaires_kwh",
    variableLabel: "Consommation Auxiliaires",
    operateur: ">",
    seuil: 45,
    unite: "kWh/h",
    severite: "Avertissement",
    ues: "UES-04 (Bâtiments & Auxiliaires)",
    active: true,
    messageAction: "Vérifier l'extinction automatique des éclairages et la fermeture des portes des sas frigorifiques."
  }
];

export const initialUsers: UserAccountItem[] = [
  {
    id: "usr-01",
    nom: "Saliou",
    prenom: "Julien",
    email: "ju.saliou@gmail.com",
    role: "admin",
    fonction: "Directeur Technique & Référent SMÉ",
    departement: "Direction Technique & SI",
    dateAjout: "2024-01-15",
    statut: "Actif",
    derniereConnexion: "Aujourd'hui à 14:12"
  },
  {
    id: "usr-02",
    nom: "Thomas",
    prenom: "Mathieu",
    email: "m.thomas@valdeloire-industrie.fr",
    role: "energy_manager",
    fonction: "Ingénieur Efficacité Énergétique",
    departement: "Service Énergie & Environnement",
    dateAjout: "2024-02-01",
    statut: "Actif",
    derniereConnexion: "Aujourd'hui à 11:30"
  },
  {
    id: "usr-03",
    nom: "Berrada",
    prenom: "Karim",
    email: "k.berrada@valdeloire-industrie.fr",
    role: "operator",
    fonction: "Chef d'Équipe Maintenance Utilités",
    departement: "Maintenance Usine",
    dateAjout: "2024-03-10",
    statut: "Actif",
    derniereConnexion: "Hier à 16:45"
  },
  {
    id: "usr-04",
    nom: "Dupont",
    prenom: "Claire",
    email: "c.dupont@valdeloire-industrie.fr",
    role: "operator",
    fonction: "Conductrice Lignes & Chaufferie",
    departement: "Production & Utilités",
    dateAjout: "2024-03-18",
    statut: "Actif",
    derniereConnexion: "Hier à 08:20"
  },
  {
    id: "usr-05",
    nom: "Lemaire",
    prenom: "Dr. Antoine",
    email: "a.lemaire@afnor-certification.org",
    role: "auditor",
    fonction: "Auditeur Principal Tierce Partie ISO 50001",
    departement: "Organisme Certificateur Tierce Partie",
    dateAjout: "2024-04-05",
    statut: "Actif",
    derniereConnexion: "Il y a 3 jours"
  },
  {
    id: "usr-06",
    nom: "Bernard",
    prenom: "Sophie",
    email: "s.bernard@valdeloire-industrie.fr",
    role: "auditor",
    fonction: "Direction Générale & Responsable RSE",
    departement: "Direction Générale",
    dateAjout: "2024-04-12",
    statut: "Actif",
    derniereConnexion: "Il y a 5 jours"
  }
];

