import type { DatabaseData } from './dataTransfer';

export function transferFixture(): DatabaseData {
  return {
    users: [
      { id: 'admin', username: 'admin', name: 'Admin', email: 'admin@example.test', role: 'admin', isActive: true, createdAt: '2026-01-01', demoPassword: 'TestOnly123' },
      { id: 'lecturer', username: 'dosen01', name: 'Dosen Satu', email: 'dosen@example.test', role: 'dosen', nidn: '881', isActive: true, createdAt: '2026-01-01', demoPassword: 'TestOnly123' },
      { id: 'student-user', username: '001', name: 'Ayu', npm: '001', email: 'ayu@example.test', role: 'mahasiswa', prodiId: 'p', isActive: true, createdAt: '2026-01-01', demoPassword: 'TestOnly123' },
    ],
    programStudi: [{ id: 'p', kodeProdi: 'SK', namaProdi: 'Sistem Komputer', jenjang: 'S2' }],
    semesters: [{ id: 's', nomorSemester: 1, namaSemester: 'Semester 1' }],
    classes: [{ id: 'k', kodeKelas: 'PASCA-1', namaKelas: 'Pascasarjana 1', prodiId: 'p' }],
    courses: [{ id: 'c', kodeMK: 'SK01', namaMK: 'Sistem Komputer', sks: 3, semesterPaket: 1 }],
    offerings: [{ id: 'o', mataKuliahId: 'c', prodiId: 'p', semesterId: 's', kelasId: 'k', dosenId: 'lecturer', periodeAkademik: '2026/2027 - Ganjil', statusPublikasi: 'published' }],
    students: [{ id: 'student', userId: 'student-user', npm: '001', nama: 'Ayu', email: 'ayu@example.test', prodiId: 'p', semesterId: 's', kelasAsalId: 'k', angkatan: '2026' }],
    enrollments: [{ id: 'e', penawaranId: 'o', npm: '001', createdAt: '2026-01-01' }],
    weights: [{ id: 'w', penawaranId: 'o', bobotTugas: 30, bobotUTS: 30, bobotUAS: 40, updatedAt: '2026-01-01' }],
    grades: [{ id: 'g', pesertaId: 'e', penawaranId: 'o', npm: '001', nilaiTugas: 80, nilaiUTS: null, nilaiUAS: null, statusVerifikasi: 'Belum Lengkap', updatedAt: '2026-01-01' }],
    verificationHistory: [], feedback: [],
  };
}
