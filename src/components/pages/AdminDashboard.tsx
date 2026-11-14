import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, GraduationCap, Layers, Users } from 'lucide-react';
import { GradeRevisionQueue } from './GradeRevisionQueue';

export const AdminDashboard: React.FC = () => {
  const { courses, offerings, students, users, currentUser } = useApp();
  const counts = [
    { label: 'Mahasiswa terdaftar', value: students.length, icon: GraduationCap, style: 'bg-blue-100 text-blue-700' },
    { label: 'Dosen aktif', value: users.filter((user) => user.role === 'dosen' && user.isActive).length, icon: Users, style: 'bg-emerald-100 text-emerald-700' },
    { label: 'Mata kuliah', value: courses.length, icon: BookOpen, style: 'bg-indigo-100 text-indigo-700' },
    { label: 'Kelas ditawarkan', value: offerings.length, icon: Layers, style: 'bg-teal-100 text-teal-700' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <header>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Administrator</h2>
        <p className="mt-1 text-xs text-slate-500">Selamat datang, {currentUser?.name}. Kelola data akademik dan permintaan revisi nilai.</p>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Ringkasan akademik">
        {counts.map(({ label, value, icon: Icon, style }) => <article key={label} className="motion-card rounded-[24px] bg-white/80 border border-white/90 shadow-sm p-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style}`}><Icon className="w-5 h-5" /></div>
          <p className="mt-4 text-2xl font-black text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p>
        </article>)}
      </section>
      <GradeRevisionQueue />
    </div>
  );
};
