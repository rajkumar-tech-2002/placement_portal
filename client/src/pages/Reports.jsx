import React, { useState, useEffect } from 'react';
import { 
    getPerformanceReport, 
    getWillingReport, 
    getPlacedReport, 
    getCompanyWiseReport, 
    getPackageDistReport,
    getWillingFilters,
    getLeetCodeReport,
    getLeetCodeConsolidatedReport
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
    Building,
    Code2,
    Globe,
    ExternalLink
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
import * as XLSX from 'xlsx';
import { formatDate } from '../utils/dateFormatter';
import Pagination from '../components/common/Pagination';
import DataTable from '../components/common/DataTable';
import CampusFilter from '../components/common/CampusFilter';
import InputLabel from '../components/common/InputLabel';
import SectionTitle from '../components/common/SectionTitle';
import ModalTitle from '../components/common/ModalTitle';
import { useAuth } from '../context/AuthContext';
import DepartmentFilter from '../components/common/DepartmentFilter';

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

    // LeetCode Table State
    const [leetcodeData, setLeetcodeData] = useState([]);
    const [leetcodePage, setLeetcodePage] = useState(1);
    const [leetcodeLimit, setLeetcodeLimit] = useState(10);
    const [leetcodeTotalPages, setLeetcodeTotalPages] = useState(0);
    const [leetcodeTotal, setLeetcodeTotal] = useState(0);
    const [selectedLeetcodeCampuses, setSelectedLeetcodeCampuses] = useState(authUser?.campus !== 'Both' ? [authUser?.campus] : []);
    const [selectedLeetcodeDept, setSelectedLeetcodeDept] = useState('');
    const [leetcodeView, setLeetcodeView] = useState('individual'); // 'individual' or 'consolidated'
    const [leetcodeConsolidatedData, setLeetcodeConsolidatedData] = useState([]);
    const [leetcodeConsolidatedPage, setLeetcodeConsolidatedPage] = useState(1);
    const [leetcodeConsolidatedLimit, setLeetcodeConsolidatedLimit] = useState(10);
    const [leetcodeConsolidatedTotalPages, setLeetcodeConsolidatedTotalPages] = useState(0);
    const [leetcodeConsolidatedTotal, setLeetcodeConsolidatedTotal] = useState(0);


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

    const fetchLeetcode = async () => {
        try {
            if (leetcodeView === 'individual') {
                const data = await getLeetCodeReport({
                    page: leetcodePage,
                    limit: leetcodeLimit,
                    search: debouncedSearch,
                    campus: selectedLeetcodeCampuses,
                    department: selectedLeetcodeDept
                });
                setLeetcodeData(data.report);
                setLeetcodeTotal(data.total);
                setLeetcodeTotalPages(data.totalPages);
            } else {
                const data = await getLeetCodeConsolidatedReport({
                    page: leetcodeConsolidatedPage,
                    limit: leetcodeConsolidatedLimit,
                    search: debouncedSearch,
                    campus: selectedLeetcodeCampuses,
                    department: selectedLeetcodeDept
                });
                setLeetcodeConsolidatedData(data.report);
                setLeetcodeConsolidatedTotal(data.total);
                setLeetcodeConsolidatedTotalPages(data.totalPages);
            }
        } catch (error) {
            toast.error('Failed to fetch LeetCode report');
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
            setLeetcodePage(1);
            setLeetcodeConsolidatedPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);


    useEffect(() => {
        if (activeTab === 'willing') {
            fetchWilling();
        } else if (activeTab === 'placed') {
            fetchPlaced();
        } else if (activeTab === 'leetcode') {
            fetchLeetcode();
        }
    }, [activeTab, willingPage, willingLimit, placedPage, placedLimit, leetcodePage, leetcodeLimit, leetcodeConsolidatedPage, leetcodeConsolidatedLimit, debouncedSearch, selectedCampuses, selectedDept, selectedDomain, selectedPlacedCampuses, selectedPlacedDept, selectedPlacedCompany, selectedLeetcodeCampuses, selectedLeetcodeDept, leetcodeView]);


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
            header: 'S.NO', 
            key: 'sno', 
            render: (_, __, index) => <span className="font-bold text-slate-500">{index + 1 + (willingPage - 1) * willingLimit}</span>
        },
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
        { 
            header: 'DEPARTMENT', 
            key: 'department', 
            render: (val) => <span className="font-bold text-slate-900 dark:text-white">{val}</span>
        },
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
            header: 'S.NO', 
            key: 'sno', 
            render: (_, __, index) => <span className="font-bold text-slate-500">{index + 1 + (placedPage - 1) * placedLimit}</span>
        },
        { 
            header: 'REGISTER NO', 
            key: 'reg_no', 
            render: (val, row) => <span className="font-mono text-sm font-bold text-primary-600">{row.reg_no || val}</span>
        },
        { 
            header: 'STUDENT', 
            key: 'name', 
            render: (val) => (
                <span className="font-bold text-slate-900 dark:text-white">{val}</span>
            )
        },
        { 
            header: 'DEPARTMENT', 
            key: 'department', 
            render: (val) => <span className="font-bold text-slate-900 dark:text-white">{val}</span>
        },
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

    const leetcodeColumns = [
        { 
            header: 'S.NO', 
            key: 'sno', 
            render: (_, __, index) => <span className="font-bold text-slate-500">{index + 1 + (leetcodePage - 1) * leetcodeLimit}</span>
        },
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
            header: 'DEPARTMENT', 
            key: 'department', 
            render: (val) => <span className="font-bold text-slate-900 dark:text-white">{val}</span>
        },
        { 
            header: 'PROFILE', 
            key: 'leetcode_username',
            render: (val, row) => (
                <a 
                    href={row.leet_code_profile || (val ? `https://leetcode.com/u/${val}/` : '#')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-bold">Profile</span>
                </a>
            )
        },
        { 
            header: 'LAST CONTEST', 
            key: 'last_contest_date',
            render: (_, row) => row.last_contest_name ? (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]" title={row.last_contest_name}>{row.last_contest_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{formatDate(row.last_contest_date)}</span>
                </div>
            ) : (
                <span className="text-slate-400 italic text-xs">No recent contest</span>
            )
        },
        { 
            header: 'SOLVED', 
            key: 'last_contest_solved',
            render: (val, row) => row.last_contest_name ? (
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    {val}/{row.last_contest_total_questions || 4}
                </span>
            ) : '-'
        },
        { 
            header: 'RATING', 
            key: 'contest_rating', 
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{val || 0}</span>
                </div>
            )
        },
        { 
            header: 'GLOBAL RANK', 
            key: 'global_ranking', 
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {val?.toLocaleString() || '-'}
                    </span>
                </div>
            )
        },
        { 
            header: 'LAST RANK', 
            key: 'last_contest_rank',
            render: (val) => val ? (
                <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-bold rounded text-[10px] border border-primary-100 dark:border-primary-800/50">
                    #{val}
                </span>
            ) : '-'
        }
    ];

    const leetcodeConsolidatedColumns = [
        { 
            header: 'S.NO', 
            key: 'sno', 
            render: (_, __, index) => <span className="font-bold text-slate-500">{index + 1 + (leetcodeConsolidatedPage - 1) * leetcodeConsolidatedLimit}</span>
        },
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
            header: 'DEPARTMENT', 
            key: 'department', 
            render: (val) => <span className="font-bold text-slate-900 dark:text-white">{val}</span>
        },
        { 
            header: 'CONTEST NAME', 
            key: 'last_contest_name',
            render: (val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{val}</span>
        },
        { 
            header: 'CONTEST DATE', 
            key: 'last_contest_date',
            render: (val) => <span className="text-[10px] text-slate-500 font-medium">{formatDate(val)}</span>
        },
        { 
            header: '1 SOLVED', 
            key: 'solved_1',
            render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">{val || 0}</span>
        },
        { 
            header: '2 SOLVED', 
            key: 'solved_2',
            render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">{val || 0}</span>
        },
        { 
            header: '3 SOLVED', 
            key: 'solved_3',
            render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">{val || 0}</span>
        },
        { 
            header: '4 SOLVED', 
            key: 'solved_4',
            render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">{val || 0}</span>
        },
        { 
            header: 'TOTAL STUDENTS', 
            key: 'total_students',
            render: (val) => <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-black rounded text-[10px] border border-primary-100 dark:border-primary-800/50">{val}</span>
        }
    ];

    const filteredWilling = willingData;
    const filteredPlaced = placedData;

    const handleExport = async () => {
        try {
            let dataToExport = [];
            let filename = '';
            let title = '';

            if (activeTab === 'willing') {
                const data = await getWillingReport({
                    page: 1,
                    limit: 1000000,
                    search: debouncedSearch,
                    campus: selectedCampuses,
                    department: selectedDept,
                    domain: selectedDomain
                });
                
                dataToExport = data.report.map((item, index) => ({
                    'S.NO': index + 1,
                    'REGISTER NO': item.reg_no || '',
                    'STUDENT NAME': item.name || '',
                    'DEPARTMENT': item.department || '',
                    'CAMPUS': item.campus_details === 'Both' ? 'NEC, NCT' : (item.campus_details || 'N/A'),
                    'WILLINGNESS': 'Willing',
                    'INTERESTED DOMAIN': item.willing_domain || 'Not Specified',
                    'ADDED ON': formatDate(item.created_at)
                }));
                
                filename = 'Placement_Willingness_Report.xlsx';
                title = 'Placement Willingness Report';

            } else if (activeTab === 'placed') {
                const data = await getPlacedReport({
                    page: 1,
                    limit: 1000000,
                    search: debouncedSearch,
                    campus: selectedPlacedCampuses,
                    department: selectedPlacedDept,
                    company: selectedPlacedCompany
                });

                dataToExport = data.report.map((item, index) => ({
                    'S.NO': index + 1,
                    'REGISTER NO': item.reg_no || '',
                    'STUDENT NAME': item.name || '',
                    'DEPARTMENT': item.department || '',
                    'CAMPUS': item.campus_details === 'Both' ? 'NEC, NCT' : (item.campus_details || 'N/A'),
                    'COMPANY': item.company_name || '',
                    'CTC (LPA)': item.salary ? `₹ ${item.salary} LPA` : '',
                    'DATE': formatDate(item.placement_date)
                }));
                
                filename = 'Placements_Record_Report.xlsx';
                title = 'Placements Record Report';
            } else if (activeTab === 'leetcode') {
                if (leetcodeView === 'individual') {
                    const data = await getLeetCodeReport({
                        page: 1,
                        limit: 1000000,
                        search: debouncedSearch,
                        campus: selectedLeetcodeCampuses,
                        department: selectedLeetcodeDept
                    });

                    dataToExport = data.report.map((item, index) => ({
                        'S.NO': index + 1,
                        'REGISTER NO': item.reg_no || '',
                        'STUDENT NAME': item.name || '',
                        'CAMPUS': item.campus_details === 'Both' ? 'NEC, NCT' : (item.campus_details || 'N/A'),
                        'DEPARTMENT': item.department || '',
                        'LEETCODE PROFILE': item.leetcode_username ? `https://leetcode.com/u/${item.leetcode_username}/` : (item.leet_code_profile || ''),
                        'LAST CONTEST DATE': item.last_contest_date ? formatDate(item.last_contest_date) : 'N/A',
                        'LAST CONTEST NAME': item.last_contest_name || 'N/A',
                        'LAST CONTEST SOLVED': item.last_contest_name ? `${item.last_contest_solved || 0}/${item.last_contest_total_questions || 4}` : 'N/A',
                        'CONTEST RATING': item.contest_rating || 0,
                        'GLOBAL RANK': item.global_ranking || 'N/A',
                        'LAST CONTEST RANK': item.last_contest_rank || 'N/A'
                    }));

                    filename = 'LeetCode_Performance_Report.xlsx';
                    title = 'LeetCode Performance Report';
                } else {
                    const data = await getLeetCodeConsolidatedReport({
                        page: 1,
                        limit: 1000000,
                        search: debouncedSearch,
                        campus: selectedLeetcodeCampuses,
                        department: selectedLeetcodeDept
                    });

                    // Group by contest
                    const groupedData = {};
                    data.report.forEach(item => {
                        const key = `${item.last_contest_name} (${formatDate(item.last_contest_date)})`;
                        if (!groupedData[key]) groupedData[key] = [];
                        groupedData[key].push(item);
                    });

                    const aoaData = [];
                    Object.entries(groupedData).forEach(([contestInfo, students]) => {
                        // Header for the contest
                        aoaData.push([contestInfo]);
                        // Table headers for this contest
                        aoaData.push(['S.NO', 'CAMPUS', 'DEPARTMENT', '1 SOLVED', '2 SOLVED', '3 SOLVED', '4 SOLVED', 'TOTAL STUDENTS']);
                        
                        students.forEach((item, index) => {
                            aoaData.push([
                                index + 1,
                                item.campus_details === 'Both' ? 'NEC, NCT' : (item.campus_details || 'N/A'),
                                item.department || '',
                                item.solved_1 || 0,
                                item.solved_2 || 0,
                                item.solved_3 || 0,
                                item.solved_4 || 0,
                                item.total_students || 0
                            ]);
                        });
                        // Empty row between contests
                        aoaData.push([]);
                    });

                    const wsTitle = 'LeetCode Consolidated Performance Report';
                    const ws = XLSX.utils.aoa_to_sheet([
                        [wsTitle],
                        [`Exported On: ${formatDate(new Date())} ${new Date().toLocaleTimeString()}`],
                        [],
                        ...aoaData
                    ]);

                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Report');
                    XLSX.writeFile(wb, 'LeetCode_Consolidated_Report.xlsx');
                    toast.success('Report exported successfully!');
                    return; // Exit early since we handled the whole wb here
                }
            }

            if (dataToExport.length === 0) {
                toast.error('No data available to export');
                return;
            }

            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
            
            const now = new Date();
            const currentDateTime = `${formatDate(now)} ${now.toLocaleTimeString()}`;
            XLSX.utils.sheet_add_aoa(ws, [[`Exported On: ${currentDateTime}`]], { origin: 'A2' });
            XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A3' });
            XLSX.utils.sheet_add_json(ws, dataToExport, { origin: 'A4' });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');

            XLSX.writeFile(wb, filename);
            toast.success('Report exported successfully!');

        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export report');
        }
    };

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
                    {(activeTab === 'willing' || activeTab === 'placed' || activeTab === 'leetcode') && (
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 font-bold"
                        >
                            <Download className="w-5 h-5" />
                            {activeTab === 'willing' ? 'Export Willing' : activeTab === 'placed' ? 'Export Placements' : leetcodeView === 'individual' ? 'Export LeetCode Report' : 'Export Consolidated Report'}
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
                {[
                    { id: 'insights', label: 'Overall', icon: Target },
                    { id: 'willing', label: 'Placement Willingness', icon: Users },
                    { id: 'placed', label: 'Placements Record', icon: Trophy },
                    { id: 'leetcode', label: 'LeetCode Reports', icon: Code2 },
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
                                    onChange={(val) => {
                                        setSelectedCampuses(val);
                                        setSelectedDept('');
                                    }} 
                                />
                            </div>
                        )}
                        
                        <div className="md:col-span-1">
                            <DepartmentFilter 
                                selectedCampuses={selectedCampuses} 
                                selectedDepartment={selectedDept} 
                                onChange={setSelectedDept} 
                            />
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
                        selectable={false}
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
                                    onChange={(val) => {
                                        setSelectedPlacedCampuses(val);
                                        setSelectedPlacedDept('');
                                    }} 
                                />
                            </div>
                        )}
                        
                        <div className="md:col-span-1">
                            <DepartmentFilter 
                                selectedCampuses={selectedPlacedCampuses} 
                                selectedDepartment={selectedPlacedDept} 
                                onChange={setSelectedPlacedDept} 
                            />
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
                        selectable={false}
                    />
                </div>
            )}


            {/* LeetCode Reports Tab */}
            {activeTab === 'leetcode' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    {/* View Toggle and Filters */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
                            <button 
                                onClick={() => setLeetcodeView('individual')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${leetcodeView === 'individual' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Individual Report
                            </button>
                            <button 
                                onClick={() => setLeetcodeView('consolidated')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${leetcodeView === 'consolidated' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Consolidated Report
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {authUser?.campus === 'Both' && (
                                <div className="md:col-span-1">
                                    <CampusFilter 
                                        selectedCampuses={selectedLeetcodeCampuses} 
                                        onChange={(val) => {
                                            setSelectedLeetcodeCampuses(val);
                                            setSelectedLeetcodeDept('');
                                        }} 
                                    />
                                </div>
                            )}
                            
                            <div className="md:col-span-1">
                                <DepartmentFilter 
                                    selectedCampuses={selectedLeetcodeCampuses} 
                                    selectedDepartment={selectedLeetcodeDept} 
                                    onChange={setSelectedLeetcodeDept} 
                                />
                            </div>

                            <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                                <InputLabel icon={Search} text="Search Contest" className="mb-0 mt-1" />
                                <input 
                                    type="text" 
                                    placeholder="Contest Name or Date..." 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/40 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={leetcodeView === 'individual' ? leetcodeColumns : leetcodeConsolidatedColumns}
                        data={leetcodeView === 'individual' ? leetcodeData : leetcodeConsolidatedData}
                        loading={loading}
                        onLimitChange={(lvl) => {
                            if (leetcodeView === 'individual') {
                                setLeetcodeLimit(lvl);
                                setLeetcodePage(1);
                            } else {
                                setLeetcodeConsolidatedLimit(lvl);
                                setLeetcodeConsolidatedPage(1);
                            }
                        }}
                        limit={leetcodeView === 'individual' ? leetcodeLimit : leetcodeConsolidatedLimit}
                        pagination={leetcodeView === 'individual' ? {
                            page: leetcodePage,
                            totalPages: leetcodeTotalPages,
                            totalItems: leetcodeTotal,
                            onPageChange: setLeetcodePage
                        } : {
                            page: leetcodeConsolidatedPage,
                            totalPages: leetcodeConsolidatedTotalPages,
                            totalItems: leetcodeConsolidatedTotal,
                            onPageChange: setLeetcodeConsolidatedPage
                        }}
                        idKey={leetcodeView === 'individual' ? "reg_no" : "report_id"}
                        selectable={false}
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
