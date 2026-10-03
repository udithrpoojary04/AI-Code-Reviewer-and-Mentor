import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { apiPrivate } from '../api/axios';
import { Play, Code, CheckCircle, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CodeReview = () => {
    const [code, setCode] = useState('// Paste your code here\nfunction calculateSum(a, b) {\n  return a + b;\n}');
    const [language, setLanguage] = useState('javascript');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [reviewResult, setReviewResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!code || code.trim() === '') return;
        
        setIsAnalyzing(true);
        setError(null);
        
        try {
            const response = await apiPrivate.post('/reviews/analyze', {
                code,
                language,
                title: `Review - ${new Date().toLocaleString()}`
            });
            
            setReviewResult(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during code analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Code Review</h1>
                        <p className="text-slate-600 dark:text-slate-400">Powered by Groq AI (Llama 3.1)</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-4">
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-primary-500"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="sql">SQL</option>
                        </select>
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-70"
                        >
                            {isAnalyzing ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
                            ) : (
                                <><Play className="w-5 h-5 mr-2" /> Analyze Code</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Editor Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700/50 flex flex-col h-[700px] shadow-xl"
                    >
                        <div className="bg-white/80 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center">
                            <Code className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Source Code</span>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 },
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Results Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel rounded-2xl border border-white/20 dark:border-slate-700/50 flex flex-col h-[700px] overflow-hidden shadow-xl"
                    >
                        <div className="bg-white/80 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center">
                            <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mr-2" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Analysis Results</span>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            {!reviewResult && !isAnalyzing && !error && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <ShieldAlert className="w-16 h-16 mb-4 opacity-50" />
                                    <p>Paste your code and click Analyze to get started.</p>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-primary-400">
                                    <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                                    <p className="text-lg animate-pulse">AI is reviewing your code...</p>
                                </div>
                            )}

                            {reviewResult && !isAnalyzing && (
                                <div className="space-y-6">
                                    {/* Scores */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center shadow-sm hover:-translate-y-1 transition-transform">
                                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Overall</div>
                                            <div className="text-4xl font-bold text-slate-800 dark:text-white">{reviewResult.score}</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center shadow-sm hover:-translate-y-1 transition-transform">
                                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Security</div>
                                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{reviewResult.securityScore}</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center shadow-sm hover:-translate-y-1 transition-transform">
                                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Performance</div>
                                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{reviewResult.performanceScore}</div>
                                        </div>
                                    </div>

                                    {/* AI Feedback */}
                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                            <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-2" />
                                            AI Feedback
                                        </h3>
                                        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700/30 shadow-inner">
                                            {/* In a real app, use react-markdown to render this properly */}
                                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                                {reviewResult.aiSummary}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CodeReview;
