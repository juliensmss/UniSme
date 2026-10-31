import React, { useState } from 'react';
import { UserAccountItem, UserRole } from '../types/energy';
import {
  Shield,
  Zap,
  Wrench,
  Eye,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  KeyRound,
  FileCheck2,
  ExternalLink,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  UserCheck
} from 'lucide-react';

interface UserAccessSectionProps {
  users: UserAccountItem[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccountItem[]>>;
  currentUserEmail: string;
  onSwitchUser: (user: UserAccountItem) => void;
  currentRole: UserRole;
}

export const ROLE_CONFIGS: Record<UserRole, {
  label: string;
  badgeLabel: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  targetAudience: string;
  primaryMission: string;
}> = {
  admin: {
    label: 'Administrateur',
    badgeLabel: 'Admin',
    icon: Shield,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: "Droits complets d'édition, gestion des comptes, facturation SaaS et paramétrage.",
    targetAudience: 'Directeur de site, Responsable SI, Administrateur UniSme',
    primaryMission: 'Gestion des comptes, facturation SaaS, sécurité et paramétrage global des sites.'
  },
  energy_manager: {
    label: 'Équipe Énergie',
    badgeLabel: 'Energy Manager',
    icon: Zap,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    description: 'Pilotage complet du SMÉ : UES, formules IPÉ/SER, plan d’actions et alertes.',
    targetAudience: 'Ingénieur Énergie, Responsable Maintenance, Référent ISO 50001',
    primaryMission: 'Pilotage complet du SMÉ : calibrage des UES, formules IPÉ/SER, plan d’actions et traitement des dérives.'
  },
  operator: {
    label: 'Opérateur / Technicien',
    badgeLabel: 'Terrain',
    icon: Wrench,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'Monitoring temps réel et acquittement terrain des alertes avec motif.',
    targetAudience: 'Chefs d’équipe, Conducteurs de ligne, Techniciens de maintenance',
    primaryMission: 'Visualisation des consommations en temps réel, acquittement terrain des alertes et suivi opérationnel.'
  },
  auditor: {
    label: 'Consultation / Auditeur',
    badgeLabel: 'Lecture Seule',
    icon: Eye,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    description: 'Consultation des tableaux de bord et vérification des preuves d’audit ISO 50001.',
    targetAudience: 'Auditeur AFNOR/Bureau Veritas, Direction générale, CSE/RSE',
    primaryMission: 'Consultation des tableaux de bord, vérification des preuves d’audit, export des bilans et revues sans modification.'
  }
};

export const PERMISSIONS_MATRIX = [
  {
    module: 'Gestion des utilisateurs & Rôles',
    admin: 'Total (Gestion complète)',
    energy_manager: 'Aucun',
    operator: 'Aucun',
    auditor: 'Aucun',
    adminOk: true,
    energyOk: false,
    opOk: false,
    auditOk: false
  },
  {
    module: 'Abonnement SaaS & Coordonnées',
    admin: 'Total',
    energy_manager: 'Aucun',
    operator: 'Aucun',
    auditor: 'Aucun',
    adminOk: true,
    energyOk: false,
    opOk: false,
    auditOk: false
  },
  {
    module: 'Cartographie des compteurs & Ingestion IoT',
    admin: 'Écriture',
    energy_manager: 'Écriture',
    operator: 'Lecture',
    auditor: 'Lecture',
    adminOk: true,
    energyOk: true,
    opOk: 'read',
    auditOk: 'read'
  },
  {
    module: 'Paramétrage des UES & Formules IPÉ / SER',
    admin: 'Écriture',
    energy_manager: 'Total',
    operator: 'Lecture',
    auditor: 'Lecture',
    adminOk: true,
    energyOk: true,
    opOk: 'read',
    auditOk: 'read'
  },
  {
    module: 'Plan d’Actions (Créer, budgéter, valider)',
    admin: 'Écriture',
    energy_manager: 'Total',
    operator: 'Commentaire',
    auditor: 'Lecture',
    adminOk: true,
    energyOk: true,
    opOk: 'comment',
    auditOk: 'read'
  },
  {
    module: 'Centre d’Alertes (Acquitter, justifier anomalie)',
    admin: 'Oui',
    energy_manager: 'Oui',
    operator: 'Oui (Saisie cause)',
    auditor: 'Lecture seule',
    adminOk: true,
    energyOk: true,
    opOk: true,
    auditOk: 'read'
  },
  {
    module: 'Revue de Management & Conformité ISO (§9-§10)',
    admin: 'Écriture',
    energy_manager: 'Total',
    operator: 'Aucun',
    auditor: 'Audit complet',
    adminOk: true,
    energyOk: true,
    opOk: false,
    auditOk: 'read'
  },
  {
    module: 'Export des rapports & Téléchargement des preuves',
    admin: 'Oui',
    energy_manager: 'Oui',
    operator: 'Aucun',
    auditor: 'Oui (PDF/Excel)',
    adminOk: true,
    energyOk: true,
    opOk: false,
    auditOk: true
  }
];

export const UserAccessSection: React.FC<UserAccessSectionProps> = ({
  users,
  setUsers,
  currentUserEmail,
  onSwitchUser,
  currentRole
}) => {
  // Formulaire d'attribution / modification par adresse mail
  const [targetEmail, setTargetEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('energy_manager');
  const [fonction, setFonction] = useState('');
  const [departement, setDepartement] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Recherche & Filtres dans le tableau
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Détection si l'email saisi existe déjà pour pré-remplir automatiquement
  const handleEmailChange = (emailVal: string) => {
    setTargetEmail(emailVal);
    const existing = users.find(u => u.email.toLowerCase() === emailVal.trim().toLowerCase());
    if (existing) {
      setNom(existing.nom);
      setPrenom(existing.prenom);
      setSelectedRole(existing.role);
      setFonction(existing.fonction);
      setDepartement(existing.departement);
    }
  };

  // Soumission de l'attribution d'accès
  const handleSaveAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) {
      setNotification('Veuillez renseigner une adresse email valide.');
      return;
    }

    const cleanEmail = targetEmail.trim().toLowerCase();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (existingIndex >= 0) {
      // Mise à jour de l'utilisateur existant
      const updated = [...users];
      updated[existingIndex] = {
        ...updated[existingIndex],
        nom: nom.trim() || updated[existingIndex].nom,
        prenom: prenom.trim() || updated[existingIndex].prenom,
        role: selectedRole,
        fonction: fonction.trim() || updated[existingIndex].fonction,
        departement: departement.trim() || updated[existingIndex].departement,
        statut: 'Actif'
      };
      setUsers(updated);
      setNotification(`Droits d’accès mis à jour avec succès pour ${cleanEmail} (${ROLE_CONFIGS[selectedRole].label}).`);
    } else {
      // Création d'un nouvel utilisateur
      const newUser: UserAccountItem = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        nom: nom.trim() || 'Collaborateur',
        prenom: prenom.trim() || 'Nouveau',
        email: cleanEmail,
        role: selectedRole,
        fonction: fonction.trim() || 'Membre Équipe',
        departement: departement.trim() || 'Usine Val-de-Loire',
        dateAjout: new Date().toISOString().split('T')[0],
        statut: 'Actif',
        derniereConnexion: 'Jamais'
      };
      setUsers([newUser, ...users]);
      setNotification(`Accès attribué avec succès à ${cleanEmail} avec le profil ${ROLE_CONFIGS[selectedRole].label}.`);
    }

