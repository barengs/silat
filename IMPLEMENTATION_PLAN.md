# SIMTAG — Sistem Manajemen Tata Kelola Terpadu
## Dinas Pendidikan Kabupaten Pamekasan

> **Terakhir diperbarui:** 2026-06-03  
> **Status Proyek:** 🟡 Fase 3 — Menunggu Referensi UI

---

## 📋 Ringkasan Proyek

Sistem pemerintahan terpadu berbasis **Laravel 13 REST API + React SPA** yang melayani:
- Manajemen buku tamu digital
- Pengajuan & monitoring SPPD (Perjalanan Dinas)
- Pengajuan revisi ijazah (loket virtual)
- Perubahan bendahara/rekening sekolah (self-service)
- Portal informasi & berita (CMS)
- Konfigurasi sistem & Tanda Tangan Elektronik (QR)

---

## ⚙️ Keputusan Teknis

| Komponen | Teknologi |
|----------|-----------|
| Backend | Laravel 13 (PHP 8.4) |
| Frontend | React.js SPA (di `resources/js`) |
| Build Tool | Vite 8 + @vitejs/plugin-react |
| Styling | Tailwind CSS v4 |
| Auth | JWT — tymon/jwt-auth v2.3 |
| RBAC | spatie/laravel-permission v8 |
| Database | MySQL (`simtag_disdik`) |
| PDF | barryvdh/laravel-dompdf v3 |
| QR Code | simplesoftwareio/simple-qrcode v4 |
| State | Redux Toolkit + react-redux |
| Forms | react-hook-form + zod |
| Editor | Tiptap (rich text, modul berita) |
| Charts | Recharts (dashboard) |
| Data Wilayah | laravolt/indonesia v0.41 |
| Notifikasi | In-app + Email (WhatsApp: fase berikutnya) |
| Deployment | Shared Hosting Linux |
| TTE | Internal QR Code (bukan BSrE) |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────┐
│        BROWSER (React SPA)              │
│   React.js (resources/js via Vite)      │
│   Tailwind CSS v4                       │
│   Redux Toolkit (global state)          │
│   TanStack Query (server state)         │
│   Axios + JWT Bearer Token              │
└──────────────┬──────────────────────────┘
               │ REST API (JSON)
               │ Authorization: Bearer {jwt}
┌──────────────▼──────────────────────────┐
│        LARAVEL 13 (REST API)            │
│   routes/api.php (stateless)            │
│   tymon/jwt-auth                        │
│   Spatie Permission (RBAC)              │
│   DomPDF + SimpleSoftwareIO QrCode      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          MySQL Database                 │
│   20 tabel aplikasi                     │
│   + Spatie Permission tables            │
│   + laravolt/indonesia (opsional)       │
└──────────────┬──────────────────────────┘
```

---

## 👥 Peran Pengguna (RBAC)

| Role | Akses |
|------|-------|
| `super-admin` | Seluruh sistem, RBAC, master data |
| `admin-dinas` | User & institusi management |
| `resepsionis` | Buku tamu |
| `verifikator` | Verifikasi berkas semua modul |
| `approver` | Persetujuan akhir + TTE |
| `humas` | Kelola konten berita/pengumuman |
| `operator-sekolah` | Input pengajuan dari sekolah |
| `kepala-sekolah` | Approval tingkat sekolah |

**Akun Default (Development):**
| Email | Password | Role |
|-------|----------|------|
| `superadmin@disdik.pamekasan.go.id` | `Simtag@2026!` | super-admin |
| `resepsionis@disdik.pamekasan.go.id` | `Simtag@2026!` | resepsionis |

---

## 📊 Database Schema (20 Tabel)

```
Core & RBAC:
  system_settings, institutions, divisions, users
  roles, permissions, model_has_roles, model_has_permissions, role_has_permissions

Approval Engine:
  approval_flows, document_approvals

Buku Tamu:
  guest_agencies, guest_books

SPPD:
  transport_types, sppds, sppd_members, sppd_reports

Revisi Ijazah:
  ijazah_revisions

Bendahara:
  treasurer_changes

Portal Berita:
  article_categories, articles

Sistem:
  notifications, jobs, cache, sessions, migrations
