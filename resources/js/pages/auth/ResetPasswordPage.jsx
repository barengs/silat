import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import authService from '@/services/authService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormGroup from '@/components/ui/FormGroup';

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Kata sandi minimal harus 8 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['password_confirmation'],
});

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            toast.error('Token reset password tidak valid atau tidak lengkap.');
            navigate('/login', { replace: true });
        }
    }, [token, email, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.resetPassword({
                token,
                email,
                password: data.password,
                password_confirmation: data.password_confirmation
            });
            
            if (response.success) {
                toast.success(response.message || 'Password berhasil diubah.');
                navigate('/login', { replace: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#166534] text-white flex-col justify-between p-12 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay" 
                    style={{ backgroundImage: "url('/images/batik.png')" }}
                ></div>
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex items-center space-x-5">
                    <img src="/images/logo-pamekasan.png" alt="Logo Pamekasan" className="w-32 h-32 object-contain" onError={(e) => e.target.src='https://upload.wikimedia.org/wikipedia/commons/e/e0/Lambang_Kabupaten_Pamekasan.png'} />
                    <div>
                        <h1 className="font-bold text-3xl leading-tight">Dinas Pendidikan</h1>
                        <p className="text-sm tracking-widest text-slate-300 font-semibold uppercase">Kabupaten Pamekasan</p>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg mt-20 mb-auto">
                    <span className="inline-block px-3 py-1 mb-6 text-xs font-medium text-slate-300 border border-slate-700 rounded-full bg-slate-800/50 backdrop-blur-sm">
                        Sistem Tata Kelola
                    </span>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Atur Ulang<br />Kata Sandi
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Masukkan kata sandi baru Anda untuk memulihkan akses penuh ke sistem.
                    </p>
                </div>

                <div className="relative z-10 flex items-center text-slate-400 text-sm">
                    <ShieldCheck size={18} className="mr-2" />
                    <span>Pastikan kredensial Anda selalu terjaga kerahasiaannya.</span>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Atur Ulang Sandi</h2>
                        <p className="text-slate-500">Silakan buat kata sandi baru untuk akun **{email}**.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <FormGroup label="Kata Sandi Baru" error={errors.password?.message}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <Input
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

                        <FormGroup label="Konfirmasi Kata Sandi Baru" error={errors.password_confirmation?.message}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="pl-10 pr-10"
                                    placeholder="••••••••"
                                    error={errors.password_confirmation}
                                    {...register('password_confirmation')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </FormGroup>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full bg-[#166534] hover:bg-[#14532d] focus:ring-[#166534] mt-4 py-3"
                            icon={ArrowRight}
                        >
                            Perbarui Kata Sandi
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
