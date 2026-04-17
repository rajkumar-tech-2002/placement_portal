import React from 'react';

const Footer = ({ isSidebarCollapsed }) => {
    return (
        <footer className={`
            fixed bottom-0 right-0 z-[40]
            ${isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'}
            border-t border-slate-200 bg-white/80 py-4 backdrop-blur-md 
            dark:border-slate-800 dark:bg-slate-900/80 transition-all duration-300
        `}>
            <div className="container-fluid px-4 md:px-8">
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <p className="text-[12px] md:text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                        © {new Date().getFullYear()} Placement Portal. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 group">
                        <span className="text-[12px] md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Developed by
                        </span>
                        <span className="text-[12px] md:text-sm font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            Rajkumar Anbazhagan
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
