import React from 'react';

const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function Badge({ children, variant = 'default', className = '', icon: Icon }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}>
            {Icon && <Icon size={14} className="mr-1" />}
            {children}
        </span>
    );
}
