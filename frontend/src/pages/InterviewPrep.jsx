import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Loader2, CheckCircle2, XCircle, Award, 
    RotateCcw, Eye, Code2, Sparkles, Send, Check
} from 'lucide-react';
import { apiPrivate } from '../api/axios';
import { toast } from 'react-toastify';

const InterviewPrep = () => {
    const [language, setLanguage] = useState('Java');
    const [skillLevel, setSkillLevel] = useState('Junior');
    const [type, setType] = useState('MCQ');
    
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    
    // User answers & reveal state
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [codingAnswers, setCodingAnswers] = useState({});
    const [revealedQuestions, setRevealedQuestions] = useState({});
    const [showResults, setShowResults] = useState(false);

    const generateInterview = async () => {
        setLoading(true);
        setQuestions([]);
        setSelectedAnswers({});
        setCodingAnswers({});
        setRevealedQuestions({});
        setShowResults(false);
        try {
            const res = await apiPrivate.get('http://localhost:8080/api/interview/generate', {
                params: { language, skillLevel, type }
            });
            
            let data = res.data;
            if (typeof data === 'string') {
                let cleaned = data.trim();
                if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
                if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
                if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
                data = JSON.parse(cleaned.trim());
            }
            if (Array.isArray(data) && data.length > 0) {
                setQuestions(data);
                toast.success(`Generated ${data.length} interview questions!`);
            } else {
                toast.error("Failed to parse interview questions.");
            }
        } catch (error) {
            console.error("Interview generation error:", error);
            if (error.response?.data?.message) {
                toast.error("Error: " + error.response.data.message);
            } else {
                toast.error("Failed to generate interview. Please check your backend.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (qIdx, option) => {
        if (showResults || revealedQuestions[qIdx]) return;
        setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
    };

    const handleCodingChange = (qIdx, text) => {
        setCodingAnswers(prev => ({ ...prev, [qIdx]: text }));
    };

    const toggleRevealQuestion = (qIdx) => {
        setRevealedQuestions(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
    };

    const submitAllQuiz = () => {
        if (questions.length === 0) return;
        setShowResults(true);
        // Reveal all answers
        const allRevealed = {};
        questions.forEach((_, idx) => {
            allRevealed[idx] = true;
        });
        setRevealedQuestions(allRevealed);
        toast.info("Quiz submitted! Scroll through to review your scores & detailed explanations.");
    };

    const resetQuiz = () => {
        setSelectedAnswers({});
        setCodingAnswers({});
        setRevealedQuestions({});
        setShowResults(false);
    };

    // Calculate score for MCQ questions
    const mcqQuestions = questions.filter(q => q.options && q.options.length > 0);
    const correctCount = mcqQuestions.reduce((acc, q, idx) => {
        const originalIndex = questions.indexOf(q);
        return selectedAnswers[originalIndex] === q.answer ? acc + 1 : acc;
    }, 0);
    const answeredCount = Object.keys(selectedAnswers).length + Object.keys(codingAnswers).filter(k => codingAnswers[k]?.trim()).length;
    const scorePercentage = mcqQuestions.length > 0 ? Math.round((correctCount / mcqQuestions.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-sky-500" /> Mock Interview Generator
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Generate AI-powered interviews, answer interactive questions, and check verified answers with in-depth explanations.
                    </p>
                </div>

                {/* Generator Form */}
                <div className="glass-panel p-6 rounded-2xl mb-8 flex gap-4 items-end flex-wrap shadow-sm">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Language / Topic</label>
                        <input 
                            type="text" 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white shadow-sm transition-all text-sm font-medium"
                            placeholder="e.g. Java, Python, React"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Skill Level</label>
                        <select 
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(e.target.value)}
                            className="w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white shadow-sm transition-all text-sm font-medium"
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
                            className="w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white shadow-sm transition-all text-sm font-medium"
                        >
                            <option value="MCQ">Multiple Choice</option>
                            <option value="CODING">Coding / System Design</option>
                        </select>
                    </div>
                    <button 
                        onClick={generateInterview}
                        disabled={loading}
                        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20 h-[46px]"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                        Generate
                    </button>
                </div>

                {/* Score Summary Banner (When Results are Submitted) */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8 p-6 rounded-2xl glass-panel border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-transparent shadow-lg"
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                                        <Award className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            Interview Evaluation Complete!
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                                            {mcqQuestions.length > 0 ? (
                                                <span>
                                                    You scored <strong className="text-emerald-500 font-bold">{correctCount}</strong> out of <strong className="text-slate-900 dark:text-white">{mcqQuestions.length}</strong> ({scorePercentage}%) in MCQ questions.
                                                </span>
                                            ) : (
                                                <span>Review the model answers and architectural explanations below.</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={resetQuiz}
                                        className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" /> Retake Quiz
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Questions Container */}
                {questions.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        
                        {/* Interactive Quiz Controls Bar */}
                        <div className="glass-panel p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 border border-slate-200 dark:border-slate-800 sticky top-4 z-20 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full border border-sky-500/20">
                                    {language} • {skillLevel}
                                </span>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Progress: <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> answered
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {!showResults && (
                                    <button 
                                        onClick={submitAllQuiz}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
                                    >
                                        <Check className="h-4 w-4" /> Check All Answers / Submit
                                    </button>
                                )}
                                {showResults && (
                                    <button 
                                        onClick={resetQuiz}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        Reset & Hide Answers
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Question Cards List */}
                        {questions.map((q, idx) => {
                            const isMcq = q.options && q.options.length > 0;
                            const isRevealed = showResults || revealedQuestions[idx];
                            const userSelected = selectedAnswers[idx];

                            return (
                                <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm">
                                    {/* Question Title */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white leading-snug">
                                            <span className="text-sky-500 font-bold mr-2">{idx + 1}.</span> 
                                            {q.question}
                                        </h3>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                                            {isMcq ? 'MCQ' : 'Coding'}
                                        </span>
                                    </div>
                                    
                                    {/* MCQ Options Rendering */}
                                    {isMcq ? (
                                        <div className="space-y-2.5 mb-5">
                                            {q.options.map((opt, optIdx) => {
                                                const isSelected = userSelected === opt;
                                                const isCorrectAnswer = opt === q.answer;
                                                
                                                let btnClass = "w-full text-left p-3.5 rounded-xl border transition-all duration-200 text-sm ";
                                                
                                                if (isRevealed) {
                                                    if (isCorrectAnswer) {
                                                        btnClass += "bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/30";
                                                    } else if (isSelected && !isCorrectAnswer) {
                                                        btnClass += "bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-200 font-medium";
                                                    } else {
                                                        btnClass += "bg-white/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60 text-slate-600 dark:text-slate-400";
                                                    }
                                                } else {
                                                    if (isSelected) {
                                                        btnClass += "bg-sky-500/10 border-sky-500 text-sky-900 dark:text-sky-200 font-semibold ring-2 ring-sky-500/20";
                                                    } else {
                                                        btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-800 dark:text-slate-200 hover:bg-sky-50/50 dark:hover:bg-slate-800/80";
                                                    }
                                                }
                                                
                                                return (
                                                    <button 
                                                        key={optIdx} 
                                                        onClick={() => handleSelectOption(idx, opt)}
                                                        disabled={isRevealed}
                                                        className={btnClass}
                                                    >
                                                        <div className="flex justify-between items-center gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="h-6 w-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0 opacity-80">
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                <span className="leading-relaxed">{opt}</span>
                                                            </div>
                                                            {isRevealed && isCorrectAnswer && (
                                                                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Correct
                                                                </span>
                                                            )}
                                                            {isRevealed && isSelected && !isCorrectAnswer && (
                                                                <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-bold shrink-0">
                                                                    <XCircle className="h-5 w-5 text-rose-500" /> Incorrect
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Coding / Open-ended Response Box */
                                        <div className="mb-5">
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                                                <Code2 className="h-3.5 w-3.5" /> Your Code or Architecture Approach:
                                            </label>
                                            <textarea 
                                                value={codingAnswers[idx] || ''}
                                                onChange={(e) => handleCodingChange(idx, e.target.value)}
                                                disabled={isRevealed}
                                                rows={4}
                                                placeholder="// Type your code or solution approach here..."
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                            />
                                        </div>
                                    )}

                                    {/* Action row per question: Check / Reveal Answer Button */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {isMcq ? (
                                                userSelected ? (
                                                    <span>Selected: <strong>{userSelected}</strong></span>
                                                ) : (
                                                    <span className="italic">Click an option to select your answer</span>
                                                )
                                            ) : (
                                                <span>Coding challenge</span>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => toggleRevealQuestion(idx)}
                                            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                                                isRevealed 
                                                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300' 
                                                    : 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100'
                                            }`}
                                        >
                                            <Eye className="h-3.5 w-3.5" /> 
                                            {isRevealed ? 'Hide Explanation' : 'Check Answer & Explanation'}
                                        </button>
                                    </div>

                                    {/* Answer & In-Depth Explanation Box (When revealed or submitted) */}
                                    <AnimatePresence>
                                        {isRevealed && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-5 p-4 md:p-5 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-inner"
                                            >
                                                <div className="mb-3">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                        Official Correct Answer
                                                    </span>
                                                    <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-base mt-1">
                                                        {q.answer}
                                                    </p>
                                                </div>
                                                
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        Technical Explanation & Context
                                                    </span>
                                                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                                                        {q.explanation}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {/* Bottom Submit Banner */}
                        <div className="flex justify-end items-center gap-4 pt-4 pb-12">
                            {!showResults ? (
                                <button 
                                    onClick={submitAllQuiz}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-emerald-600/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
                                >
                                    <Send className="h-5 w-5" /> Submit Interview & Check All Answers
                                </button>
                            ) : (
                                <button 
                                    onClick={resetQuiz}
                                    className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-sky-600/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
                                >
                                    <RotateCcw className="h-5 w-5" /> Retake This Interview
                                </button>
                            )}
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default InterviewPrep;
