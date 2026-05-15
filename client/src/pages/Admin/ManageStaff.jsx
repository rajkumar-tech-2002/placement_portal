import React, { useState, useEffect } from 'react';
import { 
    UserCheck, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    X, 
    Save, 
    Loader2,
    Building2,
    Phone,
    Briefcase,
    Users2,
    AlertCircle
} from 'lucide-react';
import api from '../../services/api.service';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import CampusFilter from '../../components/common/CampusFilter';
import DepartmentFilter from '../../components/common/DepartmentFilter';
import ModalTitle from '../../components/common/ModalTitle';
import InputLabel from '../../components/common/InputLabel';

const ManageStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [saving, setSaving] = useState(false);

    // Pagination & Table state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCampuses, setSelectedCampuses] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        campus: 'NEC',
        department: '',
        mobile: '',
        staff_type: 'Teaching',
        designation: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchStaff();
        setSelectedIds([]); // Reset selection on filter change
    }, [page, limit, debouncedSearch, sortBy, sortOrder, selectedCampuses, selectedDepartment]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await api.get('/staff', {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder,
                    campus: selectedCampuses,
                    department: selectedDepartment
                }
            });
            setStaffList(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data.data);
        } catch (error) {
            console.error('Failed to load departments');
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
        if (selectedIds.length === staffList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(staffList.map(s => s.id));
        }
    };

    const handleBulkDelete = async () => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Delete {selectedIds.length} staff members?</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.post('/staff/bulk-delete', { ids: selectedIds });
                            toast.success(`${selectedIds.length} staff members deleted`);
                            setSelectedIds([]);
                            fetchStaff();
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
            if (editingStaff) {
                await api.put(`/staff/${editingStaff.id}`, formData);
                toast.success('Staff updated successfully');
            } else {
                await api.post('/staff', formData);
                toast.success('Staff created successfully');
            }
            setIsModalOpen(false);
            setEditingStaff(null);
            resetForm();
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save staff');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            campus: 'NEC',
            department: '',
            mobile: '',
            staff_type: 'Teaching',
            designation: ''
        });
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            campus: staff.campus,
            department: staff.department,
            mobile: staff.mobile || '',
            staff_type: staff.staff_type || 'Teaching',
            designation: staff.designation || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Delete this staff member?</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.delete(`/staff/${id}`);
                            toast.success('Staff deleted');
                            fetchStaff();
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
            header: 'STAFF INFO',
            key: 'name',
            sortable: true,
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 uppercase">
                        {val.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{val}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{row.mobile || 'No mobile'}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'CAMPUS & DEPT',
            key: 'campus',
            sortable: true,
            render: (val, row) => (
                <div className="flex flex-col gap-1">
                    <span className={`w-fit px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${val === 'NEC' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                        {val}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">{row.department}</span>
                </div>
            )
        },
        {
            header: 'DESIGNATION',
            key: 'designation',
            sortable: true,
            className: 'text-sm font-bold text-slate-600 dark:text-slate-300'
        },
        {
            header: 'TYPE',
            key: 'staff_type',
            sortable: true,
            render: (val) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${val === 'Teaching' ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                    {val}
                </span>
            )
        },
        {
            header: 'ACTIONS',
            key: 'actions',
            className: 'text-right pr-6',
            render: (_, row) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => handleEdit(row)} className="p-2.5 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-90" title="Edit Staff">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-90" title="Delete Staff">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const campusDepartments = departments.filter(d => d.campus === formData.campus);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <ModalTitle icon={Users2} title="Staff Master" description="Manage faculty and administrative staff members." />
                
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
                            setEditingStaff(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-500/20 font-bold text-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        ADD STAFF
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={staffList}
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
                                placeholder="Search staff by name, dept or designation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm shadow-sm"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="w-full md:w-56">
                                <CampusFilter selectedCampuses={selectedCampuses} onChange={(val) => { setSelectedCampuses(val); setSelectedDepartment(''); }} />
                            </div>
                            <div className="w-full md:w-64">
                                <DepartmentFilter selectedCampuses={selectedCampuses} selectedDepartment={selectedDepartment} onChange={setSelectedDepartment} />
                            </div>
                        </div>
                    </div>
                }
                pagination={{
                    page,
                    totalPages,
                    totalItems: total,
                    onPageChange: setPage
                }}
                emptyMessage="No staff members found matching your search"
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <ModalTitle 
                                icon={editingStaff ? Edit2 : Plus} 
                                title={editingStaff ? 'Edit Staff Member' : 'New Staff Member'} 
                                description="Update faculty or administrative staff details"
                            />
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <InputLabel text="Staff Name" required />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>

                                {/* Mobile */}
                                <div className="space-y-2">
                                    <InputLabel text="Mobile Number" />
                                    <input
                                        type="text"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>

                                {/* Campus */}
                                <div className="space-y-2">
                                    <InputLabel text="Campus Selection" required />
                                    <select
                                        value={formData.campus}
                                        onChange={(e) => setFormData({ ...formData, campus: e.target.value, department: '' })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="NEC">NEC</option>
                                        <option value="NCT">NCT</option>
                                    </select>
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <InputLabel text="Department" required />
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="">Select Department</option>
                                        {campusDepartments.map(dept => (
                                            <option key={dept.id} value={dept.department}>{dept.department}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Staff Type */}
                                <div className="space-y-2">
                                    <InputLabel text="Staff Type" required />
                                    <select
                                        value={formData.staff_type}
                                        onChange={(e) => setFormData({ ...formData, staff_type: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="Teaching">Teaching</option>
                                        <option value="Non Teaching">Non Teaching</option>
                                    </select>
                                </div>

                                {/* Designation */}
                                <div className="space-y-2">
                                    <InputLabel text="Designation" />
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
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
                                {editingStaff ? 'Update Staff' : 'Create Staff'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStaff;
