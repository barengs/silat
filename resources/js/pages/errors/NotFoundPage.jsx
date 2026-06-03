import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h1 className="text-9xl font-extrabold text-teal-600">404</h1>
                    <h2 className="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="mt-2 text-base text-slate-500">
                        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
                    </p>
                </div>
                
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
                    >
                        <Home size={20} className="mr-2" />
                        Kembali ke Dasbor
                    </button>
                </div>
            </div>
        </div>
    );
}
