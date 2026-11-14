import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { averageIncludingMissing, calculateGrade } from '../../utils/gradeCalculation';
import { Award, BookOpen, GraduationCap, Search, TrendingUp } from 'lucide-react';

export const MahasiswaDashboard: React.FC = () => {
  const { currentUser, students, enrollments, offerings, courses, classes, semesters, users, weights, grades } = useApp();
  const [query, setQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  const student = students.find((item) => item.userId === currentUser?.id || item.npm === currentUser?.npm);
  const courseRows = useMemo(() => {
    if (!student) return [];
    return enrollments.filter((enrollment) => enrollment.npm === student.npm).map((enrollment) => {
      const offering = offerings.find((item) => item.id === enrollment.penawaranId);
      const course = courses.find((item) => item.id === offering?.mataKuliahId);
      const classInfo = classes.find((item) => item.id === offering?.kelasId);
      const semester = semesters.find((item) => item.id === offering?.semesterId);
      const lecturer = users.find((item) => item.id === offering?.dosenId);
      const grade = grades.find((item) => item.pesertaId === enrollment.id);
      const weight = weights.find((item) => item.penawaranId === offering?.id);
      const isRevisionBeingEdited = grade?.statusPermintaanRevisi === 'Diizinkan Revisi' && grade.statusVerifikasi !== 'Terverifikasi';
      const isVerified = grade?.statusVerifikasi === 'Terverifikasi' && !isRevisionBeingEdited;
      const computed = weight ? calculateGrade(grade?.nilaiTugas, grade?.nilaiUTS, grade?.nilaiUAS, {
        tugas: weight.bobotTugas,
        uts: weight.bobotUTS,
        uas: weight.bobotUAS
      }, isVerified) : null;
      const status = isVerified && grade?.statusPermintaanRevisi === 'Menunggu Persetujuan'
        ? 'Menunggu Persetujuan Revisi'
        : grade?.statusPermintaanRevisi === 'Diizinkan Revisi'
          ? 'Diizinkan Revisi'
          : grade?.statusPermintaanRevisi === 'Ditolak'
            ? 'Revisi Ditolak · Nilai Tetap'
          : isVerified
            ? 'Terverifikasi'
            : computed?.nilaiAkhir !== null && computed?.nilaiAkhir !== undefined
              ? 'Belum Diverifikasi'
            : grade?.statusVerifikasi === 'Belum Lengkap'
              ? 'Nilai Belum Lengkap'
              : 'Nilai Belum Tersedia';
      return {
        enrollment, offering, course, classInfo, semester, lecturer, grade,
        nilaiAkhir: computed?.nilaiAkhir ?? null,
        nilaiHuruf: computed?.nilaiHuruf ?? null,
        isVerified, status
      };
    });
  }, [student, enrollments, offerings, courses, classes, semesters, users, grades, weights]);

  const verifiedRows = courseRows.filter((row) => row.isVerified && row.nilaiAkhir !== null);
  const completedRows = courseRows.filter((row) => row.nilaiAkhir !== null);
  const average = averageIncludingMissing(courseRows.map((row) => row.nilaiAkhir));
  const filteredRows = courseRows.filter((row) => {
    const matchesQuery = `${row.course?.namaMK} ${row.course?.kodeMK} ${row.lecturer?.name}`.toLowerCase().includes(query.toLowerCase());
    const matchesSemester = semesterFilter === 'all' || row.offering?.semesterId === semesterFilter;
    return matchesQuery && matchesSemester;
  });
  const selected = courseRows.find((row) => row.enrollment.id === selectedEnrollmentId);
  const summary = [
    { label: 'Mata kuliah diikuti', value: courseRows.length, icon: BookOpen, style: 'bg-blue-100 text-blue-700' },
    { label: 'Nilai terverifikasi', value: verifiedRows.length, icon: Award, style: 'bg-emerald-100 text-emerald-700' },
    { label: 'Rata-rata nilai akhir', value: average === null ? '—' : `${average.toFixed(2)}%`, icon: TrendingUp, style: 'bg-indigo-100 text-indigo-700' },
    { label: 'Nilai belum tersedia', value: courseRows.filter((row) => row.nilaiAkhir === null).length, icon: GraduationCap, style: 'bg-amber-100 text-amber-700' }
  ];

  if (currentUser?.role !== 'mahasiswa') return <div className="rounded-2xl bg-white p-6 text-sm text-slate-600">Dashboard ini khusus mahasiswa.</div>;
  if (!student) return <div className="rounded-2xl bg-white p-6 text-sm text-slate-600">Data mahasiswa untuk akun ini belum terhubung. Hubungi administrator.</div>;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-[#367FA9]">PORTAL AKADEMIK MAHASISWA</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Halo, {student.nama}</h2>
          <p className="mt-1 text-xs text-slate-500">NPM {student.npm} · Ringkasan mata kuliah dan hasil studi Anda.</p>
        </div>
        <span className="rounded-xl border border-white bg-white/75 px-3 py-2 text-xs font-bold text-slate-600">Data akademik pribadi</span>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Ringkasan studi">
        {summary.map(({ label, value, icon: Icon, style }) => (
          <article key={label} className="motion-card rounded-[24px] border border-white/90 bg-white/80 p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style}`}><Icon className="h-5 w-5" /></div>
            <p className="mt-4 text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[28px] border border-white/90 bg-white/80 p-5 md:p-7 shadow-sm">
          <h3 className="font-extrabold text-slate-900">Grafik Nilai Mata Kuliah</h3>
          <p className="mt-1 text-xs text-slate-500">Nilai lengkap ditampilkan termasuk yang belum diverifikasi.</p>
          {completedRows.length ? <div className="mt-5 space-y-4">
            {completedRows.map((row) => <div key={row.enrollment.id}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-slate-700">{row.course?.namaMK}</span>
                <span className="shrink-0 font-mono font-bold text-slate-900">{row.nilaiAkhir?.toFixed(2)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#3C8DBC] to-emerald-500" style={{ width: `${Math.max(0, Math.min(100, row.nilaiAkhir || 0))}%` }} /></div>
            </div>)}
          </div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">Belum ada nilai lengkap untuk ditampilkan.</div>}
        </div>
        <div className="rounded-[28px] border border-white/90 bg-white/80 p-5 md:p-7 shadow-sm">
          <h3 className="font-extrabold text-slate-900">Rata-rata Nilai</h3>
          <p className="mt-1 text-xs text-slate-500">Nilai yang belum lengkap dihitung 0 dalam rata-rata.</p>
          <div className="mx-auto mt-6 flex h-40 w-40 items-center justify-center rounded-full" style={{ background: `conic-gradient(#10b981 ${average ?? 0}%, #e2e8f0 0)` }}>
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white text-center">
              <span className="text-3xl font-black text-slate-900">{average === null ? '—' : average.toFixed(2)}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{average === null ? 'Belum ada nilai' : 'persen'}</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500">{completedRows.length} dari {courseRows.length} mata kuliah memiliki nilai lengkap.</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/90 bg-white/80 p-5 md:p-7 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div><h3 className="font-extrabold text-slate-900">Mata Kuliah Saya</h3><p className="mt-1 text-xs text-slate-500">Daftar kelas yang terhubung dengan NPM Anda.</p></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari mata kuliah atau dosen" className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:w-64" /></label>
            <select value={semesterFilter} onChange={(event) => setSemesterFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
              <option value="all">Semua semester</option>{semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.namaSemester}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="p-3">Mata Kuliah</th><th className="p-3">Semester</th><th className="p-3">Kelas</th><th className="p-3">Dosen Pengampu</th><th className="p-3">Nilai</th><th className="p-3">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => <tr key={row.enrollment.id} onClick={() => setSelectedEnrollmentId(row.enrollment.id)} className="cursor-pointer hover:bg-blue-50/60">
                <td className="p-3"><strong className="block text-slate-800">{row.course?.namaMK}</strong><span className="font-mono text-[10px] text-slate-400">{row.course?.kodeMK}</span></td>
                <td className="p-3">{row.semester?.namaSemester || '—'}</td><td className="p-3">{row.classInfo?.kodeKelas || '—'}</td><td className="p-3">{row.lecturer?.name || '—'}</td>
                <td className="p-3 font-mono font-bold">{row.nilaiAkhir === null ? '—' : row.nilaiAkhir.toFixed(2)}</td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${row.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{row.status}</span></td>
              </tr>)}
              {filteredRows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Tidak ada mata kuliah yang sesuai.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center" onClick={() => setSelectedEnrollmentId(null)}>
        <section role="dialog" aria-modal="true" aria-labelledby="course-detail-title" className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">Detail mata kuliah</p><h3 id="course-detail-title" className="mt-1 text-lg font-black text-slate-900">{selected.course?.namaMK}</h3></div><button onClick={() => setSelectedEnrollmentId(null)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Tutup detail">✕</button></div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-xs"><div><dt className="text-slate-400">Dosen pengampu</dt><dd className="mt-1 font-bold text-slate-800">{selected.lecturer?.name || '—'}</dd></div><div><dt className="text-slate-400">Kelas</dt><dd className="mt-1 font-bold text-slate-800">{selected.classInfo?.kodeKelas || '—'}</dd></div><div><dt className="text-slate-400">Semester</dt><dd className="mt-1 font-bold text-slate-800">{selected.semester?.namaSemester || '—'}</dd></div><div><dt className="text-slate-400">Nilai final</dt><dd className="mt-1 font-bold text-slate-800">{selected.nilaiAkhir === null ? 'Belum tersedia' : `${selected.nilaiAkhir.toFixed(2)} (${selected.nilaiHuruf || '—'})`}</dd></div><div className="col-span-2"><dt className="text-slate-400">Status</dt><dd className="mt-1 font-bold text-slate-800">{selected.status}</dd></div></dl>
          <p className="mt-5 text-[11px] text-slate-500">Informasi ini hanya dapat dilihat oleh pemilik akun mahasiswa.</p>
        </section>
      </div>}
    </div>
  );
};
