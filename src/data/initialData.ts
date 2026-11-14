import {
  User,
  ProgramStudi,
  Semester,
  Kelas,
  MataKuliah,
  PenawaranMataKuliah,
  Mahasiswa,
  PesertaMataKuliah,
  BobotNilai,
  NilaiMahasiswa,
  RiwayatVerifikasi
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Admin SIMANIS',
    username: 'admin',
    email: 'admin@uhm.ac.id',
    role: 'admin',
    isActive: true,
    avatar: 'AD',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-dos-1',
    name: 'Dr. Ahmad, M.T.',
    username: 'drahmad',
    email: 'ahmad@uhm.ac.id',
    role: 'dosen',
    isActive: true,
    avatar: 'DA',
    nidn: '0912047801',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-dos-2',
    name: 'Dr. Ir. Respaty Namruddin, S.Kom., M.T.',
    username: 'respaty',
    email: 'respaty@uhm.ac.id',
    role: 'dosen',
    isActive: true,
    avatar: 'RN',
    nidn: '0905086501',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-dos-3',
    name: 'Dr. Nurhayati, M.Kom.',
    username: 'nurhayati',
    email: 'nurhayati@uhm.ac.id',
    role: 'dosen',
    isActive: true,
    avatar: 'DN',
    nidn: '0918078201',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-dos-4',
    name: 'Dr. Rahman, M.T.',
    username: 'rahman',
    email: 'rahman@uhm.ac.id',
    role: 'dosen',
    isActive: true,
    avatar: 'DR',
    nidn: '0925108001',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-mhs-1',
    name: 'Andi Pratama',
    username: '2026010001',
    email: 'andi@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'AP',
    npm: '2026010001',
    prodiId: 'prodi-s2-rpl',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-2',
    name: 'Siti Aisyah',
    username: '2026010002',
    email: 'aisyah@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'SA',
    npm: '2026010002',
    prodiId: 'prodi-s2-rpl',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-3',
    name: 'Muhammad Fadli',
    username: '2026010003',
    email: 'fadli@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'MF',
    npm: '2026010003',
    prodiId: 'prodi-s2-rpl',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-4',
    name: 'Nurul Hikmah',
    username: '2026010004',
    email: 'nurul@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'NH',
    npm: '2026010004',
    prodiId: 'prodi-s2-rpl',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-5',
    name: 'Reza Pratama',
    username: '2026010005',
    email: 'reza@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'RP',
    npm: '2026010005',
    prodiId: 'prodi-s2-rpl',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-6',
    name: 'Mahabintang Pallawabonang',
    username: '2026010006',
    email: 'bintang@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'MP',
    npm: '2026010006',
    prodiId: 'prodi-s2-rpl',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-7',
    name: 'Nur Azizah Arafah',
    username: '2026010007',
    email: 'azizah@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'NA',
    npm: '2026010007',
    prodiId: 'prodi-s2-rpl',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-8',
    name: 'Dian Sastrowardoyo',
    username: '2026010008',
    email: 'dian@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'DS',
    npm: '2026010008',
    prodiId: 'prodi-s1-ti',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-9',
    name: 'Fajar Hidayat',
    username: '2026010009',
    email: 'fajar@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'FH',
    npm: '2026010009',
    prodiId: 'prodi-s1-ti',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-mhs-10',
    name: 'Putri Lestari',
    username: '2026010010',
    email: 'putri@uhm.ac.id',
    role: 'mahasiswa',
    isActive: true,
    avatar: 'PL',
    npm: '2026010010',
    prodiId: 'prodi-s1-sk',
    createdAt: '2026-02-01T08:00:00Z'
  }
];

export const INITIAL_PROGRAM_STUDI: ProgramStudi[] = [
  { id: 'prodi-s2-rpl', kodeProdi: '55101', namaProdi: 'Magister Pascasarjana Prodi Sistem Komputer', jenjang: 'S2' },
  { id: 'prodi-s1-ti', kodeProdi: '55201', namaProdi: 'Teknik Informatika', jenjang: 'S1' },
  { id: 'prodi-s1-sk', kodeProdi: '55202', namaProdi: 'Sistem Komputer', jenjang: 'S1' }
];

