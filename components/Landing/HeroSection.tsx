import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import NeoButton from '../ui/NeoButton';
import { useApp } from '../../contexts/AppContext';
import { AppState } from '../../types';

const HeroSection: React.FC = () => {
  const { user, setView } = useApp();

  const handleCreateClick = () => {
    if (user) {
      setView(AppState.CREATE);
    } else {
      setView(AppState.AUTH);
    }
  };

  return (
    <header className="text-center space-y-4 pt-8">
      <div className="inline-block relative">
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-neo-lemon border-2 border-black rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-5xl lg:text-7xl font-serif font-black italic tracking-tighter">
          PopQuiz
        </h1>
      </div>
      <p className="font-sans font-bold text-xl text-gray-500">Global Feed</p>
      
      <div className="flex justify-center pt-4">
        <NeoButton 
          onClick={handleCreateClick} 
          className="w-64" 
          colorClass="bg-neo-periwinkle text-white" 
          icon={Plus}
          label="Create New Quiz"
        />
      </div>
      {!user && (
        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">
          Sign in to create & share with friends
        </p>
      )}
    </header>
  );
};

export default HeroSection;