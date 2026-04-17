import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { X, Search, Building, User, IndianRupee, Target, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import * as placementService from '../../services/placement.service';
import * as companyService from '../../services/company.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PlacementModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
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
        salaryRange: '', // New field for display
        domain: '',
        placed: 'Yes',
        placement_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            fetchCompanies();
        }
    }, [isOpen]);

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

            // Scoping for Coordinators
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
            if (searchTerm) searchStudents(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.reg_no || !formData.company_name) {
            toast.error('Please select both a student and a company');
            return;
        }

        setLoading(true);
        try {
            await placementService.savePlacementDetail(formData);
            toast.success('Placement record saved successfully');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                reg_no: '',
                student_name: '',
                company_name: '',
                salary: '',
                domain: '',
                placed: 'Yes',
                placement_date: new Date().toISOString().split('T')[0]
            });
            setSearchTerm('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Record Placement</h2>
                            <p className="text-sm text-slate-500 font-medium">Add manual placement record for a student</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <form id="placement-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Student Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter Reg No or Name..."
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none font-semibold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchingStudents && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />}
                            </div>
                            
                            {students.length > 0 && searchTerm.length >= 2 && (
                                <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                                    {students.map(s => (
                                        <button
                                            key={s.reg_no}
                                            type="button"
                                            className={`w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group ${formData.reg_no === s.reg_no ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                                            onClick={() => {
                                                setFormData({ 
                                                    ...formData, 
                                                    reg_no: s.reg_no, 
                                                    student_name: s.name,
                                                    domain: s.willing_domain || formData.domain
                                                });
                                                setStudents([]);
                                                setSearchTerm(s.reg_no);
                                            }}
                                        >
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.reg_no}</div>
                                            </div>
                                            {formData.reg_no === s.reg_no && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                <div className="relative">
                                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none font-semibold appearance-none"
                                        value={formData.company_name}
                                        onChange={(e) => {
                                            const selectedCompany = companies.find(c => c.name === e.target.value);
                                            setFormData({ 
                                                ...formData, 
                                                company_name: e.target.value,
                                                salaryRange: selectedCompany?.salary_lpa || 'Not Available',
                                                salary: '' // Clear actual salary on company change
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
                                </div>
                            </div>

                            {/* Company Salary Range (Read-only) */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company Salary Range (LPA)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="Auto-filled"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 cursor-not-allowed font-semibold"
                                        value={formData.salaryRange}
                                    />
                                </div>
                            </div>

                            {/* Actual Placed Salary (Editable) */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Actual Placed Salary (LPA)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter actual salary"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-semibold"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Domain Input (Read-only) */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Interested Domain</label>
                                <div className="relative">
                                    <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="Auto-filled"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 cursor-not-allowed font-semibold"
                                        value={formData.domain}
                                    />
                                </div>
                            </div>

                            {/* Date Input */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Placement Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none font-semibold appearance-none"
                                        value={formData.placement_date}
                                        onChange={(e) => setFormData({ ...formData, placement_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.company_name === 'Other' && (
                            <div className="space-y-3 animate-in slide-in-from-top-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Other Company Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter company name"
                                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none font-semibold"
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                />
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        className="px-8 py-3.5 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="placement-form"
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-600/30 font-bold text-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Placement
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PlacementModal;
