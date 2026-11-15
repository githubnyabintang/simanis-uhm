import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mahasiswa } from '../../types';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Filter,
  UserCheck
} from 'lucide-react';
import { PaginationControls, paginate } from '../common/PaginationControls';

export const MahasiswaManagement: React.FC = () => {
  const { students, programStudi, semesters, classes, addStudent, updateStudent, deleteStudent } = useApp();

  const [search, setSearch] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Mahasiswa | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form fields
  const [npm, setNpm] = useState('');
  const [nama, setNama] = useState('');
  const [prodiId, setProdiId] = useState(programStudi[0]?.id || 'prodi-s2-rpl');
  const [semesterId, setSemesterId] = useState(semesters[0]?.id || 'sem-1');
  const [kelasAsalId, setKelasAsalId] = useState(classes[0]?.id || 'kls-s2-a');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.npm.includes(search);
    const matchProdi = selectedProdi === 'all' || s.prodiId === selectedProdi;
    return matchSearch && matchProdi;
  });
  const visibleStudents = paginate(filteredStudents, page, pageSize);
  useEffect(() => setPage(1), [search, selectedProdi]);

  const openAddModal = () => {
    setEditingStudent(null);
    setNpm(`20260100${String(students.length + 1).padStart(2, '0')}`);
    setNama('');
    setProdiId(programStudi[0]?.id || 'prodi-s2-rpl');
    setSemesterId(semesters[0]?.id || 'sem-1');
    setKelasAsalId(classes[0]?.id || 'kls-s2-a');
    setEmail('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (student: Mahasiswa) => {
    setEditingStudent(student);
    setNpm(student.npm);
    setNama(student.nama);
    setProdiId(student.prodiId);
    setSemesterId(student.semesterId);
    setKelasAsalId(student.kelasAsalId || classes[0]?.id);
    setEmail(student.email);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!npm.trim() || !nama.trim()) {
      setFormError('NPM dan Nama Mahasiswa wajib diisi.');
      return;
    }

    if (editingStudent) {
      const res = updateStudent({
        ...editingStudent,
        npm,
        nama,
        prodiId,
        semesterId,
        kelasAsalId,
        email: email || `${npm}@uhm.ac.id`
      });
      if (res.success) {
        setActionNotice('Data mahasiswa berhasil diperbarui.');
        setModalOpen(false);
        setTimeout(() => setActionNotice(null), 3500);
      } else {
        setFormError(res.error || 'Gagal memperbarui data.');
      }
    } else {
      const res = addStudent({
        npm,
        nama,
        prodiId,
        semesterId,
        kelasAsalId,
        email: email || `${npm}@uhm.ac.id`,
        angkatan: '2026'
      });
      if (res.success) {
        setActionNotice('Mahasiswa baru berhasil didaftarkan ke sistem.');
        setModalOpen(false);
        setTimeout(() => setActionNotice(null), 3500);
      } else {
        setFormError(res.error || 'Gagal menambahkan mahasiswa.');
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus data mahasiswa "${name}"?`)) {
      const res = deleteStudent(id);
      if (res.success) {
        setActionNotice('Data mahasiswa berhasil dihapus.');
        setTimeout(() => setActionNotice(null), 3500);
      } else {
        alert(res.error || 'Gagal menghapus mahasiswa.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Manajemen Data Mahasiswa
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#045A8C]">
              FR-02
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data induk mahasiswa, NPM unik, dan pemetaan program studi.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] hover:from-[#2e6d92] hover:to-[#347ba4] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mahasiswa</span>
        </button>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Controls: Search and Filter */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan NPM atau Nama..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-xs font-medium focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Prodi:
          </span>
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer shadow-xs"
          >
            <option value="all">Semua Program Studi</option>
            {programStudi.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaProdi} ({p.jenjang})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-8">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">NPM</th>
                <th className="py-3 px-3">NAMA MAHASISWA</th>
                <th className="py-3 px-3">PROGRAM STUDI</th>
                <th className="py-3 px-2 text-center">SEMESTER</th>
                <th className="py-3 px-2 text-center">KELAS ASAL</th>
                <th className="py-3 px-3">EMAIL KAMPUS</th>
                <th className="py-3 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStudents.map((student) => {
                const prodi = programStudi.find((p) => p.id === student.prodiId);
                const kls = classes.find((k) => k.id === student.kelasAsalId);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#045A8C]">
                      {student.npm}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {student.nama}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {prodi?.namaProdi}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-700">
                      {student.semesterId.replace('sem-', 'Sem ')}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-600">
                      {kls?.kodeKelas || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {student.email}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.nama)}
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
        <PaginationControls page={page} pageSize={pageSize} totalItems={filteredStudents.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} itemLabel="mahasiswa" />
      </div>

      {/* Modal Add / Edit Student */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] max-w-lg w-full p-6 md:p-8 shadow-[0_25px_60px_rgba(4,90,140,0.2)] border border-white/90">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              {editingStudent ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pastikan NPM unik dan data akademik terisi dengan benar.
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
                  Nomor Pokok Mahasiswa (NPM) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={npm}
                  disabled={!!editingStudent}
                  onChange={(e) => setNpm(e.target.value)}
                  placeholder="2026010011"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap sesuai berkas pendaftaran"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={prodiId}
                    onChange={(e) => setProdiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden"
                  >
                    {programStudi.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.namaProdi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Asal
                  </label>
                  <select
                    value={kelasAsalId}
                    onChange={(e) => setKelasAsalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Institusi Mahasiswa
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: nama@uhm.ac.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden"
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
                  {editingStudent ? 'Simpan Perubahan' : 'Daftarkan Mahasiswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
