import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft, Search, GraduationCap, Download, Users, MapPin, Briefcase, Calendar } from 'lucide-react';
import * as driveService from '../../services/driveWillingness.service';
import * as companyService from '../../services/company.service';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormatter';
import InputLabel from '../../components/common/InputLabel';
import SectionTitle from '../../components/common/SectionTitle';
import ModalTitle from '../../components/common/ModalTitle';
import DataTable from '../../components/common/DataTable';

const WillingStudents = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('ASC');

    useEffect(() => {
        const fetchWillingData = async () => {
            try {
                setLoading(true);
                const [willingUsers, companyInfo] = await Promise.all([
                    driveService.getWillingStudents(id),
                    companyService.getCompanyById(id)
                ]);
                setStudents(willingUsers);
                setCompany(companyInfo.company);
            } catch (error) {
                toast.error('Failed to fetch willing students');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchWillingData();
    }, [id]);

    const columns = [
        { 
            header: 'STUDENT INFO', 
            key: 'name', 
            sortable: true,
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600 font-bold text-sm">
                        {(val || '?').charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white">{val}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{row.student_reg_no}</div>
                    </div>
                </div>
            )
        },
        { 
            header: 'DEPARTMENT', 
            key: 'department',
            sortable: true,
            render: (val) => (
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {val}
                </span>
            )
        },
        { 
            header: 'CAMPUS', 
            key: 'cambus_details',
            sortable: true,
            render: (val) => (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    {val}
                </div>
            )
        },
        { 
            header: 'CONTACT', 
            key: 'personal_email',
            render: (val, row) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</div>
                    <div className="text-[10px] font-bold text-slate-400">{row.student_mobile}</div>
                </div>
            )
        },
        { 
            header: 'CGPA', 
            key: 'ug_pg_cgpa', 
            sortable: true,
            className: 'text-right pr-6',
            render: (val) => (
                <span className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                    {val}
                </span>
            )
        }
    ];

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_reg_no.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
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

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
            <DataTable
                columns={columns}
                data={paginatedStudents}
                loading={loading}
                idKey="student_reg_no"
                emptyMessage="No willing students found"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onLimitChange={(newLimit) => {
                    setItemsPerPage(newLimit);
                    setPage(1);
                }}
                limit={itemsPerPage}
                pagination={{
                    page,
                    totalPages,
                    totalItems: filteredStudents.length,
                    onPageChange: (newPage) => {
                        setPage(newPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
                filters={
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search willing students..." 
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 text-sm transition-all shadow-inner outline-none font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-bold text-sm shadow-lg shadow-primary-600/20 active:scale-95 shrink-0"
                        >
                            <Download className="w-4 h-4" />
                            Export List
                        </button>
                    </div>
                }
            />
        </div>
    );
};

export default WillingStudents;
