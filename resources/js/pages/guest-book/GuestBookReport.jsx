import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FileBarChart } from 'lucide-react';
import Button from '@/components/ui/Button';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function GuestBookReport() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['guest-books-report', startDate, endDate],
        queryFn: async () => {
            const res = await axios.get('/guest-book/report', {
                params: {
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                }
            });
            return res.data;
        }
    });

    const dailyTrend = reportData?.daily_trend || [];
    const divisionStats = reportData?.division_stats || [];

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FileBarChart className="text-emerald-600" />
                            Laporan Buku Tamu
                        </h1>
                        <p className="text-slate-500 text-sm">Analisis data kunjungan dan tamu instansi.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mulai Tanggal</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full sm:w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sampai Tanggal</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full sm:w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <Button 
                            variant="ghost" 
                            className="text-slate-500 hover:text-slate-700"
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Line Chart: Daily Trend */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Tren Kunjungan Harian</h3>
                    {isLoading ? (
                        <div className="h-72 flex items-center justify-center text-slate-400 animate-pulse">Memuat data...</div>
                    ) : dailyTrend.length > 0 ? (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tickFormatter={(val) => val.split('-').reverse().slice(0,2).join('/')}
                                    />
                                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelFormatter={(val) => `Tanggal: ${val}`}
                                    />
                                    <Line type="monotone" dataKey="total" name="Total Tamu" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-slate-400">Tidak ada data kunjungan.</div>
                    )}
                </div>

                {/* Pie Chart: Division Stats */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Kunjungan Berdasarkan Bidang Tujuan</h3>
                    {isLoading ? (
                        <div className="h-72 flex items-center justify-center text-slate-400 animate-pulse">Memuat data...</div>
                    ) : divisionStats.length > 0 ? (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={divisionStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {divisionStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-slate-400">Tidak ada data tujuan divisi.</div>
                    )}
                </div>

                {/* Bar Chart: Division Stats (Alternative View) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Tamu per Bidang</h3>
                    {isLoading ? (
                        <div className="h-80 flex items-center justify-center text-slate-400 animate-pulse">Memuat data...</div>
                    ) : divisionStats.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={divisionStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={200} axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                    <RechartsTooltip 
                                        cursor={{fill: '#f1f5f9'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" name="Total Tamu" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                        {divisionStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-slate-400">Tidak ada data.</div>
                    )}
                </div>

            </div>
        </div>
    );
}
