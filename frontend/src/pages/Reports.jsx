import React, { useState, useEffect } from 'react';
import { 
    getPerformanceReport, 
    getWillingReport, 
    getPlacedReport, 
    getCompanyWiseReport, 
    getPackageDistReport 
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
    Target
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
    }, []);

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

    const filteredWilling = willingData.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.reg_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPlaced = placedData.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

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
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or reg no..." 
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/40 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Register No</th>
                                    <th className="px-8 py-5">Student Name</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Interested Domain</th>
                                    <th className="px-8 py-5 text-right">Added On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredWilling.map((student) => (
                                    <tr key={student.reg_no} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                        <td className="px-8 py-5 font-mono text-sm font-bold text-primary-600">{student.reg_no}</td>
                                        <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{student.name}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold rounded-lg text-xs">Willing</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold rounded-lg text-xs">{student.willing_domain || 'Not Specified'}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right text-slate-400 text-sm">
                                            {formatDate(student.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Placements Tab */}
            {activeTab === 'placed' && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search placement records..." 
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/40 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Photo</th>
                                    <th className="px-8 py-5">Student</th>
                                    <th className="px-8 py-5">Company</th>
                                    <th className="px-8 py-5">CTC</th>
                                    <th className="px-8 py-5 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredPlaced.map((student) => (
                                    <tr key={student.reg_no} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                                {student.name.charAt(0)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                                            <div className="text-[10px] text-slate-400">{student.reg_no}</div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-primary-600">{student.company_name}</td>
                                        <td className="px-8 py-5 font-black text-emerald-600">₹{student.salary} LPA</td>
                                        <td className="px-8 py-5 text-right text-slate-400 text-sm">{formatDate(student.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
