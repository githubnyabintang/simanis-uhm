import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PenawaranMataKuliah } from '../../types';
import { Calendar, Plus, Trash2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const PenawaranManagement: React.FC = () => {
  const {
    offerings,
    courses,
    classes,
    programStudi,
    semesters,
    users,
    enrollments,
    addOffering,
    deleteOffering,
    setActivePage
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [mataKuliahId, setMataKuliahId] = useState(courses[0]?.id || '');
  const [prodiId, setProdiId] = useState(programStudi[0]?.id || '');
  const [semesterId, setSemesterId] = useState(semesters[0]?.id || '');
  const [kelasId, setKelasId] = useState(classes[0]?.id || '');
  const [dosenId, setDosenId] = useState(users.find((u) => u.role === 'dosen')?.id || '');
  const [ruang, setRuang] = useState('Lab Komputer 1');
  const [jadwal, setJadwal] = useState('Senin, 08:00 - 10:30 WITA');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const lecturers = users.filter((u) => u.role === 'dosen');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addOffering({
      mataKuliahId,
      prodiId,
      semesterId,
      kelasId,
      dosenId,
      periodeAkademik: '2026/2027 — Ganjil',
      ruang,
      jadwal,
      statusPublikasi: 'draft'
    });
    if (res.success) {
      setActionNotice('Penawaran kelas baru berhasil dibuat.');
      setModalOpen(false);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleDelete = (id: string, label: string) => {
    if (confirm(`Hapus kelas penawaran "${label}"?`)) {
      const res = deleteOffering(id);
      if (res.success) {
        setActionNotice('Kelas penawaran berhasil dihapus.');
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Periode & Kelas Perkuliahan (Penawaran MK)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#045A8C]">
              FR-03 & FR-04
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Relasi mata kuliah, program studi, semester, kelas, dan dosen pengampu pada periode berjalan.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buka Penawaran Kelas</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Grid of Offerings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {offerings.map((off) => {
          const course = courses.find((c) => c.id === off.mataKuliahId);
          const lecturer = users.find((u) => u.id === off.dosenId);
          const kls = classes.find((k) => k.id === off.kelasId);
          const prodi = programStudi.find((p) => p.id === off.prodiId);
          const classStudents = enrollments.filter((e) => e.penawaranId === off.id);

          return (
            <div
              key={off.id}
              className="rounded-[26px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_10px_35px_rgba(4,90,140,0.06)] hover:shadow-[0_16px_40px_rgba(4,90,140,0.12)] p-6 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#045A8C]">
                    {course?.kodeMK}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {kls?.kodeKelas}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {course?.namaMK}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {prodi?.namaProdi} • {course?.sks} SKS
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dosen Pengampu:</span>
                    <span className="font-bold text-slate-800">{lecturer?.name || 'Belum Ditentukan'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Peserta Terdaftar:</span>
                    <span className="font-bold text-blue-700">{classStudents.length} Mahasiswa</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Jadwal:</span>
                    <span className="text-slate-700">{off.jadwal}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActivePage('pengolahan-nilai', off.id)}
                  className="text-xs font-bold text-[#367FA9] hover:text-[#045A8C] flex items-center space-x-1"
                >
                  <span>Kelola Nilai</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(off.id, `${course?.kodeMK} (${kls?.kodeKelas})`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Hapus Penawaran"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Offering */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] max-w-lg w-full p-6 md:p-8 shadow-[0_25px_60px_rgba(4,90,140,0.2)] border border-white/90">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Buka Penawaran Kelas Mata Kuliah
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih mata kuliah master, dosen pengampu, dan kelas peserta.
            </p>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mata Kuliah Master</label>
                <select
                  value={mataKuliahId}
                  onChange={(e) => setMataKuliahId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-hidden"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.kodeMK} - {c.namaMK} ({c.sks} SKS)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Studi</label>
                  <select
                    value={prodiId}
                    onChange={(e) => setProdiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
                  >
                    {programStudi.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.namaProdi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
                  >
                    {classes.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosen Pengampu</label>
                <select
                  value={dosenId}
                  onChange={(e) => setDosenId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-hidden"
                >
                  {lecturers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (NIDN: {d.nidn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    value={ruang}
                    onChange={(e) => setRuang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jadwal Perkuliahan</label>
                  <input
                    type="text"
                    value={jadwal}
                    onChange={(e) => setJadwal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] hover:from-[#2e6d92] hover:to-[#347ba4] shadow-md transition-all cursor-pointer"
                >
                  Simpan Penawaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
