<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Perintah Perjalanan Dinas (SPPD)</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 16px; font-weight: bold; }
        .header h2 { margin: 5px 0 0 0; font-size: 14px; }
        .header p { margin: 5px 0 0 0; font-size: 12px; }
        .content-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .content-table th, .content-table td { border: 1px solid #000; padding: 6px; vertical-align: top; }
        .signature-table { width: 100%; margin-top: 30px; }
        .signature-table td { width: 50%; text-align: center; }
        .qrcode { margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PEMERINTAH KABUPATEN PAMEKASAN</h1>
        <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
        <p>Jl. Pintu Gerbang No.4, Pamekasan, Jawa Timur</p>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin:0; text-decoration: underline;">SURAT PERINTAH PERJALANAN DINAS</h3>
        <p style="margin:5px 0 0 0;">Nomor: {{ $sppd->document_number ?? '090/..../432.301/'.date('Y') }}</p>
    </div>

    <table class="content-table">
        <tr>
            <td width="5%">1.</td>
            <td width="35%">Pejabat Berwenang yang Memberi Perintah</td>
            <td width="60%">Kepala Dinas Pendidikan Kabupaten Pamekasan</td>
        </tr>
        <tr>
            <td>2.</td>
            <td>Nama Pegawai yang Diperintah</td>
            <td><strong>{{ $sppd->user->name }}</strong><br>NIP: {{ $sppd->user->nip }}</td>
        </tr>
        <tr>
            <td>3.</td>
            <td>Pangkat / Golongan</td>
            <td>{{ $sppd->user->roles->pluck('name')->implode(', ') ?? '-' }}</td>
        </tr>
        <tr>
            <td>4.</td>
            <td>Maksud Perjalanan Dinas</td>
            <td>{{ $sppd->purpose }}</td>
        </tr>
        <tr>
            <td>5.</td>
            <td>Alat Angkutan yang Dipergunakan</td>
            <td>{{ $sppd->transportType->name ?? '-' }}</td>
        </tr>
        <tr>
            <td>6.</td>
            <td>Tempat Tujuan</td>
            <td>{{ $sppd->destination }}</td>
        </tr>
        <tr>
            <td>7.</td>
            <td>Lamanya Perjalanan Dinas<br>a. Tanggal Berangkat<br>b. Tanggal Harus Kembali</td>
            <td>
                {{ \Carbon\Carbon::parse($sppd->start_date)->diffInDays(\Carbon\Carbon::parse($sppd->end_date)) + 1 }} Hari<br>
                a. {{ \Carbon\Carbon::parse($sppd->start_date)->translatedFormat('d F Y') }}<br>
                b. {{ \Carbon\Carbon::parse($sppd->end_date)->translatedFormat('d F Y') }}
            </td>
        </tr>
        <tr>
            <td>8.</td>
            <td>Pengikut: Nama / NIP</td>
            <td>
                @if($sppd->members->count() > 0)
                    <ol style="margin:0; padding-left:15px;">
                        @foreach($sppd->members as $member)
                            <li>{{ $member->user->name }} ({{ $member->user->nip }})</li>
                        @endforeach
                    </ol>
                @else
                    -
                @endif
            </td>
        </tr>
        <tr>
            <td>9.</td>
            <td>Beban Anggaran</td>
            <td>{{ $sppd->budget_source }}</td>
        </tr>
    </table>

    <table class="signature-table">
        <tr>
            <td></td>
            <td>
                Dikeluarkan di: Pamekasan<br>
                Pada Tanggal: {{ date('d F Y') }}<br><br>
                <strong>KEPALA DINAS PENDIDIKAN</strong><br>
                <div class="qrcode">
                    <img src="data:image/png;base64, {{ base64_encode(QrCode::format('png')->size(80)->generate(url('/api/public/verify/doc/'.$sppd->id))) }} ">
                </div><br>
                <strong><u>(Ditandatangani secara elektronik)</u></strong>
            </td>
        </tr>
    </table>
</body>
</html>
