<?php

namespace App\Exports;

use App\Models\GuestBook;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class GuestBookExport implements FromQuery, WithHeadings, WithMapping
{
    protected $startDate;

    protected $endDate;

    public function __construct($startDate = null, $endDate = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function query()
    {
        $query = GuestBook::with(['agency', 'targetDivision'])->orderBy('date', 'desc')->orderBy('check_in_time', 'desc');

        if ($this->startDate) {
            $query->whereDate('date', '>=', clone $this->startDate);
        }
        if ($this->endDate) {
            $query->whereDate('date', '<=', clone $this->endDate);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Waktu Kedatangan',
            'Nama Tamu',
            'Instansi Asal',
            'Bidang Tujuan',
            'Keperluan',
            'Nomor HP',
        ];
    }

    public function map($guest): array
    {
        return [
            Carbon::parse($guest->date)->format('d/m/Y'),
            $guest->check_in_time,
            $guest->guest_name,
            $guest->agency ? $guest->agency->name : '-',
            $guest->targetDivision ? $guest->targetDivision->name : '-',
            $guest->purpose,
            $guest->guest_contact ?? '-',
        ];
    }
}
