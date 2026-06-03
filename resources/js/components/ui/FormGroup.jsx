import React from 'react';
import Label from './Label';

export default function FormGroup({ label, error, required = false, children, className = '' }) {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && <Label required={required}>{label}</Label>}
            {children}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
}
