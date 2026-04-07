import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Briefcase, 
    Users, 
    FileBarChart, 
    UserCircle,
    ClipboardCheck,
    X,
    UserPlus
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed }) => {
    const { user } = useAuth();
    
    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Companies', path: '/admin/companies', icon: Briefcase },
        { name: 'Student Details', path: '/admin/student-details', icon: Users },
        { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
        { name: 'Users', path: '/admin/create-user', icon: UserPlus },
    ];

    // const studentLinks = [
    //     { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    //     { name: 'Eligible Drives', path: '/student/drives', icon: Briefcase },
    //     { name: 'My Applications', path: '/student/applications', icon: ClipboardCheck },
    //     { name: 'Profile', path: '/student/profile', icon: UserCircle },
    // ];

    const coordinatorLinks = [
        { name: 'Dashboard', path: '/coordinator/dashboard', icon: LayoutDashboard },
        { name: 'Drive Execution', path: '/coordinator/drives', icon: ClipboardCheck },
    ];

    const getLinks = () => {
        if (user?.role === 'ADMIN') return adminLinks;
        if (user?.role === 'COORDINATOR') return coordinatorLinks;
        return studentLinks;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed left-0 top-0 z-40 h-screen pt-16 transition-all duration-300 ease-in-out border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isSidebarCollapsed ? 'w-20' : 'w-64'}
            `}>
                <div className="h-full overflow-y-auto px-3 py-6 scrollbar-hide">
                    <ul className="space-y-1.5 font-medium">
                        {getLinks().map((link) => (
                            <li key={link.path}>
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) => `
                                        flex items-center rounded-xl p-3 transition-all duration-200 group relative
                                        ${isActive 
                                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-semibold shadow-sm shadow-primary-500/10' 
                                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }
                                        ${isSidebarCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isSidebarCollapsed ? link.name : ''}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <link.icon className={`
                                                w-5 h-5 transition-colors duration-200
                                                ${isSidebarCollapsed ? '' : 'mr-3'}
                                            `} />
                                            
                                            {!isSidebarCollapsed && (
                                                <span className="whitespace-nowrap truncate">{link.name}</span>
                                            )}

                                            {/* Active Indicator Dot */}
                                            {isActive && !isSidebarCollapsed && (
                                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Optional: Bottom Profile Info when Collapsed */}
                {isSidebarCollapsed && user && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 animate-pulse">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