```

---

## 🗺️ Peta Rencana Pengembangan (Roadmap)

---

### ✅ Phase 1 — Tech Stack Setup `[SELESAI]`

> Tanggal: 2026-06-03

- [x] Update `.env` → MySQL (`simtag_disdik`)
- [x] Update `vite.config.js` → React plugin + alias `@`
- [x] Install PHP packages: jwt-auth, spatie/permission, dompdf, qrcode, laravolt/indonesia, intervention/image
- [x] Install JS packages: React, Redux, react-router-dom, axios, react-hook-form, zod, lucide-react, Tiptap, recharts, sonner, react-dropzone, @tanstack/react-query, @tanstack/react-table (209 packages)
- [x] Publish JWT config + generate secret
- [x] Publish Spatie Permission config
- [x] Setup `config/auth.php` → JWT `api` guard
- [x] Setup `config/permission.php` → `guard_name: api`
- [x] Setup `config/cors.php` → izinkan Vite dev server
- [x] Update `bootstrap/app.php` → JWT middleware alias, CORS, API routes
- [x] Buat `app/Http/Middleware/JwtMiddleware.php`
- [x] Buat `routes/api.php` (lengkap semua endpoint)
- [x] Update `routes/web.php` → SPA catch-all
- [x] Buat `resources/views/app.blade.php` → SPA shell
- [x] Buat struktur React: `app.jsx`, `App.jsx`, `bootstrap.js`
- [x] Buat Redux store: `authSlice`, `notificationSlice`, `uiSlice`
- [x] Buat `services/authService.js` + `hooks/useAuth.js`
- [x] Buat placeholder pages: `LoginPage`, `DashboardPage`, `NotFoundPage`
- [x] Vite build berhasil ✓ (940ms, 31 modules)
- [x] Storage symlink dibuat

---

### ✅ Phase 2 — Database Schema & Models `[SELESAI]`

> Tanggal: 2026-06-03

**Migrations (20 berhasil):**
- [x] `create_system_settings_table`
- [x] `create_institutions_table`
- [x] `create_divisions_table`
- [x] `modify_users_table` (institution_id, division_id, nip, phone, photo, signature, is_active, softDeletes)
- [x] `create_approval_flows_table`
- [x] `create_document_approvals_table` (dengan QR token)
- [x] `create_guest_agencies_table`
- [x] `create_guest_books_table`
- [x] `create_transport_types_table`
- [x] `create_sppds_table` (conflict detection index)
- [x] `create_sppd_members_reports_table`
- [x] `create_ijazah_revisions_table` (ticket number)
- [x] `create_treasurer_changes_table` (reference number)
- [x] `create_articles_table` + `create_article_categories_table`
- [x] `create_notifications_table`
- [x] Spatie `create_permission_tables`

**Eloquent Models (16 dibuat):**
- [x] `SystemSetting` — helper `get()`/`set()`
- [x] `Institution` — scopes sekolah/active
- [x] `Division` — parent-child hierarchy
- [x] `User` — JWTSubject, HasRoles, isDinas/isSekolah helpers
- [x] `ApprovalFlow` — static `getFlowForModule()`
- [x] `DocumentApproval` — polymorphic, QR token scope
- [x] `GuestAgency`, `GuestBook`
- [x] `TransportType`, `Sppd` (conflict check + unreported check), `SppdMember`, `SppdReport`
- [x] `IjazahRevision` — auto ticket number `IJZ-YYYYMMDD-NNN`
- [x] `TreasurerChange` — auto reference number `BND-YYYYMM-NNN`
- [x] `ArticleCategory`, `Article` — auto slug, view counter

**Seeders (berhasil dijalankan):**
- [x] `RolesAndPermissionsSeeder` → 8 roles, 50+ permissions
- [x] `SystemSettingSeeder` → 20+ config keys
- [x] `DivisionSeeder` → 5 bidang + sub-seksi Disdik Pamekasan
- [x] `MasterDataSeeder` → 6 jenis transportasi, 7 kategori artikel
- [x] `AdminUserSeeder` → 2 akun default

**Stub Controllers (22 dibuat via artisan):**
- [x] `Api/Auth/AuthController` — login, logout, refresh, me (FULL)
- [x] `Api/Public/PublicArticleController` — stub
- [x] `Api/Public/DocumentVerificationController` — stub
- [x] `Api/Public/IjazahTrackingController` — stub
- [x] `Api/DashboardController`, `NotificationController`, `ProfileController`
- [x] `Api/UserController`, `RoleController`, `PermissionController`
- [x] `Api/InstitutionController`, `DivisionController`, `SettingController`
- [x] `Api/ApprovalFlowController`, `TransportTypeController`, `ArticleCategoryController`
- [x] `Api/GuestBookController`, `SppdController`, `SppdReportController`
- [x] `Api/IjazahRevisionController`, `TreasurerChangeController`
- [x] `Api/ArticleController`, `ReportController`

---

### ✅ Phase 3 — Authentication & UI Layout `[SELESAI]`

> Status: UI terintegrasi menggunakan Tailwind CSS + React sesuai referensi desain pengguna.

**Backend:**
- [x] `AuthController` sudah dibuat, perlu polish & test login endpoint
- [x] Test `POST /api/auth/login` dengan Postman/Insomnia
- [x] Implementasi forgot/reset password (opsional awal)

**Frontend — Auth:**
- [x] `pages/auth/LoginPage.jsx` — halaman login (sesuai referensi UI)
- [x] `pages/auth/ForgotPasswordPage.jsx`
- [x] Integrasi login form → Redux `setCredentials`

**Frontend — Layout Utama:**
- [x] `layouts/AppLayout.jsx` — sidebar + topbar + main content
- [x] `components/Sidebar/Sidebar.jsx` — navigasi dinamis per role (tergabung dalam layout)
- [x] `components/Topbar/Topbar.jsx` — user info, notif bell, theme toggle
- [x] `components/Breadcrumb.jsx`
- [x] Route protection + redirect setelah login
- [x] `pages/dashboard/DashboardPage.jsx` — integrasi UI dasbor

---

### 🔲 Phase 4A — RBAC Management UI (Matrix & Multi-Role)

- [x] `pages/users/UserList.jsx` — tabel user dengan filter & paginasi (menggunakan TanStack Table)
- [x] `pages/users/UserForm.jsx` — form create/edit user dengan dukungan **Multi-Role Assignment** (satu user bisa memiliki banyak role)
- [x] `pages/roles/RoleList.jsx` — manajemen nama role
- [x] `pages/roles/RoleForm.jsx` (dulu RolePermissionMatrix) — UI **Permission Matrix** (Baris = Menu/Modul, Kolom = CRUD + Custom Actions) untuk *assign* permission ke role secara dinamis.
- [x] `pages/institutions/InstitutionList.jsx` — manage sekolah
- [x] `pages/divisions/DivisionList.jsx` — manage bidang dinas
- [x] Backend: `UserController`, `RoleController`, `InstitutionController`, `DivisionController` — implementasi penuh (termasuk sinkronisasi multiple roles).

---

### 🔲 Phase 4B — Modul Buku Tamu

- [x] `GuestBookController::store()` — check-in dengan auto-create agency
- [x] `GuestBookController::searchAgencies()` — autocomplete endpoint
- [x] `GuestBookController::export()` & `index()` — Ekspor Excel dan Rekap Filter
- [x] Job: `SendGuestArrivalNotification` — notif in-app ke divisi tujuan
- [x] `pages/guest-book/CheckinModal.jsx` — form check-in modal layar penuh (mode resepsionis)
- [x] `pages/guest-book/GuestBookList.jsx` — log tamu + filter tanggal + ekspor
- [x] `pages/guest-book/GuestBookReport.jsx` — grafik Recharts

---

### 🔲 Phase 4C — Modul SPPD

### 🔲 Phase 4C — Modul SPPD

**Backend Services & Controllers:**
- [x] `SppdController::index()` — List SPPD dengan filter status (Draft, Verifikasi, Approved, Active, dll)
- [x] `SppdController::store()` — Form pengajuan baru, simpan ke `sppds` dan `sppd_members`
- [x] `SppdController::show()` — Detail SPPD beserta relasi
- [x] `SppdController::submit()` / `verify()` / `approve()` / `reject()` — Alur persetujuan
- [x] `SppdReportController::store()` — Upload Laporan Perjalanan Dinas (LPP)
- [x] Service: `ApprovalService` — Engine multi-step approval dengan transisi status
- [x] Service: `ConflictCheckService` — Mencegah pegawai memiliki 2 SPPD aktif di tanggal yang bertabrakan
- [x] Job: `GenerateSppdPdf` — DomPDF + QR Code (Implemented inline in Controller)
- [x] Template: `resources/views/pdf/sppd.blade.php`

**Frontend React:**
- [x] `pages/sppd/SppdList.jsx` — Replikasi UI "Daftar SPPD" dengan fitur Tabs (Semua Status) dan tabel.
- [x] `pages/sppd/SppdCreate.jsx` — Replikasi UI "Formulir Pengajuan", termasuk:
      * Kalkulasi otomatis Lama Perjalanan (Hari).
      * Baris dinamis "Daftar Pengikut" (tambah/hapus baris) dengan *autocomplete* pegawai.
- [x] `pages/sppd/SppdShow.jsx` — Replikasi UI "Detail Pengajuan" dengan Lini Masa (*Timeline*) Persetujuan di panel kanan.
- [x] `pages/sppd/SppdReport.jsx` — form upload LPP (Integrated into SppdShow.jsx Modal)

---

### 🔲 Phase 4D — Modul Pengajuan Revisi Ijazah

**Tujuan:**
Memfasilitasi pihak sekolah atau warga untuk mengajukan revisi ijazah yang salah data, dengan mengunggah persyaratan yang dibutuhkan. Pengajuan ini akan divalidasi berlapis oleh Cabdin/Dinas, dan pendaftar bisa memantau statusnya via tiket.

**Backend Services & Controllers:**
- [x] `IjazahRevisionController::index()` — List revisi ijazah (RBAC: sekolah hanya melihat miliknya, admin dinas melihat semua).
- [x] `IjazahRevisionController::store()` — Form pengajuan baru, *upload* dokumen persyaratan multi-file (Ijazah Asli Salah, Akte, KK, SPTJM), auto-generate nomor tiket `IJZ-YYYYMMDD-NNN`.
- [x] `IjazahRevisionController::show()` — Detail pengajuan revisi.
- [x] Alur Persetujuan — Menggunakan `ApprovalService` (Draft -> Verifikasi -> Approved -> Siap Diambil -> Selesai).
- [x] Endpoint Notifikasi — Admin menandai "Siap Diambil" agar *email*/*in-app notification* terkirim ke pemohon.
- [x] `PublicController::trackIjazah()` — Endpoint publik untuk mengecek status revisi berdasarkan Nomor Tiket.

**Frontend React:**
- [x] `pages/ijazah/IjazahList.jsx` — Daftar tiket pengajuan revisi dengan filter status.
- [x] `pages/ijazah/IjazahCreate.jsx` — Formulir pengajuan revisi dengan dukungan unggah dokumen (termasuk validasi ukuran & ekstensi).
- [x] `pages/ijazah/IjazahShow.jsx` — Detail revisi bagi petugas dinas dan sekolah (termasuk panel tombol persetujuan, penolakan, dan catatan).
- [x] `pages/public/IjazahTrack.jsx` — Halaman publik bagi warga/orang tua siswa untuk melacak progres revisi ijazah tanpa harus *login*, hanya dengan memasukkan Nomor Tiket `IJZ-XXX`.

> [!IMPORTANT]
> **Pertanyaan Desain Modul Ijazah:**
> Apakah semua persyaratan file (Akte, KK, SPTJM) bersifat **wajib** (mandatory) saat awal pengajuan, atau boleh disusulkan?
> Jika ditolak (rejected), apakah tiket ditutup permanen atau sekolah bisa merevisi dokumen pada tiket yang sama?

---

### ✅ Phase 4E — Modul Perubahan Bendahara/Rekening

- [x] `TreasurerChangeController` — CRUD + upload SK
- [x] Auto-generate reference number `BND-YYYYMM-NNN`
- [x] Job: `GenerateRecommendationLetterPdf` (dibuat inline di controller)
- [x] Template: `resources/views/pdf/recommendation_letter.blade.php`
- [x] `pages/treasurer/TreasurerList.jsx`
- [x] `pages/treasurer/TreasurerCreate.jsx` — form perubahan data
- [x] `pages/treasurer/TreasurerShow.jsx` — preview + download PDF

---

### 🔲 Phase 4F & Phase 8 — Portal Berita (CMS) & Public Landing Page (Integrated)

- [/] `ArticleController` — CRUD dengan rich text content
- [/] `ArticleCategoryController`
- [/] `PublicArticleController` — endpoint publik (no auth) (diimplementasikan langsung di ArticleController)
- [/] `pages/articles/ArticleList.jsx` — CMS dashboard
- [/] `pages/articles/ArticleForm.jsx` (pengganti ArticleEditor) — Tiptap rich text editor
- [/] `pages/public/LandingPage.jsx` — halaman publik utama tanpa login
- [/] `pages/public/NewsPage.jsx` — halaman index berita publik tanpa login
- [/] `pages/public/NewsDetail.jsx` — halaman detail baca berita publik tanpa login

---

### 🔲 Phase 5 — Dynamic Approval Engine

- [x] `app/Services/ApprovalService.php` — engine multi-step terpusat
  - `getNextStep(module, currentStep)` 
  - `advance(document, user, action, note)` (diimplementasikan sebagai `processApproval`)
  - `reject(document, user, note)` (diimplementasikan sebagai `processApproval` dengan status rejected)
  - `isComplete(document)` (diverifikasi dengan status `approved`)
- [ ] `ApprovalFlowController` — CRUD config alur per modul
- [ ] `pages/approval-flows/ApprovalFlowConfig.jsx` — UI konfigurasi alur

---

### 🔲 Phase 6 — TTE, PDF & Verifikasi Publik

- [/] `app/Services/DocumentService.php` (Pembuatan PDF saat ini diletakkan langsung di dalam Controller masing-masing)
  - [x] `generateSppdPdf(Sppd $sppd)` → DomPDF + QR Code (inline di SppdController)
  - [x] `generateRecommendationPdf(TreasurerChange $tc)` → DomPDF + QR Code (inline di TreasurerChangeController)
  - [x] `generateQrToken()` → unique token
- [x] Template PDF:
  - `resources/views/pdf/sppd.blade.php`
  - `resources/views/pdf/recommendation_letter.blade.php`
- [ ] `DocumentVerificationController::verify($token)` — publik
- [ ] `pages/public/DocumentVerify.jsx` — scan QR → tampilkan info dokumen + TTE
- [ ] `Signature Vault` — upload tanda tangan pejabat (Kadis, Kabid)
- [ ] `pages/settings/SignatureVault.jsx`

---

### 🔲 Phase 7 — Dashboard & Polish

- [ ] `DashboardController` — stats per role
- [ ] `pages/dashboard/DashboardPage.jsx`
  - Widget statistik (counter animasi)
  - Chart tamu bulanan (Recharts)
  - Feed berita terbaru
  - Antrian pending aksi
- [ ] `pages/settings/SystemSettings.jsx` — form pengaturan global
- [ ] Notification center (bell icon + dropdown)
- [ ] Dark mode toggle
- [ ] Responsive mobile layout
- [ ] `ProfilePage.jsx` — edit profil + upload foto/TTE
- [ ] Test e2e semua alur

---

## 🔌 API Endpoints (Ringkasan)

```
PUBLIC (no auth):
  POST /api/auth/login
  POST /api/auth/forgot-password
  GET  /api/public/articles
  GET  /api/public/articles/{slug}
  GET  /api/verify/doc/{token}
  GET  /api/track/ijazah/{ticket}

