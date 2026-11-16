import { notifySuccess } from './SuccessToast';
import React, { useEffect, useId, useRef, useState } from 'react';
import './data-transfer.css';
import { ChevronDown, ChevronLeft, ChevronRight, Download, FileDown, FileSpreadsheet, FileText, LoaderCircle, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { commitImport, fetchExport, fetchTemplate, prepareImport } from '../../lib/dataTransferService';
import { downloadSpreadsheet, readSpreadsheet, type FileFormat } from '../../lib/spreadsheet';
import { IMPORT_LIMIT, importHeaders, transferHelp, transferLabels, type DataRow, type ImportPlan, type TransferKind, type TransferScope } from '../../utils/dataTransfer';

function FormatMenu({ label, icon: Icon, disabled, onSelect }: { label: string; icon: typeof Upload; disabled: boolean; onSelect: (format: FileFormat) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  return <div ref={root} className="transfer-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!open) { setOpen(true); return; }
      const buttons = [...(menu.current?.querySelectorAll<HTMLButtonElement>('button') || [])];
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    }
  }}>
    <button type="button" ref={trigger} className="transfer-trigger" disabled={disabled} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}>
      <Icon size={16} aria-hidden="true" /><span>{label}</span><ChevronDown size={14} className={open ? 'rotate-180' : ''} aria-hidden="true" />
    </button>
    {open && <div ref={menu} id={id} role="menu" aria-label={`Pilih format ${label.toLowerCase()}`} className="transfer-options">
      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih format file</p>
      {(['csv', 'xlsx'] as const).map(format => <button type="button" role="menuitem" key={format} onClick={() => { setOpen(false); trigger.current?.focus(); onSelect(format); }}>
        <span className={`transfer-file-icon ${format === 'xlsx' ? 'is-excel' : ''}`}>{format === 'xlsx' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}</span>
        <span><strong>{format === 'xlsx' ? 'Excel (.xlsx)' : 'CSV (.csv)'}</strong><small>{format === 'xlsx' ? 'Workbook Microsoft Excel' : 'Teks dengan pemisah kolom'}</small></span>
      </button>)}
    </div>}
  </div>;
}

