import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Code, Activity, Search, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
            setError(false);
        } catch (err) {
            setError(true);
            if (err.response && err.response.status === 403) {
                toast.error("Access Denied. You are not an admin.");
            } else {
                toast.error("Failed to fetch admin stats.");
            }
        } finally {
            setLoading(false);
        }
    };

    const promoteMe = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/admin/promote-me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(res.data);
            // In a real app, you'd force logout here
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }, 3000);
        } catch (err) {
            toast.error("Failed to promote.");
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-8">
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border-red-500/30">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">You need Admin privileges to view this page.</p>
                    <button 
                        onClick={promoteMe}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold w-full transition-all shadow-md shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
                    >
                        Click here to become Admin (Dev Only)
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl font-medium w-full transition-all cursor-pointer"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <Shield className="h-8 w-8 text-rose-500" /> Admin Control Panel
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">System overview and management.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary-500/20 rounded-xl">
                                <Users className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalUsers}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Total Registered Users</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <Code className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalReviews}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Total Code Reviews Processed</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-2xl border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Activity className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">99.9%</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">System Uptime</p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-2xl border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-500/20 rounded-xl">
                                <Search className="h-6 w-6 text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Active</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Groq API Status</p>
                    </motion.div>
                </div>

                {/* Additional Admin Features can be built here in the future */}
                <div className="glass-panel p-6 rounded-2xl border-slate-700/50">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity Logs</h3>
                    <p className="text-slate-600 dark:text-slate-400">Activity logging will be implemented in Phase 7.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
