import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLogo } from './CampusLogo';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  UserCheck,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquareHeart
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { activePage, setActivePage, currentUser, logout, openFeedbackModal } = useApp();
  const [isSlim, setIsSlim] = useState(false);

  const handleNav = (page: string) => {
    setActivePage(page);
  };

  const role = currentUser?.role || 'admin';

  return (
    <aside
      className={`no-print hidden md:flex sticky top-4 left-4 h-[calc(100vh-2rem)] bg-white/80 backdrop-blur-2xl rounded-[26px] border border-white/90 shadow-[0_14px_45px_rgba(4,90,140,0.08)] z-40 flex-col justify-between transition-all duration-300 ease-in-out my-4 ml-4 shrink-0 ${
        isSlim ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      <div className="flex-1 overflow-y-auto px-3.5 py-6 scrollbar-thin">
        {/* Header with Logo and Slim Toggle */}
        <div className={`flex items-center mb-6 px-1 ${isSlim ? 'justify-center flex-col space-y-2' : 'justify-between'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-blue-500/25 ring-2 ring-white/80 shrink-0 overflow-hidden">
              <CampusLogo className="w-full h-full object-contain" />
            </div>
            {!isSlim && (
              <div className="overflow-hidden">
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight truncate">
                  SIMANIS UHM
                </h1>
                <p title="Sistem Informasi Manajemen Nilai Mahasiswa Universitas Handayani Makassar" className="max-w-[175px] whitespace-normal text-[9px] font-bold leading-tight text-[#367FA9]">
                  Sistem Informasi Manajemen Nilai Mahasiswa Universitas Handayani Makassar
                </p>
              </div>
            )}
          </div>

          {/* Toggle Slim Sidebar button (Tablet & Desktop) */}
          <button
            onClick={() => setIsSlim(!isSlim)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-blue-50 text-slate-400 hover:text-[#045A8C] border border-slate-200/60 shadow-2xs transition-colors cursor-pointer"
            title={isSlim ? 'Perluas Menu Sidebar' : 'Ciutkan Menu ke Mode Ramping (Slim)'}
            aria-label="Toggle Sidebar Size"
          >
            {isSlim ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* NAVIGATION: ADMIN ROLE */}
        {role === 'admin' && (
          <div className="space-y-6">
            {/* DATA MASTER */}
            <div>
              {!isSlim ? (
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  DATA MASTER
                </p>
              ) : (
                <div className="w-8 h-px bg-slate-200/80 mx-auto my-3" />
              )}
              <div className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'mahasiswa', label: 'Data Mahasiswa', icon: GraduationCap },
                  { id: 'matakuliah', label: 'Data Mata Kuliah', icon: BookOpen },
                  { id: 'users', label: 'Manajemen Pengguna', icon: Users }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={isSlim ? item.label : undefined}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSlim ? 'justify-center' : 'space-x-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSlim && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AKADEMIK */}
            <div>
              {!isSlim ? (
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  AKADEMIK
                </p>
              ) : (
                <div className="w-8 h-px bg-slate-200/80 mx-auto my-3" />
              )}
              <div className="space-y-1">
                {[
                  { id: 'penawaran', label: 'Periode & Kelas', icon: Calendar },
                  { id: 'peserta', label: 'Peserta MK', icon: UserCheck },
                  { id: 'feedback', label: 'Feedback Pengguna', icon: MessageSquareHeart }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={isSlim ? item.label : undefined}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSlim ? 'justify-center' : 'space-x-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSlim && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PENILAIAN */}
            <div>
              {!isSlim ? (
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  PENILAIAN
                </p>
              ) : (
                <div className="w-8 h-px bg-slate-200/80 mx-auto my-3" />
              )}
              <div className="space-y-1">
                {[
                  { id: 'pengolahan-nilai', label: 'Persetujuan Revisi', icon: Award }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={isSlim ? item.label : undefined}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSlim ? 'justify-center' : 'space-x-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSlim && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION: DOSEN ROLE */}
        {role === 'dosen' && (
          <div className="space-y-6">
            <div>
              {!isSlim ? (
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  PERKULIAHAN & NILAI
                </p>
              ) : (
                <div className="w-8 h-px bg-slate-200/80 mx-auto my-3" />
              )}
              <div className="space-y-1">
                {[
                  { id: 'dosen-matakuliah', label: 'Mata Kuliah Saya', icon: BookOpen },
                  { id: 'pengolahan-nilai', label: 'Pengolahan Nilai & Bobot', icon: Award },
                  { id: 'feedback', label: 'Feedback', icon: MessageSquareHeart, action: openFeedbackModal }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.action ? item.action() : handleNav(item.id)}
                      title={isSlim ? item.label : undefined}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSlim ? 'justify-center' : 'space-x-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSlim && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION: MAHASISWA ROLE */}
        {role === 'mahasiswa' && (
          <div className="space-y-6">
            <div>
              {!isSlim ? (
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  AKADEMIK MAHASISWA
                </p>
              ) : (
                <div className="w-8 h-px bg-slate-200/80 mx-auto my-3" />
              )}
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('dashboard-mahasiswa')}
                  title={isSlim ? 'Dashboard Mahasiswa' : undefined}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isSlim ? 'justify-center' : 'space-x-3'
                  } ${activePage === 'dashboard-mahasiswa' ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'}`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!isSlim && <span className="truncate">Dashboard Mahasiswa</span>}
                </button>
                <button
                  onClick={openFeedbackModal}
                  title={isSlim ? 'Feedback' : undefined}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${isSlim ? 'justify-center' : 'space-x-3'} text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium`}
                >
                  <MessageSquareHeart className="w-4 h-4 shrink-0" />
                  {!isSlim && <span className="truncate">Feedback</span>}
                </button>
                <button
                  onClick={() => handleNav('nilai-saya')}
                  title={isSlim ? 'Daftar Nilai Saya' : undefined}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isSlim ? 'justify-center' : 'space-x-3'
                  } ${
                    activePage === 'nilai-saya'
                      ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  {!isSlim && <span className="truncate">Daftar Nilai Saya</span>}
                </button>

              </div>
            </div>
          </div>
        )}

        {/* AKUN SECTION */}
        <div className="mt-6 pt-3 border-t border-slate-100">
          {!isSlim ? (
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              AKUN
            </p>
          ) : null}
          <div className="space-y-1">
            <button
              onClick={() => handleNav('profile')}
              title={isSlim ? 'Profil Saya' : undefined}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isSlim ? 'justify-center' : 'space-x-3'
              } ${
                activePage === 'profile'
                  ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              {!isSlim && <span className="truncate">Profil Saya</span>}
            </button>

            <button
              onClick={logout}
              title={isSlim ? 'Keluar' : undefined}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer ${
                isSlim ? 'justify-center' : 'space-x-3'
              }`}
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              {!isSlim && <span className="truncate">Keluar</span>}
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
};
