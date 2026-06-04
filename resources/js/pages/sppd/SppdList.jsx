import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    useReactTable, 
    getCoreRowModel, 
    getPaginationRowModel,
} from '@tanstack/react-table';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '@/bootstrap';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function SppdList() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('daftar'); // daftar | monitoring
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['sppds', activeTab, statusFilter],
        queryFn: async () => {
            let status = statusFilter;
            if (activeTab === 'monitoring') {
                status = 'reported'; // example
            }
            const res = await axios.get('/sppd', {
                params: { status }
            });
            return res.data;
        }
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <Badge variant="outline" className="bg-slate-100 text-slate-700">Draft</Badge>;
            case 'verifikasi': return <Badge variant="warning" className="bg-amber-100 text-amber-700">Verifikasi</Badge>;
            case 'approved': return <Badge variant="info" className="bg-blue-100 text-blue-700">Approved</Badge>;
            case 'active': return <Badge variant="success" className="bg-emerald-100 text-emerald-700">Active</Badge>;
            case 'reported': return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Reported</Badge>;
            case 'closed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Selesai</Badge>;
            case 'rejected': return <Badge variant="danger">Ditolak</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns = [
        {
            header: 'NO. DOKUMEN',
            accessorKey: 'document_number',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-800">
                    {row.original.document_number || 'Belum Terbit (Draft)'}
                </span>
            ),
        },
        {
            header: 'PEGAWAI',
            accessorKey: 'user.name',
            cell: ({ row }) => {
                const user = row.original.user;
                const initials = user?.name?.substring(0, 2).toUpperCase() || 'NA';
                return (
                    <div className="flex items-center gap-3">
                        {user?.photo_path ? (
                            <img src={user.photo_path} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {initials}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">{user?.name}</p>
                            <p className="text-xs text-slate-500">NIP. {user?.nip || '-'}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'TUJUAN',
            accessorFn: (row) => `${row.destination} - ${row.institution?.name || ''}`,
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    <p className="text-sm text-slate-800 font-medium truncate">{row.original.destination}</p>
                    {row.original.institution?.name && (
                        <p className="text-xs text-slate-500 truncate">{row.original.institution.name}</p>
                    )}
                </div>
            )
        },
        {
            header: 'TANGGAL',
            accessorFn: (row) => `${row.start_date} - ${row.end_date}`,
            cell: ({ row }) => {
                const format = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                const start = format(row.original.start_date);
                const end = format(row.original.end_date);
                return (
                    <span className="text-sm text-slate-600">
                        {start === end ? start : `${start} - ${end}`}
                    </span>
                );
            }
        },
        {
            header: 'STATUS',
            accessorKey: 'status',
            cell: ({ row }) => getStatusBadge(row.original.status)
        },
        {
            id: 'actions',
            header: 'AKSI',
            cell: ({ row }) => (
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-400 hover:text-emerald-600"
                    onClick={() => navigate(`/sppd/${row.original.id}`)}
                    title="Detail SPPD"
                >
                    <Eye size={18} />
                </Button>
            ),
        }
    ];

    const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen SPPD</h1>
                    <p className="text-slate-500 text-sm">Kelola pengajuan dan riwayat Surat Perintah Perjalanan Dinas pegawai.</p>
                </div>
                <Button 
                    icon={Plus} 
                    onClick={() => navigate('/sppd/create')}
                    className="bg-[#0f172a] hover:bg-slate-800 text-white"
                >
                    Buat Pengajuan Baru
                </Button>
            </div>

            {/* Tabs & Table */}
            <div className="bg-white rounded shadow-sm border border-slate-200">
                
                {/* Tabs */}
                <div className="flex px-6 border-b border-slate-200">
                    <button 
                        onClick={() => setActiveTab('daftar')}
                        className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'daftar' ? 'border-[#0f172a] text-[#0f172a]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Daftar SPPD
                    </button>
                    <button 
                        onClick={() => setActiveTab('monitoring')}
                        className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'monitoring' ? 'border-[#0f172a] text-[#0f172a]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Monitoring Laporan
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 border-b border-slate-100">
                    <div className="relative w-full sm:w-96">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari No. Dokumen..." 
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-[#0f172a]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select 
                            className="px-3 py-2 border border-slate-200 rounded text-sm bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="verifikasi">Verifikasi</option>
                            <option value="approved">Approved</option>
                            <option value="active">Active</option>
                            <option value="reported">Reported</option>
                            <option value="closed">Closed</option>
                        </select>
                        <Button variant="outline" className="px-3" icon={Filter} />
                    </div>
                </div>

                {/* Data Table */}
                <div className="p-0">
                    <DataTable table={table} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