AUTHENTICATED (Bearer JWT):
  POST /api/auth/logout
  POST /api/auth/refresh
  GET  /api/auth/me
  GET  /api/dashboard
  GET  /api/notifications

  -- User & RBAC --
  CRUD /api/users
  CRUD /api/roles
  CRUD /api/institutions
  CRUD /api/divisions

  -- Modules --
  CRUD + workflow /api/guest-book
  CRUD + workflow /api/sppd
  CRUD + workflow /api/ijazah
  CRUD + workflow /api/treasurer
  CRUD + publish  /api/articles

  -- Reports --
  GET /api/reports/sppd
  GET /api/reports/ijazah
  GET /api/reports/treasurer
  GET /api/reports/guest-book
```

---

## 📁 Struktur Folder Utama

```
cabdin/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── Auth/AuthController.php       ✅ IMPLEMENTASI PENUH
│   │   │       ├── Public/                        ✅ stub
│   │   │       ├── DashboardController.php        ✅ stub
│   │   │       ├── GuestBookController.php        ✅ stub
│   │   │       ├── SppdController.php             ✅ stub
│   │   │       ├── IjazahRevisionController.php   ✅ stub
│   │   │       ├── TreasurerChangeController.php  ✅ stub
│   │   │       └── ArticleController.php          ✅ stub
│   │   └── Middleware/
│   │       └── JwtMiddleware.php                  ✅
│   ├── Models/                                    ✅ 16 models
│   └── Services/                                  🔲 belum dibuat
├── database/
│   ├── migrations/                                ✅ 20 files
│   └── seeders/                                   ✅ 6 seeders
├── resources/
│   ├── css/app.css                                ✅
│   ├── js/
│   │   ├── app.jsx                                ✅ entry point
│   │   ├── App.jsx                                ✅ router + guards
│   │   ├── bootstrap.js                           ✅ axios + JWT
│   │   ├── store/                                 ✅ Redux store
│   │   ├── services/authService.js                ✅
│   │   ├── hooks/useAuth.js                       ✅
│   │   └── pages/                                 🔲 placeholder only
│   └── views/
│       └── app.blade.php                          ✅ SPA shell
├── routes/
│   ├── api.php                                    ✅ complete routes
│   └── web.php                                    ✅ SPA catch-all
├── config/
│   ├── auth.php                                   ✅ JWT api guard
│   ├── jwt.php                                    ✅
│   ├── permission.php                             ✅ guard_name: api
│   └── cors.php                                   ✅
├── bootstrap/app.php                              ✅ middleware registered
└── IMPLEMENTATION_PLAN.md                        ✅ file ini
```

---

## 🚀 Cara Menjalankan Development

```bash
# Install dependencies (jika clone fresh)
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Database
php artisan migrate:fresh --seed

