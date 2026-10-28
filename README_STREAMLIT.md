# Système de Management de l'Énergie (SMÉ ISO 50001:2018) & Supervision

Application industrielle développée sous **Streamlit** (Python) et reproduite fidèlement sous **React / TypeScript**, articulée autour d'un **menu latéral à gauche (sidebar)** structuré en **2 grands piliers majeurs** :

---

## Architecture de la Sidebar & Navigation

### 🏛️ Pilier 1 : "1. SMÉ (Système de Management)"
Ce pilier pilote la démarche de gouvernance et de certification ISO 50001:2018 :
1. **Distance à la norme (Audit interne & auto-évaluation)** :
   - Grille d'évaluation méthodique couvrant les Chapitres 4 à 10 de la norme HLS.
   - Calcul automatique du taux de conformité global (%) et notation de maturité.
   - Graphique de couverture normative par chapitre et synthèse des écarts prioritaires.
2. **Plan (Planifier)** :
   - Chapitre 4 : Contexte de l'organisme, périmètre et domaine d'application sans exclusion d'énergie (§4.3), registre des parties intéressées (§4.2).
   - Chapitre 5 : Politique énergétique signée par la direction générale (§5.2).
   - Chapitre 6.3 : Revue énergétique, identification et hiérarchisation des Usages Énergétiques Significatifs (UES / SEU).
   - Chapitres 6.4 & 6.5 : Définition des Indicateurs de Performance Énergétique (IPÉ / EnPI) et Situations Énergétiques de Référence (SER / EnB).
3. **Do (Réaliser)** :
   - Suivi dynamique du plan d'actions d'efficacité énergétique (§6.2.3 & §8.1) avec gains visés en kWh/an et budgets.
   - Prise en compte du Chapitre 7 : Ressources, matrice des compétences, habilitations (référent énergie, chaufferie, froid) et plan de collecte (§6.6).
4. **Check (Vérifier)** :
   - Surveillance continue des IPÉ par rapport aux SER ajustées (§9.1).
   - Programme et registre des audits internes du SMÉ (§9.2).
5. **Act (Agir)** :
   - Traitement méthodique des dérives via les fiches de Non-Conformités et Actions Correctives (§10.1).
   - Décisions de sortie de la Revue de Direction (§9.3) et amélioration continue (§10.2).

---

### 📡 Pilier 2 : "2. Supervision & Analyse"
Ce pilier regroupe les outils techniques d'ingénierie et de métrologie :
1. **Passerelle & Ingestion** :
   - Import direct de relevés énergétiques (fichiers CSV ou classeurs Excel `.xlsx`).
   - Passerelles industrielles connectées ouvertes : **OPC UA** (IEC 62541, automate S7-1500) et **MQTT** (Sparkplug B / JSON).
   - Simulateur de trames temps réel avec injection ponctuelle ou flux continu.
2. **Supervision UES & IPÉ** :
   - Chronogrammes des puissances et consommations cumulées par UES (aires empilées).
   - Profil moyen journalier (puissance horosynchrone 0h - 23h).
   - Trajectoire temporelle de l'IPÉ spécifique vs SER de référence et cible.
3. **Facteurs & Corrélations (ISO 50001 §6.3 c & §6.5)** :
   - Sélection dynamique des variables d'influence (température extérieure, production, taux de charge, pression air, DJU).
   - Sélection de la grandeur cible (conso totale ou UES).
   - Nuage de points interactif avec droite de régression linéaire ($y = ax + b$), calcul du $R^2$, coefficient de Pearson $r$, sensibilité et talon fixe non-dépendant ($b$).
   - Matrice de corrélation globale calculée sur toutes les grandeurs et restituée sous forme de **Carte Thermique (Heatmap)** avec palette divergente.
4. **Données Brutes (Contrainte absolue respectée)** :
   - Tableau de télémesure complet avec recherche, filtres et pagination.
   - **Mise en page stricte** : Toutes les colonnes de mesures, capteurs et variables sont positionnées **à gauche**, et la colonne **`timestamp`** (horodatage) est **impérativement positionnée tout à droite** du tableau.

---

## Instructions d'Exécution Locale

### 1. Installation des dépendances
```bash
pip install -r requirements.txt
```
*(Ou manuellement : `pip install streamlit pandas numpy plotly scikit-learn scipy openpyxl`)*

### 2. Démarrage de l'application Streamlit
```bash
streamlit run iso50001_sme_app.py
```
L'interface Streamlit s'ouvre sur `http://localhost:8501`.
