import React, { useState, useEffect, useCallback, useRef } from 'react';
import placementCountService from '../../services/placementCount.service';
import { BASE_URL } from '../../services/api.service';
import { toast } from 'react-hot-toast';
import { 
    Save, 
    Upload, 
    Image as ImageIcon, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Building2,
    GraduationCap,
    X,
    Check
} from 'lucide-react';
import SignatureCropModal from '../../components/common/SignatureCropModal';

const PlacementCount = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [uploading, setUploading] = useState({});
    const [selectedTabs, setSelectedTabs] = useState(['IT']); // 'IT', 'CORE'
    const [groupedData, setGroupedData] = useState([]);
    const [willingCounts, setWillingCounts] = useState({ core_willing_count: 0, both_willing_count: 0 });

    // Crop Modal States
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [pendingUpload, setPendingUpload] = useState(null);
    const fileInputRefs = useRef({});

    const fetchCounts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await placementCountService.getPlacementCounts();
            if (response.success) {
                setData(response.data || []);
                if (response.willingCounts) {
                    console.log('[DEBUG] Willing Counts:', response.willingCounts);
                    setWillingCounts(response.willingCounts);
                    
                    // Auto-select enabled tabs
                    const enabled = [];
                    if (Number(response.willingCounts.both_willing_count) > 0) enabled.push('IT');
                    if (Number(response.willingCounts.core_willing_count) > 0) enabled.push('CORE');
                    
                    // If current selection is empty or invalid, reset to enabled
                    setSelectedTabs(prev => {
                        const next = prev.filter(t => enabled.includes(t));
                        return next.length > 0 ? next : (enabled.length > 0 ? [enabled[0]] : []);
                    });
                }
            }
        } catch (error) {
            toast.error('Failed to fetch placement counts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    useEffect(() => {
        // Group data by campus and base department
        if (!Array.isArray(data)) return;
        
        const groups = data.reduce((acc, row) => {
            const baseDept = row.department.split(' - ')[0].trim();
            const key = `${row.campus}_${baseDept}`;
            if (!acc[key]) {
                acc[key] = {
                    campus: row.campus,
                    baseDepartment: baseDept,
                    it: null,
                    core: null,
                    signature: row.signature
                };
            }
            if (row.department.includes(' - IT')) {
                acc[key].it = { ...row };
            } else if (row.department.includes(' - CORE')) {
                acc[key].core = { ...row };
            }
            // Ensure signature is synced from either record if available
            if (row.signature) acc[key].signature = row.signature;
            return acc;
        }, {});

        setGroupedData(Object.values(groups));
    }, [data]);

    const handleTabToggle = (tab) => {
        setSelectedTabs(prev => {
            if (prev.includes(tab)) {
                if (prev.length === 1) return prev; // Must have at least one
                return prev.filter(t => t !== tab);
            }
            return [...prev, tab].sort();
        });
    };

    const handleInputChange = (groupKey, type, field, value) => {
        const newData = [...data];
        const index = newData.findIndex(r => r.id === (type === 'it' ? groupKey.it.id : groupKey.core.id));
        if (index !== -1) {
            newData[index][field] = value;
            setData(newData);
        }
    };

    const handleSave = async (id, recordData) => {
        try {
            setSaving(prev => ({ ...prev, [id]: true }));
            const response = await placementCountService.updatePlacementCounts(id, recordData);
            if (response.success) {
                toast.success(`${recordData.department} updated successfully`);
                fetchCounts();
            }
        } catch (error) {
            toast.error(`Error updating ${recordData.department}`);
        } finally {
            setSaving(prev => ({ ...prev, [id]: false }));
        }
    };

    const validateImage = (file) => {
        return new Promise((resolve, reject) => {
            // Check size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                reject('File size exceeds 2MB limit');
                return;
            }

            // Check resolution
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                if (img.width < 900 || img.height < 300) {
                    reject('Minimum resolution required: 900 × 300 pixels');
                } else {
                    resolve(true);
                }
            };
            img.onerror = () => reject('Invalid image file');
        });
    };

    const handleFileSelect = async (e, campus, department) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await validateImage(file);
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                setPendingUpload({ campus, department });
                setCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : (error.message || 'An error occurred'));
            e.target.value = null; // Clear input
        }
    };

    const onCropComplete = async (croppedBlob) => {
        if (!pendingUpload || !croppedBlob) return;

        const { campus, department } = pendingUpload;
        const key = `${campus}_${department.split(' - ')[0].trim()}`;
        
        try {
            setUploading(prev => ({ ...prev, [key]: true }));
            const formData = new FormData();
            formData.append('campus', campus);
            formData.append('department', department);
            // Convert blob to file
            const file = new File([croppedBlob], 'signature.png', { type: 'image/png' });
            formData.append('signature', file);

            const response = await placementCountService.uploadSignature(formData);
            if (response.success) {
                toast.success('Signature uploaded successfully');
                fetchCounts();
            }
        } catch (error) {
            toast.error(typeof error === 'string' ? error : (error.message || 'Failed to upload signature'));
        } finally {
            setUploading(prev => ({ ...prev, [key]: false }));
            setPendingUpload(null);
            setSelectedImage(null);
            setCropModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading placement data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <CheckCircle2 className="text-primary-600 w-7 h-7" />
                        Placement Count Management
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and update department-wise placement statistics.</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
                    {['IT', 'CORE'].map(tab => {
                        const isDisabled = tab === 'IT' 
                            ? Number(willingCounts.both_willing_count) === 0 
                            : Number(willingCounts.core_willing_count) === 0;
                        return (
                            <button
                                key={tab}
                                onClick={() => !isDisabled && handleTabToggle(tab)}
                                disabled={isDisabled}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                    isDisabled 
                                        ? 'opacity-30 cursor-not-allowed grayscale' 
                                        : selectedTabs.includes(tab)
                                            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                                title={isDisabled ? `${tab} is not applicable for this department` : ''}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Campus</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Department</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 min-w-[600px]">Stats</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-center">Signature</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {groupedData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        No departments found for the selection.
                                    </td>
                                </tr>
                            ) : (
                                groupedData.map((group) => {
                                    const hasIT = group.it && selectedTabs.includes('IT');
                                    const hasCORE = group.core && selectedTabs.includes('CORE');

                                    if (!hasIT && !hasCORE) return null;

                                    return (
                                        <tr key={`${group.campus}_${group.baseDepartment}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150 align-top">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-slate-900 dark:text-white">{group.campus}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{group.baseDepartment}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 space-y-4">
                                                {/* IT Section */}
                                                {hasIT && (
                                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">IT Specialization</span>
                                                            <button 
                                                                onClick={() => handleSave(group.it.id, group.it)}
                                                                disabled={saving[group.it.id]}
                                                                className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                            >
                                                                {saving[group.it.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                Update IT
                                                            </button>
                                                        </div>
                                                        <StatsGrid record={group.it} onChange={(field, val) => handleInputChange(group, 'it', field, val)} />
                                                    </div>
                                                )}

                                                {/* CORE Section */}
                                                {hasCORE && (
                                                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">CORE Specialization</span>
                                                            <button 
                                                                onClick={() => handleSave(group.core.id, group.core)}
                                                                disabled={saving[group.core.id]}
                                                                className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                            >
                                                                {saving[group.core.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                Update CORE
                                                            </button>
                                                        </div>
                                                        <StatsGrid record={group.core} onChange={(field, val) => handleInputChange(group, 'core', field, val)} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    {group.signature ? (
                                                        <div className="relative group">
                                                            <div className="w-[180px] h-[60px] border border-[#ccc] bg-white rounded overflow-hidden flex items-center justify-center">
                                                                <img 
                                                                    src={`${BASE_URL}${group.signature}`} 
                                                                    alt="Signature" 
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => { e.target.src = 'https://placehold.co/600x200?text=No+Image'; }}
                                                                />
                                                            </div>
                                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                                                <ImageIcon className="text-white w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-[180px] h-[60px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded flex items-center justify-center text-slate-400 text-[10px] bg-slate-50/50 dark:bg-slate-800/30">
                                                            No Signature
                                                        </div>
                                                    )}
                                                    
                                                    <label className={`
                                                        flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all
                                                        ${uploading[`${group.campus}_${group.baseDepartment}`] 
                                                            ? 'bg-slate-100 text-slate-400 cursor-wait' 
                                                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400'}
                                                    `}>
                                                        {uploading[`${group.campus}_${group.baseDepartment}`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                        Upload Signature
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/png, image/jpeg, image/jpg"
                                                            onChange={(e) => handleFileSelect(e, group.campus, group.it?.department || group.core?.department)}
                                                            disabled={uploading[`${group.campus}_${group.baseDepartment}`]}
                                                        />
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Signature Crop Modal */}
            <SignatureCropModal
                isOpen={cropModalOpen}
                onClose={() => {
                    setCropModalOpen(false);
                    setSelectedImage(null);
                }}
                image={selectedImage}
                onCropComplete={onCropComplete}
            />
        </div>
    );
};

const StatsGrid = ({ record, onChange }) => {
    const fields = ['7l', '6l', '5l', '4l', '3l', '2l', '1l'];
    
    return (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {fields.map(field => (
                <div key={field}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{field}</label>
                    <input
                        type="number"
                        value={record[field] || 0}
                        onChange={(e) => onChange(field, parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>
            ))}
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Avg</label>
                <input
                    type="number"
                    step="0.01"
                    value={record.average || 0}
                    onChange={(e) => onChange('average', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-primary-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
            </div>
        </div>
    );
};

export default PlacementCount;
