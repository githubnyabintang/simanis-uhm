import test from 'node:test';
import assert from 'node:assert/strict';
import { csvContent, parseCsv, readSpreadsheet, spreadsheetBytes, validateTable } from './spreadsheet';

test('CSV round-trip preserves commas, quotes, newlines, Unicode and leading zeros', () => {
  const table = { headers: ['npm', 'nama'], rows: [['00123', 'Nur "Ayu", S.Kom.\nMakassar'], ['002', 'Azizah é']] };
  assert.deepEqual(parseCsv(csvContent(table)), [table.headers, ...table.rows]);
  assert.deepEqual(parseCsv('npm;nama\r\n001;Ayu'), [['npm', 'nama'], ['001', 'Ayu']]);
});
test('CSV neutralizes spreadsheet formulas and rejects duplicate, missing and unknown headers', () => {
  assert.ok(csvContent({ headers: ['nama'], rows: [['=HYPERLINK("bad")'], [' @SUM(A1)']] }).includes("'=HYPERLINK"));
  assert.throws(() => validateTable([['npm', 'npm'], ['001', '001']], 'enrollments'));
  assert.throws(() => validateTable([['nama'], ['Ayu']], 'enrollments'));
  assert.throws(() => validateTable([['npm', 'unknown'], ['001', 'x']], 'enrollments'));
  assert.throws(() => validateTable([['npm'], ...Array.from({ length: 101 }, () => ['001'])], 'enrollments'));
  assert.throws(() => parseCsv('npm,nama\n001,"unclosed'));
});
test('XLSX round-trip retains text identifiers, zero and empty grades', async () => {
  const table = { headers: ['npm', 'nilai_tugas', 'nilai_uts', 'nilai_uas'], rows: [['000001', 0, null, 85.5]] };
  const blob = await spreadsheetBytes(table, 'xlsx');
  const file = new File([await blob.arrayBuffer()], 'nilai.xlsx');
  assert.deepEqual(await readSpreadsheet(file, 'xlsx', 'grades'), [{ npm: '000001', nilai_tugas: '0', nilai_uts: '', nilai_uas: '85.5' }]);
});
test('XLSX formula cells, mismatched extensions and oversized files fail before import', async () => {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data');
  sheet.addRow(['npm']); sheet.addRow([{ formula: '1+1', result: 2 }]);
  const file = new File([new Uint8Array(await workbook.xlsx.writeBuffer())], 'peserta.xlsx');
  await assert.rejects(() => readSpreadsheet(file, 'xlsx', 'enrollments'), /tanpa rumus/);
  await assert.rejects(() => readSpreadsheet(file, 'csv', 'enrollments'), /\.csv/);
  await assert.rejects(() => readSpreadsheet(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'x.csv'), 'csv', 'enrollments'), /2 MB/);
});
