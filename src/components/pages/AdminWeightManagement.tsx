import React, { useEffect, useState } from 'react';
import { CheckCircle2, Save, Sliders } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { validateWeights } from '../../utils/gradeCalculation';

export const AdminWeightManagement: React.FC = () => {
  const { offerings, courses, classes, weights, saveWeights } = useApp();
  const [offeringId, setOfferingId] = useState(offerings[0]?.id || '');
  const current = weights.find((item) => item.penawaranId === offeringId) || { bobotTugas: 30, bobotUTS: 30, bobotUAS: 40 };
  const [tugas, setTugas] = useState(current.bobotTugas);
  const [uts, setUts] = useState(current.bobotUTS);
  const [uas, setUas] = useState(current.bobotUAS);
  const [notice, setNotice] = useState<string | null>(null);
  const validation = validateWeights(tugas, uts, uas);

  useEffect(() => { setTugas(current.bobotTugas); setUts(current.bobotUTS); setUas(current.bobotUAS); setNotice(null); }, [offeringId, current.bobotTugas, current.bobotUTS, current.bobotUAS]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const result = saveWeights(offeringId, tugas, uts, uas);
    setNotice(result.success ? 'Bobot berhasil diperbarui. Nilai akhir akan mengikuti konfigurasi terbaru.' : result.error || 'Bobot gagal diperbarui.');
  };

  return <section className="rounded-[28px] border border-white/90 bg-white/80 p-5 shadow-sm md:p-7">
    <div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#045A8C]"><Sliders className="h-5 w-5" /></div><div><h3 className="font-extrabold text-slate-900">Atur Bobot Penilaian</h3><p className="mt-1 text-xs text-slate-500">Bobot tetap dapat diubah meskipun nilai mahasiswa sudah terverifikasi. Total wajib 100%.</p></div></div>
    <form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-5 md:items-end">
      <label className="text-xs font-bold text-slate-700 md:col-span-2">Mata kuliah & kelas<select value={offeringId} onChange={(event) => setOfferingId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"><option value="">Pilih kelas</option>{offerings.map((offering) => { const course = courses.find((item) => item.id === offering.mataKuliahId); const room = classes.find((item) => item.id === offering.kelasId); return <option key={offering.id} value={offering.id}>{course?.kodeMK} — {course?.namaMK} ({room?.kodeKelas})</option>; })}</select></label>
      <label className="text-xs font-bold text-slate-700">Tugas<input type="number" min="0" max="100" value={tugas} onChange={(event) => setTugas(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
      <label className="text-xs font-bold text-slate-700">UTS<input type="number" min="0" max="100" value={uts} onChange={(event) => setUts(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
      <label className="text-xs font-bold text-slate-700">UAS<input type="number" min="0" max="100" value={uas} onChange={(event) => setUas(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
      <div className="md:col-span-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className={`text-xs font-bold ${validation.isValid ? 'text-emerald-700' : 'text-red-700'}`}>Total bobot: {validation.total}% {validation.isValid ? '✓ Valid' : '— wajib 100%'}</span><button disabled={!offeringId || !validation.isValid} className="inline-flex items-center gap-1.5 rounded-xl bg-[#045A8C] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Save className="h-4 w-4" />Simpan Bobot</button></div>
    </form>
    {notice && <p className="mt-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-800"><CheckCircle2 className="h-4 w-4" />{notice}</p>}
  </section>;
};
