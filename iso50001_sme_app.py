# -*- coding: utf-8 -*-
"""
Application de Digitalisation d'un Système de Management de l'Énergie (SMÉ ISO 50001:2018)
et Plateforme de Supervision Énergétique Industrielle Multi-Sources.

Architecture: Menu Latéral (Sidebar) articulé autour de 2 Grands Piliers Majeurs :
1. SMÉ (Système de Management) :
   - Plan (Planifier : Périmètre libre, Matrice SWOT avec parades Do, Analyse des parties prenantes selon matrice Pouvoir/Intérêt, Revue UES avec Camembert)
   - Do (Réaliser : Plans d'actions et parades, Ressources & Compétences Ch. 7)
   - Check (Vérifier : Outil Distance à la norme intégré, Suivi IPÉ vs SER, Audits internes)
   - Act (Agir : Non-conformités, Actions correctives, Revue de direction)
2. Supervision & Analyse :
   - Passerelle & Ingestion (MQTT, OPC UA, Import CSV/Excel)
   - Supervision UES & IPÉ (Graphiques dynamiques)
   - Facteurs & Corrélations (Nuage de points, régression y = ax + b, heatmap)
   - Données Brutes (Horodatage impérativement tout à droite)

Auteur: Architecte Logiciel Industriel & Auditeur Certifié ISO 50001
Cadre Normatif: NF EN ISO 50001:2018
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import io

# -----------------------------------------------------------------------------
# 1. CONFIGURATION DE LA PAGE STREAMLIT
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="SMÉ ISO 50001 & Supervision Énergétique",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS pour une ergonomie industrielle sobre, moderne et lisible
st.markdown("""
<style>
    .main-header {
        font-size: 1.85rem;
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 0.95rem;
        color: #475569;
        margin-bottom: 1.2rem;
    }
    .swot-card {
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 8px;
        background-color: #FFFFFF;
    }
    .stMetric {
        background-color: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 6px;
        padding: 8px 12px;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# 2. GÉNÉRATION DES DONNÉES & ÉTAT DE SESSION
# -----------------------------------------------------------------------------
def generer_donnees_industrielles(nb_jours: int = 45) -> pd.DataFrame:
    """Génère un jeu de données industrielles représentatif d'un site manufacturier."""
    np.random.seed(42)
    base_date = datetime.now() - timedelta(days=nb_jours)
    dates = [base_date + timedelta(hours=i) for i in range(nb_jours * 24)]
    n = len(dates)

    jours_annee = np.array([(d - datetime(d.year, 1, 1)).days for d in dates])
    heures = np.array([d.hour for d in dates])
    temp_ext = 14 + 8 * np.sin(2 * np.pi * jours_annee / 365) + 4 * np.sin(2 * np.pi * (heures - 9) / 24) + np.random.normal(0, 1.2, n)
    temp_ext = np.round(temp_ext, 1)

    is_weekend = np.array([d.weekday() >= 5 for d in dates])
    prod_base = np.where(is_weekend, 2.0, 18.0)
    prod_shift = np.where((heures >= 6) & (heures <= 22), 1.0, 0.45)
    volume_production = np.clip(prod_base * prod_shift + np.random.normal(0, 1.5, n), 0, 30)
    volume_production = np.round(volume_production, 2)

    taux_charge = np.clip((volume_production / 25.0) * 100 + np.random.normal(0, 4, n), 0, 100)
    taux_charge = np.round(taux_charge, 1)

    pression_air_bar = np.round(np.clip(6.8 + 0.4 * np.random.normal(0, 0.2, n) - (volume_production * 0.01), 5.5, 7.5), 2)
    dju_froid = np.maximum(0.0, temp_ext - 18.0)

    # UES
    conso_froid = np.round(np.clip(45.0 + 3.8 * np.maximum(0, temp_ext) + 1.2 * volume_production + np.random.normal(0, 3.5, n), 20, 220), 2)
    conso_compresseurs = np.round(np.clip(35.0 + 4.2 * volume_production + np.random.normal(0, 2.8, n), 15, 180), 2)
    conso_fours = np.round(np.clip(60.0 + 8.5 * volume_production + np.random.normal(0, 6.0, n), 30, 350), 2)
    conso_auxiliaires = np.round(np.clip(25.0 + 0.3 * volume_production + 0.5 * np.maximum(0, 15 - temp_ext) + np.random.normal(0, 2.0, n), 10, 80), 2)
    conso_totale = np.round(conso_froid + conso_compresseurs + conso_fours + conso_auxiliaires, 2)

    sources = np.random.choice(["OPC-UA (Gateway S7-1500)", "MQTT (IoT Edge Sensor)", "Modbus TCP/IP"], size=n, p=[0.55, 0.35, 0.10])

    # CONTRAINTE ABSOLUE : mesures/capteurs à gauche, timestamp STRICTEMENT à droite !
    return pd.DataFrame({
        "conso_totale_kwh": conso_totale,
        "conso_froid_kwh": conso_froid,
        "conso_compresseurs_kwh": conso_compresseurs,
        "conso_fours_kwh": conso_fours,
        "conso_auxiliaires_kwh": conso_auxiliaires,
        "temperature_ext_degc": temp_ext,
        "volume_production_tonnes": volume_production,
        "taux_charge_pct": taux_charge,
        "pression_air_bar": pression_air_bar,
        "dju_froid": np.round(dju_froid, 2),
        "protocole_source": sources,
        "timestamp": dates  # TOUT À DROITE
    })


def init_session():
    if "df_energy" not in st.session_state:
        st.session_state.df_energy = generer_donnees_industrielles(45)

    if "opc_active" not in st.session_state:
        st.session_state.opc_active = True
    if "mqtt_active" not in st.session_state:
        st.session_state.mqtt_active = True

    # Périmètre et Domaine d'application en champ libre (§4.3)
    if "perimetre_physique" not in st.session_state:
        st.session_state.perimetre_physique = "Site industriel de Val-de-Loire comprenant les bâtiments A (Production lignes 1-4), B (Conditionnement & Stockage froid), C (Centrale air comprimé & Chaufferie vapeur) et les réseaux extérieurs de distribution."

    if "domaine_application" not in st.session_state:
        st.session_state.domaine_application = "Activités de transformation agro-industrielle, conditionnement, utilités industrielles associées. Aucune énergie exclue : électricité (HTA/BT), gaz naturel réseau, vapeur d'eau surchauffée et fioul de secours."

    # Matrice SWOT Énergie (traduite en français)
    if "swot_data" not in st.session_state:
        st.session_state.swot_data = [
            # Forces (Internes)
            {"id": "SWOT-F1", "categorie": "Forces", "titre": "Sous-comptage communicant OPC-UA & MQTT", "description": "96% de l'énergie entrante suivie en temps réel.", "impact": "Majeur"},
            {"id": "SWOT-F2", "categorie": "Forces", "titre": "Équipe énergie formée et certifiée", "description": "Référent énergie certifié Lead Implementer ISO 50001.", "impact": "Majeur"},
            # Faiblesses (Internes - nécéssitent parade Do)
            {"id": "SWOT-W1", "categorie": "Faiblesses", "titre": "Obsolescence et fuites sur compresseur d'air C2", "description": "Talon de fuite résiduel estimé à 22% hors production.", "impact": "Majeur", "parade_id": "ACT-101"},
            {"id": "SWOT-W2", "categorie": "Faiblesses", "titre": "Sensibilité de la centrale froid aux canicules", "description": "Surconsommation de +15 kWh/h lors des pics d'été > 30°C.", "impact": "Majeur", "parade_id": "ACT-102"},
            {"id": "SWOT-W3", "categorie": "Faiblesses", "titre": "Pertes thermiques sur vannes et circuits vapeur", "description": "Réseau vapeur secondaire non calorifugé.", "impact": "Moyen", "parade_id": "ACT-103"},
            # Opportunités (Externes)
            {"id": "SWOT-O1", "categorie": "Opportunités", "titre": "Subventions CEE (Fiches IND-UT)", "description": "Primes CEE couvrant jusqu'à 40% des variateurs électroniques.", "impact": "Majeur"},
            {"id": "SWOT-O2", "categorie": "Opportunités", "titre": "Récupération de chaleur fatale compresseurs", "description": "Préchauffage de l'eau chaude sanitaire et de lavage.", "impact": "Majeur"},
            # Menaces / Risques (Externes - nécéssitent parade Do)
            {"id": "SWOT-T1", "categorie": "Menaces / Risques", "titre": "Volatilité des prix de l'électricité et du gaz", "description": "Risque de surcoût sur les heures de pointe hivernales.", "impact": "Majeur", "parade_id": "ACT-105"},
            {"id": "SWOT-T2", "categorie": "Menaces / Risques", "titre": "Durcissement réglementaire ICPE et Décret BACS", "description": "Exigences accrues sur le suivi continu des rendements.", "impact": "Moyen", "parade_id": "ACT-104"}
        ]

    # Analyse des parties prenantes (exactement selon le modèle de l'image de cadrage)
    if "stakeholders_table" not in st.session_state:
        st.session_state.stakeholders_table = pd.DataFrame([
            {
                "Entreprise ou Entité": "Direction Générale & Sponsor",
                "Influence ou Pouvoir": 4,
                "Intérêt": 4,
                "Action sortante de la matrice": "Gérer avec attention",
                "Moyen & Fréquence de communication": "Revue Direction / Reporting mensuel",
                "Rôle": "Sponsor stratégique. Définit la politique et valide les ROI.",
                "Attentes de la parties prenantes envers": "Réduction des coûts, qualité et visibilité temps réel.",
                "Actions à mener": "Présenter les ROI et tableaux de bord d'avancement des IPÉ.",
                "Priorités": "Haute",
                "Vérification des actions": "Conforme"
            },
            {
                "Entreprise ou Entité": "Direction de Production & Chefs de Ligne",
                "Influence ou Pouvoir": 4,
                "Intérêt": 3,
                "Action sortante de la matrice": "Gérer avec attention",
                "Moyen & Fréquence de communication": "Point d'ordonnancement hebdomadaire",
                "Rôle": "Garant du débit de production réel sur les UES.",
                "Attentes de la parties prenantes envers": "Pas d'impact sur les cadences ni d'arrêts non planifiés.",
                "Actions à mener": "Co-construire les consignes d'arrêt machines chômées.",
                "Priorités": "Haute",
                "Vérification des actions": "En cours"
            },
            {
                "Entreprise ou Entité": "Maintenance Industrielle & Utilités",
                "Influence ou Pouvoir": 3,
                "Intérêt": 4,
                "Action sortante de la matrice": "Gérer avec attention",
                "Moyen & Fréquence de communication": "GMAO quotidienne et point bimensuel",
                "Rôle": "Réalise l'implémentation technique et le paramétrage des capteurs.",
                "Attentes de la parties prenantes envers": "Dossier de cadrage figé et techniquement réalisable.",
                "Actions à mener": "Déploiement des campagnes fuites air et étalonnage.",
                "Priorités": "Haute",
                "Vérification des actions": "En cours"
            },
            {
                "Entreprise ou Entité": "DREAL / Inspection ICPE",
                "Influence ou Pouvoir": 4,
                "Intérêt": 2,
                "Action sortante de la matrice": "Maintenir satisfaits",
                "Moyen & Fréquence de communication": "Rapport annuel GEREP / Déclaration",
                "Rôle": "Autorité administrative de contrôle réglementaire.",
                "Attentes de la parties prenantes envers": "Respect de l'arrêté préfectoral et justification de performance.",
                "Actions à mener": "Veille réglementaire et suivi continu des rendements chaudière.",
                "Priorités": "Haute",
                "Vérification des actions": "Conforme"
            },
            {
                "Entreprise ou Entité": "Fournisseur d'Énergie & Gestionnaire Réseau",
                "Influence ou Pouvoir": 2,
                "Intérêt": 3,
                "Action sortante de la matrice": "Maintenir informés",
                "Moyen & Fréquence de communication": "Télé-relève mensuelle & effacement",
                "Rôle": "Fourniture des énergies et transport sur le réseau.",
                "Attentes de la parties prenantes envers": "Prévisibilité de la courbe de charge et respect des puissances.",
                "Actions à mener": "Suivi des dépassements de puissance souscrite en pointe.",
                "Priorités": "Moyenne",
                "Vérification des actions": "Conforme"
            },
            {
                "Entreprise ou Entité": "Opérateurs et Personnel d'Exploitation",
                "Influence ou Pouvoir": 2,
                "Intérêt": 3,
                "Action sortante de la matrice": "Maintenir informés",
                "Moyen & Fréquence de communication": "Affichage ateliers et causeries",
                "Rôle": "Acteurs appliquant les consignes d'extinction et écogestes.",
                "Attentes de la parties prenantes envers": "Consignes simples et maintien du confort au poste.",
                "Actions à mener": "Sensibilisation aux arrêts machines en inter-postes.",
                "Priorités": "Moyenne",
                "Vérification des actions": "En cours"
            }
        ])

    # UES
    if "sme_ues" not in st.session_state:
        st.session_state.sme_ues = [
            {"id": "UES-01", "nom": "Centrale Froid Industriel (NH3)", "vecteur": "Électricité", "part_conso": 38.5, "facteurs": "Température extérieure, Volume traité", "responsable": "Y. Mercier (Responsable Utilités)", "couleur": "#2563EB"},
            {"id": "UES-02", "nom": "Fours & Lignes de Cuisson", "vecteur": "Gaz Naturel / Élec", "part_conso": 31.0, "facteurs": "Volume produit, Cadence machine", "responsable": "C. Bernard (Chef Procédés)", "couleur": "#DC2626"},
            {"id": "UES-03", "nom": "Centrale Air Comprimé (3 compresseurs)", "vecteur": "Électricité", "part_conso": 18.2, "facteurs": "Volume produit, Taux de fuite", "responsable": "P. Dubois (Maintenance)", "couleur": "#059669"},
            {"id": "UES-04", "nom": "Utilités, Chauffage & Bâtiments", "vecteur": "Électricité & Vapeur", "part_conso": 12.3, "facteurs": "DJU, Heures d'ouverture site", "responsable": "S. Martin (Services Généraux)", "couleur": "#D97706"}
        ]

    # IPÉ
    if "sme_ipe" not in st.session_state:
        st.session_state.sme_ipe = [
            {"id": "IPÉ-01", "ues": "UES-01 (Froid)", "nom": "Ratio Spécifique Froid", "unite": "kWh_froid / tonne", "valeur_actuelle": 7.42, "valeur_ser": 8.10, "ecart_pct": -8.4, "objectif": "≤ 7.50"},
            {"id": "IPÉ-02", "ues": "UES-03 (Air)", "nom": "Ratio Spécifique Air Comprimé", "unite": "kWh / Nm³ air", "valeur_actuelle": 0.142, "valeur_ser": 0.158, "ecart_pct": -10.1, "objectif": "≤ 0.140"},
            {"id": "IPÉ-03", "ues": "Site Global", "nom": "Intensité Énergétique Globale", "unite": "kWh_total / tonne", "valeur_actuelle": 18.9, "valeur_ser": 20.8, "ecart_pct": -9.1, "objectif": "≤ 19.0"},
            {"id": "IPÉ-04", "ues": "UES-02 (Fours)", "nom": "Rendement Thermique Fours", "unite": "kWh_gaz / tonne", "valeur_actuelle": 42.1, "valeur_ser": 43.5, "ecart_pct": -3.2, "objectif": "≤ 41.0"}
        ]

    # Chapitre 5 : Politique Énergétique Formelle (§5.2)
    if "politique_titre" not in st.session_state:
        st.session_state.politique_titre = "Politique Énergétique Industrielle du Site"
    if "politique_signataire" not in st.session_state:
        st.session_state.politique_signataire = "Jean-Marc Dupont (Directeur Général d'Usine)"
    if "politique_date" not in st.session_state:
        st.session_state.politique_date = "2024-09-01"
    if "politique_cible" not in st.session_state:
        st.session_state.politique_cible = "Réduire notre intensité énergétique spécifique globale de 12% d'ici fin 2027."
    if "politique_texte" not in st.session_state:
        st.session_state.politique_texte = """La maîtrise et l'efficacité énergétique constituent des priorités stratégiques absolues pour notre site industriel. Dans le cadre de notre démarche de certification ISO 50001:2018, la Direction s'engage formellement à :

1. Mettre à disposition l'ensemble des informations et des ressources financières, humaines et métrologiques indispensables pour atteindre les objectifs énergétiques fixés.
2. Promouvoir l'amélioration continue de la performance énergétique, des rendements d'équipements et de l'efficacité globale du Système de Management de l'Énergie (SMÉ).
3. Respecter scrupuleusement la totalité des exigences légales et réglementaires applicables (Code de l'Énergie, arrêtés préfectoraux ICPE, Décret Tertiaire, quotas d'émissions) ainsi que toute autre exigence souscrite.
4. Soutenir activement l'achat de produits, équipements et services énergétiquement performants ayant un impact significatif sur nos Usages Énergétiques Significatifs (UES).
5. Intégrer systématiquement les meilleures technologies disponibles (MTD) et les principes d'éco-conception dans tout projet de travaux neufs, extension ou réfection de nos procédés de fabrication.

Cette politique est communiquée à l'ensemble du personnel du site, mise à la disposition permanente des parties intéressées et réexaminée annuellement en Revue de Management."""

    # Chapitre 5 : Matrice RACI (§5.3)
    if "raci_table" not in st.session_state:
        st.session_state.raci_table = pd.DataFrame([
            {"Activité SMÉ": "Politique Énergétique : promulgation & révision (§5.2)", "Direction Générale": "A", "Pilote Énergie": "R", "Maintenance Utilités": "C", "Production": "C", "Achats & Travaux": "I", "Opérateurs": "I"},
            {"Activité SMÉ": "Revue énergétique & identification UES (§6.3)", "Direction Générale": "I", "Pilote Énergie": "A", "Maintenance Utilités": "R", "Production": "C", "Achats & Travaux": "I", "Opérateurs": "I"},
            {"Activité SMÉ": "Établissement des IPÉ et Situations SER (§6.4/6.5)", "Direction Générale": "I", "Pilote Énergie": "A", "Maintenance Utilités": "R", "Production": "C", "Achats & Travaux": "I", "Opérateurs": "I"},
            {"Activité SMÉ": "Arbitrage budgétaire des Plans d'Actions (§6.2)", "Direction Générale": "A", "Pilote Énergie": "R", "Maintenance Utilités": "C", "Production": "C", "Achats & Travaux": "R", "Opérateurs": "I"},
            {"Activité SMÉ": "Maîtrise opérationnelle quotidienne des UES (§8.1)", "Direction Générale": "I", "Pilote Énergie": "C", "Maintenance Utilités": "A", "Production": "R", "Achats & Travaux": "I", "Opérateurs": "R"},
            {"Activité SMÉ": "Spécification de critères énergétiques aux achats (§8.3)", "Direction Générale": "I", "Pilote Énergie": "C", "Maintenance Utilités": "C", "Production": "I", "Achats & Travaux": "R", "Opérateurs": "I"},
            {"Activité SMÉ": "Surveillance des dérives et traitement NC/AC (§10.1)", "Direction Générale": "I", "Pilote Énergie": "A", "Maintenance Utilités": "R", "Production": "R", "Achats & Travaux": "I", "Opérateurs": "R"},
            {"Activité SMÉ": "Programme et réalisation des audits internes (§9.2)", "Direction Générale": "I", "Pilote Énergie": "A", "Maintenance Utilités": "C", "Production": "C", "Achats & Travaux": "I", "Opérateurs": "I"},
            {"Activité SMÉ": "Conduite de la Revue de Management annuelle (§9.3)", "Direction Générale": "A", "Pilote Énergie": "R", "Maintenance Utilités": "C", "Production": "C", "Achats & Travaux": "C", "Opérateurs": "I"}
        ])

    # Chapitre 7.2 : Preuves de compétences (Fichiers ou Liens GED)
    if "competences_data" not in st.session_state:
        st.session_state.competences_data = [
            {"Poste / Rôle": "Référent Énergie Site", "Titulaire": "F. Martin", "Qualification": "Certification Lead Implementer ISO 50001 (AFNOR)", "UES": "Transversal", "Validité": "Habilité (2026)", "Type Justificatif": "Fichier joint", "Justificatif (Nom/Lien)": "certificat_lead_implementer_50001_afnor.pdf"},
            {"Poste / Rôle": "Conducteurs Chaufferie & Vapeur", "Titulaire": "Équipe Utilités (3 pers.)", "Qualification": "Attestation réglage combustion & sécurité brûleurs", "UES": "UES-02 (Fours/Chaudière)", "Validité": "100% Qualifiés", "Type Justificatif": "Lien GED", "Justificatif (Nom/Lien)": "https://ged.usine-valdeloire.corp/hse/habilitations/chaufferie_2025.pdf"},
            {"Poste / Rôle": "Frigoristes Usine", "Titulaire": "Y. Mercier & J. Dupuis", "Qualification": "Attestation d'aptitude manipulation ammoniac NH3", "UES": "UES-01 (Froid NH3)", "Validité": "À jour (2025)", "Type Justificatif": "Fichier joint", "Justificatif (Nom/Lien)": "attestation_aptitude_nh3_frigoristes_2024.pdf"},
            {"Poste / Rôle": "Techniciens Air Comprimé", "Titulaire": "P. Dubois", "Qualification": "Recherche de fuites ultrasons & acoustique", "UES": "UES-03 (Air Comprimé)", "Validité": "Qualifié (2025)", "Type Justificatif": "Lien GED", "Justificatif (Nom/Lien)": "https://sharepoint.groupe.fr/maintenance/qualif_ultrasons_air.pdf"}
        ]

    # Actions & Parades (Do)
    if "sme_actions" not in st.session_state:
        st.session_state.sme_actions = pd.DataFrame([
            {"id": "ACT-101", "titre": "Campagne ultrasons & élimination fuites d'air", "origine_swot": "Faiblesse : Fuites compresseur C2", "ues": "Air Comprimé", "responsable": "P. Dubois", "echeance": "2025-06-30", "gain_vise_kwh": 35000, "statut": "Terminé", "budget_keuros": 4.5},
            {"id": "ACT-102", "titre": "Variation électronique de vitesse compresseur 1", "origine_swot": "Faiblesse : Sensibilité canicules froid", "ues": "Froid Industriel", "responsable": "Y. Mercier", "echeance": "2025-09-15", "gain_vise_kwh": 78000, "statut": "En cours", "budget_keuros": 18.0},
            {"id": "ACT-103", "titre": "Calorifugeage vannes & réseaux vapeur haute température", "origine_swot": "Faiblesse : Pertes thermiques vapeur", "ues": "Procédés Thermiques", "responsable": "C. Bernard", "echeance": "2025-11-30", "gain_vise_kwh": 42000, "statut": "Planifié", "budget_keuros": 9.2},
            {"id": "ACT-104", "titre": "Automatisation extinction éclairage LED zones stockage", "origine_swot": "Opportunité : Décret tertiaire & BACS", "ues": "Bâtiments", "responsable": "S. Martin", "echeance": "2025-04-10", "gain_vise_kwh": 12000, "statut": "Terminé", "budget_keuros": 2.8}
        ])

    # Distance à la norme (Audit ISO 50001)
    if "distance_norme_data" not in st.session_state:
        st.session_state.distance_norme_data = [
            {"clause": "§4.1/4.2", "intitule": "Enjeux et parties intéressées", "statut": "Conforme", "chapitre": "Chapitre 4 : Contexte", "commentaire": "Matrice SWOT et tableau parties prenantes validés."},
            {"clause": "§4.3", "intitule": "Périmètre et domaine du SMÉ", "statut": "Conforme", "chapitre": "Chapitre 4 : Contexte", "commentaire": "Périmètre physique et activités délimités sans exclusion d'énergie."},
            {"clause": "§5.2", "intitule": "Politique énergétique formalisée", "statut": "Conforme", "chapitre": "Chapitre 5 : Leadership", "commentaire": "Signée par la direction générale et diffusée sur site."},
            {"clause": "§6.3", "intitule": "Revue énergétique et identification UES", "statut": "Conforme", "chapitre": "Chapitre 6 : Planification", "commentaire": "4 UES identifiés et représentés en camembert (> 85% de la conso)."},
            {"clause": "§6.4/6.5", "intitule": "IPÉ, SER et facteurs pertinents", "statut": "Partiel", "chapitre": "Chapitre 6 : Planification", "commentaire": "Ajustement climatique en place, régression air comprimé à finaliser."},
            {"clause": "§6.6", "intitule": "Plan de collecte des données", "statut": "Conforme", "chapitre": "Chapitre 6 : Planification", "commentaire": "Sous-comptage IoT OPC-UA et MQTT opérationnel."},
            {"clause": "§7.2", "intitule": "Compétences et formation aux UES", "statut": "Conforme", "chapitre": "Chapitre 7 : Support", "commentaire": "Référent certifié Lead Implementer ; habilitations chaufferie et froid."},
            {"clause": "§8.1", "intitule": "Maîtrise opérationnelle des UES", "statut": "Partiel", "chapitre": "Chapitre 8 : Réalisation", "commentaire": "Consignes compresseurs et températures froid en cours d'affichage."},
            {"clause": "§9.1", "intitule": "Surveillance et mesurage IPÉ", "statut": "Conforme", "chapitre": "Chapitre 9 : Évaluation", "commentaire": "Supervision horosynchrone continue avec alertes de dérives."},
            {"clause": "§9.2", "intitule": "Programme des audits internes", "statut": "Partiel", "chapitre": "Chapitre 9 : Évaluation", "commentaire": "Audit S1 2025 réalisé ; second audit semestriel planifié."},
            {"clause": "§10.1/10.2", "intitule": "Traitement des NC et amélioration", "statut": "Conforme", "chapitre": "Chapitre 10 : Amélioration", "commentaire": "Registre NC/AC actif et réduction de 9.1% du ratio énergétique."}
        ]

    if "sme_audits" not in st.session_state:
        st.session_state.sme_audits = pd.DataFrame([
            {"id": "AUD-2024-01", "domaine": "Revue énergétique et conformité UES", "auditeur": "Cabinet EnerNorm", "date": "2024-11-20", "resultat": "Conforme", "points_sensibles": "Documentation des SER à actualiser suite extension"},
            {"id": "AUD-2025-01", "domaine": "Maîtrise opérationnelle & comptage UES Froid", "auditeur": "Auditeur Interne Certifié (F. Blanc)", "date": "2025-03-12", "resultat": "1 écart mineur", "points_sensibles": "Étalonnage capteur débit air comprimé en retard"}
        ])

    if "sme_non_conformites" not in st.session_state:
        st.session_state.sme_non_conformites = pd.DataFrame([
            {"id": "NC-25-01", "date_constat": "2025-02-14", "ues": "Air Comprimé", "description": "Dérive anormale de la consommation en période chômée (> 32 kWh/h)", "cause_racine": "Électrovanne de purge bloquée ouverte sur cuve tampon", "action_corrective": "Remplacement kit vanne et ajout alerte seuil SCADA", "responsable": "P. Dubois", "statut": "Clôturée", "date_cloture": "2025-02-18"},
            {"id": "NC-25-02", "date_constat": "2025-03-02", "ues": "Froid Industriel", "description": "Pression de condensation trop haute par temps doux", "cause_racine": "Encrassement aérocondenseurs circuit 2", "action_corrective": "Nettoyage haute pression et ajustement consigne régulation", "responsable": "Y. Mercier", "statut": "En cours", "date_cloture": "-"}
        ])


init_session()

# -----------------------------------------------------------------------------
# 3. MENU LATÉRAL À GAUCHE (SIDEBAR) STRUCTURÉ EN 2 GRANDS PILIERS
# -----------------------------------------------------------------------------
st.sidebar.markdown("### ⚡ SMÉ ISO 50001")
st.sidebar.caption("Système de Management de l'Énergie & Supervision")

# Mode d'accès (Administrateur du logiciel ou Consultation)
mode_acces = st.sidebar.selectbox(
    "Mode d'accès :",
    options=["Administrateur (Droits Complets)", "Consultation (Lecture Seule)"],
    index=0
)
if "Consultation" in mode_acces:
    st.sidebar.warning("👁️ Mode Consultation actif (lecture seule d'audit)")

# Choix Périmètre (Monosite ou Multisite)
perimetre_mode = st.sidebar.radio(
    "Périmètre SMÉ :",
    options=["Monosite (Site Principal)", "Multisite (Multi-Établissements)"],
    index=0
)

if perimetre_mode == "Multisite (Multi-Établissements)":
    site_actif = st.sidebar.selectbox(
        "Site sélectionné :",
        options=[
            "🌐 Vue Consolidée Groupe (3 sites - 43.8 GWh)",
            "Site 1 : Val-de-Loire (VDL-01 - Agroalimentaire)",
            "Site 2 : Rhône-Alpes (RHA-02 - Fours & Traitement)",
            "Site 3 : Plateforme Ouest (PL-03 - Frigorifique)"
        ],
        index=0
    )
else:
    st.sidebar.caption("📍 Site actif : Usine Val-de-Loire (VDL-01)")

st.sidebar.divider()

pilier_selectionne = st.sidebar.radio(
    "GRANDS PILIERS MAJEURS :",
    options=["1. SMÉ (Système de Management)", "2. Analyse et Supervision"],
    index=0
)

st.sidebar.divider()

if pilier_selectionne == "1. SMÉ (Système de Management)":
    st.sidebar.markdown("**Cycle PDCA de Management :**")
    sous_section = st.sidebar.radio(
        "Navigation SMÉ :",
        options=[
            "Plan (Planifier)",
            "Do (Réaliser)",
            "Check (Vérifier)",
            "Act (Agir)"
        ],
        index=0
    )
else:
    st.sidebar.markdown("**Modules Techniques de Supervision :**")
    sous_section = st.sidebar.radio(
        "Navigation Supervision :",
        options=[
            "Supervision UES & IPÉ",
            "Alertes sur Seuil",
            "Facteurs & Corrélations",
            "Données Brutes",
            "Passerelle & Ingestion"
        ],
        index=0
    )

st.sidebar.divider()
st.sidebar.info("Norme NF EN ISO 50001:2018 | Audit & Performance")


# =============================================================================
# PILIER 1 : SMÉ (SYSTÈME DE MANAGEMENT)
# =============================================================================
if pilier_selectionne == "1. SMÉ (Système de Management)":

    # -------------------------------------------------------------------------
    # 1. PLAN (PLANIFIER)
    # -------------------------------------------------------------------------
    if sous_section == "Plan (Planifier)":
        st.markdown('<div class="main-header">Planifier (Plan) — ISO 50001:2018</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Contexte de l\'organisme (Ch. 4), Analyse SWOT & Parades, Parties intéressées, Revue énergétique UES avec Camembert (Ch. 6).</div>', unsafe_allow_html=True)

        # 1.1 CHAMP LIBRE : PÉRIMÈTRE ET DOMAINE D'APPLICATION (§4.3)
        st.markdown("### 🏛️ Chapitre 4 : Périmètre et Domaine d'Application du SMÉ (§4.3)")
        st.caption("Renseignez en champ libre les limites physiques et organisationnelles pour lesquelles l'organisme a l'autorité de maîtriser son énergie.")

        c_perim1, c_perim2 = st.columns(2)
        with c_perim1:
            perim_val = st.text_area(
                "Périmètre physique du SMÉ (Installations, sites, frontières physiques) :",
                value=st.session_state.perimetre_physique,
                height=100
            )
            st.session_state.perimetre_physique = perim_val

        with c_perim2:
            domaine_val = st.text_area(
                "Domaine d'application (Procédés, activités et types d'énergie inclus sans exclusion) :",
                value=st.session_state.domaine_application,
                height=100
            )
            st.session_state.domaine_application = domaine_val

        st.success("✅ Périmètre et domaine d'application documentés et conservés.")
        st.divider()

        # 1.2 TABLEAU SWOT TRADUIT EN FRANÇAIS AVEC LIEN VERS PARADES (DO)
        st.markdown("### 🧩 Chapitre 4 : Matrice SWOT Énergie (Analyse du Contexte & Risques §4.1 / §6.1)")
        st.caption("Identification des enjeux internes (Forces / Faiblesses) et externes (Opportunités / Menaces-Risques). En face de chaque Faiblesse et Risque, déployez une parade dans le Plan d'Actions (Do).")

        # Formulaire d'ajout en champ libre
        with st.expander("➕ Ajouter un élément SWOT en champ libre"):
            c_sw1, c_sw2, c_sw3 = st.columns(3)
            with c_sw1:
                sw_cat = st.selectbox("Quadrant SWOT :", ["Forces", "Faiblesses", "Opportunités", "Menaces / Risques"])
            with c_sw2:
                sw_titre = st.text_input("Titre / Intitulé :", "")
            with c_sw3:
                sw_imp = st.selectbox("Impact estimé :", ["Majeur", "Moyen", "Mineur"])
            sw_desc = st.text_input("Description détaillée :", "")

            if st.button("Enregistrer dans la matrice SWOT"):
                if sw_titre:
                    st.session_state.swot_data.append({
                        "id": f"SWOT-{sw_cat[0]}{len(st.session_state.swot_data)+1}",
                        "categorie": sw_cat,
                        "titre": sw_titre,
                        "description": sw_desc,
                        "impact": sw_imp
                    })
                    st.success("Élément ajouté à la matrice SWOT !")
                    st.rerun()

        # Affichage des 4 Quadrants SWOT
        col_sw1, col_sw2 = st.columns(2)

        with col_sw1:
            # FORCES
            st.markdown("#### 🟢 Forces (Atouts Internes)")
            forces = [s for s in st.session_state.swot_data if s["categorie"] == "Forces"]
            for f in forces:
                st.markdown(f"""
                <div class="swot-card" style="border-left: 4px solid #10B981; border: 1px solid #E2E8F0;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#0F172A;">{f['titre']}</strong>
                        <span style="font-size:11px; background:#ECFDF5; color:#065F46; padding:2px 6px; border-radius:4px;">{f['impact']}</span>
                    </div>
                    <div style="font-size:12px; color:#64748B; margin-top:4px;">{f['description']}</div>
                </div>
                """, unsafe_allow_html=True)

            # OPPORTUNITÉS
            st.markdown("#### 🔵 Opportunités (Leviers Externes)")
            opps = [s for s in st.session_state.swot_data if s["categorie"] == "Opportunités"]
            for o in opps:
                st.markdown(f"""
                <div class="swot-card" style="border-left: 4px solid #3B82F6; border: 1px solid #E2E8F0;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#0F172A;">{o['titre']}</strong>
                        <span style="font-size:11px; background:#EFF6FF; color:#1E40AF; padding:2px 6px; border-radius:4px;">{o['impact']}</span>
                    </div>
                    <div style="font-size:12px; color:#64748B; margin-top:4px;">{o['description']}</div>
                </div>
                """, unsafe_allow_html=True)

        with col_sw2:
            # FAIBLESSES (AVEC LIEN PARADE DO)
            st.markdown("#### 🟠 Faiblesses (Vulnérabilités Internes — Lien Parade Do)")
            faiblesses = [s for s in st.session_state.swot_data if s["categorie"] == "Faiblesses"]
            for w in faiblesses:
                st.markdown(f"""
                <div class="swot-card" style="border-left: 4px solid #F59E0B; border: 1px solid #E2E8F0;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#0F172A;">{w['titre']}</strong>
                        <span style="font-size:11px; background:#FFFBEB; color:#92400E; padding:2px 6px; border-radius:4px;">{w['impact']}</span>
                    </div>
                    <div style="font-size:12px; color:#64748B; margin-top:4px;">{w['description']}</div>
                </div>
                """, unsafe_allow_html=True)
                if st.button(f"🛡️ Déployer parade dans Plan d'Action (Do) : {w['titre'][:28]}...", key=f"btn_{w['id']}"):
                    new_act = pd.DataFrame([{
                        "id": f"ACT-10{len(st.session_state.sme_actions)+1}",
                        "titre": f"Parade Faiblesse : {w['titre']}",
                        "origine_swot": f"{w['id']} : {w['titre']}",
                        "ues": "Air Comprimé",
                        "responsable": "Responsable Utilités",
                        "echeance": "2025-11-30",
                        "gain_vise_kwh": 30000,
                        "statut": "Planifié",
                        "budget_keuros": 5.0
                    }])
                    st.session_state.sme_actions = pd.concat([st.session_state.sme_actions, new_act], ignore_index=True)
                    st.success(f"Action de parade créée avec succès dans l'onglet Do !")

            # MENACES / RISQUES (AVEC LIEN PARADE DO)
            st.markdown("#### 🔴 Menaces & Risques (Aléas Externes — Lien Parade Do)")
            menaces = [s for s in st.session_state.swot_data if s["categorie"] == "Menaces / Risques"]
            for m in menaces:
                st.markdown(f"""
                <div class="swot-card" style="border-left: 4px solid #EF4444; border: 1px solid #E2E8F0;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#0F172A;">{m['titre']}</strong>
                        <span style="font-size:11px; background:#FEF2F2; color:#991B1B; padding:2px 6px; border-radius:4px;">{m['impact']}</span>
                    </div>
                    <div style="font-size:12px; color:#64748B; margin-top:4px;">{m['description']}</div>
                </div>
                """, unsafe_allow_html=True)
                if st.button(f"🛡️ Déployer parade dans Plan d'Action (Do) : {m['titre'][:28]}...", key=f"btn_{m['id']}"):
                    new_act = pd.DataFrame([{
                        "id": f"ACT-10{len(st.session_state.sme_actions)+1}",
                        "titre": f"Parade Risque : {m['titre']}",
                        "origine_swot": f"{m['id']} : {m['titre']}",
                        "ues": "Utilités",
                        "responsable": "Responsable Énergie",
                        "echeance": "2025-12-15",
                        "gain_vise_kwh": 20000,
                        "statut": "Planifié",
                        "budget_keuros": 4.0
                    }])
                    st.session_state.sme_actions = pd.concat([st.session_state.sme_actions, new_act], ignore_index=True)
                    st.success(f"Action de parade créée avec succès dans l'onglet Do !")

        st.divider()

        # 1.3 ANALYSE DES PARTIES PRENANTES FIDÈLE AU DOCUMENT FOURNI
        st.markdown("### 👥 Chapitre 4.2 : Matrice & Analyse des Parties Prenantes")
        st.caption("Matrice Pouvoir (Influence) & Intérêt, action sortante de la matrice, moyens de communication et vérification des actions.")

        with st.expander("➕ Ajouter une nouvelle partie prenante dans la matrice"):
            c_p1, c_p2, c_p3 = st.columns(3)
            with c_p1:
                p_entite = st.text_input("Entreprise ou Entité :", "")
                p_inf = st.slider("Influence ou Pouvoir (1-4) :", min_value=1, max_value=4, value=3)
            with c_p2:
                p_int = st.slider("Intérêt (1-4) :", min_value=1, max_value=4, value=3)
                p_role = st.text_input("Rôle :", "")
            with c_p3:
                p_attentes = st.text_input("Attentes envers le SMÉ :", "")
                p_moyen = st.text_input("Moyen & Fréquence de communication :", "")
            c_p4, c_p5 = st.columns(2)
            with c_p4:
                p_actions = st.text_input("Actions à mener :", "")
            with c_p5:
                p_prio = st.selectbox("Priorité :", ["Haute", "Moyenne", "Basse"])
                p_verif = st.selectbox("Vérification :", ["Conforme", "En cours", "Planifié"])

            if st.button("Ajouter la partie prenante"):
                action_matrice = "Gérer avec attention" if (p_inf >= 3 and p_int >= 3) else "Maintenir informés" if p_int >= 3 else "Maintenir satisfaits"
                new_row = pd.DataFrame([{
                    "Entreprise ou Entité": p_entite,
                    "Influence ou Pouvoir": p_inf,
                    "Intérêt": p_int,
                    "Action sortante de la matrice": action_matrice,
                    "Moyen & Fréquence de communication": p_moyen,
                    "Rôle": p_role,
                    "Attentes de la parties prenantes envers": p_attentes,
                    "Actions à mener": p_actions,
                    "Priorités": p_prio,
                    "Vérification des actions": p_verif
                }])
                st.session_state.stakeholders_table = pd.concat([st.session_state.stakeholders_table, new_row], ignore_index=True)
                st.success("Partie prenante enregistrée dans la matrice !")
                st.rerun()

        st.dataframe(st.session_state.stakeholders_table, use_container_width=True, hide_index=True)

        st.divider()

        # 1.4 CHAPITRE 5 : LEADERSHIP, POLITIQUE ÉNERGÉTIQUE ET MATRICE RACI (§5.1, §5.2, §5.3)
        st.markdown("### 🏆 Chapitre 5 : Leadership & Engagement (ISO 50001:2018)")
        st.caption("Formalisation de la politique énergétique par la direction générale et définition des rôles et responsabilités sous forme matricielle RACI.")

        # Sous-partie A : Politique Énergétique (Template interactif prêt à l'emploi)
        st.markdown("#### 📜 §5.2 : Politique Énergétique Formelle (Template interactif prêt à l'emploi)")
        c_pol1, c_pol2, c_pol3 = st.columns(3)
        with c_pol1:
            st.session_state.politique_titre = st.text_input("Titre de la politique :", value=st.session_state.politique_titre)
        with c_pol2:
            st.session_state.politique_signataire = st.text_input("Signataire & Fonction :", value=st.session_state.politique_signataire)
        with c_pol3:
            st.session_state.politique_date = st.text_input("Date de signature :", value=st.session_state.politique_date)

        st.session_state.politique_cible = st.text_input("Cible chiffrée majeure (§5.2 b) :", value=st.session_state.politique_cible)

        texte_pol = st.text_area(
            "Corps officiel de la Politique Énergétique (conforme aux 5 engagements obligatoires ISO 50001 §5.2) :",
            value=st.session_state.politique_texte,
            height=200
        )
        st.session_state.politique_texte = texte_pol

        c_btn1, c_btn2 = st.columns([1, 4])
        with c_btn1:
            if st.button("💾 Enregistrer la politique"):
                st.success("Politique énergétique validée et enregistrée !")
        with c_btn2:
            st.download_button(
                label="📄 Télécharger la Politique Énergétique (Texte)",
                data=f"=== {st.session_state.politique_titre} ===\nSignataire: {st.session_state.politique_signataire}\nDate: {st.session_state.politique_date}\nCible: {st.session_state.politique_cible}\n\n{st.session_state.politique_texte}",
                file_name="Politique_Energetique_ISO50001.txt",
                mime="text/plain"
            )

        # Sous-partie B : Matrice RACI (§5.3)
        st.markdown("#### 👥 §5.3 : Rôles, Responsabilités et Autorités (Matrice RACI)")
        st.caption("R = Réalise (Responsible) | A = Approuve (Accountable) | C = Consulté (Consulted) | I = Informé (Informed)")

        with st.expander("➕ Ajouter une nouvelle activité à la matrice RACI en champ libre"):
            c_r1, c_r2, c_r3 = st.columns(3)
            with c_r1:
                r_act = st.text_input("Intitulé de l'activité SMÉ :", "")
                r_dir = st.selectbox("Direction Générale :", ["A", "R", "C", "I", "-"], index=0)
            with c_r2:
                r_pil = st.selectbox("Pilote Énergie :", ["R", "A", "C", "I", "-"], index=0)
                r_maint = st.selectbox("Maintenance Utilités :", ["C", "R", "A", "I", "-"], index=0)
            with c_r3:
                r_prod = st.selectbox("Production :", ["C", "R", "A", "I", "-"], index=0)
                r_ach = st.selectbox("Achats & Travaux :", ["I", "R", "A", "C", "-"], index=0)
            r_op = st.selectbox("Opérateurs Terrain :", ["I", "R", "A", "C", "-"], index=0)

            if st.button("Ajouter à la matrice RACI"):
                if r_act:
                    new_raci_row = pd.DataFrame([{
                        "Activité SMÉ": r_act,
                        "Direction Générale": r_dir,
                        "Pilote Énergie": r_pil,
                        "Maintenance Utilités": r_maint,
                        "Production": r_prod,
                        "Achats & Travaux": r_ach,
                        "Opérateurs": r_op
                    }])
                    st.session_state.raci_table = pd.concat([st.session_state.raci_table, new_raci_row], ignore_index=True)
                    st.success("Activité ajoutée à la matrice RACI !")
                    st.rerun()

        st.dataframe(st.session_state.raci_table, use_container_width=True, hide_index=True)

        st.divider()

        # 1.5 REVUE ÉNERGÉTIQUE UES AVEC CAMEMBERT (§6.3)
        st.markdown("### 🎯 Chapitre 6.3 : Revue Énergétique & Usages Énergétiques Significatifs (UES)")
        st.caption("Identification des postes prépondérants avec tableau des parts de consommation et Camembert de répartition (Pie Chart).")

        df_ues = pd.DataFrame(st.session_state.sme_ues)
        col_u1, col_u2 = st.columns([3, 2])

        with col_u1:
            st.markdown("#### Tableau des Usages Énergétiques Significatifs")
            st.dataframe(df_ues[["id", "nom", "vecteur", "part_conso", "facteurs", "responsable"]], use_container_width=True, hide_index=True)

        with col_u2:
            st.markdown("#### Camembert de Répartition des UES (%)")
            fig_cam = px.pie(
                df_ues,
                names="nom",
                values="part_conso",
                title="Consommation par UES (%)",
                color="nom",
                color_discrete_map={
                    "Centrale Froid Industriel (NH3)": "#2563EB",
                    "Fours & Lignes de Cuisson": "#DC2626",
                    "Centrale Air Comprimé (3 compresseurs)": "#059669",
                    "Utilités, Chauffage & Bâtiments": "#D97706"
                }
            )
            fig_cam.update_traces(textposition='inside', textinfo='percent+label')
            fig_cam.update_layout(height=300, margin=dict(t=30, b=10, l=10, r=10))
            st.plotly_chart(fig_cam, use_container_width=True)


    # -------------------------------------------------------------------------
    # 2. DO (RÉALISER)
    # -------------------------------------------------------------------------
    elif sous_section == "Do (Réaliser)":
        st.markdown('<div class="main-header">Réaliser (Do) — ISO 50001:2018</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Mise en œuvre des plans d\'actions d\'amélioration (§6.2.3), maîtrise opérationnelle (§8.1), ressources et compétences (§7.1, §7.2).</div>', unsafe_allow_html=True)

        df_act = st.session_state.sme_actions

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Actions Actives", len(df_act))
        m2.metric("Actions Clôturées", len(df_act[df_act["statut"] == "Terminé"]))
        m3.metric("Gains Cibles Cumulés", f"{df_act['gain_vise_kwh'].sum():,.0f} kWh/an")
        m4.metric("Budget Dédié", f"{df_act['budget_keuros'].sum():.1f} k€")

        st.markdown("#### Registre des Plans d'Actions Énergétiques & Parades SWOT")
        st.dataframe(df_act, use_container_width=True, hide_index=True)

        st.divider()
        st.markdown("#### 🎓 Chapitre 7.2 : Compétences, Habilitations Clés & Preuves Documentaires")
        st.caption("Gestion des preuves de compétences exigées lors des audits ISO 50001 §7.2 : téléversement direct de fichiers (PDF/scan) ou indication des liens GED / SharePoint.")

        # Formulaire d'ajout d'une compétence avec preuve
        with st.expander("➕ Enregistrer une qualification & justificatif (Fichier ou Lien GED)"):
            c_c1, c_c2 = st.columns(2)
            with c_c1:
                c_poste = st.text_input("Poste ou Fonction clé :", "")
                c_titulaire = st.text_input("Titulaire(s) :", "")
                c_qualif = st.text_input("Intitulé de qualification / titre :", "")
            with c_c2:
                c_ues = st.selectbox("UES rattachée :", ["Transversal", "UES-01 (Froid NH3)", "UES-02 (Fours/Chaudière)", "UES-03 (Air Comprimé)", "UES-04 (Bâtiments)"])
                c_val = st.text_input("Statut de validité :", "Habilité (2026)")
                c_mode = st.radio("Type de preuve documentaire :", ["Fichier joint (Upload)", "Lien GED / Réseau"], horizontal=True)

            justif_val = ""
            if c_mode == "Fichier joint (Upload)":
                uploaded_proof = st.file_uploader("Sélectionnez le fichier justificatif (PDF, scan, attestation) :", type=["pdf", "png", "jpg", "docx"])
                if uploaded_proof is not None:
                    justif_val = uploaded_proof.name
                else:
                    justif_val = "attestation_televersee.pdf"
            else:
                justif_val = st.text_input("Lien GED / URL vers le dossier de qualification :", "https://ged.usine-valdeloire.corp/hse/habilitations/doc.pdf")

            if st.button("Enregistrer la qualification et son justificatif"):
                if c_poste and c_qualif:
                    st.session_state.competences_data.append({
                        "Poste / Rôle": c_poste,
                        "Titulaire": c_titulaire or "Personnel désigné",
                        "Qualification": c_qualif,
                        "UES": c_ues,
                        "Validité": c_val,
                        "Type Justificatif": "Fichier joint" if c_mode.startswith("Fichier") else "Lien GED",
                        "Justificatif (Nom/Lien)": justif_val
                    })
                    st.success("Qualification enregistrée avec succès avec sa pièce justificative !")
                    st.rerun()

        # Tableau des compétences et justificatifs
        df_comp = pd.DataFrame(st.session_state.competences_data)
        st.dataframe(df_comp, use_container_width=True, hide_index=True)

        st.info("💡 **Conseil d'auditeur ISO 50001 §7.2 :** Lors de l'audit de certification, l'auditeur vérifie soit le fichier PDF conservé, soit l'accès au lien GED/SharePoint vers le dossier d'habilitation du personnel.")

        st.divider()
        st.markdown("#### ⚙️ Chapitre 8.1 : Maîtrise Opérationnelle des UES")
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("**UES-03 (Centrale Air Comprimé) :**")
            st.write("- Consigne de pression réseau verrouillée à 6.8 bar ± 0.2 bar.")
            st.write("- Contrôle acoustique hebdomadaire et suivi du talon de fuite en heures chômées.")
        with c2:
            st.markdown("**UES-01 (Centrale Froid NH3) :**")
            st.write("- Température de condensation flottante indexée sur la température extérieure.")
            st.write("- Dégivrage optimisé par gaz chaud.")


    # -------------------------------------------------------------------------
    # 3. CHECK (VÉRIFIER) — AVEC OUTIL "DISTANCE À LA NORME" À L'INTÉRIEUR !
    # -------------------------------------------------------------------------
    elif sous_section == "Check (Vérifier)":
        st.markdown('<div class="main-header">Vérifier (Check) — ISO 50001:2018</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Évaluation de la conformité, Distance à la norme, Suivi des IPÉ par rapport aux SER (§9.1) et Audits internes (§9.2).</div>', unsafe_allow_html=True)

        # Sous-onglets internes de la phase Check
        check_tabs = st.tabs([
            "🧭 Distance à la norme (Audit ISO 50001)",
            "📊 Suivi des IPÉ vs SER (§9.1)",
            "📋 Programme des Audits Internes (§9.2)"
        ])

        # 1. DISTANCE À LA NORME À L'INTÉRIEUR DE CHECK
        with check_tabs[0]:
            st.markdown("### 🧭 Évaluation de la Distance à la Norme ISO 50001:2018")
            st.caption("Outil d'audit interne méthodique évaluant la conformité du SMÉ aux exigences des Chapitres 4 à 10.")

            crit_list = st.session_state.distance_norme_data
            df_crit = pd.DataFrame(crit_list)

            # Calcul du score global
            total_pts = sum([100 if c["statut"] == "Conforme" else 50 if c["statut"] == "Partiel" else 0 for c in crit_list])
            max_pts = len(crit_list) * 100
            conformite_pct = round((total_pts / max_pts) * 100)

            k1, k2, k3, k4 = st.columns(4)
            k1.metric("Taux de Conformité Global", f"{conformite_pct} %")
            k2.metric("Exigences Conformes (100%)", len([c for c in crit_list if c["statut"] == "Conforme"]))
            k3.metric("Conformités Partielles (50%)", len([c for c in crit_list if c["statut"] == "Partiel"]))
            k4.metric("Non-Conformités (0%)", len([c for c in crit_list if c["statut"] == "Non Conforme"]))

            col_radar, col_diag = st.columns([1, 1])

            with col_radar:
                st.markdown("#### Couverture Normative par Chapitre")
                scores_chap = []
                chapitres = list(df_crit["chapitre"].unique())
                for ch in chapitres:
                    items = [c for c in crit_list if c["chapitre"] == ch]
                    sc = sum([100 if it["statut"] == "Conforme" else 50 if it["statut"] == "Partiel" else 0 for it in items])
                    scores_chap.append(round(sc / (len(items) * 100) * 100))

                fig_bar = px.bar(
                    x=chapitres,
                    y=scores_chap,
                    labels={"x": "Chapitre ISO 50001", "y": "Conformité (%)"},
                    text=[f"{s}%" for s in scores_chap],
                    color=scores_chap,
                    color_continuous_scale="greens"
                )
                fig_bar.update_layout(height=320, showlegend=False, margin=dict(t=20, b=30, l=10, r=10))
                st.plotly_chart(fig_bar, use_container_width=True)

            with col_diag:
                st.markdown("#### Diagnostic de Préparation à la Certification")
                if conformite_pct >= 85:
                    st.success(f"**Niveau de Maturité Élevé ({conformite_pct}%)** : Le SMÉ satisfait l'ensemble des exigences majeures. Le site est prêt pour la visite initiale de certification tierce-partie.")
                elif conformite_pct >= 65:
                    st.warning(f"**Niveau Intermédiaire ({conformite_pct}%)** : Les piliers fondamentaux sont en place. Finaliser la maîtrise opérationnelle (§8.1) et la documentation des SER (§6.5).")
                else:
                    st.error(f"**Niveau Insuffisant ({conformite_pct}%)** : Écarts significatifs détectés.")

                st.markdown("""
                **Actions de convergence prioritaires :**
                - Finaliser la consigne dynamique sur l'air comprimé.
                - Intégrer les DJU Froid dans la SER de la centrale frigorifique.
                - Planifier l'audit interne du S2 2025.
                """)

            st.dataframe(df_crit[["clause", "intitule", "statut", "commentaire", "chapitre"]], use_container_width=True, hide_index=True)

        # 2. SUIVI IPÉ vs SER
        with check_tabs[1]:
            st.markdown("### 📊 Suivi des IPÉ par rapport aux Situations Énergétiques de Référence (SER)")
            cols = st.columns(len(st.session_state.sme_ipe))
            for idx, kpi in enumerate(st.session_state.sme_ipe):
                with cols[idx]:
                    signe = "+" if kpi["ecart_pct"] > 0 else ""
                    st.metric(
                        label=kpi["nom"],
                        value=f"{kpi['valeur_actuelle']} {kpi['unite'].split('/')[0]}",
                        delta=f"{signe}{kpi['ecart_pct']}% vs SER",
                        delta_color="inverse" if kpi["ecart_pct"] < 0 else "normal"
                    )

        # 3. AUDITS INTERNES
        with check_tabs[2]:
            st.markdown("### 📋 Programme des Audits Internes du SMÉ (§9.2)")
            df_aud = st.session_state.sme_audits
            st.dataframe(df_aud, use_container_width=True, hide_index=True)


    # -------------------------------------------------------------------------
    # 4. ACT (AGIR)
    # -------------------------------------------------------------------------
    elif sous_section == "Act (Agir)":
        st.markdown('<div class="main-header">Agir (Act) — ISO 50001:2018</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Traitement des non-conformités, actions correctives (§10.1) et revue de management (§9.3).</div>', unsafe_allow_html=True)

        st.markdown("#### Registre des Non-Conformités et Actions Correctives (NC/AC)")
        df_nc = st.session_state.sme_non_conformites
        st.dataframe(df_nc, use_container_width=True, hide_index=True)

        st.divider()
        st.markdown("#### Revue de Management & Amélioration Continue (§9.3 / §10.2)")
        st.write("La Revue de Direction annuelle confirme :")
        st.write("✅ L'efficacité démontrée du SMÉ avec une réduction de 9.1% du ratio énergétique spécifique global.")
        st.write("✅ L'ajustement validé de la SER intégrant les DJU Froid pour la centrale frigorifique NH3.")
        st.write("✅ Le maintien des budgets d'investissement prioritaires pour la chaufferie et l'air comprimé.")


# =============================================================================
# PILIER 2 : ANALYSE ET SUPERVISION
# =============================================================================
else:

    # -------------------------------------------------------------------------
    # 2.1 PASSERELLE & INGESTION
    # -------------------------------------------------------------------------
    if sous_section == "Passerelle & Ingestion":
        st.markdown('<div class="main-header">Passerelle Industrielle & Ingestion Multi-Sources</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Simulation des liaisons IoT industrielles ouvertes (MQTT, OPC UA) et importation de relevés de mesure.</div>', unsafe_allow_html=True)

        col_imp, col_gate = st.columns([1, 1])

        with col_imp:
            st.markdown("#### 📁 Import de fichiers (CSV / Excel)")
            uploaded_file = st.file_uploader("Fichier de télé-relève ou centrale de mesure :", type=["csv", "xlsx", "xls"])
            if uploaded_file is not None:
                try:
                    if uploaded_file.name.endswith(".csv"):
                        df_up = pd.read_csv(uploaded_file)
                    else:
                        df_up = pd.read_excel(uploaded_file)
                    
                    if "timestamp" in df_up.columns:
                        cols = [c for c in df_up.columns if c != "timestamp"] + ["timestamp"]
                        df_up = df_up[cols]
                    st.session_state.df_energy = df_up
                    st.success(f"Fichier '{uploaded_file.name}' importé avec succès ({len(df_up)} lignes).")
                    st.rerun()
                except Exception as e:
                    st.error(f"Erreur de lecture : {e}")

            if st.button("Régénérer le jeu de données d'usine (45 jours)"):
                st.session_state.df_energy = generer_donnees_industrielles(45)
                st.success("Données régénérées !")
                st.rerun()

        with col_gate:
            st.markdown("#### 🌐 Passerelles Protocoles Ouverts")
            
            # OPC UA
            st.markdown("##### Connecteur OPC UA (IEC 62541)")
            st.text_input("Endpoint :", "opc.tcp://192.168.1.120:4840/FactoryEnergyServer", disabled=True)
            opc_val = st.toggle("Activer flux OPC UA", value=st.session_state.opc_active)
            st.session_state.opc_active = opc_val
            if opc_val:
                st.caption("🟢 Statut OPC UA : CONNECTÉ (Échantillonnage 1s)")

            # MQTT
            st.markdown("##### Broker MQTT Industriel (Sparkplug B)")
            st.text_input("Broker URL :", "mqtt://broker.industrial-iot.local:1883", disabled=True)
            mqtt_val = st.toggle("Souscrire aux topics MQTT", value=st.session_state.mqtt_active)
            st.session_state.mqtt_active = mqtt_val
            if mqtt_val:
                st.caption("🟢 Statut MQTT : CONNECTÉ (QoS 1, KeepAlive 60s)")

        st.divider()
        if st.button("Simuler l'injection d'une trame en direct (MQTT / OPC-UA)"):
            df_cur = st.session_state.df_energy
            last_t = pd.to_datetime(df_cur["timestamp"].iloc[-1])
            new_t = last_t + timedelta(hours=1)
            t_ext = round(16.0 + float(np.random.normal(0, 2)), 1)
            p_vol = round(max(0.0, 18.0 + float(np.random.normal(0, 2.5))), 2)
            c_froid = round(45 + 3.8 * max(0, t_ext) + 1.2 * p_vol, 2)
            c_air = round(35 + 4.2 * p_vol, 2)
            c_fours = round(60 + 8.5 * p_vol, 2)
            c_aux = round(25 + 0.3 * p_vol, 2)
            c_tot = round(c_froid + c_air + c_fours + c_aux, 2)

            new_pt = pd.DataFrame([{
                "conso_totale_kwh": c_tot,
                "conso_froid_kwh": c_froid,
                "conso_compresseurs_kwh": c_air,
                "conso_fours_kwh": c_fours,
                "conso_auxiliaires_kwh": c_aux,
                "temperature_ext_degc": t_ext,
                "volume_production_tonnes": p_vol,
                "taux_charge_pct": round(min(100.0, (p_vol / 25.0) * 100), 1),
                "pression_air_bar": round(6.8 + float(np.random.normal(0, 0.1)), 2),
                "dju_froid": round(max(0.0, t_ext - 18.0), 2),
                "protocole_source": "OPC-UA" if st.session_state.opc_active else "MQTT",
                "timestamp": new_t
            }])
            st.session_state.df_energy = pd.concat([df_cur, new_pt], ignore_index=True)
            st.success(f"Trame reçue à {new_t.strftime('%Y-%m-%d %H:%M:%S')} (Conso : {c_tot} kWh) !")
            st.rerun()


    # -------------------------------------------------------------------------
    # 2.2 SUPERVISION DES UES ET IPÉ
    # -------------------------------------------------------------------------
    elif sous_section == "Supervision UES & IPÉ":
        st.markdown('<div class="main-header">Supervision Énergétique des UES & IPÉ</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Tableaux de bord de surveillance, puissances appelées et trajectoires d\'indicateurs.</div>', unsafe_allow_html=True)

        df_v = st.session_state.df_energy.copy()
        df_v["timestamp"] = pd.to_datetime(df_v["timestamp"])

        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Consommation Totale Cumulée", f"{df_v['conso_totale_kwh'].sum():,.0f} kWh")
        k2.metric("Puissance Moyenne", f"{df_v['conso_totale_kwh'].mean():.1f} kW")
        k3.metric("Production Totale", f"{df_v['volume_production_tonnes'].sum():,.0f} tonnes")
        ratio_g = df_v['conso_totale_kwh'].sum() / max(1.0, df_v['volume_production_tonnes'].sum())
        k4.metric("IPÉ Moyen Site", f"{ratio_g:.2f} kWh/tonne")

        st.markdown("#### Chronogramme des Consommations par UES (kWh)")
        ues_cols = ["conso_froid_kwh", "conso_compresseurs_kwh", "conso_fours_kwh", "conso_auxiliaires_kwh"]
        fig_area = px.area(
            df_v,
            x="timestamp",
            y=ues_cols,
            labels={"value": "Consommation (kWh)", "variable": "UES", "timestamp": "Horodatage"},
            color_discrete_map={
                "conso_froid_kwh": "#2563EB",
                "conso_compresseurs_kwh": "#059669",
                "conso_fours_kwh": "#DC2626",
                "conso_auxiliaires_kwh": "#D97706"
            }
        )
        fig_area.update_layout(height=400, hovermode="x unified")
        st.plotly_chart(fig_area, use_container_width=True)

        c1, c2 = st.columns(2)
        with c1:
            st.markdown("#### Profil Moyen Journalier (Charge 24h)")
            df_v["heure"] = df_v["timestamp"].dt.hour
            hourly = df_v.groupby("heure")[ues_cols].mean().reset_index()
            fig_bar = px.bar(hourly, x="heure", y=ues_cols, barmode="stack")
            fig_bar.update_layout(height=320)
            st.plotly_chart(fig_bar, use_container_width=True)

        with c2:
            st.markdown("#### Trajectoire IPÉ Spécifique vs SER de Référence")
            df_v["ipe_sp"] = np.where(df_v["volume_production_tonnes"] > 0, df_v["conso_totale_kwh"] / df_v["volume_production_tonnes"], np.nan)
            df_v["ipe_ma"] = df_v["ipe_sp"].rolling(24, min_periods=1).mean()
            fig_ipe = go.Figure()
            fig_ipe.add_trace(go.Scatter(x=df_v["timestamp"], y=df_v["ipe_ma"], mode="lines", name="IPÉ Réel (Moy. 24h)", line=dict(color="#2563EB", width=2)))
            fig_ipe.add_hline(y=20.8, line_dash="dash", line_color="#DC2626", annotation_text="SER Référence (20.8)")
            fig_ipe.add_hline(y=19.0, line_dash="dot", line_color="#059669", annotation_text="Cible 2025 (19.0)")
            fig_ipe.update_layout(height=320)
            st.plotly_chart(fig_ipe, use_container_width=True)


    # -------------------------------------------------------------------------
    # 2.3 ALERTES SUR SEUIL (SURVEILLANCE CONTINUE ISO 50001 §6.6 / §9.1)
    # -------------------------------------------------------------------------
    elif sous_section == "Alertes sur Seuil":
        st.markdown('<div class="main-header">Surveillance Continue & Alertes sur Seuil Métier</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Détection immédiate des dérives, dépassements de puissance et chutes de rendement selon ISO 50001 §9.1.</div>', unsafe_allow_html=True)

        df_alert = st.session_state.df_energy.copy()
        last_pt = df_alert.iloc[-1]

        # Définition des règles de seuils industriels
        regles_seuils = [
            {"nom": "Puissance Totale Max", "var": "conso_totale_kwh", "op": ">", "seuil": 220.0, "unite": "kWh/h", "severite": "Critique", "ues": "Site Global"},
            {"nom": "Pression Air Comprimé", "var": "pression_air_bar", "op": "<", "seuil": 6.3, "unite": "bar", "severite": "Critique", "ues": "UES-03 (Air)"},
            {"nom": "Surchauffe Froid NH3", "var": "conso_froid_kwh", "op": ">", "seuil": 140.0, "unite": "kWh/h", "severite": "Majeur", "ues": "UES-01 (Froid)"},
            {"nom": "Dérive Fours Cuisson", "var": "conso_fours_kwh", "op": ">", "seuil": 240.0, "unite": "kWh/h", "severite": "Majeur", "ues": "UES-02 (Fours)"},
            {"nom": "Talon Auxiliaires / Fuites", "var": "conso_auxiliaires_kwh", "op": ">", "seuil": 45.0, "unite": "kWh/h", "severite": "Avertissement", "ues": "UES-04 (Bâtiments)"}
        ]

        # Évaluation en temps réel
        alertes_declenche = []
        for r in regles_seuils:
            val = float(last_pt[r["var"]])
            triggered = (val > r["seuil"]) if r["op"] == ">" else (val < r["seuil"])
            if triggered:
                alertes_declenche.append({
                    "Règle": r["nom"],
                    "UES": r["ues"],
                    "Sévérité": r["severite"],
                    "Mesure Réelle": f"{val:.1f} {r['unite']}",
                    "Condition": f"{r['op']} {r['seuil']} {r['unite']}",
                    "Horodatage": str(last_pt["timestamp"])
                })

        a1, a2, a3 = st.columns(3)
        a1.metric("Alertes Actives en Direct", len(alertes_declenche), delta="Dépassement" if alertes_declenche else "Normal", delta_color="inverse")
        a2.metric("Règles de Surveillance", len(regles_seuils))
        a3.metric("Statut Surveillance §9.1", "ACTIF (Temps Réel)")

        if alertes_declenche:
            st.error(f"⚠️ {len(alertes_declenche)} alerte(s) de seuil active(s) sur le dernier relevé !")
            st.dataframe(pd.DataFrame(alertes_declenche), use_container_width=True, hide_index=True)
            if st.button("Transférer vers Registre des Non-Conformités (§10.1)"):
                st.session_state.sme_non_conformites = pd.concat([
                    st.session_state.sme_non_conformites,
                    pd.DataFrame([{
                        "id": f"NC-ALERT-{len(st.session_state.sme_non_conformites)+1:02d}",
                        "date_constat": str(datetime.now().strftime("%Y-%m-%d")),
                        "ues": alertes_declenche[0]["UES"],
                        "description": f"Dépassement seuil critique : {alertes_declenche[0]['Règle']} ({alertes_declenche[0]['Mesure Réelle']})",
                        "cause_racine": "Dépassement automate supervisé",
                        "action_corrective": "Vérifier régulation et inspecter les organes de coupure",
                        "responsable": "Responsable Utilités",
                        "statut": "En cours",
                        "date_cloture": "-"
                    }])
                ], ignore_index=True)
                st.success("Fiche de Non-Conformité créée avec succès dans l'onglet Act (§10.1) !")
        else:
            st.success("✅ Aucun dépassement de seuil constaté sur les mesures récentes. Fonctionnement nominal.")

        st.markdown("#### Configuration des Règles et Seuils de Surveillance")
        st.dataframe(pd.DataFrame(regles_seuils), use_container_width=True, hide_index=True)


    # -------------------------------------------------------------------------
    # 2.3 FACTEURS PERTINENTS ET CORRÉLATIONS
    # -------------------------------------------------------------------------
    elif sous_section == "Facteurs & Corrélations":
        st.markdown('<div class="main-header">Analyse des Facteurs Pertinents & Corrélations</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Exigences ISO 50001 §6.3 c) et §6.5 : Modélisation mathématique et identification des facteurs clés d\'influence.</div>', unsafe_allow_html=True)

        df_c = st.session_state.df_energy.copy()
        numeric_cols = df_c.select_dtypes(include=[np.number]).columns.tolist()

        labels = {
            "conso_totale_kwh": "⚡ Conso Totale (kWh)",
            "conso_froid_kwh": "❄️ Froid NH3 (kWh)",
            "conso_compresseurs_kwh": "💨 Air Comprimé (kWh)",
            "conso_fours_kwh": "🔥 Fours Cuisson (kWh)",
            "conso_auxiliaires_kwh": "💡 Auxiliaires (kWh)",
            "temperature_ext_degc": "🌡️ Température Ext. (°C)",
            "volume_production_tonnes": "📦 Production (tonnes)",
            "taux_charge_pct": "📈 Taux Charge (%)",
            "pression_air_bar": "⏱️ Pression Air (bar)",
            "dju_froid": "☀️ DJU Froid"
        }

        st.markdown("#### 1. Sélection dynamique et régression linéaire (y = ax + b)")
        col1, col2 = st.columns(2)
        with col1:
            target_var = st.selectbox("Variable énergétique cible (Y) :", [c for c in numeric_cols if c.startswith("conso_")], format_func=lambda x: labels.get(x, x))
        with col2:
            driver_var = st.selectbox("Facteur explicatif influent (X) :", [c for c in numeric_cols if not c.startswith("conso_")], format_func=lambda x: labels.get(x, x), index=1)

        x_vals = df_c[driver_var].values
        y_vals = df_c[target_var].values
        mask = ~np.isnan(x_vals) & ~np.isnan(y_vals)
        x_vals = x_vals[mask]
        y_vals = y_vals[mask]

        if len(x_vals) > 2:
            pente, talon = np.polyfit(x_vals, y_vals, 1)
            r_mat = np.corrcoef(x_vals, y_vals)
            r_coef = r_mat[0, 1]
            r2_val = r_coef ** 2

            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Coefficient R²", f"{r2_val:.3f}")
            m2.metric("Corrélation r", f"{r_coef:+.3f}")
            m3.metric("Pente a (Sensibilité)", f"{pente:.3f}")
            m4.metric("Talon Fixe b", f"{talon:.1f} kWh")

            fig_scat = go.Figure()
            fig_scat.add_trace(go.Scatter(x=x_vals, y=y_vals, mode="markers", name="Mesures réelles", marker=dict(color="#2563EB", opacity=0.6, size=6)))
            x_line = np.linspace(x_vals.min(), x_vals.max(), 100)
            y_line = pente * x_line + talon
            fig_scat.add_trace(go.Scatter(x=x_line, y=y_line, mode="lines", name=f"Régression : y = {pente:.2f}x + {talon:.1f}", line=dict(color="#DC2626", width=2.5)))
            fig_scat.update_layout(height=400, xaxis_title=labels.get(driver_var, driver_var), yaxis_title=labels.get(target_var, target_var))
            st.plotly_chart(fig_scat, use_container_width=True)

            if r2_val >= 0.70:
                qualif = "confirme une très forte corrélation (facteur pertinent validé pour la SER selon ISO 50006)"
            else:
                qualif = "indique une dépendance modérée nécessitant un modèle multivariable ou l'intégration de facteurs statiques supplémentaires"

            st.markdown(f"""
            > **Interprétation SER (ISO 50001 §6.5) :**  
            > L'équation du modèle énergétique ajusté est : **`{target_var} = {pente:.2f} × {driver_var} + {talon:.1f}`**.  
            > Le coefficient de détermination **R² = {r2_val:.3f}** {qualif}.
            """)

        st.divider()
        st.markdown("#### 2. Matrice de Corrélation Globale (Carte Thermique / Heatmap)")
        corr_matrix = df_c[numeric_cols].corr().round(2)
        readable_names = [labels.get(c, c) for c in numeric_cols]

        fig_heat = px.imshow(
            corr_matrix,
            text_auto=True,
            aspect="auto",
            color_continuous_scale="RdBu_r",
            zmin=-1,
            zmax=1,
            x=readable_names,
            y=readable_names
        )
        fig_heat.update_layout(height=520, margin=dict(t=30, b=10, l=10, r=10))
        st.plotly_chart(fig_heat, use_container_width=True)


    # -------------------------------------------------------------------------
    # 2.4 DONNÉES BRUTES (AVEC CONTRAINTE HORODATAGE TOUT À DROITE)
    # -------------------------------------------------------------------------
    elif sous_section == "Données Brutes":
        st.markdown('<div class="main-header">Données de Mesure Brutes Récupérées</div>', unsafe_allow_html=True)
        st.markdown('<div class="sub-header">Tableau chronologique des mesures et variables physiques d\'usine.</div>', unsafe_allow_html=True)

        # APPLICATION STRICTE DE LA CONTRAINTE :
        # "les colonnes de mesures, capteurs et variables doivent être placées à gauche,
        # et la colonne 'timestamp' (horodatage) doit impérativement être positionnée tout à droite du tableau"
        df_raw = st.session_state.df_energy.copy()
        cols_sans_timestamp = [col for col in df_raw.columns if col != "timestamp"]
        ordered_cols = cols_sans_timestamp + ["timestamp"]
        df_raw = df_raw[ordered_cols]

        st.success("✅ **Contrainte absolue respectée :** Les colonnes de mesures, capteurs et variables sont positionnées à gauche, et la colonne **`timestamp`** (horodatage) est placée impérativement tout à droite du tableau.")

        c1, c2, c3 = st.columns([2, 1, 1])
        with c1:
            proto_sel = st.multiselect("Filtrer par protocole :", options=df_raw["protocole_source"].unique(), default=df_raw["protocole_source"].unique())
        with c2:
            nb_lignes = st.selectbox("Lignes affichées :", [20, 50, 100, 500, "Toutes"], index=1)
        with c3:
            ordre_tri = st.radio("Chronologie :", ["Plus récent d'abord", "Plus ancien d'abord"])

        df_filtre = df_raw[df_raw["protocole_source"].isin(proto_sel)]
        if ordre_tri == "Plus récent d'abord":
            df_filtre = df_filtre.sort_values(by="timestamp", ascending=False)
        else:
            df_filtre = df_filtre.sort_values(by="timestamp", ascending=True)

        df_show = df_filtre.head(int(nb_lignes)) if nb_lignes != "Toutes" else df_filtre
        st.dataframe(df_show, use_container_width=True, hide_index=True)

        csv_buf = io.StringIO()
        df_filtre.to_csv(csv_buf, index=False, sep=";")
        st.download_button(
            label="📥 Exporter les données brutes (CSV avec horodatage à droite)",
            data=csv_buf.getvalue(),
            file_name=f"mesures_energetiques_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )

# -----------------------------------------------------------------------------
# PIED DE PAGE
# -----------------------------------------------------------------------------
st.divider()
st.caption("Système de Management de l'Énergie NF EN ISO 50001:2018 | Architecture Sidebar 2 Piliers Streamlit")
