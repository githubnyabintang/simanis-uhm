import { notifySuccess } from '../common/SuccessToast';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Clock3 } from 'lucide-react';
import { PaginationControls, paginate } from '../common/PaginationControls';

export const GradeRevisionQueue: React.FC = () => {
  const { courses, offerings, students, users, classes, grades, decideGradeRevision } = useApp();
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const requests = grades.filter((grade) => grade.statusPermintaanRevisi === 'Menunggu Persetujuan');
  const visibleRequests = paginate(requests, page, pageSize);

  const decide = (gradeId: string, approve: boolean) => {
    const result = decideGradeRevision(gradeId, approve, decisionNotes[gradeId] || '');
    if (!result.success) {
      setNotice(result.error || 'Keputusan gagal disimpan.');
      return;
    }
    notifySuccess(approve ? 'Izin revisi diberikan.' : 'Permintaan revisi ditolak.');
    setDecisionNotes((previous) => ({ ...previous, [gradeId]: '' }));
    setNotice(approve ? 'Izin revisi diberikan kepada dosen pengampu.' : 'Permintaan revisi ditolak. Nilai tetap terkunci.');
    window.setTimeout(() => setNotice(null), 4000);
  };

  return (
    <section className="rounded-[28px] bg-white/80 border border-white/90 shadow-sm p-5 md:p-7">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-extrabold text-slate-900">Permintaan Revisi Nilai</h3>
          <p className="mt-1 text-xs text-slate-500">Administrator hanya memberi izin. Perubahan dan verifikasi nilai tetap dilakukan dosen pengampu.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
          <Clock3 className="w-3.5 h-3.5" /> {requests.length} menunggu
        </span>
      </div>
      {notice && <div role="status" className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-800">{notice}</div>}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
          <p className="mt-2 text-sm font-bold text-slate-700">Tidak ada permintaan revisi yang menunggu.</p>
          <p className="mt-1 text-xs text-slate-500">Permintaan dari dosen akan tampil di sini.</p>
        </div>
      ) : <div className="space-y-3">
        {visibleRequests.map((grade) => {
          const offering = offerings.find((item) => item.id === grade.penawaranId);
          const course = courses.find((item) => item.id === offering?.mataKuliahId);
          const student = students.find((item) => item.npm === grade.npm);
          const lecturer = users.find((item) => item.id === offering?.dosenId);
          const classInfo = classes.find((item) => item.id === offering?.kelasId);
          const requester = users.find((item) => item.id === grade.dimintaOleh);
          return <article key={grade.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{course?.namaMK || 'Mata kuliah'} · {classInfo?.kodeKelas || 'Kelas'}</h4>
                <p className="mt-1 text-xs text-slate-600">{student?.nama || grade.npm} ({grade.npm}) · Dosen: {lecturer?.name || '—'}</p>
                <p className="mt-2 text-xs text-slate-700"><strong>Alasan:</strong> {grade.alasanPermintaanRevisi || '—'}</p>
                <p className="mt-1 text-[11px] text-slate-500">Diajukan oleh {requester?.name || lecturer?.name || 'Dosen'}{grade.dimintaPada ? ` · ${new Date(grade.dimintaPada).toLocaleString('id-ID')}` : ''}</p>
              </div>
              <div className="rounded-xl bg-white/80 px-3 py-2 text-[11px] text-slate-600">Nilai terverifikasi: T {grade.nilaiTugas ?? '—'} · UTS {grade.nilaiUTS ?? '—'} · UAS {grade.nilaiUAS ?? '—'}</div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <input aria-label={`Catatan keputusan untuk ${student?.nama || grade.npm}`} value={decisionNotes[grade.id] || ''} onChange={(event) => setDecisionNotes((previous) => ({ ...previous, [grade.id]: event.target.value }))} placeholder="Catatan keputusan (wajib)" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <button onClick={() => decide(grade.id, true)} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">Setujui revisi</button>
              <button onClick={() => decide(grade.id, false)} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Tolak</button>
            </div>
          </article>;
        })}
      </div>}
      {requests.length > 0 && <PaginationControls page={page} pageSize={pageSize} totalItems={requests.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} itemLabel="permintaan" />}
    </section>
  );
};
