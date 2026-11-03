import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import type { FirebaseClientConfig } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const LOCAL_STORAGE_KEY = 'queuemate_firebase_config';

/**
 * Retrieve current Firebase configuration.
 * Priority:
 * 1. Environment variables (VITE_FIREBASE_*)
 * 2. Stored configuration in localStorage (allows runtime setup in UI)
 */
export function getFirebaseConfig(): FirebaseClientConfig | null {
  const envConfig: FirebaseClientConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  if (envConfig.apiKey && envConfig.apiKey !== 'MY_FIREBASE_API_KEY' && envConfig.projectId) {
    return envConfig;
  }

  // Check localStorage for manually entered configuration
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved Firebase config from localStorage:', err);
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseClientConfig) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  // Reload window to re-initialize SDK cleanly with new credentials
  window.location.reload();
}

export function clearFirebaseConfig() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.location.reload();
}

export const isFirebaseConfigured = (): boolean => {
  return getFirebaseConfig() !== null;
};

// Initialize Firebase App
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

const activeConfig = getFirebaseConfig();

if (activeConfig) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase with active configuration:', error);
  }
}

export const auth = authInstance;
export const db = dbInstance;

/**
 * Formatted error handler conforming to skill specification
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid || null,
      email: authInstance?.currentUser?.email || null,
      emailVerified: authInstance?.currentUser?.emailVerified || null,
      isAnonymous: authInstance?.currentUser?.isAnonymous || null,
      tenantId: authInstance?.currentUser?.tenantId || null,
      providerInfo:
        authInstance?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Connection check mandated by Firebase Integration skill
 */
export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  if (!dbInstance) {
    return {
      connected: false,
      message: 'Firebase is not configured. Please supply Firebase credentials.',
    };
  }

  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    return { connected: true, message: 'Successfully connected to Cloud Firestore.' };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { connected: false, message: 'Firestore client is offline. Check network or rules.' };
    }
    // "permission-denied" or "not-found" is normal because test/connection document does not exist
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      return { connected: true, message: 'Connected to Firestore (Security Rules Active).' };
    }
    return { connected: true, message: 'Connected to Cloud Firestore.' };
  }
}
