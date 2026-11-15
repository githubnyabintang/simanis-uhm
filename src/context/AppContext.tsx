import React, { createContext, useContext, useEffect, useState } from 'react';
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
  RiwayatVerifikasi,
  Feedback
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROGRAM_STUDI,
  INITIAL_SEMESTER,
  INITIAL_KELAS,
  INITIAL_MATA_KULIAH,
  INITIAL_MAHASISWA,
  INITIAL_PENAWARAN,
  INITIAL_BOBOT,
  INITIAL_PESERTA,
  INITIAL_NILAI,
  INITIAL_RIWAYAT
} from '../data/initialData';
import { validateWeights, determineGradeStatus } from '../utils/gradeCalculation';
import { useFirestoreCollection } from '../lib/useFirestoreCollection';
import { findLoginUser } from '../utils/findLoginUser';
import { saveDocument } from '../lib/firestoreRepository';
import { canDecideGradeRevision, canEditGrade, canRequestGradeRevision, canVerifyGrade, isAssignedLecturer } from '../utils/gradeWorkflow';

interface AppContextType {
  currentUser: User | null;
  activePeriod: string;
  setActivePeriod: (period: string) => void;
  activePage: string;
  setActivePage: (page: string, penawaranId?: string | null) => void;
  selectedPenawaranId: string | null;
  setSelectedPenawaranId: (id: string | null) => void;
  
  // Data lists
  users: User[];
  programStudi: ProgramStudi[];
  semesters: Semester[];
  classes: Kelas[];
  courses: MataKuliah[];
  offerings: PenawaranMataKuliah[];
  students: Mahasiswa[];
  enrollments: PesertaMataKuliah[];
  weights: BobotNilai[];
  grades: NilaiMahasiswa[];
  verificationHistory: RiwayatVerifikasi[];
  feedback: Feedback[];
  feedbackModalOpen: boolean;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;

  // Auth
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  quickLogin: (userId: string) => void;
  logout: () => void;

  // Master Data CRUD
  addStudent: (student: Omit<Mahasiswa, 'id' | 'userId'>) => { success: boolean; error?: string };
  updateStudent: (student: Mahasiswa) => { success: boolean; error?: string };
  deleteStudent: (studentId: string) => { success: boolean; error?: string };

  addCourse: (course: Omit<MataKuliah, 'id'>) => { success: boolean; error?: string };
  updateCourse: (course: MataKuliah) => { success: boolean; error?: string };
  deleteCourse: (courseId: string) => { success: boolean; error?: string };

  addOffering: (offering: Omit<PenawaranMataKuliah, 'id'>) => { success: boolean; error?: string };
  updateOffering: (offering: PenawaranMataKuliah) => { success: boolean; error?: string };
  deleteOffering: (offeringId: string) => { success: boolean; error?: string };

  enrollStudent: (penawaranId: string, npm: string) => { success: boolean; error?: string };
  unenrollStudent: (enrollmentId: string) => { success: boolean; error?: string };

  // Bobot penilaian
  saveWeights: (penawaranId: string, tugas: number, uts: number, uas: number) => { success: boolean; error?: string };

  // Fitur Dosen: Input Nilai & Verifikasi
  saveGrade: (pesertaId: string, penawaranId: string, npm: string, tugas: number | null, uts: number | null, uas: number | null) => { success: boolean; error?: string };
  verifyGrade: (nilaiId: string) => { success: boolean; error?: string };
  cancelVerification: (nilaiId: string, reason: string) => { success: boolean; error?: string };
  decideGradeRevision: (nilaiId: string, approve: boolean, note: string) => { success: boolean; error?: string };
  updateDosenAccount: (userId: string, name: string, email: string) => { success: boolean; error?: string };
  updateOwnProfile: (name: string, email: string) => { success: boolean; error?: string };
  submitFeedback: (data: Omit<Feedback, 'id' | 'createdAt'>) => { success: boolean; error?: string };

  // Reset demo
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [settingUp, setSettingUp] = useState(false);

