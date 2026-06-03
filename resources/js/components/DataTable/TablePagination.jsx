import React from 'react';

export default function TablePagination({ table }) {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 gap-4">
            <div className="text-sm text-slate-500">
                Halaman <span className="font-medium text-slate-700">{pageCount > 0 ? pageIndex + 1 : 0}</span> dari{' '}
                <span className="font-medium text-slate-700">{pageCount}</span>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1.5 border border-slate-200 bg-white rounded text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                    Sebelumnya
                </button>
                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1.5 border border-slate-200 bg-white rounded text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                    Selanjutnya
                </button>
            </div>
        </div>
    );
}
