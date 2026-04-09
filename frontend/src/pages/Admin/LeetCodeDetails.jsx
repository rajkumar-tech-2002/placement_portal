import React, { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import { 
    Search, 
    Plus, 
    Edit2, 
    Trash2, 
    Code2,
    MoreHorizontal, 
    X,
    Filter,
    Download,
    CheckSquare,
    Square,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Upload,
    Building2,
    Target,
    Trophy,
    Globe,
    BarChart3,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import CampusFilter from '../../components/common/CampusFilter';

const LeetCodeDetails = () => {
    const { user } = useAuth();
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    
    // Pagination & Table state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCampuses, setSelectedCampuses] = useState(
        user?.role === 'COORDINATOR' && user?.campus ? [user.campus] : []
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchDetails();
    }, [page, limit, debouncedSearch, sortBy, sortOrder, selectedCampuses]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/leetcode-details`, {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder,
                    campus: selectedCampuses
                }
            });
            setDetails(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch LeetCode details');
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

    const renderSortIcon = (field) => {
        if (sortBy !== field) return <ChevronsUpDown className="w-4 h-4 ml-1 opacity-30" />;
        return sortOrder === 'ASC' ? <ChevronUp className="w-4 h-4 ml-1 text-primary-600" /> : <ChevronDown className="w-4 h-4 ml-1 text-primary-600" />;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.put(`/leetcode-details/${formData.id}`, formData);
                toast.success('Record updated successfully');
            } else {
                await api.post('/leetcode-details', formData);
                toast.success('Record added successfully');
            }
            setIsModalOpen(false);
            fetchDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await api.delete(`/leetcode-details/${id}`);
            toast.success('Record deleted');
            fetchDetails();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return;
        try {
            await api.post('/leetcode-details/delete-many', { ids: selectedIds });
            toast.success('Records deleted');
            setSelectedIds([]);
            fetchDetails();
        } catch (error) {
            toast.error('Bulk delete failed');
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/leetcode-details/export-template', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leetcode_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Template exported');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        const loadingToast = toast.loading('Importing data...');

        try {
            const response = await api.post('/leetcode-details/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.dismiss(loadingToast);
            const { summary } = response.data;
            toast.success(`Import completed: ${summary.inserted} inserted, ${summary.updated} updated`);
            fetchDetails();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Import failed');
        }
        e.target.value = null;
    };

    const renderInput = (label, name, type = 'text', options = null) => (
        <div className="flex flex-col gap-2 w-full">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                {label}
            </label>
            {options ? (
                <select
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold"
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                        <Code2 className="w-8 h-8 mr-3 text-primary-500" />
                        LeetCode Details
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor student programming performance</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedIds.length > 0 && (
                        <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm">
                            <Trash2 className="w-4 h-4" />
                            Delete {selectedIds.length}
                        </button>
                    )}
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4 text-primary-500" />
                        Template
                    </button>
                    <div className="relative">
                        <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImport} />
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all">
                            <Upload className="w-4 h-4 text-primary-500" />
                            Import
                        </button>
                    </div>
                    <button onClick={() => { 
                        setFormData({
                            campus_details: user?.role === 'COORDINATOR' ? user?.campus : '',
                            department: user?.role === 'COORDINATOR' ? user?.department : ''
                        }); 
                        setIsEditMode(false); 
                        setIsModalOpen(true); 
                    }} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-all shadow-lg font-semibold text-sm">
                        <Plus className="w-4 h-4" />
                        Add Data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search by name or reg no..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium" />
                    </div>
                    {user?.role !== 'COORDINATOR' && (
                        <div className="w-full md:w-auto min-w-[200px]">
                            <CampusFilter selectedCampuses={selectedCampuses} onChange={setSelectedCampuses} />
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="p-4 w-12 text-center">
                                    <button onClick={() => { if (selectedIds.length === details.length) setSelectedIds([]); else setSelectedIds(details.map(d => d.id)); }} className="text-primary-600">
                                        {selectedIds.length > 0 && selectedIds.length === details.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('reg_no')}>
                                    <div className="flex items-center">Reg No {renderSortIcon('reg_no')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">Name {renderSortIcon('name')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('leet_code_title')}>
                                    <div className="flex items-center">Leetcode Test {renderSortIcon('leet_code_title')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('problem_solved_count')}>
                                    <div className="flex items-center">Solved {renderSortIcon('problem_solved_count')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('contest_rating')}>
                                    <div className="flex items-center">Rating {renderSortIcon('contest_rating')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('global_ranking')}>
                                    <div className="flex items-center">Ranking {renderSortIcon('global_ranking')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leet Rank</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Profile</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {details.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                                    <td className="p-4 text-center">
                                        <button onClick={() => { setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]); }} className={selectedIds.includes(item.id) ? "text-primary-600" : "text-slate-300"}>
                                            {selectedIds.includes(item.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">{item.reg_no}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{item.department} | {item.campus_details}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.leet_code_title || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.problem_solved_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.contest_rating || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">#{item.global_ranking || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.leet_rank || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <a 
                                                href={item.leet_code_profile} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Profile</span>
                                            </a>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setFormData(item); setIsEditMode(true); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">{isEditMode ? 'Edit LeetCode Data' : 'Add LeetCode Data'}</h2>
                                <p className="text-sm text-slate-500">Update student performance metrics</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[70vh]">
                            <form id="leetcode-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {renderInput('Reg No', 'reg_no')}
                                {renderInput('Full Name', 'name')}
                                {renderInput('Campus', 'campus_details', 'text', user?.role === 'COORDINATOR' ? null : ['NEC', 'NCT'])}
                                {renderInput('Department', 'department', 'text', user?.role === 'COORDINATOR' ? null : undefined)}
                                {renderInput('LeetCode ID/Title', 'leet_code_title')}
                                {renderInput('Profile URL', 'leet_code_profile')}
                                {renderInput('Problems Solved', 'problem_solved_count', 'number')}
                                {renderInput('Contest Rating', 'contest_rating', 'number')}
                                {renderInput('Global Ranking', 'global_ranking', 'number')}
                                {renderInput('Leet Rank', 'leet_rank', 'number')}
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600">Cancel</button>
                            <button form="leetcode-form" type="submit" className="px-8 py-2.5 bg-primary-600 text-white rounded-xl shadow-lg font-bold text-sm">
                                {isEditMode ? 'Save Changes' : 'Add Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeetCodeDetails;
