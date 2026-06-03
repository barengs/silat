import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center">
            <h1 className="text-6xl font-black text-blue-800">404</h1>
            <p className="mt-4 text-xl text-gray-600">Halaman tidak ditemukan</p>
            <button
                onClick={() => navigate(-1)}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
                Kembali
            </button>
        </div>
    );
}
