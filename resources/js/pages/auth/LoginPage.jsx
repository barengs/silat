import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import authService from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Lock, User as UserIcon, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormGroup from '@/components/ui/FormGroup';

// Define validation schema using Zod
const loginSchema = z.object({
    username: z.string().min(1, 'NIP atau Username tidak boleh kosong'),
    password: z.string().min(1, 'Kata sandi tidak boleh kosong'),
});

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.login({
                username: data.username,
                password: data.password
            });
            
            if (response.success) {
                // Save to redux
                dispatch(setCredentials({
                    user: response.user,
                    token: response.token,
                    roles: response.roles,
                    permissions: response.permissions,
                }));
                
                toast.success(response.message || 'Login berhasil!');
                navigate('/dashboard', { replace: true });
            }
        } catch (error) {
            toast.error(error.message || 'Gagal masuk ke sistem. Silakan periksa kembali kredensial Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Panel - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#166534] text-white flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex items-center space-x-3">
                    <img src="/images/logo-pamekasan.png" alt="Logo Pamekasan" className="w-12 h-12 object-contain" onError={(e) => e.target.src='https://upload.wikimedia.org/wikipedia/commons/e/e0/Lambang_Kabupaten_Pamekasan.png'} />
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Dinas Pendidikan</h1>
                        <p className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase">Kabupaten Pamekasan</p>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg mt-20 mb-auto">
                    <span className="inline-block px-3 py-1 mb-6 text-xs font-medium text-slate-300 border border-slate-700 rounded-full bg-slate-800/50 backdrop-blur-sm">
                        Sistem Tata Kelola
                    </span>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Portal Layanan<br />Pendidikan<br />Terpadu
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Sistem informasi ini dikhususkan untuk tenaga kependidikan dan staf administrasi sekolah di lingkungan Dinas Pendidikan Kabupaten Pamekasan.
                    </p>
                </div>

                <div className="relative z-10 flex items-center text-slate-400 text-sm">
                    <ShieldCheck size={18} className="mr-2" />
                    <span>Pastikan kredensial Anda selalu terjaga kerahasiaannya.</span>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
                {/* Mobile branding (visible only on small screens) */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center space-x-3">
                    <img src="/images/logo-pamekasan.png" alt="Logo Pamekasan" className="w-10 h-10 object-contain" onError={(e) => e.target.src='https://upload.wikimedia.org/wikipedia/commons/e/e0/Lambang_Kabupaten_Pamekasan.png'} />
                    <div>
                        <h1 className="font-bold text-[#166534] text-sm leading-tight">Dinas Pendidikan</h1>
                        <p className="text-[9px] tracking-widest text-slate-500 font-semibold uppercase">Kab. Pamekasan</p>
                    </div>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Masuk ke Sistem</h2>
                        <p className="text-slate-500">Silakan masukkan NIP atau Username Anda untuk melanjutkan.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <FormGroup label="Email atau NIP" error={errors.username?.message}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <Input
                                    type="text"
                                    className="pl-10"
                                    placeholder="Masukkan email atau NIP Anda"
                                    error={errors.username}
                                    {...register('username')}
                                />
                            </div>
                        </FormGroup>

                        <FormGroup label="Kata Sandi" error={errors.password?.message}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="pl-10 pr-10"
                                    placeholder="••••••••"
                                    error={errors.password}
                                    {...register('password')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </FormGroup>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full bg-[#166534] hover:bg-[#14532d] focus:ring-[#166534] group mt-4 py-3"
                            icon={ArrowRight}
                        >
                            Masuk ke Sistem
                        </Button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-slate-200">
                        <p className="text-center text-sm text-slate-500">
                            Belum memiliki akses?{' '}
                            <a href="#" className="font-medium text-teal-600 hover:text-teal-500 hover:underline transition-colors">
                                Hubungi Administrator Dinas
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
