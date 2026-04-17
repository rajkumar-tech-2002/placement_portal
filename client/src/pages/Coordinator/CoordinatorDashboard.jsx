import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, Briefcase, ChevronRight, ArrowUpRight, Clock } from 'lucide-react';
import * as driveService from '../../services/driveWillingness.service';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';
import PlacementModal from '../../components/common/PlacementModal';
import { Trophy } from 'lucide-react';

const CoordinatorDashboard = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchDrives();
    }, []);

    const upcomingDrives = drives.filter(d => new Date(d.drive_date) >= new Date());
    const totalWilling = drives.reduce((acc, d) => acc + (d.willing_count || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-primary-500/10 rounded-2xl">
                            <LayoutDashboard className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Coordinator Dashboard</h1>
                            <p className="text-slate-500 text-sm mt-1">Manage drive coordination and student participation</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Upcoming Drives</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{upcomingDrives.length}</span>
                        <span className="text-emerald-500 text-xs font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> Live</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Willing Students</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{totalWilling}</span>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Total</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Next Drive</span>
                    </div>
                    <div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                            {upcomingDrives[0]?.name || 'No Upcoming Drives'}
                        </span>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                            {upcomingDrives[0] ? formatDate(upcomingDrives[0].drive_date) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Upcoming List */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-primary-500" />
                        Recent & Upcoming Drives
                    </h2>
                    <button 
                        onClick={() => navigate('/coordinator/drives')}
                        className="text-xs font-black text-primary-600 uppercase tracking-widest hover:bg-primary-50 px-4 py-2 rounded-xl transition-all"
                    >
                        View All
                    </button>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="p-8 h-20 animate-pulse bg-slate-50 dark:bg-slate-800" />)
                    ) : drives.length > 0 ? (
                        drives.slice(0, 5).map((drive) => (
                            <div key={drive.id} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                        <Briefcase className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{drive.name}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(drive.drive_date)}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {drive.willing_count || 0} Willing
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate(`/coordinator/drives/${drive.id}/attendance`)}
                                    className="p-3 rounded-2xl text-slate-300 hover:text-primary-600 hover:bg-primary-50 transition-all active:scale-90"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center text-slate-400">
                            No drive data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoordinatorDashboard;
