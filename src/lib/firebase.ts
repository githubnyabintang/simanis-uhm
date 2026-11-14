import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseWebConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfig: Array<keyof FirebaseWebConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
];

export const firebaseConfigured = requiredConfig.every((key) => Boolean(firebaseConfig[key]));

if (!firebaseConfigured && import.meta.env.PROD) {
  console.warn('Firebase belum dikonfigurasi. Isi environment variables VITE_FIREBASE_* di Vercel.');
}

const sdkConfig: FirebaseOptions = firebaseConfig;

export const firebaseApp = firebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(sdkConfig)
  : null;

export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;

