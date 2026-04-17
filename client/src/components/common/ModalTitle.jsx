import React from 'react';

const ModalTitle = ({ icon: Icon, title, description, className = "" }) => {
    return (
        <div className={`flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${className}`}>
            {Icon && (
                <div className="p-3.5 bg-primary-600 rounded-2xl shadow-lg shadow-primary-600/20">
                    <Icon className="w-8 h-8 text-white" />
                </div>
            )}
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {title}
                </h2>
                {description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1.5 line-clamp-1">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ModalTitle;
