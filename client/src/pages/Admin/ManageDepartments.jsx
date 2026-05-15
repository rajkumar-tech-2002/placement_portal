import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    X, 
    Save, 
    Loader2,
    MapPin,
    AlertCircle
} from 'lucide-react';
import api from '../../services/api.service';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import CampusFilter from '../../components/common/CampusFilter';
import ModalTitle from '../../components/common/ModalTitle';
import InputLabel from '../../components/common/InputLabel';

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [saving, setSaving] = useState(false);

    // Pagination & Table state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('department');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCampuses, setSelectedCampuses] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        campus: 'NEC',
        department: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchDepartments();
        setSelectedIds([]); // Reset selection on filter change
    }, [page, limit, debouncedSearch, sortBy, sortOrder, selectedCampuses]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/departments', {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder,
                    campus: selectedCampuses
                }
            });
            setDepartments(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortOrder('ASC');
        }
        setPage(1);
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === departments.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(departments.map(d => d.id));
        }
    };

    const handleBulkDelete = async () => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Delete {selectedIds.length} departments?</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.post('/departments/bulk-delete', { ids: selectedIds });
                            toast.success(`${selectedIds.length} departments deleted`);
                            setSelectedIds([]);
                            fetchDepartments();
                        } catch (error) {
                            toast.error('Bulk delete failed');
                        }
                    }} className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-lg shadow-red-500/20">Delete All</button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-right' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingDept) {
                await api.put(`/departments/${editingDept.id}`, formData);
                toast.success('Department updated successfully');
            } else {
                await api.post('/departments', formData);
                toast.success('Department created successfully');
            }
            setIsModalOpen(false);
            setEditingDept(null);
            setFormData({ campus: 'NEC', department: '' });
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save department');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (dept) => {
        setEditingDept(dept);
        setFormData({
            campus: dept.campus,
            department: dept.department
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Delete this department?</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.delete(`/departments/${id}`);
                            toast.success('Department deleted');
                            fetchDepartments();
                        } catch (error) {
                            toast.error('Delete failed');
                        }
                    }} className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-lg shadow-red-500/20">Delete</button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-right' });
    };

    const columns = [
        {
            header: 'S.NO',
            key: 'sno',
            render: (_, __, index) => (page - 1) * limit + index + 1,
            className: 'text-sm font-bold text-slate-400'
        },
        {
            header: 'CAMPUS',
            key: 'campus',
            sortable: true,
            render: (val) => (
                <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${val === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                        val === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                            'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                    {val}
                </span>
            )
        },
        {
            header: 'DEPARTMENT NAME',
            key: 'department',
            sortable: true,
            className: 'text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight'
        },
        {
            header: 'ACTIONS',
            key: 'actions',
            className: 'text-right pr-6',
            render: (_, row) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => handleEdit(row)} className="p-2.5 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-90" title="Edit Department">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-90" title="Delete Department">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <ModalTitle icon={Building2} title="Departments Master" description="Manage institution campuses and departments." />
                
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all border border-rose-100 font-bold text-sm active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" />
                            DELETE SELECTED ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setEditingDept(null);
                            setFormData({ campus: 'NEC', department: '' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-500/20 font-bold text-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Department
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={departments}
                loading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                filters={
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-[400px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search departments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm shadow-sm"
                            />
                        </div>
                        <div className="w-full md:w-72">
                            <CampusFilter selectedCampuses={selectedCampuses} onChange={(val) => { setSelectedCampuses(val); }} />
                        </div>
                    </div>
                }
                pagination={{
                    page,
                    totalPages,
                    totalItems: total,
                    onPageChange: setPage
                }}
                emptyMessage="No departments found matching your search"
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <ModalTitle 
                                icon={editingDept ? Edit2 : Plus} 
                                title={editingDept ? 'Edit Department' : 'New Department'} 
                                description="Update campus and department details"
                            />
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <InputLabel text="Campus Selection" required />
                                    <div className="grid grid-cols-2 gap-3">
                                        {['NEC', 'NCT'].map(campus => (
                                            <button
                                                key={campus}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, campus })}
                                                className={`py-3 rounded-2xl font-bold transition-all ${formData.campus === campus ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                            >
                                                {campus}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <InputLabel text="Department Name" required />
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value.toUpperCase() })}
                                        placeholder="e.g. CSE"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {editingDept ? 'Update Department' : 'Create Department'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDepartments;
