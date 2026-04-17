import React, { useState, useEffect } from 'react';
import * as companyService from '../services/company.service';
import {
    Briefcase,
    Plus,
    Globe,
    Info,
    Building2,
    CheckCircle2,
    Calendar,
    Tag,
    Award,
    MapPin,
    PlusCircle,
    IndianRupee,
    Edit2,
    Trash2,
    X,
    ExternalLink,
    Search,
    ChevronRight,
    Users,
    Percent,
    History,
    AlertCircle,
    UserCircle2,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import DataTable from '../components/common/DataTable';
import InputLabel from '../components/common/InputLabel';
import SectionTitle from '../components/common/SectionTitle';
import ModalTitle from '../components/common/ModalTitle';

const ManageCompanies = () => {
    const navigate = useNavigate();
    // Main State
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [eligibleCounts, setEligibleCounts] = useState({});
    const [noBacklogs, setNoBacklogs] = useState(false);
    
    // Pagination & Table state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('drive_date');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        website: '',
        description: '',
        drive_date: '',
        category: '',
        on_off_campus: 'On Campus',
        cambus_venue: '',
        salary_lpa: '',
        min_10th_percent: '',
        min_12th_percent: '',
        min_ug_cgpa: '',
        max_history_arrears: '',
        max_current_arrears: '',
        gender_preference: 'All',
        campus: 'Both'
    });

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await companyService.getAllCompanies({
                page,
                limit,
                search: debouncedSearch,
                sortBy,
                sortOrder
            });
            setCompanies(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
            fetchEligibleCounts();
        } catch (err) {
            toast.error('Failed to fetch companies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEligibleCounts = async () => {
        try {
            const counts = await companyService.getEligibleCounts();
            setEligibleCounts(counts);
        } catch (err) {
            console.error('Failed to fetch eligible counts', err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => { fetchCompanies(); }, [page, limit, debouncedSearch, sortBy, sortOrder]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await companyService.updateCompany(formData.id, formData);
                toast.success('Company updated successfully!');
            } else {
                await companyService.createCompany(formData);
                toast.success('Company added successfully!');
            }
            setIsModalOpen(false);
            resetForm();
            fetchCompanies();
        } catch (err) {
            toast.error(isEditMode ? 'Failed to update company' : 'Failed to add company');
        }
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-bold text-slate-900">Are you sure you want to delete this company?</p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await companyService.deleteCompany(id);
                                toast.success('Company deleted');
                                fetchCompanies();
                            } catch (error) {
                                toast.error('Delete failed');
                            }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-right' });
    };

    const resetForm = () => {
        setFormData({
            id: null,
            name: '',
            website: '',
            description: '',
            drive_date: '',
            category: '',
            on_off_campus: 'On Campus',
            cambus_venue: '',
            salary_lpa: '',
            min_10th_percent: '',
            min_12th_percent: '',
            min_ug_cgpa: '',
            max_history_arrears: '',
            max_current_arrears: '',
            gender_preference: 'All',
            campus: 'Both'
        });
        setIsEditMode(false);
    };

    const openEditModal = (company) => {
        // Format date for input type="date"
        let driveDate = '';
        if (company.drive_date) {
            const d = new Date(company.drive_date);
            driveDate = d.toISOString().split('T')[0];
        }

        setFormData({
            id: company.id,
            name: company.name || '',
            website: company.website || '',
            description: company.description || '',
            drive_date: driveDate,
            category: company.category || '',
            on_off_campus: company.on_off_campus || 'On Campus',
            cambus_venue: company.cambus_venue || '',
            salary_lpa: company.salary_lpa || '',
            min_10th_percent: company.min_10th_percent || '',
            min_12th_percent: company.min_12th_percent || '',
            min_ug_cgpa: company.min_ug_cgpa || '',
            max_history_arrears: company.max_history_arrears || '',
            max_current_arrears: company.max_current_arrears || '',
            gender_preference: company.gender_preference || 'All',
            campus: company.campus || 'Both'
        });
        setNoBacklogs(company.max_current_arrears === 0);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const renderInput = (label, name, type = 'text', options = null, required = false) => (
        <div className="flex flex-col gap-2 w-full">
            <InputLabel text={label} required={required} />
            {options ? (
                <select
                    name={name}
                    value={formData[name]}
                    onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold"
                    required={required}
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    required={required}
                />
            )}
        </div>
    );

    const columns = [
        { 
            header: 'COMPANY', 
            key: 'name', 
            sortable: true,
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-primary-500/10 transition-colors">
                        <Building2 className="w-5 h-5 text-slate-400 group-hover:text-primary-600" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{val}</span>
                            {row.website && (
                                <a href={row.website} target="_blank" rel="noreferrer" className="text-primary-500 hover:scale-110 transition-transform">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                        {row.on_off_campus === 'Off Campus' && row.cambus_venue && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <MapPin className="w-3 h-3" />
                                {row.cambus_venue}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        { 
            header: 'CATEGORY', 
            key: 'category', 
            sortable: true,
            render: (val) => val && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 rounded-full dark:bg-blue-900/20 dark:border-blue-800/50">
                    {val}
                </span>
            )
        },
        { 
            header: 'DRIVE DATE', 
            key: 'drive_date', 
            sortable: true,
            render: (val) => (
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(val)}
                </div>
            )
        },
        { 
            header: 'SALARY', 
            key: 'salary_lpa', 
            sortable: true,
            render: (val) => (
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                    <IndianRupee className="w-4 h-4" />
                    {val ? `${val}` : 'Competitive'}
                </div>
            )
        },
        { 
            header: 'TYPE', 
            key: 'on_off_campus', 
            sortable: true,
            render: (val) => (
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${val === 'On Campus'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50'
                    }`}>
                    {val}
                </span>
            )
        },
        { 
            header: 'CAMPUS', 
            key: 'campus',
            render: (val) => (
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${val === 'NEC'
                        ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50' :
                        val === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50' :
                        'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/50'
                    }`}>
                    {val || 'Both'}
                </span>
            )
        },
        { 
            header: 'ELIGIBLE', 
            key: 'id',
            className: 'text-center',
            render: (val) => (
                <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[10px] font-bold text-primary-600 border-2 border-white dark:border-slate-900 shadow-sm">
                        {eligibleCounts[val] || 0}
                    </div>
                </div>
            )
        },
        { 
            header: 'ACTIONS', 
            key: 'actions', 
            className: 'text-right pr-6',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => navigate(`/admin/companies/${row.id}/eligible-students`)}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        title="View Eligible Students"
                    >
                        <Users className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => openEditModal(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Company"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Company"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <ModalTitle 
                    icon={Building2} 
                    title="Manage Companies" 
                    description="Configure recruitment partners and company profiles" 
                />
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 active:scale-95 font-bold"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Company
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={companies}
                loading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
                limit={limit}
                pagination={{
                    page,
                    totalPages,
                    totalItems: total,
                    onPageChange: setPage
                }}
            />

            {/* Modal Area (Popup Modal design from StudentDetails) */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <ModalTitle 
                                icon={Building2} 
                                title={isEditMode ? 'Edit Company Profile' : 'Add New Company'} 
                                description="Professional profile for recruitment partners" 
                            />
                            <button onClick={() => setIsModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <form id="company-form" onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {renderInput('Company Name', 'name', 'text', null, true)}
                                    {renderInput('Website URL', 'website', 'url', null, true)}
                                    {renderInput('Drive Date', 'drive_date', 'date')}
                                    {renderInput('Salary (LPA)', 'salary_lpa', 'text', null, true)}
                                    {renderInput('Category', 'category', 'text', ['Product Based', 'Service Based', 'Startup', 'MNC', 'Other'], true)}
                                    {renderInput('Institution Campus', 'campus', 'text', ['Both', 'NEC', 'NCT'], true)}
                                    {renderInput('Placement Type', 'on_off_campus', 'text', ['On Campus', 'Off Campus'], true)}

                                    
                                    {formData.on_off_campus === 'Off Campus' && (
                                        <div className="col-span-full">
                                            {renderInput('Campus/Drive Venue', 'cambus_venue', 'text')}
                                        </div>
                                    )}

                                    <div className="col-span-full flex flex-col gap-1.5">
                                        <InputLabel text="Company Description" />
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none min-h-[120px] text-sm"
                                            placeholder="About the company, recruitment process, etc."
                                        />
                                    </div>

                                    {/* Eligibility Values Section */}
                                    <div className="col-span-full mt-6">
                                        <SectionTitle 
                                            icon={Info} 
                                            title="Eligibility Criteria" 
                                            subtitle="Configure student filtering rules" 
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {renderInput('Min 10th %', 'min_10th_percent', 'number', null, true)}
                                            {renderInput('Min 12th %', 'min_12th_percent', 'number', null, true)}
                                            {renderInput('Min UG CGPA', 'min_ug_cgpa', 'number', null, true)}
                                            {renderInput('Max History Arrears', 'max_history_arrears', 'number', null, true)}
                                            <div className="flex flex-col gap-2">
                                                <InputLabel icon={AlertCircle} text="No Active Backlogs" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newVal = !noBacklogs;
                                                        setNoBacklogs(newVal);
                                                        setFormData({ ...formData, max_current_arrears: newVal ? 0 : '' });
                                                    }}
                                                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold text-sm ${
                                                        noBacklogs 
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800' 
                                                        : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {noBacklogs ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                    {noBacklogs ? 'Strictly No Backlogs' : 'Allow Backlogs'}
                                                </button>
                                            </div>
                                            {renderInput('Gender Preference', 'gender_preference', 'select', ['All', 'Male', 'Female'], true)}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                form="company-form"
                                type="submit"
                                className="px-10 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl transition-all shadow-lg shadow-primary-600/30 font-bold text-sm active:scale-95"
                            >
                                {isEditMode ? 'Update Profile' : 'Save Company'}
                            </button>
                        </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageCompanies;
