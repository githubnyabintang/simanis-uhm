import type { UserRole, NilaiMahasiswa } from '../types';

type GradeAccess = Pick<NilaiMahasiswa, 'statusVerifikasi' | 'statusPermintaanRevisi'>;

export const isAssignedLecturer = (role: UserRole | undefined, userId: string | undefined, offeringLecturerId: string | undefined) =>
  role === 'dosen' && Boolean(userId) && userId === offeringLecturerId;

export const canEditGrade = (role: UserRole | undefined, userId: string | undefined, offeringLecturerId: string | undefined, grade?: GradeAccess) =>
  isAssignedLecturer(role, userId, offeringLecturerId) && (!grade || grade.statusVerifikasi !== 'Terverifikasi' || grade.statusPermintaanRevisi === 'Diizinkan Revisi');

export const canVerifyGrade = (role: UserRole | undefined, userId: string | undefined, offeringLecturerId: string | undefined, grade: GradeAccess) =>
  isAssignedLecturer(role, userId, offeringLecturerId) &&
  grade.statusVerifikasi !== 'Terverifikasi' &&
  grade.statusPermintaanRevisi !== 'Menunggu Persetujuan' &&
  grade.statusPermintaanRevisi !== 'Ditolak';

export const canRequestGradeRevision = (role: UserRole | undefined, userId: string | undefined, offeringLecturerId: string | undefined, grade: GradeAccess) =>
  isAssignedLecturer(role, userId, offeringLecturerId) &&
  grade.statusVerifikasi === 'Terverifikasi' &&
  grade.statusPermintaanRevisi !== 'Menunggu Persetujuan';

export const canDecideGradeRevision = (role: UserRole | undefined, grade: GradeAccess) =>
  role === 'admin' && grade.statusVerifikasi === 'Terverifikasi' && grade.statusPermintaanRevisi === 'Menunggu Persetujuan';
