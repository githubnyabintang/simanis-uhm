import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, ChevronDown, User as UserIcon, LogOut, CheckCircle2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  breadcrumbs: { label: string; active?: boolean }[];
}

export const Header: React.FC<HeaderProps> = ({ breadcrumbs }) => {
  const { currentUser, activePeriod, setActivePeriod, logout } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Administrator</span>;
      case 'dosen':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Dosen Pengampu</span>;
      case 'mahasiswa':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Mahasiswa</span>;
      default:
        return null;
    }
  };

  return (
    <header className="no-print sticky top-0 z-30 px-4 md:px-8 pt-4 pb-2 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Breadcrumbs Floating Capsule */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white/80 backdrop-blur-xl border border-white/90 shadow-xs rounded-2xl px-4 py-2.5 self-start">
          <span className="flex items-center text-slate-400">
            <svg className="w-4 h-4 mr-1 text-[#3C8DBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Beranda
          </span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300 font-bold">›</span>
              <span className={crumb.active ? "font-bold text-[#045A8C]" : "text-slate-500"}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          {/* Academic period selector removed from the header */}
          <div className="hidden">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs">
              <span className="text-[#3C8DBC]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </span>
              <select
                value={activePeriod}
                onChange={(e) => setActivePeriod(e.target.value)}
                aria-label="Pilih Periode Akademik"
                className="bg-transparent border-none text-slate-800 font-bold focus:outline-hidden cursor-pointer pr-1"
              >
                <option value="2026/2027 — Ganjil">2026/2027 — Ganjil</option>
                <option value="2025/2026 — Genap">2025/2026 — Genap</option>
                <option value="2025/2026 — Ganjil">2025/2026 — Ganjil</option>
              </select>
            </div>
          </div>

          {/* User Profile matching Mockup (AD badge Admin SIMANIS Administrator) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2.5 p-1 pl-1.5 pr-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xs hover:bg-white transition-all focus:outline-hidden"
              aria-label="Menu Pengguna"
            >
              <div className="w-8 h-8 rounded-xl bg-[#045A8C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.avatar || 'AD'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'Admin SIMANIS'}
                </div>
                <div className="text-[11px] text-[#367FA9] capitalize leading-none font-semibold mt-0.5">
                  {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <div className="mt-1.5">{getRoleBadge(currentUser?.role)}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
