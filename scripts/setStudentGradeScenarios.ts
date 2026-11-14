import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, deleteField, doc, getDocsFromServer, getFirestore, writeBatch } from 'firebase/firestore';

config({ path: ['.env.local', '.env'], quiet: true });
if (process.env.VITE_FIREBASE_PROJECT_ID !== 'simanis-uhm' || !process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_APP_ID) throw Error('Konfigurasi Firebase belum lengkap.');
const app = initializeApp({ apiKey: process.env.VITE_FIREBASE_API_KEY, projectId: process.env.VITE_FIREBASE_PROJECT_ID, appId: process.env.VITE_FIREBASE_APP_ID });
const db = getFirestore(app);
const pad = (n: number) => String(n).padStart(2, '0');
try {
  const [gradeSnapshot, enrollmentSnapshot, offeringSnapshot, userSnapshot] = await Promise.all(['grades', 'enrollments', 'offerings', 'users'].map((name) => getDocsFromServer(collection(db, name))));
  const grades = new Map(gradeSnapshot.docs.map((item) => [item.id, item.data()]));
  const enrollments = new Map(enrollmentSnapshot.docs.map((item) => [item.id, item.data()]));
  const offerings = new Map(offeringSnapshot.docs.map((item) => [item.id, item.data()]));
  const users = new Map(userSnapshot.docs.map((item) => [item.id, item.data()]));
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  for (let student = 1; student <= 9; student++) {
    const npm = `99000000${pad(student)}`;
    for (let course = 1; course <= 10; course++) {
      const gradeId = `simdemo-grade-${pad(course)}-${pad(student)}`;
      const enrollmentId = `simdemo-enrollment-${pad(course)}-${pad(student)}`;
      const offeringId = `simdemo-offering-${pad(course)}`;
      const grade = grades.get(gradeId), enrollment = enrollments.get(enrollmentId), offering = offerings.get(offeringId);
      if (!grade || !enrollment || !offering || grade.npm !== npm || grade.pesertaId !== enrollmentId || grade.penawaranId !== offeringId || enrollment.npm !== npm || enrollment.penawaranId !== offeringId) throw Error(`Relasi data ${gradeId} tidak cocok; tidak ada perubahan dikirim.`);
      if (grade.statusPermintaanRevisi) throw Error(`${gradeId} memiliki proses revisi; perubahan dihentikan.`);
      const lecturer = users.get(offering.dosenId);
      if (!lecturer || lecturer.role !== 'dosen') throw Error(`Dosen untuk ${offeringId} tidak ditemukan.`);
      const complete = student <= 3 || (student <= 6 && course <= 5);
      const wasVerified = grade.statusVerifikasi === 'Terverifikasi';
      const score = (value: unknown, offset: number) => typeof value === 'number' && value >= 0 && value <= 100 ? value : 70 + ((student * 11 + course * 7 + offset) % 26);
      batch.update(doc(db, 'grades', gradeId), complete ? {
        nilaiTugas: score(grade.nilaiTugas, 1), nilaiUTS: score(grade.nilaiUTS, 5), nilaiUAS: score(grade.nilaiUAS, 9),
        statusVerifikasi: 'Terverifikasi', verifiedBy: offering.dosenId, verifiedAt: grade.verifiedAt || now, updatedAt: now,
      } : {
        nilaiTugas: null, nilaiUTS: null, nilaiUAS: null, statusVerifikasi: 'Belum Diisi',
        verifiedBy: deleteField(), verifiedAt: deleteField(), updatedAt: now,
      });
      if (complete !== wasVerified) {
        const historyId = `scenario-${randomUUID()}`;
        batch.set(doc(db, 'verificationHistory', historyId), { id: historyId, nilaiId: gradeId, penawaranId: offeringId, npm, aksi: complete ? 'Verifikasi' : 'Batal Verifikasi', userId: offering.dosenId, userName: lecturer.name, waktu: now, keterangan: 'Penyesuaian kondisi nilai untuk data contoh.' });
      }
    }
  }
  await batch.commit();
  const checked = await getDocsFromServer(collection(db, 'grades'));
  for (let student = 1; student <= 9; student++) {
    const npm = `99000000${pad(student)}`;
    const items = checked.docs.filter((item) => item.data().npm === npm && item.id.startsWith('simdemo-grade-')).map((item) => item.data());
    const complete = items.filter((item) => [item.nilaiTugas, item.nilaiUTS, item.nilaiUAS].every((value) => typeof value === 'number')).length;
    const expected = student <= 3 ? 10 : student <= 6 ? 5 : 0;
    if (items.length !== 10 || complete !== expected) throw Error(`Verifikasi mahasiswa ${npm} gagal.`);
    console.log(`${npm}: ${complete}/10 nilai lengkap`);
  }
} finally { await deleteApp(app); }