export const INITIAL_SEMESTER: Semester[] = [
  { id: 'sem-1', nomorSemester: 1, namaSemester: 'Semester 1' },
  { id: 'sem-2', nomorSemester: 2, namaSemester: 'Semester 2' },
  { id: 'sem-3', nomorSemester: 3, namaSemester: 'Semester 3' },
  { id: 'sem-4', nomorSemester: 4, namaSemester: 'Semester 4' }
];

export const INITIAL_KELAS: Kelas[] = [
  { id: 'kls-s2-a', kodeKelas: 'PASCA-1', namaKelas: 'Kelas PASCA-1', prodiId: 'prodi-s2-rpl' },
  { id: 'kls-s2-b', kodeKelas: 'PASCA-2', namaKelas: 'Kelas PASCA-2', prodiId: 'prodi-s2-rpl' },
  { id: 'kls-s2-c', kodeKelas: 'PASCA-3', namaKelas: 'Kelas PASCA-3', prodiId: 'prodi-s2-rpl' },
  { id: 'kls-s2-d', kodeKelas: 'PASCA-4', namaKelas: 'Kelas PASCA-4', prodiId: 'prodi-s2-rpl' },
  { id: 'kls-ti-a', kodeKelas: 'TI-A', namaKelas: 'Kelas TI-A Reguler', prodiId: 'prodi-s1-ti' },
  { id: 'kls-ti-b', kodeKelas: 'TI-B', namaKelas: 'Kelas TI-B Reguler', prodiId: 'prodi-s1-ti' },
  { id: 'kls-sk-a', kodeKelas: 'SK-A', namaKelas: 'Kelas SK-A Reguler', prodiId: 'prodi-s1-sk' }
];

export const INITIAL_MATA_KULIAH: MataKuliah[] = [
  { id: 'mk-rpl701', kodeMK: 'RPL701', namaMK: 'Sistem Komputer', sks: 3, semesterPaket: 1, deskripsi: 'Dasar dan konsep sistem komputer' },
  { id: 'mk-bd702', kodeMK: 'BD702', namaMK: 'Basis Data Lanjut', sks: 3, semesterPaket: 1, deskripsi: 'Database terdistribusi, NoSQL MongoDB, dan optimasi query' },
  { id: 'mk-sc703', kodeMK: 'SC703', namaMK: 'Sistem Cerdas', sks: 3, semesterPaket: 1, deskripsi: 'Machine Learning, AI, dan komputasi cerdas' },
  { id: 'mk-ti101', kodeMK: 'TI101', namaMK: 'Logika & Algoritma', sks: 3, semesterPaket: 1, deskripsi: 'Fondasi logika pemrograman, struktur data, dan analisis algoritma' },
  { id: 'mk-sk301', kodeMK: 'SK301', namaMK: 'Metode Penelitian', sks: 2, semesterPaket: 3, deskripsi: 'Metodologi penelitian ilmiah dan penulisan tesis magister' },
  { id: 'mk-rpl704', kodeMK: 'RPL704', namaMK: 'Arsitektur Perangkat Lunak', sks: 3, semesterPaket: 2, deskripsi: 'Microservices, cloud-native architecture, and patterns' }
];