export function DataTransfer({ kind, scope = {}, contextLabel }: { kind: TransferKind; scope?: TransferScope; contextLabel?: string }) {
  const { currentUser, programStudi, semesters, classes } = useApp();
  const [busy, setBusy] = useState('');
  const busyRef = useRef(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [preview, setPreview] = useState<{ plan: ImportPlan; rows: DataRow[]; filename: string; scope: TransferScope; actorId: string } | null>(null);
  const [approved, setApproved] = useState(false);
  const [page, setPage] = useState(1);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const formatRef = useRef<FileFormat>('csv');
  const alive = useRef(true);
  const headingId = useId();
  const helpId = useId();
  const canImport = Boolean(importHeaders[kind]);
  const needsClass = kind === 'grades' || kind === 'enrollments';
  const disabled = Boolean(busy) || !currentUser || (needsClass && !scope.offeringId);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (preview && !dialog.current?.open) dialog.current?.showModal();
  }, [preview]);
  useEffect(() => {
    if (!preview) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [preview]);
  const closePreview = () => { if (!busyRef.current) { dialog.current?.close(); setPreview(null); } };
  const run = async (message: string, work: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(message); setNotice(null);
    try { await work(); }
    catch (error) { if (alive.current) setNotice({ text: error instanceof Error ? error.message : 'Operasi gagal. Periksa koneksi lalu coba lagi.', error: true }); }
    finally { busyRef.current = false; if (alive.current) setBusy(''); }
  };
  const exportFile = (format: FileFormat) => void run('Mengambil data terbaru…', async () => {
    const table = await fetchExport(kind, currentUser!.id, scope);
    if (!alive.current) return;
    if (!table.rows.length) throw new Error('Belum ada data sesuai filter untuk diekspor.');
    await downloadSpreadsheet(table, format, `simanis-${kind}-${new Date().toISOString().slice(0, 10)}`);
    setNotice({ text: `${table.rows.length} baris data terbaru berhasil disiapkan dalam format ${format.toUpperCase()}.`, error: false });
    notifySuccess(`Ekspor ${format.toUpperCase()} berhasil disiapkan.`);
  });
  const templateFile = (format: FileFormat) => void run('Menyiapkan template…', async () => {
    const { table, references } = await fetchTemplate(kind, currentUser!.id, scope);
    if (!alive.current) return;
    if (kind === 'grades' && !table.rows.length) throw new Error('Tidak ada peserta dengan nilai yang dapat diedit. Nilai terverifikasi memerlukan izin revisi.');
    if (table.rows.length > IMPORT_LIMIT) throw new Error(`Kelas memiliki lebih dari ${IMPORT_LIMIT} peserta. Ekspor nilai lalu bagi file menjadi maksimal ${IMPORT_LIMIT} baris untuk setiap impor.`);
    await downloadSpreadsheet(table, format, `template-${kind}`, format === 'xlsx' ? references : undefined);
    setNotice({ text: `Template ${format.toUpperCase()} siap diisi.${kind === 'grades' ? ' Komponen yang sudah ada ikut diisi agar tidak terhapus tanpa sengaja.' : ''}${format === 'xlsx' ? ' Lihat sheet Referensi untuk kode yang tersedia.' : ''}`, error: false });
  });
  const importFile = (file: File) => void run('Membaca file dan memeriksa data…', async () => {
    const selectedScope = { ...scope };
    const actorId = currentUser!.id;
    const rows = await readSpreadsheet(file, formatRef.current, kind);
    const plan = await prepareImport(kind, rows, actorId, selectedScope);
    if (!alive.current) return;
    setApproved(false); setPage(1); setPreview({ plan, rows, filename: file.name, scope: selectedScope, actorId });
  });
  const save = () => {
    if (!preview || !approved) return;
    void run('Menyimpan perubahan…', async () => {
      const count = await commitImport(kind, preview.rows, preview.plan, preview.actorId, preview.scope);
      if (!alive.current) return;
      dialog.current?.close(); setPreview(null);
      setNotice({ text: `${count} baris berhasil disimpan ke Firestore. Data pada aplikasi diperbarui secara realtime.`, error: false });
      notifySuccess(`${count} baris berhasil diimpor ke Firestore.`);
    });
  };
  const counts = { Baru: 0, Perbarui: 0, Tetap: 0, Gagal: 0 };
  preview?.plan.rows.forEach(r => counts[r.action]++);
  const pages = Math.ceil((preview?.plan.rows.length || 0) / 10);
  return <section className="data-transfer no-print" aria-label={`Impor dan ekspor ${transferLabels[kind]}`} aria-busy={Boolean(busy)}>
    <div className="transfer-bar">
      <div className="min-w-0"><p className="text-xs font-extrabold text-slate-800">{canImport ? 'Impor & ekspor data' : 'Unduh data'}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500 break-words">{contextLabel || transferLabels[kind]} · CSV / Excel{kind === 'my-grades' ? ' · Nilai pribadi' : ''}</p></div>
      <div className={`transfer-actions ${!canImport ? 'export-only' : ''}`}>
        {canImport && <FormatMenu label="Template" icon={FileDown} disabled={disabled} onSelect={templateFile} />}
        {canImport && <FormatMenu label="Impor" icon={Upload} disabled={disabled} onSelect={format => { formatRef.current = format; if (input.current) { input.current.accept = `.${format}`; input.current.value = ''; input.current.click(); } }} />}
        <FormatMenu label="Ekspor" icon={Download} disabled={disabled} onSelect={exportFile} />
      </div>
    </div>
    <input hidden ref={input} type="file" accept=".csv,.xlsx" aria-label="Pilih file impor" onChange={event => { const file = event.target.files?.[0]; if (file) importFile(file); }} />
    {canImport && <details className="transfer-help"><summary>Petunjuk impor & kode referensi</summary><div className="space-y-2 pt-2"><p>{transferHelp[kind]}</p><p>Maksimal {IMPORT_LIMIT} baris / 2 MB. Gunakan template; NPM dan NIDN disimpan sebagai teks. Kolom hasil perhitungan pada file ekspor tidak diimpor.</p>{['students', 'offerings'].includes(kind) && <div className="grid gap-2 sm:grid-cols-2"><p><b>Prodi:</b> {programStudi.map(p => `${p.kodeProdi} (${p.namaProdi})`).join('; ')}</p><p><b>Semester:</b> {semesters.map(s => s.nomorSemester).join(', ')}<br /><b>Kelas:</b> {classes.map(k => `${k.kodeKelas} (${programStudi.find(p => p.id === k.prodiId)?.kodeProdi || ''})`).join(', ')}</p></div>}</div></details>}
    <div aria-live="polite" role="status">{busy && <p className="transfer-status"><LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" />{busy}</p>}{notice && !preview && <p className={`transfer-status ${notice.error ? 'is-error' : 'is-success'}`}>{notice.error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}{notice.text}</p>}</div>
    {preview && <dialog ref={dialog} className="transfer-dialog" aria-labelledby={headingId} aria-describedby={helpId} onCancel={event => { event.preventDefault(); closePreview(); }}>
      <div className="transfer-dialog-layout">
        <header className="transfer-dialog-header"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-[#367FA9]">Periksa sebelum menyimpan</p><h2 id={headingId} className="mt-1 text-lg font-extrabold text-slate-900">Pratinjau impor {transferLabels[kind]}</h2><p className="mt-1 truncate text-xs text-slate-500" title={preview.filename}>{preview.filename}</p>{contextLabel && <p className="mt-1 text-xs font-semibold text-[#045A8C] break-words">{contextLabel}</p>}</div><button type="button" aria-label="Tutup pratinjau" className="transfer-close" disabled={Boolean(busy)} onClick={closePreview}><X size={20} /></button></header>
        <div className="transfer-preview-body">
          <p id={helpId} className="text-xs leading-relaxed text-slate-600">{transferHelp[kind]} Data belum disimpan. Periksa perubahan di bawah ini.</p>
          <div className="transfer-counts">{Object.entries(counts).map(([action, count]) => <div key={action} data-action={action}><strong>{count}</strong><span>{action === 'Gagal' ? 'Bermasalah' : action}</span></div>)}</div>
          {counts.Gagal > 0 && <p role="alert" className="transfer-status is-error"><AlertCircle size={18} />Ada {counts.Gagal} baris bermasalah. Perbaiki file lalu pilih ulang; seluruh impor ditahan.</p>}
          <div className="transfer-preview-rows">{preview.plan.rows.slice((page - 1) * 10, page * 10).map(row => <article className="transfer-preview-row" key={row.line}>
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="text-[10px] font-semibold text-slate-400">Baris {row.line}</span><p className="text-sm font-bold text-slate-800 break-words">{row.label}</p></div><span className="transfer-badge" data-action={row.action}>{row.action}</span></div><p className={`mt-2 text-xs leading-relaxed ${row.action === 'Gagal' ? 'text-red-700' : 'text-slate-500'}`}>{row.detail}</p>
            <details className="mt-2 text-xs text-slate-600"><summary className="cursor-pointer py-2 font-semibold">Lihat isi baris</summary><dl className="transfer-values">{Object.entries(row.values).map(([field, value]) => <div key={field}><dt>{field}</dt><dd>{value || 'Kosong'}</dd></div>)}</dl></details>
          </article>)}</div>
          {pages > 1 && <nav className="flex items-center justify-between gap-2 pt-4 text-xs" aria-label="Halaman pratinjau"><button type="button" className="transfer-close" aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={18} /></button><span>Halaman {page} dari {pages}</span><button type="button" className="transfer-close" aria-label="Halaman berikutnya" disabled={page === pages} onClick={() => setPage(page + 1)}><ChevronRight size={18} /></button></nav>}
        </div>
        <footer className="transfer-dialog-footer">
          {notice && <p role="alert" className={`transfer-status ${notice.error ? 'is-error' : 'is-success'}`}>{notice.text}</p>}
          {!counts.Gagal && preview.plan.changes.length > 0 && <label className="transfer-confirm"><input type="checkbox" checked={approved} disabled={Boolean(busy)} onChange={event => setApproved(event.target.checked)} /><span>Saya sudah memeriksa {counts.Baru} data baru dan {counts.Perbarui} pembaruan, serta menyetujui penyimpanannya.</span></label>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" className="transfer-secondary" disabled={Boolean(busy)} onClick={closePreview}>{counts.Gagal ? 'Tutup & perbaiki file' : 'Batal'}</button><button type="button" className="transfer-primary" disabled={Boolean(busy) || !approved || counts.Gagal > 0 || !preview.plan.changes.length} onClick={save}>{busy ? <><LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" />{busy}</> : `Simpan ${counts.Baru + counts.Perbarui} baris`}</button></div>
        </footer>
      </div>
    </dialog>}
  </section>;
}
