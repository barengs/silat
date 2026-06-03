import React from 'react';
import { Search } from 'lucide-react';

export default function TableInput({ value, onChange, placeholder = 'Pencarian...' }) {
    return (
        <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
