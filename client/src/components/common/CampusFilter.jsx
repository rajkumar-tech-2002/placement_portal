import React from 'react';
import { Building2 } from 'lucide-react';

const CampusFilter = ({ selectedCampuses, onChange }) => {
    const campuses = ['NEC', 'NCT'];

    const toggleCampus = (campus) => {
        if (selectedCampuses.includes(campus)) {
            onChange(selectedCampuses.filter(c => c !== campus));
        } else {
            onChange([...selectedCampuses, campus]);
        }
    };

    return (
        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Select Campus
            </label>
            <div className="flex gap-2">
                {campuses.map(campus => (
                    <button
                        key={campus}
                        onClick={() => toggleCampus(campus)}
                        className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                            selectedCampuses.includes(campus)
                            ? 'bg-primary-500 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                            : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary-500/50'
                        }`}
                    >
                        {campus}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CampusFilter;
