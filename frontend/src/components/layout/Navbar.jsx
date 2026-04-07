import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 dark:bg-slate-900/80 dark:border-slate-800 fixed left-0 right-0 top-0 z-50 transition-all duration-300">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 mr-2 rounded-lg lg:hidden text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* Desktop Collapse Toggle - Positioned to align with sidebar edge */}
                    <div className={`hidden lg:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} items-center`}>
                        <Link to="/" className="flex items-center group overflow-hidden">
                            <div className="min-w-[32px] w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform flex-shrink-0">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            {!isSidebarCollapsed && (
                                <span className="self-center text-xl font-bold whitespace-nowrap dark:text-white text-slate-900 tracking-tight transition-opacity duration-300">
                                    Placement <span className="text-primary-600">Portal</span>
                                </span>
                            )}
                        </Link>
                    </div>

                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-1.5 rounded-md hidden lg:flex text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 ml-2"
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>

                    {/* Mobile Logo */}
                    <Link to="/" className="flex items-center lg:hidden ml-2">
                        <span className="text-lg font-bold dark:text-white text-slate-900">
                            PMS <span className="text-primary-600">Portal</span>
                        </span>
                    </Link>
                </div>
                
                <div className="flex items-center space-x-2 md:space-x-4">
                    <ThemeToggle />
                    
                    {user ? (
                        <div className="flex items-center pl-3 border-l border-slate-200 dark:border-slate-800 ml-1">
                            <div className="hidden sm:flex flex-col items-end mr-3">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                                    {user.name}
                                </span>
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                                    {user.role}
                                </span>
                            </div>
                            <div className="relative group">
                                <button className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
                                    <UserIcon className="w-5 h-5" />
                                </button>
                                
                                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 min-w-[200px]">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                                            <p className="text-sm font-semibold dark:text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="text-white bg-primary-600 hover:bg-primary-700 font-semibold rounded-lg text-sm px-5 py-2 transition-all shadow-lg shadow-primary-500/25">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
