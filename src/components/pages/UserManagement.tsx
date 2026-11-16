import { notifySuccess } from '../common/SuccessToast';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { Users, CheckCircle2, Search, Pencil, X } from 'lucide-react';
import { PaginationControls, paginate } from '../common/PaginationControls';
import { DataTransfer } from '../common/DataTransfer';

export const UserManagement: React.FC = () => {
  const { users, updateDosenAccount } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);
  const [editingDosen, setEditingDosen] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const visibleUsers = paginate(filteredUsers, page, pageSize);
  useEffect(() => setPage(1), [search, roleFilter]);

  const openDosenEditor = (user: User) => {
    setEditingDosen(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const saveDosen = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingDosen) return;
    const result = updateDosenAccount(editingDosen.id, editName, editEmail);
    setToastError(!result.success);
    if (result.success) notifySuccess('Nama dan email dosen berhasil diperbarui.');
    setToastMessage(result.success ? 'Nama dan email dosen berhasil diperbarui.' : result.error || 'Perubahan gagal disimpan.');
    if (result.success) setEditingDosen(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Manajemen Pengguna & Hak Akses
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#045A8C]">
              FR-12
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun autentikasi Administrator, Dosen Pengampu, dan Mahasiswa.
          </p>
        </div>
      </div>

      <DataTransfer kind="users" scope={{ search, role: roleFilter }} contextLabel="Ekspor sesuai filter pengguna · Impor khusus dosen" />

      {toastMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${toastError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle2 className={`w-4 h-4 ${toastError ? 'text-red-600' : 'text-emerald-600'}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, email, atau username..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-xs font-medium focus:ring-2 focus:ring-[#3C8DBC] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer shadow-xs"
          >
            <option value="all">Semua Peran</option>
            <option value="admin">Administrator</option>
            <option value="dosen">Dosen</option>
            <option value="mahasiswa">Mahasiswa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-6 md:p-8">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">PENGGUNA</th>
                <th className="py-3 px-3">USERNAME / IDENTITAS</th>
                <th className="py-3 px-3">PERAN SISTEM</th>
                <th className="py-3 px-2 text-center">STATUS</th>
                <th className="py-3 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#045A8C] font-bold text-xs flex items-center justify-center">
                        {user.avatar || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {user.npm ? `NPM: ${user.npm}` : user.nidn ? `NIDN: ${user.nidn}` : user.username}
                  </td>
                  <td className="py-3 px-3">
                    {user.role === 'admin' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Administrator
                      </span>
                    ) : user.role === 'dosen' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Dosen Pengampu
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        Mahasiswa
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {user.role === 'dosen' && <button onClick={() => openDosenEditor(user)} className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition-colors inline-flex items-center space-x-1"><Pencil className="w-3 h-3" /><span>Edit akun</span></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls page={page} pageSize={pageSize} totalItems={filteredUsers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} itemLabel="pengguna" />
      </div>

      {editingDosen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setEditingDosen(null)}>
        <form onSubmit={saveDosen} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-4 rounded-[24px] bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between"><div><h3 className="font-black text-slate-900">Edit Akun Dosen</h3><p className="mt-1 text-xs text-slate-500">ID dosen tetap dipertahankan agar relasi akademik tidak berubah.</p></div><button type="button" onClick={() => setEditingDosen(null)} aria-label="Tutup" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
          <label className="block text-xs font-bold text-slate-700">Nama dosen<input required value={editName} onChange={(event) => setEditName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
          <label className="block text-xs font-bold text-slate-700">Email<input required type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900"><strong>Reset kata sandi belum tersedia.</strong> Proyek ini belum memiliki layanan autentikasi server atau penyimpanan kredensial; perubahan kata sandi tidak aman dilakukan dari browser.</div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingDosen(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Batal</button><button type="submit" className="rounded-xl bg-[#045A8C] px-4 py-2 text-xs font-bold text-white">Simpan perubahan</button></div>
        </form>
      </div>}
    </div>
  );
};
