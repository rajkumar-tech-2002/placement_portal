import React from 'react';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, CheckSquare, Square, Trophy, Loader2 } from 'lucide-react';
import Pagination from './Pagination';

/**
 * A highly reusable and premium DataTable component.
 * 
 * @param {Object} props
 * @param {Array} props.columns - Configuration for columns: { header, key, sortable, render, className }
 * @param {Array} props.data - Array of data objects to display
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.sortBy - Current active sort column key
 * @param {String} props.sortOrder - Current sort order ('ASC' | 'DESC')
 * @param {Function} props.onSort - Callback when a header is clicked for sorting
 * @param {Array} props.selectedIds - Array of IDs for selected rows
 * @param {Function} props.onSelect - Callback for weight row selection
 * @param {Function} props.onSelectAll - Callback for top-level checkbox
 * @param {String} props.idKey - The property name for the unique ID (default: 'id')
 * @param {React.ReactNode} props.filters - Optional slot for filter bar content
 * @param {Object} props.pagination - Optional pagination props: { page, totalPages, totalItems, onPageChange }
 * @param {String} props.emptyMessage - Custom message when no data is found
 */
const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    sortBy = '',
    sortOrder = 'DESC',
    onSort = () => {},
    selectedIds = [],
    onSelect = () => {},
    onSelectAll = () => {},
    idKey = 'id',
    filters = null,
    pagination = null,
    emptyMessage = 'No records found',
    onLimitChange = null,
    limit = 10
}) => {

    const renderSortIcon = (columnKey) => {
        if (sortBy !== columnKey) return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />;
        return sortOrder === 'ASC' 
            ? <ChevronUp className="w-3.5 h-3.5 text-primary-500" /> 
            : <ChevronDown className="w-3.5 h-3.5 text-primary-500" />;
    };

    const isAllSelected = data.length > 0 && selectedIds.length === data.length;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col min-h-[500px]">
            
            {/* Filter Section Wrapper */}
            {filters && (
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
                    {filters}
                </div>
            )}

            {/* Table Area */}
            <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            {/* Selection Checkbox Header */}
                            <th className="p-4 w-12 text-center">
                                <button 
                                    onClick={onSelectAll} 
                                    className="text-primary-600 transition-transform active:scale-90"
                                >
                                    {isAllSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </button>
                            </th>

                            {/* Dynamic Headers */}
                            {columns.map((col, idx) => (
                                <th 
                                    key={idx}
                                    className={`p-4 text-xs font-black text-slate-400 uppercase tracking-widest ${col.sortable ? 'cursor-pointer group/th' : ''} ${col.className || ''}`}
                                    onClick={() => col.sortable && onSort(col.key)}
                                >
                                    <div className={`flex items-center gap-2 ${col.className?.includes('text-center') ? 'justify-center' : col.className?.includes('text-right') ? 'justify-end' : ''}`}>
                                        {col.header}
                                        {col.sortable && renderSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            // Skeleton Loading State
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="w-5 h-5 mx-auto bg-slate-100 dark:bg-slate-800 rounded-md"></div></td>
                                    {columns.map((_, idx) => (
                                        <td key={idx} className="p-4">
                                            <div className="h-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            // Empty State
                            <tr>
                                <td colSpan={columns.length + 1} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300">
                                            <Trophy className="w-10 h-10" />
                                        </div>
                                        <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                            {emptyMessage}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // Data Rows
                            data.map((row, rowIdx) => (
                                <tr 
                                    key={row[idKey] || rowIdx} 
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group"
                                >
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => onSelect(row[idKey])} 
                                            className={selectedIds.includes(row[idKey]) ? "text-primary-600" : "text-slate-300 transition-colors group-hover:text-slate-400"}
                                        >
                                            {selectedIds.includes(row[idKey]) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`p-4 ${col.className || ''}`}>
                                            {col.render ? col.render(row[col.key], row) : (
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {row[col.key] || '-'}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            {pagination && (
                <div className="shrink-0 flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50/30 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 gap-4">
                    <div className="flex items-center gap-4">
                        {onLimitChange && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show</span>
                                <select 
                                    value={limit}
                                    onChange={(e) => onLimitChange(Number(e.target.value))}
                                    className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                >
                                    {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entries</span>
                            </div>
                        )}
                        <div className="text-xs font-bold text-slate-500">
                            Showing <span className="text-slate-900 dark:text-white">{Math.min(pagination.totalItems, (pagination.page - 1) * limit + 1)}</span> to <span className="text-slate-900 dark:text-white">{Math.min(pagination.totalItems, pagination.page * limit)}</span> of <span className="text-slate-900 dark:text-white">{pagination.totalItems}</span> entries
                        </div>
                    </div>
                    <Pagination 
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default DataTable;
