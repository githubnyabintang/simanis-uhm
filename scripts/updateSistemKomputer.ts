import { config } from 'dotenv';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, doc, getDocsFromServer, getFirestore, writeBatch } from 'firebase/firestore';

config({ path: '.env.local', quiet: true });
if (process.env.VITE_FIREBASE_PROJECT_ID !== 'simanis-uhm' || !process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_APP_ID) throw Error('Konfigurasi Firebase belum lengkap.');
const app = initializeApp({ apiKey: process.env.VITE_FIREBASE_API_KEY, projectId: process.env.VITE_FIREBASE_PROJECT_ID, appId: process.env.VITE_FIREBASE_APP_ID });
const db = getFirestore(app);
try {
  const [programSnapshot, classSnapshot, courseSnapshot] = await Promise.all(['programStudi', 'classes', 'courses'].map((name) => getDocsFromServer(collection(db, name))));
  const programs = new Map(programSnapshot.docs.map((item) => [item.id, item.data()]));
  const classes = new Map(classSnapshot.docs.map((item) => [item.id, item.data()]));
  const courses = new Map(courseSnapshot.docs.map((item) => [item.id, item.data()]));
  const program = programs.get('simdemo-prodi');
  const currentClass = classes.get('simdemo-class');
  const course = courses.get('simdemo-course-01');
  if (!program || !['Magister Rekayasa Perangkat Lunak', 'Magister Pascasarjana Prodi Sistem Komputer'].includes(program.namaProdi)) throw Error('Program studi telah berubah atau tidak ditemukan; tidak ada perubahan dikirim.');
  if (!currentClass || currentClass.prodiId !== 'simdemo-prodi' || !['RPL-A', 'PASCA-1'].includes(currentClass.kodeKelas)) throw Error('Kelas asal telah berubah atau tidak ditemukan; tidak ada perubahan dikirim.');
  if (!course || !['Rekayasa Perangkat Lunak', 'Sistem Komputer'].includes(course.namaMK)) throw Error('Mata kuliah telah berubah atau tidak ditemukan; tidak ada perubahan dikirim.');
  const batch = writeBatch(db);
  batch.update(doc(db, 'programStudi', 'simdemo-prodi'), { namaProdi: 'Magister Pascasarjana Prodi Sistem Komputer' });
  batch.update(doc(db, 'classes', 'simdemo-class'), { kodeKelas: 'PASCA-1', namaKelas: 'Kelas PASCA-1' });
  batch.update(doc(db, 'courses', 'simdemo-course-01'), { namaMK: 'Sistem Komputer' });
  for (let n = 2; n <= 4; n++) {
    const code = `PASCA-${n}`;
    const id = `simdemo-class-pasca-${n}`;
    const existingByCode = [...classes.entries()].find(([, data]) => data.prodiId === 'simdemo-prodi' && data.kodeKelas === code);
    if (existingByCode) continue;
    if (classes.has(id)) throw Error(`ID kelas ${id} sudah digunakan; tidak ada perubahan dikirim.`);
    batch.set(doc(db, 'classes', id), { id, kodeKelas: code, namaKelas: `Kelas ${code}`, prodiId: 'simdemo-prodi' });
  }
  await batch.commit();
  const [verifiedPrograms, verifiedClasses, verifiedCourses] = await Promise.all(['programStudi', 'classes', 'courses'].map((name) => getDocsFromServer(collection(db, name))));
  if (!verifiedPrograms.docs.some((item) => item.id === 'simdemo-prodi' && item.data().namaProdi === 'Magister Pascasarjana Prodi Sistem Komputer') || !verifiedCourses.docs.some((item) => item.id === 'simdemo-course-01' && item.data().namaMK === 'Sistem Komputer') || ![1, 2, 3, 4].every((n) => verifiedClasses.docs.some((item) => item.data().prodiId === 'simdemo-prodi' && item.data().kodeKelas === `PASCA-${n}`))) throw Error('Verifikasi Firestore gagal; periksa data di Console.');
  console.log('Program studi, mata kuliah, dan kelas PASCA-1 sampai PASCA-4 berhasil diperbarui.');
} finally { await deleteApp(app); }
