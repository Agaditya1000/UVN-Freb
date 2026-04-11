import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-border bg-surface hover:bg-bg transition-all duration-200 group flex items-center justify-center shadow-sm"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun size={18} className="text-primary group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={18} className="text-primary group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};

export default ThemeToggle;
