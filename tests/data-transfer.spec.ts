import { test, expect, type Page } from '@playwright/test';
import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, doc, getDoc, getDocs, collection, writeBatch, getFirestore, setDoc } from 'firebase/firestore';
import { transferFixture } from '../src/utils/dataTransfer.fixture';
import { spreadsheetBytes } from '../src/lib/spreadsheet';

const projectId = 'demo-transfer-tests';
const db = getFirestore(initializeApp({ projectId, apiKey: 'emulator-test-key', appId: 'emulator-tests' }, 'transfer-tests'));
connectFirestoreEmulator(db, '127.0.0.1', 8085);
test.beforeEach(async ({ request }) => {
  const response = await request.delete(`http://127.0.0.1:8085/emulator/v1/projects/${projectId}/databases/(default)/documents`);
  expect(response.ok()).toBeTruthy();
  const batch = writeBatch(db);
  for (const [name, values] of Object.entries(transferFixture())) for (const value of values) batch.set(doc(db, name, value.id), value);
  await batch.commit();
});

async function login(page: Page, username = 'admin') {
  await page.goto('/');
  await page.getByPlaceholder('admin@uhm.ac.id').fill(username);
  await page.locator('input[type="password"]').fill('TestOnly123');
  await page.getByRole('button', { name: 'Masuk ke Sistem', exact: true }).click();
}
async function studentPage(page: Page, mobile: boolean) {
  await page.getByRole('button', { name: mobile ? 'Mahasiswa' : 'Data Mahasiswa', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Manajemen Data Mahasiswa' })).toBeVisible();
}
async function upload(page: Page, content: string | Buffer, format = 'csv') {
  await page.getByRole('button', { name: 'Impor', exact: true }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('menuitem', { name: format === 'csv' ? /CSV/ : /Excel/ }).click();
  await (await chooser).setFiles({ name: `import.${format}`, mimeType: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: typeof content === 'string' ? Buffer.from(content) : content });
  await expect(page.getByRole('dialog')).toBeVisible();
}
const studentCsv = 'npm,nama,email,kode_prodi,semester,kode_kelas,angkatan,password\r\n002,Budi,budi@example.test,SK,1,PASCA-1,2026,TestOnly123';

test('CSV import is confirmed, written to Firestore, and updates the live list', async ({ page }) => {
  await login(page); await studentPage(page, false);
  await upload(page, studentCsv);
  expect((await getDocs(collection(db, 'students'))).size).toBe(1);
  await expect(page.getByRole('button', { name: 'Simpan 1 baris' })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Simpan 1 baris' }).click();
  await expect(page.getByRole('dialog', { name: /Pratinjau impor/ })).not.toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Berhasil!' })).toBeVisible();
  await page.getByRole('button', { name: 'Selesai', exact: true }).click();
  await expect(page.getByText('1 baris berhasil disimpan ke Firestore.', { exact: false })).toBeVisible();
  const students = await getDocs(collection(db, 'students'));
  expect(students.size).toBe(2);
  const student = students.docs.find(d => d.data().npm === '002')!.data();
  const account = await getDoc(doc(db, 'users', student.userId));
  expect(account.data()?.role).toBe('mahasiswa'); expect(account.data()?.username).toBe('002');
  await expect(page.getByRole('cell', { name: 'Budi', exact: true })).toBeVisible();
});

for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 360, height: 740 }]) {
  test(`responsive dropdown, keyboard, preview and cancel ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await login(page); await studentPage(page, viewport.width < 768);
    for (const name of ['Template', 'Impor', 'Ekspor']) {
      const trigger = page.getByRole('button', { name, exact: true });
      const box = await trigger.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
      await trigger.click();
      const menu = page.getByRole('menu');
      const bounds = await menu.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
      await expect(page.getByRole('menuitem', { name: /CSV/ })).toBeFocused();
      await page.keyboard.press('ArrowDown'); await expect(page.getByRole('menuitem', { name: /Excel/ })).toBeFocused();
      await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
    }
    await upload(page, studentCsv);
    const modal = page.getByRole('dialog');
    const box = await modal.boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.width).toBeLessThanOrEqual(viewport.width);
    expect(await modal.evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy();
    await page.screenshot({ path: `test-results/preview-${viewport.width}.png`, animations: 'disabled' });
    await page.getByRole('button', { name: 'Batal', exact: true }).click();
    expect((await getDocs(collection(db, 'students'))).size).toBe(1);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('simanis-success', { detail: 'Feedback berhasil dikirim.' })));
    const success = page.getByRole('dialog', { name: 'Berhasil!' });
    await expect(success).toBeVisible();
    const rect = await success.boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(viewport.width);
    expect(Math.abs(rect!.x + rect!.width / 2 - viewport.width / 2)).toBeLessThan(2);
    await expect(success.locator('h2')).toHaveCSS('font-weight', '800');
    await expect(success).not.toBeVisible({ timeout: 5000 });
  });
}

test('XLSX grades update Firestore and export latest values; verified grades remain locked', async ({ page }) => {
  await login(page, 'dosen01');
  await page.getByRole('button', { name: 'Pengolahan Nilai & Bobot', exact: true }).click();
  const blob = await spreadsheetBytes({ headers: ['npm', 'nilai_tugas', 'nilai_uts', 'nilai_uas'], rows: [['001', 90, 80, 85]] }, 'xlsx');
  await upload(page, Buffer.from(await blob.arrayBuffer()), 'xlsx');
  await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'Simpan 1 baris' }).click();
  await expect(page.getByRole('dialog', { name: /Pratinjau impor/ })).not.toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Berhasil!' })).toBeVisible();
  await page.getByRole('button', { name: 'Selesai', exact: true }).click();
  const grade = (await getDoc(doc(db, 'grades', 'g'))).data()!;
  expect(grade.nilaiUAS).toBe(85); expect(grade.statusVerifikasi).toBe('Menunggu Verifikasi');
  expect((await getDocs(collection(db, 'verificationHistory'))).size).toBe(1);
  for (const format of ['CSV', 'Excel']) {
    await page.getByRole('button', { name: 'Ekspor', exact: true }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: new RegExp(format) }).click();
    expect((await download).suggestedFilename()).toMatch(format === 'CSV' ? /\.csv$/ : /\.xlsx$/);
    await page.getByRole('button', { name: 'Selesai', exact: true }).click();
  }
  await setDoc(doc(db, 'grades', 'g'), { ...grade, statusVerifikasi: 'Terverifikasi' });
  await upload(page, 'npm,nilai_tugas,nilai_uts,nilai_uas\n001,70,70,70');
  await expect(page.getByText('Nilai terverifikasi terkunci;', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simpan 0 baris' })).toBeDisabled();
});

test('transaction rollback on rejected write, stale preview conflict, and export isolation', async ({ page }) => {
  await login(page);
  const results = await page.evaluate(async () => {
    const path = '/src/lib/dataTransferService.ts';
    const { prepareImport, commitImport, fetchExport, fetchTemplate } = await import(path);
    const rows = [{ kode_mk: 'OK', nama_mk: 'Valid', sks: '3', semester_paket: '1' }, { kode_mk: 'BLOCKED', nama_mk: 'Ditolak Rules', sks: '3', semester_paket: '1' }];
    const plan = await prepareImport('courses', rows, 'admin', {});
    let rejected = false;
    try { await commitImport('courses', rows, plan, 'admin', {}); } catch { rejected = true; }
    const own = await fetchExport('my-grades', 'student-user', {});
    const template = await fetchTemplate('grades', 'lecturer', { offeringId: 'o' });
    return { rejected, ownRows: own.rows.length, templateHeaders: template.table.headers, templateRow: template.table.rows[0] };
  });
  expect(results.rejected).toBeTruthy(); expect(results.ownRows).toBe(1);
  expect(results.templateHeaders).toContain('id_penawaran');
  expect(results.templateRow).toEqual(['001', 'Ayu', 80, null, null, 'o']);
  expect((await getDocs(collection(db, 'courses'))).size).toBe(1);
  await studentPage(page, false); await upload(page, studentCsv);
  await setDoc(doc(db, 'users', 'collision'), { id: 'collision', name: 'Other', username: 'other', email: 'budi@example.test', role: 'dosen', isActive: true, createdAt: '' });
  await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'Simpan 1 baris' }).click();
  await expect(page.getByRole('alert')).toContainText('Data Firestore berubah');
  expect((await getDocs(collection(db, 'students'))).size).toBe(1);
});

test('a concurrent edit to an existing target must be reviewed again before overwriting', async ({ page }) => {
  await login(page); await studentPage(page, false);
  await upload(page, 'npm,nama,email,kode_prodi,semester,kode_kelas,angkatan,password\n001,Nama Impor,ayu@example.test,SK,1,PASCA-1,2026,');
  await setDoc(doc(db, 'students', 'student'), { ...transferFixture().students[0], nama: 'Diubah oleh admin lain' });
  await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'Simpan 1 baris' }).click();
  await expect(page.getByRole('alert')).toContainText('Data Firestore berubah');
  expect((await getDoc(doc(db, 'students', 'student'))).data()?.nama).toBe('Diubah oleh admin lain');
  expect((await getDoc(doc(db, 'users', 'student-user'))).data()?.name).toBe('Ayu');
});

