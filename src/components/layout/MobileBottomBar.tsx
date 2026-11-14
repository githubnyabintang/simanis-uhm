import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLogo } from './CampusLogo';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Award,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Calendar,
  Users,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { activePage, setActivePage, currentUser, logout } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = currentUser?.role || 'admin';

  const handleNav = (page: string) => {
    setActivePage(page);
    setDrawerOpen(false);
  };

  // Primary items for bottom quick bar + 1 "Menu" button
  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'mahasiswa', label: 'Mahasiswa', icon: GraduationCap },
        { id: 'penawaran', label: 'Kelas', icon: Calendar },
        { id: 'pengolahan-nilai', label: 'Revisi', icon: Award }
      ];
    }
    if (role === 'dosen') {
      return [
        { id: 'dosen-matakuliah', label: 'MK Saya', icon: BookOpen },
        { id: 'pengolahan-nilai', label: 'Olah Nilai', icon: Award },
        { id: 'profile', label: 'Profil', icon: UserIcon }
      ];
    }
    return [
      { id: 'dashboard-mahasiswa', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'nilai-saya', label: 'Daftar Nilai', icon: Award },
      { id: 'profile', label: 'Profil', icon: UserIcon }
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Floating Frosted Glass Bottom Navigation Bar (Mobile only: md:hidden) */}
      <nav
        aria-label="Navigasi Bawah Ponsel"
        className="no-print md:hidden fixed bottom-3 inset-x-3 z-40 max-w-lg mx-auto"
      >
        <div className="bg-white/85 backdrop-blur-2xl rounded-full border border-white/90 shadow-[0_16px_40px_rgba(4,90,140,0.18)] px-3 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#045A8C] scale-105 font-black'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-full transition-all ${
                    isActive
                      ? 'bg-blue-100/90 text-[#045A8C] shadow-xs'
                      : 'bg-transparent text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Drawer trigger button */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-200 cursor-pointer ${
              drawerOpen
                ? 'text-[#045A8C] scale-105 font-black'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-full transition-all ${
                drawerOpen
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100/80 text-slate-600'
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Frosted Glass Mobile Bottom Sheet Drawer */}
      {drawerOpen && (
        <div className="no-print md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Bottom Sheet Container */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-t-[32px] border-t border-x border-white/90 shadow-[0_-20px_50px_rgba(4,90,140,0.18)] max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            {/* Grab handle indicator */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300/80" />
            </div>

            {/* Header of Drawer */}
            <div className="px-5 py-3 border-b border-slate-100/90 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md overflow-hidden">
                  <CampusLogo className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">SIMANIS UHM</h3>
                  <p className="text-[11px] text-slate-500">
                    {currentUser?.name} ({role.toUpperCase()})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable menu content */}
            <div className="overflow-y-auto px-5 py-4 space-y-5 pb-24">
              
              {/* ADMIN FULL MENU */}
              {role === 'admin' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                      DATA MASTER
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNav('dashboard')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                          activePage === 'dashboard'
                            ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                            : 'bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard Utama</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>

                      <button
                        onClick={() => handleNav('mahasiswa')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                          activePage === 'mahasiswa'
                            ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                            : 'bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="w-4 h-4" />
                          <span>Data Mahasiswa</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>

                      <button
                        onClick={() => handleNav('matakuliah')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                          activePage === 'matakuliah'
                            ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                            : 'bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-4 h-4" />
                          <span>Data Mata Kuliah</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>

                      <button
                        onClick={() => handleNav('users')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                          activePage === 'users'
                            ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                            : 'bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4" />
                          <span>Manajemen Pengguna</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                      AKADEMIK & PENILAIAN
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNav('penawaran')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                          activePage === 'penawaran'
                            ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                            : 'bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4" />
                          <span>Periode & Kelas</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>

                      <button
                        onClick={() => handleNav('peserta')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                          activePage === 'peserta'
                            ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                            : 'bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <UserCheck className="w-4 h-4" />
                          <span>Peserta Mata Kuliah</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>

                      <button
                        onClick={() => handleNav('pengolahan-nilai')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                          activePage === 'pengolahan-nilai'
                            ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                            : 'bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Award className="w-4 h-4" />
                          <span>Persetujuan Revisi</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>

                    </div>
                  </div>
                </div>
              )}

              {/* DOSEN FULL MENU */}
              {role === 'dosen' && (
                <div className="space-y-4 text-xs">
                  <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                    PERKULIAHAN & PENILAIAN
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNav('dosen-matakuliah')}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                        activePage === 'dosen-matakuliah'
                          ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                          : 'bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-4 h-4" />
                        <span>Mata Kuliah Yang Diampu</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>

                    <button
                      onClick={() => handleNav('pengolahan-nilai')}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                        activePage === 'pengolahan-nilai'
                          ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                          : 'bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Award className="w-4 h-4" />
                        <span>Pengolahan Nilai & Bobot</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  </div>
                </div>
              )}

              {/* MAHASISWA FULL MENU */}
              {role === 'mahasiswa' && (
                <div className="space-y-4 text-xs">
                  <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                    AKADEMIK MAHASISWA
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNav('dashboard-mahasiswa')}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl ${activePage === 'dashboard-mahasiswa' ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold' : 'bg-slate-50/80 text-slate-700'}`}
                    >
                      <div className="flex items-center space-x-3"><LayoutDashboard className="w-4 h-4" /><span>Dashboard Mahasiswa</span></div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    <button
                      onClick={() => handleNav('nilai-saya')}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                        activePage === 'nilai-saya'
                          ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                          : 'bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Award className="w-4 h-4" />
                        <span>Daftar Nilai Saya</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>

                  </div>
                </div>
              )}

              {/* AKUN & LOGOUT */}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <button
                  onClick={() => handleNav('profile')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl ${
                    activePage === 'profile'
                      ? 'bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] text-white font-bold'
                      : 'bg-slate-50/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-4 h-4" />
                    <span>Profil Saya</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 p-3 rounded-2xl text-red-600 bg-red-50/80 font-bold hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Keluar dari SIMANIS</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
