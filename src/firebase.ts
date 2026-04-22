import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export const db = typeof window !== 'undefined'
  ? initializeFirestore(
      app,
      { 
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
        experimentalForceLongPolling: true // More stable in restricted network environments
      },
      firebaseConfig.firestoreDatabaseId
    )
  : getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Validate Connection to Firestore on startup
if (typeof window !== 'undefined') {
  const testConnection = async (retryCount = 0) => {
    try {
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, retryCount === 0 ? 500 : 2000));
      
      // Use getDocFromServer to bypass local cache and actually test the network
      await getDocFromServer(doc(db, 'test', 'connection')).catch((err) => {
        // If it's just 'not-found' or 'permission-denied', the connection is actually ALIVE
        if (err.code === 'not-found' || err.code === 'permission-denied') return;
        throw err;
      });
      
      console.log('Firestore connection verified');
    } catch (error: any) {
      console.warn(`Firestore connection attempt ${retryCount + 1} failed:`, error.message);
      
      if (retryCount < 2) {
        testConnection(retryCount + 1);
      } else if (error.message.includes('the client is offline') || error.message.includes('Could not reach Cloud Firestore backend')) {
        console.error("CRITICAL: Firestore backend unreachable. Check your internet connection.");
      }
    }
  };
  
  testConnection();
}

export const storage = getStorage(app);

import { Analytics } from 'firebase/analytics';
import { FirebasePerformance } from 'firebase/performance';

let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

if (typeof window !== 'undefined') {
  const initAnalytics = async () => {
    if (!navigator.onLine) return; // Don't even try if offline
    try {
      const supported = await isAnalyticsSupported();
      if (supported) {
        analytics = getAnalytics(app);
      }
    } catch {
      // Be completely silent here to avoid global error bubbles
    }
  };

  initAnalytics();
  
  try {
    if (navigator.onLine) {
      performance = getPerformance(app);
    }
  } catch {
    // Be silent here
  }
}

export { analytics, performance };

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
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Custom message for connectivity issues
  let userFriendlyError = errorMessage;
  if (errorMessage.includes('Could not reach Cloud Firestore backend') || errorMessage.includes('offline')) {
    userFriendlyError = 'Poor connection detected. Some data may not be up to date.';
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error Info: ', JSON.stringify(errInfo));
  
  // We throw the JSON but also add a window event that global UI can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('firestore-error', { 
      detail: { 
        message: userFriendlyError,
        info: errInfo 
      } 
    }));
  }

  throw new Error(JSON.stringify(errInfo));
}
