import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Shield, 
    Bookmark, 
    Code, 
    BookOpen, 
    Map, 
    LogOut, 
    Calendar, 
    CheckCircle2, 
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userInitial = (user?.username || user?.email || 'U').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2.5">
                        <User className="h-8 w-8 text-primary-600 dark:text-primary-400" /> User Profile
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage your developer credentials, permissions, and workspace preferences.
                    </p>
                </div>

                {/* Main Profile Info Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-primary-500/25 shrink-0">
                            {userInitial}
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {user?.username || 'Developer'}
                                </h2>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider self-center sm:self-auto ${
                                    user?.role === 'ADMIN' 
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                                        : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
                                }`}>
                                    <Shield className="h-3 w-3" />
                                    {user?.role === 'ADMIN' ? 'Administrator' : 'Standard Developer'}
                                </span>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 text-sm">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {user?.email || 'No email registered'}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Account Active
                                </span>
                                <span className="flex items-center gap-1">
                                    <Sparkles className="h-3.5 w-3.5 text-primary-500" /> AI Mentor Enabled
                                </span>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className="shrink-0">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/50"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Workspace Shortcuts */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Workspace Navigation</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/code-review')}
                            className="glass-panel p-5 rounded-xl border border-white/20 dark:border-slate-700/50 text-left hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-lg bg-primary-600/10 text-primary-600 dark:text-primary-400">
                                    <Code className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Code Review</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit snippets for instant AI feedback.</p>
                        </button>

                        <button
                            onClick={() => navigate('/bookmarks')}
                            className="glass-panel p-5 rounded-xl border border-white/20 dark:border-slate-700/50 text-left hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-lg bg-primary-600/10 text-primary-600 dark:text-primary-400">
                                    <Bookmark className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Saved Bookmarks</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View your saved reviews and guides.</p>
                        </button>

                        <button
                            onClick={() => navigate('/interview')}
                            className="glass-panel p-5 rounded-xl border border-white/20 dark:border-slate-700/50 text-left hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-lg bg-primary-600/10 text-primary-600 dark:text-primary-400">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Interview Prep</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Simulate AI-driven technical interviews.</p>
                        </button>

                        <button
                            onClick={() => navigate('/roadmap')}
                            className="glass-panel p-5 rounded-xl border border-white/20 dark:border-slate-700/50 text-left hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-lg bg-primary-600/10 text-primary-600 dark:text-primary-400">
                                    <Map className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Skill Roadmap</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review your customized learning pathway.</p>
                        </button>

                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="glass-panel p-5 rounded-xl border border-purple-500/30 text-left hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Admin Panel</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">System metrics and user management.</p>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
