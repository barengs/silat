<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Rekomendasi Pindah Sekolah</title>
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
        .table-data td {
            padding: 6px 12px;
            vertical-align: top;
        }
        .footer-table {
            width: 100%;
            margin-top: 50px;
        }
        .footer-table td {
            vertical-align: top;
        }
        .qr-code-cell {
            width: 35%;
            text-align: left;
        }
        .signature-cell {
            width: 65%;
            text-align: right;
            padding-right: 30px;
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
        <h3>Surat Rekomendasi Pindah Sekolah</h3>
        <p>Nomor: 421 / {{ $transfer->id }} / 432.301 / {{ date('Y') }}</p>
    </div>

    <div class="content">
        <p>Yang bertanda tangan di bawah ini Kepala Dinas Pendidikan Kabupaten Pamekasan, memberikan rekomendasi pindah sekolah (mutasi siswa) kepada siswa di bawah ini:</p>
    </div>

    <!-- Student & Transfer Details -->
    <table class="table-data" style="margin-left: 20px; width: 95%;">
        <tr>
            <td style="width: 30%;"><strong>Nama Siswa</strong></td>
            <td style="width: 3%;">:</td>
            <td>{{ $transfer->student_name }}</td>
        </tr>
        <tr>
            <td><strong>NISN</strong></td>
            <td>:</td>
            <td>{{ $transfer->nisn }}</td>
        </tr>
        <tr>
            <td><strong>Jenis Kelamin</strong></td>
            <td>:</td>
            <td>{{ $transfer->gender }}</td>
        </tr>
        <tr>
            <td><strong>Kelas / Tingkat</strong></td>
            <td>:</td>
            <td>Kelas {{ $transfer->grade }}</td>
        </tr>
        <tr>
            <td><strong>Sekolah Asal</strong></td>
            <td>:</td>
            <td>{{ $transfer->institution->name }} (NPSN: {{ $transfer->institution->npsn_code ?? '-' }})</td>
        </tr>
        <tr>
            <td><strong>Sekolah Tujuan</strong></td>
            <td>:</td>
            <td>{{ $transfer->target_school }}</td>
        </tr>
        <tr>
            <td><strong>Alamat Sekolah Tujuan</strong></td>
            <td>:</td>
            <td>{{ $transfer->target_school_address }}</td>
        </tr>
        <tr>
            <td><strong>Alasan Pindah</strong></td>
            <td>:</td>
            <td>{{ $transfer->reason }}</td>
        </tr>
    </table>

    <div class="content">
        <p>Dengan ketentuan bahwa pihak sekolah penerima (sekolah tujuan) dapat menampung siswa tersebut di atas sesuai dengan daya tampung kelas yang tersedia dan memenuhi persyaratan administrasi mutasi yang berlaku.</p>
        <p>Demikian surat rekomendasi ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>

    <!-- Signature Block with TTE QR Code -->
    <table class="footer-table">
        <tr>
            <td class="qr-code-cell">
                <div style="font-size: 8pt; margin-bottom: 5px; color: #444; line-height: 1.3;">Dokumen ini ditandatangani secara elektronik (TTE). Scan QR untuk verifikasi keaslian:</div>
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
                        <img src="{{ $signatureImagePath }}" alt="Tanda Tangan" style="height: 60px; margin: 5px 0;">
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
