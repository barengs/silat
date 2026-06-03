import React from 'react';

export default function TableSelect({ value, onChange, options = [10, 25, 50, 100] }) {
    return (
        <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span>Tampilkan</span>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="border border-slate-200 rounded-md py-1.5 px-3 bg-white text-slate-700 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            >
                {options.map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                        {pageSize}
                    </option>
                ))}
            </select>
            <span>data</span>
        </div>
    );
}
