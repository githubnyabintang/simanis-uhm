import Papa from 'papaparse';
import type { DataRow, TableData, TransferKind } from '../utils/dataTransfer';
import { IMPORT_LIMIT, importHeaders } from '../utils/dataTransfer';

export type FileFormat = 'csv' | 'xlsx';
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
const optionalHeaders = new Set(['password', 'deskripsi', 'ruang', 'jadwal', 'status_publikasi']);
const exportOnlyHeaders: Partial<Record<TransferKind, string[]>> = {
  users: ['npm', 'role', 'status_aktif'],
  enrollments: ['nama', 'kode_mk', 'nama_mk', 'kode_kelas', 'periode', 'nama_dosen', 'id_penawaran'],
  grades: ['nama', 'kode_mk', 'nama_mk', 'kode_kelas', 'periode', 'nama_dosen', 'id_penawaran', 'bobot_tugas', 'bobot_uts', 'bobot_uas', 'nilai_akhir', 'nilai_huruf', 'status_verifikasi'],
};

export function parseCsv(text: string): string[][] {
  const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), { skipEmptyLines: 'greedy', dynamicTyping: false, delimitersToGuess: [',', ';', '\t'], preview: IMPORT_LIMIT + 2 });
  const error = parsed.errors.find(e => e.code !== 'UndetectableDelimiter');
  if (error) throw new Error(`CSV tidak valid: ${error.message}`);
  return parsed.data;
}

export function validateTable(matrix: string[][], kind: TransferKind): DataRow[] {
  if (matrix.length < 2) throw new Error('File belum berisi data. Isi baris di bawah judul kolom template.');
  if (matrix.length > IMPORT_LIMIT + 1) throw new Error(`Maksimal ${IMPORT_LIMIT} baris data per impor. Bagi file menjadi beberapa bagian.`);
  const headers = matrix[0].map(h => h.trim().toLowerCase());
  if (headers.some(h => !h) || new Set(headers).size !== headers.length) throw new Error('Judul kolom kosong atau berulang. Gunakan template yang disediakan.');
  const schema = importHeaders[kind];
  if (!schema) throw new Error('Halaman ini tidak mendukung impor.');
  const missing = schema.filter(h => !optionalHeaders.has(h) && !headers.includes(h));
  if (missing.length) throw new Error(`Kolom wajib tidak ditemukan: ${missing.join(', ')}.`);
  const allowed = new Set([...schema, ...(exportOnlyHeaders[kind] || [])]);
  const unknown = headers.filter(h => !allowed.has(h));
  if (unknown.length) throw new Error(`Kolom tidak dikenali: ${unknown.join(', ')}. Gunakan template halaman ini.`);
  return matrix.slice(1).map((cells, index) => {
    if (cells.length > headers.length || (cells.length < headers.length && cells.length !== 0)) throw new Error(`Baris data ${index + 1}: jumlah kolom berbeda dari header.`);
    if (cells.some(v => v.length > 5000)) throw new Error(`Baris data ${index + 1}: isi sel terlalu panjang.`);
    return Object.fromEntries(headers.map((header, column) => [header, header === 'password' ? (cells[column] || '') : (cells[column] || '').trim()]));
  });
}

export async function readSpreadsheet(file: File, format: FileFormat, kind: TransferKind): Promise<DataRow[]> {
  if (!file.name.toLowerCase().endsWith(`.${format}`)) throw new Error(`Pilih file .${format} sesuai format yang dipilih.`);
  if (file.size > MAX_FILE_BYTES) throw new Error('Ukuran file maksimal 2 MB.');
  if (!file.size) throw new Error('File kosong.');
  if (format === 'csv') return validateTable(parseCsv(await file.text()), kind);
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.load(await file.arrayBuffer()); }
  catch { throw new Error('File Excel tidak dapat dibaca. Gunakan .xlsx yang tidak diproteksi password.'); }
  const sheets = workbook.worksheets.filter(s => s.name !== 'Referensi');
  if (sheets.length !== 1) throw new Error('Gunakan satu sheet data. Sheet Referensi dari template boleh tetap ada.');
  const sheet = sheets[0];
  if (sheet.actualRowCount > IMPORT_LIMIT + 1 || sheet.rowCount > IMPORT_LIMIT + 1 || sheet.columnCount > 40) throw new Error(`Excel maksimal ${IMPORT_LIMIT} baris data dan 40 kolom; hapus baris/kolom tambahan.`);
  const width = sheet.getRow(1).cellCount;
  const matrix: string[][] = [];
  for (let n = 1; n <= sheet.rowCount; n++) {
    const row = sheet.getRow(n);
    const cells = Array.from({ length: Math.max(width, row.cellCount) }, (_, i) => {
      const cell = row.getCell(i + 1);
      if (cell.value === null || cell.value === undefined) return '';
      if (typeof cell.value === 'object') throw new Error(`Sel ${cell.address}: gunakan teks atau angka biasa, tanpa rumus, tautan, atau tanggal otomatis.`);
      if (typeof cell.value === 'number' && !Number.isSafeInteger(cell.value) && ['npm', 'nidn'].includes(String(sheet.getRow(1).getCell(i + 1).value).toLowerCase())) throw new Error(`Sel ${cell.address}: identitas harus disimpan sebagai Text.`);
      return typeof cell.value === 'number' && cell.numFmt && /^0+$/.test(cell.numFmt) ? cell.text.padStart(cell.numFmt.length, '0') : String(cell.value);
    });
    if (cells.some(Boolean)) matrix.push(cells);
  }
  return validateTable(matrix, kind);
}

export function csvContent(table: TableData): string {
  return '\uFEFF' + Papa.unparse({ fields: table.headers, data: table.rows }, { quotes: true, newline: '\r\n', escapeFormulae: /^[\s]*[=+\-@]|^[\t\r]/ });
}

export async function spreadsheetBytes(table: TableData, format: FileFormat, references?: TableData): Promise<Blob> {
  if (format === 'csv') return new Blob([csvContent(table)], { type: 'text/csv;charset=utf-8' });
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIMANIS UHM';
  const addSheet = (name: string, data: TableData) => {
    const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = data.headers.map(header => ({ header, key: header, width: Math.max(18, Math.min(32, header.length + 6)) }));
    sheet.addRows(data.rows);
    sheet.getRow(1).height = 28;
    sheet.getRow(1).eachCell(cell => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF045A8C' } }; cell.alignment = { vertical: 'middle' }; });
    data.headers.forEach((header, i) => {
      if (['npm', 'nidn', 'username', 'password', 'angkatan', 'kode_mk', 'kode_kelas', 'kode_prodi'].includes(header)) sheet.getColumn(i + 1).numFmt = '@';
    });
    if (data.rows.length) sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: data.rows.length + 1, column: data.headers.length } };
  };
  addSheet('Data', table);
  if (references) addSheet('Referensi', references);
  const bytes = await workbook.xlsx.writeBuffer();
  return new Blob([new Uint8Array(bytes)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function downloadSpreadsheet(table: TableData, format: FileFormat, filename: string, references?: TableData) {
  const blob = await spreadsheetBytes(table, format, references);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `${filename}.${format}`; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
