import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Settings, 
    Calendar, 
    Clock, 
    Save, 
    Trash2, 
    AlertCircle, 
    CheckCircle2, 
    Loader2,
    RefreshCcw,
    Activity
} from 'lucide-react';
import api from '../services/api.service';

const SyncSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        sync_day: 'Saturday',
        sync_time: '18:00',
        is_active: true
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sync-settings/leetcode');
            if (response.data) {
                setSettings(response.data);
                setFormData({
                    sync_day: response.data.sync_day,
                    sync_time: response.data.sync_time.substring(0, 5),
                    is_active: response.data.is_active === 1 || response.data.is_active === true
                });
            } else {
                setSettings(null);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showFeedback('error', 'Failed to load sync settings');
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (settings) {
                // Update
                await api.put('/sync-settings/leetcode', formData);
                showFeedback('success', 'Sync settings updated successfully');
            } else {
                // Create
                await api.post('/sync-settings', {
                    module_name: 'leetcode',
                    ...formData
                });
                showFeedback('success', 'Sync settings created successfully');
            }
            fetchSettings();
        } catch (error) {
            showFeedback('error', error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete these sync settings? This will stop automated synchronization.')) return;
        
        try {
            await api.delete('/sync-settings/leetcode');
            showFeedback('success', 'Sync settings deleted');
            setSettings(null);
            setFormData({
                sync_day: 'Saturday',
                sync_time: '18:00',
                is_active: true
            });
        } catch (error) {
            showFeedback('error', 'Failed to delete settings');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600">
                        <Settings className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">LeetCode Sync Settings</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Configure automated weekly data synchronization for LeetCode profiles.</p>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-center justify-between ${settings ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50' : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/50'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${settings ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {settings ? <Activity className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">
                            {settings ? 'Automated Sync Active' : 'Automated Sync Not Configured'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {settings 
                                ? `Currently scheduled every ${settings.sync_day} at ${settings.sync_time.substring(0, 5)}`
                                : 'Please set a day and time to enable weekly automatic synchronization.'}
                        </p>
                    </div>
                </div>
                {settings && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${formData.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                            {formData.is_active ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                )}
            </div>

            {/* Feedback Message */}
            {message.text && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sync Day */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            Sync Day
                        </label>
                        <select
                            value={formData.sync_day}
                            onChange={(e) => setFormData({ ...formData, sync_day: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none"
                        >
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sync Time */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                            <Clock className="w-4 h-4 text-primary-500" />
                            Sync Time
                        </label>
                        <input
                            type="time"
                            value={formData.sync_time}
                            onChange={(e) => setFormData({ ...formData, sync_time: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Toggle Active */}
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-white">Active Status</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Toggle whether the automated sync should run or stay dormant.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={`w-14 h-8 rounded-full transition-all duration-300 relative ${formData.is_active ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.is_active ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-8 py-3.5 font-black flex items-center justify-center gap-3 shadow-lg shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {settings ? 'UPDATE SETTINGS' : 'CREATE SETTINGS'}
                    </button>
                    
                    {settings && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-3.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 transition-all active:scale-95"
                            title="Delete Settings"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </form>

            {/* Note Section */}
            <div className="p-6 bg-slate-900 text-slate-400 rounded-3xl text-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-widest">
                    <RefreshCcw className="w-4 h-4" />
                    How it works
                </div>
                <p>The system automatically refreshes the running schedule every hour. After creating or updating the settings, it may take up to 60 minutes for the new schedule to be active without a server restart.</p>
                <p>Manual sync from the LeetCode dashboard remains available at any time.</p>
            </div>
        </div>
    );
};

export default SyncSettings;
