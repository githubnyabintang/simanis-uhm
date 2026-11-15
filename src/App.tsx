/**
 * SIMANIS UHM - Sistem Informasi Manajemen Nilai Mahasiswa
 * Universitas Handayani Makassar
 * Rekayasa Perangkat Lunak | Magister (S2)
 * Kelompok 3: Mahabintang Pallawabonang & Nur Azizah Arafah
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/pages/LoginPage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { MahasiswaManagement } from './components/pages/MahasiswaManagement';
import { MataKuliahManagement } from './components/pages/MataKuliahManagement';
import { PenawaranManagement } from './components/pages/PenawaranManagement';
import { PesertaManagement } from './components/pages/PesertaManagement';
import { UserManagement } from './components/pages/UserManagement';
import { PengolahanNilai } from './components/pages/PengolahanNilai';
import { DosenMataKuliah } from './components/pages/DosenMataKuliah';
import { MahasiswaNilaiSaya } from './components/pages/MahasiswaNilaiSaya';
import { MahasiswaDashboard } from './components/pages/MahasiswaDashboard';
import { UserProfilePage } from './components/pages/UserProfilePage';
import { FeedbackManagement } from './components/pages/FeedbackManagement';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { Menu } from 'lucide-react';

import { MobileBottomBar } from './components/layout/MobileBottomBar';

const MainLayout: React.FC = () => {
  const { currentUser, activePage } = useApp();

  if (!currentUser || activePage === 'login') {
    return <LoginPage />;
  }

  // Generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    switch (activePage) {
      case 'dashboard':
        return [{ label: 'Dashboard', active: true }];
      case 'mahasiswa':
        return [{ label: 'Data Master' }, { label: 'Data Mahasiswa', active: true }];
      case 'matakuliah':
        return [{ label: 'Data Master' }, { label: 'Data Mata Kuliah', active: true }];
      case 'users':
        return [{ label: 'Data Master' }, { label: 'Manajemen Pengguna', active: true }];
      case 'penawaran':
        return [{ label: 'Akademik' }, { label: 'Periode & Kelas Perkuliahan', active: true }];
      case 'peserta':
        return [{ label: 'Akademik' }, { label: 'Peserta Mata Kuliah', active: true }];
      case 'pengolahan-nilai':
        return [{ label: 'Penilaian' }, { label: 'Pengolahan Nilai & Bobot', active: true }];
      case 'dosen-matakuliah':
        return [{ label: 'Perkuliahan' }, { label: 'Mata Kuliah Saya', active: true }];
      case 'nilai-saya':
        return [{ label: 'Akademik Mahasiswa' }, { label: 'Daftar Nilai Saya', active: true }];
      case 'dashboard-mahasiswa':
        return [{ label: 'Akademik Mahasiswa' }, { label: 'Dashboard Mahasiswa', active: true }];
      case 'profile':
        return [{ label: 'Akun' }, { label: 'Profil Saya', active: true }];
      case 'feedback':
        return [{ label: 'Feedback' }, { label: 'Masukan Pengguna', active: true }];
      default:
        return [{ label: 'Dashboard', active: true }];
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'mahasiswa':
        return <MahasiswaManagement />;
      case 'matakuliah':
        return <MataKuliahManagement />;
      case 'penawaran':
        return <PenawaranManagement />;
      case 'peserta':
        return <PesertaManagement />;
      case 'users':
        return <UserManagement />;
      case 'pengolahan-nilai':
        return <PengolahanNilai />;
      case 'dosen-matakuliah':
        return <DosenMataKuliah />;
      case 'nilai-saya':
        return <MahasiswaNilaiSaya />;
      case 'dashboard-mahasiswa':
        return <MahasiswaDashboard />;
      case 'profile':
        return <UserProfilePage />;
      case 'feedback':
        return <FeedbackManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  const rolePages: Record<string, string[]> = {
    admin: ['dashboard', 'mahasiswa', 'matakuliah', 'users', 'penawaran', 'peserta', 'pengolahan-nilai', 'feedback', 'profile'],
    dosen: ['dosen-matakuliah', 'pengolahan-nilai', 'profile'],
    mahasiswa: ['dashboard-mahasiswa', 'nilai-saya', 'profile']
  };
  const allowedPages = rolePages[currentUser.role] || [];
  const safeContent = allowedPages.includes(activePage)
    ? renderContent()
    : currentUser.role === 'mahasiswa'
      ? <MahasiswaDashboard />
      : currentUser.role === 'dosen'
        ? <DosenMataKuliah />
        : <AdminDashboard />;

  return (
    <div className="min-h-screen flex text-slate-800 antialiased font-sans">
      {/* Tablet & Desktop Glass Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header breadcrumbs={getBreadcrumbs()} />

        {/* Page Content with bottom padding for mobile floating bar */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-12">
          <div key={activePage} className="app-page-enter">{safeContent}</div>
        </main>
      </div>

      {/* Floating Glass Bottom Navigation Bar for Mobile */}
      <MobileBottomBar />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
      <FeedbackModal />
    </AppProvider>
  );
}
