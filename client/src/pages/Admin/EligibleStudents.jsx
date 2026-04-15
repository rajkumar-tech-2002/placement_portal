import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as companyService from '../../services/company.service';
import { 
    Users, 
    ChevronLeft, 
    Search, 
    Building2, 
    Trophy, 
    GraduationCap, 
    History, 
    AlertCircle,
    UserCircle2,
    Calendar,
    IndianRupee,
    FileText,
    ArrowUpDown,
    Printer,
    Download,
    Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import CampusFilter from '../../components/common/CampusFilter';

const EligibleStudents = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [company, setCompany] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [selectedCampuses, setSelectedCampuses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await companyService.getEligibleStudents(id);
                setStudents(data.students);
                setCompany(data.company);
            } catch (err) {
                toast.error('Failed to fetch eligible students');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.reg_no.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCampus = selectedCampuses.length === 0 || 
                            selectedCampuses.includes(s.cambus_details);
        
        return matchesSearch && matchesCampus;
    }).sort((a, b) => {
        const valA = a[sortBy] || '';
        const valB = b[sortBy] || '';
        return sortOrder === 'ASC' 
            ? String(valA).localeCompare(String(valB)) 
            : String(valB).localeCompare(String(valA));
    });

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(column);
            setSortOrder('ASC');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="w-16 h-16 text-slate-300" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Company Not Found</h2>
                <button 
                    onClick={() => navigate('/admin/companies')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-xl"
                >
                    Back to Companies
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/admin/companies')}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 text-slate-600 dark:text-slate-400"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Building2 className="w-6 h-6 text-primary-500" />
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {company.name}
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                             Eligible Students List &bull; {students.length} students found
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-sm shadow-sm active:scale-95">
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-100 transition-all font-bold text-sm active:scale-95">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats & Filters Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Eligibility Criteria</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.2 bg-emerald-500/10 rounded-lg"><Percent className="w-4 h-4 text-emerald-600" /></div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min 10th</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{company.min_10th_percent || '0'}%</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.2 bg-blue-500/10 rounded-lg"><Percent className="w-4 h-4 text-blue-600" /></div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min 12th</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{company.min_12th_percent || '0'}%</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.2 bg-amber-500/10 rounded-lg"><GraduationCap className="w-4 h-4 text-amber-600" /></div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min UG CGPA</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{company.min_ug_cgpa || '0'}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.2 bg-red-500/10 rounded-lg"><History className="w-4 h-4 text-red-600" /></div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Max Arrears</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{company.max_current_arrears || '0'}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.2 bg-purple-500/10 rounded-lg"><UserCircle2 className="w-4 h-4 text-purple-600" /></div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gender</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{company.gender_preference || 'All'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-primary-600/20">
                        <Users className="w-10 h-10 mb-4 opacity-80" />
                        <h4 className="text-lg font-bold mb-1">Total Eligible</h4>
                        <div className="text-4xl font-black mb-4">{students.length}</div>
                        <p className="text-primary-100 text-xs leading-relaxed opacity-80">
                            These students match all the professional and academic criteria defined for {company.name}.
                        </p>
                    </div>
                </div>

                {/* Table Card */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden flex flex-col">
                        {/* Table Controls */}
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                <div className="w-full md:w-auto min-w-[300px]">
                                    <CampusFilter 
                                        selectedCampuses={selectedCampuses} 
                                        onChange={setSelectedCampuses} 
                                    />
                                </div>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search students..." 
                                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 text-sm transition-all shadow-inner outline-none font-bold"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {company.min_10th_percent && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                            <Percent className="w-3.5 h-3.5 text-primary-500" />
                                            10th: {company.min_10th_percent}%
                                        </div>
                                    )}
                                    {company.min_12th_percent && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                            <Percent className="w-3.5 h-3.5 text-primary-500" />
                                            12th: {company.min_12th_percent}%
                                        </div>
                                    )}
                                    {company.min_ug_cgpa && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                            <GraduationCap className="w-3.5 h-3.5 text-primary-500" />
                                            CGPA: {company.min_ug_cgpa}
                                        </div>
                                    )}
                                    {(company.max_current_arrears === 0 || company.max_current_arrears === '0') ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            No Backlogs
                                        </div>
                                    ) : company.max_current_arrears && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full text-[10px] font-bold text-amber-600 uppercase tracking-wider border border-amber-100 dark:border-amber-800/50">
                                            <History className="w-3.5 h-3.5" />
                                            Max {company.max_current_arrears} Backlogs
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700/50">
                                    Viewing {filteredStudents.length} of {students.length}
                                </div>
                            </div>
                        </div>

                        {/* Custom Data Table */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('reg_no')}>
                                            <div className="flex items-center gap-2 group-hover:text-primary-600 transition-colors">
                                                Reg No <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-2 group-hover:text-primary-600 transition-colors">
                                                Student Name <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Department
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Campus
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer group text-center" onClick={() => handleSort('ug_pg_cgpa')}>
                                            <div className="flex items-center justify-center gap-2 group-hover:text-primary-600 transition-colors">
                                                CGPA <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">10th / 12th %</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Arrears</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('placed')}>
                                            <div className="flex items-center gap-2 group-hover:text-primary-600 transition-colors">
                                                Status
                                                <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </th>
                                        <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-12">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors">
                                                        {student.reg_no}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 text-xs font-bold ring-4 ring-white dark:ring-slate-900 group-hover:scale-110 transition-all shadow-sm">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{student.name}</div>
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{student.gender}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors">
                                                        {student.department}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                                                        student.cambus_details === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                                                        student.cambus_details === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                                                        'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                        {student.cambus_details || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                                                        {student.ug_pg_cgpa}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">10th: {student.tenth_percentage}%</div>
                                                        <div className="text-[10px] font-semibold text-slate-400">12th: {student.twelfth_percentage}%</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <div className={`text-xs font-bold ${student.current_arrears > 0 ? 'text-red-500' : 'text-slate-500'}`}>Current: {student.current_arrears}</div>
                                                        <div className="text-[10px] font-semibold text-slate-400">History: {student.history_of_arrears}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {student.placed === 'Yes' ? (
                                                        <span className="px-2.5 py-1 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full uppercase tracking-wider border border-green-200 dark:border-green-800/50">
                                                            Already Placed
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800/50">
                                                            Available
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right pr-12">
                                                    <button 
                                                        onClick={() => navigate(`/admin/student-details`)}
                                                        className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                                                        title="View List"
                                                    >
                                                        <UserCircle2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                                                        <Search className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Matching Students</h3>
                                                    <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EligibleStudents;
