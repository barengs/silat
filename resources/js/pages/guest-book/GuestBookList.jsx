import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import { Plus, Users, Building2, Network, Download, BarChart2 } from 'lucide-react';
import axios from '@/bootstrap';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CheckinModal from './CheckinModal';

export default function GuestBookList() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch Guest Books with Stats
    const { data, isLoading } = useQuery({
        queryKey: ['guest-books', pageIndex, pageSize, searchTerm, startDate, endDate],
        queryFn: async () => {
            const res = await axios.get('/guest-book', {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: searchTerm || undefined,
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                },
            });
            return res.data;
        },
        keepPreviousData: true,
    });

    const guests = data?.data?.data || [];
    const stats = data?.stats || { total_today: 0, most_visited_agency: '-', main_target_division: '-' };

    const columns = useMemo(() => [
        {
            header: 'WAKTU',
            accessorKey: 'check_in_time',
            cell: ({ getValue }) => <span className="text-sm font-medium text-slate-700">{getValue()} WIB</span>
        },
        {
            header: 'NAMA TAMU',
            accessorKey: 'guest_name',
            cell: ({ getValue }) => <span className="font-semibold text-slate-900">{getValue()}</span>
        },
        {
            header: 'ASAL INSTANSI',
            accessorKey: 'agency.name',
            cell: ({ row }) => <span className="text-slate-600">{row.original.agency?.name || '-'}</span>
        },
        {
            header: 'TUJUAN DIVISI',
            accessorKey: 'target_division.name',
            cell: ({ row }) => <span className="text-slate-600">{row.original.target_division?.name || '-'}</span>
        },
        {
            header: 'KEPERLUAN',
            accessorKey: 'purpose',
            cell: ({ getValue }) => <span className="text-sm text-slate-500 line-clamp-1" title={getValue()}>{getValue()}</span>
        },
        {
            header: 'STATUS',
            id: 'status',
            cell: () => (
                <Badge variant="success">Selesai</Badge>
            )
        }
    ], []);

    const table = useReactTable({
        data: guests,
        columns,
        pageCount: data?.data?.last_page ?? -1,
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) => {
            const nextState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(nextState.pageIndex);
            setPageSize(nextState.pageSize);
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const handleExport = async () => {
        try {
            const res = await axios.get('/guest-book/export', {
                params: {
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `buku_tamu_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Buku Tamu</h1>
                    <p className="text-slate-500 text-sm">Kelola daftar kunjungan dan tamu instansi.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                        onClick={() => navigate('/guest-book/report')}
                        icon={BarChart2}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    >
                        Grafik Laporan
                    </Button>
                    <Button 
                        onClick={handleExport}
                        icon={Download}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 text-emerald-600 border-emerald-200"
                    >
                        Export Excel
                    </Button>
                    <Button 
                        onClick={() => setIsCheckinOpen(true)}
                        icon={Plus}
                        className="bg-[#0F172A] hover:bg-slate-800"
                    >
                        Catat Tamu Baru
                    </Button>
                </div>
            </div>

            {/* Date Filters */}
            <div className="bg-white border border-slate-200 rounded p-4 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mulai Tanggal</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPageIndex(0); }}
                        className="w-full sm:w-48 px-3 py-2 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sampai Tanggal</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPageIndex(0); }}
                        className="w-full sm:w-48 px-3 py-2 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    />
                </div>
                {(startDate || endDate) && (
                    <Button 
                        variant="ghost" 
                        className="text-slate-500 hover:text-slate-700 h-9 px-3"
                        onClick={() => { setStartDate(''); setEndDate(''); setPageIndex(0); }}
                    >
                        Reset Filter
                    </Button>
                )}
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded p-6 flex items-center shadow-sm">
                    <div className="w-14 h-14 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-4 shrink-0">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tamu (Rentang)</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.total_today}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded p-6 flex items-center shadow-sm">
                    <div className="w-14 h-14 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4 shrink-0">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instansi Terbanyak</p>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">{stats.most_visited_agency}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded p-6 flex items-center shadow-sm">
                    <div className="w-14 h-14 rounded bg-orange-100 text-orange-600 flex items-center justify-center mr-4 shrink-0">
                        <Network size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bidang Tujuan Utama</p>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">{stats.main_target_division}</h3>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-slate-50 border border-slate-200 rounded shadow-sm p-1">
                <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Kunjungan Terbaru</h3>
                </div>
                <div className="bg-white rounded-b-xl">
                    <DataTable
                        table={table}
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); setPageIndex(0); }}
                        pageSize={pageSize}
                        onPageSizeChange={(val) => { setPageSize(val); setPageIndex(0); }}
                        searchPlaceholder="Cari nama tamu atau instansi..."
                        hideTitle
                    />
                </div>
            </div>

            {/* Check-in Fullscreen Modal */}
            <CheckinModal 
                isOpen={isCheckinOpen} 
                onClose={() => setIsCheckinOpen(false)} 
            />
        </div>
    );
}
