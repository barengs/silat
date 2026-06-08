<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Panduan Pengguna SIMTAG - Dinas Pendidikan Kabupaten Pamekasan</title>
    <style>
        @page {
            margin: 80px 50px 70px 50px;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #334155;
            margin: 0;
            padding: 0;
        }
        header {
            position: fixed;
            top: -55px;
            left: 0;
            right: 0;
            height: 35px;
            border-bottom: 1px solid #cbd5e1;
            color: #64748b;
            font-size: 9px;
            font-style: italic;
        }
        footer {
            position: fixed;
            bottom: -50px;
            left: 0;
            right: 0;
            height: 30px;
            border-top: 1px solid #cbd5e1;
            color: #64748b;
            font-size: 9px;
        }
        .footer-table {
            width: 100%;
            border-collapse: collapse;
        }
        .footer-table td {
            border: none;
            padding: 5px 0;
        }
        .page-number:after {
            content: counter(page);
        }
        .cover-page {
            page-break-after: always;
            text-align: center;
            padding-top: 80px;
        }
        .cover-title {
            font-size: 26px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .cover-subtitle {
            font-size: 16px;
            color: #475569;
            margin-bottom: 60px;
        }
        .cover-divider {
            width: 150px;
            height: 4px;
            background-color: #0284c7;
            margin: 0 auto 60px auto;
        }
        .cover-details {
            font-size: 13px;
            color: #64748b;
            margin-top: 150px;
            line-height: 2;
        }
        .cover-footer {
            margin-top: 100px;
            font-size: 11px;
            color: #94a3b8;
        }
        .toc-page {
            page-break-after: always;
        }
        .toc-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 5px;
            margin-bottom: 20px;
        }
        .toc-list {
            list-style: none;
            padding-left: 0;
        }
        .toc-item {
            margin-bottom: 12px;
            font-size: 12px;
            clear: both;
        }
        .toc-name {
            float: left;
            color: #334155;
        }
        .toc-dots {
            border-bottom: 1px dotted #cbd5e1;
            margin: 0 10px;
            height: 15px;
        }
        h1 {
            page-break-before: always;
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 0;
            margin-bottom: 15px;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 5px;
            text-transform: uppercase;
        }
        h2 {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 20px;
            margin-bottom: 10px;
            border-left: 3px solid #0284c7;
            padding-left: 8px;
        }
        p {
            margin-top: 0;
            margin-bottom: 12px;
            text-align: justify;
        }
        ul, ol {
            margin-top: 0;
            margin-bottom: 12px;
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
        .img-container {
            text-align: center;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        .img-container img {
            width: 100%;
            max-width: 580px;
            height: auto;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .img-caption {
            font-size: 10px;
            color: #64748b;
            margin-top: 6px;
            font-style: italic;
        }
        .badge {
            background-color: #f1f5f9;
            color: #334155;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            border: 1px solid #e2e8f0;
        }
        .table-roles {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .table-roles th {
            background-color: #f8fafc;
            color: #1e293b;
            font-weight: bold;
            text-align: left;
            padding: 8px;
            border: 1px solid #cbd5e1;
        }
        .table-roles td {
            padding: 8px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }
        .note-box {
            background-color: #f0f9ff;
            border-left: 4px solid #0284c7;
            padding: 12px;
            margin: 15px 0;
            border-radius: 0 4px 4px 0;
        }
        .note-box-title {
            font-weight: bold;
            color: #0369a1;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <div style="font-size: 14px; font-weight: bold; color: #64748b; letter-spacing: 2px; margin-bottom: 20px;">DOKUMEN RESMI</div>
        <div class="cover-title">Panduan Pengguna (User Manual)</div>
        <div class="cover-subtitle">SIMTAG — Sistem Manajemen Tata Kelola Terpadu</div>
        <div class="cover-divider"></div>
        
        <div class="cover-details">
            <strong>Dinas Pendidikan Kabupaten Pamekasan</strong><br>
            Jl. Raya Proppo No. 9, Pamekasan, Jawa Timur<br>
            Versi Aplikasi: 1.0.0 (Juni 2026)<br>
            Hak Cipta Dilindungi Undang-Undang
        </div>
        
        <div class="cover-footer">
            Diproduksi oleh Tim Pengembang SIMTAG Disdik Pamekasan
        </div>
    </div>

    <!-- HEADER & FOOTER (Will appear on all subsequent pages) -->
    <header>
        SIMTAG — Panduan Pengguna (User Manual) | Dinas Pendidikan Kabupaten Pamekasan
    </header>
    <footer>
        <table class="footer-table">
            <tr>
                <td style="text-align: left;">© 2026 Dinas Pendidikan Kabupaten Pamekasan</td>
                <td style="text-align: right;">Halaman <span class="page-number"></span></td>
            </tr>
        </table>
    </footer>

    <!-- TABLE OF CONTENTS -->
    <div class="toc-page">
        <div class="toc-title">Daftar Isi</div>
        <ul class="toc-list">
            <li class="toc-item">1. Pengenalan SIMTAG & Manajemen Hak Akses (RBAC)</li>
            <li class="toc-item">2. Fitur Keamanan Sesi (Login & Lock Screen)</li>
            <li class="toc-item">3. Dasbor Utama & Monitoring Terpadu</li>
            <li class="toc-item">4. Modul Buku Tamu Digital</li>
            <li class="toc-item">5. Modul Pengajuan & Manajemen SPPD</li>
            <li class="toc-item">6. Modul Pengajuan Pindah Sekolah (Mutasi Siswa)</li>
            <li class="toc-item">7. Modul Pengajuan Revisi Ijazah & Pelacakan Tiket</li>
            <li class="toc-item">8. Modul Perubahan Bendahara/Rekening Sekolah</li>
            <li class="toc-item">9. Modul Tanda Tangan Elektronik (TTE) & Signature Vault</li>
            <li class="toc-item">10. Modul Antrean Verifikasi Dokumen Terpadu</li>
            <li class="toc-item">11. Modul Portal Berita & CMS Humas</li>
        </ul>
    </div>

    <!-- CHAPTER 1 -->
    <h1>1. Pengenalan SIMTAG & Manajemen Hak Akses (RBAC)</h1>
    <p>
        <strong>SIMTAG (Sistem Manajemen Tata Kelola Terpadu)</strong> adalah aplikasi berbasis web yang dirancang khusus untuk mendigitalisasi, mengintegrasikan, dan mempercepat alur administrasi di lingkungan Dinas Pendidikan Kabupaten Pamekasan. Aplikasi ini mempermudah koordinasi antara staf dinas, pimpinan (penandatangan), resepsionis, humas, serta operator sekolah dalam mengelola berbagai berkas pengajuan secara paperless.
    </p>
    <p>
        Keamanan dan hak operasional sistem SIMTAG diatur secara dinamis melalui mekanisme <strong>Role-Based Access Control (RBAC)</strong>. Setiap pengguna dikelompokkan ke dalam satu atau beberapa peran (role) yang memiliki kumpulan hak akses (permissions) tertentu.
    </p>

    <h2>Struktur Peran Pengguna (Roles & Permissions)</h2>
    <table class="table-roles">
        <thead>
            <tr>
                <th style="width: 25%">Peran (Role)</th>
                <th>Deskripsi & Ruang Lingkup Wewenang</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>super-admin</strong></td>
                <td>Memiliki bypass hak akses penuh di seluruh sistem. Dapat mengatur data master instansi/sekolah, divisi dinas, daftar pengguna, serta mengonfigurasi role-permission matrix dan alur persetujuan dokumen.</td>
            </tr>
            <tr>
                <td><strong>admin-dinas</strong></td>
                <td>Mengelola pengguna (user) dan instansi sekolah di bawah naungan dinas, serta memantau statistik aktivitas sistem.</td>
            </tr>
            <tr>
                <td><strong>resepsionis</strong></td>
                <td>Mengoperasikan modul Buku Tamu Digital di lobi kantor dinas, melayani tamu check-in, dan mencetak rekap kunjungan.</td>
            </tr>
            <tr>
                <td><strong>verifikator</strong></td>
                <td>Petugas dinas yang bertanggung jawab memverifikasi kelengkapan berkas fisik/digital dari sekolah untuk modul SPPD, Ijazah, Pindah Sekolah, dan Bendahara.</td>
            </tr>
            <tr>
                <td><strong>approver</strong></td>
                <td>Pejabat berwenang (misal: Kepala Bidang atau Kepala Dinas) yang menyetujui pengajuan secara akhir dan membubuhkan Tanda Tangan Elektronik (TTE) ber-QR Code.</td>
            </tr>
            <tr>
                <td><strong>operator-sekolah</strong></td>
                <td>Operator administrasi di tingkat sekolah yang bertugas membuat pengajuan mutasi siswa, perubahan bendahara, dan revisi ijazah atas nama sekolah terkait.</td>
            </tr>
            <tr>
                <td><strong>kepala-sekolah</strong></td>
                <td>Pimpinan sekolah yang memberikan verifikasi dan persetujuan awal (level 1) sebelum berkas dikirimkan ke Dinas Pendidikan.</td>
            </tr>
            <tr>
                <td><strong>humas</strong></td>
                <td>Mengelola artikel, berita, dan pengumuman resmi yang akan ditampilkan di landing page publik.</td>
            </tr>
        </tbody>
    </table>

    <div class="note-box">
        <div class="note-box-title">Catatan Sistem RBAC Baru:</div>
        Sistem SIMTAG telah ditingkatkan ke arsitektur berbasis izin (permission-based scoping). Pengguna dapat melihat menu atau melakukan aksi tertentu secara dinamis berdasarkan izin yang diatur di menu RBAC, bukan lagi sekadar nama peran yang dikodekan secara statis.
    </div>


    <!-- CHAPTER 2 -->
    <h1>2. Fitur Keamanan Sesi (Login & Lock Screen)</h1>
    <p>
        Akses ke dalam SIMTAG dilindungi oleh autentikasi berbasis JSON Web Token (JWT). Pengguna wajib masuk menggunakan email resmi dan kata sandi yang telah didaftarkan.
    </p>
    
    <h2>Proses Login</h2>
    <p>
        Halaman login dirancang bersih dan aman. Masukkan email resmi Disdik (seperti <span class="badge">superadmin@disdik.pamekasan.go.id</span>) dan password untuk mengakses dasbor utama.
    </p>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['login'] }}" alt="Halaman Login SIMTAG" />
        <div class="img-caption">Gambar 2.1: Halaman login aman SIMTAG.</div>
    </div>

    <h2>Fitur Lock Screen</h2>
    <p>
        Untuk menjaga kerahasiaan data saat petugas meninggalkan komputer, SIMTAG dilengkapi dengan fitur <strong>Lock Screen (Kunci Layar) otomatis</strong>. Setelah periode tidak aktif terlampaui, layar akan terkunci dengan overlay transparan. Pengguna harus memasukkan kata sandi kembali untuk melanjutkan sesi tanpa perlu login ulang dari awal.
    </p>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['lock_screen'] }}" alt="Overlay Lock Screen SIMTAG" />
        <div class="img-caption">Gambar 2.2: Antarmuka Lock Screen otomatis untuk proteksi sesi.</div>
    </div>


    <!-- CHAPTER 3 -->
    <h1>3. Dasbor Utama & Monitoring Terpadu</h1>
    <p>
        Setelah berhasil login, dasbor utama akan disesuaikan secara dinamis berdasarkan role pengguna. Dasbor menyajikan informasi kunci secara instan untuk mempercepat proses pengambilan keputusan.
    </p>
    
    <h2>Komponen Dasbor</h2>
    <ul>
        <li><strong>Widget Statistik Dinamis:</strong> Menampilkan jumlah surat SPPD aktif, antrean verifikasi tertunda, revisi ijazah berjalan, dan tamu hari ini.</li>
        <li><strong>Grafik Tren Kunjungan Buku Tamu:</strong> Menampilkan visualisasi data kunjungan tamu dinas bulanan menggunakan grafik interaktif (Recharts).</li>
        <li><strong>Feed Berita & Pengumuman:</strong> Portal pengumuman internal dari Humas untuk seluruh pengguna.</li>
        <li><strong>Pintasan Antrean Tugas (Pending Actions):</strong> Menampilkan daftar dokumen yang membutuhkan tindakan persetujuan atau verifikasi langsung oleh pengguna yang sedang aktif login.</li>
    </ul>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['dashboard'] }}" alt="Dasbor Utama SIMTAG" />
        <div class="img-caption">Gambar 3.1: Halaman dasbor utama SIMTAG yang responsif dan interaktif.</div>
    </div>


    <!-- CHAPTER 4 -->
    <h1>4. Modul Buku Tamu Digital</h1>
    <p>
        Modul Buku Tamu Digital menggantikan logbook fisik di resepsionis Dinas Pendidikan. Fitur ini dirancang khusus untuk mempermudah pencatatan, notifikasi instan, dan pelaporan kunjungan tamu dinas.
    </p>

    <h2>Check-in Tamu</h2>
    <p>
        Ketika tamu datang, resepsionis membuka modal check-in layar penuh. Resepsionis mengisi nama tamu, instansi asal, divisi yang dituju, nama pejabat yang ditemui, serta keperluan kunjungan. Sistem memiliki fitur autocomplete instansi untuk mempercepat penginputan. Begitu disimpan, sistem akan mengirimkan notifikasi internal (in-app notification) ke akun staf divisi yang dituju.
    </p>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['guest_book'] }}" alt="Modul Buku Tamu SIMTAG" />
        <div class="img-caption">Gambar 4.1: Daftar log buku tamu harian beserta filter tanggal kunjungan.</div>
    </div>

    <h2>Log Tamu & Ekspor Laporan</h2>
    <p>
        Log buku tamu menampilkan rekap seluruh kunjungan dalam format tabel dinamis yang dapat diurutkan, difilter berdasarkan rentang tanggal tertentu, dan diekspor ke Microsoft Excel untuk pelaporan instansi berkala.
    </p>


    <!-- CHAPTER 5 -->
    <h1>5. Modul Pengajuan & Manajemen SPPD</h1>
    <p>
        Modul SPPD (Surat Perjalanan Dinas) memfasilitasi pengajuan perjalanan dinas pegawai dinas secara digital mulai dari perencanaan, validasi bentrok jadwal, pengunggahan Laporan Perjalanan Dinas (LPP), hingga pencetakan dokumen ber-TTE.
    </p>

    <h2>Alur Kerja Pengajuan SPPD</h2>
    <ol>
        <li><strong>Pengisian Formulir:</strong> Pengguna mengisi maksud perjalanan dinas, jenis transportasi, tanggal keberangkatan, tanggal kepulangan, tempat tujuan, serta daftar pengikut perjalanan dinas. Lama perjalanan dinas akan dihitung secara otomatis oleh sistem.</li>
        <li><strong>Pencegah Bentrok (Conflict Check):</strong> Sistem secara otomatis melarang penambahan pegawai ke dalam daftar perjalanan dinas jika pegawai yang bersangkutan sudah terdaftar aktif di perjalanan dinas lain pada rentang tanggal yang sama.</li>
        <li><strong>Verifikasi Dokumen:</strong> Berkas diverifikasi oleh bagian administrasi/umum (Verifikator).</li>
        <li><strong>Persetujuan & TTE Pejabat:</strong> Setelah disetujui oleh Kepala Dinas (Approver), sistem secara otomatis menghasilkan dokumen PDF SPPD resmi lengkap dengan tanda tangan QR Code yang unik untuk divalidasi keasliannya secara publik.</li>
        <li><strong>Laporan Hasil SPPD (LPP):</strong> Setelah kembali dari dinas, pegawai wajib mengunggah Laporan Perjalanan Dinas (LPP) beserta lampiran pendukungnya ke dalam sistem.</li>
    </ol>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['sppd'] }}" alt="Manajemen SPPD SIMTAG" />
        <div class="img-caption">Gambar 5.1: Antarmuka daftar pengajuan SPPD, status verifikasi, dan tombol aksi unduh PDF.</div>
    </div>


    <!-- CHAPTER 6 -->
    <h1>6. Modul Pengajuan Pindah Sekolah (Mutasi Siswa)</h1>
    <p>
        Modul Pindah Sekolah (Mutasi Siswa) memfasilitasi sekolah untuk mengajukan kepindahan siswa baik masuk maupun keluar secara cepat dan terpantau. Ini mencegah proses birokrasi manual yang berbelit-belit.
    </p>

    <h2>Prosedur Pengajuan Mutasi</h2>
    <ul>
        <li><strong>Inisiasi Sekolah:</strong> Operator sekolah mengisi detail mutasi siswa (nama siswa, NISN, kelas, nama orang tua, sekolah asal, dan sekolah tujuan).</li>
        <li><strong>Unggah Dokumen Syarat:</strong> Mengunggah berkas wajib: Surat Permohonan Orang Tua (PDF), Scan Raport Terakhir (PDF), dan Surat Mutasi Sekolah Asal (PDF).</li>
        <li><strong>Verifikasi Dinas:</strong> Bagian kesiswaan dinas melakukan verifikasi terhadap keabsahan dokumen persyaratan kesiswaan.</li>
        <li><strong>Surat Rekomendasi Pindah Sekolah:</strong> Begitu pengajuan disetujui secara bertahap oleh Kepala Bidang dan Kepala Dinas, sistem melahirkan Surat Rekomendasi Pindah Sekolah resmi berformat PDF lengkap dengan tanda tangan elektronik QR Code.</li>
    </ul>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['pindah_sekolah'] }}" alt="Daftar Pengajuan Pindah Sekolah" />
        <div class="img-caption">Gambar 6.1: Daftar pengajuan pindah sekolah (mutasi siswa).</div>
    </div>

    <h2>Formulir Pengajuan Pindah Sekolah</h2>
    <p>
        Operator sekolah dapat menginisiasi pengajuan pindah sekolah baru dengan mengisi data siswa (NISN, Nama, Kelas, Sekolah Asal & Tujuan) serta mengunggah dokumen persyaratan fisik yang dipindai.
    </p>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['pindah_sekolah_form'] }}" alt="Formulir Pengajuan Pindah Sekolah" />
        <div class="img-caption">Gambar 6.2: Formulir pengisian pengajuan pindah sekolah.</div>
    </div>


    <!-- CHAPTER 7 -->
    <h1>7. Modul Pengajuan Revisi Ijazah & Pelacakan Tiket</h1>
    <p>
        Bagi lulusan atau pihak sekolah yang mendapati kesalahan penulisan data pada ijazah kelulusan, SIMTAG menyediakan loket virtual terintegrasi untuk pengajuan perbaikan/revisi ijazah.
    </p>

    <h2>Pengajuan Revisi</h2>
    <p>
        Operator sekolah mengunggah pengajuan revisi dengan melampirkan berkas persyaratan wajib: Scan Ijazah yang salah, Akte Kelahiran, Kartu Keluarga, dan SPTJM (Surat Pernyataan Tanggung Jawab Mutlak). Setelah disimpan, sistem melahirkan nomor tiket unik secara otomatis dengan pola format <span class="badge">IJZ-YYYYMMDD-NNN</span>.
    </p>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['ijazah'] }}" alt="Daftar Revisi Ijazah SIMTAG" />
        <div class="img-caption">Gambar 7.1: Antarmuka daftar tiket pengajuan revisi ijazah bagi sekolah dan dinas.</div>
    </div>

    <h2>Pelacakan Tiket Publik (Tanpa Login)</h2>
    <p>
        Warga atau orang tua siswa dapat melacak langsung progres peninjauan ijazah mereka secara transparan di halaman publik SIMTAG tanpa perlu memiliki akun. Cukup dengan memasukkan nomor tiket revisi ijazah mereka di kolom pencarian pelacakan tiket publik.
    </p>


    <!-- CHAPTER 8 -->
    <h1>8. Modul Perubahan Bendahara/Rekening Sekolah</h1>
    <p>
        Modul Perubahan Bendahara dan Rekening Sekolah merupakan portal mandiri (self-service) bagi sekolah untuk memperbarui data pejabat bendahara BOS/lembaga beserta rekening sekolah secara resmi ke Dinas Pendidikan.
    </p>

    <h2>Pengisian Formulir Perubahan</h2>
    <p>
        Operator Sekolah mengunggah detail bendahara baru, nomor rekening baru, nama bank, serta mengunggah berkas pendukung: SK Kepala Sekolah tentang Pengangkatan Bendahara, KTP & NPWP Bendahara Baru, serta Salinan Buku Rekening Baru.
    </p>
    
    <h2>Rekomendasi Perubahan</h2>
    <p>
        Setelah data divalidasi oleh verifikator dinas dan disetujui kepala dinas, sistem akan menerbitkan Surat Rekomendasi Perubahan Bendahara & Rekening resmi (PDF ber-TTE) yang dapat diunduh oleh sekolah untuk keperluan verifikasi pencairan dana BOS ke bank penyalur.
    </p>


    <!-- CHAPTER 9 -->
    <h1>9. Modul Tanda Tangan Elektronik (TTE) & Signature Vault</h1>
    <p>
        Untuk mempercepat proses administrasi tanpa ketergantungan tanda tangan basah pimpinan, SIMTAG menerapkan teknologi **Tanda Tangan Elektronik (TTE) internal berbasis QR Code verifikasi**.
    </p>

    <h2>Signature Vault</h2>
    <p>
        Signature Vault adalah brankas tanda tangan digital aman di mana pejabat dinas berwenang (Kadis, Kabid, dll) dapat mengunggah file gambar tanda tangan transparan mereka beserta nama dan NIP resmi. Akses ke Signature Vault ini dilindungi secara ketat hanya untuk akun bersangkutan dan superadmin.
    </p>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['signatures'] }}" alt="Signature Vault SIMTAG" />
        <div class="img-caption">Gambar 9.1: Pengelolaan aset tanda tangan pejabat dinas (Signature Vault).</div>
    </div>

    <h2>Cara Kerja TTE & Verifikasi QR Code</h2>
    <p>
        Saat dokumen SPPD, Rekomendasi Pindah Sekolah, atau Rekomendasi Bendahara disetujui (Approved), sistem menempelkan tanda tangan pejabat dari Vault dan membubuhkan QR Code unik berisi tautan ke halaman verifikasi publik (<span class="badge">/verify/doc/{token}</span>). Warga atau pihak luar cukup memindai QR Code tersebut untuk membuktikan keaslian dokumen secara realtime.
    </p>


    <!-- CHAPTER 10 -->
    <h1>10. Modul Antrean Verifikasi Dokumen Terpadu</h1>
    <p>
        Bagi staf dinas yang bertugas sebagai **Verifikator**, SIMTAG menyediakan modul **Verifikasi Dokumen** terpadu. Modul ini menyatukan semua jenis pengajuan berkas (SPPD, revisi ijazah, perubahan bendahara, kesiswaan/pindah sekolah) ke dalam satu antrean kerja yang terintegrasi.
    </p>

    <h2>Penggunaan Antrean Verifikasi</h2>
    <p>
        Verifikator dinas dapat melihat antrean dokumen masuk secara real-time, meninjau kelengkapan file digital yang diunggah pemohon, dan memberikan umpan balik langsung (Aproval/Penerimaan atau Rejection/Penolakan disertai alasan penolakan tertulis). Ini mempercepat respons dinas terhadap kendala berkas sekolah.
    </p>

    <div class="img-container">
        <img src="data:image/png;base64,{{ $images['verifikasi'] }}" alt="Antrean Verifikasi Dokumen" />
        <div class="img-caption">Gambar 10.1: Antrean terpadu verifikasi berkas bagi staf Verifikator Dinas Pendidikan.</div>
    </div>


    <!-- CHAPTER 11 -->
    <h1>11. Modul Portal Berita & CMS Humas</h1>
    <p>
        Modul Portal Berita berfungsi sebagai Content Management System (CMS) bagi Humas Dinas Pendidikan untuk mempublikasikan artikel berita, pengumuman kedinasan, agenda, dan informasi penting lainnya.
    </p>
    
    <h2>Fitur CMS Humas</h2>
    <ul>
        <li><strong>Rich-Text Editor (Tiptap):</strong> Staf Humas dapat memformat konten artikel secara profesional, menyematkan gambar secara inline, membuat tautan/link, dan mengatur tata letak teks secara fleksibel.</li>
        <li><strong>Pengaturan Kategori & Publikasi:</strong> Artikel dapat dikelompokkan ke dalam kategori (Berita, Pengumuman, Agenda, dll) serta diatur status publikasinya (Draft atau Published) dan privasinya (Public atau Internal).</li>
        <li><strong>Landing Page Berita:</strong> Artikel berstatus "Published & Public" akan tampil secara otomatis di halaman beranda publik SIMTAG tanpa perlu autentikasi masuk, berfungsi sebagai portal berita resmi bagi masyarakat umum.</li>
    </ul>

</body>
</html>
