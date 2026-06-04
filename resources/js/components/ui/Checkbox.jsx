import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({ className = '', error, label, id, ...props }, ref) => {
    const input = (
        <input
            type="checkbox"
            ref={ref}
            id={id}
            className={`h-4 w-4 text-teal-600 focus:ring-teal-500 rounded border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500' : 'border-slate-300'} ${className}`}
            {...props}
        />
    );

    if (label) {
        return (
            <div className="flex items-center gap-2">
                {input}
                <label htmlFor={id} className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
                    {label}
                </label>
            </div>
        );
    }

    return input;
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;