# Storage
php artisan storage:link

# Jalankan server (Laravel + Vite bersamaan)
composer run dev
```

---

## 🔑 Catatan Penting

- **Database:** MySQL `simtag_disdik` — ubah password di `.env` sesuai konfigurasi lokal
- **JWT Secret** sudah di-generate dan tersimpan di `.env` (key: `JWT_SECRET`)
- **guard_name** di semua role/permission adalah `api` (bukan `web`)
- **File upload** disimpan di `storage/app/public/` (sudah ada symlink)
- **React SPA:** semua routing client-side via react-router-dom, Laravel hanya catch-all di web routes
- **Spatie medialibrary** tidak diinstall (butuh ext-exif) — gunakan Intervention Image untuk resize + Laravel filesystem untuk storage
- **UI Design** referensi diterima per fase — integrasikan sebelum mulai fase yang bersangkutan

---

### 🔲 Phase 8 — Public Landing Page & Manajemen Berita

**Tujuan:** 
Menyediakan portal publik bagi sekolah atau instansi lain untuk melihat pengumuman/berita terbaru dari Dinas Pendidikan tanpa harus login, serta menyediakan fitur bagi admin dinas untuk mengelola konten berita tersebut.

**Backend Services & Controllers:**
- [ ] ArticleController::indexPublic() — Endpoint publik (GET /api/public/news) untuk mengambil artikel dengan status published dan is_public = true.
- [ ] ArticleController (CRUD) — Endpoint *admin* untuk mengelola data artikel (Berita/Pengumuman).
- [ ] Penyesuaian outes/api.php — Mendaftarkan rute publik tanpa *middleware* otentikasi.

**Frontend React (Publik):**
- [ ] layouts/PublicLayout.jsx — Layout khusus halaman publik dengan Topbar (Logo Dinas + Tombol Login).
- [ ] pages/public/LandingPage.jsx — Halaman utama (/) berisi:
      * *Hero Section* (Selamat Datang di Portal Dinas Pendidikan).
      * *News Section* (Daftar kartu pengumuman/berita terbaru).
- [ ] Modifikasi Main.jsx — Mengubah rute / agar merender LandingPage (bukan langsung *redirect* ke /dashboard).

**Frontend React (Admin):**
- [ ] pages/articles/ArticleList.jsx — Tabel manajemen berita untuk staf dinas.
- [ ] pages/articles/ArticleForm.jsx — Formulir tambah/edit berita (Judul, Kategori, Konten, Status Publikasi).
- [ ] Penambahan menu "Berita & Pengumuman" pada *Sidebar* (AppLayout.jsx).

> [!IMPORTANT]
> **Pertanyaan Desain:**
> Apakah di halaman utama (Landing Page) ini perlu ditampilkan fitur lain selain Berita/Pengumuman? Misalnya, form Pencarian Status Surat/SPPD secara publik, atau cukup murni portal berita saja untuk saat ini?
