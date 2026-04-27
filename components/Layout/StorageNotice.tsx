import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { AppState } from '../../types';

const STORAGE_KEY = 'popquiz.storage_notice_dismissed';

// Small dismissible banner explaining we use browser storage for the auth
// session. We don't use tracking cookies, so this is informational rather than
// a consent gate. Lives outside the legal pages so EU visitors see it without
// having to dig.
const StorageNotice: React.FC = () => {
  const { setView } = useApp();
  // Initialize from storage synchronously so we don't trigger a follow-up
  // render just to flip visibility.
  const [visible, setVisible] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore — banner just reappears next visit.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black text-white border-t-2 border-neo-lemon p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <p className="text-xs font-bold leading-snug">
        We store your sign-in session in your browser's local storage. We don't use tracking cookies or third-party analytics.{' '}
        <button
          onClick={() => { dismiss(); setView(AppState.PRIVACY); }}
          className="underline decoration-neo-lemon"
        >
          Read the privacy policy
        </button>.
      </p>
      <button
        onClick={dismiss}
        className="bg-neo-lemon text-black border-2 border-white px-3 py-1 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex-shrink-0"
      >
        Got it
      </button>
    </div>
  );
};

export default StorageNotice;
