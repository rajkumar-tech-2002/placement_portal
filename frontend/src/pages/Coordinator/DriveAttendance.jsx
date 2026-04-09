import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft, Search, CheckCircle2, XCircle, Clock, AlertCircle, Save, Check, Filter } from 'lucide-react';
import * as driveService from '../../services/driveWillingness.service';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormatter';

const DriveAttendance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [driveInfo, setDriveInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await driveService.getDriveAttendance(id);
                setStudents(data);
                
                // Fetch basic drive info from the first record if any
                const drives = await driveService.getCoordinatorDrives();
                const currentDrive = drives.find(d => d.id === parseInt(id));
                setDriveInfo(currentDrive);
            } catch (error) {
                toast.error('Failed to fetch attendance data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleUpdateStatus = async (student, status) => {
        setSavingId(student.reg_no);
        try {
            await driveService.markWillingness({
                companyId: id,
                studentRegNo: student.reg_no,
                status,
                department: student.department,
                cambus_details: student.cambus_details
            });
            
            // Update local state
            setStudents(prev => prev.map(s => 
                s.reg_no === student.reg_no ? { ...s, willing_status: status, updated_at: new Date() } : s
            ));
            
            toast.success(`Marked as ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setSavingId(null);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.reg_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        onClick={() => navigate('/coordinator/drives')}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 text-slate-600 dark:text-slate-400"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Building2 className="w-6 h-6 text-primary-500" />
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {driveInfo?.name || 'Drive Attendance'}
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                             Student Willingness List &bull; {students.length} Eligible Candidates
                        </p>
                    </div>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold text-slate-900 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider pl-12">Student Info</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Status</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Profile</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Willingness Status</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-12">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.reg_no} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6 pl-12">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-black text-xs border-2 border-white dark:border-slate-800 shadow-sm">
                                                    {student.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-lg">{student.name}</div>
                                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{student.reg_no}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {student.placed === 'Yes' ? (
                                                <span className="px-3 py-1 bg-green-50 text-green-600 dark:bg-green-900/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-800/50">
                                                    Placed
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                                                    Available
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 flex gap-2">
                                                    <span>10th: {student.tenth_percentage}%</span>
                                                    <span>12th: {student.twelfth_percentage}%</span>
                                                </div>
                                                <div className="text-[10px] font-black text-slate-600 dark:text-slate-400">
                                                    CGPA: <span className="text-primary-600">{student.ug_pg_cgpa}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                                                student.willing_status === 'Willing' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                'bg-red-50 border-red-100 text-red-600'
                                            }`}>
                                                {student.willing_status === 'Willing' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {student.willing_status}
                                            </div>
                                            {student.updated_at && (
                                                <div className="text-[9px] text-slate-400 mt-1 font-bold">
                                                    Updated: {formatDate(student.updated_at)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right pr-12">
                                            <div className="flex justify-end gap-2">
                                                {student.willing_status === 'Willing' ? (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(student, 'Not Willing')}
                                                        disabled={savingId === student.reg_no}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider border border-red-100 dark:border-red-800 disabled:opacity-50"
                                                    >
                                                        {savingId === student.reg_no ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                                        Mark Not Willing
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(student, 'Willing')}
                                                        disabled={savingId === student.reg_no}
                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider border border-emerald-100 dark:border-emerald-800 disabled:opacity-50"
                                                    >
                                                        {savingId === student.reg_no ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                        Restore Willing
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                            <Filter className="w-12 h-12" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No matching students found</p>
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

export default DriveAttendance;
