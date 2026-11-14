import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateWeights,
  convertScoreToLetter,
  determineGradeStatus,
  calculateGrade,
  averageIncludingMissing,
  calculateComponentContribution
} from './gradeCalculation';

test('Rata-rata menghitung mata kuliah tanpa nilai sebagai nol', () => {
  assert.equal(averageIncludingMissing([80, 100, null, undefined]), 45);
  assert.equal(averageIncludingMissing([null, null]), 0);
  assert.equal(averageIncludingMissing([]), null);
  assert.equal(averageIncludingMissing([0, 100]), 50);
});

test('Validasi bobot tepat 100%', () => {
  // Skenario 1: 30%, 30%, 40% -> Valid
  const res1 = validateWeights(30, 30, 40);
  assert.equal(res1.isValid, true);
  assert.equal(res1.total, 100);

  // Skenario 2: Total 90% -> Ditolak
  const res2 = validateWeights(30, 30, 30);
  assert.equal(res2.isValid, false);
  assert.equal(res2.total, 90);

  // Skenario 3: Total 110% -> Ditolak
  const res3 = validateWeights(40, 40, 30);
  assert.equal(res3.isValid, false);
  assert.equal(res3.total, 110);

  // Skenario 4: Bobot negatif -> Ditolak
  const res4 = validateWeights(-10, 60, 50);
  assert.equal(res4.isValid, false);
});

test('Fitur PRD FR-07: Perhitungan Nilai Otomatis & Kontribusi Sementara', () => {
  const weights = { tugas: 30, uts: 30, uas: 40 };

  // Contoh PRD: Tugas = 85 pada bobot 30% -> kontribusi 25.50
  const cTugas = calculateComponentContribution(85, 30);
  assert.equal(cTugas, 25.50);

  // Partial fill: hanya Tugas = 85
  const partialGrade = calculateGrade(85, null, null, weights, false);
  assert.equal(partialGrade.status, 'Belum Lengkap');
  assert.equal(partialGrade.kontribusiSementara, 25.50);
  assert.equal(partialGrade.nilaiAkhir, null);
  assert.equal(partialGrade.nilaiHuruf, null);
  assert.equal(partialGrade.canVerify, false);

  // Lengkap: Tugas=85, UTS=80, UAS=90 -> Total 85.50, Huruf A
  const completeGrade = calculateGrade(85, 80, 90, weights, false);
  assert.equal(completeGrade.status, 'Menunggu Verifikasi');
  assert.equal(completeGrade.kontribusiTugas, 25.50);
  assert.equal(completeGrade.kontribusiUTS, 24.00);
  assert.equal(completeGrade.kontribusiUAS, 36.00);
  assert.equal(completeGrade.nilaiAkhir, 85.50);
  assert.equal(completeGrade.nilaiHuruf, 'A');
  assert.equal(completeGrade.canVerify, true);
});

test('Fitur PRD FR-08: Konversi Nilai Huruf Sesuai Rentang', () => {
  assert.equal(convertScoreToLetter(100), 'A');
  assert.equal(convertScoreToLetter(85.00), 'A');
  assert.equal(convertScoreToLetter(84.99), 'B');
  assert.equal(convertScoreToLetter(75.00), 'B');
  assert.equal(convertScoreToLetter(74.99), 'C');
  assert.equal(convertScoreToLetter(65.00), 'C');
  assert.equal(convertScoreToLetter(64.99), 'D');
  assert.equal(convertScoreToLetter(50.00), 'D');
  assert.equal(convertScoreToLetter(49.99), 'E');
  assert.equal(convertScoreToLetter(0), 'E');
});

test('Fitur PRD FR-09: Status Verifikasi & Hak Verifikasi', () => {
  assert.equal(determineGradeStatus(null, null, null, false), 'Belum Diisi');
  assert.equal(determineGradeStatus(80, null, null, false), 'Belum Lengkap');
  assert.equal(determineGradeStatus(80, 75, null, false), 'Belum Lengkap');
  assert.equal(determineGradeStatus(80, 75, 85, false), 'Menunggu Verifikasi');
  assert.equal(determineGradeStatus(80, 75, 85, true), 'Terverifikasi');
});
