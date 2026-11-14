import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, UserPlus, Trash2, CheckCircle2, AlertCircle, Search } from 'lucide-react';

export const PesertaManagement: React.FC = () => {
  const {
    offerings,
    courses,
    classes,
    students,
    enrollments,
    enrollStudent,
    unenrollStudent,
    selectedPenawaranId,
    setSelectedPenawaranId
  } = useApp();

  const activeOfferingId = selectedPenawaranId || (offerings[0]?.id ?? '');
  const activeOffering = offerings.find((o) => o.id === activeOfferingId) || offerings[0];
  const activeCourse = courses.find((c) => c.id === activeOffering?.mataKuliahId);
  const activeClass = classes.find((c) => c.id === activeOffering?.kelasId);

  // Enrolled students in current offering
  const classEnrollments = enrollments.filter((e) => e.penawaranId === activeOfferingId);

  // Available students not yet enrolled in this offering
  const enrolledNpms = new Set(classEnrollments.map((e) => e.npm));
  const availableStudents = students.filter((s) => !enrolledNpms.has(s.npm));

  const [selectedNpm, setSelectedNpm] = useState(availableStudents[0]?.npm || '');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!selectedNpm) {
      setErrorMessage('Pilih mahasiswa yang akan didaftarkan.');
      return;
    }

    const res = enrollStudent(activeOfferingId, selectedNpm);
    if (res.success) {
      setActionNotice(`Mahasiswa dengan NPM ${selectedNpm} berhasil didaftarkan ke kelas.`);
      setTimeout(() => setActionNotice(null), 3000);
      // update select
      const remaining = availableStudents.filter((s) => s.npm !== selectedNpm);
      if (remaining.length > 0) setSelectedNpm(remaining[0].npm);
    } else {
      setErrorMessage(res.error || 'Gagal mendaftarkan mahasiswa.');
    }
  };

  const handleUnenroll = (enrollmentId: string, name: string) => {
    if (confirm(`Keluarkan ${name} dari kelas ini?`)) {
      const res = unenrollStudent(enrollmentId);
      if (res.success) {
        setActionNotice('Pendaftaran peserta berhasil dibatalkan.');
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        alert(res.error || 'Gagal membatalkan pendaftaran.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Pengelolaan Peserta Mata Kuliah
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#045A8C]">
              FR-04
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftarkan NPM mahasiswa master ke kelas penawaran spesifik. Setiap kelas terpisah dan bebas duplikasi.
          </p>
        </div>

        {/* Offering selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-600">Pilih Kelas:</label>
          <select
            value={activeOfferingId}
            onChange={(e) => setSelectedPenawaranId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden shadow-xs cursor-pointer"
          >
            {offerings.map((off) => {
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

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Enroll Form */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-8">
        <h3 className="font-extrabold text-sm text-slate-800 mb-1">
          Daftarkan Mahasiswa ke {activeCourse?.kodeMK} ({activeClass?.kodeKelas})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Pilih mahasiswa yang belum terdaftar di kelas penawaran ini.
        </p>

        {availableStudents.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs font-medium">
            Semua mahasiswa yang ada di master telah terdaftar pada kelas ini.
          </div>
        ) : (
          <form onSubmit={handleEnroll} className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedNpm}
              onChange={(e) => setSelectedNpm(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3C8DBC] focus:outline-hidden"
            >
              {availableStudents.map((s) => (
                <option key={s.id} value={s.npm}>
                  {s.npm} - {s.nama}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan ke Kelas</span>
            </button>
          </form>
        )}
      </div>

      {/* Enrolled Students Table */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-8">
        <h3 className="font-extrabold text-sm text-slate-800 mb-4">
          Peserta Aktif di Kelas Ini ({classEnrollments.length} Mahasiswa)
        </h3>

        {classEnrollments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Belum ada peserta yang didaftarkan.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">NO</th>
                  <th className="py-3 px-3">NPM</th>
                  <th className="py-3 px-3">NAMA MAHASISWA</th>
                  <th className="py-3 px-3">EMAIL KAMPUS</th>
                  <th className="py-3 px-3">TANGGAL PENDAFTARAN</th>
                  <th className="py-3 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classEnrollments.map((enr, idx) => {
                  const student = students.find((s) => s.npm === enr.npm);
                  return (
                    <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#045A8C]">{enr.npm}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{student?.nama || 'Mahasiswa'}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{student?.email}</td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {new Date(enr.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleUnenroll(enr.id, student?.nama || enr.npm)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Hapus dari kelas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
