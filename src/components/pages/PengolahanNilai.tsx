import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateGrade,
  validateWeights,
  GradeWeights
} from '../../utils/gradeCalculation';
import {
  Award,
  Unlock,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Sliders,
  Save,
  CheckCircle2,
  FileText,
  UserCheck,
  History,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { GradeRevisionQueue } from './GradeRevisionQueue';
import { AdminWeightManagement } from './AdminWeightManagement';
import { PaginationControls, paginate } from '../common/PaginationControls';

export const PengolahanNilai: React.FC = () => {
  const {
    offerings,
    courses,
    classes,
    students,
    enrollments,
    weights,
    grades,
    verificationHistory,
    currentUser,
    selectedPenawaranId,
    setSelectedPenawaranId,
    saveWeights,
    saveGrade,
    verifyGrade,
    cancelVerification,
    setActivePage
  } = useApp();

  // Selected offering
  const availableOfferings = currentUser?.role === 'dosen'
    ? offerings.filter((offering) => offering.dosenId === currentUser.id)
    : offerings;
  const activeOfferingId = availableOfferings.some((offering) => offering.id === selectedPenawaranId)
    ? selectedPenawaranId as string
    : (availableOfferings[0]?.id ?? '');
  const activeOffering = availableOfferings.find((o) => o.id === activeOfferingId);
  const activeCourse = courses.find((c) => c.id === activeOffering?.mataKuliahId);
  const activeClass = classes.find((c) => c.id === activeOffering?.kelasId);

  // Bobot configuration for active offering
  const currentWeightRecord = weights.find((w) => w.penawaranId === activeOfferingId) || {
    id: 'default',
    penawaranId: activeOfferingId,
    bobotTugas: 30,
    bobotUTS: 30,
    bobotUAS: 40,
    updatedAt: ''
  };

  const [tugasWeight, setTugasWeight] = useState<number>(currentWeightRecord.bobotTugas);
  const [utsWeight, setUtsWeight] = useState<number>(currentWeightRecord.bobotUTS);
  const [uasWeight, setUasWeight] = useState<number>(currentWeightRecord.bobotUAS);
  const [weightMessage, setWeightMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for mobile accordion card
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);

  // Modal for cancel verification
  const [cancelModalState, setCancelModalState] = useState<{ open: boolean; gradeId: string; studentName: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [gradeNotification, setGradeNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync weights when offering changes
  React.useEffect(() => {
    if (currentWeightRecord) {
      setTugasWeight(currentWeightRecord.bobotTugas);
      setUtsWeight(currentWeightRecord.bobotUTS);
      setUasWeight(currentWeightRecord.bobotUAS);
      setWeightMessage(null);
    }
  }, [activeOfferingId, currentWeightRecord.bobotTugas, currentWeightRecord.bobotUTS, currentWeightRecord.bobotUAS]);

  // Participants & grades in this offering
  const classEnrollments = enrollments.filter((e) => e.penawaranId === activeOfferingId);
  const classGrades = grades.filter((g) => g.penawaranId === activeOfferingId);
  const visibleEnrollments = paginate(classEnrollments, studentPage, studentPageSize);

  React.useEffect(() => { setStudentPage(1); setExpandedStudentId(null); }, [activeOfferingId]);

  // Total weight validation
  const weightVal = validateWeights(tugasWeight, utsWeight, uasWeight);

  // Save weights handler
  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setWeightMessage(null);

    const res = saveWeights(activeOfferingId, Number(tugasWeight), Number(utsWeight), Number(uasWeight));
    if (res.success) {
      setWeightMessage({
        type: 'success',
        text: 'Pengaturan bobot berhasil diperbarui! Perhitungan nilai otomatis telah disinkronkan.'
      });
      setTimeout(() => setWeightMessage(null), 4000);
    } else {
      setWeightMessage({
        type: 'error',
        text: res.error || 'Gagal menyimpan bobot penilaian.'
      });
    }
  };

  // Inline grade input change handler
  const handleScoreChange = (
    pesertaId: string,
    npm: string,
    field: 'tugas' | 'uts' | 'uas',
    rawVal: string,
    currentTugas: number | null,
    currentUts: number | null,
    currentUas: number | null
  ) => {
    let parsed: number | null = null;
    if (rawVal.trim() !== '') {
      const num = parseFloat(rawVal);
      if (isNaN(num) || num < 0 || num > 100) return;
      parsed = num;
    }

    const t = field === 'tugas' ? parsed : currentTugas;
    const u = field === 'uts' ? parsed : currentUts;
    const f = field === 'uas' ? parsed : currentUas;

    const result = saveGrade(pesertaId, activeOfferingId, npm, t, u, f);
    if (!result.success) setGradeNotification({ type: 'error', text: result.error || 'Nilai gagal disimpan.' });
  };

  // Verify single student
  const handleVerify = (gradeId: string, studentName: string) => {
    const res = verifyGrade(gradeId);
    if (res.success) {
      setGradeNotification({
        type: 'success',
        text: `Nilai akhir ${studentName} berhasil diverifikasi dan dikunci. Data kini telah dipublikasikan dan dapat dilihat oleh mahasiswa.`
      });
      setTimeout(() => setGradeNotification(null), 4000);
    } else {
      setGradeNotification({
        type: 'error',
        text: res.error || 'Gagal memverifikasi nilai.'
      });
    }
  };

  // Submit cancel verification
  const handleConfirmCancel = () => {
    if (!cancelModalState) return;
    const res = cancelVerification(cancelModalState.gradeId, cancelReason);
    if (res.success) {
      setGradeNotification({
        type: 'success',
        text: `Permintaan revisi ${cancelModalState.studentName} telah dikirim ke administrator.`
      });
      setCancelModalState(null);
      setCancelReason('');
      setTimeout(() => setGradeNotification(null), 4000);
    } else {
      alert(res.error || 'Gagal membatalkan verifikasi.');
    }
  };

  if (currentUser?.role === 'admin') {
    return <div className="space-y-5"><header><h2 className="text-xl font-black text-slate-900">Pengaturan Bobot & Persetujuan Revisi</h2><p className="mt-1 text-xs text-slate-500">Administrator dapat memperbarui bobot semua kelas, tanpa mengubah nilai komponen mahasiswa.</p></header><AdminWeightManagement /><GradeRevisionQueue /></div>;
  }
  if (currentUser?.role !== 'dosen') {
    return <div className="rounded-2xl bg-white p-6 text-sm text-slate-600">Halaman ini hanya tersedia untuk dosen dan administrator.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner & Offering Selector */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#045A8C] border border-[#bae6fd]">
              {activeCourse?.kodeMK || 'MK'} • {activeCourse?.sks || 3} SKS
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Kelas: {activeClass?.kodeKelas || 'S2-A'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            {activeCourse?.namaMK || 'Pengolahan Nilai'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola bobot persentase, input komponen nilai (Tugas, UTS, UAS), dan lakukan verifikasi individual.
          </p>
        </div>

        {/* Offering Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <label className="text-xs font-bold text-slate-600">Pilih Mata Kuliah & Kelas:</label>
          <select
            value={activeOfferingId}
            onChange={(e) => setSelectedPenawaranId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3C8DBC] focus:outline-hidden cursor-pointer shadow-xs"
          >
            {availableOfferings.map((off) => {
              const c = courses.find((item) => item.id === off.mataKuliahId);
              const k = classes.find((item) => item.id === off.kelasId);
              return (
                <option key={off.id} value={off.id}>
                  {c?.kodeMK} - {c?.namaMK} ({k?.kodeKelas})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Grade Notification Alert */}
      {gradeNotification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in backdrop-blur-md shadow-sm ${
            gradeNotification.type === 'success'
              ? 'bg-emerald-50/90 border border-emerald-200 text-emerald-800'
              : 'bg-red-50/90 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {gradeNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{gradeNotification.text}</span>
          </div>
          <button onClick={() => setGradeNotification(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Pengaturan bobot dalam kartu mata kuliah */}
      <div className="relative mt-6 pt-5 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#045A8C] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-slate-800">
                  Pengaturan Bobot Penilaian
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Total bobot Tugas + UTS + UAS wajib bernilai tepat 100%.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Unlock className="w-4 h-4 text-emerald-600" />
            <span>Bobot Dinamis (Dapat Diedit)</span>
          </div>
        </div>

        {/* Weight Feedback Message */}
        {weightMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
              weightMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {weightMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{weightMessage.text}</span>
          </div>
        )}

        {/* Weight Form */}
        <form onSubmit={handleSaveWeights} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Bobot Tugas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Bobot Tugas (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={tugasWeight}
                onChange={(e) => setTugasWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Bobot UTS */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Bobot UTS (Mid) (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={utsWeight}
                onChange={(e) => setUtsWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Bobot UAS */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Bobot UAS (Final) (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={uasWeight}
                onChange={(e) => setUasWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Total & Action Button */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex-1 p-2.5 rounded-xl border text-center ${
                weightVal.isValid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Bobot</div>
              <div className="text-sm font-black">
                {weightVal.total}% {weightVal.isValid ? '✓ Valid' : '✗ Wajib 100%'}
              </div>
            </div>

            <button
              type="submit"
              disabled={!weightVal.isValid}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] hover:from-[#2e6d92] hover:to-[#347ba4] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Bobot</span>
            </button>
          </div>
        </form>
      </div>
      </div>

      {/* TABEL PENILAIAN MAHASISWA (FR-05, FR-07, FR-08, FR-09) */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Daftar Penilaian Peserta Kelas ({classEnrollments.length} Mahasiswa)
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan nilai mentah (0 - 100). Perhitungan kontribusi dan nilai akhir diproses seketika.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Terverifikasi: {classGrades.filter((g) => g.statusVerifikasi === 'Terverifikasi').length}
            </span>
            <span className="flex items-center text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
              Menunggu: {classGrades.filter((g) => g.statusVerifikasi === 'Menunggu Verifikasi').length}
            </span>
          </div>
        </div>

        {classEnrollments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">Belum ada mahasiswa yang terdaftar di kelas penawaran ini.</p>
            <p className="text-[11px] text-slate-400 mt-1">Admin BAK dapat menambahkan mahasiswa melalui menu Peserta MK.</p>
          </div>
        ) : (
          <>
            {/* TAMPILAN DESKTOP & TABLET: Tabel Grid Lengkap */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">NPM</th>
                  <th className="py-3 px-3">NAMA MAHASISWA</th>
                  <th className="py-3 px-2 text-center w-24">TUGAS ({tugasWeight}%)</th>
                  <th className="py-3 px-2 text-center w-24">UTS ({utsWeight}%)</th>
                  <th className="py-3 px-2 text-center w-24">UAS ({uasWeight}%)</th>
                  <th className="py-3 px-2 text-center w-24">NILAI AKHIR</th>
                  <th className="py-3 px-2 text-center w-16">HURUF</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                  <th className="py-3 px-3 text-right">AKSI VERIFIKASI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleEnrollments.map((enrollment) => {
                  const student = students.find((s) => s.npm === enrollment.npm);
                  const gradeRecord = classGrades.find((g) => g.pesertaId === enrollment.id) || {
                    id: `temp-${enrollment.id}`,
                    pesertaId: enrollment.id,
                    penawaranId: activeOfferingId,
                    npm: enrollment.npm,
                    nilaiTugas: null,
                    nilaiUTS: null,
                    nilaiUAS: null,
                    statusVerifikasi: 'Belum Diisi',
                    updatedAt: ''
                  };

                  const computed = calculateGrade(
                    gradeRecord.nilaiTugas,
                    gradeRecord.nilaiUTS,
                    gradeRecord.nilaiUAS,
                    { tugas: tugasWeight, uts: utsWeight, uas: uasWeight },
                    gradeRecord.statusVerifikasi === 'Terverifikasi'
                  );

                  const isVerified = gradeRecord.statusVerifikasi === 'Terverifikasi' && gradeRecord.statusPermintaanRevisi !== 'Diizinkan Revisi';

                  return (
                    <tr
                      key={enrollment.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isVerified ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {enrollment.npm}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {student?.nama || 'Mahasiswa'}
                      </td>

                      {/* Tugas Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={isVerified}
                          placeholder="-"
                          value={gradeRecord.nilaiTugas !== null ? gradeRecord.nilaiTugas : ''}
                          onChange={(e) =>
                            handleScoreChange(
                              enrollment.id,
                              enrollment.npm,
                              'tugas',
                              e.target.value,
                              gradeRecord.nilaiTugas,
                              gradeRecord.nilaiUTS,
                              gradeRecord.nilaiUAS
                            )
                          }
                          className="w-20 text-center py-1.5 px-2 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold focus:ring-2 focus:ring-[#3C8DBC] focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>

                      {/* UTS Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={isVerified}
                          placeholder="-"
                          value={gradeRecord.nilaiUTS !== null ? gradeRecord.nilaiUTS : ''}
                          onChange={(e) =>
                            handleScoreChange(
                              enrollment.id,
                              enrollment.npm,
                              'uts',
                              e.target.value,
                              gradeRecord.nilaiTugas,
                              gradeRecord.nilaiUTS,
                              gradeRecord.nilaiUAS
                            )
                          }
                          className="w-20 text-center py-1.5 px-2 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold focus:ring-2 focus:ring-[#3C8DBC] focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>

                      {/* UAS Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={isVerified}
                          placeholder="-"
                          value={gradeRecord.nilaiUAS !== null ? gradeRecord.nilaiUAS : ''}
                          onChange={(e) =>
                            handleScoreChange(
                              enrollment.id,
                              enrollment.npm,
                              'uas',
                              e.target.value,
                              gradeRecord.nilaiTugas,
                              gradeRecord.nilaiUTS,
                              gradeRecord.nilaiUAS
                            )
                          }
                          className="w-20 text-center py-1.5 px-2 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold focus:ring-2 focus:ring-[#3C8DBC] focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>

                      {/* Nilai Akhir / Kontribusi Sementara */}
                      <td className="py-3 px-2 text-center">
                        {computed.isComplete ? (
                          <span className="font-mono font-black text-sm text-blue-700">
                            {computed.nilaiAkhir?.toFixed(2)}
                          </span>
                        ) : computed.kontribusiSementara > 0 ? (
                          <span className="font-mono text-xs text-amber-600 font-semibold" title="Kontribusi Sementara">
                            ~{computed.kontribusiSementara.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Nilai Huruf */}
                      <td className="py-3 px-2 text-center">
                        {computed.nilaiHuruf ? (
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                              computed.nilaiHuruf === 'A'
                                ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                                : computed.nilaiHuruf === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : computed.nilaiHuruf === 'C'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {computed.nilaiHuruf}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        {gradeRecord.statusPermintaanRevisi === 'Menunggu Persetujuan' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Menunggu Persetujuan</span>
                        ) : gradeRecord.statusPermintaanRevisi === 'Diizinkan Revisi' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Diizinkan Revisi</span>
                        ) : gradeRecord.statusPermintaanRevisi === 'Ditolak' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Ditolak · terkunci</span>
                        ) : computed.status === 'Terverifikasi' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Terverifikasi
                          </span>
                        ) : computed.status === 'Menunggu Verifikasi' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Menunggu Verifikasi
                          </span>
                        ) : computed.status === 'Belum Lengkap' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Belum Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Belum Diisi
                          </span>
                        )}
                      </td>

                      {/* Aksi Verifikasi / Batalkan */}
                      <td className="py-3 px-3 text-right">
                        {gradeRecord.statusPermintaanRevisi === 'Menunggu Persetujuan' ? (
                          <span className="text-[11px] font-semibold text-amber-700">Menunggu keputusan admin</span>
                        ) : isVerified ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCancelModalState({
                                open: true,
                                gradeId: gradeRecord.id,
                                studentName: student?.nama || enrollment.npm
                              })
                            }
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Ajukan Revisi</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!computed.canVerify}
                            onClick={() => handleVerify(gradeRecord.id, student?.nama || enrollment.npm)}
                            className="inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Verifikasi Nilai</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TAMPILAN MOBILE: Kartu Lipat Adaptif (Responsive Accordion Cards) */}
          <div className="md:hidden space-y-3">
            {visibleEnrollments.map((enrollment) => {
              const student = students.find((s) => s.npm === enrollment.npm);
              const gradeRecord = classGrades.find((g) => g.pesertaId === enrollment.id) || {
                id: `temp-${enrollment.id}`,
                pesertaId: enrollment.id,
                penawaranId: activeOfferingId,
                npm: enrollment.npm,
                nilaiTugas: null,
                nilaiUTS: null,
                nilaiUAS: null,
                statusVerifikasi: 'Belum Diisi',
                updatedAt: ''
              };

              const computed = calculateGrade(
                gradeRecord.nilaiTugas,
                gradeRecord.nilaiUTS,
                gradeRecord.nilaiUAS,
                { tugas: tugasWeight, uts: utsWeight, uas: uasWeight },
                gradeRecord.statusVerifikasi === 'Terverifikasi'
              );

              const isVerified = gradeRecord.statusVerifikasi === 'Terverifikasi' && gradeRecord.statusPermintaanRevisi !== 'Diizinkan Revisi';
              const isExpanded = expandedStudentId === enrollment.id;

              return (
                <div
                  key={enrollment.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isVerified
                      ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                      : isExpanded
                      ? 'bg-white/90 border-blue-200 shadow-md ring-2 ring-blue-500/10'
                      : 'bg-white/70 border-white/90 shadow-2xs'
                  }`}
                >
                  {/* Header Kartu - Tap to toggle accordion */}
                  <div
                    onClick={() => setExpandedStudentId(isExpanded ? null : enrollment.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-[#045A8C]'
                        }`}
                      >
                        {student?.nama ? student.nama.slice(0, 2).toUpperCase() : 'MH'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {student?.nama || 'Mahasiswa'}
                        </h4>
                        <p className="font-mono text-[11px] text-slate-500">
                          {enrollment.npm}
                        </p>
                      </div>
                    </div>

                    {/* Status & Huruf Kanan */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {computed.nilaiHuruf ? (
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                            computed.nilaiHuruf === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : computed.nilaiHuruf === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {computed.nilaiHuruf}
                        </span>
                      ) : null}

                      {isVerified ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Terverifikasi" />
                      ) : gradeRecord.statusVerifikasi === 'Menunggu Verifikasi' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" title="Menunggu Verifikasi" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Belum Lengkap" />
                      )}

                      <div className="p-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Quick Preview Saat Tertutup */}
                  {!isExpanded && (
                    <div className="px-3.5 pb-3 pt-0 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100/60 mt-1">
                      <div className="space-x-2 font-mono">
                        <span>T:{gradeRecord.nilaiTugas ?? '-'}</span>
                        <span>U:{gradeRecord.nilaiUTS ?? '-'}</span>
                        <span>A:{gradeRecord.nilaiUAS ?? '-'}</span>
                      </div>
                      <div className="font-bold text-slate-800 font-mono">
                        Akhir: {computed.nilaiAkhir !== null ? computed.nilaiAkhir.toFixed(2) : '-'}
                      </div>
                    </div>
                  )}

                  {/* Detail Yang Dibuka (Expanded Accordion) */}
                  {isExpanded && (
                    <div className="px-3.5 pb-4 pt-2 border-t border-slate-100 space-y-3 bg-white/50">
                      {/* 3 Form Inputs */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Tugas ({tugasWeight}%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            disabled={isVerified}
                            placeholder="0-100"
                            value={gradeRecord.nilaiTugas !== null ? gradeRecord.nilaiTugas : ''}
                            onChange={(e) =>
                              handleScoreChange(
                                enrollment.id,
                                enrollment.npm,
                                'tugas',
                                e.target.value,
                                gradeRecord.nilaiTugas,
                                gradeRecord.nilaiUTS,
                                gradeRecord.nilaiUAS
                              )
                            }
                            className="w-full text-center py-2 px-1 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold focus:ring-2 focus:ring-[#3C8DBC] disabled:bg-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            UTS ({utsWeight}%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            disabled={isVerified}
                            placeholder="0-100"
                            value={gradeRecord.nilaiUTS !== null ? gradeRecord.nilaiUTS : ''}
                            onChange={(e) =>
                              handleScoreChange(
                                enrollment.id,
                                enrollment.npm,
                                'uts',
                                e.target.value,
                                gradeRecord.nilaiTugas,
                                gradeRecord.nilaiUTS,
                                gradeRecord.nilaiUAS
                              )
                            }
                            className="w-full text-center py-2 px-1 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold focus:ring-2 focus:ring-[#3C8DBC] disabled:bg-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            UAS ({uasWeight}%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            disabled={isVerified}
                            placeholder="0-100"
                            value={gradeRecord.nilaiUAS !== null ? gradeRecord.nilaiUAS : ''}
                            onChange={(e) =>
                              handleScoreChange(
                                enrollment.id,
                                enrollment.npm,
                                'uas',
                                e.target.value,
                                gradeRecord.nilaiTugas,
                                gradeRecord.nilaiUTS,
                                gradeRecord.nilaiUAS
                              )
                            }
                            className="w-full text-center py-2 px-1 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold focus:ring-2 focus:ring-[#3C8DBC] disabled:bg-slate-100"
                          />
                        </div>
                      </div>

                      {/* Calculated Score Pill */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Nilai Akhir:</span>
                          <span className="font-extrabold text-sm text-slate-900 font-mono">
                            {computed.nilaiAkhir !== null
                              ? computed.nilaiAkhir.toFixed(2)
                              : computed.kontribusiSementara > 0
                              ? `~${computed.kontribusiSementara.toFixed(2)}`
                              : '-'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Huruf Mutu:</span>
                          <span className="font-black text-sm text-blue-700">
                            {computed.nilaiHuruf || '-'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Status:</span>
                          <span className="font-bold text-[11px] text-slate-700">
                            {gradeRecord.statusPermintaanRevisi || gradeRecord.statusVerifikasi}
                          </span>
                        </div>
                      </div>

                      {/* Verification Action Button */}
                      <div className="pt-1">
                        {gradeRecord.statusPermintaanRevisi === 'Menunggu Persetujuan' ? (
                          <div className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-800">Menunggu keputusan administrator</div>
                        ) : isVerified ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCancelModalState({
                                open: true,
                                gradeId: gradeRecord.id,
                                studentName: student?.nama || enrollment.npm
                              })
                            }
                            className="w-full py-2.5 px-3 rounded-xl text-amber-800 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Ajukan Perubahan Nilai</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!computed.canVerify}
                            onClick={() => handleVerify(gradeRecord.id, student?.nama || enrollment.npm)}
                            className="w-full py-2.5 px-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Verifikasi & Kunci Nilai</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <PaginationControls page={studentPage} pageSize={studentPageSize} totalItems={classEnrollments.length} onPageChange={setStudentPage} onPageSizeChange={(size) => { setStudentPageSize(size); setStudentPage(1); }} itemLabel="mahasiswa" />
        </>
      )}
      </div>

      {/* Riwayat Verifikasi (Audit Trail) */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-8">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#045A8C] flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Riwayat & Audit Log Verifikasi Nilai
            </h3>
            <p className="text-xs text-slate-500">
              Catatan historis tindakan verifikasi dan pembatalan nilai untuk akuntabilitas akademik.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">WAKTU</th>
                <th className="py-2.5 px-3">NPM MAHASISWA</th>
                <th className="py-2.5 px-3">AKSI</th>
                <th className="py-2.5 px-3">PELAKU</th>
                <th className="py-2.5 px-3">KETERANGAN / ALASAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {verificationHistory.filter((log) => log.penawaranId === activeOfferingId).slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{log.waktu}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{log.npm}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.aksi === 'Verifikasi'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {log.aksi}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-semibold">{log.userName}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {log.keterangan}
                    {log.nilaiSebelum && log.nilaiSesudah && <div className="mt-1 text-[10px] font-mono text-slate-500">Sebelum T/UTS/UAS: {log.nilaiSebelum.tugas ?? '—'}/{log.nilaiSebelum.uts ?? '—'}/{log.nilaiSebelum.uas ?? '—'} → Sesudah: {log.nilaiSesudah.tugas ?? '—'}/{log.nilaiSesudah.uts ?? '—'}/{log.nilaiSesudah.uas ?? '—'}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengajuan Revisi */}
      {cancelModalState && cancelModalState.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] max-w-md w-full p-6 md:p-8 shadow-[0_25px_60px_rgba(4,90,140,0.2)] border border-white/90">
            <div className="flex items-center space-x-2.5 text-amber-600 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">
                Ajukan Perubahan Nilai
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Permintaan revisi untuk <strong className="text-slate-900">{cancelModalState.studentName}</strong> akan dikirim ke administrator. Nilai tetap terkunci hingga permintaan disetujui.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alasan pengajuan revisi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Perbaikan nilai UAS setelah koreksi berkas ujian susulan."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 text-xs focus:ring-2 focus:ring-[#3C8DBC] focus:outline-hidden"
              />
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCancelModalState(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                Kirim Permintaan Revisi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
