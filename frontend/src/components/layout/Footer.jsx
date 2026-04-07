import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white/80 py-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-all duration-300">
            <div className="container-fluid px-4 md:px-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                        © {new Date().getFullYear()} Placement Portal. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 group">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Developed by
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            Rajkumar Anbazhagan
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
