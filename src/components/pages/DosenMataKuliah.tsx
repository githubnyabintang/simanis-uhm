import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Users, Sliders, FileText, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { PaginationControls, paginate } from '../common/PaginationControls';

export const DosenMataKuliah: React.FC = () => {
  const { offerings, courses, classes, currentUser, enrollments, grades, weights, setActivePage } = useApp();

  // Filter offerings assigned to the logged-in lecturer (or all if admin)
  const lecturerOfferings = offerings.filter((o) =>
    currentUser?.role === 'admin' ? true : o.dosenId === currentUser?.id
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const visibleOfferings = paginate(lecturerOfferings, page, pageSize);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Mata Kuliah Yang Diampu
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#045A8C]">
              Portal Dosen
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dosen Pengampu: <strong className="text-slate-800">{currentUser?.name}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleOfferings.map((off) => {
          const course = courses.find((c) => c.id === off.mataKuliahId);
          const kls = classes.find((k) => k.id === off.kelasId);
          const classStudents = enrollments.filter((e) => e.penawaranId === off.id);
          const classGrades = grades.filter((g) => g.penawaranId === off.id);
          const verifiedCount = classGrades.filter((g) => g.statusVerifikasi === 'Terverifikasi').length;
          const currentWeight = weights.find((w) => w.penawaranId === off.id);

          return (
            <div
              key={off.id}
              className="motion-card bg-white/80 backdrop-blur-2xl rounded-[28px] p-7 border border-white/90 shadow-[0_12px_40px_rgba(4,90,140,0.06)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-blue-100/80 text-[#045A8C] border border-blue-200/50 shadow-2xs">
                    {course?.kodeMK}
                  </span>
                  <span className="text-xs font-black px-3 py-1 rounded-xl bg-white/90 text-slate-700 border border-white shadow-2xs">
                    {kls?.kodeKelas}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                  {course?.namaMK}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {course?.sks} SKS • {off.ruang}
                </p>

                <div className="mt-5 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Mahasiswa:</span>
                    <span className="font-extrabold text-slate-800">{classStudents.length} Mahasiswa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Nilai Terverifikasi:</span>
                    <span className="font-bold text-emerald-600">
                      {verifiedCount} / {classStudents.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px]">
                    <span className="text-slate-400">Bobot Penilaian:</span>
                    <span className="font-mono font-bold text-slate-700">
                      {currentWeight ? `T:${currentWeight.bobotTugas}% U:${currentWeight.bobotUTS}% A:${currentWeight.bobotUAS}%` : 'Belum diatur'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100/80">
                <button
                  onClick={() => setActivePage('pengolahan-nilai', off.id)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] hover:from-[#2e6d92] hover:to-[#347ba4] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Input & Olah Nilai</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <PaginationControls page={page} pageSize={pageSize} totalItems={lecturerOfferings.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} itemLabel="mata kuliah" />
    </div>
  );
};
