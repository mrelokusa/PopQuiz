import React from 'react';
import LoudCandyLogo from '../ui/LoudCandyLogo';
import { useApp } from '../../contexts/AppContext';
import { AppState } from '../../types';

const AppFooter: React.FC = () => {
  const { setView } = useApp();

  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none flex justify-between items-end px-6">
      <div className="flex items-end gap-2 pointer-events-auto">
        <span className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-neo-sm transform rotate-2 inline-block">
          Made with PopQuiz
        </span>
        <button
          onClick={() => setView(AppState.TERMS)}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black underline decoration-dotted"
        >
          Terms
        </button>
        <button
          onClick={() => setView(AppState.PRIVACY)}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black underline decoration-dotted"
        >
          Privacy
        </button>
      </div>
      <LoudCandyLogo size="small" />
    </footer>
  );
};

export default AppFooter;