  const [activePeriod, setActivePeriod] = useState<string>('2026/2027 — Ganjil');
  const [activePage, setActivePageState] = useState<string>('login');
  const [selectedPenawaranId, setSelectedPenawaranId] = useState<string | null>('pnw-rpl-s2a');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const [users, setUsers, usersReady, usersError] = useFirestoreCollection('users');
  const [programStudi, setProgramStudi, prodiReady, prodiError] = useFirestoreCollection('programStudi');
  const [semesters, setSemesters, semestersReady, semestersError] = useFirestoreCollection('semesters');
  const [classes, setClasses, classesReady, classesError] = useFirestoreCollection('classes');
  const [courses, setCourses, coursesReady, coursesError] = useFirestoreCollection('courses');
  const [offerings, setOfferings, offeringsReady, offeringsError] = useFirestoreCollection('offerings');
  const [students, setStudents, studentsReady, studentsError] = useFirestoreCollection('students');
  const [enrollments, setEnrollments, enrollmentsReady, enrollmentsError] = useFirestoreCollection('enrollments');
  const [weights, setWeights, weightsReady, weightsError] = useFirestoreCollection('weights');
  const [grades, setGrades, gradesReady, gradesError] = useFirestoreCollection('grades');
  const [verificationHistory, setVerificationHistory, historyReady, historyError] = useFirestoreCollection('verificationHistory');
  const [feedback, setFeedback, feedbackReady, feedbackError] = useFirestoreCollection('feedback');
  const firestoreError = usersError || prodiError || semestersError || classesError || coursesError || offeringsError || studentsError || enrollmentsError || weightsError || gradesError || historyError || feedbackError;
  const firestoreReady = usersReady && prodiReady && semestersReady && classesReady && coursesReady && offeringsReady && studentsReady && enrollmentsReady && weightsReady && gradesReady && historyReady && feedbackReady;

  useEffect(() => {
    if (!usersReady) return;
    setCurrentUser((current) => {
      if (!current) return current;
      const latest = users.find((user) => user.id === current.id);
      if (!latest || !latest.isActive) return null;
      return JSON.stringify(latest) === JSON.stringify(current) ? current : latest;
    });
  }, [users, usersReady]);

  const setActivePage = (page: string, penawaranId?: string | null) => {
    const allowedByRole: Record<string, string[]> = {
      admin: ['dashboard', 'mahasiswa', 'matakuliah', 'users', 'penawaran', 'peserta', 'pengolahan-nilai', 'feedback', 'profile'],
      dosen: ['dosen-matakuliah', 'pengolahan-nilai', 'profile'],
      mahasiswa: ['dashboard-mahasiswa', 'nilai-saya', 'profile']
    };
    const allowedPages = currentUser ? allowedByRole[currentUser.role] || [] : [];
    if (currentUser && !allowedPages.includes(page)) return;
    if (penawaranId !== undefined) {
      setSelectedPenawaranId(penawaranId);
    }
    setActivePageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (identifier: string, password: string) => {
    const { user, ambiguous } = findLoginUser(users, identifier);

    if (ambiguous) return { success: false, error: 'Identitas digunakan oleh lebih dari satu akun. Gunakan username atau email yang berbeda.' };

    if (!user) {
      return { success: false, error: 'Pengguna tidak ditemukan. Periksa email, NIDN, atau NIM Anda.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Akun Anda dinonaktifkan oleh administrator BAAK.' };
    }

    if (user.demoPassword && user.demoPassword !== password) {
      return { success: false, error: 'Password salah.' };
    }

    setCurrentUser(user);
    if (user.role === 'admin') setActivePageState('dashboard');
    else if (user.role === 'dosen') setActivePageState('dosen-matakuliah');
    else if (user.role === 'mahasiswa') setActivePageState('dashboard-mahasiswa');
    return { success: true };
  };

  const quickLogin = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') setActivePageState('dashboard');
      else if (user.role === 'dosen') setActivePageState('dosen-matakuliah');
      else if (user.role === 'mahasiswa') setActivePageState('dashboard-mahasiswa');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActivePageState('login');
    setFeedbackModalOpen(false);
  };

