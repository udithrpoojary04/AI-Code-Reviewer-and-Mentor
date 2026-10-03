import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full glass hover:scale-110 transition-transform shadow-lg flex items-center justify-center bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 backdrop-blur-md"
            aria-label="Toggle Dark Mode"
            title="Toggle Light/Dark Mode"
        >
            {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
                <Moon className="w-6 h-6 text-slate-700" />
            )}
        </button>
    );
};

export default ThemeToggle;
