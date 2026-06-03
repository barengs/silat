import React from 'react';

export default function Label({ children, className = '', htmlFor, required = false, ...props }) {
    return (
        <label 
            htmlFor={htmlFor} 
            className={`block text-sm font-medium text-slate-700 mb-1 ${className}`}
            {...props}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}
