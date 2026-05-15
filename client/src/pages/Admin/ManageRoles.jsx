import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    X, 
    Save, 
    Loader2,
    AlertCircle,
    UserCheck
} from 'lucide-react';
import api from '../../services/api.service';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import ModalTitle from '../../components/common/ModalTitle';
import InputLabel from '../../components/common/InputLabel';

const ManageRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [saving, setSaving] = useState(false);

    // Pagination & Table state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('role');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        role: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchRoles();
        setSelectedIds([]); // Reset selection on filter change
    }, [page, limit, debouncedSearch, sortBy, sortOrder]);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/roles', {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder
                }
            });
            setRoles(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to load roles');
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
        if (selectedIds.length === roles.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(roles.map(r => r.id));
        }
    };

    const handleBulkDelete = async () => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Delete {selectedIds.length} roles?</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.post('/roles/bulk-delete', { ids: selectedIds });
                            toast.success(`${selectedIds.length} roles deleted`);
                            setSelectedIds([]);
                            fetchRoles();
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
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, formData);
                toast.success('Role updated successfully');
            } else {
                await api.post('/roles', formData);
                toast.success('Role created successfully');
            }
            setIsModalOpen(false);
            setEditingRole(null);
            setFormData({ role: '' });
            fetchRoles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            role: role.role
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Delete this role?</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.delete(`/roles/${id}`);
                            toast.success('Role deleted');
                            fetchRoles();
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
            header: 'ROLE NAME',
            key: 'role',
            sortable: true,
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${val === 'SUPER ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-primary-50 text-primary-600 border border-primary-100'}`}>
                        <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{val}</span>
                </div>
            )
        },
        {
            header: 'ACTIONS',
            key: 'actions',
            className: 'text-right pr-6',
            render: (_, row) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => handleEdit(row)} className="p-2.5 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-90" title="Edit Role">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-90" title="Delete Role">
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
                <ModalTitle icon={ShieldCheck} title="Roles Master" description="Manage user access levels and permissions." />
                
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
                            setEditingRole(null);
                            setFormData({ role: '' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-500/20 font-bold text-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Role
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={roles}
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
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm shadow-sm"
                            />
                        </div>
                    </div>
                }
                pagination={{
                    page,
                    totalPages,
                    totalItems: total,
                    onPageChange: setPage
                }}
                emptyMessage="No roles found matching your search"
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <ModalTitle 
                                icon={editingRole ? Edit2 : Plus} 
                                title={editingRole ? 'Edit Role' : 'New Role'} 
                                description="Update user access level permissions"
                            />
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <InputLabel text="Role Name" required />
                                    <input
                                        type="text"
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value.toUpperCase() })}
                                        placeholder="e.g. COORDINATOR"
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
                                {editingRole ? 'Update Role' : 'Create Role'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRoles;
