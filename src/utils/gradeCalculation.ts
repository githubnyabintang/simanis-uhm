/**
 * SIMANIS UHM - Grade Calculation & Business Logic
 * Implementing PRD v2.0 specifications.
 */

export interface GradeWeights {
  tugas: number;
  uts: number;
  uas: number;
}

export type GradeStatus = 'Belum Diisi' | 'Belum Lengkap' | 'Menunggu Verifikasi' | 'Terverifikasi';
export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'E';

/**
 * Validates the weight configuration for an offering.
 * Requirement: Bobot Tugas + Bobot UTS + Bobot UAS = 100%
 */
export function validateWeights(tugas: number, uts: number, uas: number): {
  isValid: boolean;
  total: number;
  error?: string;
} {
  if (isNaN(tugas) || isNaN(uts) || isNaN(uas)) {
    return { isValid: false, total: 0, error: 'Semua bobot harus berupa angka valid.' };
  }

  if (tugas < 0 || uts < 0 || uas < 0) {
    return { isValid: false, total: tugas + uts + uas, error: 'Bobot tidak boleh bernilai negatif.' };
  }

  if (tugas > 100 || uts > 100 || uas > 100) {
    return { isValid: false, total: tugas + uts + uas, error: 'Masing-masing bobot tidak boleh melebihi 100%.' };
  }

  const rawTotal = tugas + uts + uas;
  const roundedTotal = Math.round(rawTotal * 100) / 100;

  if (Math.abs(roundedTotal - 100) > 0.001) {
    return {
      isValid: false,
      total: roundedTotal,
      error: `Total bobot saat ini ${roundedTotal}%. Total bobot wajib tepat 100%.`
    };
  }

  return { isValid: true, total: 100 };
}

/**
 * Rounds a number to 2 decimal places using standard half-up rounding.
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Missing final grades count as zero; an empty course list has no average. */
export function averageIncludingMissing(scores: Array<number | null | undefined>): number | null {
  return scores.length ? scores.reduce<number>((sum, score) => sum + (score ?? 0), 0) / scores.length : null;
}

/**
 * Calculates single component contribution: (Nilai * Bobot / 100)
 */
export function calculateComponentContribution(score: number | null | undefined, weight: number): number | null {
  if (score === null || score === undefined || isNaN(score)) {
    return null;
  }
  return roundToTwoDecimals((score * weight) / 100);
}

/**
 * Converts a numerical final score to Letter Grade (A, B, C, D, E).
 * Rule from PRD Section FR-08:
 * 85.00 - 100.00 : A
 * 75.00 - 84.99  : B
 * 65.00 - 74.99  : C
 * 50.00 - 64.99  : D
 *  0.00 - 49.99  : E
 */
export function convertScoreToLetter(score: number): LetterGrade {
  const rounded = roundToTwoDecimals(score);
  if (rounded >= 85.0) return 'A';
  if (rounded >= 75.0) return 'B';
  if (rounded >= 65.0) return 'C';
  if (rounded >= 50.0) return 'D';
  return 'E';
}

/**
 * Determines grade status according to PRD FR-09:
 * - Belum Diisi: 0 out of 3 components filled
 * - Belum Lengkap: 1 or 2 components filled
 * - Menunggu Verifikasi: all 3 filled, not yet verified
 * - Terverifikasi: verified by lecturer
 */
export function determineGradeStatus(
  tugas: number | null | undefined,
  uts: number | null | undefined,
  uas: number | null | undefined,
  isVerified: boolean
): GradeStatus {
  if (isVerified) {
    return 'Terverifikasi';
  }

  const filledCount = [tugas, uts, uas].filter((v) => v !== null && v !== undefined && !isNaN(v)).length;

  if (filledCount === 0) {
    return 'Belum Diisi';
  }
  if (filledCount < 3) {
    return 'Belum Lengkap';
  }
  return 'Menunggu Verifikasi';
}

/**
 * Calculates grade output:
 * If all 3 components are present, outputs final score and letter grade.
 * If partial, outputs temporary contribution and null letter grade.
 */
export function calculateGrade(
  tugas: number | null | undefined,
  uts: number | null | undefined,
  uas: number | null | undefined,
  weights: GradeWeights,
  isVerified: boolean = false
): {
  status: GradeStatus;
  kontribusiTugas: number | null;
  kontribusiUTS: number | null;
  kontribusiUAS: number | null;
  kontribusiSementara: number;
  nilaiAkhir: number | null;
  nilaiHuruf: LetterGrade | null;
  isComplete: boolean;
  canVerify: boolean;
} {
  const cTugas = calculateComponentContribution(tugas, weights.tugas);
  const cUTS = calculateComponentContribution(uts, weights.uts);
  const cUAS = calculateComponentContribution(uas, weights.uas);

  const status = determineGradeStatus(tugas, uts, uas, isVerified);
  const isComplete = tugas !== null && tugas !== undefined && !isNaN(tugas) &&
                     uts !== null && uts !== undefined && !isNaN(uts) &&
                     uas !== null && uas !== undefined && !isNaN(uas);

  const weightValidation = validateWeights(weights.tugas, weights.uts, weights.uas);

  // Sum whatever contributions exist for temporary preview
  let partialSum = 0;
  if (cTugas !== null) partialSum += cTugas;
  if (cUTS !== null) partialSum += cUTS;
  if (cUAS !== null) partialSum += cUAS;
  const kontribusiSementara = roundToTwoDecimals(partialSum);

  if (isComplete && weightValidation.isValid) {
    const rawFinal = (tugas! * weights.tugas / 100) +
                     (uts! * weights.uts / 100) +
                     (uas! * weights.uas / 100);
    const finalScore = roundToTwoDecimals(rawFinal);
    const letter = convertScoreToLetter(finalScore);

    return {
      status,
      kontribusiTugas: cTugas,
      kontribusiUTS: cUTS,
      kontribusiUAS: cUAS,
      kontribusiSementara: finalScore,
      nilaiAkhir: finalScore,
      nilaiHuruf: letter,
      isComplete: true,
      canVerify: !isVerified
    };
  }

  return {
    status,
    kontribusiTugas: cTugas,
    kontribusiUTS: cUTS,
    kontribusiUAS: cUAS,
    kontribusiSementara,
    nilaiAkhir: null,
    nilaiHuruf: null,
    isComplete: false,
    canVerify: false
  };
}
