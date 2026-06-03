import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({ className = '', error, ...props }, ref) => {
    return (
        <input
            type="checkbox"
            ref={ref}
            className={`h-4 w-4 text-teal-600 focus:ring-teal-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500' : 'border-slate-300'} ${className}`}
            {...props}
        />
    );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
