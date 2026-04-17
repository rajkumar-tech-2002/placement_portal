import React, { useState, useEffect } from 'react';
import { Search, Building, User, IndianRupee, Target, Calendar, CheckCircle2, Loader2, Trophy, ArrowLeft, Plus, Edit2, Trash2, Filter, AlertCircle, X, ArrowUpDown, ChevronUp, ChevronDown, CheckSquare, Square, MoreVertical, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as placementService from '../services/placement.service';
import * as companyService from '../services/company.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import InputLabel from '../components/common/InputLabel';
import SectionTitle from '../components/common/SectionTitle';
import ModalTitle from '../components/common/ModalTitle';
import CampusFilter from '../components/common/CampusFilter';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

const PlacementRecord = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchingStudents, setSearchingStudents] = useState(false);
    const [students, setStudents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        reg_no: '',
        student_name: '',
        company_name: '',
        salary: '',
        salaryRange: '',
        domain: '',
        placed: 'Yes',
        placement_date: new Date().toISOString().split('T')[0]
    });

    // New state for records table
    const [records, setRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [recordSearch, setRecordSearch] = useState('');
    const [selectedCampuses, setSelectedCampuses] = useState([]);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchRecords = async () => {
        try {
            setRecordsLoading(true);
            const data = await placementService.getAllPlacementDetails({
                page,
                limit,
                search: recordSearch,
                campus: selectedCampuses,
                sortBy,
                sortOrder
            });
            setRecords(data.data || []);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch records', error);
            toast.error('Failed to fetch placement records');
        } finally {
            setRecordsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchRecords();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [page, limit, recordSearch, selectedCampuses, sortBy, sortOrder]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(column);
            setSortOrder('ASC');
        }
        setPage(1);
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />;
        return sortOrder === 'ASC' ? <ChevronUp className="w-3.5 h-3.5 text-primary-500" /> : <ChevronDown className="w-3.5 h-3.5 text-primary-500" />;
    };

    const fetchCompanies = async () => {
        try {
            const data = await companyService.getAllCompanies({ limit: 100 });
            setCompanies(data.companies || data.data || []);
        } catch (error) {
            console.error('Failed to fetch companies', error);
        }
    };

    const searchStudents = async (query) => {
        if (!query || query.length < 2) return;
        setSearchingStudents(true);
        try {
            const params = {
                search: query,
                willing: 'Willing'
            };

            if (user?.role === 'COORDINATOR') {
                params.campus = user.cambus_details || user.campus;
                params.department = user.department;
            }

            const response = await placementService.getAllStudentsForSelection(params);
            setStudents(response.data || []);
        } catch (error) {
            console.error('Failed to search students', error);
        } finally {
            setSearchingStudents(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm && !isEditMode) searchStudents(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.reg_no || !formData.company_name) {
            toast.error('Please select both a student and a company');
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await placementService.updatePlacementDetail(formData.id, formData);
                toast.success('Placement record updated successfully');
            } else {
                await placementService.savePlacementDetail(formData);
                toast.success('Placement record saved successfully');
            }
            
            setIsModalOpen(false);
            fetchRecords();
            
            // Reset form
            setFormData({
                reg_no: '',
                student_name: '',
                company_name: '',
                salary: '',
                salaryRange: '',
                domain: '',
                placed: 'Yes',
                placement_date: new Date().toISOString().split('T')[0]
            });
            setSearchTerm('');
            setStudents([]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    // Table Column Definitions
    const columns = [
        { 
            header: 'REG NO', 
            key: 'reg_no', 
            sortable: true,
            className: 'text-sm font-black text-slate-900 dark:text-white'
        },
        { 
            header: 'NAME', 
            key: 'student_name', 
            sortable: true,
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {val}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        {row.department} • {row.campus}
                    </span>
                </div>
            )
        },
        { 
            header: 'COMPANY', 
            key: 'company_name', 
            sortable: true,
            render: (val, row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {val}
                    </div>
                    <div className="text-[9px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.1em] bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded-md w-fit">
                        {row.domain || 'General'}
                    </div>
                </div>
            )
        },
        { 
            header: 'PACKAGE (LPA)', 
            key: 'salary', 
            sortable: true,
            className: 'text-center',
            render: (val) => (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50">
                    <IndianRupee className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {parseFloat(val).toFixed(2)} <span className="text-[9px] opacity-70 ml-0.5">LPA</span>
                    </span>
                </div>
            )
        },
        { 
            header: 'DATE', 
            key: 'placement_date', 
            sortable: true,
            className: 'text-center',
            render: (val) => (
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            )
        },
        { 
            header: 'Actions', 
            key: 'actions',
            className: 'text-right pr-6',
            render: (_, row) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button 
                        onClick={() => handleEditRecord(row)}
                        className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all active:scale-90"
                        title="Edit Record"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDeleteRecord(row.id)}
                        className="p-2.5 bg-red-50/50 dark:bg-red-950/20 text-red-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all active:scale-90"
                        title="Delete Record"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const handleEditRecord = (record) => {
        setFormData({
            id: record.id,
            reg_no: record.reg_no,
            student_name: record.student_name,
            company_name: record.company_name,
            salary: record.salary,
            salaryRange: record.salary_range,
            domain: record.domain,
            placed: record.placed,
            placement_date: new Date(record.placement_date).toISOString().split('T')[0]
        });
        setSearchTerm(record.reg_no);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDeleteRecord = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        
        try {
            await placementService.deletePlacementDetail(id);
            toast.success('Record deleted successfully');
            fetchRecords();
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <ModalTitle 
                    icon={Trophy} 
                    title="Placement Entry" 
                    description="Record and manage student placement success" 
                />
                <button
                    onClick={() => {
                        setIsEditMode(false);
                        setFormData({
                            reg_no: '',
                            student_name: '',
                            company_name: '',
                            salary: '',
                            salaryRange: '',
                            domain: '',
                            placed: 'Yes',
                            placement_date: new Date().toISOString().split('T')[0]
                        });
                        setSearchTerm('');
                        setIsModalOpen(true);
                    }}
                    className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-500/25 font-black text-sm uppercase tracking-widest active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    Add Record
                </button>
            </div>

            {/* Table Area */}
            <DataTable 
                columns={columns}
                data={records}
                loading={recordsLoading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onLimitChange={(lvl) => {
                    setLimit(lvl);
                    setPage(1);
                }}
                limit={limit}
                selectedIds={selectedIds}
                onSelect={(id) => {
                    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                }}
                onSelectAll={() => {
                    if (selectedIds.length === records.length) setSelectedIds([]);
                    else setSelectedIds(records.map(r => r.id));
                }}
                filters={
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by student or company..."
                                value={recordSearch}
                                onChange={(e) => {
                                    setRecordSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-11 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm"
                            />
                        </div>
                        <div className="w-full md:w-56">
                            <CampusFilter 
                                selectedCampuses={selectedCampuses} 
                                onChange={(val) => {
                                    setSelectedCampuses(val);
                                    setPage(1);
                                }} 
                            />
                        </div>
                    </div>
                }
                pagination={{
                    page,
                    totalPages,
                    totalItems: total,
                    onPageChange: (newPage) => {
                        setPage(newPage);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                    }
                }}
            />

            {/* Entry/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
                    {/* Modal Header */}
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center shrink-0">
                        <ModalTitle 
                            icon={isEditMode ? Edit2 : Plus} 
                            title={isEditMode ? "Edit Placement Record" : "Add New Placement Record"} 
                            description={isEditMode ? "Update the selected placement success details" : "Record a student's placement success info"} 
                        />
                        <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Student Selection */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <InputLabel text="Student Selection" required />
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search by Reg No or Name..."
                                                disabled={isEditMode}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm disabled:opacity-50"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                required
                                            />
                                            {searchingStudents && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />}
                                        </div>

                                        {!isEditMode && students.length > 0 && searchTerm.length >= 2 && (
                                            <div className="absolute z-50 mt-2 w-[calc(100%-40px)] md:w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-primary-500/10 max-h-64 overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-2 duration-300">
                                                {students.map(s => (
                                                    <button
                                                        key={s.reg_no}
                                                        type="button"
                                                        className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 last:border-0 dark:border-slate-800 focus:outline-none"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                reg_no: s.reg_no,
                                                                student_name: s.name,
                                                                domain: s.willing_domain || formData.domain
                                                            });
                                                            setStudents([]);
                                                            setSearchTerm(`${s.reg_no} - ${s.name}`);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500">
                                                                {s.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-900 dark:text-white text-sm">{s.name}</div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.reg_no} • {s.department}</div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <InputLabel text="Target Company" required />
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold appearance-none cursor-pointer text-sm"
                                                value={formData.company_name}
                                                onChange={(e) => {
                                                    const selectedCompany = companies.find(c => c.name === e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        company_name: e.target.value,
                                                        salaryRange: selectedCompany?.salary_lpa || 'Not Available',
                                                        salary: ''
                                                    });
                                                }}
                                                required
                                            >
                                                <option value="">Select Company</option>
                                                {companies.map(c => (
                                                    <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <Filter className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <InputLabel text="Company Salary Range (LPA)" />
                                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 font-bold text-sm">
                                            <IndianRupee className="w-4 h-4" />
                                            {formData.salaryRange || 'Select a company'}
                                        </div>
                                    </div>
                                </div>

                                {/* Placement Stats */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <InputLabel text="Actual Placed Salary (LPA)" required />
                                        <div className="relative group">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Enter final offered salary"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm"
                                                value={formData.salary}
                                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <InputLabel text="Interested Domain" />
                                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 font-bold text-sm">
                                            <Target className="w-4 h-4" />
                                            {formData.domain || 'Student Willing Domain'}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <InputLabel text="Placement Date" required />
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="date"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm cursor-pointer"
                                                value={formData.placement_date}
                                                onChange={(e) => setFormData({ ...formData, placement_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {formData.company_name === 'Other' && (
                                        <div className="space-y-3 animate-in slide-in-from-top-2">
                                            <InputLabel text="Other Company Name" required />
                                            <input
                                                type="text"
                                                placeholder="Enter company name"
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-sm"
                                                value={formData.company_name === 'Other' ? '' : formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-10 flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all uppercase tracking-[0.2em]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.reg_no || !formData.company_name}
                                    className="px-10 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 font-black text-sm uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-3"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    {isEditMode ? 'Update Record' : 'Record Success'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PlacementRecord;