export const INITIAL_MAHASISWA: Mahasiswa[] = [
  { id: 'mhs-1', npm: '2026010001', nama: 'Andi Pratama', prodiId: 'prodi-s2-rpl', semesterId: 'sem-1', kelasAsalId: 'kls-s2-a', userId: 'usr-mhs-1', email: 'andi@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-2', npm: '2026010002', nama: 'Siti Aisyah', prodiId: 'prodi-s2-rpl', semesterId: 'sem-1', kelasAsalId: 'kls-s2-a', userId: 'usr-mhs-2', email: 'aisyah@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-3', npm: '2026010003', nama: 'Muhammad Fadli', prodiId: 'prodi-s2-rpl', semesterId: 'sem-1', kelasAsalId: 'kls-s2-a', userId: 'usr-mhs-3', email: 'fadli@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-4', npm: '2026010004', nama: 'Nurul Hikmah', prodiId: 'prodi-s2-rpl', semesterId: 'sem-1', kelasAsalId: 'kls-s2-a', userId: 'usr-mhs-4', email: 'nurul@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-5', npm: '2026010005', nama: 'Reza Pratama', prodiId: 'prodi-s2-rpl', semesterId: 'sem-1', kelasAsalId: 'kls-s2-a', userId: 'usr-mhs-5', email: 'reza@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-6', npm: '2026010006', nama: 'Mahabintang Pallawabonang', prodiId: 'prodi-s2-rpl', semesterId: 'sem-1', kelasAsalId: 'kls-s2-a', userId: 'usr-mhs-6', email: 'bintang@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-7', npm: '2026010007', nama: 'Nur Azizah Arafah', prodiId: 'prodi-s2-rpl', semesterId: 'sem-1', kelasAsalId: 'kls-s2-a', userId: 'usr-mhs-7', email: 'azizah@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-8', npm: '2026010008', nama: 'Dian Sastrowardoyo', prodiId: 'prodi-s1-ti', semesterId: 'sem-1', kelasAsalId: 'kls-ti-a', userId: 'usr-mhs-8', email: 'dian@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-9', npm: '2026010009', nama: 'Fajar Hidayat', prodiId: 'prodi-s1-ti', semesterId: 'sem-1', kelasAsalId: 'kls-ti-b', userId: 'usr-mhs-9', email: 'fajar@uhm.ac.id', angkatan: '2026' },
  { id: 'mhs-10', npm: '2026010010', nama: 'Putri Lestari', prodiId: 'prodi-s1-sk', semesterId: 'sem-3', kelasAsalId: 'kls-sk-a', userId: 'usr-mhs-10', email: 'putri@uhm.ac.id', angkatan: '2025' }
];

export const INITIAL_PENAWARAN: PenawaranMataKuliah[] = [
  {
    id: 'pnw-rpl-s2a',
    mataKuliahId: 'mk-rpl701',
    prodiId: 'prodi-s2-rpl',
    semesterId: 'sem-1',
    kelasId: 'kls-s2-a',
    dosenId: 'usr-dos-1', // Dr. Ahmad, M.T.
    periodeAkademik: '2026/2027 — Ganjil',
    ruang: 'Lab Pascasarjana Gedung B Lt. 3',
    jadwal: 'Senin, 13:30 - 16:00 WITA',
    statusPublikasi: 'draft'
  },
  {
    id: 'pnw-bd-s2a',
    mataKuliahId: 'mk-bd702',
    prodiId: 'prodi-s2-rpl',
    semesterId: 'sem-1',
    kelasId: 'kls-s2-a',
    dosenId: 'usr-dos-3', // Dr. Nurhayati, M.Kom.
    periodeAkademik: '2026/2027 — Ganjil',
    ruang: 'Ruang Teori B.204',
    jadwal: 'Selasa, 08:00 - 10:30 WITA',
    statusPublikasi: 'draft'
  },
  {
    id: 'pnw-sc-s2b',
    mataKuliahId: 'mk-sc703',
    prodiId: 'prodi-s2-rpl',
    semesterId: 'sem-1',
    kelasId: 'kls-s2-b',
    dosenId: 'usr-dos-4', // Dr. Rahman, M.T.
    periodeAkademik: '2026/2027 — Ganjil',
    ruang: 'Lab AI Gedung C Lt. 2',
    jadwal: 'Rabu, 10:00 - 12:30 WITA',
    statusPublikasi: 'draft'
  },
  {
    id: 'pnw-la-tia',
    mataKuliahId: 'mk-ti101',
    prodiId: 'prodi-s1-ti',
    semesterId: 'sem-1',
    kelasId: 'kls-ti-a',
    dosenId: 'usr-dos-2', // Dr. Ir. Respaty Namruddin, S.Kom., M.T.
    periodeAkademik: '2026/2027 — Ganjil',
    ruang: 'Lab Komputer Dasar 1',
    jadwal: 'Kamis, 08:00 - 10:30 WITA',
    statusPublikasi: 'published'
  },
  {
    id: 'pnw-la-tib',
    mataKuliahId: 'mk-ti101',
    prodiId: 'prodi-s1-ti',
    semesterId: 'sem-1',
    kelasId: 'kls-ti-b',
    dosenId: 'usr-dos-2', // Dr. Ir. Respaty Namruddin, S.Kom., M.T.
    periodeAkademik: '2026/2027 — Ganjil',
    ruang: 'Lab Komputer Dasar 2',
    jadwal: 'Kamis, 13:00 - 15:30 WITA',
    statusPublikasi: 'draft'
  },
  {
    id: 'pnw-mp-ska',
    mataKuliahId: 'mk-sk301',
    prodiId: 'prodi-s1-sk',
    semesterId: 'sem-3',
    kelasId: 'kls-sk-a',
    dosenId: 'usr-dos-1', // Dr. Ahmad, M.T.
    periodeAkademik: '2026/2027 — Ganjil',
    ruang: 'Ruang Teori A.102',
    jadwal: 'Jumat, 08:30 - 10:30 WITA',
    statusPublikasi: 'published'
  }
];

