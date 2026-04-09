import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    Fingerprint,
    Lock,
    ArrowRight,
    Search,
    UserPlus,
    User,
    Shield,
    Building2,
    Loader2,
    CheckCircle2,
    Users,
    AlertCircle,
    ChevronsUpDown,
    ChevronUp,
    ChevronDown,
    Edit2,
    Trash2,
    CheckSquare,
    Square
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CampusFilter from '../../components/common/CampusFilter';
import Pagination from '../../components/common/Pagination';
import departmentService from '../../services/department.service';
import staffService from '../../services/staff.service';
import userService from '../../services/user.service';
import roleService from '../../services/role.service';
import SearchableSelect from '../../components/common/SearchableSelect';
import { formatDate } from '../../utils/dateFormatter';

const CreateUser = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [showRoleInput, setShowRoleInput] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCampuses, setSelectedCampuses] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [selectedIds, setSelectedIds] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [formData, setFormData] = useState({
        name: '',
        user_id: '',
        password: '',
        role: 'COORDINATOR',
        department: '',
        cambus: 'NEC'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, staffRes, usersRes, rolesRes] = await Promise.all([
                departmentService.getDepartments(),
                staffService.getStaff(),
                userService.getUsers(),
                roleService.getRoles()
            ]);
            setDepartments(deptRes.data || []);
            setStaffList(staffRes.data || []);
            setUsers(usersRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            toast.error('Failed to load initial data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await userService.getUsers();
            setUsers(res.data || []);
        } catch (error) {
            toast.error('Failed to refresh users');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // If staff member is selected, automatically update department and campus if available
        if (name === 'name') {
            const selectedStaff = staffList.find(s => s.name === value);
            if (selectedStaff) {
                setFormData(prev => ({
                    ...prev,
                    name: value,
                    department: selectedStaff.department || prev.department,
                    cambus: selectedStaff.cambus || prev.cambus
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.user_id || !formData.password || !formData.department) {
            toast.error('Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode && formData.id) {
                await userService.updateUser(formData.id, formData);
                toast.success('User updated successfully');
            } else {
                await userService.createUser(formData.id ? { ...formData, id: undefined } : formData);
                toast.success('User account created successfully');
            }
            setIsModalOpen(false);
            setFormData({
                name: '',
                user_id: '',
                password: '',
                role: 'COORDINATOR',
                department: '',
                cambus: 'NEC'
            });
            setIsEditMode(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (user) => {
        setFormData({
            ...user,
            password: '' // Don't show password
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Delete {selectedIds.length} users?</p>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await userService.deleteManyUsers(selectedIds);
                                toast.success('Selected users deleted');
                                setSelectedIds([]);
                                fetchUsers();
                            } catch (err) {
                                toast.error('Bulk delete failed');
                            }
                        }}
                        className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                        Delete All
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-right' });
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Delete User?</p>
                        <p className="text-xs text-slate-500 mt-1">This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await userService.deleteUser(id);
                                toast.success('User deleted successfully');
                                fetchOnlyUsers();
                            } catch (error) {
                                toast.error('Delete failed');
                            }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-500/20"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-right' });
    };

    const handleAddRole = async () => {
        if (!newRoleName.trim()) {
            toast.error('Role name cannot be empty');
            return;
        }
        try {
            await roleService.createRole(newRoleName.trim());
            toast.success('New role added successfully');
            setNewRoleName('');
            setShowRoleInput(false);
            const res = await roleService.getRoles();
            setRoles(res.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add role');
        }
    };

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(key);
            setSortOrder('ASC');
        }
    };

    const renderSortIcon = (field) => {
        if (sortBy !== field) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1.5 opacity-30" />;
        return sortOrder === 'ASC' 
            ? <ChevronUp className="w-3.5 h-3.5 ml-1.5 text-primary-600 font-bold" /> 
            : <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-primary-600 font-bold" />;
    };

    const filteredUsers = users
        .filter(user => {
            const matchesSearch = 
                (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.user_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            const matchesCampus = 
                selectedCampuses.length === 0 || 
                selectedCampuses.includes(user.cambus) ||
                user.cambus === 'Both';

            return matchesSearch && matchesCampus;
        })
        .sort((a, b) => {
            const valA = (a[sortBy] || '').toString().toLowerCase();
            const valB = (b[sortBy] || '').toString().toLowerCase();
            
            if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
            if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
            return 0;
        });

    const totalPages = Math.ceil(filteredUsers.length / limit);
    const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) 
            ? prev.filter(item => item !== id) 
            : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedUsers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedUsers.map(u => u.id));
        }
    };

    const filteredDepts = departments.filter(d =>
        formData.cambus === 'Both' || d.cambus === formData.cambus
    );

    // if (loading && viewMode === 'create') {
    //     return (
    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        coordinators: users.filter(u => u.role === 'COORDINATOR').length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary-500/10 rounded-2xl">
                        <Users className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage system administrators and coordinators</p>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 active:scale-95 font-bold"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/10' },
                    { label: 'Coordinators', value: stats.coordinators, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* User List Table area */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden flex flex-col transition-all duration-500">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-2xl transition-all font-bold text-xs shadow-sm animate-in fade-in slide-in-from-left-4 duration-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete {selectedIds.length}
                                </button>
                            )}
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-14 pr-8 py-4 w-full rounded-2xl border-none bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 transition-all outline-none font-bold text-sm shadow-inner"
                                />
                            </div>
                            <div className="hidden lg:block">
                                <CampusFilter 
                                    selectedCampuses={selectedCampuses} 
                                    onChange={setSelectedCampuses} 
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-900/50 px-6 py-3 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in duration-500">
                                Viewing <span className="text-primary-600 dark:text-primary-400 mx-1">{filteredUsers.length}</span> of <span className="text-slate-900 dark:text-white ml-1">{stats.total} users</span>
                            </span>
                        </div>
                    </div>
                    {/* Mobile Campus Filter */}
                    <div className="lg:hidden w-full">
                        <CampusFilter 
                            selectedCampuses={selectedCampuses} 
                            onChange={setSelectedCampuses} 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[700px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                                <th className="p-4 w-12 text-center">
                                    <button 
                                        onClick={toggleSelectAll}
                                        className="text-primary-600 dark:text-primary-400 hover:scale-110 transition-transform"
                                    >
                                        {paginatedUsers.length > 0 && selectedIds.length === paginatedUsers.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">
                                        User Profile {renderSortIcon('name')}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('user_id')}>
                                    <div className="flex items-center">
                                        Identification {renderSortIcon('user_id')}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('role')}>
                                    <div className="flex items-center">
                                        System Role {renderSortIcon('role')}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Institution</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                                            <p className="text-slate-400 font-bold animate-pulse">Loading members directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300 group">
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => toggleSelect(user.id)}
                                                className={selectedIds.includes(user.id) ? "text-primary-600" : "text-slate-300 dark:text-slate-600"}
                                            >
                                                {selectedIds.includes(user.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-sm shadow-sm">
                                                        {(user.name || '?').charAt(0)}
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${user.role === 'ADMIN' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                                                    {user.user_id}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Joined {formatDate(user.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${user.role === 'ADMIN'
                                                ? 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${user.cambus === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                                                user.cambus === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                                                    'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50'
                                                }`}>
                                                {user.cambus || 'NEC'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 line-clamp-1">{user.department || 'N/A'}</span>
                                        </td>
                                        <td className="p-4 text-right pr-8">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2.5 text-blue-500 hover:text-blue-600 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all active:scale-90"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2.5 text-red-400 hover:text-red-500 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all active:scale-90"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-32 text-center text-slate-400 font-medium">
                                        <Users className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                        <p>No users found matching your search.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                />
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-500/10 rounded-xl">
                                    <UserPlus className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {isEditMode ? 'Edit User Profile' : 'Add New System User'}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-bold mt-0.5">
                                        {isEditMode ? 'Update account details and permissions' : 'Configure a new access account for the system'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <form id="create-user-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Staff Selection */}
                                <SearchableSelect
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    options={staffList.map(s => ({ value: s.name, label: `${s.name} - ${s.cambus} (${s.department})` }))}
                                    placeholder="Select Staff Member"
                                    icon={User}
                                    label="Staff Assignment"
                                />

                                {/* Institution Campus */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center">
                                        <Building2 className="w-3.5 h-3.5 mr-2 text-primary-500" />
                                        Home Campus
                                    </label>
                                    <div className="flex gap-4 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {['NEC', 'NCT', 'Both'].map((campus) => (
                                            <button
                                                key={campus}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, cambus: campus }))}
                                                className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${formData.cambus === campus
                                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                    }`}
                                            >
                                                {campus}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Department Assignment */}
                                <SearchableSelect
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    options={filteredDepts.map(d => ({ value: d.department, label: `${d.cambus} - ${d.department}` }))}
                                    placeholder="Select Department"
                                    icon={Shield}
                                    label="Primary Department"
                                />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1 mb-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center">
                                            <Shield className="w-3.5 h-3.5 mr-2 text-primary-500" />
                                            Account Role
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowRoleInput(!showRoleInput)}
                                            className="p-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg hover:bg-primary-100 transition-all active:scale-90"
                                            title="Add New Role"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {showRoleInput && (
                                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300 mb-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                            <input
                                                type="text"
                                                value={newRoleName}
                                                onChange={(e) => setNewRoleName(e.target.value)}
                                                placeholder="Enter role name (e.g. HOD)"
                                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddRole}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
                                            >
                                                Save Role
                                            </button>
                                        </div>
                                    )}

                                    <SearchableSelect
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) => handleChange({ target: { name: 'role', value: e.target.value.toUpperCase() } })}
                                        options={roles.map(r => ({ value: r.role.toUpperCase(), label: r.role }))}
                                        placeholder="Select System Role"
                                        icon={Shield}
                                        label=""  // Label handled in header above
                                    />
                                </div>

                                {/* User ID */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center">
                                        <Fingerprint className="w-3.5 h-3.5 mr-2 text-primary-500" />
                                        User ID
                                    </label>
                                    <input
                                        type="text"
                                        name="user_id"
                                        placeholder="unique.id"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center">
                                        <Lock className="w-3.5 h-3.5 mr-2 text-primary-500" />
                                        Security Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm"
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-3 text-sm font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                form="create-user-form"
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-3.5 bg-primary-600 text-white hover:bg-primary-700 rounded-[1.5rem] transition-all shadow-xl shadow-primary-600/30 font-black text-sm active:scale-95 flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Initialize Account</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateUser;