    // Réinitialisation partielle
    setTimeout(() => setNotification(null), 4500);
  };

  // Modification directe du rôle dans le tableau
  const handleRowRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setNotification(`Rôle de ${targetUser.email} modifié en "${ROLE_CONFIGS[newRole].label}".`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Suppression d'un compte
  const handleDeleteUser = (userId: string, email: string) => {
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      alert('Impossible de supprimer votre propre compte administrateur en cours d’utilisation.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    setNotification(`Accès révoqué pour ${email}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fonction.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* 1. En-tête de section & Contexte ISO 50001 §5.3 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Gestion des Accès & Rôles Utilisateurs
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    Mode Démo RBAC
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conformité ISO 50001:2018 §5.3 (<em>Rôles, responsabilités et autorités au sein de l’organisme</em>) — Attribution des privilèges par adresse e-mail.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-500 block">Périmètre autorisé :</span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 justify-end">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Usine Val-de-Loire (VDL-01)
              </span>
            </div>
          </div>
        </div>

        {/* Alerte Démo & Firebase */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Fonctionnement en démonstration :</strong> Cette interface vous permet d'ajuster en direct les privilèges attribués à chaque adresse e-mail professionnelle. Les modifications sont actives immédiatement dans cette session. Lors du passage en production commerciale, ces rôles seront synchronisés automatiquement avec votre annuaire <strong>Firebase Auth</strong> ou <strong>Microsoft Entra ID / Google Workspace</strong>.
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5"
          >
            Fermer
          </button>
        </div>
      )}

      {/* 2. Formulaire d'Attribution Rapide par Adresse E-mail */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Attribuer ou Modifier les Droits d'une Personne par son Adresse E-mail
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Saisissez un e-mail existant pour modifier son rôle, ou un nouvel e-mail pour l'inviter.
          </span>
        </div>

        <form onSubmit={handleSaveAccess} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* E-mail */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse e-mail professionnelle <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ex: prenom.nom@usine.com"
                  value={targetEmail}
                  onChange={e => handleEmailChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Astuce : tapez l'adresse d'un membre existant pour charger son profil.
              </p>
            </div>

            {/* Prénom & Nom */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                placeholder="Prénom"
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                placeholder="Nom de famille"
                value={nom}
                onChange={e => setNom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fonction / Rôle opérationnel
              </label>
              <input
                type="text"
                placeholder="ex: Référent Énergie, Chef de quart, Auditeur AFNOR..."
                value={fonction}
                onChange={e => setFonction(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service / Département
              </label>
              <input
                type="text"
                placeholder="ex: Maintenance Utilités, Production Ligne A, RSE..."
                value={departement}
                onChange={e => setDepartement(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Sélecteur des 4 Rôles Recommandés */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Profil d'accès à attribuer <span className="text-emerald-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Object.keys(ROLE_CONFIGS) as UserRole[]).map(roleKey => {
                const config = ROLE_CONFIGS[roleKey];
                const Icon = config.icon;
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    type="button"
                    key={roleKey}
                    onClick={() => setSelectedRole(roleKey)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`p-1.5 rounded-lg ${config.badgeBg} ${config.badgeText}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-tight">
                      {config.label}
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                      {config.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bouton de validation */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Enregistrer l'attribution d'accès</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Table des Utilisateurs Actuels avec Changement Rapide en Ligne */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Utilisateurs Habilités & Rôles Actifs ({filteredUsers.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Recherche */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-56"
              />
            </div>

            {/* Filtre Rôle */}
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="energy_manager">Équipe Énergie</option>
              <option value="operator">Opérateur Terrain</option>
              <option value="auditor">Auditeur / Consultation</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-2.5 px-3">Collaborateur</th>
                <th className="py-2.5 px-3">Adresse e-mail</th>
                <th className="py-2.5 px-3">Fonction & Service</th>
                <th className="py-2.5 px-3">Rôle & Droits d'Accès</th>
                <th className="py-2.5 px-3 text-right">Actions Démo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const config = ROLE_CONFIGS[user.role];
                const isCurrent = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                const Icon = config.icon;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nom + Avatar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          user.role === 'admin' ? 'bg-emerald-100 text-emerald-800' :
                          user.role === 'energy_manager' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'operator' ? 'bg-amber-100 text-amber-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {user.prenom[0]}{user.nom[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.prenom} {user.nom}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Vous
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Ajouté le {user.dateAjout}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {user.email}
                      </span>
                    </td>

                    {/* Fonction */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{user.fonction}</div>
                      <div className="text-[10px] text-slate-400">{user.departement}</div>
                    </td>

                    {/* Rôle avec Sélecteur Direct Déroulant */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`p-1 rounded ${config.badgeBg} ${config.badgeText}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <select
                          value={user.role}
                          onChange={e => handleRowRoleChange(user.id, e.target.value as UserRole)}
                          className={`text-xs font-semibold py-1 px-2 rounded-lg border focus:outline-none transition-colors ${
                            user.role === 'admin'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              : user.role === 'energy_manager'
                              ? 'border-blue-200 bg-blue-50 text-blue-900'
                              : user.role === 'operator'
                              ? 'border-amber-200 bg-amber-50 text-amber-900'
                              : 'border-indigo-200 bg-indigo-50 text-indigo-900'
                          }`}
                          title="Modifier directement le rôle de cet utilisateur"
                        >
                          <option value="admin">🛡️ Administrateur</option>
                          <option value="energy_manager">⚡ Équipe Énergie</option>
                          <option value="operator">🔧 Opérateur Terrain</option>
                          <option value="auditor">👁️ Consultation / Auditeur</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions Démo */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSwitchUser(user)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                          title="Tester l'application avec la session de cette personne"
                        >
                          <span>Tester ce profil</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Révoquer l'accès"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Matrice Complète des Droits d'Accès (Conforme ISO 50001 §5.3) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Matrice de Gouvernance des Droits (ISO 50001 §5.3)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tableau des autorisations par profil utilisateur appliquées sur chaque module du SMÉ et de la supervision.
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-2.5 px-3 font-bold">Module UniSme / Fonctionnalité</th>
                <th className="py-2.5 px-3 font-bold text-emerald-800 bg-emerald-50/50">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>🛡️ Administrateur</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 font-bold text-blue-800 bg-blue-50/50">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>⚡ Équipe Énergie</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 font-bold text-amber-800 bg-amber-50/50">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>🔧 Opérateur Terrain</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 font-bold text-indigo-800 bg-indigo-50/50">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>👁️ Consultation / Audit</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {row.module}
                  </td>
                  
                  {/* Admin */}
                  <td className="py-2.5 px-3 bg-emerald-50/20">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      ✅ {row.admin}
                    </span>
                  </td>

                  {/* Équipe Énergie */}
                  <td className="py-2.5 px-3 bg-blue-50/20">
                    {row.energyOk ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                        ✅ {row.energy_manager}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-normal text-[11px]">
                        ❌ {row.energy_manager}
                      </span>
                    )}
                  </td>

                  {/* Opérateur */}
                  <td className="py-2.5 px-3 bg-amber-50/20">
                    {row.opOk === true ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        ✅ {row.operator}
                      </span>
                    ) : row.opOk === 'read' ? (
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        👁️ {row.operator}
                      </span>
                    ) : row.opOk === 'comment' ? (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        📝 {row.operator}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-normal text-[11px]">
                        ❌ {row.operator}
                      </span>
                    )}
                  </td>

                  {/* Auditeur */}
                  <td className="py-2.5 px-3 bg-indigo-50/20">
                    {row.auditOk === true ? (
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                        ✅ {row.auditor}
                      </span>
                    ) : row.auditOk === 'read' ? (
                      <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded text-[11px]">
                        👁️ {row.auditor}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-normal text-[11px]">
                        ❌ {row.auditor}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