export const INITIAL_BOBOT: BobotNilai[] = [
  { id: 'bbt-rpl-s2a', penawaranId: 'pnw-rpl-s2a', bobotTugas: 30, bobotUTS: 30, bobotUAS: 40, updatedAt: '2026-02-15T10:00:00Z' },
  { id: 'bbt-bd-s2a', penawaranId: 'pnw-bd-s2a', bobotTugas: 25, bobotUTS: 35, bobotUAS: 40, updatedAt: '2026-02-15T10:00:00Z' },
  { id: 'bbt-sc-s2b', penawaranId: 'pnw-sc-s2b', bobotTugas: 20, bobotUTS: 30, bobotUAS: 50, updatedAt: '2026-02-15T10:00:00Z' },
  { id: 'bbt-la-tia', penawaranId: 'pnw-la-tia', bobotTugas: 30, bobotUTS: 30, bobotUAS: 40, updatedAt: '2026-02-15T10:00:00Z' },
  { id: 'bbt-la-tib', penawaranId: 'pnw-la-tib', bobotTugas: 30, bobotUTS: 30, bobotUAS: 40, updatedAt: '2026-02-15T10:00:00Z' },
  { id: 'bbt-mp-ska', penawaranId: 'pnw-mp-ska', bobotTugas: 25, bobotUTS: 35, bobotUAS: 40, updatedAt: '2026-02-15T10:00:00Z' }
];

