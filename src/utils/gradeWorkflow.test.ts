import test from 'node:test';
import assert from 'node:assert/strict';
import { canDecideGradeRevision, canEditGrade, canRequestGradeRevision, canVerifyGrade } from './gradeWorkflow';

const draft = { statusVerifikasi: 'Menunggu Verifikasi' as const };
const verified = { statusVerifikasi: 'Terverifikasi' as const };

test('only the assigned lecturer may edit draft grades', () => {
  assert.equal(canEditGrade('dosen', 'dos-1', 'dos-1', draft), true);
  assert.equal(canEditGrade('dosen', 'dos-2', 'dos-1', draft), false);
  assert.equal(canEditGrade('admin', 'admin-1', 'dos-1', draft), false);
});

test('verified grades stay locked until the administrator permits revision', () => {
  assert.equal(canEditGrade('dosen', 'dos-1', 'dos-1', verified), false);
  assert.equal(canEditGrade('dosen', 'dos-1', 'dos-1', { ...verified, statusPermintaanRevisi: 'Diizinkan Revisi' }), true);
  assert.equal(canEditGrade('dosen', 'dos-1', 'dos-1', { ...verified, statusPermintaanRevisi: 'Menunggu Persetujuan' }), false);
  assert.equal(canEditGrade('dosen', 'dos-1', 'dos-1', { ...verified, statusPermintaanRevisi: 'Ditolak' }), false);
});

test('only the assigned lecturer can verify a complete draft, never an administrator', () => {
  assert.equal(canVerifyGrade('dosen', 'dos-1', 'dos-1', draft), true);
  assert.equal(canVerifyGrade('admin', 'admin-1', 'dos-1', draft), false);
  assert.equal(canVerifyGrade('dosen', 'dos-2', 'dos-1', draft), false);
  assert.equal(canVerifyGrade('dosen', 'dos-1', 'dos-1', verified), false);
});

test('only the assigned lecturer may request a revision and only admin may decide a pending request', () => {
  const pending = { ...verified, statusPermintaanRevisi: 'Menunggu Persetujuan' as const };
  assert.equal(canRequestGradeRevision('dosen', 'dos-1', 'dos-1', verified), true);
  assert.equal(canRequestGradeRevision('admin', 'admin-1', 'dos-1', verified), false);
  assert.equal(canRequestGradeRevision('dosen', 'dos-2', 'dos-1', verified), false);
  assert.equal(canRequestGradeRevision('dosen', 'dos-1', 'dos-1', pending), false);
  assert.equal(canDecideGradeRevision('admin', pending), true);
  assert.equal(canDecideGradeRevision('dosen', pending), false);
});
