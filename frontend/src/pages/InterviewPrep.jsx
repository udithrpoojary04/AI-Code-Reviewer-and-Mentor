import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { apiPrivate } from '../api/axios';
import { toast } from 'react-toastify';

const InterviewPrep = () => {
    const [language, setLanguage] = useState('Java');
    const [skillLevel, setSkillLevel] = useState('Junior');
    const [type, setType] = useState('MCQ');
    
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    
    // For MCQ grading
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const generateInterview = async () => {
        setLoading(true);
        setQuestions([]);
        setSelectedAnswers({});
        setShowResults(false);
        try {
            const res = await apiPrivate.get('http://localhost:8080/api/interview/generate', {
                params: { language, skillLevel, type }
            });
            // Sometimes AI returns text wrapped in ```json
            let data = res.data;
            if (typeof data === 'string') {
                if (data.startsWith('```json')) data = data.substring(7);
                if (data.endsWith('```')) data = data.substring(0, data.length - 3);
                data = JSON.parse(data.trim());
            }
            if(Array.isArray(data)) {
                setQuestions(data);
            } else {
                toast.error("Failed to parse interview questions.");
            }
        } catch (error) {
            console.error("Interview generation error:", error);
            if (error.response?.data?.message) {
                toast.error("Error: " + error.response.data.message);
            } else {
                toast.error("Failed to generate interview. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (qIdx, option) => {
        if (showResults) return;
        setSelectedAnswers({ ...selectedAnswers, [qIdx]: option });
    };

    const submitQuiz = () => {
        setShowResults(true);
    };

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-indigo-500" /> Mock Interview Generator
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Generate AI-powered interviews based on your stack and experience.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl mb-8 flex gap-4 items-end flex-wrap">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Language / Topic</label>
                        <input 
                            type="text" 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white shadow-sm transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Skill Level</label>
                        <select 
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(e.target.value)}
                            className="w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white shadow-sm transition-all"
                        >
                            <option>Junior</option>
                            <option>Mid-Level</option>
                            <option>Senior</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Interview Type</label>
                        <select 
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white shadow-sm transition-all"
                        >
                            <option value="MCQ">Multiple Choice</option>
                            <option value="CODING">Coding / System Design</option>
                        </select>
                    </div>
                    <button 
                        onClick={generateInterview}
                        disabled={loading}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20 h-[46px]"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                        Generate
                    </button>
                </div>

                {questions.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={idx} className="glass-panel p-6 rounded-2xl border-slate-700/50">
                                <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-4">
                                    {idx + 1}. {q.question}
                                </h3>
                                
                                {q.type === 'MCQ' && q.options && q.options.length > 0 ? (
                                    <div className="space-y-2 mb-4">
                                        {q.options.map((opt, optIdx) => {
                                            const isSelected = selectedAnswers[idx] === opt;
                                            const isCorrect = showResults && opt === q.answer;
                                            const isWrong = showResults && isSelected && opt !== q.answer;
                                            
                                            let btnClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 shadow-sm ";
                                            if (isCorrect) btnClass += "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-emerald-500/10";
                                            else if (isWrong) btnClass += "bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-300 shadow-rose-500/10";
                                            else if (isSelected) btnClass += "bg-primary-500/10 border-primary-500 text-primary-800 dark:text-primary-300 shadow-primary-500/10";
                                            else btnClass += "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:shadow-md text-slate-700 dark:text-slate-300";
                                            
                                            return (
                                                <button 
                                                    key={optIdx} 
                                                    onClick={() => handleSelectOption(idx, opt)}
                                                    className={btnClass}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">{opt}</span>
                                                        {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                                        {isWrong && <XCircle className="h-5 w-5 text-rose-500" />}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <p className="text-indigo-400 italic mb-2">Think about your answer, then review the expected output below.</p>
                                    </div>
                                )}

                                {(showResults || q.type !== 'MCQ') && (
                                    <div className="mt-6 p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="font-bold text-slate-900 dark:text-white mb-2">Answer:</p>
                                        <p className="text-emerald-600 dark:text-emerald-400 mb-4 font-medium">{q.answer}</p>
                                        <p className="font-bold text-slate-900 dark:text-white mb-2">Explanation:</p>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {type === 'MCQ' && !showResults && (
                            <div className="flex justify-end">
                                <button 
                                    onClick={submitQuiz}
                                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg"
                                >
                                    Submit Quiz
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default InterviewPrep;
