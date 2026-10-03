import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Code, 
    BookOpen, 
    Map, 
    MessageSquare, 
    Bookmark, 
    GitBranch, 
    LogOut, 
    Menu, 
    X,
    Shield,
    User,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const profileDropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setShowProfileCard(false);
        navigate('/login');
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileCard(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null; // Don't show navbar if not logged in

    const navLinks = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Code Review', path: '/code-review', icon: Code },
        { label: 'Interview Prep', path: '/interview', icon: BookOpen },
        { label: 'Roadmap', path: '/roadmap', icon: Map },
        { label: 'AI Chat', path: '/chat', icon: MessageSquare },
        { label: 'Saved', path: '/bookmarks', icon: Bookmark },
        { label: 'GitHub', path: '/github', icon: GitBranch },
    ];

    if (user?.role === 'ADMIN') {
        navLinks.push({ label: 'Admin', path: '/admin', icon: Shield, isAdmin: true });
    }

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    const handleNavClick = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
        setShowProfileCard(false);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    const userInitial = (user?.username || user?.email || 'U').charAt(0).toUpperCase();

    return (
        <nav className="glass-panel sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
            <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 flex-nowrap w-full gap-2 xl:gap-4">
                    {/* Brand Logo */}
                    <div 
                        className="shrink-0 flex items-center space-x-2 cursor-pointer select-none group whitespace-nowrap"
                        onClick={() => handleNavClick('/dashboard')}
                    >
                        <div className="h-8 w-8 xl:h-9 xl:w-9 rounded-xl bg-primary-600/10 dark:bg-primary-500/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            <LayoutDashboard className="h-4 w-4 xl:h-5 xl:w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                            CodeMentor <span className="text-primary-600 dark:text-primary-400">AI</span>
                        </span>
                    </div>

                    {/* Desktop Navigation Links - Single line guaranteed */}
                    <div className="hidden md:flex items-center gap-0.5 xl:gap-1 flex-nowrap whitespace-nowrap min-w-0">
                        {navLinks.map((item) => {
                            const active = isActive(item.path);
                            const Icon = item.icon;
                            const isAdminLink = item.isAdmin;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`flex items-center space-x-1 px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                        active
                                            ? isAdminLink
                                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                                                : 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold shadow-xs'
                                            : isAdminLink
                                                ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-semibold'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                                    }`}
                                >
                                    <Icon className={`h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0 ${
                                        isAdminLink 
                                            ? 'text-purple-500' 
                                            : active 
                                                ? 'text-primary-600 dark:text-primary-400' 
                                                : 'text-slate-400 dark:text-slate-400'
                                    }`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Compact Profile Icon & Quick Actions */}
                    <div className="hidden sm:flex items-center space-x-2 shrink-0 flex-nowrap whitespace-nowrap">
                        {/* Small Profile Icon Button with Popup Card */}
                        <div className="relative shrink-0" ref={profileDropdownRef}>
                            <button 
                                onClick={() => setShowProfileCard(!showProfileCard)}
                                className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs border ${
                                    showProfileCard || isActive('/profile')
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20'
                                        : 'bg-primary-600/10 hover:bg-primary-600/20 text-primary-600 dark:text-primary-400 border-primary-500/25'
                                }`}
                                title="My Profile"
                                aria-label="Open Profile Card"
                            >
                                <User className="h-4 w-4" />
                            </button>

                            {/* Dropdown Profile Card */}
                            <AnimatePresence>
                                {showProfileCard && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 overflow-hidden"
                                    >
                                        {/* Profile Header */}
                                        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-primary-500/20 shrink-0">
                                                {userInitial}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {user?.username || 'Developer'}
                                                    </p>
                                                    {user?.role === 'ADMIN' && (
                                                        <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="py-2 space-y-1">
                                            <button
                                                onClick={() => handleNavClick('/profile')}
                                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center space-x-2.5">
                                                    <User className="h-4 w-4 text-primary-500" />
                                                    <span>View Profile Page</span>
                                                </div>
                                                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                                            </button>

                                            <button
                                                onClick={() => handleNavClick('/bookmarks')}
                                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center space-x-2.5">
                                                    <Bookmark className="h-4 w-4 text-primary-500" />
                                                    <span>Saved Items</span>
                                                </div>
                                                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                                            </button>

                                            {user?.role === 'ADMIN' && (
                                                <button
                                                    onClick={() => handleNavClick('/admin')}
                                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors cursor-pointer group"
                                                >
                                                    <div className="flex items-center space-x-2.5">
                                                        <Shield className="h-4 w-4 text-purple-500" />
                                                        <span>Admin Panel</span>
                                                    </div>
                                                    <ArrowRight className="h-3.5 w-3.5 text-purple-400 group-hover:text-purple-500 transition-colors" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Logout Button */}
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sign Out Quick Button */}
                        <button 
                            onClick={handleLogout}
                            className="p-1.5 xl:p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 shrink-0"
                            title="Sign out of CodeMentor"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Mobile Hamburger & Profile Toggle */}
                    <div className="flex md:hidden items-center space-x-1.5 shrink-0">
                        <button 
                            onClick={() => handleNavClick('/profile')}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 rounded-lg transition-colors cursor-pointer"
                            title="Profile"
                        >
                            <User className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="Toggle Navigation Menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-1 shadow-xl">
                    <button
                        onClick={() => handleNavClick('/profile')}
                        className="w-full py-2 px-3 mb-2 flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/40 dark:border-slate-700/40 text-left cursor-pointer"
                    >
                        <div className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                                {user?.username || user?.email}
                            </span>
                            <span className="text-[10px] text-primary-600 dark:text-primary-400">View Profile &rarr;</span>
                        </div>
                    </button>
                    {navLinks.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                    active
                                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-400'}`} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
