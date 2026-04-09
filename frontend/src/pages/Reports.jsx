import React, { useState, useEffect } from 'react';
import { 
    getPerformanceReport, 
    getWillingReport, 
    getPlacedReport, 
    getCompanyWiseReport, 
    getPackageDistReport,
    getWillingFilters
} from '../services/report.service';
import { 
    Users, 
    TrendingUp, 
    Briefcase, 
    IndianRupee, 
    Search, 
    Filter, 
    Download, 
    ChevronRight, 
    BarChart3, 
    PieChart as PieIcon,
    FileText,
    CheckCircle2,
    Calendar,
    Mail,
    Phone,
    Trophy,
    Target,
    MapPin,
    GraduationCap,
    Grid,
    Building
} from 'lucide-react';

import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dateFormatter';
import Pagination from '../components/common/Pagination';
import CampusFilter from '../components/common/CampusFilter';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Reports = () => {
    const [activeTab, setActiveTab] = useState('insights');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [willingData, setWillingData] = useState([]);
    const [placedData, setPlacedData] = useState([]);
    const [companyData, setCompanyData] = useState([]);
    const [packageData, setPackageData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Willing Table State
    const [willingPage, setWillingPage] = useState(1);
    const [willingTotalPages, setWillingTotalPages] = useState(0);
    const [willingTotal, setWillingTotal] = useState(0);

    const [selectedCampuses, setSelectedCampuses] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [filterOptions, setFilterOptions] = useState({ departments: [], domains: [], companies: [] });

    // Placements Table State
    const [placedPage, setPlacedPage] = useState(1);
    const [placedTotalPages, setPlacedTotalPages] = useState(0);
    const [placedTotal, setPlacedTotal] = useState(0);
    const [selectedPlacedCampuses, setSelectedPlacedCampuses] = useState([]);
    const [selectedPlacedDept, setSelectedPlacedDept] = useState('');
    const [selectedPlacedCompany, setSelectedPlacedCompany] = useState('');


    const fetchFilters = async () => {
        try {
            const data = await getWillingFilters();
            setFilterOptions(data.filters);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
        }
    };

    const fetchWilling = async () => {
        try {
            const data = await getWillingReport({
                page: willingPage,
                limit: 10,
                search: debouncedSearch,
                campus: selectedCampuses,
                department: selectedDept,
                domain: selectedDomain
            });
            setWillingData(data.report);
            setWillingTotal(data.total);
            setWillingTotalPages(data.totalPages);

        } catch (error) {
            toast.error('Failed to fetch willing students');
        }
    };

    const fetchPlaced = async () => {
        try {
            const data = await getPlacedReport({
                page: placedPage,
                limit: 10,
                search: debouncedSearch,
                campus: selectedPlacedCampuses,
                department: selectedPlacedDept,
                company: selectedPlacedCompany
            });
            setPlacedData(data.report);
            setPlacedTotal(data.total);
            setPlacedTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch placements');
        }
    };


    const fetchData = async () => {
        setLoading(true);
        try {
            const [perf, willing, placed, company, pkg] = await Promise.all([
                getPerformanceReport(),
                getWillingReport(),
                getPlacedReport(),
                getCompanyWiseReport(),
                getPackageDistReport()
            ]);

            setStats(perf.stats);
            setWillingData(willing.report);
            setPlacedData(placed.report);
            setCompanyData(company.report);
            setPackageData(pkg.report);
        } catch (error) {
            toast.error('Failed to load reports');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchFilters();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setWillingPage(1);
            setPlacedPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);


    useEffect(() => {
        if (activeTab === 'willing') {
            fetchWilling();
        } else if (activeTab === 'placed') {
            fetchPlaced();
        }
    }, [activeTab, willingPage, placedPage, debouncedSearch, selectedCampuses, selectedDept, selectedDomain, selectedPlacedCampuses, selectedPlacedDept, selectedPlacedCompany]);


    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
        },
        maintainAspectRatio: false
    };

    const domainData = {
        labels: stats?.domains?.map(d => d.domain) || [],
        datasets: [{
            data: stats?.domains?.map(d => d.count) || [],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 0
        }]
    };

    const pkgChartData = {
        labels: packageData?.map(p => p.range_label) || [],
        datasets: [{
            label: 'Students',
            data: packageData?.map(p => p.count) || [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 8
        }]
    };

    const renderStatCard = (title, value, Icon, color) => (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );

    const filteredWilling = willingData;

    const filteredPlaced = placedData;

    // if (loading) return (
    //     <div className="flex items-center justify-center min-h-[400px]">
    //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    //     </div>
    // );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                        <FileText className="w-8 h-8 mr-3 text-primary-500" />
                        Placement Reports</h1>
                    <p className="text-slate-500 text-sm mt-1">Detailed analysis and student placement records</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-700">
                        <TrendingUp className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 font-bold">
                        <Download className="w-5 h-5" />
                        Export All
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
                {[
                    { id: 'insights', label: 'Insights', icon: Target },
                    { id: 'willing', label: 'Willing Students', icon: Users },
                    { id: 'placed', label: 'Placements', icon: Trophy },
                    { id: 'companies', label: 'Company Metrics', icon: Briefcase }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Insights Tab */}
            {activeTab === 'insights' && !stats && !loading && (
                <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-bold">No statistical data available</p>
                    <button onClick={fetchData} className="mt-4 text-primary-600 font-bold hover:underline">Retry Loading</button>
                </div>
            )}

            {activeTab === 'insights' && stats && (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderStatCard('Total Students', stats.total_students, Users, 'bg-blue-500')}
                        {renderStatCard('Students Placed', stats.placed_students, Trophy, 'bg-emerald-500')}
                        {renderStatCard('Willing for Placements', stats.willingness.willing, CheckCircle2, 'bg-amber-500')}
                        {renderStatCard('Avg Package', `${parseFloat(stats.avg_package || 0).toFixed(1)} LPA`, IndianRupee, 'bg-purple-500')}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                                <Target className="w-5 h-5 text-emerald-500" />
                                Domain Distribution
                            </h3>
                            <div className="flex-1">
                                <Doughnut data={domainData} options={chartOptions} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                Package Ranges (LPA)
                            </h3>
                            <div className="flex-1">
                                <Bar data={pkgChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Willing Students Tab */}
            {activeTab === 'willing' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    {/* Filters Area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <CampusFilter 
                                selectedCampuses={selectedCampuses} 
                                onChange={setSelectedCampuses} 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mt-1 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                Department
                            </label>
                            <select
                                value={selectedDept}
                                onChange={(e) => { setSelectedDept(e.target.value); setWillingPage(1); }}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                            >
                                <option value="">All Departments</option>
                                {filterOptions.departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mt-1 flex items-center gap-1">
                                <Grid className="w-3 h-3" />
                                Willing Domain
                            </label>
                            <select
                                value={selectedDomain}
                                onChange={(e) => { setSelectedDomain(e.target.value); setWillingPage(1); }}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                            >
                                <option value="">All Domains</option>
                                {filterOptions.domains.map(domain => (
                                    <option key={domain} value={domain}>{domain}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mt-1 flex items-center gap-1">
                                <Search className="w-3 h-3" />
                                Search
                            </label>
                            <input 
                                type="text" 
                                placeholder="Name or Reg No..." 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/30">
                            <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-black uppercase tracking-wider">
                                    {willingTotal} Students Found
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">

                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-5">Register No</th>
                                        <th className="px-8 py-5">Student Name</th>
                                        <th className="px-8 py-5">Department</th>
                                        <th className="px-8 py-5">Campus</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Interested Domain</th>
                                        <th className="px-8 py-5 text-right">Added On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {willingData.length > 0 ? willingData.map((student) => (
                                        <tr key={student.reg_no} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                            <td className="px-8 py-5 font-mono text-sm font-bold text-primary-600">{student.reg_no}</td>
                                            <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{student.name}</td>
                                            <td className="px-8 py-5 font-semibold text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{student.department}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                                                    student.cambus_details === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                                                    student.cambus_details === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                                                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                }`}>
                                                    {student.cambus_details || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold rounded-lg text-xs border border-amber-100 dark:border-amber-800/50">Willing</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold rounded-lg text-xs border border-blue-100 dark:border-blue-800/50">{student.willing_domain || 'Not Specified'}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right text-slate-400 text-sm">
                                                {formatDate(student.created_at)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="p-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <Filter className="w-12 h-12 mb-4 opacity-20" />
                                                    <p className="text-lg font-medium opacity-50">No willing students found matching your criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            currentPage={willingPage} 
                            totalPages={willingTotalPages} 
                            onPageChange={(p) => setWillingPage(p)} 
                        />
                    </div>
                </div>
            )}


            {/* Placements Tab */}
            {activeTab === 'placed' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    {/* Filters Area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <CampusFilter 
                                selectedCampuses={selectedPlacedCampuses} 
                                onChange={setSelectedPlacedCampuses} 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mt-1 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                Department
                            </label>
                            <select
                                value={selectedPlacedDept}
                                onChange={(e) => { setSelectedPlacedDept(e.target.value); setPlacedPage(1); }}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                            >
                                <option value="">All Departments</option>
                                {filterOptions.departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mt-1 flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                Select Company
                            </label>
                            <select
                                value={selectedPlacedCompany}
                                onChange={(e) => { setSelectedPlacedCompany(e.target.value); setPlacedPage(1); }}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                            >
                                <option value="">All Companies</option>
                                {filterOptions.companies.map(company => (
                                    <option key={company} value={company}>{company}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mt-1 flex items-center gap-1">
                                <Search className="w-3 h-3" />
                                Search
                            </label>
                            <input 
                                type="text" 
                                placeholder="Student or Company..." 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/30">
                            <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-black uppercase tracking-wider">
                                    {placedTotal} Results Found
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-5">Photo</th>
                                        <th className="px-8 py-5">Student</th>
                                        <th className="px-8 py-5">Department</th>
                                        <th className="px-8 py-5">Campus</th>
                                        <th className="px-8 py-5">Company</th>
                                        <th className="px-8 py-5 text-emerald-600">CTC</th>
                                        <th className="px-8 py-5 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {placedData.length > 0 ? placedData.map((student) => (
                                        <tr key={`${student.reg_no}-${student.company_name}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 border-2 border-white dark:border-slate-700 shadow-sm">
                                                    {student.name.charAt(0)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-900 dark:text-white mb-0.5">{student.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">{student.reg_no}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{student.department}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                                                    student.cambus_details === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                                                    student.cambus_details === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                                                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                }`}>
                                                    {student.cambus_details || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-bold text-primary-600 dark:text-primary-400">{student.company_name}</td>
                                            <td className="px-8 py-5 font-black text-emerald-600 dark:text-emerald-500 text-sm">₹ {student.salary} LPA</td>
                                            <td className="px-8 py-5 text-right text-slate-400 text-sm font-medium">{formatDate(student.placement_date)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="p-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <Filter className="w-12 h-12 mb-4 opacity-20" />
                                                    <p className="text-lg font-medium opacity-50">No placements found matching your criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            currentPage={placedPage} 
                            totalPages={placedTotalPages} 
                            onPageChange={(p) => setPlacedPage(p)} 
                        />
                    </div>
                </div>
            )}


            {/* Company Metrics Tab */}
            {activeTab === 'companies' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5 duration-500">
                    {companyData.map(company => (
                        <div key={company.name} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-primary-50 rounded-2xl dark:bg-primary-900/10 text-primary-600"><Briefcase className="w-6 h-6" /></div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">{company.count} Placed</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{company.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6">
                                <IndianRupee className="w-4 h-4 text-primary-500" />
                                Avg CTC: {parseFloat(company.avg_package).toFixed(1)} LPA
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary-500 h-full rounded-full" style={{ width: `${(company.count / stats.placed_students) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reports;
