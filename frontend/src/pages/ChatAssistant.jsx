import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Coding Mentor. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        // Ensure page opens at the very top
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        // Only scroll messages internally when there is a new conversation message
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:8080/api/chat`, 
                { message: userMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setMessages(prev => [...prev, { role: 'assistant', content: res.data }]);
        } catch (error) {
            toast.error("Failed to send message.");
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-6 px-4 sm:px-8 bg-transparent flex flex-col items-center justify-start min-h-[calc(100vh-140px)]">
            <div className="max-w-4xl mx-auto w-full h-[75vh] min-h-[500px] flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                
                {/* Header */}
                <div className="glass-panel p-4 border-b border-slate-700/50 flex items-center gap-3">
                    <div className="p-2 bg-primary-500/20 rounded-lg">
                        <Bot className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Mentor Chat</h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Powered by Groq AI (Llama 3.1)</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-600' : 'bg-slate-700'}`}>
                                {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                            </div>
                            
                            <div className={`max-w-[75%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-500/20' : 'glass-panel border-slate-300 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 rounded-tl-none'}`}>
                                {msg.role === 'user' ? (
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-200">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-slate-900 dark:text-white" />
                            </div>
                            <div className="glass-panel border border-slate-700/50 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-700/50">
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your code..."
                            className="flex-1 bg-transparent border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-6 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    );
};

export default ChatAssistant;
