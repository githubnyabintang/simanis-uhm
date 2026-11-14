import { config } from 'dotenv';
import { initializeApp, deleteApp } from 'firebase/app';
import { deleteDoc, doc, getFirestore, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { randomUUID } from 'node:crypto';

config({ path: '.env.local', quiet: true });
if (process.env.VITE_FIREBASE_PROJECT_ID !== 'simanis-uhm' || !process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_APP_ID) throw Error('Konfigurasi Firebase belum lengkap.');
const app = initializeApp({ apiKey: process.env.VITE_FIREBASE_API_KEY, projectId: process.env.VITE_FIREBASE_PROJECT_ID, appId: process.env.VITE_FIREBASE_APP_ID });
const ref = doc(getFirestore(app), '_realtime_checks', randomUUID());
let seen = 0;
let notify: (() => void) | undefined;
const unsubscribe = onSnapshot(ref, { includeMetadataChanges: true }, (snapshot) => {
  if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites && snapshot.exists()) {
    seen = snapshot.data().value;
    notify?.();
  }
});
function waitFor(expected: number) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { notify = undefined; reject(Error('Pembaruan Firestore tidak diterima tepat waktu.')); }, 15000);
    notify = () => { if (seen === expected) { clearTimeout(timer); notify = undefined; resolve(); } };
    notify();
  });
}
try {
  const first = waitFor(1);
  await setDoc(ref, { value: 1 });
  await first;
  const second = waitFor(2);
  await updateDoc(ref, { value: 2 });
  await second;
  console.log('Listener Firestore menerima perubahan pertama dan kedua dari server.');
} finally {
  unsubscribe();
  await deleteDoc(ref);
  await deleteApp(app);
}
