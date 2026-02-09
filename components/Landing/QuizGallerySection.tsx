import React from 'react';
import { RefreshCw, Database, TrendingUp, Play, Ghost } from 'lucide-react';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { seedDatabase } from '../../services/storageService';
import { AppState } from '../../types';

const QuizGallery: React.FC = () => {
  const { quizzes, loading, fetchQuizzes, setActiveQuiz, setView } = useApp();

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setView(AppState.PLAY);
  };

  const handleRefresh = () => {
    fetchQuizzes('global');
  };

  if (loading.isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin text-neo-periwinkle mb-2">
          <RefreshCw className="w-8 h-8"/>
        </div>
        <p className="font-bold text-gray-400">
          {loading.message || 'Loading Quizzes...'}
        </p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12 opacity-50 space-y-2">
        <div className="inline-block bg-neo-paper p-4 rounded-full border-2 border-black">
          <Ghost className="w-8 h-8"/>
        </div>
        <p className="font-bold text-gray-500">It's quiet in here...</p>
        <p className="text-sm">Click the database icon above to seed demo data.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {quizzes.map(quiz => (
        <article 
          key={quiz.id} 
          onClick={() => handleStartQuiz(quiz)} 
          className="cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleStartQuiz(quiz);
            }
          }}
          aria-label={`Start quiz: ${quiz.title}`}
        >
          <NeoCard className="h-full flex flex-col justify-between hover:bg-neo-paper transition-colors relative overflow-hidden">
            <div 
              className={`absolute top-0 right-0 w-16 h-16 ${quiz.outcomes[0]?.colorClass || 'bg-gray-200'} border-l-2 border-b-2 border-black rounded-bl-3xl z-0 group-hover:scale-125 transition-transform`}
            />
            
            <div className="relative z-10 p-4">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black transform -rotate-1 group-hover:rotate-0 transition-transform">
                  <TrendingUp className="w-3 h-3 text-neo-coral" />
                  {quiz.plays.toLocaleString()} plays
                </span>
              </div>

              <h3 className="text-xl font-black font-serif italic mb-2 leading-tight pr-12">
                {quiz.title}
              </h3>
              <p className="text-sm font-medium text-gray-600 line-clamp-2">
                {quiz.description}
              </p>
              <p className="text-xs font-mono mt-2 opacity-50">
                By {quiz.author}
              </p>
            </div>
            
            <div className="relative z-10 px-4 pb-4 flex items-center justify-between mt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center text-xs font-bold">
                  You
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-black bg-neo-coral flex items-center justify-center text-xs">
                  A
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-black bg-neo-mint flex items-center justify-center text-xs">
                  B
                </div>
              </div>
              <NeoButton variant="icon" icon={Play} className="rounded-full" />
            </div>
          </NeoCard>
        </article>
      ))}
    </div>
  );
};

const QuizGallerySection: React.FC = () => {
  return (
    <section className="pt-8">
      <header className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-black uppercase tracking-widest text-sm bg-black text-white px-2 py-1 transform -rotate-1">
          Trending Globally
        </h2>
        <div className="flex gap-2">
          <QuizGallerySection.RefreshButton />
          <QuizGallerySection.SeedButton />
        </div>
      </header>
      
      <QuizGallery />
    </section>
  );
};

// Sub-components
const RefreshButton: React.FC = () => {
  const { fetchQuizzes } = useApp();
  
  return (
    <button 
      onClick={() => fetchQuizzes('global')} 
      className="p-1 hover:bg-black hover:text-white rounded transition-colors"
      aria-label="Refresh quizzes"
    >
      <RefreshCw className="w-4 h-4"/>
    </button>
  );
};

const SeedButton: React.FC = () => {
  const { addToast } = useToast();
  
  const handleSeed = async () => {
    try {
      await seedDatabase();
      addToast("Database seeded successfully with demo quizzes!", 'success');
    } catch (error: any) {
      addToast(error.message || "Failed to seed database", 'error');
    }
  };
  
  return (
    <button 
      onClick={handleSeed} 
      className="p-1 hover:bg-black hover:text-white rounded transition-colors" 
      title="Seed Demo Data"
      aria-label="Seed demo data"
    >
      <Database className="w-4 h-4"/>
    </button>
  );
};

QuizGallerySection.RefreshButton = RefreshButton;
QuizGallerySection.SeedButton = SeedButton;

export default QuizGallerySection;