export const INITIAL_PESERTA: PesertaMataKuliah[] = [
  // RPL S2-A participants
  { id: 'pst-1', penawaranId: 'pnw-rpl-s2a', npm: '2026010001', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-2', penawaranId: 'pnw-rpl-s2a', npm: '2026010002', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-3', penawaranId: 'pnw-rpl-s2a', npm: '2026010003', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-4', penawaranId: 'pnw-rpl-s2a', npm: '2026010004', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-5', penawaranId: 'pnw-rpl-s2a', npm: '2026010005', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-6', penawaranId: 'pnw-rpl-s2a', npm: '2026010006', createdAt: '2026-02-05T08:00:00Z' }, // Mahabintang
  { id: 'pst-7', penawaranId: 'pnw-rpl-s2a', npm: '2026010007', createdAt: '2026-02-05T08:00:00Z' }, // Nur Azizah

  // Basis Data S2-A
  { id: 'pst-8', penawaranId: 'pnw-bd-s2a', npm: '2026010001', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-9', penawaranId: 'pnw-bd-s2a', npm: '2026010002', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-10', penawaranId: 'pnw-bd-s2a', npm: '2026010006', createdAt: '2026-02-05T08:00:00Z' },

  // Sistem Cerdas S2-B
  { id: 'pst-11', penawaranId: 'pnw-sc-s2b', npm: '2026010003', createdAt: '2026-02-05T08:00:00Z' },
  { id: 'pst-12', penawaranId: 'pnw-sc-s2b', npm: '2026010004', createdAt: '2026-02-05T08:00:00Z' },

  // Logika & Algoritma TI-A
  { id: 'pst-13', penawaranId: 'pnw-la-tia', npm: '2026010008', createdAt: '2026-02-05T08:00:00Z' },

  // Logika & Algoritma TI-B
  { id: 'pst-14', penawaranId: 'pnw-la-tib', npm: '2026010009', createdAt: '2026-02-05T08:00:00Z' },

  // Metode Penelitian SK-A
  { id: 'pst-15', penawaranId: 'pnw-mp-ska', npm: '2026010010', createdAt: '2026-02-05T08:00:00Z' }
];

export const INITIAL_NILAI: NilaiMahasiswa[] = [
  // RPL S2-A grades
  {
    id: 'nil-1',
    pesertaId: 'pst-1',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010001',
    nilaiTugas: 85,
    nilaiUTS: 80,
    nilaiUAS: 90,
    statusVerifikasi: 'Terverifikasi',
    verifiedBy: 'usr-dos-1',
    verifiedAt: '2026-03-01T14:20:00Z',
    updatedAt: '2026-03-01T14:20:00Z'
  },
  {
    id: 'nil-2',
    pesertaId: 'pst-2',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010002',
    nilaiTugas: 78,
    nilaiUTS: 82,
    nilaiUAS: 85,
    statusVerifikasi: 'Terverifikasi',
    verifiedBy: 'usr-dos-1',
    verifiedAt: '2026-03-01T14:22:00Z',
    updatedAt: '2026-03-01T14:22:00Z'
  },
  {
    id: 'nil-3',
    pesertaId: 'pst-3',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010003',
    nilaiTugas: 88,
    nilaiUTS: 75,
    nilaiUAS: 82,
    statusVerifikasi: 'Menunggu Verifikasi',
    updatedAt: '2026-03-02T10:00:00Z'
  },
  {
    id: 'nil-4',
    pesertaId: 'pst-4',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010004',
    nilaiTugas: 75,
    nilaiUTS: 70,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Lengkap',
    updatedAt: '2026-03-02T10:15:00Z'
  },
  {
    id: 'nil-5',
    pesertaId: 'pst-5',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010005',
    nilaiTugas: null,
    nilaiUTS: null,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Diisi',
    updatedAt: '2026-03-02T10:30:00Z'
  },
  {
    id: 'nil-6',
    pesertaId: 'pst-6',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010006', // Mahabintang
    nilaiTugas: 95,
    nilaiUTS: 92,
    nilaiUAS: 96,
    statusVerifikasi: 'Terverifikasi',
    verifiedBy: 'usr-dos-1',
    verifiedAt: '2026-03-01T15:00:00Z',
    updatedAt: '2026-03-01T15:00:00Z'
  },
  {
    id: 'nil-7',
    pesertaId: 'pst-7',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010007', // Nur Azizah
    nilaiTugas: 92,
    nilaiUTS: 90,
    nilaiUAS: 94,
    statusVerifikasi: 'Terverifikasi',
    verifiedBy: 'usr-dos-1',
    verifiedAt: '2026-03-01T15:05:00Z',
    updatedAt: '2026-03-01T15:05:00Z'
  },

  // BD S2-A grades
  {
    id: 'nil-8',
    pesertaId: 'pst-8',
    penawaranId: 'pnw-bd-s2a',
    npm: '2026010001',
    nilaiTugas: 80,
    nilaiUTS: null,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Lengkap',
    updatedAt: '2026-03-02T11:00:00Z'
  },
  {
    id: 'nil-9',
    pesertaId: 'pst-9',
    penawaranId: 'pnw-bd-s2a',
    npm: '2026010002',
    nilaiTugas: 85,
    nilaiUTS: 80,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Lengkap',
    updatedAt: '2026-03-02T11:05:00Z'
  },
  {
    id: 'nil-10',
    pesertaId: 'pst-10',
    penawaranId: 'pnw-bd-s2a',
    npm: '2026010006',
    nilaiTugas: null,
    nilaiUTS: null,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Diisi',
    updatedAt: '2026-03-02T11:10:00Z'
  },

  // SC S2-B grades
  {
    id: 'nil-11',
    pesertaId: 'pst-11',
    penawaranId: 'pnw-sc-s2b',
    npm: '2026010003',
    nilaiTugas: 82,
    nilaiUTS: 80,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Lengkap',
    updatedAt: '2026-03-02T11:15:00Z'
  },
  {
    id: 'nil-12',
    pesertaId: 'pst-12',
    penawaranId: 'pnw-sc-s2b',
    npm: '2026010004',
    nilaiTugas: null,
    nilaiUTS: null,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Diisi',
    updatedAt: '2026-03-02T11:20:00Z'
  },

  // LA TI-A grades (verified complete)
  {
    id: 'nil-13',
    pesertaId: 'pst-13',
    penawaranId: 'pnw-la-tia',
    npm: '2026010008',
    nilaiTugas: 88,
    nilaiUTS: 85,
    nilaiUAS: 90,
    statusVerifikasi: 'Terverifikasi',
    verifiedBy: 'usr-dos-2',
    verifiedAt: '2026-03-03T09:00:00Z',
    updatedAt: '2026-03-03T09:00:00Z'
  },

  // LA TI-B grades
  {
    id: 'nil-14',
    pesertaId: 'pst-14',
    penawaranId: 'pnw-la-tib',
    npm: '2026010009',
    nilaiTugas: 70,
    nilaiUTS: null,
    nilaiUAS: null,
    statusVerifikasi: 'Belum Lengkap',
    updatedAt: '2026-03-03T09:30:00Z'
  },

  // MP SK-A grades
  {
    id: 'nil-15',
    pesertaId: 'pst-15',
    penawaranId: 'pnw-mp-ska',
    npm: '2026010010',
    nilaiTugas: 84,
    nilaiUTS: 80,
    nilaiUAS: 86,
    statusVerifikasi: 'Terverifikasi',
    verifiedBy: 'usr-dos-1',
    verifiedAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T10:00:00Z'
  }
];

export const INITIAL_RIWAYAT: RiwayatVerifikasi[] = [
  {
    id: 'rw-1',
    nilaiId: 'nil-1',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010001',
    aksi: 'Verifikasi',
    userId: 'usr-dos-1',
    userName: 'Dr. Ahmad, M.T.',
    waktu: '2026-03-01 14:20 WITA',
    keterangan: 'Verifikasi nilai final mata kuliah RPL S2-A'
  },
  {
    id: 'rw-2',
    nilaiId: 'nil-2',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010002',
    aksi: 'Verifikasi',
    userId: 'usr-dos-1',
    userName: 'Dr. Ahmad, M.T.',
    waktu: '2026-03-01 14:22 WITA',
    keterangan: 'Verifikasi nilai final mata kuliah RPL S2-A'
  },
  {
    id: 'rw-3',
    nilaiId: 'nil-6',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010006',
    aksi: 'Verifikasi',
    userId: 'usr-dos-1',
    userName: 'Dr. Ahmad, M.T.',
    waktu: '2026-03-01 15:00 WITA',
    keterangan: 'Verifikasi nilai mahasiswa cumlaude'
  },
  {
    id: 'rw-4',
    nilaiId: 'nil-7',
    penawaranId: 'pnw-rpl-s2a',
    npm: '2026010007',
    aksi: 'Verifikasi',
    userId: 'usr-dos-1',
    userName: 'Dr. Ahmad, M.T.',
    waktu: '2026-03-01 15:05 WITA',
    keterangan: 'Verifikasi nilai final mata kuliah RPL S2-A'
  }
];
