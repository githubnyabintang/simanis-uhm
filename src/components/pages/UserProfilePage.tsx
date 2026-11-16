import { notifySuccess } from '../common/SuccessToast';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, ShieldCheck, Mail, Calendar, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { currentUser, logout, updateOwnProfile } = useApp();
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateOwnProfile(name, email);
    setSaveFailed(!result.success);
    if (result.success) notifySuccess('Profil berhasil diperbarui.');
    setSavedNotice(result.success ? 'Profil berhasil diperbarui.' : result.error || 'Profil gagal diperbarui.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Profil Pengguna
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Informasi akun dan hak akses sistem informasi manajemen nilai.
        </p>
      </div>

      {savedNotice && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${saveFailed ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {saveFailed ? <AlertCircle className="w-4 h-4 text-red-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{savedNotice}</span>
        </div>
      )}

      <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3C8DBC] to-[#045A8C] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
            {currentUser?.avatar || 'U'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-slate-900">{currentUser?.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.email}</p>
              </div>

              <span className="inline-flex self-center sm:self-start px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#045A8C]">
                {currentUser?.role === 'admin' ? 'Administrator BAAK' : currentUser?.role === 'dosen' ? 'Dosen Pengampu' : 'Mahasiswa'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                Status: <strong>Aktif Terdaftar</strong>
              </span>
              {currentUser?.npm && (
                <span className="flex items-center font-mono">
                  NPM: <strong>{currentUser.npm}</strong>
                </span>
              )}
              {currentUser?.nidn && (
                <span className="flex items-center font-mono">
                  NIDN: <strong>{currentUser.nidn}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 max-w-xl text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Kampus</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-700 focus:outline-hidden"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Email harus unik dan menggunakan format yang valid.</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
            <strong>Perubahan kata sandi belum tersedia.</strong> Aplikasi ini belum memiliki layanan autentikasi server yang dapat memverifikasi kata sandi saat ini dan menyimpan hash kata sandi baru secara aman.
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] shadow-md transition-all cursor-pointer"
            >
              Simpan Profil
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              Keluar Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
