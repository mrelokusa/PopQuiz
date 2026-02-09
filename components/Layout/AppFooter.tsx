import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 text-center pointer-events-none flex justify-center items-end px-6">
      <span className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-neo-sm transform rotate-2 inline-block">
        Made with PopQuiz
      </span>
    </footer>
  );
};

export default AppFooter;