import { notifySuccess } from '../common/SuccessToast';
import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, Star, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const RatingInput: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
  <fieldset>
    <legend className="text-xs font-bold text-slate-700">{label}</legend>
    <div className="mt-1.5 flex gap-1" aria-label={label}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          aria-label={`${rating} bintang`}
          className="rounded p-0.5 text-amber-400 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          <Star className="h-6 w-6" fill={rating <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  </fieldset>
);

export const FeedbackModal: React.FC = () => {
  const { currentUser, feedbackModalOpen, closeFeedbackModal, submitFeedback } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ratingTampilan, setRatingTampilan] = useState(0);
  const [ratingNavigasi, setRatingNavigasi] = useState(0);
  const [ratingKenyamanan, setRatingKenyamanan] = useState(0);
  const [saran, setSaran] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const isGuest = !currentUser;
  const canSubmit = currentUser?.role !== 'admin';

  useEffect(() => {
    if (!feedbackModalOpen) return;
    setName(currentUser?.name || '');
    setEmail(currentUser?.email || '');
    setRatingTampilan(0);
    setRatingNavigasi(0);
    setRatingKenyamanan(0);
    setSaran('');
    setMessage(null);
  }, [feedbackModalOpen, currentUser]);

  if (!feedbackModalOpen || !canSubmit) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = submitFeedback({
      nama: currentUser?.name || name,
      email: currentUser?.email || email,
      role: currentUser?.role === 'dosen' ? 'dosen' : currentUser?.role === 'mahasiswa' ? 'mahasiswa' : 'pengunjung',
      userId: currentUser?.id,
      ratingTampilan,
      ratingNavigasi,
      ratingKenyamanan,
      saran: saran.trim()
    });
    if (!result.success) {
      setMessage(result.error || 'Feedback belum dapat dikirim.');
      return;
    }
    closeFeedbackModal();
    notifySuccess('Terima kasih. Feedback Anda berhasil dikirim.');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/90 bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#045A8C]"><MessageSquareHeart className="h-5 w-5" /></div>
            <div><h2 id="feedback-title" className="font-black text-slate-900">Feedback SIMANIS UHM</h2><p className="mt-1 text-xs text-slate-500">Masukan Anda membantu kami meningkatkan layanan.</p></div>
          </div>
          <button type="button" onClick={closeFeedbackModal} aria-label="Tutup feedback" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 space-y-5">
          {isGuest ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700">Nama <span className="text-red-500">*</span><input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Nama Anda" /></label>
              <label className="text-xs font-bold text-slate-700">Email <span className="text-red-500">*</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="email@contoh.com" /></label>
            </div>
          ) : <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">Feedback dikirim sebagai <strong>{currentUser?.name}</strong> ({currentUser?.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}).</div>}

          <RatingInput label="1. Bagaimana tampilan website ini?" value={ratingTampilan} onChange={setRatingTampilan} />
          <RatingInput label="2. Seberapa mudah navigasi dan penggunaan fitur?" value={ratingNavigasi} onChange={setRatingNavigasi} />
          <RatingInput label="3. Bagaimana kenyamanan Anda saat menggunakan sistem?" value={ratingKenyamanan} onChange={setRatingKenyamanan} />
          <label className="block text-xs font-bold text-slate-700">Apa yang perlu ditambahkan atau diperbaiki?<textarea value={saran} onChange={(event) => setSaran(event.target.value)} rows={4} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Tuliskan masukan atau saran Anda..." /></label>
        </div>

        {message && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-800">{message}</p>}
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={closeFeedbackModal} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Batal</button><button type="submit" className="rounded-xl bg-gradient-to-r from-[#367FA9] to-[#3C8DBC] px-4 py-2.5 text-xs font-bold text-white">Kirim Feedback</button></div>
      </form>
    </div>
  );
};
