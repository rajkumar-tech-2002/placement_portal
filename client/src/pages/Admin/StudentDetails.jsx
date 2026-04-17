import React, { useState, useEffect } from 'react';
import api from '../../services/api.service';
import toast from 'react-hot-toast';
import { 
    Search, 
    Plus, 
    Edit2, 
    Trash2, 
    User, 
    X, 
    Download, 
    Upload, 
    Building2, 
    AlertCircle, 
    FileText, 
    GraduationCap, 
    Target,
    Filter,
    Trophy
} from 'lucide-react';
import CampusFilter from '../../components/common/CampusFilter';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import InputLabel from '../../components/common/InputLabel';
import SectionTitle from '../../components/common/SectionTitle';
import ModalTitle from '../../components/common/ModalTitle';

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
    const [selectedCampuses, setSelectedCampuses] = useState([]);

    const tabs = [
        { id: 'basic', label: 'Basic & Placement' },
        { id: 'academic', label: 'Academic' },
        { id: 'personal', label: 'Personal' },
        { id: 'skills', label: 'Skills & Others' }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
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

    const columns = [
        { 
            header: 'REG NO', 
            key: 'reg_no', 
            sortable: true,
            className: 'text-sm font-black text-slate-900 dark:text-white'
        },
        { 
            header: 'STUDENT NAME', 
            key: 'name', 
            sortable: true,
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{val}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{row.personal_email}</span>
                </div>
            )
        },
        { 
            header: 'DEPARTMENT', 
            key: 'department',
            className: 'text-sm font-bold text-slate-600 dark:text-slate-400'
        },
        { 
            header: 'CAMPUS', 
            key: 'cambus_details',
            render: (val) => (
                <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${
                    val === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                    val === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                    {val || 'N/A'}
                </span>
            )
        },
        { 
            header: 'WILLING', 
            key: 'willing', 
            sortable: true,
            render: (val) => val?.toLowerCase() === 'willing' ? (
                <span className="px-2.5 py-1 text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/50">WILLING</span>
            ) : (
                <span className="px-2.5 py-1 text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 rounded-lg uppercase tracking-wider border border-rose-200 dark:border-rose-800/50">NOT WILLING</span>
            )
        },
        { 
            header: 'DOMAIN', 
            key: 'willing_domain', 
            sortable: true,
            className: 'text-sm font-bold text-slate-600 dark:text-slate-400 italic'
        },
        { 
            header: 'PLACEMENT STATUS', 
            key: 'placement_status', 
            sortable: true,
            render: (val) => val?.toLowerCase() === 'placed' ? (
                <span className="px-2.5 py-1 text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg uppercase tracking-wider border border-emerald-300 shadow-sm">PLACED</span>
            ) : val?.toLowerCase() === 'unplaced' ? (
                <span className="px-2.5 py-1 text-[9px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-lg uppercase tracking-wider border border-amber-300 shadow-sm">UNPLACED</span>
            ) : (
                <span className="px-2.5 py-1 text-[9px] font-black bg-slate-100 text-slate-500 rounded-lg uppercase tracking-wider border border-slate-200">NA</span>
            )
        },
        { 
            header: 'HIGHEST PKG', 
            key: 'highest_salary', 
            sortable: true,
            render: (val) => val ? (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-primary-600 dark:text-primary-400">₹{val} LPA</span>
                </div>
            ) : '-'
        },
        { 
            header: 'HIGHEST COMPANY', 
            key: 'highest_salary_company',
            render: (val) => val ? (
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]" title={val}>{val}</span>
                </div>
            ) : '-'
        },
        { 
            header: 'ACTIONS', 
            key: 'actions', 
            className: 'text-right pr-6',
            render: (_, row) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => { setFormData(row); setIsEditMode(true); setIsModalOpen(true); setActiveTab('basic'); }} className="p-2.5 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-90" title="Edit Student">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-90" title="Delete Student">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

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
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Delete this record?</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/student-placements/${id}`);
                                toast.success('Record deleted');
                                fetchStudents();
                            } catch (error) {
                                toast.error('Delete failed');
                            }
                        }} className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-lg shadow-red-500/20">Delete</button>
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
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600">Cancel</button>
                    <button onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.post('/student-placements/delete-many', { ids: selectedIds });
                                toast.success('Records deleted');
                                setSelectedIds([]);
                                fetchStudents();
                            } catch (error) {
                                toast.error('Bulk delete failed');
                            }
                        }} className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg">Delete All</button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-right' });
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/student-placements/export-template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Student template exported');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handlePlacementExport = async () => {
        try {
            const response = await api.get('/student-placements/export-placement-template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'placement_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Placement template exported');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handleImport = async (e, type = 'student') => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const loadingToast = toast.loading(`Importing ${type} data...`);
        const endpoint = type === 'student' ? '/student-placements/import' : '/student-placements/import-placements';
        try {
            const response = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.dismiss(loadingToast);
            toast.success(`Import completed: ${response.data.summary.inserted} inserted`, { duration: 5000 });
            fetchStudents();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Import failed');
        }
        e.target.value = null;
    };

    const renderInput = (label, name, type = 'text', options = null, required = false) => (
        <div className="flex flex-col gap-2 w-full">
            <InputLabel text={label} required={required} />
            {options ? (
                <select name={name} value={formData[name] || ''} onChange={handleInputChange} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm font-bold" required={required}>
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input type={type} name={name} value={formData[name] || ''} onChange={handleInputChange} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm font-bold" placeholder={`Enter ${label.toLowerCase()}`} required={required} />
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <ModalTitle icon={User} title="Student Details" description="Manage student placement master records" />
                
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {selectedIds.length > 0 && (
                        <button onClick={handleBulkDelete} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/5 active:scale-95">
                            <Trash2 className="w-4 h-4" />
                            Delete {selectedIds.length}
                        </button>
                    )}

                    {/* Student Master Group */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.25rem] border border-slate-100 dark:border-slate-800">
                        <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 dark:border-slate-700">Student</span>
                        <div className="flex gap-1.5">
                            <button onClick={handleExport} className="p-2 text-slate-600 hover:text-primary-600 hover:bg-white rounded-xl transition-all shadow-sm" title="Template">
                                <Download className="w-4 h-4" />
                            </button>
                            <div className="relative">
                                <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImport(e, 'student')} />
                                <button className="p-2 text-slate-600 hover:text-primary-600 hover:bg-white rounded-xl transition-all shadow-sm">
                                    <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Placement Data Group */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.25rem] border border-slate-100 dark:border-slate-800">
                        <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 dark:border-slate-700">Placements</span>
                        <div className="flex gap-1.5">
                            <button onClick={handlePlacementExport} className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-xl transition-all shadow-sm" title="Template">
                                <Download className="w-4 h-4" />
                            </button>
                            <div className="relative">
                                <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImport(e, 'placement')} />
                                <button className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-xl transition-all shadow-sm">
                                    <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => { setFormData({}); setIsEditMode(false); setIsModalOpen(true); setActiveTab('basic'); }} className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-500/20 font-bold text-sm active:scale-95">
                        <Plus className="w-4 h-4" />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Table Area Section */}
            <DataTable 
                columns={columns}
                data={students}
                loading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                selectedIds={selectedIds}
                onSelect={(id) => {
                    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                }}
                onSelectAll={() => {
                    if (selectedIds.length === students.length && students.length > 0) setSelectedIds([]);
                    else setSelectedIds(students.map(s => s.id));
                }}
                filters={
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-[400px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search by name, registration or email..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="pl-12 pr-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm shadow-sm" 
                            />
                        </div>
                        <div className="w-full md:w-72">
                            <CampusFilter selectedCampuses={selectedCampuses} onChange={setSelectedCampuses} />
                        </div>
                    </div>
                }
                pagination={{
                    page,
                    totalPages,
                    totalItems: total,
                    onPageChange: setPage
                }}
                emptyMessage="No students found matching your search"
            />

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
                    {/* Modal Header */}
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                        <ModalTitle 
                            icon={isEditMode ? Edit2 : Plus} 
                            title={isEditMode ? 'Edit Student Details' : 'Add New Student'} 
                            description="Maintain comprehensive student academic and placement profiles" 
                        />
                        <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Tabs */}
                    <div className="px-8 flex gap-2 bg-slate-50/30 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-8 py-5 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap ${
                                activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
                        <form id="student-form" onSubmit={handleSubmit} className="space-y-12">
                            {activeTab === 'basic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {renderInput('Registration Number', 'reg_no', 'text', null, true)}
                                    {renderInput('Full Name', 'name', 'text', null, true)}
                                    {renderInput('Campus Selection', 'cambus_details', 'text', ['NEC', 'NCT'], true)}
                                    {renderInput('Willingness', 'willing', 'text', ['willing', 'Not Willing'], true)}
                                    {renderInput('Willing Domain', 'willing_domain', 'text', null, true)}
                                    {renderInput('Eligibility Status', 'eligibility', 'text', ['Yes', 'No'], true)}
                                    {renderInput('Placement Status', 'placement_status', 'text', ['Placed', 'Unplaced', 'NA'], true)}
                                    {renderInput('Highest Package (LPA)', 'highest_salary', 'number')}
                                    {renderInput('Highest Package Company', 'highest_salary_company')}
                                </div>
                            )}

                            {activeTab === 'academic' && (
                                <div className="space-y-12">
                                    <section>
                                        <SectionTitle icon={FileText} title="Secondary (10th) Education" subtitle="Enter your secondary school credentials" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                                            {renderInput('Percentage (%)', 'tenth_percentage', 'number', null, true )}
                                            {renderInput('Passing Year', 'tenth_year', 'number')}
                                            {renderInput('Board of Study', 'tenth_board')}
                                            {renderInput('School Name', 'tenth_school_name')}
                                            {renderInput('District', 'tenth_school_district')}
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle icon={GraduationCap} title="Higher Secondary (12th) Education" subtitle="Standard 12th / PUC results" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                                            {renderInput('Percentage (%)', 'twelfth_percentage', 'number', null, true)}
                                            {renderInput('Cutoff Mark', 'twelfth_cutoff', 'number')}
                                            {renderInput('Passing Year', 'twelfth_year', 'number')}
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle icon={Target} title="Collegiate Performance" subtitle="Degree and graduation metrics" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                                            {renderInput('Current CGPA', 'ug_pg_cgpa', 'number', null, true)}
                                            {renderInput('Branch / Department', 'department', 'text', null, true)}
                                            {renderInput('Current Arrears', 'current_arrears', 'number', null, true)}
                                            {renderInput('History of Arrears', 'history_of_arrears', 'number', null, true)}
                                            {renderInput('Study Gap Years', 'study_gap_years', 'number')}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {renderInput('Date of Birth', 'dob', 'date')}
                                    {renderInput('Gender Identity', 'gender', 'text', ['Male', 'Female', 'Other'])}
                                    {renderInput('Mobile Number', 'student_mobile')}
                                    {renderInput('College Email', 'college_email', 'email')}
                                    {renderInput('Personal Email', 'personal_email', 'email', null, true)}
                                    {renderInput('Aadhaar Number', 'aadhaar_number')}
                                    {renderInput('PAN Number', 'pan_number')}
                                    <div className="col-span-full">
                                        <div className="flex flex-col gap-2">
                                            <InputLabel text="Communication Address" />
                                            <textarea name="address" value={formData.address || ''} onChange={handleInputChange} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none min-h-[120px] text-sm font-bold" placeholder="Enter complete residential address..." />
                                        </div>
                                    </div>
                                    {renderInput('Hometown District', 'hometown_district')}
                                    {renderInput('Pincode', 'pincode')}
                                </div>
                            )}

                            {activeTab === 'skills' && (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="flex flex-col gap-3">
                                            <InputLabel text="Programming Languages" />
                                            <textarea name="programming_languages" value={formData.programming_languages || ''} onChange={handleInputChange} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none min-h-[100px] text-sm font-bold" placeholder="e.g., Python, Java, JavaScript, C++" />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <InputLabel text="Technical Core Skills" />
                                            <textarea name="technical_skills" value={formData.technical_skills || ''} onChange={handleInputChange} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none min-h-[100px] text-sm font-bold" placeholder="e.g., React, Node.js, SQL, Machine Learning" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                        <button onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 text-xs font-black text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-[0.2em]">
                            Cancel
                        </button>
                        <button form="student-form" type="submit" className="px-12 py-3.5 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl shadow-xl shadow-primary-500/20 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all">
                            {isEditMode ? 'Update Data' : 'Initialize Profile'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentDetails;
