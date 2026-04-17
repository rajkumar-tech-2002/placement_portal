import React from 'react';

const SectionTitle = ({ icon: Icon, title, subtitle, className = "" }) => {
    return (
        <div className={`flex items-center gap-3 mb-6 animate-in slide-in-from-left-4 duration-300 ${className}`}>
            {Icon && (
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
            )}
            <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SectionTitle;
