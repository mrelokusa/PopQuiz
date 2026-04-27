import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { AppState } from '../../types';
import NeoButton from '../ui/NeoButton';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, lastUpdated, children }) => {
  const { setView } = useApp();

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in">
      <NeoButton
        onClick={() => setView(AppState.LANDING)}
        variant="secondary"
        colorClass="bg-white"
        icon={ArrowLeft}
        label="Back to Feed"
        className="mb-6"
      />

      <div className="bg-yellow-100 border-2 border-black rounded-xl p-3 mb-6 text-xs font-bold">
        Placeholder text — replace with reviewed legal copy before going live.
      </div>

      <h1 className="text-4xl font-serif font-black italic mb-2">{title}</h1>
      <p className="text-xs font-mono text-gray-500 uppercase mb-8">
        Last updated: {lastUpdated}
      </p>

      <article className="prose prose-sm max-w-none space-y-4 font-sans">
        {children}
      </article>
    </div>
  );
};

export default LegalLayout;
