import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Loader2, CheckCircle2, Circle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Roadmap = () => {
    const navigate = useNavigate();
    const [techStack, setTechStack] = useState('Full Stack Java/React');
    const [loading, setLoading] = useState(false);
    const [milestones, setMilestones] = useState([]);

    const generateRoadmap = async () => {
        setLoading(true);
        setMilestones([]);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/roadmap/generate`, {
                params: { techStack },
                headers: { Authorization: `Bearer ${token}` }
            });
            let data = res.data;
            if (typeof data === 'string') {
                if (data.startsWith('```json')) data = data.substring(7);
                if (data.endsWith('```')) data = data.substring(0, data.length - 3);
                data = JSON.parse(data.trim());
            }
            if(Array.isArray(data)) {
                setMilestones(data);
            } else {
                toast.error("Failed to parse roadmap.");
            }
        } catch (error) {
            toast.error("Failed to generate roadmap. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 p-8 relative">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <Map className="h-8 w-8 text-indigo-500" /> AI Skill Roadmap
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Your personalized learning path based on your Code Review performance.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl mb-8 flex gap-4 items-end flex-wrap">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Target Tech Stack</label>
                        <input 
                            type="text" 
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                            placeholder="e.g., Python Backend, React Native..."
                        />
                    </div>
                    <button 
                        onClick={generateRoadmap}
                        disabled={loading}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                        Generate Roadmap
                    </button>
                </div>

                {milestones.length > 0 && (
                    <div className="relative border-l-2 border-slate-700 ml-4 py-4 space-y-8">
                        {milestones.map((m, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative pl-8"
                            >
                                <div className="absolute -left-[17px] top-1 bg-transparent p-1">
                                    <Circle className="h-6 w-6 text-primary-500 fill-slate-900" />
                                </div>
                                <div className="glass-panel p-6 rounded-2xl border-slate-700/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{m.title}</h3>
                                        <span className="px-3 py-1 bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-semibold whitespace-nowrap">
                                            {m.estimatedDays} Days
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{m.description}</p>
                                    
                                    {m.resources && m.resources.length > 0 && (
                                        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Recommended Resources:</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {m.resources.map((res, rIdx) => (
                                                    <li key={rIdx} className="text-sm text-primary-500 dark:text-primary-300">{res}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Roadmap;
