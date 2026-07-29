import React, { useState } from 'react';
import { 
    BookOpen, Download, LayoutDashboard, Shield, Lock, 
    Users, Plane, FileSignature, GitBranch, Newspaper, 
    CheckSquare, FileText, HelpCircle, ChevronRight
} from 'lucide-react';

export default function UserManual() {
    const [activeTab, setActiveTab] = useState('intro');

    const chapters = [
        {
            id: 'intro',
            title: '1. Pengenalan & Hak Akses (RBAC)',
            icon: Shield,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Sistem Layanan Terpadu</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>SILAT</strong> adalah platform tata kelola terintegrasi untuk mendigitalisasi proses administrasi pada Dinas Pendidikan Kabupaten Pamekasan. Dengan SILAT, koordinasi antara dinas, penandatangan, resepsionis, humas, dan sekolah menjadi lebih cepat, aman, dan tanpa kertas (paperless).
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Mekanisme Hak Akses Dinamis (RBAC)</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Setiap pengguna memiliki akses menu yang disesuaikan berdasarkan izin (permissions) yang dimiliki. Admin dapat menetapkan atau mengubah izin untuk setiap peran secara langsung di sistem.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Daftar Peran Pengguna & Ruang Lingkup Wewenang</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse border border-slate-200 dark:border-slate-800">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                        <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Peran (Role)</th>
                                        <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Wewenang / Fitur Utama</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    <tr>
                                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border text-xs">super-admin</span></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Akses penuh di seluruh sistem, manajemen pengguna, master data instansi, konfigurasi alur persetujuan, dan hak akses (RBAC).</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border text-xs">admin-dinas</span></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Mengelola data instansi sekolah, manajemen akun pengguna dinas, dan monitoring laporan umum.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border text-xs">resepsionis</span></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Mengoperasikan Buku Tamu Digital, melakukan check-in kunjungan tamu, dan ekspor logs rekap harian.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border text-xs">verifikator</span></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Memeriksa keabsahan dan kelengkapan dokumen pengajuan (SPPD, Mutasi Sekolah, Bendahara, Ijazah).</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border text-xs">approver</span></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Memberikan tanda tangan elektronik (TTE) via QR Code pada berkas/surat yang disetujui akhir.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border text-xs">operator-sekolah</span></td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Membuat pengajuan mutasi kesiswaan, perubahan data bendahara BOS, serta permohonan revisi ijazah salah.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'auth',
            title: '2. Login & Lock Screen',
            icon: Lock,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Keamanan Sesi Pengguna</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Untuk masuk ke SILAT, gunakan email dinas terdaftar dan kata sandi Anda. Keamanan autentikasi dilindungi oleh enkripsi JWT.
                        </p>
                        
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/login.png" 
                                alt="Halaman Login" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 2.1: Halaman autentikasi utama SILAT
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Kunci Layar Otomatis (Lock Screen)</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Jika Anda meninggalkan komputer Anda tanpa aktivitas selama beberapa menit, SILAT akan secara otomatis mengunci layar Anda untuk menghindari penggunaan tidak sah. Anda hanya perlu memasukkan kata sandi kembali tanpa harus memuat ulang aplikasi.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/lock_screen.png" 
                                alt="Lock Screen" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 2.2: Mode Lock Screen pengaman sesi
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard',
            title: '3. Dasbor Utama & Fitur Terpadu',
            icon: LayoutDashboard,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Pusat Informasi & Statistik Dasbor</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Dasbor menyajikan statistik real-time sesuai wewenang peran Anda, grafik tren log tamu menggunakan Recharts, ringkasan agenda dinas, dan pengumuman humas terkini.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/dashboard.png" 
                                alt="Dashboard SILAT" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 3.1: Dasbor interaktif dengan widget statistik dan visualisasi data
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Fitur Pending Actions (Tugas Tertunda)</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Di bagian bawah dasbor terdapat kartu <strong>"Antrean Pending Tindakan"</strong>. Ini berisi daftar berkas yang menunggu persetujuan atau verifikasi Anda. Anda dapat langsung mengklik item untuk meninjaunya.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'guestbook',
            title: '4. Modul Buku Tamu Digital',
            icon: Users,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Pencatatan Buku Tamu Kantor Dinas</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Sistem menggantikan buku besar kertas resepsionis dengan log tamu digital yang interaktif. Resepsionis menginput detail kunjungan seperti nama tamu, nomor HP, instansi asal, bidang/divisi tujuan, dan keperluan kunjungan. Pendaftaran tamu baru akan memicu notifikasi instan ke staff dinas di bidang terkait.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/guest_book.png" 
                                alt="Buku Tamu" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 4.1: Daftar rekapitulasi logs tamu dinas dengan filter tanggal
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Status Kunjungan Dinamis & Fitur Check Out</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            Setiap tamu yang baru didaftarkan akan berstatus <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded border text-xs font-semibold">Sedang Berkunjung</span>. Ketika kunjungan telah selesai, petugas resepsionis atau admin dinas/super-admin dapat mengklik tombol <strong>Check Out</strong> langsung pada tabel untuk mencatat waktu keluar tamu secara akurat, mengubah status tamu menjadi <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border text-xs font-semibold">Selesai</span>.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Otorisasi & Keamanan Data Buku Tamu</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            Untuk menjaga privasi kunjungan masing-masing bidang, daftar buku tamu disaring secara otomatis berdasarkan bidang/divisi user yang login. Staf hanya dapat melihat daftar tamu yang ditujukan ke bidangnya. Otorisasi melihat seluruh data kunjungan ke semua divisi dikendalikan secara dinamis menggunakan izin khusus <code>guest-book.view-all</code> yang disematkan ke peran resepsionis, admin dinas, dan super-admin.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Ekspor Laporan Mingguan & Bulanan</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Logs buku tamu yang terfilter dapat langsung diekspor ke dalam format Microsoft Excel (.xlsx) dengan menekan tombol <strong>Export Excel</strong>.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'sppd',
            title: '5. Modul Perjalanan Dinas (SPPD)',
            icon: Plane,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Manajemen SPPD Terintegrasi</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Memungkinkan staf mengajukan Perjalanan Dinas, menambahkan pengikut dinas secara dinamis, mendeteksi bentrok jadwal dinas secara otomatis, mengunggah laporan hasil dinas (LPP), dan mencetak lembar SPPD ber-TTE.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/sppd.png" 
                                alt="SPPD Management" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 5.1: Daftar monitoring pengajuan perjalanan dinas beserta status alurnya
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Akses Navigasi Cepat & Lini Masa Persetujuan</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            Pengguna dapat masuk ke detail informasi SPPD secara instan cukup dengan mengklik baris data SPPD pada tabel. Halaman detail memuat <strong>Lini Masa Persetujuan</strong> yang menyajikan status alur persetujuan secara visual (mulai dari pembuatan draf, verifikasi oleh Kabid/Kadis, hingga status pengunggahan dan validasi LPP).
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Pelaporan LPP & Preview Bukti Terintegrasi</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            Setelah perjalanan dinas selesai, pelaksana wajib mengunggah Laporan Perjalanan Dinas (LPP) beserta berkas bukti riil pengeluaran/kegiatan. Staff dinas terkait dapat langsung meninjau isi laporan dan melakukan peninjauan (preview) berkas dokumen pendukung secara langsung (in-app preview) tanpa harus mengunduh file terlebih dahulu.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Fitur Cerdas SPPD</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Kalkulator Lama Hari:</strong> Menghitung durasi keberangkatan-pulang secara otomatis.</li>
                            <li><strong>Pencegah Jadwal Ganda:</strong> Sistem melarang penambahan pegawai yang jadwal dinasnya bertabrakan pada rentang hari yang sama.</li>
                            <li><strong>Kompilasi PDF SPPD:</strong> Setelah disetujui pimpinan, PDF resmi dengan kode batang QR TTE siap diunduh dan dibawa bepergian.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'school-transfers',
            title: '6. Pengajuan Mutasi Sekolah',
            icon: GitBranch,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Administrasi Mutasi Siswa Secara Mandiri</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Operator sekolah dapat memantau seluruh usulan mutasi siswa pada halaman daftar pengajuan. Halaman ini memuat status verifikasi berkas secara real-time dan menyediakan tombol unduh PDF rekomendasi jika pengajuan disetujui.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/pindah_sekolah.png" 
                                alt="Daftar Pengajuan Mutasi Sekolah" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 6.1: Daftar pengajuan mutasi sekolah (mutasi siswa)
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Formulir Pengajuan Mutasi Siswa</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Untuk membuat usulan baru, operator sekolah mengisi detail NISN, biodata siswa, nama orang tua, sekolah asal, sekolah tujuan, serta mengunggah berkas kelengkapan yang dipersyaratkan.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/pindah_sekolah_form.png" 
                                alt="Formulir Mutasi Sekolah" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 6.2: Formulir pengisian pengajuan mutasi sekolah baru
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Rekomendasi Mutasi ber-TTE</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Berkas yang diajukan akan ditinjau secara berjenjang oleh dinas. Hasil akhir berupa Surat Rekomendasi Mutasi Sekolah bertanda tangan elektronik (TTE QR Code) yang dapat diunduh langsung untuk diserahkan ke sekolah tujuan baru.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'ijazah',
            title: '7. Modul Revisi Ijazah & Pelacakan',
            icon: FileSignature,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Loket Virtual Revisi Kesalahan Ijazah</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Mempermudah pemrosesan ijazah yang mengalami salah tulis. Sekolah mengunggah syarat wajib (Akte, KK, SPTJM, Ijazah lama) ke sistem untuk divalidasi dinas secara bertahap.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/ijazah.png" 
                                alt="Revisi Ijazah" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 7.1: Log tiket pengajuan revisi ijazah berstatus dinamis
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Unggah Berkas Lebih Cepat & Valid</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            Proses pengunggahan berkas syarat kini dilengkapi validasi ekstensi berkas secara ketat di sisi server (mencegah kesalahan pendeteksian mime-type browser) dan validasi programmatic di frontend yang mempermudah pengisian formulir.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">In-App Preview Berkas Lampiran</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            Verifikator dan pimpinan dinas dapat langsung memverifikasi syarat berkas pendukung (Scan Ijazah Asli, Akte, KK, SPTJM) secara visual melalui fitur **Dokumen Lampiran Preview** tanpa perlu berpindah tab atau mengunduh dokumen secara manual.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Pelacakan Tiket Publik (Tanpa Login)</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Masyarakat umum dapat mengecek proses revisi ijazah secara terbuka melalui menu <strong>"Lacak Tiket"</strong> di landing page publik dengan mengetikkan Nomor Tiket unik (contoh: <span className="badge">IJZ-20260605-002</span>).
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'verifikasi',
            title: '8. Antrean Verifikasi Dokumen',
            icon: CheckSquare,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Antrean Terpadu untuk Verifikator</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Semua berkas pengajuan masuk (SPPD, Mutasi Siswa, Perubahan Bendahara, Revisi Ijazah) disatukan dalam satu menu kerja terpadu bagi peran Verifikator Dinas. Staf peninjau dapat menelaah berkas digital satu per satu.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/verifikasi.png" 
                                alt="Verifikasi Dokumen" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 8.1: Daftar antrean kerja verifikasi berkas terintegrasi
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Penerimaan & Penolakan Berkas</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Verifikator berhak meneruskan berkas ke langkah berikutnya (Approve) atau mengembalikannya ke pemohon (Reject) disertai dengan catatan/alasan penolakan agar sekolah dapat merevisi bagian berkas yang salah.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'signatures',
            title: '9. Tanda Tangan Elektronik & Vault',
            icon: FileText,
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Signature Vault & Keabsahan TTE</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Signature Vault adalah fitur pengamanan berkas tanda tangan pimpinan dinas untuk keperluan pembubuhan persetujuan digital.
                        </p>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden my-4 bg-slate-50 dark:bg-slate-900">
                            <img 
                                src="/images/manual/signatures.png" 
                                alt="Signature Vault" 
                                className="w-full max-w-2xl mx-auto h-auto block object-cover"
                            />
                            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                                Gambar 9.1: Pengelolaan gambar tanda tangan pimpinan (Kadis & Kabid)
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Verifikasi QR Code Keaslian Dokumen</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Setiap dokumen ber-TTE yang diterbitkan SILAT memiliki QR Code di bagian bawah. Jika dipindai, QR Code mengarahkan pengguna ke halaman pencarian publik untuk memverifikasi keabsahan, judul surat, instansi terkait, dan pejabat penandatangan secara digital.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const currentChapter = chapters.find(c => c.id === activeTab) || chapters[0];
    const IconComponent = currentChapter.icon;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Manual */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 border-none pb-0 uppercase tracking-tight">Panduan Pengguna</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Dokumentasi operasional fitur SILAT Dinas Pendidikan Kabupaten Pamekasan</p>
                    </div>
                </div>
                <div>
                    <a 
                        href="/user_manual_simtag.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-md shadow-blue-500/20"
                    >
                        <Download className="h-5 w-5" />
                        <span>Unduh Dokumen PDF</span>
                    </a>
                </div>
            </div>

            {/* Layout Utama Panduan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigasi Bab */}
                <div className="lg:col-span-4 space-y-2">
                    <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-3 border-none pl-0">Daftar Bab Panduan</h2>
                    <div className="flex flex-col gap-1.5">
                        {chapters.map((chap) => {
                            const ChapIcon = chap.icon;
                            const isActive = activeTab === chap.id;
                            return (
                                <button
                                    key={chap.id}
                                    onClick={() => setActiveTab(chap.id)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left text-sm font-semibold transition border ${
                                        isActive 
                                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400' 
                                            : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ChapIcon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                                        <span>{chap.title.split('. ')[1] || chap.title}</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition ${isActive ? 'translate-x-1 text-blue-500' : 'text-slate-300'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Area Konten Bab */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm">
                    {/* Header Bab */}
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-5 mb-6">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-lg border border-slate-100 dark:border-slate-800">
                            <IconComponent className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white border-none pl-0 mt-0 mb-0">
                            {currentChapter.title}
                        </h2>
                    </div>

                    {/* Pembahasan Bab */}
                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        {currentChapter.content}
                    </div>
                </div>
            </div>
        </div>
    );
}
