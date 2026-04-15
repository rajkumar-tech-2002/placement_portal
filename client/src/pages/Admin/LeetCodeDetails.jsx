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
    ExternalLink,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import CampusFilter from '../../components/common/CampusFilter';
import Modal from '../../components/common/Modal';

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
    const [isSyncingAll, setIsSyncingAll] = useState(false);
    const [minSolved, setMinSolved] = useState(0);
    const [minRating, setMinRating] = useState(0);
    const [showEligibleOnly, setShowEligibleOnly] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchDetails();
    }, [page, limit, debouncedSearch, sortBy, sortOrder, selectedCampuses, showEligibleOnly]);

    useEffect(() => {
        checkSyncStatus();
        const interval = setInterval(checkSyncStatus, 5000); // Poll sync status every 5s if needed
        return () => clearInterval(interval);
    }, []);

    const checkSyncStatus = async () => {
        try {
            const response = await api.get('/leetcode-details/sync-status');
            setIsSyncingAll(response.data.isSyncRunning);
        } catch (error) {
            console.error('Failed to fetch sync status');
        }
    };

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const endpoint = showEligibleOnly ? '/leetcode-details/eligible' : '/leetcode-details';
            const response = await api.get(endpoint, {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder,
                    campus: selectedCampuses,
                    minSolved: showEligibleOnly ? 200 : minSolved,
                    minRating: showEligibleOnly ? 1500 : minRating
                }
            });
            setDetails(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages || 1);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch LeetCode details');
            setLoading(false);
        }
    };

    const handleSyncAll = async () => {
        try {
            setIsSyncingAll(true);
            const response = await api.post('/leetcode-details/sync-all');
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sync failed to start');
            setIsSyncingAll(false);
        }
    };

    const handleSyncSingle = async (id) => {
        const loadingToast = toast.loading('Syncing student data...');
        try {
            await api.post(`/leetcode-details/sync/${id}`);
            toast.dismiss(loadingToast);
            toast.success('Student data synced');
            fetchDetails();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Sync failed');
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
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
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {selectedIds.length > 0 && (
                        <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Delete {selectedIds.length}
                        </button>
                    )}
                    
                    <button 
                        onClick={handleSyncAll} 
                        disabled={isSyncingAll}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                            isSyncingAll 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                        }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                        {isSyncingAll ? 'Syncing...' : 'Sync All'}
                    </button>

                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

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
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto items-center">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search by name or reg no..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium transition-all" />
                        </div>
                        {user?.role !== 'COORDINATOR' && (
                            <div className="w-full md:w-56">
                                <CampusFilter selectedCampuses={selectedCampuses} onChange={setSelectedCampuses} />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 px-3">
                            <input 
                                type="checkbox" 
                                id="eligible-only" 
                                checked={showEligibleOnly} 
                                onChange={(e) => setShowEligibleOnly(e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="eligible-only" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                Placement Eligible
                            </label>
                        </div>
                        
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Min Solved</span>
                                <input 
                                    type="number" 
                                    value={minSolved} 
                                    onChange={(e) => setMinSolved(parseInt(e.target.value) || 0)}
                                    className="w-16 p-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Min Rating</span>
                                <input 
                                    type="number" 
                                    value={minRating} 
                                    onChange={(e) => setMinRating(parseInt(e.target.value) || 0)}
                                    className="w-16 p-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                            </div>
                        </div>
                    </div>
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
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="flex items-center">Status</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('total_solved')}>
                                    <div className="flex items-center">Solved {renderSortIcon('total_solved')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('contest_rating')}>
                                    <div className="flex items-center">Rating {renderSortIcon('contest_rating')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Global Ranking</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Most Recent Contest</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Sync</th>
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
                                            {item.sync_status === 'SUCCESS' ? (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    SYNCED
                                                </div>
                                            ) : item.sync_status === 'FAILED' ? (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold group/error relative">
                                                    <AlertCircle className="w-3 h-3" />
                                                    ERROR
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/error:block w-48 p-2 bg-slate-900 text-white rounded-lg shadow-xl text-[10px] z-50">
                                                        {item.error_message || 'Unknown error'}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                                                    </div>
                                                </div>
                                            ) : item.sync_status === 'IN_PROGRESS' ? (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                    SYNCING
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold">
                                                    <Clock className="w-3 h-3" />
                                                    PENDING
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {item.total_solved || 0}
                                                        <span className="text-slate-400 font-medium ml-1">/ {item.total_questions || '-'}</span>
                                                    </span>
                                                </div>
                                                {item.total_questions > 0 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">
                                                        {Math.round((item.total_solved / item.total_questions) * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1.5">
                                                <div className="flex flex-col flex-1">
                                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                                        <div className="h-full bg-emerald-400" style={{ width: `${(item.easy_solved / (item.total_easy || 1)) * 100}%` }} />
                                                        <div className="h-full bg-amber-400" style={{ width: `${(item.medium_solved / (item.total_medium || 1)) * 100}%` }} />
                                                        <div className="h-full bg-red-400" style={{ width: `${(item.hard_solved / (item.total_hard || 1)) * 100}%` }} />
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-[9px] font-bold text-emerald-600">{item.easy_solved || 0} / {item.total_easy || '-'}E</span>
                                                        <span className="text-[9px] font-bold text-amber-600">{item.medium_solved || 0} / {item.total_medium || '-'}M</span>
                                                        <span className="text-[9px] font-bold text-red-600">{item.hard_solved || 0} / {item.total_hard || '-'}H</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-amber-400" />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.contest_rating || 0}</span>
                                                    {item.attended_contests > 0 && (
                                                        <span className="text-[10px] text-slate-400 font-medium">({item.attended_contests} events)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">RANK #{item.leet_rank || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {item.global_ranking?.toLocaleString() || '-'}
                                                </span>
                                                {item.total_participants > 0 && (
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        / {item.total_participants.toLocaleString()} participating
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {item.last_contest_name ? (
                                            <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group/contest relative">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]" title={item.last_contest_name}>
                                                        {item.last_contest_name}
                                                    </span>
                                                    <span className="text-[10px] font-black text-primary-600">#{item.last_contest_rank}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium italic">
                                                        <Calendar className="w-2.5 h-2.5" />
                                                        {new Date(item.last_contest_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                                            {item.last_contest_solved} / {item.last_contest_total_questions}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 italic text-[10px]">
                                                <BarChart3 className="w-3.5 h-3.5" />
                                                No recent contest
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{formatTimeAgo(item.last_synced_at)}</span>
                                            </div>
                                            {item.last_synced_at && (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="text-[10px] font-medium">{new Date(item.last_synced_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
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
                                            <button 
                                                onClick={() => handleSyncSingle(item.id)} 
                                                title="Sync Live Data"
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${item.sync_status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                                            </button>
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
            </Modal>
        </div>
    );
};

export default LeetCodeDetails;
