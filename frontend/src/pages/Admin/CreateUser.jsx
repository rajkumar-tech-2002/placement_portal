import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    User,
    Shield,
    Building2,
    Loader2,
    CheckCircle2,
    Search,
    Users,
    Trash2,
    AlertCircle,
    Fingerprint,
    Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import departmentService from '../../services/department.service';
import staffService from '../../services/staff.service';
import userService from '../../services/user.service';
import SearchableSelect from '../../components/common/SearchableSelect';
import { formatDate } from '../../utils/dateFormatter';

const CreateUser = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('create'); // 'create' or 'list'
    const [departments, setDepartments] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        user_id: '',
        password: '',
        role: 'COORDINATOR',
        department: '',
        cambus: 'NEC'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, staffRes] = await Promise.all([
                    departmentService.getDepartments(),
                    staffService.getStaff()
                ]);
                setDepartments(deptRes.data || []);
                setStaffList(staffRes.data || []);
            } catch (error) {
                toast.error('Failed to load initial data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userService.getUsers();
            setUsers(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'list') {
            fetchUsers();
        }
    }, [viewMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // If staff member is selected, automatically update department if available
        if (name === 'name') {
            const selectedStaff = staffList.find(s => s.name === value);
            if (selectedStaff) {
                setFormData(prev => ({
                    ...prev,
                    name: value,
                    department: selectedStaff.department || prev.department
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
            await userService.createUser(formData);
            toast.success('User created successfully');
            setFormData({ name: '', user_id: '', password: '', role: 'COORDINATOR', department: '', cambus: 'NEC' });
            setViewMode('list');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
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
                                fetchUsers();
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

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.user_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading && viewMode === 'create') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                        {viewMode === 'create' ? <UserPlus className="w-8 h-8 mr-3 text-primary-500" /> : <Users className="w-8 h-8 mr-3 text-emerald-500" />}
                        {viewMode === 'create' ? 'Create User' : 'User Management'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{viewMode === 'create' ? 'Provision a new Admin or Coordinator account' : 'View and manage system user accounts'}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                    <button
                        onClick={() => setViewMode(viewMode === 'create' ? 'list' : 'create')}
                        className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${viewMode === 'create'
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/20'
                            }`}
                    >
                        {viewMode === 'create' ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {viewMode === 'create' ? 'View Users' : 'Create User'}
                    </button>
                </div>
                {/* Decorative Background Element */}
                <div className={`absolute -right-12 -bottom-12 w-64 h-64 rounded-full opacity-[0.03] transition-colors duration-1000 ${viewMode === 'create' ? 'bg-primary-500' : 'bg-emerald-500'}`} />
            </div>

            {viewMode === 'create' ? (
                /* Form Card */
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">

                            {/* Staff Name Selection */}
                            <SearchableSelect
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                options={staffList.map(s => ({ value: s.name, label: `${s.name} - ${s.designation}` }))}
                                placeholder="Select Staff Member"
                                icon={User}
                                label="Staff Name"
                            />

                            {/* Department Selection */}
                            <SearchableSelect
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                options={departments.map(d => ({ value: d.department, label: d.department }))}
                                placeholder="Select Department"
                                icon={Building2}
                                label="Department Handling"
                            />

                            {/* Role Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                                    <Shield className="w-3 h-3 mr-1" />
                                    System Role
                                </label>
                                <div className="flex gap-4 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    {['COORDINATOR', 'ADMIN'].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, role }))}
                                            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all active:scale-95 ${formData.role === role
                                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-500/10'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
 
                            {/* Campus Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    Institution Campus
                                </label>
                                <div className="flex gap-4 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                                    {['NEC', 'NCT', 'Both'].map((campus) => (
                                        <button
                                            key={campus}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, cambus: campus }))}
                                            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all active:scale-95 ${formData.cambus === campus
                                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-500/10'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            {campus}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* User ID */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                                    <Fingerprint className="w-3 h-3 mr-1" />
                                    User Identification ID
                                </label>
                                <input
                                    type="text"
                                    name="user_id"
                                    placeholder="Enter unique identification"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-2 focus:ring-primary-500/40 transition-all font-mono shadow-sm outline-none text-sm"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Account Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-2 focus:ring-primary-500/40 transition-all shadow-sm outline-none text-sm"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="md:col-span-2 pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-primary-600 text-white px-10 py-4 rounded-[2rem] font-black text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 group"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-6 h-6" />
                                            Register Account
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            ) : (
                /* User List Table Area */
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-4 w-full rounded-2xl border-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 transition-all outline-none font-bold text-sm shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                            <span className="px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                                Total: <span className="text-slate-900 dark:text-emerald-400 ml-1">{filteredUsers.length}</span>
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-50 dark:border-slate-800">
                                    <th className="px-10 py-6">Identity</th>
                                    <th className="px-10 py-6">Unique User ID</th>
                                    <th className="px-10 py-6">System Role</th>
                                    <th className="px-10 py-6">Campus</th>
                                    <th className="px-10 py-6">Department</th>
                                    <th className="px-10 py-6">Registration Date</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                                <p className="text-slate-400 font-bold italic">Loading user directory...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300 group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                                                        {(user.name || '?').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white transition-colors group-hover:text-emerald-500">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-xs font-bold text-slate-400 font-mono tracking-tight bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">{user.user_id}</span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${user.role === 'ADMIN'
                                                        ? 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50 shadow-sm shadow-primary-500/10'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                                                    user.cambus === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                                                    user.cambus === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                                                    'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50'
                                                }`}>
                                                    {user.cambus || 'NEC'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 font-bold text-sm text-slate-600 dark:text-slate-300">
                                                {user.department || 'N/A'}
                                            </td>
                                            <td className="px-10 py-6 text-xs font-bold text-slate-400">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 dark:bg-slate-950 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-32 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Search className="w-16 h-16" />
                                                <p className="text-xl font-black italic tracking-tight">No records found matching your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateUser;
