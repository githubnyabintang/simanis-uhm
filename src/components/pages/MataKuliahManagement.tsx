import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MataKuliah } from '../../types';
import { BookOpen, Plus, Search, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const MataKuliahManagement: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, offerings } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MataKuliah | null>(null);

  // Form states
  const [kodeMK, setKodeMK] = useState('');
  const [namaMK, setNamaMK] = useState('');
  const [sks, setSks] = useState(3);
  const [semesterPaket, setSemesterPaket] = useState(1);
  const [deskripsi, setDeskripsi] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredCourses = courses.filter((c) =>
    c.namaMK.toLowerCase().includes(search.toLowerCase()) ||
    c.kodeMK.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingCourse(null);
    setKodeMK(`MK${courses.length + 101}`);
    setNamaMK('');
    setSks(3);
    setSemesterPaket(1);
    setDeskripsi('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (course: MataKuliah) => {
    setEditingCourse(course);
    setKodeMK(course.kodeMK);
    setNamaMK(course.namaMK);
    setSks(course.sks);
    setSemesterPaket(course.semesterPaket);
    setDeskripsi(course.deskripsi || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!kodeMK.trim() || !namaMK.trim()) {
      setFormError('Kode MK dan Nama Mata Kuliah wajib diisi.');
      return;
    }

    if (editingCourse) {
      const res = updateCourse({
        ...editingCourse,
        kodeMK,
        namaMK,
        sks,
        semesterPaket,
        deskripsi
      });
      if (res.success) {
        setActionNotice('Data mata kuliah berhasil diperbarui.');
        setModalOpen(false);
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        setFormError(res.error || 'Gagal mengubah data.');
      }
    } else {
      const res = addCourse({
        kodeMK,
        namaMK,
        sks,
        semesterPaket,
        deskripsi
      });
      if (res.success) {
        setActionNotice('Mata kuliah baru berhasil ditambahkan.');
        setModalOpen(false);
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        setFormError(res.error || 'Gagal menambahkan mata kuliah.');
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus mata kuliah "${name}"?`)) {
      const res = deleteCourse(id);
      if (res.success) {
        setActionNotice('Mata kuliah berhasil dihapus.');
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        alert(res.error || 'Gagal menghapus mata kuliah.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Master Data Mata Kuliah
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#045A8C]">
              FR-03
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mata kuliah sebagai pusat sistem yang dapat ditawarkan ke berbagai kelas.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] hover:from-[#2e6d92] hover:to-[#347ba4] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Search */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-5 md:p-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama mata kuliah..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-xs font-medium focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-8">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">KODE MK</th>
                <th className="py-3 px-3">NAMA MATA KULIAH</th>
                <th className="py-3 px-2 text-center">BOBOT SKS</th>
                <th className="py-3 px-2 text-center">SEMESTER</th>
                <th className="py-3 px-3">DESKRIPSI KURIKULUM</th>
                <th className="py-3 px-3 text-center">KELAS TERKAIT</th>
                <th className="py-3 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((course) => {
                const linkedOfferings = offerings.filter((o) => o.mataKuliahId === course.id);

                return (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#045A8C]">
                      {course.kodeMK}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {course.namaMK}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-800">
                      {course.sks} SKS
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-700">
                      Sem {course.semesterPaket}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {course.deskripsi || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {linkedOfferings.length} Kelas
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => openEdit(course)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.namaMK)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] max-w-md w-full p-6 md:p-8 shadow-[0_25px_60px_rgba(4,90,140,0.2)] border border-white/90">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfigurasi kode unik mata kuliah dan bobot SKS.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kodeMK}
                  onChange={(e) => setKodeMK(e.target.value.toUpperCase())}
                  placeholder="RPL705"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaMK}
                  onChange={(e) => setNamaMK(e.target.value)}
                  placeholder="Contoh: Manajemen Proyek Perangkat Lunak"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bobot SKS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={sks}
                    onChange={(e) => setSks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester Paket
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={semesterPaket}
                    onChange={(e) => setSemesterPaket(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Singkat Silabus
                </label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Cakupan materi kurikulum perkuliahan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#3C8DBC] focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] hover:from-[#2e6d92] hover:to-[#347ba4] shadow-md transition-all cursor-pointer"
                >
                  {editingCourse ? 'Simpan Perubahan' : 'Tambah Mata Kuliah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
