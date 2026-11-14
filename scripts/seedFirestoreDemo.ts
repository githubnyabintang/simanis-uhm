import { config } from 'dotenv';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, doc, getDocsFromServer, getFirestore, writeBatch } from 'firebase/firestore';

config({ path: ['.env.local', '.env'], quiet: true });
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = process.env.VITE_FIREBASE_API_KEY;
const appId = process.env.VITE_FIREBASE_APP_ID;
if (!apiKey || !appId || projectId !== 'simanis-uhm') {
  throw new Error('Konfigurasi Firebase di .env.local belum lengkap atau project ID bukan simanis-uhm.');
}

const app = initializeApp({ apiKey, appId, projectId, authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN });
const db = getFirestore(app);
const now = '2026-11-14T00:00:00.000Z';
const password = 'Demo2026!';
const rows: { collection: string; id: string; data: Record<string, unknown> }[] = [];
const add = (collection: string, id: string, data: Record<string, unknown>) => rows.push({ collection, id, data: { id, ...data } });
const pad = (n: number) => String(n).padStart(2, '0');
const courseNames = ['Sistem Komputer', 'Basis Data Lanjut', 'Arsitektur Perangkat Lunak', 'Sistem Cerdas', 'Keamanan Informasi', 'Komputasi Awan', 'Analisis dan Perancangan Sistem', 'Pengujian Perangkat Lunak', 'Manajemen Proyek Teknologi Informasi', 'Metodologi Penelitian'];

add('users', 'simdemo-admin', { name: 'Admin', username: 'admin', email: 'admin@example.com', role: 'admin', isActive: true, demoPassword: password, createdAt: now });
add('programStudi', 'simdemo-prodi', { kodeProdi: '55101', namaProdi: 'Magister Pascasarjana Prodi Sistem Komputer', jenjang: 'S2' });
add('semesters', 'simdemo-semester', { nomorSemester: 1, namaSemester: 'Semester 1' });
add('classes', 'simdemo-class', { kodeKelas: 'PASCA-1', namaKelas: 'Kelas PASCA-1', prodiId: 'simdemo-prodi' });
for (let n = 2; n <= 4; n++) add('classes', `simdemo-class-pasca-${n}`, { kodeKelas: `PASCA-${n}`, namaKelas: `Kelas PASCA-${n}`, prodiId: 'simdemo-prodi' });

for (let i = 1; i <= 5; i++) {
  const n = pad(i);
  add('users', `simdemo-dosen-${n}`, { name: `Dosen Demo ${n}`, username: `dosen${n}`, email: `dosen${n}@example.com`, nidn: `88000000${n}`, role: 'dosen', isActive: true, demoPassword: password, createdAt: now });
}
for (let i = 1; i <= 30; i++) {
  const n = pad(i);
  const npm = `99000000${n}`;
  const userId = `simdemo-mahasiswa-${n}`;
  add('users', userId, { name: `Mahasiswa Demo ${n}`, username: npm, email: `mahasiswa${n}@example.com`, npm, prodiId: 'simdemo-prodi', role: 'mahasiswa', isActive: true, demoPassword: password, createdAt: now });
  add('students', `simdemo-student-${n}`, { npm, nama: `Mahasiswa Demo ${n}`, prodiId: 'simdemo-prodi', semesterId: 'simdemo-semester', kelasAsalId: 'simdemo-class', userId, email: `mahasiswa${n}@example.com`, angkatan: '2026' });
}

for (let course = 1; course <= 10; course++) {
  const n = pad(course);
  const offeringId = `simdemo-offering-${n}`;
  const lecturerId = `simdemo-dosen-${pad(((course - 1) % 5) + 1)}`;
  add('courses', `simdemo-course-${n}`, { kodeMK: `DEMO${n}`, namaMK: courseNames[course - 1], sks: 3, semesterPaket: 1 });
  add('offerings', offeringId, { mataKuliahId: `simdemo-course-${n}`, prodiId: 'simdemo-prodi', semesterId: 'simdemo-semester', kelasId: 'simdemo-class', dosenId: lecturerId, periodeAkademik: '2026/2027 — Ganjil', statusPublikasi: 'published' });
  add('weights', `simdemo-weight-${n}`, { penawaranId: offeringId, bobotTugas: 30, bobotUTS: 30, bobotUAS: 40, updatedAt: now });
  for (let student = 1; student <= 30; student++) {
    const m = pad(student);
    const npm = `99000000${m}`;
    const enrollmentId = `simdemo-enrollment-${n}-${m}`;
    const gradeId = `simdemo-grade-${n}-${m}`;
    const verified = course <= 3 || (course >= 7 && student <= 15);
    const score = (offset: number) => 60 + ((course * 17 + student * 13 + offset) % 36);
    add('enrollments', enrollmentId, { penawaranId: offeringId, npm, createdAt: now });
    add('grades', gradeId, { pesertaId: enrollmentId, penawaranId: offeringId, npm, nilaiTugas: score(1), nilaiUTS: score(9), nilaiUAS: score(19), statusVerifikasi: verified ? 'Terverifikasi' : 'Menunggu Verifikasi', ...(verified ? { verifiedBy: lecturerId, verifiedAt: now } : {}), updatedAt: now });
    if (verified) add('verificationHistory', `simdemo-history-${n}-${m}`, { nilaiId: gradeId, penawaranId: offeringId, npm, aksi: 'Verifikasi', userId: lecturerId, userName: `Dosen Demo ${pad(((course - 1) % 5) + 1)}`, waktu: now, keterangan: 'Verifikasi data demo.' });
  }
}

try {
  const names = [...new Set(rows.map((row) => row.collection))];
  const snapshots = await Promise.all(names.map((name) => getDocsFromServer(collection(db, name))));
  const existing = new Set(snapshots.flatMap((snapshot, i) => snapshot.docs.map((item) => `${names[i]}/${item.id}`)));
  const collision = rows.find((row) => existing.has(`${row.collection}/${row.id}`));
  if (collision) throw new Error(`Dokumen ${collision.collection}/${collision.id} sudah ada; impor dihentikan tanpa menimpa data.`);
  let committed = 0;
  for (let offset = 0; offset < rows.length; offset += 350) {
    const batch = writeBatch(db);
    const chunk = rows.slice(offset, offset + 350);
    for (const row of chunk) batch.set(doc(db, row.collection, row.id), row.data);
    await batch.commit();
    committed += chunk.length;
    console.log(`Tersimpan ${committed}/${rows.length} dokumen demo.`);
  }
  const verifiedSnapshots = await Promise.all(names.map((name) => getDocsFromServer(collection(db, name))));
  const verifiedIds = new Set(verifiedSnapshots.flatMap((snapshot, i) => snapshot.docs.map((item) => `${names[i]}/${item.id}`)));
  const missing = rows.filter((row) => !verifiedIds.has(`${row.collection}/${row.id}`));
  if (missing.length) throw new Error(`Verifikasi server gagal: ${missing.length} dokumen demo tidak ditemukan.`);
  console.log('Terverifikasi: 10 mata kuliah, 30 mahasiswa, 300 peserta, dan 300 nilai.');
} finally {
  await deleteApp(app);
}
