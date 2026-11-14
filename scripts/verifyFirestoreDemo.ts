import { config } from 'dotenv';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, getDocsFromServer, getFirestore } from 'firebase/firestore';
import { findLoginUser } from '../src/utils/findLoginUser';
import type { User } from '../src/types';

config({ path: '.env.local', quiet: true });
if (process.env.VITE_FIREBASE_PROJECT_ID !== 'simanis-uhm' || !process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_APP_ID) throw Error('Konfigurasi Firebase belum lengkap.');
const app = initializeApp({ apiKey: process.env.VITE_FIREBASE_API_KEY, projectId: process.env.VITE_FIREBASE_PROJECT_ID, appId: process.env.VITE_FIREBASE_APP_ID });
const db = getFirestore(app);
try {
  const names = ['users', 'courses', 'offerings', 'enrollments', 'grades', 'students'];
  const snapshots = await Promise.all(names.map((name) => getDocsFromServer(collection(db, name))));
  const data = Object.fromEntries(snapshots.map((snapshot, i) => [names[i], snapshot.docs.filter((item) => item.id.startsWith('simdemo-')).map((item) => item.data())]));
  if (data.users.length !== 36 || data.courses.length !== 10 || data.offerings.length !== 10 || data.students.length !== 30 || data.enrollments.length !== 300 || data.grades.length !== 300) throw Error('Jumlah dokumen demo tidak sesuai.');
  if (data.users.some((user) => user.demoPassword !== 'Demo2026!')) throw Error('Password akun demo tidak sesuai.');
  if (data.users.some((user) => /demo/i.test(user.name || '')) || data.students.some((student) => /demo/i.test(student.nama || '')) || data.courses.some((course) => /demo/i.test(course.namaMK || '') || /demo/i.test(course.kodeMK || ''))) throw Error('Masih ada nama atau kode yang mengandung demo.');
  if (!data.users.some((user) => user.role === 'admin' && user.username === 'admin')) throw Error('Username admin tidak sesuai.');
  if (!data.users.some((user) => user.role === 'admin' && user.username === 'admin' && user.name === 'Admin')) throw Error('Nama admin tidak sesuai.');
  const users = data.users as User[];
  for (const user of users.filter((item) => item.role === 'mahasiswa')) {
    if (findLoginUser(users, user.username).user?.id !== user.id) throw Error(`Login mahasiswa ${user.username} tidak cocok.`);
  }
  for (const user of users.filter((item) => item.role === 'dosen')) {
    if (findLoginUser(users, user.username).user?.id !== user.id || !user.nidn || findLoginUser(users, user.nidn).user?.id !== user.id) throw Error(`Login dosen ${user.username} tidak cocok.`);
  }
  for (let i = 1; i <= 10; i++) {
    const id = `simdemo-offering-${String(i).padStart(2, '0')}`;
    const enrollmentCount = data.enrollments.filter((item) => item.penawaranId === id).length;
    const grades = data.grades.filter((item) => item.penawaranId === id);
    const verified = grades.filter((item) => item.statusVerifikasi === 'Terverifikasi').length;
    const expected = [27, 27, 27, 6, 6, 3, 9, 9, 9, 9][i - 1];
    if (enrollmentCount !== 30 || grades.length !== 30 || verified !== expected) throw Error(`Jumlah peserta atau status mata kuliah ${i} tidak sesuai.`);
    console.log(`DEMO${String(i).padStart(2, '0')}: ${enrollmentCount} mahasiswa, ${verified}/30 terverifikasi`);
  }
  console.log('Akun demo: 1 admin, 5 dosen, 30 mahasiswa.');
} finally { await deleteApp(app); }
