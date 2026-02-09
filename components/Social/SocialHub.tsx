import React, { useEffect, useState } from 'react';
import { Quiz, QuizResult } from '../../types';
import { getQuizzes, getMyQuizActivity } from '../../services/storageService';
import NeoCard from '../ui/NeoCard';
import { Sparkles, Activity, Crown, TrendingUp, Zap, Users } from 'lucide-react';

interface SocialHubProps {
  userId: string;
}

const SocialHub: React.FC<SocialHubProps> = ({ userId }) => {
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [activity, setActivity] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const [quizzes, results] = await Promise.all([
            getQuizzes('local', userId),
            getMyQuizActivity(userId)
        ]);
        setMyQuizzes(quizzes);
        setActivity(results);
        setLoading(false);
    };
    loadData();
  }, [userId]);

  // --- Stats Calculation ---
  const totalPlays = myQuizzes.reduce((sum, q) => sum + (q.plays || 0), 0);
  const quizCount = myQuizzes.length;
  // A fun arbitrary "Virality Score" based on plays per quiz
  const viralityScore = quizCount > 0 ? Math.round(totalPlays / quizCount) : 0;

  if (loading) return <div className="text-center font-bold animate-pulse p-8">Loading your world...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 bg-neo-black text-white p-6 rounded-2xl border-2 border-black shadow-neo-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="w-16 h-16 bg-neo-lemon border-2 border-white rounded-full flex items-center justify-center text-3xl shadow-neo-sm">
                👑
             </div>
             <div>
                 <h2 className="text-2xl font-black italic">My Hub</h2>
                 <p className="font-mono text-sm opacity-80">Where you rule the quiz world.</p>
             </div>
        </div>

        {/* Virality Dashboard (Stats) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NeoCard className="p-4 bg-neo-blue text-white relative overflow-hidden">
                <div className="absolute -right-2 -bottom-4 opacity-20">
                    <Users className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Total Plays</p>
                    <p className="text-4xl font-serif font-black italic">{totalPlays.toLocaleString()}</p>
                </div>
            </NeoCard>

            <NeoCard className="p-4 bg-neo-lemon text-black relative overflow-hidden">
                <div className="absolute -right-2 -bottom-4 opacity-20">
                    <Sparkles className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">Created</p>
                    <p className="text-4xl font-serif font-black italic">{quizCount}</p>
                </div>
            </NeoCard>

            <NeoCard className="p-4 bg-neo-mint text-black relative overflow-hidden col-span-2 md:col-span-1">
                <div className="absolute -right-2 -bottom-4 opacity-20">
                    <Zap className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">Viral Score</p>
                    <div className="flex items-end gap-2">
                        <p className="text-4xl font-serif font-black italic">{viralityScore}</p>
                        <span className="text-xs font-bold mb-2 bg-black text-white px-1 rounded transform -rotate-2">AVG</span>
                    </div>
                </div>
            </NeoCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            {/* My Quizzes Column */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm bg-neo-lemon px-2 py-1 transform -rotate-1 border border-black">My Creations</h3>
                </div>
                
                {myQuizzes.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-black rounded-xl bg-white/50">
                        <p className="font-bold text-gray-500">You haven't created any quizzes yet.</p>
                    </div>
                ) : (
                    myQuizzes.map(quiz => (
                        <div key={quiz.id} className="group cursor-default">
                             <NeoCard className="p-4 flex justify-between items-center hover:bg-white transition-colors">
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">{quiz.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="bg-black text-white text-[10px] font-bold px-1.5 rounded-full flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {quiz.plays}
                                        </div>
                                        <p className="text-xs font-mono text-gray-500">
                                            {new Date(quiz.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex -space-x-2 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                                    {quiz.outcomes.slice(0,3).map((o, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-black ${o.colorClass} flex items-center justify-center text-xs`}>{o.image}</div>
                                    ))}
                                </div>
                             </NeoCard>
                        </div>
                    ))
                )}
            </div>

            {/* Friend Activity Column */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm bg-neo-mint px-2 py-1 transform rotate-1 border border-black">Friend Results</h3>
                </div>

                <div className="space-y-3">
                    {activity.length === 0 ? (
                        <div className="text-center p-8 border-2 border-dashed border-black rounded-xl bg-white/50">
                            <p className="font-bold text-gray-500">No one has taken your quizzes yet. Share them!</p>
                        </div>
                    ) : (
                        activity.map(res => (
                            <NeoCard key={res.id} className="p-3 bg-white flex items-center gap-3 relative overflow-hidden" noShadow>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
                                <div className="w-10 h-10 rounded-full border-2 border-black bg-neo-paper flex items-center justify-center text-lg">
                                    {res.outcome_image}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-black">{res.taker_username}</span> got <span className="font-black bg-neo-lemon px-1 border border-black">{res.outcome_title}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 truncate w-48">on "{res.quiz_title}"</p>
                                </div>
                            </NeoCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SocialHub;