  const openFeedbackModal = () => setFeedbackModalOpen(true);
  const closeFeedbackModal = () => setFeedbackModalOpen(false);

  const submitFeedback = (data: Omit<Feedback, 'id' | 'createdAt'>) => {
    if (!data.nama.trim() || !data.email.trim()) return { success: false, error: 'Nama dan email wajib diisi.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return { success: false, error: 'Format email tidak valid.' };
    if (![1, 2, 3, 4, 5].includes(data.ratingTampilan) || ![1, 2, 3, 4, 5].includes(data.ratingNavigasi) || ![1, 2, 3, 4, 5].includes(data.ratingKenyamanan)) {
      return { success: false, error: 'Setiap pertanyaan rating wajib diberi nilai 1 sampai 5 bintang.' };
    }
    setFeedback((previous) => [...previous, { ...data, id: `fb-${Date.now()}`, createdAt: new Date().toISOString() }]);
    return { success: true };
  };

  const resetToDefault = () => {
    setUsers(INITIAL_USERS);
    setProgramStudi(INITIAL_PROGRAM_STUDI);
    setSemesters(INITIAL_SEMESTER);
    setClasses(INITIAL_KELAS);
    setCourses(INITIAL_MATA_KULIAH);
    setOfferings(INITIAL_PENAWARAN);
    setStudents(INITIAL_MAHASISWA);
    setEnrollments(INITIAL_PESERTA);
    setWeights(INITIAL_BOBOT);
    setGrades(INITIAL_NILAI);
    setVerificationHistory(INITIAL_RIWAYAT);
    setCurrentUser(INITIAL_USERS[0]);
    setActivePageState('dashboard');
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Mahasiswa, 'id' | 'userId'>) => {
    if (!studentData.npm || !studentData.nama) {
      return { success: false, error: 'NPM dan Nama Mahasiswa wajib diisi.' };
    }
    const exists = students.some((s) => s.npm === studentData.npm);
    if (exists) {
      return { success: false, error: `Mahasiswa dengan NPM ${studentData.npm} sudah terdaftar.` };
    }

    const newId = `mhs-${Date.now()}`;
    const newUserId = `usr-mhs-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name: studentData.nama,
      username: studentData.npm,
      email: studentData.email || `${studentData.npm}@uhm.ac.id`,
      role: 'mahasiswa',
      isActive: true,
      avatar: studentData.nama.slice(0, 2).toUpperCase(),
      npm: studentData.npm,
      prodiId: studentData.prodiId,
      createdAt: new Date().toISOString()
    };

    const newStudent: Mahasiswa = {
      ...studentData,
      id: newId,
      userId: newUserId
    };

    setUsers((prev) => [...prev, newUser]);
    setStudents((prev) => [...prev, newStudent]);
    return { success: true };
  };

  const updateStudent = (studentData: Mahasiswa) => {
    setStudents((prev) => prev.map((s) => (s.id === studentData.id ? studentData : s)));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === studentData.userId ? { ...u, name: studentData.nama, email: studentData.email } : u
      )
    );
    return { success: true };
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, error: 'Mahasiswa tidak ditemukan.' };

    // Integrity check from PRD: check if enrolled with grades
    const hasGrades = grades.some((g) => g.npm === student.npm && (g.nilaiTugas !== null || g.statusVerifikasi === 'Terverifikasi'));
    if (hasGrades) {
      return {
        success: false,
        error: 'Tidak dapat menghapus mahasiswa yang sudah memiliki catatan nilai akademik demi integritas data.'
      };
    }

    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setEnrollments((prev) => prev.filter((e) => e.npm !== student.npm));
    setGrades((prev) => prev.filter((g) => g.npm !== student.npm));
    return { success: true };
  };

  // Course CRUD
  const addCourse = (courseData: Omit<MataKuliah, 'id'>) => {
    if (!courseData.kodeMK || !courseData.namaMK) {
      return { success: false, error: 'Kode MK dan Nama Mata Kuliah wajib diisi.' };
    }
    const exists = courses.some((c) => c.kodeMK.toLowerCase() === courseData.kodeMK.toLowerCase());
    if (exists) {
      return { success: false, error: `Kode mata kuliah ${courseData.kodeMK} sudah digunakan.` };
    }

    const newCourse: MataKuliah = {
      ...courseData,
      id: `mk-${Date.now()}`
    };
    setCourses((prev) => [...prev, newCourse]);
    return { success: true };
  };

  const updateCourse = (courseData: MataKuliah) => {
    setCourses((prev) => prev.map((c) => (c.id === courseData.id ? courseData : c)));
    return { success: true };
  };

  const deleteCourse = (courseId: string) => {
    const hasOfferings = offerings.some((o) => o.mataKuliahId === courseId);
    if (hasOfferings) {
      return { success: false, error: 'Mata kuliah yang sedang ditawarkan di kelas tidak dapat dihapus.' };
    }
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    return { success: true };
  };

  // Offering CRUD
  const addOffering = (offeringData: Omit<PenawaranMataKuliah, 'id'>) => {
    const newId = `pnw-${Date.now()}`;
    const newOffering: PenawaranMataKuliah = {
      ...offeringData,
      id: newId
    };
    // Default weights (30-30-40)
    const newWeight: BobotNilai = {
      id: `bbt-${Date.now()}`,
      penawaranId: newId,
      bobotTugas: 30,
      bobotUTS: 30,
      bobotUAS: 40,
      updatedAt: new Date().toISOString()
    };
    setOfferings((prev) => [...prev, newOffering]);
    setWeights((prev) => [...prev, newWeight]);
    return { success: true };
  };

  const updateOffering = (offeringData: PenawaranMataKuliah) => {
    setOfferings((prev) => prev.map((o) => (o.id === offeringData.id ? offeringData : o)));
    return { success: true };
  };

  const deleteOffering = (offeringId: string) => {
    const hasVerified = grades.some((g) => g.penawaranId === offeringId && g.statusVerifikasi === 'Terverifikasi');
    if (hasVerified) {
      return { success: false, error: 'Kelas penawaran ini memiliki nilai mahasiswa yang sudah terverifikasi resmi dan tidak boleh dihapus.' };
    }
    setOfferings((prev) => prev.filter((o) => o.id !== offeringId));
    setEnrollments((prev) => prev.filter((e) => e.penawaranId !== offeringId));
    setGrades((prev) => prev.filter((g) => g.penawaranId !== offeringId));
    setWeights((prev) => prev.filter((w) => w.penawaranId !== offeringId));
    return { success: true };
  };

  // Enrollment
  const enrollStudent = (penawaranId: string, npm: string) => {
    const alreadyEnrolled = enrollments.some((e) => e.penawaranId === penawaranId && e.npm === npm);
    if (alreadyEnrolled) {
      return { success: false, error: `Mahasiswa dengan NPM ${npm} sudah terdaftar di kelas penawaran ini.` };
    }

    const newEnrollId = `pst-${Date.now()}`;
    const newEnrollment: PesertaMataKuliah = {
      id: newEnrollId,
      penawaranId,
      npm,
      createdAt: new Date().toISOString()
    };

    // create initial blank grade record
    const newGrade: NilaiMahasiswa = {
      id: `nil-${Date.now()}`,
      pesertaId: newEnrollId,
      penawaranId,
      npm,
      nilaiTugas: null,
      nilaiUTS: null,
      nilaiUAS: null,
      statusVerifikasi: 'Belum Diisi',
      updatedAt: new Date().toISOString()
    };

    setEnrollments((prev) => [...prev, newEnrollment]);
    setGrades((prev) => [...prev, newGrade]);
    return { success: true };
  };

  const unenrollStudent = (enrollmentId: string) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return { success: false, error: 'Data pendaftaran tidak ditemukan.' };

    const grade = grades.find((g) => g.pesertaId === enrollmentId);
    if (grade && grade.statusVerifikasi === 'Terverifikasi') {
      return { success: false, error: 'Mahasiswa sudah memiliki nilai terverifikasi di kelas ini dan tidak dapat dibatalkan pendaftarannya.' };
    }

    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    setGrades((prev) => prev.filter((g) => g.pesertaId !== enrollmentId));
    return { success: true };
  };

  // Bobot penilaian
  const saveWeights = (penawaranId: string, tugas: number, uts: number, uas: number) => {
    if (currentUser?.role !== 'dosen' && currentUser?.role !== 'admin') return { success: false, error: 'Anda tidak berwenang mengatur bobot penilaian.' };
    const offering = offerings.find((item) => item.id === penawaranId);
    if (!offering || (currentUser.role === 'dosen' && offering.dosenId !== currentUser.id)) return { success: false, error: 'Anda tidak memiliki akses ke mata kuliah ini.' };

    // Bobot tetap wajib total tepat 100%, termasuk setelah nilai diverifikasi.
    const validation = validateWeights(tugas, uts, uas);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    setWeights((prev) => {
      const existing = prev.find((w) => w.penawaranId === penawaranId);
      if (existing) {
        return prev.map((w) =>
          w.penawaranId === penawaranId
            ? { ...w, bobotTugas: tugas, bobotUTS: uts, bobotUAS: uas, updatedAt: new Date().toISOString() }
            : w
        );
      } else {
        return [
          ...prev,
          {
            id: `bbt-${Date.now()}`,
            penawaranId,
            bobotTugas: tugas,
            bobotUTS: uts,
            bobotUAS: uas,
            updatedAt: new Date().toISOString()
          }
        ];
      }
    });

    return { success: true };
  };

  // Grade input
  const saveGrade = (
    pesertaId: string,
    penawaranId: string,
    npm: string,
    tugas: number | null,
    uts: number | null,
    uas: number | null
  ) => {
    if (currentUser?.role !== 'dosen') {
      return { success: false, error: 'Hanya dosen yang dapat mengubah nilai.' };
    }
    const offering = offerings.find((item) => item.id === penawaranId);
    if (!offering || !isAssignedLecturer(currentUser.role, currentUser.id, offering.dosenId)) {
      return { success: false, error: 'Anda tidak memiliki akses ke mata kuliah ini.' };
    }
    const participant = enrollments.find((item) => item.id === pesertaId && item.penawaranId === penawaranId && item.npm === npm);
    if (!participant) {
      return { success: false, error: 'Mahasiswa tidak terdaftar pada kelas ini.' };
    }
    // Validate bounds 0-100
    const checkVal = (v: number | null) => {
      if (v === null) return true;
      return !isNaN(v) && v >= 0 && v <= 100;
    };

    if (!checkVal(tugas) || !checkVal(uts) || !checkVal(uas)) {
      return { success: false, error: 'Nilai harus berada dalam rentang 0 hingga 100.' };
    }

    const existingGrade = grades.find((grade) => grade.pesertaId === pesertaId);
    if (!canEditGrade(currentUser.role, currentUser.id, offering.dosenId, existingGrade)) {
      return { success: false, error: existingGrade?.statusPermintaanRevisi === 'Menunggu Persetujuan'
        ? 'Permintaan revisi masih menunggu persetujuan administrator.'
        : 'Nilai telah diverifikasi dan terkunci.' };
    }

    setGrades((prev) => {
      const existingIndex = prev.findIndex((g) => g.pesertaId === pesertaId);
      if (existingIndex >= 0) {
        const current = prev[existingIndex];
        const newStatus = determineGradeStatus(tugas, uts, uas, false);
        const updated = {
          ...current,
          nilaiTugas: tugas,
          nilaiUTS: uts,
          nilaiUAS: uas,
          statusVerifikasi: newStatus,
          statusPermintaanRevisi: current.statusPermintaanRevisi === 'Diizinkan Revisi' ? ('Diizinkan Revisi' as const) : undefined,
          nilaiSebelumRevisi: current.statusPermintaanRevisi === 'Diizinkan Revisi'
            ? current.nilaiSebelumRevisi || { tugas: current.nilaiTugas, uts: current.nilaiUTS, uas: current.nilaiUAS }
            : current.nilaiSebelumRevisi,
          updatedAt: new Date().toISOString()
        };
        const next = [...prev];
        next[existingIndex] = updated;
        return next;
      } else {
        const newStatus = determineGradeStatus(tugas, uts, uas, false);
        return [
          ...prev,
          {
            id: `nil-${Date.now()}`,
            pesertaId,
            penawaranId,
            npm,
            nilaiTugas: tugas,
            nilaiUTS: uts,
            nilaiUAS: uas,
            statusVerifikasi: newStatus,
            updatedAt: new Date().toISOString()
          }
        ];
      }
    });

    return { success: true };
  };

  // Grade verification (PRD FR-09)
  const verifyGrade = (nilaiId: string) => {
    const target = grades.find((g) => g.id === nilaiId);
    if (!target) return { success: false, error: 'Data nilai tidak ditemukan.' };
    if (currentUser?.role !== 'dosen') return { success: false, error: 'Hanya dosen yang dapat memverifikasi nilai.' };
    const offering = offerings.find((item) => item.id === target.penawaranId);
    if (!offering || !canVerifyGrade(currentUser.role, currentUser.id, offering.dosenId, target)) {
      if (target.statusVerifikasi === 'Terverifikasi') return { success: false, error: 'Nilai ini sudah terverifikasi.' };
      return { success: false, error: 'Anda tidak berwenang memverifikasi nilai ini atau permintaan revisinya belum diizinkan.' };
    }
    if (target.statusPermintaanRevisi === 'Menunggu Persetujuan' || target.statusPermintaanRevisi === 'Ditolak') {
      return { success: false, error: 'Permintaan revisi belum diizinkan administrator.' };
    }

    if (
      target.nilaiTugas === null ||
      target.nilaiUTS === null ||
      target.nilaiUAS === null
    ) {
      return { success: false, error: 'Nilai belum lengkap. Semua komponen (Tugas, UTS, UAS) wajib terisi sebelum verifikasi.' };
    }

    const currentWeight = weights.find((w) => w.penawaranId === target.penawaranId);
    if (!currentWeight) {
      return { success: false, error: 'Bobot nilai belum dikonfigurasi untuk penawaran ini.' };
    }

    const weightVal = validateWeights(currentWeight.bobotTugas, currentWeight.bobotUTS, currentWeight.bobotUAS);
    if (!weightVal.isValid) {
      return { success: false, error: `Bobot penilaian tidak valid: ${weightVal.error}` };
    }

    const now = new Date().toISOString();
    const verifierName = currentUser?.name || 'Dosen Pengampu';

    setGrades((prev) =>
      prev.map((g) =>
        g.id === nilaiId
          ? {
              ...g,
              statusVerifikasi: 'Terverifikasi',
              statusPermintaanRevisi: undefined,
              alasanPermintaanRevisi: undefined,
              dimintaOleh: undefined,
              dimintaPada: undefined,
              diputuskanOleh: undefined,
              diputuskanPada: undefined,
              catatanKeputusan: undefined,
              nilaiSebelumRevisi: undefined,
              verifiedBy: currentUser?.id,
              verifiedAt: now,
              updatedAt: now
            }
          : g
      )
    );

    // Record audit trail
    const newHistory: RiwayatVerifikasi = {
      id: `rw-${Date.now()}`,
      nilaiId,
      penawaranId: target.penawaranId,
      npm: target.npm,
      aksi: 'Verifikasi',
      userId: currentUser?.id || 'dosen',
      userName: verifierName,
      waktu: new Date().toLocaleString('id-ID'),
      keterangan: 'Verifikasi nilai akhir mahasiswa berhasil dilakukan.',
      nilaiSebelum: target.nilaiSebelumRevisi,
      nilaiSesudah: target.nilaiSebelumRevisi ? { tugas: target.nilaiTugas, uts: target.nilaiUTS, uas: target.nilaiUAS } : undefined
    };
    setVerificationHistory((prev) => [newHistory, ...prev]);

    return { success: true };
  };

  // Cancel verification (PRD FR-09)
  const cancelVerification = (nilaiId: string, reason: string) => {
    const target = grades.find((g) => g.id === nilaiId);
    if (!target) return { success: false, error: 'Data nilai tidak ditemukan.' };
    if (currentUser?.role !== 'dosen') return { success: false, error: 'Hanya dosen yang dapat mengajukan revisi nilai.' };
    const offering = offerings.find((item) => item.id === target.penawaranId);
    if (!offering || !canRequestGradeRevision(currentUser.role, currentUser.id, offering.dosenId, target)) {
      return { success: false, error: 'Hanya dosen pengampu yang dapat mengajukan revisi untuk nilai terverifikasi yang belum menunggu keputusan.' };
    }

    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Alasan pembatalan verifikasi wajib diisi untuk catatan riwayat audit.' };
    }

    const now = new Date().toISOString();
    const verifierName = currentUser?.name || 'Dosen Pengampu';

    setGrades((prev) =>
      prev.map((g) =>
        g.id === nilaiId
          ? {
              ...g,
              statusPermintaanRevisi: 'Menunggu Persetujuan',
              alasanPermintaanRevisi: reason.trim(),
              dimintaOleh: currentUser.id,
              dimintaPada: now,
              diputuskanOleh: undefined,
              diputuskanPada: undefined,
              catatanKeputusan: undefined,
              updatedAt: now
            }
          : g
      )
    );

    const newHistory: RiwayatVerifikasi = {
      id: `rw-${Date.now()}`,
      nilaiId,
      penawaranId: target.penawaranId,
      npm: target.npm,
      aksi: 'Permintaan Revisi',
      userId: currentUser.id,
      userName: verifierName,
      waktu: new Date().toLocaleString('id-ID'),
      keterangan: `Permintaan pembukaan revisi: ${reason.trim()}`
    };
    setVerificationHistory((prev) => [newHistory, ...prev]);

    return { success: true };
  };

  const decideGradeRevision = (nilaiId: string, approve: boolean, note: string) => {
    if (currentUser?.role !== 'admin') return { success: false, error: 'Hanya administrator yang dapat memutuskan permintaan revisi.' };
    const target = grades.find((grade) => grade.id === nilaiId);
    if (!target || !canDecideGradeRevision(currentUser.role, target)) {
      return { success: false, error: 'Permintaan revisi tidak ditemukan atau sudah diputuskan.' };
    }
    if (!note.trim()) return { success: false, error: 'Catatan keputusan wajib diisi.' };
    const now = new Date().toISOString();
    setGrades((prev) => prev.map((grade) => grade.id === nilaiId ? {
      ...grade,
      statusPermintaanRevisi: approve ? 'Diizinkan Revisi' : 'Ditolak',
      diputuskanOleh: currentUser.id,
      diputuskanPada: now,
      catatanKeputusan: note.trim(),
      updatedAt: now
    } : grade));
    const history: RiwayatVerifikasi = {
      id: `rw-${Date.now()}`,
      nilaiId,
      penawaranId: target.penawaranId,
      npm: target.npm,
      aksi: approve ? 'Persetujuan Revisi' : 'Penolakan Revisi',
      userId: currentUser.id,
      userName: currentUser.name,
      waktu: new Date(now).toLocaleString('id-ID'),
      keterangan: note.trim()
    };
    setVerificationHistory((prev) => [history, ...prev]);
    return { success: true };
  };

  const updateDosenAccount = (userId: string, name: string, email: string) => {
    if (currentUser?.role !== 'admin') return { success: false, error: 'Hanya administrator yang dapat mengelola akun dosen.' };
    const target = users.find((user) => user.id === userId && user.role === 'dosen');
    if (!target) return { success: false, error: 'Akun dosen tidak ditemukan.' };
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName) return { success: false, error: 'Nama wajib diisi.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { success: false, error: 'Format email tidak valid.' };
    if (users.some((user) => user.id !== userId && user.email.toLowerCase() === cleanEmail)) return { success: false, error: 'Email sudah digunakan akun lain.' };
    setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, name: cleanName, email: cleanEmail, avatar: cleanName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() } : user));
    return { success: true };
  };

  const updateOwnProfile = (name: string, email: string) => {
    if (!currentUser) return { success: false, error: 'Sesi pengguna tidak ditemukan.' };
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName) return { success: false, error: 'Nama wajib diisi.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { success: false, error: 'Format email tidak valid.' };
    if (users.some((user) => user.id !== currentUser.id && user.email.toLowerCase() === cleanEmail)) return { success: false, error: 'Email sudah digunakan akun lain.' };
    const updated = { ...currentUser, name: cleanName, email: cleanEmail, avatar: cleanName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((user) => user.id === updated.id ? updated : user));
    if (updated.role === 'mahasiswa') {
      setStudents((prev) => prev.map((student) => student.userId === updated.id ? { ...student, nama: cleanName, email: cleanEmail } : student));
    }
    return { success: true };
  };

  const setupDemo = async () => {
    setSettingUp(true);
    setSetupError(null);
    try {
      await Promise.all([
        ...(!programStudi.length ? INITIAL_PROGRAM_STUDI.map((item) => saveDocument('programStudi', item)) : []),
        ...(!semesters.length ? INITIAL_SEMESTER.map((item) => saveDocument('semesters', item)) : []),
        ...(!classes.length ? INITIAL_KELAS.map((item) => saveDocument('classes', item)) : []),
      ]);
      await saveDocument('users', { id: 'admin-initial', name: 'Administrator', username: 'admin', email: 'admin@example.com', role: 'admin', isActive: true, createdAt: new Date().toISOString() });
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : 'Gagal membuat data awal.');
    } finally { setSettingUp(false); }
  };

  if (firestoreError) return <div style={{ padding: 24 }}>Firestore gagal diakses: {firestoreError}. Periksa konfigurasi Firebase dan Rules, lalu muat ulang halaman.</div>;
  if (!firestoreReady) return <div style={{ padding: 24 }}>Menghubungkan ke Firestore...</div>;
  if (users.length === 0) return <div style={{ padding: 24 }}><p>Belum ada akun di Firestore. Buat akun administrator dan data dasar untuk memulai.</p><button type="button" disabled={settingUp} onClick={() => void setupDemo()}>{settingUp ? 'Menyimpan...' : 'Buat data awal'}</button>{setupError && <p>Gagal menyimpan: {setupError}</p>}</div>;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activePeriod,
        setActivePeriod,
        activePage,
        setActivePage,
        selectedPenawaranId,
        setSelectedPenawaranId,
        users,
        programStudi,
        semesters,
        classes,
        courses,
        offerings,
        students,
        enrollments,
        weights,
        grades,
        verificationHistory,
        feedback,
        feedbackModalOpen,
        openFeedbackModal,
        closeFeedbackModal,
        login,
        quickLogin,
        logout,
        addStudent,
        updateStudent,
        deleteStudent,
        addCourse,
        updateCourse,
        deleteCourse,
        addOffering,
        updateOffering,
        deleteOffering,
        enrollStudent,
        unenrollStudent,
        saveWeights,
        saveGrade,
        verifyGrade,
        cancelVerification,
        decideGradeRevision,
        updateDosenAccount,
        updateOwnProfile,
        submitFeedback,
        resetToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
