import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { 
    User, 
    Lock, 
    Upload, 
    FileSignature, 
    Key, 
    Mail, 
    Phone, 
    Building2, 
    Briefcase,
    Loader2,
    Shield,
    Camera
} from 'lucide-react';

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('biodata');

    // Fetch Profile
    const { data: profileResponse, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await axios.get('/profile');
            return res.data.data;
        }
    });

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [nip, setNip] = useState('');

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

    // Set initial values when profile loads
    React.useEffect(() => {
        if (profileResponse) {
            setName(profileResponse.name || '');
            setEmail(profileResponse.email || '');
            setPhone(profileResponse.phone || '');
            setNip(profileResponse.nip || '');
        }
    }, [profileResponse]);

    // Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const res = await axios.put('/profile', data);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Profil berhasil diperbarui');
            queryClient.invalidateQueries(['profile']);
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach(errArray => {
                    errArray.forEach(msg => toast.error(msg));
                });
            } else {
                toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
            }
        }
    });

    // Change Password Mutation
    const changePasswordMutation = useMutation({
        mutationFn: async (data) => {
            const res = await axios.post('/profile/password', data);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Password berhasil diperbarui');
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirmation('');
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach(errArray => {
                    errArray.forEach(msg => toast.error(msg));
                });
            } else {
                toast.error(err.response?.data?.message || 'Gagal mengubah password');
            }
        }
    });

    // Upload Photo Mutation
    const uploadPhotoMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('photo', file);
            const res = await axios.post('/profile/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Foto profil berhasil diperbarui');
            queryClient.invalidateQueries(['profile']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mengunggah foto');
        }
    });

    // Upload Signature Mutation
    const uploadSignatureMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('signature', file);
            const res = await axios.post('/profile/signature', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Tanda tangan elektronik berhasil diperbarui');
            queryClient.invalidateQueries(['profile']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mengunggah tanda tangan');
        }
    });

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate({ name, email, phone, nip });
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (newPassword !== newPasswordConfirmation) {
            toast.error('Konfirmasi password tidak cocok');
            return;
        }
        changePasswordMutation.mutate({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPasswordConfirmation
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadPhotoMutation.mutate(file);
        }
    };

    const handleSignatureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadSignatureMutation.mutate(file);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan Profil</h1>
                <p className="text-slate-500 text-sm mt-1">Kelola data diri, keamanan akun, dan tanda tangan digital pribadi Anda.</p>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group shrink-0">
                    <img 
                        src={profileResponse?.photo_path || `https://ui-avatars.com/api/?name=${profileResponse?.name || 'User'}&background=166534&color=fff`} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full border border-slate-200 object-cover bg-slate-100"
                    />
                    <label className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full text-white cursor-pointer hover:bg-teal-700 transition-colors shadow-sm">
                        <Camera size={14} />
                        <input type="file" onChange={handlePhotoChange} className="hidden" accept="image/jpeg,image/png,image/jpg" />
                    </label>
                    {uploadPhotoMutation.isPending && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={20} />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-xl font-bold text-slate-800 capitalize">{profileResponse?.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Mail size={14} />{profileResponse?.email}</span>
                        <span className="hidden md:inline">•</span>
                        {profileResponse?.nip && (
                            <span className="flex items-center gap-1.5"><Shield size={14} />NIP. {profileResponse?.nip}</span>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        {profileResponse?.roles?.map((role) => (
                            <span key={role} className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-50 text-teal-700 uppercase tracking-wider">
                                {role.replace('-', ' ')}
                            </span>
                        ))}
                        {profileResponse?.institution && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                                <Building2 size={12} />
                                {profileResponse.institution.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Tab Navigation */}
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    <button
                        onClick={() => setActiveTab('biodata')}
                        className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'biodata' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <User size={16} />
                        Biodata Diri
                    </button>
                    <button
                        onClick={() => setActiveTab('keamanan')}
                        className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'keamanan' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Lock size={16} />
                        Keamanan
                    </button>
                    <button
                        onClick={() => setActiveTab('tte')}
                        className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'tte' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <FileSignature size={16} />
                        Tanda Tangan (TTE)
                    </button>
                </div>

                <div className="p-6">
                    {/* Biodata Tab */}
                    {activeTab === 'biodata' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">NIP (Nomor Induk Pegawai)</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            value={nip} 
                                            onChange={(e) => setNip(e.target.value)} 
                                            className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="Masukkan NIP jika ada"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Email Resmi</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="email" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Nomor Telepon / WA</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            value={phone} 
                                            onChange={(e) => setPhone(e.target.value)} 
                                            className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    disabled={updateProfileMutation.isPending}
                                    className="px-6 py-2.5 bg-teal-600 text-white rounded font-semibold text-sm hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    {updateProfileMutation.isPending && <Loader2 className="animate-spin" size={16} />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Keamanan Tab */}
                    {activeTab === 'keamanan' && (
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Password Saat Ini</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="password" 
                                        value={currentPassword} 
                                        onChange={(e) => setCurrentPassword(e.target.value)} 
                                        className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Password Baru</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Konfirmasi Password Baru</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="password" 
                                        value={newPasswordConfirmation} 
                                        onChange={(e) => setNewPasswordConfirmation(e.target.value)} 
                                        className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    disabled={changePasswordMutation.isPending}
                                    className="px-6 py-2.5 bg-rose-600 text-white rounded font-semibold text-sm hover:bg-rose-700 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    {changePasswordMutation.isPending && <Loader2 className="animate-spin" size={16} />}
                                    Perbarui Sandi
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TTE / Tanda Tangan Tab */}
                    {activeTab === 'tte' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-600 text-sm">
                                <p className="font-bold flex items-center gap-2 text-slate-700 mb-1">
                                    <FileSignature size={16} className="text-teal-600" />
                                    Tanda Tangan Elektronik (TTE)
                                </p>
                                Gambar tanda tangan ini akan disematkan secara otomatis di dokumen-dokumen dinas resmi (seperti surat tugas, lembar SPPD, atau surat rekomendasi) apabila Anda bertindak sebagai pejabat penyetuju (*approver*). Gunakan berkas dengan latar belakang transparan (format **PNG**).
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="border border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50/50 relative hover:bg-slate-50 transition-colors min-h-[220px]">
                                    {uploadSignatureMutation.isPending ? (
                                        <Loader2 className="animate-spin text-teal-600" size={32} />
                                    ) : (
                                        <>
                                            <Upload className="text-slate-400 mb-4" size={36} />
                                            <p className="text-sm font-semibold text-slate-800">Unggah Tanda Tangan Baru</p>
                                            <p className="text-xs text-slate-400 mt-1">Hanya mendukung format PNG Transparan (Maks. 1MB)</p>
                                            <label className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                                                Pilih File
                                                <input type="file" onChange={handleSignatureChange} className="hidden" accept="image/png" />
                                            </label>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Pratinjau Tanda Tangan Saat Ini</label>
                                    <div className="border border-slate-200 rounded bg-white p-4 flex items-center justify-center min-h-[160px] overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
                                        {profileResponse?.signature_image_path ? (
                                            <img 
                                                src={profileResponse.signature_image_path} 
                                                alt="TTE" 
                                                className="max-h-32 object-contain"
                                            />
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Belum ada tanda tangan diunggah</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
