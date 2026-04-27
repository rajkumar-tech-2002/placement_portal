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
    Trophy,
    Mail,
    Phone,
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
import DataTable from '../components/common/DataTable';
import CampusFilter from '../components/common/CampusFilter';
import InputLabel from '../components/common/InputLabel';
import SectionTitle from '../components/common/SectionTitle';
import ModalTitle from '../components/common/ModalTitle';
import { useAuth } from '../context/AuthContext';

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
    const [willingLimit, setWillingLimit] = useState(10);
    const [willingTotalPages, setWillingTotalPages] = useState(0);
    const [willingTotal, setWillingTotal] = useState(0);

    const { user: authUser } = useAuth();
    const [selectedCampuses, setSelectedCampuses] = useState(authUser?.campus !== 'Both' ? [authUser?.campus] : []);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [filterOptions, setFilterOptions] = useState({ departments: [], domains: [], companies: [] });

    // Placements Table State
    const [placedPage, setPlacedPage] = useState(1);
    const [placedLimit, setPlacedLimit] = useState(10);
    const [placedTotalPages, setPlacedTotalPages] = useState(0);
    const [placedTotal, setPlacedTotal] = useState(0);
    const [selectedPlacedCampuses, setSelectedPlacedCampuses] = useState(authUser?.campus !== 'Both' ? [authUser?.campus] : []);
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
                limit: willingLimit,
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
                limit: placedLimit,
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
        if (authUser?.campus !== 'Both') {
            setSelectedCampuses([authUser?.campus]);
            setSelectedPlacedCampuses([authUser?.campus]);
        }
    }, [authUser]);

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
    }, [activeTab, willingPage, willingLimit, placedPage, placedLimit, debouncedSearch, selectedCampuses, selectedDept, selectedDomain, selectedPlacedCampuses, selectedPlacedDept, selectedPlacedCompany]);


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
                    <InputLabel text={title} className="mb-0.5" />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );

    const willingnessColumns = [
        { 
            header: 'REGISTER NO', 
            key: 'reg_no', 
            render: (val) => <span className="font-mono text-sm font-bold text-primary-600">{val}</span>
        },
        { 
            header: 'STUDENT NAME', 
            key: 'name', 
            render: (val) => <span className="font-bold text-slate-900 dark:text-white">{val}</span>
        },
        { header: 'DEPARTMENT', key: 'department', className: 'font-semibold text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap' },
        { 
            header: 'CAMPUS', 
            key: 'campus_details',
            render: (val) => (
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                    val === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                    val === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                    {val === 'Both' ? 'NEC, NCT' : (val || 'N/A')}
                </span>
            )
        },
        { 
            header: 'WILLINGNESS', 
            key: 'willing',
            render: () => <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold rounded-lg text-xs border border-amber-100 dark:border-amber-800/50">Willing</span>
        },
        { 
            header: 'INTERESTED DOMAIN', 
            key: 'willing_domain',
            render: (val) => <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold rounded-lg text-xs border border-blue-100 dark:border-blue-800/50">{val || 'Not Specified'}</span>
        },
        { 
            header: 'ADDED ON', 
            key: 'created_at', 
            className: 'text-right pr-6',
            render: (val) => <span className="text-slate-400 text-sm">{formatDate(val)}</span>
        }
    ];

    const placementColumns = [
        { 
            header: 'PHOTO', 
            key: 'name', 
            render: (val) => (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 border-2 border-white dark:border-slate-700 shadow-sm">
                    {(val || '?').charAt(0)}
                </div>
            )
        },
        { 
            header: 'STUDENT', 
            key: 'name', 
            render: (val, row) => (
                <div>
                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">{val}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">{row.reg_no}</div>
                </div>
            )
        },
        { header: 'DEPARTMENT', key: 'department', className: 'text-sm font-semibold text-slate-600 dark:text-slate-400' },
        { 
            header: 'CAMPUS', 
            key: 'campus_details',
            render: (val) => (
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                    val === 'NEC' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                    val === 'NCT' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                    {val === 'Both' ? 'NEC, NCT' : (val || 'N/A')}
                </span>
            )
        },
        { header: 'COMPANY', key: 'company_name', className: 'font-bold text-primary-600 dark:text-primary-400' },
        { 
            header: 'CTC', 
            key: 'salary', 
            className: 'font-black text-emerald-600 dark:text-emerald-500 text-sm',
            render: (val) => `₹ ${val} LPA`
        },
        { 
            header: 'DATE', 
            key: 'placement_date', 
            className: 'text-right pr-6',
            render: (val) => <span className="text-slate-400 text-sm font-medium">{formatDate(val)}</span>
        }
    ];

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
                <ModalTitle 
                    icon={FileText} 
                    title="Placement Reports" 
                    description="Detailed analysis and student placement records" 
                />
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
                    { id: 'insights', label: 'Overall', icon: Target },
                    { id: 'willing', label: 'Placement Willingness', icon: Users },
                    { id: 'placed', label: 'Placements Record', icon: Trophy },
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
                            <SectionTitle 
                                icon={Target} 
                                title="Willing Domain" 
                                subtitle="Student Interest Distribution" 
                            />
                            <div className="flex-1">
                                <Doughnut data={domainData} options={chartOptions} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
                            <SectionTitle 
                                icon={BarChart3} 
                                title="Package Ranges (LPA)" 
                                subtitle="Salary distribution metrics" 
                            />
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
                        {authUser?.campus === 'Both' && (
                            <div className="md:col-span-1">
                                <CampusFilter 
                                    selectedCampuses={selectedCampuses} 
                                    onChange={setSelectedCampuses} 
                                />
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <InputLabel icon={GraduationCap} text="Department" className="mb-0 mt-1" />
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
                            <InputLabel icon={Grid} text="Willing Domain" className="mb-0 mt-1" />
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
                            <InputLabel icon={Search} text="Search" className="mb-0 mt-1" />
                            <input 
                                type="text" 
                                placeholder="Name or Reg No..." 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={willingnessColumns}
                        data={willingData}
                        loading={loading}
                        onLimitChange={(lvl) => {
                            setWillingLimit(lvl);
                            setWillingPage(1);
                        }}
                        limit={willingLimit}
                        pagination={{
                            page: willingPage,
                            totalPages: willingTotalPages,
                            totalItems: willingTotal,
                            onPageChange: setWillingPage
                        }}
                        idKey="reg_no"
                    />
                </div>
            )}


            {/* Placements Tab */}
            {activeTab === 'placed' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    {/* Filters Area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {authUser?.campus === 'Both' && (
                            <div className="md:col-span-1">
                                <CampusFilter 
                                    selectedCampuses={selectedPlacedCampuses} 
                                    onChange={setSelectedPlacedCampuses} 
                                />
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <InputLabel icon={GraduationCap} text="Department" className="mb-0 mt-1" />
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
                            <InputLabel icon={Building} text="Select Company" className="mb-0 mt-1" />
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
                            <InputLabel icon={Search} text="Search" className="mb-0 mt-1" />
                            <input 
                                type="text" 
                                placeholder="Student or Company..." 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={placementColumns}
                        data={placedData}
                        loading={loading}
                        onLimitChange={(lvl) => {
                            setPlacedLimit(lvl);
                            setPlacedPage(1);
                        }}
                        limit={placedLimit}
                        pagination={{
                            page: placedPage,
                            totalPages: placedTotalPages,
                            totalItems: placedTotal,
                            onPageChange: setPlacedPage
                        }}
                        idKey="reg_no"
                    />
                </div>
            )}


            {/* Company Metrics Tab */}
            {activeTab === 'companies' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart: Placed Count */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                            <SectionTitle 
                                icon={PieIcon} 
                                title="Placement Share" 
                                subtitle="Distribution by student count" 
                            />
                            <div className="h-[350px] mt-8">
                                <Pie 
                                    data={{
                                        labels: companyData.map(c => c.name),
                                        datasets: [{
                                            data: companyData.map(c => c.count),
                                            backgroundColor: [
                                                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                                                '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
                                            ],
                                            borderWidth: 0
                                        }]
                                    }} 
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                ...chartOptions.plugins.legend,
                                                position: 'right'
                                            }
                                        }
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Bar Chart: Salary Comparison */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                            <SectionTitle 
                                icon={IndianRupee} 
                                title="Salary Metrics" 
                                subtitle="Average CTC comparison (LPA)" 
                            />
                            <div className="h-[350px] mt-8">
                                <Bar 
                                    data={{
                                        labels: companyData.map(c => c.name),
                                        datasets: [{
                                            label: 'Average CTC (LPA)',
                                            data: companyData.map(c => parseFloat(c.avg_package).toFixed(1)),
                                            backgroundColor: 'rgba(139, 92, 246, 0.8)',
                                            borderRadius: 12,
                                            hoverBackgroundColor: '#8b5cf6'
                                        }]
                                    }} 
                                    options={{
                                        ...chartOptions,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: (val) => `₹${val}L`
                                                }
                                            }
                                        }
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Reports;
