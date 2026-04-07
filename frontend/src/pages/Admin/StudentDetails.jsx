import React, { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { 
    Search, 
    Plus, 
    Edit2, 
    Trash2, 
    User,
    MoreHorizontal, 
    X,
    Filter,
    Download,
    CheckSquare,
    Square,
    AlertCircle,
    CheckCircle2,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Upload,
    FileSpreadsheet,
    Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import CampusFilter from '../../components/common/CampusFilter';

const StudentDetails = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState({});
    
    // Pagination & Table state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCampuses, setSelectedCampuses] = useState([]); // ['NEC', 'NCT']

    const tabs = [
        { id: 'basic', label: 'Basic & Placement' },
        { id: 'academic', label: 'Academic' },
        { id: 'personal', label: 'Personal' },
        { id: 'skills', label: 'Skills & Others' }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchStudents();
    }, [page, limit, debouncedSearch, sortBy, sortOrder, selectedCampuses]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student-placements`, {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder,
                    campus: selectedCampuses
                }
            });
            setStudents(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch students');
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
                await api.put(`/student-placements/${formData.id}`, formData);
                toast.success('Student updated successfully');
            } else {
                await api.post('/student-placements', formData);
                toast.success('Student added successfully');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Are you sure you want to delete this record?</p>
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/student-placements/${id}`);
                                toast.success('Record deleted');
                                fetchStudents();
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

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Are you sure you want to delete {selectedIds.length} records?</p>
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.post('/student-placements/delete-many', { ids: selectedIds });
                                toast.success('Records deleted');
                                setSelectedIds([]);
                                fetchStudents();
                            } catch (error) {
                                toast.error('Bulk delete failed');
                            }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-500/20"
                    >
                        Delete All
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-right' });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) 
            ? prev.filter(item => item !== id) 
            : [...prev, id]
        );
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/student-placements/export-template', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Template exported successfully');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const loadingToast = toast.loading('Importing students...');

        try {
            const response = await api.post('/student-placements/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.dismiss(loadingToast);
            const { summary } = response.data;
            toast.success(
                `Import completed: ${summary.inserted} inserted, ${summary.updated} updated`,
                { duration: 5000 }
            );
            fetchStudents();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Import failed');
        }
        // Reset file input
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
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-5">
                    <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                        <User className="w-8 h-8 mr-3 text-primary-500" />
                        Student Details</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage student placement master records</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-xl transition-colors font-semibold text-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete {selectedIds.length}
                        </button>
                    )}
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4 text-primary-500" />
                            Template
                        </button>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".csv" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImport}
                            />
                            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                                <Upload className="w-4 h-4 text-primary-500" />
                                Import
                            </button>
                        </div>
                    <button
                        onClick={() => {
                            setFormData({});
                            setIsEditMode(false);
                            setIsModalOpen(true);
                            setActiveTab('basic');
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-600/20 font-semibold text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or reg no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-medium"
                        />
                    </div>
                    <div className="w-full md:w-auto min-w-[240px]">
                        <CampusFilter 
                            selectedCampuses={selectedCampuses} 
                            onChange={setSelectedCampuses} 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="p-4 w-12 text-center">
                                    <button 
                                        onClick={() => {
                                            if (selectedIds.length === students.length) setSelectedIds([]);
                                            else setSelectedIds(students.map(s => s.id));
                                        }}
                                        className="text-primary-600 dark:text-primary-400"
                                    >
                                        {selectedIds.length > 0 && selectedIds.length === students.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('reg_no')}>
                                    <div className="flex items-center">Reg No {renderSortIcon('reg_no')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">Student Name {renderSortIcon('name')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Campus
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('willing')}>
                                    <div className="flex items-center">Willing {renderSortIcon('willing')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('willing_domain')}>
                                    <div className="flex items-center">Willing Domain {renderSortIcon('willing_domain')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('placed')}>
                                    <div className="flex items-center">Placement {renderSortIcon('placed')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('salary')}>
                                    <div className="flex items-center">Salary {renderSortIcon('salary')}</div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => toggleSelect(student.id)}
                                            className={selectedIds.includes(student.id) ? "text-primary-600" : "text-slate-300 dark:text-slate-600"}
                                        >
                                            {selectedIds.includes(student.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{student.reg_no}</span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{student.name}</span>
                                            <span className="text-xs text-slate-500">{student.personal_email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{student.department}</span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                                            student.cambus_details === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                                            student.cambus_details === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                                            'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                        }`}>
                                            {student.cambus_details || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {student.willing === 'Willing' ? (
                                            <span className="px-2.5 py-1 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full uppercase tracking-wider border border-green-200 dark:border-green-800/50">
                                                Willing
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full uppercase tracking-wider border border-red-200 dark:border-red-800/50">
                                                Not Willing
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{student.willing_domain}</span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {student.placed === 'Yes' ? (
                                            <span className="px-2.5 py-1 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full uppercase tracking-wider border border-green-200 dark:border-green-800/50">
                                                Placed
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                                Unplaced
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {student.salary ? `₹${student.salary} LPA` : '-'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    setFormData(student);
                                                    setIsEditMode(true);
                                                    setIsModalOpen(true);
                                                    setActiveTab('basic');
                                                }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(student.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && !loading && (
                        <div className="p-20 flex flex-col items-center justify-center text-slate-500">
                            <Filter className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium opacity-50">No students found matching your criteria</p>
                        </div>
                    )}
                </div>
                
                <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={(p) => setPage(p)} 
                />
            </div>

            {/* Modal Area */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEditMode ? 'Edit Student Details' : 'Add New Student'}</h2>
                                <p className="text-sm text-slate-500">Fill in all fields across tabs to complete registration</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="px-6 pt-4 flex gap-1 bg-slate-50/50 dark:bg-slate-800/50 shrink-0 overflow-x-auto scrollbar-hide">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                                        activeTab === tab.id 
                                        ? 'border-primary-600 text-primary-600' 
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form id="student-form" onSubmit={handleSubmit} className="space-y-8">
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {renderInput('Registration Number', 'reg_no')}
                                        {renderInput('Full Name', 'name')}
                                        {renderInput('Campus Selection', 'cambus_details', 'text', ['NEC', 'NCT'])}
                                        {renderInput('Willingness', 'willing', 'text', ['willing', 'Not Willing'])}
                                        {renderInput('Willing Domain', 'willing_domain')}
                                        {renderInput('Eligibility', 'eligibility', 'text', ['Yes', 'No'])}
                                        <div className="col-span-full py-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-6">Placement Status</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {renderInput('Company Name', 'company_name')}
                                                {renderInput('Salary Range', 'salary_range')}
                                                {renderInput('Annual Salary (LPA)', 'salary', 'number')}
                                                {renderInput('Placed Status', 'placed', 'text', ['Yes', 'No'])}
                                                {renderInput('Placed Domain', 'domain')}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'academic' && (
                                    <div className="space-y-10">
                                        <section>
                                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-6">Secondary (10th) Education</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {renderInput('Percentage', 'tenth_percentage', 'number')}
                                                {renderInput('Passing Year', 'tenth_year', 'number')}
                                                {renderInput('Board', 'tenth_board')}
                                                {renderInput('School Name', 'tenth_school_name')}
                                                {renderInput('School District', 'tenth_school_district')}
                                            </div>
                                        </section>

                                        <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-6">Higher Secondary (12th) Education</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {renderInput('Percentage', 'twelfth_percentage', 'number')}
                                                {renderInput('Cutoff Mark', 'twelfth_cutoff', 'number')}
                                                {renderInput('Passing Year', 'twelfth_year', 'number')}
                                                {renderInput('Board', 'twelfth_board')}
                                                {renderInput('School Name', 'twelfth_school_name')}
                                                {renderInput('School District', 'twelfth_school_district')}
                                            </div>
                                        </section>

                                        <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-6">Diploma / Graduation Core</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {renderInput('UG/PG CGPA', 'ug_pg_cgpa', 'number')}
                                                {renderInput('Diploma Percentage', 'diploma_percentage', 'number')}
                                                {renderInput('Diploma Branch', 'diploma_branch')}
                                                {renderInput('Current Arrears', 'current_arrears', 'number')}
                                                {renderInput('History of Arrears', 'history_of_arrears', 'number')}
                                                {renderInput('Study Gap Years', 'study_gap_years', 'number')}
                                            </div>
                                        </section>
                                    </div>
                                )}

                                {activeTab === 'personal' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {renderInput('Date of Birth', 'dob', 'date')}
                                        {renderInput('Gender', 'gender', 'text', ['Male', 'Female', 'Other'])}
                                        {renderInput('Student Mobile', 'student_mobile')}
                                        {renderInput('Alt Mobile', 'student_mobile_alt')}
                                        {renderInput('WhatsApp No', 'whatsapp_number')}
                                        {renderInput('Personal Email', 'personal_email', 'email')}
                                        {renderInput('College Email', 'college_email', 'email')}
                                        {renderInput('Father\'s Mobile', 'father_mobile')}
                                        {renderInput('Mother\'s Mobile', 'mother_mobile')}
                                        {renderInput('Aadhaar Number', 'aadhaar_number')}
                                        {renderInput('PAN Number', 'pan_number')}
                                        {renderInput('Laptop Available', 'laptop_available', 'text', ['Yes', 'No'])}
                                        <div className="col-span-full">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Permanent Address</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address || ''}
                                                    onChange={handleInputChange}
                                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none min-h-[100px]"
                                                    placeholder="Enter full address..."
                                                />
                                            </div>
                                        </div>
                                        {renderInput('Pincode', 'pincode')}
                                        {renderInput('Hometown District', 'hometown_district')}
                                    </div>
                                )}

                                {activeTab === 'skills' && (
                                    <div className="space-y-10">
                                        <section>
                                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-6">Professional Skills</h3>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Programming Languages</label>
                                                    <textarea
                                                        name="programming_languages"
                                                        value={formData.programming_languages || ''}
                                                        onChange={handleInputChange}
                                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                                        placeholder="C++, Java, Python, etc."
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Technical Skills</label>
                                                    <textarea
                                                        name="technical_skills"
                                                        value={formData.technical_skills || ''}
                                                        onChange={handleInputChange}
                                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                                        placeholder="Web Dev, Cloud, Data Science, etc."
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Certifications</label>
                                                    <textarea
                                                        name="certification_courses"
                                                        value={formData.certification_courses || ''}
                                                        onChange={handleInputChange}
                                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                                        placeholder="Google Cloud, AWS, Cisco, etc."
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-6">Specializations (MCA/UG)</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {renderInput('UG Degree', 'if_mca_ug_degree')}
                                                {renderInput('UG Stream', 'if_mca_ug_stream')}
                                                {renderInput('UG Percentage', 'if_mca_ug_percentage', 'number')}
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex gap-2">
                                {tabs.map((tab, index) => (
                                    <div 
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'w-6 bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="student-form"
                                    type="submit"
                                    className="px-8 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-600/25 font-bold text-sm"
                                >
                                    {isEditMode ? 'Save Changes' : 'Create Student'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal and Toast sections updated ... */}
        </div>
    );
};

export default StudentDetails;
