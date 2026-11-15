import React from 'react';
import { CampusLogo } from '../layout/CampusLogo';
import { calculateGrade } from '../../utils/gradeCalculation';
import type { BobotNilai, Kelas, Mahasiswa, MataKuliah, NilaiMahasiswa, PenawaranMataKuliah, PesertaMataKuliah, User } from '../../types';

interface CourseGradeReportProps {
  offering?: PenawaranMataKuliah;
  course?: MataKuliah;
  classInfo?: Kelas;
  lecturer?: User;
  enrollments: PesertaMataKuliah[];
  students: Mahasiswa[];
  grades: NilaiMahasiswa[];
  weight?: BobotNilai;
}

export const CourseGradeReport: React.FC<CourseGradeReportProps> = ({ offering, course, classInfo, lecturer, enrollments, students, grades, weight }) => {
  const currentWeight = weight || { bobotTugas: 30, bobotUTS: 30, bobotUAS: 40 };
  const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return <article className="print-only course-grade-report">
    <header className="course-report-header">
      <CampusLogo className="course-report-logo" />
      <div>
        <p className="course-report-eyebrow">UNIVERSITAS HANDAYANI MAKASSAR</p>
        <h1>Laporan Nilai Mata Kuliah {course?.namaMK || 'Mata Kuliah'}</h1>
        <p className="course-report-subtitle">Rekapitulasi hasil penilaian peserta perkuliahan</p>
      </div>
      <div className="course-report-code"><strong>{course?.kodeMK || 'MK'}</strong><span>{course?.sks || 0} SKS</span></div>
    </header>

    <section className="course-report-meta">
      <div><span>Mata Kuliah</span><strong>{course?.namaMK || '—'}</strong></div>
      <div><span>Kelas</span><strong>{classInfo?.kodeKelas || '—'}</strong></div>
      <div><span>Dosen Pengampu</span><strong>{lecturer?.name || '—'}</strong></div>
      <div><span>Periode Akademik</span><strong>{offering?.periodeAkademik || '—'}</strong></div>
    </section>

    <table className="course-report-table">
      <thead><tr><th>No.</th><th>NPM</th><th>Nama Mahasiswa</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>Nilai Akhir</th><th>Nilai Huruf</th></tr></thead>
      <tbody>
        {enrollments.map((enrollment, index) => {
          const student = students.find((item) => item.npm === enrollment.npm);
          const grade = grades.find((item) => item.pesertaId === enrollment.id);
          const computed = calculateGrade(grade?.nilaiTugas ?? null, grade?.nilaiUTS ?? null, grade?.nilaiUAS ?? null, { tugas: currentWeight.bobotTugas, uts: currentWeight.bobotUTS, uas: currentWeight.bobotUAS }, grade?.statusVerifikasi === 'Terverifikasi');
          return <tr key={enrollment.id}>
            <td>{index + 1}</td><td>{enrollment.npm}</td><td>{student?.nama || '—'}</td>
            <td>{grade?.nilaiTugas ?? '—'}</td><td>{grade?.nilaiUTS ?? '—'}</td><td>{grade?.nilaiUAS ?? '—'}</td>
            <td className="course-report-score">{computed.nilaiAkhir === null ? '—' : computed.nilaiAkhir.toFixed(2)}</td>
            <td className="course-report-letter">{computed.nilaiHuruf || '—'}</td>
          </tr>;
        })}
        {enrollments.length === 0 && <tr><td colSpan={8} className="course-report-empty">Belum ada peserta pada kelas mata kuliah ini.</td></tr>}
      </tbody>
    </table>

    <section className="course-report-weights">
      <div><span>Bobot Tugas</span><strong>{currentWeight.bobotTugas}%</strong></div>
      <div><span>Bobot UTS</span><strong>{currentWeight.bobotUTS}%</strong></div>
      <div><span>Bobot UAS</span><strong>{currentWeight.bobotUAS}%</strong></div>
      <div className="course-report-weight-total"><span>Total Bobot</span><strong>{currentWeight.bobotTugas + currentWeight.bobotUTS + currentWeight.bobotUAS}%</strong></div>
    </section>
    <p className="course-report-note">Nilai kosong menunjukkan komponen belum diinput dosen. Nilai huruf E tampil apabila nilai akhir hasil input bernilai pada rentang E.</p>

    <footer className="course-report-signatures">
      <div><p>Mengetahui,</p><span>Ketua Program Studi</span><div className="course-report-sign-space" /><strong>Dr. Eng. Ir. Hazriani, S.Kom., M.T.</strong></div>
      <div><p>Makassar, {printDate}</p><span>Dosen Pengampu</span><div className="course-report-sign-space" /><strong>{lecturer?.name || '—'}</strong></div>
    </footer>
  </article>;
};
