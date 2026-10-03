import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, LayoutDashboard, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Bookmarks = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/user/bookmarks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(response.data);
        } catch (error) {
            toast.error("Failed to load bookmarks");
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (targetId, targetType) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/user/bookmarks/toggle?targetId=${targetId}&targetType=${targetType}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(bookmarks.filter(b => b.targetId !== targetId));
            toast.success("Bookmark removed");
        } catch (error) {
            toast.error("Failed to remove bookmark");
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <Bookmark className="h-8 w-8 text-indigo-500" /> Your Bookmarks
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your saved code reviews and roadmaps.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center border-slate-700/50">
                        <Search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No bookmarks found</h2>
                        <p className="text-slate-600 dark:text-slate-400">You haven't saved any items yet. Bookmark reviews to see them here.</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="mt-6 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarks.map((bookmark, idx) => (
                            <motion.div
                                key={bookmark.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-panel p-7 rounded-2xl border border-white/20 dark:border-slate-700/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                                            {bookmark.targetType}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                            {new Date(bookmark.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 break-all">
                                        ID: {bookmark.targetId.substring(0, 8)}...
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                                        Saved for future reference.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {bookmark.targetType === 'REVIEW' && (
                                        <button 
                                            onClick={() => navigate(`/code-review?id=${bookmark.targetId}`)}
                                            className="flex-1 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-xs shadow-primary-500/20 active:scale-[0.98] text-sm cursor-pointer"
                                        >
                                            View
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => removeBookmark(bookmark.targetId, bookmark.targetType)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                        title="Remove Bookmark"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Bookmarks;
