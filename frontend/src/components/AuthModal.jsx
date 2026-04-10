import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const AuthModal = ({ children }) => {
  const navigate = useNavigate();

  const handleClose = (e) => {
    if (e.target === e.currentTarget || e.type === 'click') {
      navigate('/');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300 ease-in-out"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 fade-in duration-300 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-text-secondary hover:text-text hover:bg-bg p-2 rounded-full transition-all z-[110]"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default AuthModal;
