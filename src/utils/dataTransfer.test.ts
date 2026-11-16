import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImportPlan, exportTable, stableStringify } from './dataTransfer';
import { transferFixture } from './dataTransfer.fixture';

const studentRow = { npm: '002', nama: 'Budi', email: 'budi@example.test', kode_prodi: 'SK', semester: '1', kode_kelas: 'PASCA-1', angkatan: '2026', password: 'TestOnly123' };
const gradeRow = { npm: '001', nilai_tugas: '0', nilai_uts: '', nilai_uas: '90' };
const scope = { offeringId: 'o' };

test('student import links account and profile, preserves NPM zeros and hides password in preview', () => {
  const db = transferFixture();
  const plan = buildImportPlan('students', [studentRow], db, 'admin');
  assert.equal(plan.rows[0].action, 'Baru');
  assert.equal(plan.changes.length, 2);
  const user = plan.changes.find(c => c.collection === 'users')!.value;
  const student = plan.changes.find(c => c.collection === 'students')!.value;
  assert.equal((student as { userId: string }).userId, user.id);
  assert.equal((student as { npm: string }).npm, '002');
  assert.ok(!('password' in plan.rows[0].values));
  assert.equal(db.students.length, 1, 'planning must not mutate source');
});
test('student update retains account ID, username and password when password is blank', () => {
  const db = transferFixture();
  const plan = buildImportPlan('students', [{ ...studentRow, npm: '001', email: 'ayu@example.test', password: '' }], db, 'admin');
  assert.equal(plan.rows[0].action, 'Perbarui');
  const user = plan.changes.find(c => c.collection === 'users')!.value as typeof db.users[0];
  assert.equal(user.id, 'student-user'); assert.equal(user.username, '001'); assert.equal(user.demoPassword, 'TestOnly123');
});
test('invalid references, existing identity collisions and repeated rows are rejected', () => {
  const db = transferFixture();
  for (const row of [{ ...studentRow, kode_prodi: 'UNKNOWN' }, { ...studentRow, email: 'dosen@example.test' }, { ...studentRow, password: '' }]) {
    const plan = buildImportPlan('students', [row], db, 'admin');
    assert.equal(plan.rows[0].action, 'Gagal'); assert.equal(plan.changes.length, 0);
  }
  const plan = buildImportPlan('students', [studentRow, { ...studentRow }], db, 'admin');
  assert.equal(plan.rows[1].action, 'Gagal');
  const emails = buildImportPlan('students', [studentRow, { ...studentRow, npm: '003' }], db, 'admin');
  assert.equal(emails.rows[1].action, 'Gagal');
});
test('enrollment import creates linked blank grade and never overwrites existing participant grades', () => {
  const db = transferFixture(); db.enrollments = []; db.grades = [];
  const plan = buildImportPlan('enrollments', [{ npm: '001' }], db, 'admin', scope);
  assert.equal(plan.changes.length, 2);
  const enrollment = plan.changes.find(c => c.collection === 'enrollments')!.value;
  const grade = plan.changes.find(c => c.collection === 'grades')!.value as typeof db.grades[0];
  assert.equal(grade.pesertaId, enrollment.id); assert.equal(grade.nilaiTugas, null);
  assert.equal(buildImportPlan('enrollments', [{ npm: '001' }], transferFixture(), 'admin', scope).changes.length, 0);
});
test('imports reject orphaned grades and generated document ID collisions', () => {
  const db = transferFixture(); db.enrollments = [];
  assert.equal(buildImportPlan('enrollments', [{ npm: '001' }], db, 'admin', scope).rows[0].action, 'Gagal');
  db.users.push({ ...db.users[0], id: 'imp-user-student-002', username: 'other-admin', email: 'other-admin@example.test' });
  const plan = buildImportPlan('students', [studentRow], db, 'admin');
  assert.equal(plan.rows[0].action, 'Gagal'); assert.equal(plan.changes.length, 0);
});
test('grade import distinguishes zero from empty and does not verify', () => {
  const plan = buildImportPlan('grades', [gradeRow], transferFixture(), 'lecturer', scope);
  const g = plan.changes.find(c => c.collection === 'grades')!.value as ReturnType<typeof transferFixture>['grades'][0];
  assert.equal(g.nilaiTugas, 0); assert.equal(g.nilaiUTS, null); assert.equal(g.statusVerifikasi, 'Belum Lengkap');
  assert.equal(plan.changes.filter(c => c.collection === 'verificationHistory').length, 1);
});
test('locked grades reject import, approved revision retains before values and clears old verification', () => {
  const db = transferFixture();
  Object.assign(db.grades[0], { nilaiUTS: 80, nilaiUAS: 80, statusVerifikasi: 'Terverifikasi', verifiedBy: 'lecturer', verifiedAt: 'old' });
  assert.equal(buildImportPlan('grades', [gradeRow], db, 'lecturer', scope).rows[0].action, 'Gagal');
  db.grades[0].statusPermintaanRevisi = 'Diizinkan Revisi';
  const plan = buildImportPlan('grades', [{ ...gradeRow, nilai_uts: '80' }], db, 'lecturer', scope);
  const g = plan.changes.find(c => c.collection === 'grades')!.value as typeof db.grades[0];
  assert.equal(g.statusVerifikasi, 'Menunggu Verifikasi');
  assert.deepEqual(g.nilaiSebelumRevisi, { tugas: 80, uts: 80, uas: 80 });
  assert.equal(g.verifiedBy, undefined);
});
test('grade import blocks wrong role, lecturer, class, participant and invalid numbers', () => {
  const db = transferFixture();
  assert.throws(() => buildImportPlan('grades', [gradeRow], db, 'admin', scope));
  for (const row of [{ ...gradeRow, npm: '099' }, { ...gradeRow, id_penawaran: 'other' }, { ...gradeRow, nilai_tugas: '101' }, { ...gradeRow, nilai_tugas: '-1' }, { ...gradeRow, nilai_tugas: 'Infinity' }]) assert.equal(buildImportPlan('grades', [row], db, 'lecturer', scope).rows[0].action, 'Gagal');
  db.offerings[0].dosenId = 'other';
  assert.throws(() => buildImportPlan('grades', [gradeRow], db, 'lecturer', scope));
});
test('course and offering imports preserve IDs, create default weights only for new offerings', () => {
  const db = transferFixture();
  const course = buildImportPlan('courses', [{ kode_mk: 'SK01', nama_mk: 'Sistem Digital', sks: '3', semester_paket: '1' }], db, 'admin');
  assert.equal(course.changes[0].id, 'c');
  assert.equal(buildImportPlan('courses', [{ kode_mk: 'NEW', nama_mk: 'A', sks: '3.5', semester_paket: '1' }], db, 'admin').rows[0].action, 'Gagal');
  const row = { kode_mk: 'SK01', kode_prodi: 'SK', semester: '1', kode_kelas: 'PASCA-1', username_dosen: 'dosen01', periode: '2027/2028 - Ganjil' };
  const plan = buildImportPlan('offerings', [row], db, 'admin');
  assert.equal(plan.changes.length, 2);
  const existing = buildImportPlan('offerings', [{ ...row, periode: db.offerings[0].periodeAkademik }], db, 'admin');
  assert.equal(existing.changes.filter(c => c.collection === 'weights').length, 0);
});
test('user imports are lecturer-only and cannot change another role', () => {
  const db = transferFixture();
  const row = { username: 'dosen02', nama: 'Dosen Dua', email: 'dosen2@example.test', nidn: '882', password: 'TestOnly123' };
  assert.equal(buildImportPlan('users', [row], db, 'admin').rows[0].action, 'Baru');
  assert.equal(buildImportPlan('users', [{ ...row, username: '001' }], db, 'admin').rows[0].action, 'Gagal');
  assert.equal(buildImportPlan('users', [{ ...row, role: 'admin' }], db, 'admin').rows[0].action, 'Gagal');
});
test('reviewed plans detect intervening edits even when the proposed final value is identical', () => {
  const db = transferFixture();
  const rows = [{ kode_mk: 'SK01', nama_mk: 'Nama Baru', sks: '3', semester_paket: '1' }];
  const reviewed = buildImportPlan('courses', rows, db, 'admin');
  db.courses[0].namaMK = 'Diubah pengguna lain';
  const latest = buildImportPlan('courses', rows, db, 'admin', {}, reviewed.now);
  assert.equal(stableStringify(reviewed.changes[0].value), stableStringify(latest.changes[0].value));
  assert.notEqual(stableStringify(reviewed), stableStringify(latest));
});
test('export uses filters, excludes passwords and limits student output to own enrollments', () => {
  const db = transferFixture();
  assert.equal(exportTable('students', db, 'admin', { search: 'nobody' }).rows.length, 0);
  assert.equal(exportTable('users', db, 'admin', { role: 'dosen' }).rows.length, 1);
  assert.ok(!JSON.stringify(exportTable('users', db, 'admin')).includes('TestOnly123'));
  db.grades[0].nilaiUTS = 80; db.grades[0].nilaiUAS = 90;
  const table = exportTable('my-grades', db, 'student-user');
  assert.equal(table.rows.length, 1); assert.equal(table.rows[0][table.headers.indexOf('nilai_akhir')], 84);
  db.enrollments.push({ id: 'other', penawaranId: 'o', npm: '999', createdAt: '' });
  assert.equal(exportTable('my-grades', db, 'student-user').rows.length, 1);
  assert.throws(() => exportTable('users', db, 'student-user'));
});
