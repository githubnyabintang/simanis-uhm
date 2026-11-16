import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import './success-toast.css';

export function notifySuccess(message: string) {
  window.dispatchEvent(new CustomEvent('simanis-success', { detail: message }));
}

export function SuccessToast() {
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const onSuccess = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      window.clearTimeout(timer.current);
      setToast({ message, id: Date.now() });
      timer.current = window.setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('simanis-success', onSuccess);
    return () => { window.removeEventListener('simanis-success', onSuccess); window.clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (toast && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!toast && dialog.current?.open) dialog.current.close();
  }, [toast]);
  return <dialog ref={dialog} className="success-dialog no-print fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm" aria-labelledby="success-title" aria-describedby="success-message" onCancel={event => { event.preventDefault(); setToast(null); }} onClose={() => setToast(null)}>
    {toast && <div className="success-card relative flex flex-col items-center px-7 pb-8 pt-10 text-center" key={toast.id}>
      <button type="button" className="success-close absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500" aria-label="Tutup notifikasi" onClick={() => setToast(null)}><X size={20} /></button>
      <span className="success-toast-icon flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-100"><Check size={30} strokeWidth={3} /></span>
      <h2 id="success-title" className="mt-5 text-2xl font-black tracking-tight text-slate-900">Berhasil!</h2><p id="success-message" role="status" className="mt-2 text-sm leading-relaxed text-slate-500">{toast.message}</p>
      <button type="button" className="success-done mt-6 min-h-11 w-full rounded-2xl bg-gradient-to-r from-[#045A8C] to-[#3C8DBC] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-blue-500" onClick={() => setToast(null)}>Selesai</button>
      <div className="success-toast-progress" />
    </div>}
  </dialog>;
}
