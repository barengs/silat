import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 border-transparent',
    secondary: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 border-transparent',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    type = 'button',
    icon: Icon,
    ...props
}) {
    const baseStyle = 'inline-flex items-center justify-center font-medium rounded shadow-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
            {!isLoading && Icon && <Icon size={18} className="mr-2" />}
            {children}
        </button>
    );
}
