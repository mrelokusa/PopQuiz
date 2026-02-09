import React, { useState, useEffect } from 'react';
import { Quiz, Outcome } from '../../types';
import { saveResult, getQuizOutcomeStats } from '../../services/storageService';
import { getCurrentUser } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import NeoButton from '../ui/NeoButton';
import NeoCard from '../ui/NeoCard';
import { RefreshCw, Share2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
  onExit: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onExit }) => {
  const { addToast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<Outcome | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<{
    percent: number;
    isMostCommon: boolean;
    mostCommonTitle: string;
    totalPlays: number;
  } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
        const user = await getCurrentUser();
        setIsAnonymous(!user);
    }
    checkUser();
  }, []);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

  const handleAnswer = (outcomeId: string) => {
    const newScores = { ...scores, [outcomeId]: (scores[outcomeId] || 0) + 1 };
    setScores(newScores);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = async (finalScores: Record<string, number>) => {
    let topOutcomeId = '';
    let maxScore = -1;
    
    // Simple majority win
    Object.entries(finalScores).forEach(([id, score]) => {
      if (score > maxScore) {
        maxScore = score;
        topOutcomeId = id;
      }
    });

    // Fallback if tie or error
    if (!topOutcomeId && quiz.outcomes.length > 0) {
        topOutcomeId = quiz.outcomes[0].id;
    }

    const winner = quiz.outcomes.find(o => o.id === topOutcomeId) || quiz.outcomes[0];
    setResult(winner);
    setFinished(true);

    const user = await getCurrentUser();
    
    // 1. Save Result
    await saveResult(quiz.id, winner.id, user?.id);

    // 2. Fetch Stats
    const rawStats = await getQuizOutcomeStats(quiz.id);
    
    // Calculate stats
    const total = Object.values(rawStats).reduce((a, b) => a + b, 0);
    const myOutcomeCount = rawStats[winner.id] || 0;
    const percent = total > 0 ? Math.round((myOutcomeCount / total) * 100) : 100;

    let mostCommonId = '';
    let maxCount = -1;
    Object.entries(rawStats).forEach(([id, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommonId = id;
        }
    });
    
    const isMostCommon = winner.id === mostCommonId;
    const mostCommonTitle = quiz.outcomes.find(o => o.id === mostCommonId)?.title || 'Unknown';

    setStats({
        percent,
        isMostCommon,
        mostCommonTitle,
        totalPlays: total
    });
  };

  const handleShare = async () => {
      // Create deep link
      const url = `${window.location.origin}?quiz=${quiz.id}`;
      
      try {
          await navigator.clipboard.writeText(url);
          addToast(`Quiz link copied! Share it with friends: ${url}`, 'success');
      } catch (error) {
          // Fallback for browsers that don't support clipboard API
          try {
              // Modern fallback
              const textArea = document.createElement('textarea');
              textArea.value = url;
              textArea.style.position = 'fixed';
              textArea.style.left = '-999999px';
              textArea.style.top = '-999999px';
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              
              const successful = document.execCommand('copy');
              document.body.removeChild(textArea);
              
              if (successful) {
                  addToast(`Quiz link copied! Share it with friends: ${url}`, 'success');
              } else {
                  throw new Error('Copy command failed');
              }
          } catch (fallbackError) {
              // Final fallback - show the link in a toast
              addToast(`Share this quiz link: ${url}`, 'info', 10000);
          }
      }
  };

  // --- Result View ---

  if (finished && result) {
    return (
      <div className="max-w-md mx-auto animate-in zoom-in-95 pb-12">
        <div className="text-center mb-6">
            <span className="bg-black text-white px-3 py-1 text-sm font-black uppercase tracking-widest transform -rotate-2 inline-block">Result</span>
            <h1 className="text-3xl font-serif font-black italic mt-2">You are...</h1>
        </div>

        <NeoCard className="p-0 overflow-hidden shadow-neo-xl mb-4 bg-white">
            <div className={`h-32 ${result.colorClass} border-b-2 border-black flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <span className="text-6xl filter drop-shadow-md animate-bounce">{result.image}</span>
            </div>
            <div className="p-8 text-center space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{result.title}</h2>
                <div className="w-16 h-1 bg-black mx-auto"></div>
                <p className="font-serif italic text-lg text-gray-600 leading-relaxed">
                    "{result.description}"
                </p>
            </div>
        </NeoCard>

        {/* Community Vibe Check Card */}
        {stats && (
            <NeoCard className={`mb-6 p-4 border-2 border-black ${stats.isMostCommon ? 'bg-neo-lemon' : 'bg-neo-black text-white'}`} noShadow>
                <div className="flex items-start gap-4">
                    <div className={`p-2 border-2 border-black rounded-lg ${stats.isMostCommon ? 'bg-white text-black' : 'bg-neo-coral text-black'}`}>
                        {stats.isMostCommon ? <TrendingUp className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="font-black uppercase text-sm tracking-widest mb-1">Community Vibe Check</h3>
                        <p className="font-bold text-sm leading-tight mb-2">
                            {stats.isMostCommon 
                                ? `You're trending! ${stats.percent}% of people also got this result.`
                                : `Rare find! Only ${stats.percent}% of people got this.`
                            }
                        </p>
                        {!stats.isMostCommon && (
                            <p className="text-xs font-mono opacity-80">
                                Most people got: {stats.mostCommonTitle}
                            </p>
                        )}
                    </div>
                </div>
            </NeoCard>
        )}

        {isAnonymous && (
             <div className="bg-white border-2 border-dashed border-gray-400 rounded-xl p-4 mb-4 text-center">
                 <p className="font-bold text-sm text-gray-500 mb-1">Want to save this result?</p>
                 <p className="text-xs text-gray-400">Join the club to track your personality stats.</p>
             </div>
        )}

        <div className="space-y-3">
            <NeoButton 
                onClick={handleShare} 
                className="w-full" 
                colorClass="bg-neo-mint" 
                icon={Share2}
                label="Share Quiz Link"
            />
            <NeoButton 
                onClick={onExit} 
                variant="secondary"
                className="w-full" 
                colorClass="bg-white" 
                icon={RefreshCw}
                label="Back to Feed"
            />
        </div>
      </div>
    );
  }

  // --- Question View ---

  return (
    <div className="max-w-md mx-auto h-full flex flex-col justify-center min-h-[80vh]">
        {/* Progress */}
        <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
                <span className="font-black font-mono text-sm">Q{currentQuestionIndex + 1}/{quiz.questions.length}</span>
                <span className="font-serif italic text-xs text-gray-500">Pick one</span>
            </div>
            <div className="h-4 w-full border-2 border-black rounded-full p-0.5 bg-white">
                <div 
                    className="h-full bg-neo-periwinkle rounded-full transition-all duration-300 ease-out border border-black"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        {/* Question Card */}
        <NeoCard className="p-6 mb-6 shadow-neo-lg bg-white relative">
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-neo-lemon border-2 border-black flex items-center justify-center font-black rounded-lg transform rotate-12">
                ?
            </div>
            <h2 className="text-2xl lg:text-3xl font-serif font-black leading-tight">
                {currentQuestion.text}
            </h2>
        </NeoCard>

        {/* Answers */}
        <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
                <button
                    key={answer.id}
                    onClick={() => handleAnswer(answer.outcomeId)}
                    className="w-full text-left group relative"
                >
                    <div className="absolute inset-0 bg-black rounded-xl translate-x-1 translate-y-1"></div>
                    <div className="relative bg-white border-2 border-black rounded-xl p-4 flex items-center gap-4 transition-transform transform group-active:translate-x-1 group-active:translate-y-1 group-hover:-translate-y-1 group-hover:-translate-x-1 hover:bg-neo-paper">
                        <div className="w-8 h-8 rounded-lg bg-neo-black text-white flex items-center justify-center font-bold border border-black flex-shrink-0">
                            {['A', 'B', 'C', 'D'][currentQuestion.answers.indexOf(answer)]}
                        </div>
                        <span className="font-bold text-lg">{answer.text}</span>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );
};

export default QuizPlayer;