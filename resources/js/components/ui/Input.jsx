import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', error, ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`block w-full border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500'} rounded-md shadow-sm py-2 px-3 sm:text-sm bg-white transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';
export default Input;
