import React from 'react';
import LoudCandyLogo from '../ui/LoudCandyLogo';

const AppFooter: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none flex justify-between items-end px-6">
      <span className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-neo-sm transform rotate-2 inline-block">
        Made with PopQuiz
      </span>
      <LoudCandyLogo size="small" />
    </footer>
  );
};

export default AppFooter;