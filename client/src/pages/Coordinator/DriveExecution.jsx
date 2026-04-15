import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Users, ChevronRight, Search, Building2, ExternalLink, IndianRupee } from 'lucide-react';
import * as driveService from '../../services/driveWillingness.service';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';

const DriveExecution = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDrives = async () => {
            try {
                const data = await driveService.getCoordinatorDrives();
                setDrives(data);
            } catch (error) {
                console.error('Failed to fetch drives', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDrives();
    }, []);

    const filteredDrives = drives.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary-500/10 rounded-2xl">
                        <Briefcase className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Drive Execution</h1>
                        <p className="text-slate-500 text-sm mt-1">Select a drive to manage student eligibility and willingness</p>
                    </div>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search drives..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 text-sm transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Drives List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-white dark:bg-slate-800 rounded-3xl animate-pulse" />)
                ) : filteredDrives.length > 0 ? (
                    filteredDrives.map(drive => (
                        <div 
                            key={drive.id}
                            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-primary-600/10 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary-500/10 transition-colors">
                                    <Building2 className="w-8 h-8 text-slate-400 group-hover:text-primary-600" />
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                    drive.on_off_campus === 'On Campus' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {drive.on_off_campus}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{drive.name}</h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(drive.drive_date)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <IndianRupee className="w-4 h-4 text-emerald-500" />
                                    {drive.salary_lpa ? drive.salary_lpa + ' LPA' : 'Competitive'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <Users className="w-4 h-4 text-primary-500" />
                                    {drive.willing_count || 0} / {drive.eligible_count || 0} Willing
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(`/coordinator/drives/${drive.id}/attendance`)}
                                className="w-full py-4 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                            >
                                Manage Attendance
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">
                        No drives found
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriveExecution;
