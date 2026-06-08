import React from 'react';
import { flexRender } from '@tanstack/react-table';
import TableInput from './TableInput';
import TableSelect from './TableSelect';
import TablePagination from './TablePagination';

export default function DataTable({
    table,
    isLoading,
    searchTerm,
    onSearchChange,
    pageSize,
    onPageSizeChange,
    searchPlaceholder = 'Cari data...',
    filters = null,
}) {
    const columnsLength = table.getAllColumns().length;

    return (
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
            {/* Table Top Controls */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                    <TableInput 
                        value={searchTerm} 
                        onChange={onSearchChange} 
                        placeholder={searchPlaceholder} 
                    />
                    {filters}
                </div>
                <TableSelect 
                    value={pageSize} 
                    onChange={onPageSizeChange} 
                />
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                                        {header.isPlaceholder 
                                            ? null 
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columnsLength} className="px-4 py-8 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                                        <span>Memuat data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columnsLength} className="px-4 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="bg-slate-100 text-slate-500 rounded-full h-12 w-12 flex items-center justify-center mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </span>
                                        <span className="text-base font-medium text-slate-700">Tidak ada data ditemukan</span>
                                        <span className="text-sm mt-1">Coba sesuaikan filter pencarian Anda.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-2.5 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <TablePagination table={table} />
        </div>
    );
}
