import type { FirestoreCollections } from '../lib/firestoreRepository';
import type { User } from '../types';
import { calculateGrade, determineGradeStatus } from './gradeCalculation';
import { canEditGrade, isAssignedLecturer } from './gradeWorkflow';

export type TransferKind = 'students' | 'courses' | 'users' | 'offerings' | 'enrollments' | 'grades' | 'my-grades' | 'feedback';
export type DatabaseData = { [K in keyof FirestoreCollections]: FirestoreCollections[K][] };
export type DataRow = Record<string, string>;
export type TableData = { headers: string[]; rows: (string | number | null)[][] };
export type TransferScope = { offeringId?: string; search?: string; prodiId?: string; role?: string };
export type Change = { collection: keyof FirestoreCollections; id: string; value: FirestoreCollections[keyof FirestoreCollections]; previous: FirestoreCollections[keyof FirestoreCollections] | null };
export type PreviewRow = { line: number; label: string; action: 'Baru' | 'Perbarui' | 'Tetap' | 'Gagal'; detail: string; values: DataRow };
export type ImportPlan = { rows: PreviewRow[]; changes: Change[]; now: string };

export const IMPORT_LIMIT = 100;
export const importHeaders: Partial<Record<TransferKind, string[]>> = {
  students: ['npm', 'nama', 'email', 'kode_prodi', 'semester', 'kode_kelas', 'angkatan', 'password'],
  courses: ['kode_mk', 'nama_mk', 'sks', 'semester_paket', 'deskripsi'],
  users: ['username', 'nama', 'email', 'nidn', 'password'],
  offerings: ['kode_mk', 'kode_prodi', 'semester', 'kode_kelas', 'username_dosen', 'periode', 'ruang', 'jadwal', 'status_publikasi'],
  enrollments: ['npm'],
  grades: ['npm', 'nilai_tugas', 'nilai_uts', 'nilai_uas'],
};
export const transferLabels: Record<TransferKind, string> = {
  students: 'Data Mahasiswa', courses: 'Data Mata Kuliah', users: 'Pengguna', offerings: 'Periode & Kelas',
  enrollments: 'Peserta Mata Kuliah', grades: 'Nilai Kelas', 'my-grades': 'Daftar Nilai Saya', feedback: 'Feedback Pengguna',
};
export const transferHelp: Partial<Record<TransferKind, string>> = {
  students: 'NPM menjadi kunci pembaruan. Profil dan akun mahasiswa disimpan bersama. Password wajib untuk akun baru; kosongkan untuk mempertahankan password akun lama.',
  users: 'Impor hanya untuk akun dosen. Username menjadi kunci pembaruan. Password wajib untuk akun baru; password lama tetap jika kolom dikosongkan.',
  courses: 'Kode mata kuliah menjadi kunci pembaruan. SKS dan semester paket harus berupa bilangan bulat positif.',
  offerings: 'Kombinasi mata kuliah, prodi, semester, kelas, dan periode menjadi kunci. Dosen serta referensi harus sudah terdaftar. Penawaran baru mendapat bobot 30/30/40.',
  enrollments: 'NPM harus sudah terdaftar pada Data Mahasiswa. Peserta ditambahkan ke kelas terpilih bersama nilai kosong; peserta yang sudah ada dilewati.',
  grades: 'Nilai 0–100. Sel kosong menghapus komponen menjadi belum diisi, bukan angka 0. Hanya peserta kelas terpilih; nilai terverifikasi harus mendapat izin revisi. Tidak ada verifikasi otomatis.',
};
const norm = (value: string) => value.trim().toLowerCase();
const clean = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().filter(k => (value as Record<string, unknown>)[k] !== undefined).map(k => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
function one<T>(items: T[], label: string): T {
  if (items.length !== 1) throw new Error(`${label}: ${items.length ? 'data ganda, perbaiki dahulu' : 'belum terdaftar'}.`);
  return items[0];
}
function required(row: DataRow, field: string) {
  const value = row[field]?.trim() || '';
  if (!value) throw new Error(`Kolom ${field} wajib diisi.`);
  if (value.length > 500) throw new Error(`Kolom ${field} terlalu panjang (maksimal 500 karakter).`);
  return value;
}
function integer(row: DataRow, field: string, max: number) {
  const value = required(row, field);
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max) throw new Error(`${field} harus bilangan bulat 1–${max}.`);
  return Number(value);
}
function identifier(row: DataRow, field: string) {
  const value = required(row, field);
  if (!/^[\p{L}\p{N}_.@-]+$/u.test(value) || value.length > 100) throw new Error(`${field} hanya boleh huruf, angka, titik, @, garis bawah, atau tanda hubung (maksimal 100 karakter).`);
  return value;
}
function numericId(row: DataRow, field: string) {
  const value = required(row, field);
  if (!/^\d{1,30}$/.test(value)) throw new Error(`${field} harus berupa deretan angka; gunakan format Text di Excel.`);
  return value;
}
function email(row: DataRow) {
  const value = required(row, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Format email tidak valid.');
  return value;
}
function password(row: DataRow, existing?: User) {
  const value = row.password || '';
  if (!value && existing) return existing.demoPassword;
  if (value.length < 8 || value.length > 128) throw new Error('Password akun baru minimal 8 dan maksimal 128 karakter.');
  return value;
}
function uniqueAccount(db: DatabaseData, user: User) {
  const ids = [user.username, user.email, user.npm, user.nidn].filter((v): v is string => Boolean(v)).map(norm);
  if (db.users.some(u => u.id !== user.id && [u.username, u.email, u.npm, u.nidn].some(v => v && ids.includes(norm(v))))) {
    throw new Error('Username, email, NPM, atau NIDN sudah digunakan akun lain.');
  }
}
function makeId(collection: string, key: string) {
  const id = `imp-${collection}-${encodeURIComponent(key)}`;
  if (id.length > 1400) throw new Error('Kombinasi identitas terlalu panjang.');
  return id;
}
export function assertTransferAccess(kind: TransferKind, db: DatabaseData, actorId: string, scope: TransferScope, importing = false): User {
  const actor = one(db.users.filter(u => u.id === actorId && u.isActive), 'Akun aktif');
  if (kind === 'grades') {
    const offering = one(db.offerings.filter(o => o.id === scope.offeringId), 'Kelas terpilih');
    if (!isAssignedLecturer(actor.role, actor.id, offering.dosenId)) throw new Error('Hanya dosen pengampu yang dapat mengakses nilai kelas ini.');
  } else if (kind === 'my-grades') {
    if (actor.role !== 'mahasiswa' || importing) throw new Error('Hanya mahasiswa yang dapat mengekspor nilai pribadi.');
  } else if (actor.role !== 'admin') throw new Error('Fitur ini hanya tersedia untuk administrator.');
  if (importing && !importHeaders[kind]) throw new Error('Impor tidak tersedia pada halaman ini.');
  if (kind === 'enrollments') one(db.offerings.filter(o => o.id === scope.offeringId), 'Kelas terpilih');
  return actor;
}

export function buildImportPlan(kind: TransferKind, input: DataRow[], source: DatabaseData, actorId: string, scope: TransferScope = {}, now = new Date().toISOString()): ImportPlan {
  const db = clean(source);
  const actor = assertTransferAccess(kind, db, actorId, scope, true);
  if (!input.length || input.length > IMPORT_LIMIT) throw new Error(`Isi file harus 1–${IMPORT_LIMIT} baris data per impor.`);
  const plan: ImportPlan = { rows: [], changes: [], now };
  const seen = new Set<string>();
  input.forEach((row, index) => {
    let label = row.npm || row.kode_mk || row.username || `Baris ${index + 2}`;
    const pending: Change[] = [];
    let action: PreviewRow['action'] = 'Baru';
    let detail = 'Data baru akan ditambahkan.';
    const put = <K extends keyof FirestoreCollections>(collection: K, value: FirestoreCollections[K], createOnly = false) => {
      const previous = db[collection].find(item => item.id === value.id) || null;
      if (createOnly && previous) throw new Error('Identitas dokumen sudah digunakan. Periksa relasi data sebelum mengimpor kembali.');
      pending.push({ collection, id: value.id, value: clean(value), previous: clean(previous) });
    };
    const checkKey = (key: string) => {
      if (seen.has(norm(key))) throw new Error('Identitas muncul lebih dari sekali dalam file.');
      seen.add(norm(key));
    };
    const reference = () => {
      const prodi = one(db.programStudi.filter(p => norm(p.kodeProdi) === norm(required(row, 'kode_prodi'))), 'Kode prodi');
      const semester = one(db.semesters.filter(s => s.nomorSemester === integer(row, 'semester', 20)), 'Semester');
      const kelas = one(db.classes.filter(k => norm(k.kodeKelas) === norm(required(row, 'kode_kelas')) && k.prodiId === prodi.id), 'Kelas pada prodi');
      return { prodi, semester, kelas };
    };
    try {
      if (kind === 'students') {
        const npm = numericId(row, 'npm'); checkKey(npm);
        const matches = db.students.filter(s => s.npm === npm);
        const old = matches.length ? one(matches, 'NPM') : undefined;
        const { prodi, semester, kelas } = reference();
        const linked = old ? one(db.users.filter(u => u.id === old.userId && u.role === 'mahasiswa' && u.npm === npm), 'Akun mahasiswa terkait') : undefined;
        const user: User = { ...linked, id: linked?.id || makeId('user-student', npm), name: required(row, 'nama'), username: linked?.username || npm, email: email(row), role: 'mahasiswa', isActive: linked?.isActive ?? true, npm, prodiId: prodi.id, createdAt: linked?.createdAt || now, demoPassword: password(row, linked) };
        uniqueAccount(db, user);
        const angkatan = required(row, 'angkatan');
        if (!/^\d{4}$/.test(angkatan)) throw new Error('Angkatan harus tahun empat digit.');
        put('users', user, !linked);
        put('students', { ...old, id: old?.id || makeId('student', npm), npm, nama: user.name, email: user.email, userId: user.id, prodiId: prodi.id, semesterId: semester.id, kelasAsalId: kelas.id, angkatan }, !old);
        action = old ? 'Perbarui' : 'Baru';
      } else if (kind === 'courses') {
        const kodeMK = identifier(row, 'kode_mk'); checkKey(kodeMK);
        const matches = db.courses.filter(c => norm(c.kodeMK) === norm(kodeMK));
        const old = matches.length ? one(matches, 'Kode mata kuliah') : undefined;
        put('courses', { ...old, id: old?.id || makeId('course', norm(kodeMK)), kodeMK, namaMK: required(row, 'nama_mk'), sks: integer(row, 'sks', 30), semesterPaket: integer(row, 'semester_paket', 20), deskripsi: row.deskripsi || '' }, !old);
        action = old ? 'Perbarui' : 'Baru';
      } else if (kind === 'users') {
        const username = identifier(row, 'username'); checkKey(username);
        if (row.role && row.role !== 'dosen') throw new Error('Impor pengguna hanya menerima akun dosen.');
        const matches = db.users.filter(u => norm(u.username) === norm(username));
        const old = matches.length ? one(matches, 'Username') : undefined;
        if (old && old.role !== 'dosen') throw new Error('Username ini milik akun dengan peran lain.');
        const user: User = { ...old, id: old?.id || makeId('user-lecturer', norm(username)), username, name: required(row, 'nama'), email: email(row), nidn: numericId(row, 'nidn'), role: 'dosen', isActive: old?.isActive ?? true, createdAt: old?.createdAt || now, demoPassword: password(row, old) };
        uniqueAccount(db, user); put('users', user, !old); action = old ? 'Perbarui' : 'Baru';
      } else if (kind === 'offerings') {
        const { prodi, semester, kelas } = reference();
        const course = one(db.courses.filter(c => norm(c.kodeMK) === norm(required(row, 'kode_mk'))), 'Mata kuliah');
        const dosen = one(db.users.filter(u => norm(u.username) === norm(required(row, 'username_dosen')) && u.role === 'dosen' && u.isActive), 'Dosen aktif');
        const periode = required(row, 'periode');
        const key = [course.id, prodi.id, semester.id, kelas.id, periode].join('|'); checkKey(key);
        label = `${course.kodeMK} / ${kelas.kodeKelas} / ${periode}`;
        const matches = db.offerings.filter(o => o.mataKuliahId === course.id && o.prodiId === prodi.id && o.semesterId === semester.id && o.kelasId === kelas.id && o.periodeAkademik === periode);
        const old = matches.length ? one(matches, 'Penawaran') : undefined;
        const status = row.status_publikasi || 'draft';
        if (status !== 'draft' && status !== 'published') throw new Error('status_publikasi harus draft atau published.');
        const id = old?.id || makeId('offering', key);
        put('offerings', { ...old, id, mataKuliahId: course.id, prodiId: prodi.id, semesterId: semester.id, kelasId: kelas.id, dosenId: dosen.id, periodeAkademik: periode, ruang: row.ruang || '', jadwal: row.jadwal || '', statusPublikasi: status }, !old);
        if (!old) put('weights', { id: makeId('weight', id), penawaranId: id, bobotTugas: 30, bobotUTS: 30, bobotUAS: 40, updatedAt: now }, true);
        action = old ? 'Perbarui' : 'Baru';
      } else if (kind === 'enrollments' || kind === 'grades') {
        const npm = numericId(row, 'npm'); checkKey(npm);
        one(db.students.filter(s => s.npm === npm), 'Mahasiswa');
        const offering = one(db.offerings.filter(o => o.id === scope.offeringId), 'Kelas terpilih');
        if (row.id_penawaran && row.id_penawaran !== offering.id) throw new Error('Baris berasal dari kelas berbeda.');
        const matches = db.enrollments.filter(e => e.npm === npm && e.penawaranId === offering.id);
        const participant = matches.length ? one(matches, 'Peserta kelas') : undefined;
        if (kind === 'enrollments' && participant) { action = 'Tetap'; detail = 'Sudah menjadi peserta; nilai tetap.'; }
        else {
          if (kind === 'grades' && !participant) throw new Error('Mahasiswa belum terdaftar pada kelas terpilih.');
          const pesertaId = participant?.id || makeId('enrollment', `${offering.id}|${npm}`);
          const gradeMatches = db.grades.filter(g => g.penawaranId === offering.id && g.npm === npm);
          const old = gradeMatches.length ? one(gradeMatches, 'Nilai peserta') : undefined;
          if (kind === 'enrollments' && !participant && old) throw new Error('Sudah ada nilai tanpa relasi peserta. Perbaiki relasinya; impor tidak akan mengosongkan nilai lama.');
          if (old && old.pesertaId !== pesertaId) throw new Error('Relasi nilai tidak sesuai peserta. Perbaiki data terlebih dahulu.');
          if (kind === 'grades' && !canEditGrade(actor.role, actor.id, offering.dosenId, old)) throw new Error('Nilai terverifikasi terkunci; ajukan dan tunggu izin revisi.');
          const score = (field: string) => {
            const value = row[field]?.trim() || '';
            if (!value) return null;
            if (!/^\d+(?:[.,]\d+)?$/.test(value)) throw new Error(`${field} harus angka 0–100 atau kosong.`);
            const number = Number(value.replace(',', '.'));
            if (!Number.isFinite(number) || number > 100) throw new Error(`${field} harus 0–100.`);
            return number;
          };
          const tugas = kind === 'grades' ? score('nilai_tugas') : null;
          const uts = kind === 'grades' ? score('nilai_uts') : null;
          const uas = kind === 'grades' ? score('nilai_uas') : null;
          if (!participant) put('enrollments', { id: pesertaId, penawaranId: offering.id, npm, createdAt: now }, true);
          const before = old && { tugas: old.nilaiTugas, uts: old.nilaiUTS, uas: old.nilaiUAS };
          if (kind === 'grades' && old && tugas === old.nilaiTugas && uts === old.nilaiUTS && uas === old.nilaiUAS) {
            action = 'Tetap'; detail = 'Komponen nilai sama; tidak diubah.';
          } else {
            const grade = { ...old, id: old?.id || makeId('grade', pesertaId), pesertaId, penawaranId: offering.id, npm, nilaiTugas: tugas, nilaiUTS: uts, nilaiUAS: uas, statusVerifikasi: determineGradeStatus(tugas, uts, uas, false), updatedAt: now,
              ...(old?.statusPermintaanRevisi === 'Diizinkan Revisi' ? { nilaiSebelumRevisi: old.nilaiSebelumRevisi || before } : {}), verifiedBy: undefined, verifiedAt: undefined };
            put('grades', grade, !old);
            if (kind === 'grades') put('verificationHistory', { id: makeId('history', `${grade.id}|${now}`), nilaiId: grade.id, penawaranId: offering.id, npm, aksi: 'Koreksi Nilai', userId: actor.id, userName: actor.name, waktu: now, keterangan: 'Komponen nilai disimpan melalui impor file; menunggu verifikasi dosen.', nilaiSebelum: before, nilaiSesudah: { tugas, uts, uas } }, true);
            action = kind === 'grades' && old ? 'Perbarui' : 'Baru';
          }
        }
      }
      const changed = pending.filter(c => stableStringify(db[c.collection].find(x => x.id === c.id)) !== stableStringify(c.value));
      if (!changed.length) { action = 'Tetap'; detail = 'Data sudah sama; tidak ada perubahan.'; }
      else if (action === 'Perbarui') detail = 'Data lama akan diperbarui sesuai isi file.';
      for (const change of changed) {
        const list = db[change.collection] as { id: string }[];
        const position = list.findIndex(x => x.id === change.id);
        if (position < 0) list.push(change.value); else list[position] = change.value;
      }
      plan.changes.push(...changed);
      plan.rows.push({ line: index + 2, label, action, detail, values: Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'password')) });
    } catch (error) {
      plan.rows.push({ line: index + 2, label, action: 'Gagal', detail: error instanceof Error ? error.message : 'Data tidak valid.', values: Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'password')) });
    }
  });
  return plan;
}

