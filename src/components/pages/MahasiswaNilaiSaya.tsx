import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { averageIncludingMissing, calculateGrade } from '../../utils/gradeCalculation';
import { CampusLogo } from '../layout/CampusLogo';
import {
  Award,
  GraduationCap,
  CheckCircle2,
  Clock,
  Lock,
  BookOpen,
  Info,
  Printer
} from 'lucide-react';
import { PaginationControls, paginate } from '../common/PaginationControls';
import { CourseGradeReport } from './CourseGradeReport';

export const MahasiswaNilaiSaya: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [printEnrollmentId, setPrintEnrollmentId] = useState<string | null>(null);
  const {
    currentUser,
    students,
    enrollments,
    offerings,
    courses,
    classes,
    programStudi,
    semesters,
    weights,
    grades,
    users
  } = useApp();

  // Find active student info
  const student = students.find((s) => s.npm === currentUser?.npm || s.userId === currentUser?.id);
  if (!student) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">Data mahasiswa untuk akun ini belum terhubung. Hubungi administrator.</div>;
  }
  const myNpm = student.npm;

  // Find all enrollments for this student
  const myEnrollments = enrollments.filter((e) => e.npm === myNpm);

  // Map each course with grade status
  const myCoursesWithGrades = myEnrollments.map((enr) => {
    const offering = offerings.find((o) => o.id === enr.penawaranId);
    const course = courses.find((c) => c.id === offering?.mataKuliahId);
    const kls = classes.find((k) => k.id === offering?.kelasId);
    const lecturer = users.find((u) => u.id === offering?.dosenId);
    const currentWeight = weights.find((w) => w.penawaranId === offering?.id);
    const gradeRecord = grades.find((g) => g.pesertaId === enr.id);

    const isVerified = gradeRecord?.statusVerifikasi === 'Terverifikasi';

    const computed = currentWeight ? calculateGrade(
      gradeRecord?.nilaiTugas,
      gradeRecord?.nilaiUTS,
      gradeRecord?.nilaiUAS,
      {
        tugas: currentWeight.bobotTugas,
        uts: currentWeight.bobotUTS,
        uas: currentWeight.bobotUAS
      },
      isVerified
    ) : null;

    return {
      enrollment: enr,
      offering,
      course,
      kls,
      lecturer,
      weights: currentWeight,
      gradeRecord,
      isVerified,
      nilaiAkhir: computed?.nilaiAkhir ?? null,
      nilaiHuruf: computed?.nilaiHuruf ?? null,
      tugas: gradeRecord?.nilaiTugas,
      uts: gradeRecord?.nilaiUTS,
      uas: gradeRecord?.nilaiUAS
    };
  });

  const rataRataNilai = averageIncludingMissing(myCoursesWithGrades.map((course) => course.nilaiAkhir));
  const visibleCourses = paginate(myCoursesWithGrades, page, pageSize);
  const printableCourse = myCoursesWithGrades.find((item) => item.enrollment.id === printEnrollmentId);
  const program = programStudi.find((item) => item.id === student.prodiId);
  const semester = semesters.find((item) => item.id === student.semesterId);
  const studentClass = classes.find((item) => item.id === student.kelasAsalId);
  const periods = [...new Set(myCoursesWithGrades.map((item) => item.offering?.periodeAkademik).filter((value): value is string => Boolean(value)))];
  const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  React.useEffect(() => {
    if (!printEnrollmentId) return;
    const timer = window.setTimeout(() => window.print(), 100);
    const clearPrintTarget = () => setPrintEnrollmentId(null);
    window.addEventListener('afterprint', clearPrintTarget);
    return () => { window.clearTimeout(timer); window.removeEventListener('afterprint', clearPrintTarget); };
  }, [printEnrollmentId]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Top Profile Glass Card */}
      <div className="no-print bg-white/80 backdrop-blur-2xl rounded-[28px] p-8 border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-[#3C8DBC] to-[#045A8C] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/25 ring-4 ring-white/90">
            {student.nama.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{student.nama}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100/90 text-purple-700 border border-purple-200/50 shadow-2xs">
                Mahasiswa Aktif
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono mt-1">
              NPM: <strong className="text-slate-900">{student.npm}</strong> • {program?.namaProdi || 'Program studi belum tersedia'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Universitas Handayani Makassar • Semester Ganjil 2026/2027
            </p>
          </div>
        </div>

        {/* Nilai akhir rata-rata */}
        <div className="flex items-center space-x-3.5 self-start md:self-auto">
          <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-center min-w-[150px] shadow-2xs">
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Rata-rata Nilai</div>
            <div className="text-3xl font-black text-blue-900 mt-0.5">{rataRataNilai === null ? '—' : `${rataRataNilai.toFixed(2)}%`}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dari {myCoursesWithGrades.length} mata kuliah</div>
          </div>

        </div>
      </div>

      {/* Notice about Grade Privacy & Verification Rule */}
      <div className="no-print p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/90 text-slate-700 text-xs flex items-start space-x-3 shadow-2xs">
        <Info className="w-5 h-5 text-[#3C8DBC] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          Nilai lengkap yang belum diverifikasi ditampilkan sebagai nilai sementara. Mata kuliah yang nilainya belum lengkap ditampilkan dengan tanda “-” dan dihitung sebagai 0 dalam rata-rata.
        </div>
      </div>

      {/* Course Cards / List */}
      <div className="no-print space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-slate-800">
            Mata Kuliah Semester Ini ({myCoursesWithGrades.length} Mata Kuliah)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleCourses.map((item) => (
            <div
              key={item.enrollment.id}
              className={`bg-white/80 backdrop-blur-2xl rounded-[28px] p-7 border transition-all ${
                item.isVerified
                  ? 'border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] hover:shadow-xl'
                  : 'border-white/80 bg-white/60 shadow-[0_10px_35px_rgba(4,90,140,0.04)]'
              }`}
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-blue-100/80 text-[#045A8C] border border-blue-200/50 shadow-2xs">
                  {item.course?.kodeMK}
                </span>

                {item.isVerified && item.gradeRecord?.statusPermintaanRevisi === 'Menunggu Persetujuan' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Menunggu Persetujuan Revisi</span>
                ) : item.isVerified && item.gradeRecord?.statusPermintaanRevisi === 'Diizinkan Revisi' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Dalam Proses Revisi</span>
                ) : item.isVerified && item.gradeRecord?.statusPermintaanRevisi === 'Ditolak' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">Revisi Ditolak · Nilai Tetap</span>
                ) : item.isVerified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Terverifikasi Resmi
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100/90 text-amber-800 border border-amber-200 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    {item.nilaiAkhir !== null ? 'Belum Diverifikasi' : 'Nilai Belum Tersedia'}
                  </span>
                )}
              </div>

              <h4 className="font-extrabold text-lg text-slate-900 leading-snug">
                {item.course?.namaMK}
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {item.course?.sks} SKS • Kelas {item.kls?.kodeKelas} • Dosen: {item.lecturer?.name}
              </p>

              {/* Verified Grade Display */}
              {item.nilaiAkhir !== null ? (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Nilai Akhir</div>
                      <div className="text-3xl font-black text-blue-900">
                        {item.nilaiAkhir?.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Nilai Huruf</div>
                      <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-md shadow-emerald-500/20">
                        {item.nilaiHuruf}
                      </div>
                    </div>
                  </div>

                  {/* Components breakdown */}
                  <div className="mt-4 grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-center text-xs shadow-2xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Tugas ({item.weights?.bobotTugas ?? '—'}%)</div>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">{item.tugas?.toFixed(1) ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">UTS ({item.weights?.bobotUTS ?? '—'}%)</div>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">{item.uts?.toFixed(1) ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">UAS ({item.weights?.bobotUAS ?? '—'}%)</div>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">{item.uas?.toFixed(1) ?? '-'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unverified Locked State */
                <div className="mt-5 pt-4 border-t border-slate-100 p-5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 text-center shadow-2xs">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400 shadow-2xs">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Dalam Proses Penilaian</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Komponen nilai sedang diolah atau belum disetujui dosen pengampu.
                  </p>
                </div>
              )}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setPrintEnrollmentId(item.enrollment.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-[#045A8C] transition-colors hover:bg-blue-100">
                  <Printer className="h-4 w-4" /> Cetak Nilai Mata Kuliah
                </button>
              </div>
            </div>
          ))}
        </div>
        <PaginationControls page={page} pageSize={pageSize} totalItems={myCoursesWithGrades.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} itemLabel="mata kuliah" />
      </div>

      {printableCourse && <CourseGradeReport offering={printableCourse.offering} course={printableCourse.course} classInfo={printableCourse.kls} lecturer={printableCourse.lecturer} enrollments={[printableCourse.enrollment]} students={[student]} grades={printableCourse.gradeRecord ? [printableCourse.gradeRecord] : []} weight={printableCourse.weights} />}

      {/* Laporan cetak */}
      <div className="hidden" aria-hidden="true">
        <header className="khs-letterhead">
          <CampusLogo className="khs-logo" />
          <div className="khs-letterhead-text">
            <div className="khs-foundation">YAYASAN PENDIDIKAN HANDAYANI MAKASSAR</div>
            <div className="khs-university">UNIVERSITAS HANDAYANI MAKASSAR</div>
            <div className="khs-accreditation">STATUS TERAKREDITASI</div>
            <div>JL. ADYAKSA BARU, NO. 1, TELP. (0411) 4673395, MAKASSAR, SULAWESI SELATAN 90231</div>
            <div>WEBSITE: www.handayani.ac.id <span className="khs-contact-gap">e-mail: info@handayani.ac.id</span></div>
          </div>
        </header>

        <h1 className="khs-title">KARTU HASIL STUDI</h1>
        <div className="khs-identity">
          <dl>
            <div><dt>NIM</dt><dd>{student.npm}</dd></div>
            <div><dt>Nama</dt><dd>{student.nama}</dd></div>
            <div><dt>Program Studi</dt><dd>{program?.namaProdi || '—'}</dd></div>
          </dl>
          <dl>
            <div><dt>Tahun akademik</dt><dd>{periods.length ? periods.join(', ') : '—'}</dd></div>
            <div><dt>Semester</dt><dd>{semester?.nomorSemester ?? '—'}</dd></div>
            <div><dt>Kelas</dt><dd>{studentClass?.kodeKelas || '—'}</dd></div>
          </dl>
        </div>

        <table className="khs-table">
          <thead><tr>
            <th>No.</th><th>Kd. Matkul</th><th>Nama Matkul</th><th>Nama Dosen</th><th>Nilai</th>
          </tr></thead>
          <tbody>
            {myCoursesWithGrades.map((c, i) => (
              <tr key={c.enrollment.id}>
                <td className="khs-center">{i + 1}</td>
                <td>{c.course?.kodeMK || '—'}</td>
                <td>{c.course?.namaMK || '—'}</td>
                <td>{c.lecturer?.name || '—'}</td>
                <td className="khs-center">{c.nilaiHuruf ?? '—'}</td>
              </tr>
            ))}
            {myCoursesWithGrades.length === 0 && <tr><td colSpan={5} className="khs-center">Belum ada mata kuliah yang diikuti.</td></tr>}
          </tbody>
        </table>

        <div className="khs-bottom">
          <div className="khs-summary">
            <div className="khs-summary-title">RINGKASAN RATA-RATA NILAI</div>
            <div className="khs-summary-value">{rataRataNilai === null ? '—' : `${rataRataNilai.toFixed(2)}%`}</div>
            <p>Nilai belum lengkap dihitung 0 dalam rata-rata.</p>
          </div>
          <div className="khs-signature">
            <p>Makassar, {printDate}</p>
            <p>Ketua Program Studi{program?.namaProdi ? ` ${program.namaProdi}` : ''}</p>
            <div className="khs-signature-space" />
            <p className="khs-signature-line">Dr. Eng. Ir. Hazriani, S.Kom., M.T.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
