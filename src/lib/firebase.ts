import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configuration du projet Firebase UniSme (fournie par la console)
const firebaseConfig = {
  apiKey: "AIzaSyDucjKBBzih4XyPlf9U0HEyjHW3tcfd4Yo",
  authDomain: "unisme-js.firebaseapp.com",
  projectId: "unisme-js",
  storageBucket: "unisme-js.firebasestorage.app",
  messagingSenderId: "602512058281",
  appId: "1:602512058281:web:a70bc4569ffb6a457586b8",
  measurementId: "G-P9T4N9XFKE"
};

// Initialisation sécurisée (Singleton pour éviter les réinitialisations lors des rechargements)
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp);

export interface LeadPayload {
  nom: string;
  prenom: string;
  email: string;
  entreprise?: string;
  source: 'demo_modal' | 'contact_form' | 'direct_access';
  objet?: string;
  message?: string;
}

/**
 * Enregistre un prospect qualifié dans la collection 'leads' de Cloud Firestore
 * avec horodatage serveur et statut initial 'nouveau'.
 */
export async function recordLeadInFirestore(payload: LeadPayload): Promise<{ success: boolean; id?: string }> {
  try {
    const leadsCollection = collection(db, 'leads');
    const docRef = await addDoc(leadsCollection, {
      nom: payload.nom.trim(),
      prenom: payload.prenom.trim(),
      email: payload.email.trim().toLowerCase(),
      entreprise: payload.entreprise ? payload.entreprise.trim() : 'Non renseigné',
      source: payload.source,
      objet: payload.objet || 'Accès Démo UniSme',
      message: payload.message || '',
      statut: 'nouveau',
      createdAt: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'web'
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    // Mode dégradé silencieux pour ne jamais bloquer l'utilisateur si Firestore a des restrictions réseau
    console.warn('[UniSme Firebase] Enregistrement Firestore en tâche de fond :', err);
    return { success: false };
  }
}
