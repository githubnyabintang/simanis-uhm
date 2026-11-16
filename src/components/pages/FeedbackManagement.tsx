import React, { useMemo, useState } from 'react';
import { MessageSquareHeart, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaginationControls, paginate } from '../common/PaginationControls';
import { DataTransfer } from '../common/DataTransfer';

const roleLabel = { dosen: 'Dosen', mahasiswa: 'Mahasiswa', pengunjung: 'Pengunjung' };

const Stars: React.FC<{ rating: number }> = ({ rating }) => <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${rating} dari 5 bintang`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-3.5 w-3.5" fill={star <= rating ? 'currentColor' : 'none'} />)}</span>;

export const FeedbackManagement: React.FC = () => {
  const { feedback } = useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const orderedFeedback = useMemo(() => [...feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [feedback]);
  const rows = paginate(orderedFeedback, page, pageSize);

  const updatePageSize = (size: number) => { setPageSize(size); setPage(1); };

  return <div className="space-y-6 pb-12 animate-in fade-in">
    <header><div className="flex items-center gap-2"><h2 className="text-xl font-black text-slate-800">Feedback Pengguna</h2><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-[#045A8C]">{feedback.length}</span></div><p className="mt-1 text-xs text-slate-500">Tinjau seluruh masukan dari dosen, mahasiswa, dan pengunjung.</p></header>
    <DataTransfer kind="feedback" contextLabel="Seluruh feedback pengguna" />
    <section className="rounded-[28px] border border-white/90 bg-white/80 p-5 shadow-[0_12px_40px_rgba(4,90,140,0.06)] md:p-7">
      {rows.length === 0 ? <div className="py-12 text-center"><MessageSquareHeart className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">Belum ada feedback yang masuk.</p></div> : <>
        <div className="space-y-4">
          {rows.map((item) => <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{item.nama}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{roleLabel[item.role]}</span></div><p className="mt-1 text-xs text-slate-500">{item.email} · {new Date(item.createdAt).toLocaleString('id-ID')}</p></div><div className="grid grid-cols-3 gap-3 text-[10px] text-slate-500"><span>Tampilan <Stars rating={item.ratingTampilan} /></span><span>Navigasi <Stars rating={item.ratingNavigasi} /></span><span>Kenyamanan <Stars rating={item.ratingKenyamanan} /></span></div></div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">{item.saran || <em className="text-slate-400">Tidak ada saran tertulis.</em>}</p>
          </article>)}
        </div>
        <PaginationControls page={page} pageSize={pageSize} totalItems={orderedFeedback.length} onPageChange={setPage} onPageSizeChange={updatePageSize} itemLabel="feedback" />
      </>}
    </section>
  </div>;
};