export function exportTable(kind: TransferKind, db: DatabaseData, actorId: string, scope: TransferScope = {}): TableData {
  const actor = assertTransferAccess(kind, db, actorId, scope);
  const search = scope.search?.toLowerCase() || '';
  const prodi = (id: string) => db.programStudi.find(p => p.id === id)?.kodeProdi || '';
  const semester = (id: string) => db.semesters.find(s => s.id === id)?.nomorSemester ?? '';
  const kelas = (id?: string) => db.classes.find(k => k.id === id)?.kodeKelas || '';
  if (kind === 'students') return { headers: importHeaders.students!.filter(h => h !== 'password'), rows: db.students.filter(s => (s.nama.toLowerCase().includes(search) || s.npm.includes(search)) && (!scope.prodiId || scope.prodiId === 'all' || s.prodiId === scope.prodiId)).map(s => [s.npm, s.nama, s.email, prodi(s.prodiId), semester(s.semesterId), kelas(s.kelasAsalId), s.angkatan]) };
  if (kind === 'courses') return { headers: importHeaders.courses!, rows: db.courses.filter(c => c.kodeMK.toLowerCase().includes(search) || c.namaMK.toLowerCase().includes(search)).map(c => [c.kodeMK, c.namaMK, c.sks, c.semesterPaket, c.deskripsi || '']) };
  if (kind === 'users') return { headers: ['username', 'nama', 'email', 'nidn', 'npm', 'role', 'status_aktif'], rows: db.users.filter(u => [u.name, u.email, u.username].some(s => s.toLowerCase().includes(search)) && (!scope.role || scope.role === 'all' || u.role === scope.role)).map(u => [u.username, u.name, u.email, u.nidn || '', u.npm || '', u.role, u.isActive ? 'aktif' : 'nonaktif']) };
  if (kind === 'offerings') return { headers: importHeaders.offerings!, rows: db.offerings.map(o => [db.courses.find(c => c.id === o.mataKuliahId)?.kodeMK || '', prodi(o.prodiId), semester(o.semesterId), kelas(o.kelasId), db.users.find(u => u.id === o.dosenId)?.username || '', o.periodeAkademik, o.ruang || '', o.jadwal || '', o.statusPublikasi]) };
  if (kind === 'feedback') return { headers: ['nama', 'email', 'peran', 'rating_tampilan', 'rating_navigasi', 'rating_kenyamanan', 'saran', 'waktu'], rows: [...db.feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(f => [f.nama, f.email, f.role, f.ratingTampilan, f.ratingNavigasi, f.ratingKenyamanan, f.saran, f.createdAt]) };
  const student = kind === 'my-grades' ? one(db.students.filter(s => s.userId === actor.id && s.npm === actor.npm), 'Profil mahasiswa') : undefined;
  const participants = db.enrollments.filter(e => student ? e.npm === student.npm : e.penawaranId === scope.offeringId);
  const baseHeaders = ['npm', 'nama', 'kode_mk', 'nama_mk', 'kode_kelas', 'periode', 'nama_dosen', 'id_penawaran'];
  const withGrades = kind !== 'enrollments';
  return { headers: [...baseHeaders, ...(withGrades ? ['nilai_tugas', 'nilai_uts', 'nilai_uas', 'bobot_tugas', 'bobot_uts', 'bobot_uas', 'nilai_akhir', 'nilai_huruf', 'status_verifikasi'] : [])], rows: participants.map(e => {
    const o = one(db.offerings.filter(o => o.id === e.penawaranId), 'Penawaran peserta');
    const c = one(db.courses.filter(c => c.id === o.mataKuliahId), 'Mata kuliah');
    const s = one(db.students.filter(s => s.npm === e.npm), 'Mahasiswa');
    const base: (string | number | null)[] = [e.npm, s.nama, c.kodeMK, c.namaMK, kelas(o.kelasId), o.periodeAkademik, db.users.find(u => u.id === o.dosenId)?.name || '', o.id];
    if (!withGrades) return base;
    const g = db.grades.find(g => g.pesertaId === e.id);
    const w = db.weights.find(w => w.penawaranId === o.id);
    const calculated = w ? calculateGrade(g?.nilaiTugas, g?.nilaiUTS, g?.nilaiUAS, { tugas: w.bobotTugas, uts: w.bobotUTS, uas: w.bobotUAS }, g?.statusVerifikasi === 'Terverifikasi') : null;
    return [...base, g?.nilaiTugas ?? null, g?.nilaiUTS ?? null, g?.nilaiUAS ?? null, w?.bobotTugas ?? null, w?.bobotUTS ?? null, w?.bobotUAS ?? null, calculated?.nilaiAkhir ?? null, calculated?.nilaiHuruf ?? null, g?.statusVerifikasi || 'Belum Diisi'];
  }) };
}
