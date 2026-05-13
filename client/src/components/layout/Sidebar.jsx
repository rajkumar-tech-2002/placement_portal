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
    UserPlus,
    Code2,
    Trophy,
    RefreshCcw,
    Building2,
    UserCheck,
    ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed }) => {
    const { user } = useAuth();
    
    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Companies', path: '/admin/companies', icon: Briefcase },
        { name: 'Student Details', path: '/admin/student-details', icon: Users },
        { name: 'LeetCode ', path: '/admin/leetcode-details', icon: Code2 },
        { name: 'Placement Entry', path: '/admin/placement-record', icon: Trophy },
        { name: 'Users', path: '/admin/create-user', icon: UserPlus },
        { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
        { 
            type: 'section', 
            name: 'Master Module',
            links: [
                { name: 'Departments', path: '/admin/departments-master', icon: Building2 },
                { name: 'Staff', path: '/admin/staff-master', icon: UserCheck },
                { name: 'Roles', path: '/admin/roles-master', icon: ShieldCheck },
                { name: 'LeetCode Settings', path: '/admin/sync-settings', icon: RefreshCcw }
            ]
        }
    ];

    const coordinatorLinks = [
        { name: 'Dashboard', path: '/coordinator/dashboard', icon: LayoutDashboard },
        { name: 'Placement Entry', path: '/coordinator/placement-record', icon: Trophy },
        { name: 'LeetCode', path: '/coordinator/leetcode-details', icon: Code2 },
        { name: 'Drive Execution', path: '/coordinator/drives', icon: ClipboardCheck },
        { name: 'Placement Count', path: '/coordinator/placement-count', icon: FileBarChart },
    ];

    const getLinks = () => {
        if (user?.role === 'ADMIN' || user?.role === 'SUPER ADMIN') return adminLinks;
        if (user?.role === 'COORDINATOR') return coordinatorLinks;
        return [];
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
                        {getLinks().map((link, i) => (
                            link.type === 'section' ? (
                                <li key={i} className="mt-6 mb-2">
                                    {!isSidebarCollapsed && (
                                        <div className="px-4 mb-2">
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                                {link.name}
                                            </span>
                                        </div>
                                    )}
                                    <ul className="space-y-1.5">
                                        {link.links.map((subLink) => (
                                            <li key={subLink.path}>
                                                <NavLink
                                                    to={subLink.path}
                                                    className={({ isActive }) => `
                                                        flex items-center rounded-xl p-3 transition-all duration-200 group relative
                                                        ${isActive 
                                                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-semibold shadow-sm shadow-primary-500/10' 
                                                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                                        }
                                                        ${isSidebarCollapsed ? 'justify-center' : ''}
                                                    `}
                                                    title={isSidebarCollapsed ? subLink.name : ''}
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            <subLink.icon className={`
                                                                w-5 h-5 transition-colors duration-200
                                                                ${isSidebarCollapsed ? '' : 'mr-3'}
                                                            `} />
                                                            
                                                            {!isSidebarCollapsed && (
                                                                <span className="whitespace-nowrap truncate">{subLink.name}</span>
                                                            )}

                                                            {isActive && !isSidebarCollapsed && (
                                                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                                                            )}
                                                        </>
                                                    )}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ) : (
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
                            )
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
