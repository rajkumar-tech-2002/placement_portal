import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as authLogin } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle, ShieldCheck, ArrowRight, UserPlus, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import loginImg from '../../assets/login_img_2.png';

const Login = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('STUDENT');
    const [selectedCampus, setSelectedCampus] = useState('NEC'); // NEC, NCT

    const navigate = useNavigate();
    const { user, login } = useAuth();

    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') navigate('/admin/dashboard');
            else if (user.role === 'COORDINATOR') navigate('/coordinator/dashboard');
            else navigate('/student/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authLogin(userId, password, selectedRole === 'ADMIN' ? 'Both' : selectedCampus);
            
            // Check if the actual role matches the selected role
            if (data.user.role !== selectedRole) {
                setError(`Invalid credentials for ${selectedRole} role.`);
                setLoading(false);
                return;
            }

            login(data.user);

            if (data.user.role === 'ADMIN') navigate('/admin/dashboard');
            else if (data.user.role === 'COORDINATOR') navigate('/coordinator/dashboard');
            else navigate('/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden animate-in fade-in duration-700">
            {/* Left Side: Dynamic Image Section */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-primary-600">
                <img
                    src={loginImg}
                    alt="Success"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 scale-105 animate-pulse-slow"
                />
                <img
                    src={loginImg}
                    alt="Placement"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Branding Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-950/20 to-transparent"></div>
                
                {/* <div className="absolute bottom-20 left-20 z-10 max-w-xl">
                    <div className="flex items-center gap-3 mb-8 bg-white/10 w-fit px-6 py-2 rounded-full backdrop-blur-md border border-white/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                        <span className="text-white font-bold tracking-widest text-sm uppercase">Secure Portal Access</span>
                    </div>
                    <h2 className="text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6 drop-shadow-2xl">
                        Your Success <br /> Starts <span className="text-primary-400">Here.</span>
                    </h2>
                    <p className="text-xl text-white/80 font-medium max-w-md leading-relaxed">
                        Access the most comprehensive placement platform designed to bridge students and industry leaders.
                    </p>
                </div> */}

                {/* Decorative Elements */}
                {/* <div className="absolute top-20 right-20 w-32 h-32 border-4 border-white/10 rounded-full"></div>
                <div className="absolute top-40 right-40 w-16 h-16 border-4 border-white/5 rounded-full"></div> */}
            </div>

            {/* Right Side: Login Panel */}
            <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 h-screen relative bg-white dark:bg-slate-900 shadow-2xl z-20">
                <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
                    
                    {/* Header Section */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-50 dark:bg-primary-900/20 mb-8 border border-primary-100 dark:border-primary-800">
                            <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Login</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">Welcome back to the Placement Portal</p>
                    </div>

                    {/* Error Feedback */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-r-2xl flex items-center text-xs font-bold animate-shake">
                            <AlertCircle className="w-4 h-4 mr-3 flex-shrink-0 text-red-500" />
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Select Role</label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            {['STUDENT', 'COORDINATOR', 'ADMIN'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setSelectedRole(role)}
                                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        selectedRole === role
                                            ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm ring-1 ring-slate-100 dark:ring-slate-600'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
 
                    {/* Campus Selection - Show for Student/Coordinator */}
                    {selectedRole !== 'ADMIN' && (
                        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Select Campus</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                                {['NEC', 'NCT'].map((campus) => (
                                    <button
                                        key={campus}
                                        type="button"
                                        onClick={() => setSelectedCampus(campus)}
                                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            selectedCampus === campus
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        {campus}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-primary-600 transition-colors">User ID</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold text-slate-900 dark:text-white"
                                    placeholder="Enter your User ID"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-focus-within:text-primary-600 transition-colors">Access Password</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500/40 transition-all outline-none text-sm font-semibold text-slate-900 dark:text-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-black rounded-[2rem] transition-all flex items-center justify-center shadow-xl shadow-primary-600/30 text-lg group overflow-hidden relative"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="relative z-10 uppercase tracking-[0.1em]">Login</span>
                                        <div className="absolute right-0 top-0 h-full w-14 flex items-center justify-center bg-white/10 group-hover:w-full transition-all duration-300">
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer / Contact Link */}
                    <div className="pt-10 text-center space-y-4 opacity-50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Contact Admin for Account Access
                        </p>
                    </div>
                </div>

                {/* Trust Badges / Footer */}
                {/* <div className="absolute bottom-10 left-0 right-0 px-10 hidden sm:block">
                    <div className="flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-400 rounded-sm"></div><span className="text-[9px] font-bold">V-SECURE</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-400 rounded-sm"></div><span className="text-[9px] font-bold">ISO-27001</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-400 rounded-sm"></div><span className="text-[9px] font-bold">CLOUD-SYNC</span></div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
