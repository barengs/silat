<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Rekomendasi Bank</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 14pt;
            text-transform: uppercase;
            margin: 0;
            padding: 0;
        }
        .header h2 {
            font-size: 16pt;
            text-transform: uppercase;
            margin: 0;
            padding: 0;
        }
        .header p {
            font-size: 10pt;
            margin: 5px 0 0 0;
            font-style: italic;
        }
        .title-block {
            text-align: center;
            margin-bottom: 25px;
        }
        .title-block h3 {
            font-size: 14pt;
            text-decoration: underline;
            text-transform: uppercase;
            margin: 0;
            padding: 0;
        }
        .title-block p {
            margin: 5px 0 0 0;
        }
        .content {
            text-align: justify;
            margin-bottom: 20px;
        }
        .table-data {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table-data th, .table-data td {
            border: 1px solid #000;
            padding: 8px 12px;
            text-align: left;
        }
        .table-data th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer-table {
            width: 100%;
            margin-top: 50px;
        }
        .footer-table td {
            vertical-align: top;
        }
        .qr-code-cell {
            width: 30%;
            text-align: left;
        }
        .signature-cell {
            width: 70%;
            text-align: right;
            padding-right: 50px;
        }
        .signature-block {
            display: inline-block;
            text-align: left;
        }
    </style>
</head>
<body>

    <!-- Kop Surat -->
    <div class="header">
        <h1>Pemerintah Kabupaten Pamekasan</h1>
        <h2>Dinas Pendidikan</h2>
        <p>Jalan Jokotole No. 117 Pamekasan, Jawa Timur. Telp: (0324) 321234<br>
        Email: disdik@pamekasankab.go.id | Website: disdik.pamekasankab.go.id</p>
    </div>

    <!-- Title -->
    <div class="title-block">
        <h3>Surat Rekomendasi</h3>
        <p>Nomor: 090 / {{ $change->id }} / 432.301 / {{ date('Y') }}</p>
    </div>

    <!-- Wording based on change_type -->
    <div class="content">
        <p>Yang bertanda tangan di bawah ini Kepala Dinas Pendidikan Kabupaten Pamekasan, Provinsi Jawa Timur, memberikan rekomendasi kepada pihak perbankan mitra untuk melakukan proses administrasi perubahan data keuangan pada rekening operasional sekolah sebagai berikut:</p>
        
        <p><strong>Detail Instansi Sekolah:</strong><br>
        Nama Sekolah: {{ $change->institution->name }}<br>
        NPSN: {{ $change->institution->npsn_code ?? '-' }}<br>
        Alamat: {{ $change->institution->address ?? '-' }}, {{ $change->institution->district ?? '-' }}, {{ $change->institution->city ?? 'Pamekasan' }}</p>
        
        <p>Adapun detail perubahan data yang diajukan adalah:</p>
    </div>

    <!-- Comparison Table -->
    <table class="table-data">
        <thead>
            <tr>
                <th>Item Perubahan</th>
                <th>Data Lama (Semula)</th>
                <th>Data Baru (Menjadi)</th>
            </tr>
        </thead>
        <tbody>
            @if($change->change_type === 'bendahara' || $change->change_type === 'both')
                <tr>
                    <td><strong>Nama Bendahara</strong></td>
                    <td>{{ $change->old_treasurer_name }}</td>
                    <td>{{ $change->new_treasurer_name }}</td>
                </tr>
                <tr>
                    <td><strong>NPWP Bendahara</strong></td>
                    <td>{{ $change->old_npwp }}</td>
                    <td>{{ $change->new_npwp }}</td>
                </tr>
            @endif
            @if($change->change_type === 'rekening' || $change->change_type === 'both')
                <tr>
                    <td><strong>Nama Pemegang Rekening</strong></td>
                    <td>{{ $change->old_treasurer_name }} (Bendahara Lama)</td>
                    <td>{{ $change->new_treasurer_name }} (Bendahara Baru/Aktif)</td>
                </tr>
                <tr>
                    <td><strong>Nomor Rekening</strong></td>
                    <td>{{ $change->old_bank_account }}</td>
                    <td>{{ $change->new_bank_account }}</td>
                </tr>
                <tr>
                    <td><strong>Bank / Cabang</strong></td>
                    <td colspan="2">{{ $change->bank_name }} / {{ $change->bank_branch }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="content">
        <p>Surat rekomendasi ini diterbitkan untuk dipergunakan sebagaimana mestinya guna memperlancar proses transaksi keuangan operasional BOSP di instansi sekolah yang bersangkutan. Atas kerja samanya kami ucapkan terima kasih.</p>
    </div>

    <!-- Signature Block with TTE QR Code -->
    <table class="footer-table">
        <tr>
            <td class="qr-code-cell">
                <div style="font-size: 8pt; margin-bottom: 5px; color: #444;">Dokumen ini ditandatangani secara elektronik (TTE). Scan QR untuk verifikasi keaslian:</div>
                <div class="qr-code-img">
                    {!! $qrCode !!}
                </div>
            </td>
            <td class="signature-cell">
                <div class="signature-block">
                    <p>Pamekasan, {{ now()->translatedFormat('d F Y') }}<br>
                    Kepala Dinas Pendidikan<br>
                    Kabupaten Pamekasan</p>
                    @if($signatureImagePath && file_exists($signatureImagePath))
                        <img src="{{ $signatureImagePath }}" alt="Tanda Tangan" style="height: 60px; margin: 10px 0;">
                    @else
                        <br><br><br>
                    @endif
                    <p><strong><u>{{ $signerName }}</u></strong><br>
                    NIP. {{ $signerNip }}</p>
                </div>
            </td>
        </tr>
    </table>

</body>
</html>
