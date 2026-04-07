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
    UserCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';

const ManageCompanies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [eligibleCounts, setEligibleCounts] = useState({});
    const [noBacklogs, setNoBacklogs] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        website: '',
        description: '',
        drive_date: '',
        category: '',
        on_off_campus: 'On Campus',
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
            const data = await companyService.getAllCompanies();
            setCompanies(data.companies);
            setFilteredCompanies(data.companies);
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

    useEffect(() => { fetchCompanies(); }, []);

    useEffect(() => {
        const filtered = companies.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCompanies(filtered);
    }, [searchTerm, companies]);

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

    const renderInput = (label, name, type = 'text', options = null) => (
        <div className="flex flex-col gap-2 w-full">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                {label}
            </label>
            {options ? (
                <select
                    name={name}
                    value={formData[name]}
                    onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold"
                    required
                >
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
                    required={name === 'name'}
                />
            )}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-5">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                            <Building2 className="w-8 h-8 mr-3 text-primary-500" />
                            Manage Companies</h1>
                        <p className="text-slate-500 text-sm mt-1">Configure recruitment partners and company profiles</p>
                    </div>
                </div>
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

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 animate-pulse" />
                    ))
                ) : filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                        <div key={company.id} className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-primary-600/10 hover:-translate-y-1 transition-all duration-300">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] group-hover:bg-primary-500/10 transition-colors">
                                    <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-primary-600" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(company)}
                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(company.id)}
                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Company Content */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-1">{company.name}</h3>
                                    {company.website && (
                                        <a href={company.website} target="_blank" rel="noreferrer" className="text-primary-500 hover:scale-110 transition-transform">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${company.campus === 'NEC'
                                            ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50' :
                                            company.campus === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50' :
                                            'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/50'
                                        }`}>
                                        {company.campus || 'Both'}
                                    </span>
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${company.on_off_campus === 'On Campus'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50'
                                        }`}>
                                        {company.on_off_campus}
                                    </span>
                                    {company.category && (
                                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 rounded-full dark:bg-blue-900/20 dark:border-blue-800/50">
                                            {company.category}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="font-medium">Drive Date: <span className="text-slate-900 dark:text-white font-bold ml-1">{formatDate(company.drive_date)}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                                            <IndianRupee className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span className="font-medium">Salary: <span className="text-slate-900 dark:text-white font-bold ml-1">{company.salary_lpa ? `₹${company.salary_lpa} LPA` : 'Competitive'}</span></span>
                                    </div>

                                </div>

                                {company.description && (
                                    <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed line-clamp-3 italic mb-8">
                                        "{company.description}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[10px] font-bold text-primary-600 border-2 border-white dark:border-slate-900">
                                                {eligibleCounts[company.id] || 0}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Eligible Students</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-1 text-[10px] font-bold text-primary-600 uppercase tracking-wider group-hover:gap-2 transition-all">
                                            View Details <ChevronRight className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/companies/${company.id}/eligible-students`)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-[10px] font-bold text-primary-600 uppercase tracking-wider rounded-xl hover:bg-primary-100 transition-all border border-primary-100"
                                        >
                                            <Users className="w-3.5 h-3.5" />
                                            Eligible Students
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                            <Info className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Companies Found</h3>
                        <p className="text-slate-500">Try adjusting your search or add a 10th partner</p>
                    </div>
                )}
            </div>

            {/* Modal Area (Popup Modal design from StudentDetails) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-500/10 rounded-xl">
                                    <Building2 className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{isEditMode ? 'Edit Company Profile' : 'Add New Company'}</h2>
                                    <p className="text-sm text-slate-500">Professional profile for recruitment partners</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <form id="company-form" onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {renderInput('Company Name', 'name')}
                                    {renderInput('Website URL', 'website', 'url')}
                                    {renderInput('Drive Date', 'drive_date', 'date')}
                                    {renderInput('Salary (LPA)', 'salary_lpa', 'text')}
                                    {renderInput('Category', 'category', 'text', ['Product Based', 'Service Based', 'Startup', 'MNC', 'Other'])}
                                    {renderInput('Institution Campus', 'campus', 'text', ['Both', 'NEC', 'NCT'])}
                                    {renderInput('Placement Type', 'on_off_campus', 'text', ['On Campus', 'Off Campus'])}

                                    
                                    <div className="col-span-full flex flex-col gap-1.5">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Company Description</label>
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
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Detailed Eligibility Filters</h3>
                                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {renderInput('Min 10th %', 'min_10th_percent', 'number')}
                                            {renderInput('Min 12th %', 'min_12th_percent', 'number')}
                                            {renderInput('Min UG CGPA', 'min_ug_cgpa', 'number')}
                                            {renderInput('Max History Arrears', 'max_history_arrears', 'number')}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">No Active Backlogs</label>
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
                                            {renderInput('Gender Preference', 'gender_preference', 'select', ['All', 'Male', 'Female'])}
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
                </div>
            )}
        </div>
    );
};

export default ManageCompanies;
