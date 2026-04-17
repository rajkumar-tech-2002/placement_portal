import React from 'react';

const InputLabel = ({ icon: Icon, text, required, className = "" }) => {
    return (
        <label className={`text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center mb-2 animate-in fade-in duration-300 ${className}`}>
            {Icon && <Icon className="w-3.5 h-3.5 mr-2 text-primary-500 shrink-0" />}
            <span>{text}</span>
            {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
    );
};

export default InputLabel;
