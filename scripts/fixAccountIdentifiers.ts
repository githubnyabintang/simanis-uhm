import { config } from 'dotenv';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, doc, getDocsFromServer, getFirestore, writeBatch } from 'firebase/firestore';

config({ path: ['.env.local', '.env'], quiet: true });
if (process.env.VITE_FIREBASE_PROJECT_ID !== 'simanis-uhm' || !process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_APP_ID) throw Error('Konfigurasi Firebase belum lengkap.');
const app = initializeApp({ apiKey: process.env.VITE_FIREBASE_API_KEY, projectId: process.env.VITE_FIREBASE_PROJECT_ID, appId: process.env.VITE_FIREBASE_APP_ID });
const db = getFirestore(app);
try {
  const snapshot = await getDocsFromServer(collection(db, 'users'));
  const users = new Map(snapshot.docs.map((item) => [item.id, item.data()]));
  const admin = users.get('simdemo-admin');
  if (!admin || admin.role !== 'admin') throw Error('Akun admin yang diharapkan tidak ditemukan.');
  const changes: { id: string; nidn: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const n = String(i).padStart(2, '0');
    const id = `simdemo-dosen-${n}`;
    const user = users.get(id);
    const nidn = `88000000${n}`;
    if (!user || user.role !== 'dosen' || (user.nidn !== `99000000${n}` && user.nidn !== nidn)) throw Error(`NIDN ${id} telah berubah atau akun tidak ditemukan; tidak ada perubahan dilakukan.`);
    if ([...users.entries()].some(([otherId, other]) => otherId !== id && [other.username, other.email, other.npm, other.nidn].some((v) => typeof v === 'string' && v.toLowerCase() === nidn))) throw Error(`NIDN baru ${nidn} sudah digunakan; tidak ada perubahan dilakukan.`);
    changes.push({ id, nidn });
  }
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', 'simdemo-admin'), { name: 'Admin', avatar: 'AD' });
  for (const change of changes) batch.update(doc(db, 'users', change.id), { nidn: change.nidn });
  await batch.commit();
  const verified = await getDocsFromServer(collection(db, 'users'));
  const byId = new Map(verified.docs.map((item) => [item.id, item.data()]));
  if (byId.get('simdemo-admin')?.name !== 'Admin' || changes.some((change) => byId.get(change.id)?.nidn !== change.nidn)) throw Error('Verifikasi data akun gagal.');
  console.log('Nama Admin dan NIDN lima dosen berhasil diperbarui dan diverifikasi.');
} finally { await deleteApp(app); }
