export type UserRole = 'admin' | 'dosen' | 'mahasiswa';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  demoPassword?: string; // Demo only: public Firestore data, not a secure password.
  avatar?: string;
  nidn?: string; // Dosen only
  npm?: string;  // Mahasiswa only
  prodiId?: string;
  createdAt: string;
}

export interface ProgramStudi {
  id: string;
  kodeProdi: string;
  namaProdi: string;
  jenjang: 'S1' | 'S2' | 'D3';
}

export interface Semester {
  id: string;
  nomorSemester: number;
  namaSemester: string;
}

export interface Kelas {
  id: string;
  kodeKelas: string;
  namaKelas: string;
  prodiId: string;
}

export interface MataKuliah {
  id: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  semesterPaket: number;
  deskripsi?: string;
}

export interface PenawaranMataKuliah {
  id: string;
  mataKuliahId: string;
  prodiId: string;
  semesterId: string;
  kelasId: string;
  dosenId: string;
  periodeAkademik: string; // e.g. "2026/2027 — Ganjil"
  ruang?: string;
  jadwal?: string;
  statusPublikasi: 'draft' | 'published';
}

export interface Mahasiswa {
  id: string;
  npm: string;
  nama: string;
  prodiId: string;
  semesterId: string;
  kelasAsalId?: string;
  userId: string;
  email: string;
  angkatan: string;
}

export interface PesertaMataKuliah {
  id: string;
  penawaranId: string;
  npm: string;
  createdAt: string;
}

export interface BobotNilai {
  id: string;
  penawaranId: string;
  bobotTugas: number;
  bobotUTS: number;
  bobotUAS: number;
  updatedAt: string;
}

export interface NilaiMahasiswa {
  id: string;
  pesertaId: string;
  penawaranId: string;
  npm: string;
  nilaiTugas: number | null;
  nilaiUTS: number | null;
  nilaiUAS: number | null;
  statusVerifikasi: 'Belum Diisi' | 'Belum Lengkap' | 'Menunggu Verifikasi' | 'Terverifikasi';
  statusPermintaanRevisi?: 'Menunggu Persetujuan' | 'Diizinkan Revisi' | 'Ditolak';
  alasanPermintaanRevisi?: string;
  dimintaOleh?: string;
  dimintaPada?: string;
  diputuskanOleh?: string;
  diputuskanPada?: string;
  catatanKeputusan?: string;
  nilaiSebelumRevisi?: { tugas: number | null; uts: number | null; uas: number | null };
  verifiedBy?: string;
  verifiedAt?: string;
  updatedAt: string;
}

export interface RiwayatVerifikasi {
  id: string;
  nilaiId: string;
  penawaranId: string;
  npm: string;
  aksi: 'Verifikasi' | 'Batal Verifikasi' | 'Koreksi Nilai' | 'Permintaan Revisi' | 'Persetujuan Revisi' | 'Penolakan Revisi';
  userId: string;
  userName: string;
  waktu: string;
  keterangan: string;
  nilaiSebelum?: { tugas: number | null; uts: number | null; uas: number | null };
  nilaiSesudah?: { tugas: number | null; uts: number | null; uas: number | null };
}

export interface Feedback {
  id: string;
  nama: string;
  email: string;
  role: 'dosen' | 'mahasiswa' | 'pengunjung';
  userId?: string;
  ratingTampilan: number;
  ratingNavigasi: number;
  ratingKenyamanan: number;
  saran: string;
  createdAt: string;
}
