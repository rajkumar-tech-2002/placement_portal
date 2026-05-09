import React, { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import api from '../../services/api.service';
import InputLabel from './InputLabel';

const DepartmentFilter = ({ selectedCampuses, selectedDepartment, onChange }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                // We fetch departments for each selected campus or all at once if supported
                // Since our /departments endpoint supports a single campus, we'll fetch for each or modify backend to support multiple
                // For now, let's fetch for each if it's more than one, or just the first if it's easier.
                // Better: Modify backend to support multiple campuses in /departments
                
                const response = await api.get('/departments', {
                    params: { campus: selectedCampuses.join(',') }
                });
                setDepartments(response.data.data.map(d => d.department));
            } catch (error) {
                console.error('Failed to fetch departments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, [selectedCampuses]);

    return (
        <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-w-[200px]">
            <InputLabel icon={LayoutGrid} text="Select Department" className="mb-0 mt-1" />
            <select
                value={selectedDepartment || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
                disabled={loading}
            >
                <option value="">All Departments</option>
                {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
            </select>
        </div>
    );
};

export default DepartmentFilter;
