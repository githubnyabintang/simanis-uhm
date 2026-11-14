import { config } from 'dotenv';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, doc, getDocsFromServer, getFirestore, writeBatch } from 'firebase/firestore';

config({ path: '.env.local', quiet: true });
if (process.env.VITE_FIREBASE_PROJECT_ID !== 'simanis-uhm' || !process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_APP_ID) throw Error('Konfigurasi Firebase belum lengkap.');
const app = initializeApp({ apiKey: process.env.VITE_FIREBASE_API_KEY, projectId: process.env.VITE_FIREBASE_PROJECT_ID, appId: process.env.VITE_FIREBASE_APP_ID });
const db = getFirestore(app);
const students = ['Aditya Pratama', 'Aisyah Putri', 'Bagas Saputra', 'Citra Maharani', 'Dimas Ramadhan', 'Dinda Puspita', 'Fajar Nugraha', 'Farah Nabila', 'Galih Prasetyo', 'Hana Safitri', 'Ilham Maulana', 'Intan Permata', 'Kevin Pratama', 'Laras Ayuningtyas', 'Muhammad Rizal', 'Nadya Azzahra', 'Nurul Hidayah', 'Putra Wirawan', 'Putri Ramadhani', 'Rafi Akbar', 'Rahma Amalia', 'Rizky Firmansyah', 'Salsa Bella', 'Siti Khadijah', 'Taufik Hidayat', 'Tiara Lestari', 'Vina Oktaviani', 'Wahyu Kurniawan', 'Yuliana Sari', 'Zahra Aulia'];
const lecturers = ['Dr. Ahmad Fauzi, M.T.', 'Dr. Siti Rahmawati, M.Kom.', 'Dr. Andi Pratama, M.T.', 'Dr. Nur Aisyah, M.Kom.', 'Dr. Budi Santoso, M.T.'];
const courseCodes = ['RPL701', 'BD702', 'RPL703', 'SC704', 'KI705', 'KA706', 'SI707', 'PL708', 'MP709', 'MP710'];
const names = ['users', 'students', 'courses', 'offerings', 'verificationHistory', 'programStudi', 'classes'];
const pad = (n: number) => String(n).padStart(2, '0');
try {
  const snapshots = await Promise.all(names.map((name) => getDocsFromServer(collection(db, name))));
  const documents = new Map(names.map((name, i) => [name, new Map(snapshots[i].docs.map((item) => [item.id, item.data()]))]));
  if ([...documents.get('users')!.entries()].some(([id, data]) => id !== 'simdemo-admin' && data.username === 'admin')) throw Error('Username admin sudah digunakan akun lain; perubahan dihentikan.');
  const updates: { col: string; id: string; fields: Record<string, unknown> }[] = [];
  const add = (col: string, id: string, fields: Record<string, unknown>) => { if (!documents.get(col)?.has(id)) throw Error(`Dokumen ${col}/${id} tidak ditemukan; perubahan dihentikan.`); updates.push({ col, id, fields }); };
  add('users', 'simdemo-admin', { name: 'Admin', username: 'admin', email: 'admin@example.com', avatar: 'AD' });
  lecturers.forEach((name, i) => add('users', `simdemo-dosen-${pad(i + 1)}`, { name, avatar: name.replace(/^Dr\.\s*/, '').split(' ').slice(0, 2).map((part) => part[0]).join('') }));
  students.forEach((name, i) => {
    const id = pad(i + 1);
    add('users', `simdemo-mahasiswa-${id}`, { name, avatar: name.split(' ').slice(0, 2).map((part) => part[0]).join('') });
    add('students', `simdemo-student-${id}`, { nama: name });
  });
  courseCodes.forEach((kodeMK, i) => {
    const id = pad(i + 1);
    add('courses', `simdemo-course-${id}`, { kodeMK, ...(i === 0 ? { namaMK: 'Sistem Komputer' } : {}) });
    add('offerings', `simdemo-offering-${id}`, { ruang: `Ruang ${String(201 + i)}`, jadwal: `${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][i % 5]}, ${i < 5 ? '08:00 - 10:30' : '13:00 - 15:30'} WITA` });
  });
  add('programStudi', 'simdemo-prodi', { kodeProdi: '55101', namaProdi: 'Magister Pascasarjana Prodi Sistem Komputer' });
  add('classes', 'simdemo-class', { kodeKelas: 'PASCA-1', namaKelas: 'Kelas PASCA-1' });
  for (const [id, data] of documents.get('verificationHistory')!) {
    if (!id.startsWith('simdemo-history-')) continue;
    const match = /^simdemo-dosen-(\d{2})$/.exec(String(data.userId));
    if (!match || !lecturers[Number(match[1]) - 1]) throw Error(`Dosen pada ${id} tidak dikenal; perubahan dihentikan.`);
    add('verificationHistory', id, { userName: lecturers[Number(match[1]) - 1], keterangan: 'Verifikasi nilai mahasiswa.' });
  }
  const batch = writeBatch(db);
  for (const item of updates) batch.update(doc(db, item.col, item.id), item.fields);
  await batch.commit();
  const check = await getDocsFromServer(collection(db, 'users'));
  if (!check.docs.some((item) => item.id === 'simdemo-admin' && item.data().username === 'admin')) throw Error('Verifikasi perubahan admin gagal.');
  console.log(`${updates.length} dokumen diperbarui. Username admin: admin. Password akun tidak diubah.`);
} finally { await deleteApp(app); }
