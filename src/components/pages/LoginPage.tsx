import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLogo } from '../layout/CampusLogo';
import { User, Lock, Eye, EyeOff, LogIn, Info, AlertCircle, MessageSquareHeart } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, openFeedbackModal } = useApp();
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan Email, Username, NIDN, atau NIM Anda.');
      return;
    }
    const res = login(identifier, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Autentikasi gagal. Periksa kembali kredensial Anda.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E6F4FC] via-[#F4F8FC] to-[#DBEAFE] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Soft Glow Circles */}
      <div className="login-glow login-glow-one absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="login-glow login-glow-two absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card matching mockup */}
      <div className="login-card-enter relative w-full max-w-[490px] bg-white/95 backdrop-blur-xl border border-white/70 shadow-2xl rounded-3xl p-8 md:p-10 transition-all z-10">
        
        {/* Top Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-50 overflow-hidden">
            <CampusLogo className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Title & Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              SIMANIS UHM
            </h1>
          </div>

          <p className="text-[10px] font-extrabold text-[#367FA9] tracking-normal leading-snug mt-2 max-w-xs mx-auto">
            Sistem Informasi Manajemen Nilai Mahasiswa Universitas Handayani Makassar
          </p>

          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
            Masuk ke akun SIMANIS UHM untuk melanjutkan akses akademik.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 tracking-wide uppercase mb-1.5">
              EMAIL / USERNAME / NIDN / NIM <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-[#3C8DBC]" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@uhm.ac.id"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3C8DBC] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                PASSWORD <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Fitur reset password dapat diajukan ke BAAK atau kontak Administrator WhatsApp.')}
                className="text-[11px] font-semibold text-[#367FA9] hover:underline"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-[#3C8DBC]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3C8DBC] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#367FA9] border-slate-300 focus:ring-[#3C8DBC] cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600 font-medium cursor-pointer">
              Ingat Saya di perangkat ini
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] hover:from-[#2e6d92] hover:to-[#347ba4] text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Sistem</span>
          </button>
        </form>

        {/* Info Callout Box matching Mockup */}
        <div className="mt-5 p-3 rounded-2xl bg-sky-50/70 border border-sky-100/90 text-slate-700 text-xs flex items-start space-x-2.5">
          <div className="w-5 h-5 rounded-full bg-sky-200 text-[#045A8C] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
            <Info className="w-3.5 h-3.5 text-[#045A8C]" />
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            Mengalami kendala login? <span className="font-bold text-[#045A8C] underline cursor-pointer">Hubungi Helpdesk BAAK UHM</span> atau WhatsApp Administrator (<span className="font-mono text-slate-700">+62 811-400-UHM</span>).
          </p>
        </div>

        <button type="button" onClick={openFeedbackModal} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-bold text-[#045A8C] hover:bg-blue-50">
          <MessageSquareHeart className="h-4 w-4" /> Berikan Feedback sebagai Pengunjung
        </button>

      </div>

      {/* Footer Copyright matching Mockup */}
      <div className="mt-6 text-center text-slate-500 text-[11px] max-w-md px-4 z-10 leading-relaxed">
        <p className="font-medium text-slate-600">
          © 2026 <span className="font-bold text-slate-800">SIMANIS UHM</span> — Universitas Handayani Makassar.
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Sistem Informasi Manajemen Nilai Mahasiswa Terpadu.
        </p>
      </div>
    </div>
  );
};
