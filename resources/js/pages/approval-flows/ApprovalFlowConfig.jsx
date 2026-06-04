import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { 
    GitBranch, 
    Plus, 
    Trash2, 
    ArrowUp, 
    ArrowDown, 
    Save, 
    RotateCcw, 
    CheckCircle, 
    AlertCircle,
    Sliders,
    HelpCircle,
    Shield
} from 'lucide-react';

export default function ApprovalFlowConfig() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('sppd'); // 'sppd', 'ijazah', 'bendahara'
    const [localSteps, setLocalSteps] = useState([]);
    
    // Load config from backend
    const { data: configData, isLoading } = useQuery({
        queryKey: ['approval-flows'],
        queryFn: async () => {
            const res = await axios.get('/approval-flows');
            return res.data;
        }
    });

    const roles = configData?.roles || [];
    const dbFlows = configData?.flows || {};

    // Synchronize local steps when data or active tab changes
    useEffect(() => {
        if (dbFlows) {
            const activeFlow = dbFlows[activeTab] || [];
            setLocalSteps(activeFlow);
        }
    }, [dbFlows, activeTab]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Add a new step to the local state
    const handleAddStep = () => {
        const nextOrder = localSteps.length + 1;
        const newStep = {
            id: `new-${Date.now()}`,
            step_order: nextOrder,
            step_label: `Persetujuan Baru Tahap ${nextOrder}`,
            role_id_required: roles[0]?.id || '',
            action_type: 'approve',
            is_active: true
        };
        setLocalSteps([...localSteps, newStep]);
    };

    // Remove a step
    const handleRemoveStep = (index) => {
        const updated = localSteps.filter((_, i) => i !== index).map((step, idx) => ({
            ...step,
            step_order: idx + 1
        }));
        setLocalSteps(updated);
    };

    // Handle input changes
    const handleStepChange = (index, field, value) => {
        const updated = [...localSteps];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setLocalSteps(updated);
    };

    // Move step up
    const handleMoveUp = (index) => {
        if (index === 0) return;
        const updated = [...localSteps];
        const temp = updated[index - 1];
        updated[index - 1] = updated[index];
        updated[index] = temp;
        
        // Re-assign step_order
        const reordered = updated.map((step, idx) => ({
            ...step,
            step_order: idx + 1
        }));
        setLocalSteps(reordered);
    };

    // Move step down
    const handleMoveDown = (index) => {
        if (index === localSteps.length - 1) return;
        const updated = [...localSteps];
        const temp = updated[index + 1];
        updated[index + 1] = updated[index];
        updated[index] = temp;
        
        // Re-assign step_order
        const reordered = updated.map((step, idx) => ({
            ...step,
            step_order: idx + 1
        }));
        setLocalSteps(reordered);
    };

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (steps) => {
            const res = await axios.put(`/approval-flows/${activeTab}`, { steps });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Alur persetujuan berhasil diperbarui');
            queryClient.invalidateQueries(['approval-flows']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menyimpan perubahan');
        }
    });

    const handleSave = () => {
        if (localSteps.length === 0) {
            toast.error('Alur persetujuan minimal harus memiliki 1 langkah.');
            return;
        }
        // Validation check
        const invalidStep = localSteps.find(s => !s.step_label.trim() || !s.role_id_required);
        if (invalidStep) {
            toast.error('Semua langkah harus memiliki label dan memilih peran verifikator.');
            return;
        }

        saveMutation.mutate(localSteps);
    };

    const handleReset = () => {
        if (window.confirm('Batalkan perubahan dan muat ulang dari server?')) {
            const activeFlow = dbFlows[activeTab] || [];
            setLocalSteps(activeFlow);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full pb-10 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center bg-white p-6 rounded shadow-sm border border-slate-200 mb-6">
                    <div>
                        <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-slate-100 rounded w-64"></div>
                    </div>
                </div>

                {/* Tabs & Editor Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded p-4 space-y-3">
                        <div className="h-10 bg-slate-100 rounded w-full"></div>
                        <div className="h-10 bg-slate-100 rounded w-full"></div>
                        <div className="h-10 bg-slate-100 rounded w-full"></div>
                    </div>
                    <div className="lg:col-span-3 bg-white border border-slate-200 rounded p-6 space-y-4">
                        <div className="h-4 bg-slate-300 rounded w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="h-16 bg-slate-100 rounded w-full"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded shadow-sm border border-slate-200 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <GitBranch className="text-blue-600" size={24} />
                        Konfigurasi Alur Persetujuan
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Atur tahapan tanda tangan, verifikasi berkas, dan persetujuan pejabat untuk setiap modul dinas.
                    </p>
                </div>
            </div>

            {/* Main Config Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Module Selector Sidebar */}
                <div className="lg:col-span-1 bg-white border border-slate-200 rounded p-4 shadow-sm space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-4">Pilih Modul Alur</h3>
                    {[
                        { id: 'sppd', label: 'Surat Perintah Perjalanan Dinas (SPPD)' },
                        { id: 'ijazah', label: 'Revisi Ijazah (Virtual Loket)' },
                        { id: 'bendahara', label: 'Perubahan Bendahara' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold transition-all flex items-center justify-between ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                activeTab === tab.id
                                    ? 'bg-blue-700 text-blue-100'
                                    : 'bg-slate-100 text-slate-600'
                            }`}>
                                {(dbFlows[tab.id] || []).length} Tahap
                            </span>
                        </button>
                    ))}

                    <div className="mt-8 pt-4 border-t border-slate-100 px-3">
                        <div className="flex gap-2 text-xs text-slate-500 leading-normal">
                            <HelpCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <span>
                                Perubahan alur persetujuan hanya berlaku untuk pengajuan baru yang dikirim setelah konfigurasi disimpan.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Steps Config Editor */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Tahapan Alur Persetujuan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Urutkan langkah persetujuan dari tahap pertama hingga pengesahan akhir.</p>
                        </div>
                        <button
                            onClick={handleAddStep}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                            <Plus size={14} className="mr-1.5" />
                            Tambah Tahap
                        </button>
                    </div>

                    <div className="p-6">
                        {localSteps.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
                                <Sliders size={36} className="mx-auto mb-3 text-slate-300" />
                                <h4 className="font-semibold text-slate-700 mb-1">Belum Ada Tahap Persetujuan</h4>
                                <p className="text-xs max-w-sm mx-auto">Klik tombol di pojok kanan atas untuk mulai membuat langkah persetujuan pertama.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                                {localSteps.map((step, idx) => (
                                    <div key={step.id || step.step_order} className="relative pl-6 group">
                                        {/* Number Badge Timeline */}
                                        <div className="absolute w-6 h-6 rounded-full -left-[13px] top-1 flex items-center justify-center font-bold text-xs ring-4 ring-white bg-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            {idx + 1}
                                        </div>

                                        {/* Step Form Block */}
                                        <div className="bg-slate-50/40 border border-slate-200 rounded p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 transition-shadow hover:shadow-sm">
                                            {/* Step Label Input */}
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama / Label Tahap</label>
                                                <input
                                                    type="text"
                                                    value={step.step_label}
                                                    onChange={(e) => handleStepChange(idx, 'step_label', e.target.value)}
                                                    placeholder="Contoh: Persetujuan Kepala Bidang"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
                                                />
                                            </div>

                                            {/* Role Required Select */}
                                            <div className="w-full md:w-56">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Wewenang Role</label>
                                                <div className="relative flex items-center">
                                                    <select
                                                        value={step.role_id_required}
                                                        onChange={(e) => handleStepChange(idx, 'role_id_required', Number(e.target.value))}
                                                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white text-slate-700 font-semibold"
                                                    >
                                                        <option value="">Pilih Role...</option>
                                                        {roles.map(role => (
                                                            <option key={role.id} value={role.id}>
                                                                {role.name.replace('-', ' ').toUpperCase()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Shield size={12} className="absolute left-2.5 text-slate-400" />
                                                </div>
                                            </div>

                                            {/* Action Type Select */}
                                            <div className="w-full md:w-36">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipe Aksi</label>
                                                <select
                                                    value={step.action_type}
                                                    onChange={(e) => handleStepChange(idx, 'action_type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white text-slate-600"
                                                >
                                                    <option value="approve">Setujui (Approve)</option>
                                                    <option value="verify">Verifikasi (Verify)</option>
                                                    <option value="forward">Teruskan (Forward)</option>
                                                </select>
                                            </div>

                                            {/* Step Control Buttons (Up/Down/Delete) */}
                                            <div className="flex items-center gap-1 self-end md:self-center pt-2 md:pt-4 border-t md:border-t-0 border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveUp(idx)}
                                                    disabled={idx === 0}
                                                    className="p-1.5 border border-slate-200 hover:bg-white text-slate-500 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Pindahkan Ke Atas"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveDown(idx)}
                                                    disabled={idx === localSteps.length - 1}
                                                    className="p-1.5 border border-slate-200 hover:bg-white text-slate-500 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Pindahkan Ke Bawah"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStep(idx)}
                                                    className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 rounded"
                                                    title="Hapus Tahap"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Save & Cancel Panel */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-sm transition-colors"
                            >
                                <RotateCcw size={14} className="mr-1.5" />
                                Reset Alur
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saveMutation.isLoading}
                            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
                        >
                            {saveMutation.isLoading ? (
                                <span className="animate-spin border-2 border-white/20 border-t-white h-4 w-4 rounded-full mr-2" />
                            ) : (
                                <Save size={14} className="mr-1.5" />
                            )}
                            Simpan Konfigurasi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
