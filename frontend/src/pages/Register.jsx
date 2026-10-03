import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const Register = () => {
    const { register: registerForm, handleSubmit, formState: { errors } } = useForm();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setAuthError('');
        const result = await register(data.username, data.email, data.password);
        setIsLoading(false);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setAuthError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent relative overflow-hidden">
            {/* Background Decorations removed for a cleaner look */}

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-panel p-8 rounded-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-slate-600 dark:text-slate-400">Join CodeMentor AI today</p>
                    </div>

                    {authError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 text-sm">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input 
                                    type="text" 
                                    {...registerForm("username", { 
                                        required: "Username is required",
                                        minLength: { value: 3, message: "Minimum 3 characters" }
                                    })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="johndoe"
                                />
                            </div>
                            {errors.username && <span className="text-red-400 text-xs mt-1 block">{errors.username.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input 
                                    type="email" 
                                    {...registerForm("email", { 
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input 
                                    type="password" 
                                    {...registerForm("password", { 
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Minimum 6 characters" }
                                    })}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center mt-4"
                        >
                            {isLoading ? 'Creating account...' : (
                                <>
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Sign Up
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
