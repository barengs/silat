import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import authService from '@/services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormGroup from '@/components/ui/FormGroup';

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email tidak boleh kosong').email('Format email tidak valid'),
});

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [devResetUrl, setDevResetUrl] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(data.email);
            if (response.success) {
                setIsSent(true);
                toast.success(response.message || 'Email reset password berhasil dikirim.');
                if (response.dev_reset_url) {
                    setDevResetUrl(response.dev_reset_url);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim email reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Panel - Branding (Hidden on mobile) */}
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
                        Lupa<br />Kata Sandi?
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Masukkan email Anda yang terdaftar pada sistem untuk menerima instruksi pemulihan kata sandi.
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
                        <Link to="/login" className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors mb-4 gap-1">
                            <ArrowLeft size={16} /> Kembali ke Login
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Lupa Kata Sandi</h2>
                        <p className="text-slate-500">Masukkan email terdaftar untuk mengatur ulang kata sandi Anda.</p>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <FormGroup label="Email Terdaftar" error={errors.email?.message}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Input
                                        type="email"
                                        className="pl-10"
                                        placeholder="nama@email.com"
                                        error={errors.email}
                                        {...register('email')}
                                    />
                                </div>
                            </FormGroup>

                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full bg-[#166534] hover:bg-[#14532d] focus:ring-[#166534] mt-4 py-3"
                                icon={ArrowRight}
                            >
                                Kirim Link Reset
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="p-4 bg-teal-50 border border-teal-100 rounded text-teal-800 text-sm text-left">
                                <p className="font-bold mb-2">Email Terkirim!</p>
                                Kami telah mengirimkan petunjuk pemulihan kata sandi ke email Anda. Silakan periksa folder masuk (inbox) atau spam Anda.
                            </div>
                            
                            {devResetUrl && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm text-left">
                                    <p className="font-bold mb-2">Dev Mode Link (Vite/Local):</p>
                                    <a href={devResetUrl} className="underline break-all text-blue-600 hover:text-blue-800">
                                        {devResetUrl}
                                    </a>
                                </div>
                            )}

                            <Button
                                onClick={() => setIsSent(false)}
                                className="w-full bg-[#166534] hover:bg-[#14532d] focus:ring-[#166534] mt-4 py-3"
                            >
                                Kirim Ulang Email
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
