import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemLabel?: string;
}

export const paginate = <T,>(items: T[], page: number, pageSize: number) =>
  items.slice((page - 1) * pageSize, page * pageSize);

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'data'
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const firstItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-slate-500">
        <span>Baris per halaman</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label="Jumlah baris per halaman"
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {[10, 20, 30].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <span className="hidden sm:inline">Menampilkan {firstItem}–{lastItem} dari {totalItems} {itemLabel}</span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <span className="text-slate-500 sm:hidden">{firstItem}–{lastItem} dari {totalItems}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage === 1 || totalItems === 0}
            aria-label="Halaman sebelumnya"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-20 text-center font-bold text-slate-700">{safePage} / {totalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages || totalItems === 0}
            aria-label="Halaman berikutnya"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
