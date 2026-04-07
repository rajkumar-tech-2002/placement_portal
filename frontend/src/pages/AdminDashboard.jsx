import React, { useState, useEffect } from 'react';
import * as reportService from '../services/report.service';
import * as companyService from '../services/company.service';
import { useTheme } from '../context/ThemeContext';
import {
    Users,
    Briefcase,
    TrendingUp,
    DollarSign,
    PlusCircle,
    UserPlus,
    ArrowRight,
    CheckCircle2,
    Clock,
    Target,
    Zap,
    BarChart3,
    PieChart as PieIcon,
    LineChart as LineIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut, Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    const [data, setData] = useState({
        total_students: 0,
        placed_students: 0,
        total_drives: 0,
        highest_package: 0,
        avg_package: 0,
        willingness: { willing: 0, not_willing: 0 },
        domains: [],
        drive_stats: { upcoming_drives: 0, completed_drives: 0 },
        trends: []
    });
    const [recentCompanies, setRecentCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [reportData, companiesData] = await Promise.all([
                    reportService.getPerformanceReport(),
                    companyService.getAllCompanies()
                ]);

                if (reportData.stats) {
                    setData(reportData.stats);
                }

                if (companiesData.companies) {
                    setRecentCompanies(companiesData.companies.slice(0, 5));
                }
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Chart Data Configurations
    const willingnessData = {
        labels: ['Willing', 'Not Willing'],
        datasets: [{
            data: [data.willingness.willing, data.willingness.not_willing],
            backgroundColor: [
                isDark ? '#34d399' : 'rgba(16, 185, 129, 0.8)',
                isDark ? '#f87171' : 'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: isDark ? '#0f172a' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 4
        }]
    };

    const domainData = {
        labels: data.domains.map(d => d.domain),
        datasets: [{
            data: data.domains.map(d => d.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(20, 184, 166, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    const trendData = {
        labels: data.trends.map(t => t.month),
        datasets: [{
            fill: true,
            label: 'Placements',
            data: data.trends.map(t => t.count),
            borderColor: '#3b82f6',
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: isDark ? '#94a3b8' : '#64748b',
                    font: { size: 12, weight: '600' }
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#fff',
                titleColor: isDark ? '#f8fafc' : '#1e293b',
                bodyColor: isDark ? '#94a3b8' : '#64748b',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1
            }
        },
        scales: isDark ? {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
        } : {
            y: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
    };

    const statCards = [
        { title: 'Total Students', value: data.total_students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
        { title: 'Students Placed', value: data.placed_students, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        { title: 'Placement %', value: data.total_students ? `${((data.placed_students / data.total_students) * 100).toFixed(1)}%` : '0%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
        { title: 'Avg Package', value: `${parseFloat(data.avg_package || 0).toFixed(1)} LPA`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                        <BarChart3 className="w-8 h-8 mr-3 text-primary-500" />
                        Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Comprehensive placement analytics and drive tracking</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link to="/admin/create-user" className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold active:scale-95">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add User
                    </Link>
                    <Link to="/admin/companies" className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 font-bold active:scale-95">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Add Company
                    </Link>
                </div>
            </div>

            {/* Top Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} p-4 rounded-2xl`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{stat.title}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Willingness Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                            <PieIcon className="w-5 h-5 text-emerald-500" />
                            Willingness
                        </h3>
                    </div>
                    <div className="flex-1 min-h-[300px] relative">
                        <Doughnut data={willingnessData} options={chartOptions} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-10">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-slate-900 dark:text-white">{data.total_students}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Placement Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                            <LineIcon className="w-5 h-5 text-blue-500" />
                            Success Trends
                        </h3>
                        <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Growth</div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <Line data={trendData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
                    </div>
                </div>

                {/* Domain Distribution */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-wide">
                        <Target className="w-5 h-5 text-purple-500" />
                        Domains
                    </h3>
                    <div className="min-h-[300px]">
                        <Pie data={domainData} options={chartOptions} />
                    </div>
                </div>

                {/* Drive Status Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <Clock className="w-12 h-12 mb-6 opacity-80" />
                            <h4 className="text-lg font-bold opacity-90">Upcoming Drives</h4>
                            <div className="text-5xl font-black mt-2">{data.drive_stats.upcoming_drives}</div>
                        </div>
                        <Briefcase className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <CheckCircle2 className="w-12 h-12 mb-6 opacity-80" />
                            <h4 className="text-lg font-bold opacity-90">Completed Drives</h4>
                            <div className="text-5xl font-black mt-2">{data.drive_stats.completed_drives}</div>
                        </div>
                        <Zap className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Companies Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                        <BarChart3 className="w-5 h-5 text-amber-500" />
                        Hiring Partners
                    </h2>
                    <Link to="/admin/companies" className="text-primary-600 dark:text-primary-400 font-bold text-sm hover:underline flex items-center gap-1 active:scale-95 transition-all">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Partner</th>
                                <th className="px-8 py-5">Domain</th>
                                <th className="px-8 py-5">CTC</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {recentCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{company.name}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full">
                                            {company.category || 'CS/IT'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-emerald-600 font-black">{company.salary_lpa || '0'} LPA</td>
                                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium">
                                        {formatDate(company.drive_date)}
                                    </td>
                                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                                        <Link 
                                            to={`/admin/companies/${company.id}/willing-students`} 
                                            className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                            title="View Willing Students"
                                        >
                                            <Users className="w-4 h-4" />
                                        </Link>
                                        <Link to="/admin/companies" className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all">
                                            <EditIcon className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const EditIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);

export default AdminDashboard;
