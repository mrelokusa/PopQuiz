import React from 'react';
import { Globe, User, LogOut } from 'lucide-react';
import NeoButton from '../ui/NeoButton';
import { useApp } from '../../contexts/AppContext';
import { AppState } from '../../types';

const AppHeader: React.FC = () => {
  const { user, view, setView, logout } = useApp();

  const handleGlobalFeed = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setView(AppState.LANDING);
  };

  const handleMyHub = () => {
    if (user) {
      setView(AppState.LOCAL);
    } else {
      setView(AppState.AUTH);
    }
  };

  const handleLogoClick = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setView(AppState.LANDING);
  };

  if (view === AppState.AUTH) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-black px-4 py-3 flex justify-between items-center shadow-neo-sm">
      <div
        className="flex items-center gap-2 font-black italic text-xl cursor-pointer hover:text-neo-periwinkle transition-colors"
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleLogoClick();
          }
        }}
      >
        {/* Brand mark — mirrors public/favicon.svg so the wordmark + favicon read as one identity. */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          <rect width="32" height="32" rx="6" fill="#FFEAA7" stroke="#000" strokeWidth="2" />
          <path
            d="M8 12C8 10.8954 8.89543 10 10 10H22C23.1046 10 24 10.8954 24 12V20C24 21.1046 23.1046 22 22 22H10C8.89543 22 8 21.1046 8 20V12Z"
            fill="#FF7675"
            stroke="#000"
            strokeWidth="1.5"
          />
          <circle cx="13" cy="16" r="1.5" fill="#000" />
          <circle cx="19" cy="16" r="1.5" fill="#000" />
          <path d="M11 19C11 19 13 21 16 21C19 21 21 19 21 19" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        PopQuiz
      </div>
      
      <nav className="flex gap-2">
        <button 
          onClick={handleGlobalFeed}
          className={`p-2 rounded-lg border-2 border-black ${
            view === AppState.LANDING ? 'bg-neo-lemon' : 'bg-white hover:bg-gray-100'
          }`}
          title="Global Feed"
          aria-label="Global Feed"
        >
          <Globe className="w-5 h-5" />
        </button>
        
        {user ? (
          <>
            <button 
              onClick={handleMyHub}
              className={`p-2 rounded-lg border-2 border-black ${
                view === AppState.LOCAL ? 'bg-neo-mint' : 'bg-white hover:bg-gray-100'
              }`}
              title="My Hub"
              aria-label="My Hub"
            >
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={logout}
              className="p-2 rounded-lg border-2 border-black bg-white hover:bg-red-100 hover:text-red-500"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <NeoButton
            onClick={() => setView(AppState.AUTH)}
            label="Log In"
            className="px-4 py-2 text-sm"
            colorClass="bg-neo-periwinkle text-white"
          />
        )}
      </nav>
    </header>
  );
};

export default AppHeader;