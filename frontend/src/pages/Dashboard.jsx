import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiPrivate } from '../api/axios';
import { 
    Code, 
    Shield, 
    Activity, 
    GitBranch, 
    Users, 
    Bookmark, 
    BookOpen, 
    Map, 
    MessageSquare, 
    ArrowRight, 
    FolderArchive, 
    Layers,
    LineChart,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsChart from '../components/AnalyticsChart';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Live user data states
    const [reviews, setReviews] = useState([]);
    const [gitHubData, setGitHubData] = useState({ isConnected: false, username: '', repoCount: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    // Extract clean username (avoid raw long email addresses in big heading)
    const rawName = user?.username || user?.email || 'Developer';
    const displayName = rawName.includes('@') ? rawName.split('@')[0] : rawName;

    useEffect(() => {
        let isMounted = true;

        const loadDashboardData = async () => {
            setLoadingStats(true);
            try {
                // 1. Fetch user's genuine review history
                const reviewsRes = await apiPrivate.get('/reviews/history');
                if (isMounted && reviewsRes.data?.data) {
                    setReviews(reviewsRes.data.data);
                }
            } catch (err) {
                console.warn('Could not load review history:', err);
            }

            try {
                // 2. Fetch genuine GitHub connection status and repository count
                const ghStatusRes = await apiPrivate.get('/github/status');
                if (isMounted && ghStatusRes.data?.success) {
                    const ghUser = ghStatusRes.data.message?.replace('Connected as ', '') || '';
                    let count = 0;
                    try {
                        const directGhRes = await fetch(`https://api.github.com/users/${encodeURIComponent(ghUser)}/repos?per_page=100`);
                        if (directGhRes.ok) {
                            const data = await directGhRes.json();
                            count = Array.isArray(data) ? data.length : 0;
                        } else {
                            const ghReposRes = await apiPrivate.get('/github/repos');
                            if (Array.isArray(ghReposRes.data)) {
                                count = ghReposRes.data.length;
                            }
                        }
                    } catch (repoErr) {
                        console.warn('Could not fetch repos count:', repoErr);
                    }
                    setGitHubData({ isConnected: true, username: ghUser, repoCount: count });
                } else if (isMounted) {
                    setGitHubData({ isConnected: false, username: '', repoCount: 0 });
                }
            } catch (ghErr) {
                console.warn('Could not check GitHub status:', ghErr);
            } finally {
                if (isMounted) setLoadingStats(false);
            }
        };

        loadDashboardData();
        return () => { isMounted = false; };
    }, []);

    // Compute genuine metrics from actual user reviews
    const totalReviews = reviews.length;
    const avgScore = totalReviews > 0
        ? Math.round(reviews.reduce((sum, r) => sum + (r.score ?? 0), 0) / totalReviews)
        : null;

    const avgSecurity = totalReviews > 0
        ? Math.round(reviews.reduce((sum, r) => sum + (r.securityScore ?? 0), 0) / totalReviews)
        : null;

    const getQualityGrade = (score) => {
        if (score === null || score === undefined) return '--';
        if (score >= 93) return 'A+';
        if (score >= 88) return 'A';
        if (score >= 83) return 'A-';
        if (score >= 78) return 'B+';
        if (score >= 73) return 'B';
        if (score >= 68) return 'B-';
        if (score >= 60) return 'C';
        return 'Needs Work';
    };

    const stats = [
        { 
            label: 'AI Skill Score', 
            value: loadingStats ? '...' : (avgScore !== null ? `${avgScore}/100` : '--/100'), 
            subtitle: totalReviews > 0 ? `Avg of ${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}` : '0 reviews conducted',
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/10 border-emerald-500/20', 
            icon: Activity,
            path: '/code-review'
        },
        { 
            label: 'Code Quality', 
            value: loadingStats ? '...' : getQualityGrade(avgScore), 
            subtitle: totalReviews > 0 ? (avgScore >= 80 ? 'Optimal standards' : 'Improvements flagged') : 'No evaluations yet',
            color: 'text-primary-500', 
            bg: 'bg-primary-500/10 border-primary-500/20', 
            icon: Code,
            path: '/code-review'
        },
        { 
            label: 'Security Score', 
            value: loadingStats ? '...' : (avgSecurity !== null ? `${avgSecurity}%` : '--%'), 
            subtitle: totalReviews > 0 ? 'AST & vulnerability audits' : 'No audits completed',
            color: 'text-purple-500', 
            bg: 'bg-purple-500/10 border-purple-500/20', 
            icon: Shield,
            path: '/code-review'
        },
        { 
            label: 'GitHub Repos', 
            value: loadingStats ? '...' : (gitHubData.isConnected ? `${gitHubData.repoCount}` : '0'), 
            subtitle: gitHubData.isConnected ? `@${gitHubData.username}` : 'Not connected',
            color: 'text-pink-500', 
            bg: 'bg-pink-500/10 border-pink-500/20', 
            icon: GitBranch,
            path: '/github'
        },
    ];

    const pillars = [
        {
            id: 'code-review',
            badge: 'Core Intelligence',
            title: 'Code Review & Audits',
            description: 'Automated multi-vector code inspection for security vulnerabilities, architectural hygiene, and performance bottlenecks.',
            icon: Code,
            color: 'text-primary-500',
            bg: 'bg-primary-500/10 border-primary-500/20',
            primaryAction: {
                label: 'Start Snippet Review',
                path: '/code-review'
            },
            quickLinks: [
                { label: 'GitHub Repos', path: '/github', icon: GitBranch },
                { label: 'Upload .zip', path: '/upload', icon: FolderArchive }
            ]
        },
        {
            id: 'mentorship',
            badge: 'AI Pair Partner',
            title: 'Mentorship & Growth',
            description: 'Conversational coding assistance, dynamic customized learning curriculums, and interactive mock interview simulations.',
            icon: MessageSquare,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 border-indigo-500/20',
            primaryAction: {
                label: 'Chat with AI Mentor',
                path: '/chat'
            },
            quickLinks: [
                { label: 'Skill Roadmap', path: '/roadmap', icon: Map },
                { label: 'Interview Prep', path: '/interview', icon: BookOpen }
            ]
        },
        {
            id: 'collaboration',
            badge: 'Real-Time Hub',
            title: 'Collaboration & Tools',
            description: 'Multiplayer real-time coding rooms with synchronized Monaco Editor, personal bookmarks, and workspace admin controls.',
            icon: Users,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            primaryAction: {
                label: 'Create Live Collab Room',
                path: `/collab/${uuidv4()}`
            },
            quickLinks: [
                { label: 'Saved Items', path: '/bookmarks', icon: Bookmark },
                ...(user?.role === 'ADMIN' ? [{ label: 'Admin Panel', path: '/admin', icon: Shield }] : [])
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200">
            <main className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Re-designed Clean & Balanced Header Section */}
                <div className="space-y-6 pb-6 border-b border-slate-200/70 dark:border-slate-800/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                AI Engine Online &bull; Groq & Gemini
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                Welcome back, <span className="text-primary-600 dark:text-primary-400">{displayName}</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                Your centralized workspace for code reviews, interview drills, and team collaboration.
                            </p>
                        </div>
                    </div>

                    {/* Full-Width 4-Metric Grid Bar (Live Genuine Metrics) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((s, idx) => (
                            <div 
                                key={idx}
                                onClick={() => navigate(s.path)}
                                className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs hover:border-primary-500/50 dark:hover:border-primary-500/50 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{s.label}</p>
                                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1">{s.value}</p>
                                    {s.subtitle && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{s.subtitle}</p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${s.bg} shrink-0 border group-hover:scale-105 transition-transform`}>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3 Core Workspace Pillars (Full-Width Responsive Grid) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary-500" />
                            Workspace Modules
                        </h2>
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        >
                            <LineChart className="w-4 h-4" />
                            <span>{showAnalytics ? 'Hide Performance Trends' : 'View Performance Trends'}</span>
                            {showAnalytics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pillars.map((pillar) => (
                            <motion.div
                                key={pillar.id}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/40 dark:hover:border-primary-500/40 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`p-3 rounded-xl ${pillar.bg} border`}>
                                            <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                                            {pillar.badge}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                                        {pillar.description}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                                    {/* Primary Action Button */}
                                    <button
                                        onClick={() => navigate(pillar.primaryAction.path)}
                                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-md shadow-primary-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>{pillar.primaryAction.label}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    {/* Quick Sub-Links */}
                                    <div className="flex items-center gap-2 pt-1">
                                        {pillar.quickLinks.map((link, lIdx) => (
                                            <button
                                                key={lIdx}
                                                onClick={() => navigate(link.path)}
                                                className="flex-1 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/50 dark:border-slate-700/40"
                                            >
                                                <link.icon className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{link.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Collapsible Performance Analytics Tray */}
                <AnimatePresence>
                    {showAnalytics && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm mt-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <LineChart className="w-4 h-4 text-primary-500" />
                                            Quality & Security Trajectory
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs">Calculated from recent AST audits and mock interview sessions.</p>
                                    </div>
                                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20 w-max">
                                        Last 30 Days Trend
                                    </span>
                                </div>
                                <div className="h-64 sm:h-72">
                                    <AnalyticsChart reviews={reviews} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
};

export default Dashboard;
