# Struktur Firestore SIMANIS UHM

Ini rancangan mapping dari tipe TypeScript di `src/types/index.ts`, bukan daftar
collection yang sudah ada di Console. Firestore tidak membuat tabel atau
collection dari file ini: collection muncul saat dokumen pertama ditulis.
`firestore.rules` mengatur izin baca/tulis, bukan membuat data.

## Akun dan identitas

Untuk demonstrasi tanpa Firebase Authentication, profil akun disimpan pada
`users/{id}`. Login demo memeriksa `demoPassword` bila field tersebut ada;
field ini dapat dibaca dari Firestore dan bukan autentikasi yang aman. Jangan
menyimpan password asli atau data pribadi nyata di database yang terbuka.

Field profil dari `User`:

- `id` (string; sama dengan ID dokumen)
- `name`, `username`, `email` (string)
- `role` (`admin` | `dosen` | `mahasiswa`)
- `isActive` (boolean), `createdAt` (string ISO)
- Opsional: `avatar`, `nidn`, `npm`, `prodiId`, `demoPassword` (data demonstrasi yang dapat dibaca publik)

Role dan `isActive` digunakan oleh tampilan demo. Rules terbuka tidak dapat
menegakkan hak akses berdasarkan role tersebut.

## Collection akademik

Gunakan nama collection dan field berikut. Dokumen sebaiknya memakai nilai `id`
yang sama dengan field `id` agar referensi dari aplikasi tetap mudah dipetakan.

| Collection | Tipe sumber | Field utama |
|---|---|---|
| `programStudi` | `ProgramStudi` | `id`, `kodeProdi`, `namaProdi`, `jenjang` |
| `semesters` | `Semester` | `id`, `nomorSemester`, `namaSemester` |
| `classes` | `Kelas` | `id`, `kodeKelas`, `namaKelas`, `prodiId` |
| `courses` | `MataKuliah` | `id`, `kodeMK`, `namaMK`, `sks`, `semesterPaket`, opsional `deskripsi` |
| `offerings` | `PenawaranMataKuliah` | `id`, `mataKuliahId`, `prodiId`, `semesterId`, `kelasId`, `dosenId`, `periodeAkademik`, opsional `ruang`, `jadwal`, `statusPublikasi` |
| `students` | `Mahasiswa` | `id`, `npm`, `nama`, `prodiId`, `semesterId`, opsional `kelasAsalId`, `userId`, `email`, `angkatan` |
| `enrollments` | `PesertaMataKuliah` | `id`, `penawaranId`, `npm`, `createdAt` |
| `weights` | `BobotNilai` | `id`, `penawaranId`, `bobotTugas`, `bobotUTS`, `bobotUAS`, `updatedAt` |
| `grades` | `NilaiMahasiswa` | `id`, `pesertaId`, `penawaranId`, `npm`, `nilaiTugas`, `nilaiUTS`, `nilaiUAS`, `statusVerifikasi`, `updatedAt`, serta field revisi/verifikasi opsional |
| `verificationHistory` | `RiwayatVerifikasi` | `id`, `nilaiId`, `penawaranId`, `npm`, `aksi`, `userId`, `userName`, `waktu`, `keterangan`, nilai sebelum/sesudah opsional |

`dosenId`, `userId`, `verifiedBy`, `dimintaOleh`, dan `diputuskanOleh` adalah
referensi ke field `id` dalam collection `users`.

## Aturan akses saat ini

File lokal `firestore.rules` menolak akses; aturan yang dipublikasikan secara
manual di Console dapat berbeda. Aturan demo terbuka tidak dapat membedakan role
dan hanya sesuai untuk data contoh.

`src/data/initialData.ts` adalah data demo, bukan data produksi dan tidak
diimpor otomatis ke Firestore.
