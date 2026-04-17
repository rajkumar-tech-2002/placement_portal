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
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/dateFormatter';
import InputLabel from '../../components/common/InputLabel';
import SectionTitle from '../../components/common/SectionTitle';
import ModalTitle from '../../components/common/ModalTitle';

const LeetCodeDetails = () => {
    const { user } = useAuth();
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [syncing, setSyncing] = useState(null);
    
    // Pagination & Table state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('ASC');
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
        } finally {
            setIsSyncingAll(false);
        }
    };

    const syncLeetCodeData = async (id) => {
        setSyncing(id);
        try {
            await api.post(`/leetcode-details/sync/${id}`);
            toast.success('Student data synced');
            fetchDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sync failed');
        } finally {
            setSyncing(null);
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        return "Just now";
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

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const columns = [
        { 
            header: 'REG NO', 
            key: 'reg_no', 
            sortable: true,
            className: 'text-sm font-black text-slate-900 dark:text-white'
        },
        { 
            header: 'NAME', 
            key: 'name', 
            sortable: true,
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{val}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{row.department} | {row.campus_details}</span>
                </div>
            )
        },
        { 
            header: 'SOLVED', 
            key: 'total_solved', 
            sortable: true,
            render: (val, row) => (
                <div className="flex flex-col gap-2 min-w-[140px]">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {val || 0}
                            <span className="text-slate-400 font-medium ml-1">/ {row.total_questions || '-'}</span>
                        </span>
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-400 text-transparent" style={{ width: `${(row.easy_solved / (row.total_easy || 1)) * 100}%` }}>.</div>
                            <div className="h-full bg-amber-400 text-transparent" style={{ width: `${(row.medium_solved / (row.total_medium || 1)) * 100}%` }}>.</div>
                            <div className="h-full bg-red-400 text-transparent" style={{ width: `${(row.hard_solved / (row.total_hard || 1)) * 100}%` }}>.</div>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[9px] font-bold text-emerald-600">{row.easy_solved || 0}E</span>
                            <span className="text-[9px] font-bold text-amber-600">{row.medium_solved || 0}M</span>
                            <span className="text-[9px] font-bold text-red-600">{row.hard_solved || 0}H</span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            header: 'RATING', 
            key: 'contest_rating', 
            sortable: true,
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{val || 0}</span>
                            {row.attended_contests > 0 && (
                                <span className="text-[10px] text-slate-400 font-medium">({row.attended_contests})</span>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">RANK #{row.leet_rank || '-'}</span>
                    </div>
                </div>
            )
        },
        { 
            header: 'GLOBAL RANK', 
            key: 'global_ranking', 
            sortable: true,
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {val?.toLocaleString() || '-'}
                        </span>
                        {row.total_participants > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">/ {row.total_participants.toLocaleString()}</span>
                        )}
                    </div>
                </div>
            )
        },
        { 
            header: 'RECENT CONTEST', 
            key: 'last_contest_date',
            render: (_, row) => row.last_contest_name ? (
                <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group/contest relative max-w-[150px]">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold italic truncate">
                        <span className="text-slate-700 dark:text-slate-200 truncate" title={row.last_contest_name}>{row.last_contest_name}</span>
                        <span className="text-primary-600">#{row.last_contest_rank}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium italic">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDate(row.last_contest_date)}
                        </div>
                        <div className="flex items-center gap-1 px-1.5 font-bold text-slate-600 bg-white rounded shadow-sm">
                            {row.last_contest_solved}/{row.last_contest_total_questions}
                        </div>
                    </div>
                </div>
            ) : (
                <span className="text-slate-400 italic text-[10px]">No recent contest</span>
            )
        },
        { 
            header: 'PROFILE', 
            key: 'leet_code_profile',
            render: (val, row) => (
                <a 
                    href={val || (row.leetcode_username ? `https://leetcode.com/u/${row.leetcode_username}/` : '#')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Profile</span>
                </a>
            )
        },
        { 
            header: 'STATUS', 
            key: 'sync_status',
            render: (val) => (
                <div className="flex items-center gap-2">
                    {val === 'SUCCESS' ? (
                        <span className="px-2 py-1 text-[9px] font-black bg-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wider border border-emerald-200">SYNCED</span>
                    ) : (
                        <span className="px-2 py-1 text-[9px] font-black bg-slate-100 text-slate-500 rounded-lg uppercase tracking-wider border border-slate-200">PENDING</span>
                    )}
                </div>
            )
        },
        { 
            header: 'LAST SYNC', 
            key: 'last_sync_at',
            render: (val) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{formatRelativeTime(val)}</span>
                    <span className="text-[9px] text-slate-400 italic">{formatDate(val)}</span>
                </div>
            )
        },
        { 
            header: 'ACTIONS', 
            key: 'actions',
            className: 'text-right pr-6',
            render: (_, row) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => syncLeetCodeData(row.id)} className="p-2.5 text-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all active:scale-90" title="Sync Now">
                        <RefreshCw className={`w-4 h-4 ${syncing === row.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => handleEdit(row)} className="p-2.5 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-90" title="Edit Data">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-90" title="Delete record">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

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

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Delete this record?</p>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.delete(`/leetcode-details/${id}`);
                            toast.success('Record deleted');
                            fetchDetails();
                        } catch (error) {
                            toast.error('Delete failed');
                        }
                    }} className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg">Delete</button>
                </div>
            </div>
        ));
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/leetcode-details/export-template', { responseType: 'blob' });
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
            const response = await api.post('/leetcode-details/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.dismiss(loadingToast);
            toast.success(`Import completed: ${response.data.summary.inserted} inserted`);
            fetchDetails();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Import failed');
        }
    };

    const renderInput = (label, name, type = 'text', options = null, required = false) => (
        <div className="flex flex-col gap-2 w-full">
            <InputLabel text={label} required={required} />
            {options ? (
                <select name={name} value={formData[name] || ''} onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/40">
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input type={type} name={name} value={formData[name] || ''} onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/40" placeholder={`Enter ${label.toLowerCase()}`} required={required} />
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <ModalTitle icon={Code2} title="LeetCode Details" description="Monitor student programming performance" />
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button onClick={handleSyncAll} disabled={isSyncingAll} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 ${isSyncingAll ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}>
                        <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                        {isSyncingAll ? 'Syncing...' : 'Sync All'}
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4 text-primary-500" /> Template
                    </button>
                    <div className="relative">
                        <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImport} />
                        <button className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-all">
                            <Upload className="w-4 h-4 text-primary-500" /> Import
                        </button>
                    </div>
                    <button onClick={() => { 
                        setFormData({
                            campus_details: user?.role === 'COORDINATOR' ? user?.campus : '',
                            department: user?.role === 'COORDINATOR' ? user?.department : ''
                        }); 
                        setIsEditMode(false); 
                        setIsModalOpen(true); 
                    }} className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-500/20 font-bold text-sm active:scale-95">
                        <Plus className="w-4 h-4" />
                        Add Data
                    </button>
                </div>
            </div>

            {/* Table Area Section */}
            <DataTable 
                columns={columns}
                data={details}
                loading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                selectedIds={selectedIds}
                onSelect={(id) => {
                    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                }}
                onSelectAll={() => {
                    if (selectedIds.length === details.length && details.length > 0) setSelectedIds([]);
                    else setSelectedIds(details.map(d => d.id));
                }}
                filters={
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name or reg no..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="pl-11 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm" 
                                />
                            </div>
                            {user?.role !== 'COORDINATOR' && (
                                <div className="w-full md:w-56">
                                    <CampusFilter selectedCampuses={selectedCampuses} onChange={setSelectedCampuses} />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-[1.25rem] border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 px-3">
                                <input 
                                    type="checkbox" 
                                    id="eligible-only" 
                                    checked={showEligibleOnly} 
                                    onChange={(e) => setShowEligibleOnly(e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded-lg border-slate-200 focus:ring-primary-500 transition-all cursor-pointer"
                                />
                                <label htmlFor="eligible-only" className="text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    Eligible Only
                                </label>
                            </div>
                            
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                            
                            <div className="flex items-center gap-4 pr-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MIN SOLVED</span>
                                    <input 
                                        type="number" 
                                        value={minSolved} 
                                        onChange={(e) => setMinSolved(parseInt(e.target.value) || 0)}
                                        className="w-16 h-8 px-2 text-xs font-black rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-primary-500/50 text-center"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MIN RATING</span>
                                    <input 
                                        type="number" 
                                        value={minRating} 
                                        onChange={(e) => setMinRating(parseInt(e.target.value) || 0)}
                                        className="w-16 h-8 px-2 text-xs font-black rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-primary-500/50 text-center"
                                    />
                                </div>
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
                emptyMessage="No programming data found"
            />

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                        <ModalTitle 
                            icon={isEditMode ? Edit2 : Plus} 
                            title={isEditMode ? 'Edit LeetCode Data' : 'Add LeetCode Data'} 
                            description="Update student performance metrics manually" 
                        />
                        <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto custom-scrollbar max-h-[60vh]">
                        <form id="leetcode-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {renderInput('Registration Number', 'reg_no', 'text', null, true)}
                            {renderInput('Student Full Name', 'name', 'text', null, true)}
                            {renderInput('Campus Site', 'campus_details', 'text', user?.role === 'COORDINATOR' ? null : ['NEC', 'NCT'], true)}
                            {renderInput('Department Name', 'department', 'text', null, true)}
                            {renderInput('LeetCode Username', 'leetcode_username', 'text', null, true)}
                        </form>
                    </div>

                    <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                        <button onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 text-sm font-black text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-widest">
                            Cancel
                        </button>
                        <button form="leetcode-form" type="submit" className="px-10 py-3.5 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl shadow-xl shadow-primary-500/20 font-black text-sm uppercase tracking-widest active:scale-95 transition-all">
                            {isEditMode ? 'Update Record' : 'Create Entry'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LeetCodeDetails;
