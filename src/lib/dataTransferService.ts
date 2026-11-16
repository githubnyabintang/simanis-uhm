import { collection, doc, getDocsFromServer, runTransaction } from 'firebase/firestore';
import { firestore } from './firebase';
import type { FirestoreCollections } from './firestoreRepository';
import { assertTransferAccess, buildImportPlan, exportTable, importHeaders, stableStringify, type DatabaseData, type DataRow, type ImportPlan, type TableData, type TransferKind, type TransferScope } from '../utils/dataTransfer';
import { canEditGrade } from '../utils/gradeWorkflow';

const collectionNames: (keyof FirestoreCollections)[] = ['users', 'programStudi', 'semesters', 'classes', 'courses', 'offerings', 'students', 'enrollments', 'weights', 'grades'];
export async function readTransferData(kind: TransferKind): Promise<DatabaseData> {
  if (!firestore) throw new Error('Konfigurasi Firebase belum tersedia.');
  const names = kind === 'feedback' ? ['users', 'feedback'] as const : collectionNames;
  const db = Object.fromEntries([...collectionNames, 'verificationHistory', 'feedback'].map(n => [n, []])) as unknown as DatabaseData;
  await Promise.all(names.map(async name => {
    const snapshot = await getDocsFromServer(collection(firestore!, name));
    (db[name] as unknown[]) = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
  }));
  return db;
}

export async function prepareImport(kind: TransferKind, rows: DataRow[], actorId: string, scope: TransferScope) {
  const source = await readTransferData(kind);
  return buildImportPlan(kind, rows, source, actorId, scope);
}

/** Fresh validation plus optimistic concurrency checks inside one atomic transaction.
 * No optimistic React setters: onSnapshot supplies committed values to the UI.
 */
export async function commitImport(kind: TransferKind, rows: DataRow[], reviewed: ImportPlan, actorId: string, scope: TransferScope) {
  if (!firestore) throw new Error('Konfigurasi Firebase belum tersedia.');
  if (reviewed.rows.some(r => r.action === 'Gagal') || !reviewed.changes.length) throw new Error('Perbaiki seluruh baris bermasalah sebelum menyimpan.');
  const source = await readTransferData(kind);
  const latest = buildImportPlan(kind, rows, source, actorId, scope, reviewed.now);
  if (stableStringify(latest) !== stableStringify(reviewed)) throw new Error('Data Firestore berubah sejak pratinjau. Tutup pratinjau dan pilih ulang file untuk meninjau data terbaru.');
  if (latest.changes.length > 450) throw new Error('Terlalu banyak perubahan dalam satu impor. Bagi file menjadi beberapa bagian.');
  // Guard referenced records without re-reading unrelated classes in the transaction.
  const guards = new Map<string, unknown>();
  const npms = new Set(rows.map(r => r.npm));
  for (const name of collectionNames) for (const item of source[name]) {
    const data = item as unknown as Record<string, unknown>;
    const needed = ['programStudi', 'semesters', 'classes'].includes(name)
      || (name === 'users' && (['students', 'users', 'offerings'].includes(kind) || item.id === actorId))
      || (name === 'courses' && ['courses', 'offerings'].includes(kind))
      || (name === 'offerings' && (kind === 'offerings' || item.id === scope.offeringId))
      || (name === 'students' && npms.has(data.npm as string))
      || (['enrollments', 'grades'].includes(name) && data.penawaranId === scope.offeringId && npms.has(data.npm as string));
    if (needed) guards.set(`${name}/${item.id}`, item);
  }
  for (const change of latest.changes) {
    const previous = source[change.collection].find(item => item.id === change.id);
    guards.set(`${change.collection}/${change.id}`, previous || null);
  }
  await runTransaction(firestore, async transaction => {
    await Promise.all([...guards].map(async ([path, expected]) => {
      const actual = await transaction.get(doc(firestore!, path));
      const data = actual.exists() ? { ...actual.data(), id: actual.id } : null;
      if (stableStringify(data) !== stableStringify(expected)) throw new Error('Data berubah saat penyimpanan. Belum ada data impor disimpan; pilih ulang file untuk memeriksa kembali.');
    }));
    for (const change of latest.changes) transaction.set(doc(firestore!, change.collection, change.id), change.value);
  });
  return latest.rows.filter(r => r.action === 'Baru' || r.action === 'Perbarui').length;
}

export async function fetchExport(kind: TransferKind, actorId: string, scope: TransferScope) {
  return exportTable(kind, await readTransferData(kind), actorId, scope);
}

export async function fetchTemplate(kind: TransferKind, actorId: string, scope: TransferScope): Promise<{ table: TableData; references: TableData }> {
  const db = await readTransferData(kind);
  const actor = assertTransferAccess(kind, db, actorId, scope, true);
  const headers = kind === 'grades' ? ['npm', 'nama', 'nilai_tugas', 'nilai_uts', 'nilai_uas', 'id_penawaran'] : importHeaders[kind]!;
  const rows: TableData['rows'] = [];
  if (kind === 'grades') {
    const offering = db.offerings.find(o => o.id === scope.offeringId)!;
    for (const e of db.enrollments.filter(e => e.penawaranId === offering.id)) {
      const g = db.grades.find(g => g.pesertaId === e.id);
      if (canEditGrade(actor.role, actor.id, offering.dosenId, g)) rows.push([e.npm, db.students.find(s => s.npm === e.npm)?.nama || '', g?.nilaiTugas ?? null, g?.nilaiUTS ?? null, g?.nilaiUAS ?? null, offering.id]);
    }
  }
  const references: TableData = { headers: ['jenis', 'kode', 'keterangan'], rows: [
    ...db.programStudi.map(p => ['kode_prodi', p.kodeProdi, p.namaProdi]),
    ...db.semesters.map(s => ['semester', s.nomorSemester, s.namaSemester]),
    ...db.classes.map(k => ['kode_kelas', k.kodeKelas, db.programStudi.find(p => p.id === k.prodiId)?.kodeProdi || '']),
    ...db.courses.map(c => ['kode_mk', c.kodeMK, c.namaMK]),
    ...db.users.filter(u => u.role === 'dosen' && u.isActive).map(u => ['username_dosen', u.username, u.name]),
    ['petunjuk', 'password', 'Wajib untuk akun baru (minimal 8 karakter). Kosong = pertahankan password akun lama.'],
    ['petunjuk', 'npm / nidn', 'Gunakan format Text agar angka nol di depan tetap tersimpan.'],
    ['petunjuk', 'nilai', 'Isi angka 0–100. Sel kosong berarti komponen belum diisi. Tidak ada verifikasi otomatis.'],
  ] };
  return { table: { headers, rows }, references };
}
