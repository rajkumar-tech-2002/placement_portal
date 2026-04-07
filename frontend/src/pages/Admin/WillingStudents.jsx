import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft, Search, GraduationCap, Download, Users, MapPin, Briefcase } from 'lucide-react';
import * as driveService from '../../services/driveWillingness.service';
import * as companyService from '../../services/company.service';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormatter';

const WillingStudents = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWillingData = async () => {
            try {
                setLoading(true);
                const [willingUsers, companyInfo] = await Promise.all([
                    driveService.getWillingStudents(id),
                    companyService.getCompanyById(id)
                ]);
                setStudents(willingUsers);
                setCompany(companyInfo);
            } catch (error) {
                toast.error('Failed to fetch willing students');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchWillingData();
    }, [id]);

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_reg_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        if (students.length === 0) return;
        
        const headers = ['Reg No', 'Name', 'Department', 'Campus', 'Email', 'Mobile', 'CGPA'];
        const csvRows = students.map(s => [
            s.student_reg_no,
            s.name,
            s.department,
            s.cambus_details,
            s.personal_email,
            s.student_mobile,
            s.ug_pg_cgpa
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${company?.name || 'Drive'}_Willing_Students.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 text-slate-600 dark:text-slate-400"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Building2 className="w-6 h-6 text-primary-500" />
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {company?.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                                <Users className="w-4 h-4 text-emerald-500" />
                                {students.length} Willing Candidates Identified
                            </p>
                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                Drive Date: {formatDate(company?.drive_date)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search data..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold text-sm shadow-lg shadow-primary-600/20 active:scale-95 shrink-0"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Students Grid/Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest pl-12">Student Info</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Department</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Campus</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest pr-12">CGPA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.student_reg_no} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6 pl-12">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600 font-bold text-sm">
                                                    {student.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{student.student_reg_no}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {student.department}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                                                {student.cambus_details}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-0.5">
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{student.personal_email}</div>
                                                <div className="text-[10px] font-bold text-slate-400">{student.student_mobile}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right pr-12">
                                            <span className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                                                {student.ug_pg_cgpa}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                            <Users className="w-12 h-12" />
                                            <p className="font-black uppercase tracking-[0.2em] text-xs underline decoration-primary-500 decoration-2 underline-offset-8">No willing students found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WillingStudents;
