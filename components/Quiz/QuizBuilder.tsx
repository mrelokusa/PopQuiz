import React, { useState } from 'react';
import { Sparkles, Plus, Trash, ArrowRight, Save, Check, AlertTriangle, X } from 'lucide-react';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import { Quiz, Question, Outcome } from '../../types';
import { generateAIQuiz } from '../../services/geminiService';
import { saveQuiz } from '../../services/storageService';
import { getCurrentUser } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

interface QuizBuilderProps {
  onComplete: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ onComplete }) => {
  const { addToast } = useToast();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'topic' | 'edit'>('topic');
  const [showApiError, setShowApiError] = useState(false);
  
  const [quizData, setQuizData] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    questions: [],
    outcomes: []
  });

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setShowApiError(false);
    
    try {
        const generated = await generateAIQuiz(topic);
        if (generated) {
          setQuizData(generated);
          setStep('edit');
         } else {
            // Generic failure
            addToast("AI Generation failed. Please try a different topic or build manually.", 'error');
         }
    } catch (e: any) {
        if (e.message === 'MISSING_API_KEY') {
            setShowApiError(true);
         } else {
             console.error(e);
             addToast("Something went wrong with the AI.", 'error');
         }
    } finally {
        setLoading(false);
    }
  };

  const handleManualStart = () => {
    // Initialize with skeleton
    const outcomes: Outcome[] = [
        { id: 'o1', title: 'Outcome 1', description: 'You are type A', image: '🅰️', colorClass: 'bg-neo-coral' },
        { id: 'o2', title: 'Outcome 2', description: 'You are type B', image: '🅱️', colorClass: 'bg-neo-mint' },
    ];
    setQuizData({
        title: topic || 'New Quiz',
        description: '',
        outcomes,
        questions: [
            { id: 'q1', text: 'Question 1', answers: [
                { id: 'a1', text: 'Answer 1', outcomeId: 'o1' },
                { id: 'a2', text: 'Answer 2', outcomeId: 'o2' }
            ]}
        ]
    });
    setStep('edit');
  }

  const handleSave = async () => {
    if (quizData.title && quizData.questions && quizData.outcomes) {
      setSaving(true);
      
      // CRITICAL: Ensure we have a fresh user session before saving
      const user = await getCurrentUser();
      
       if (!user) {
           setSaving(false);
           addToast("Your session has expired. Please log in again to publish.", 'warning');
           return;
       }
      
      const newQuiz: Quiz = {
        id: crypto.randomUUID(),
        author: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
        user_id: user.id,
        createdAt: Date.now(),
        plays: 0,
        title: quizData.title,
        description: quizData.description || '',
        questions: quizData.questions,
        outcomes: quizData.outcomes
      };
      
      const success = await saveQuiz(newQuiz);
      setSaving(false);
      
      if (success) {
        onComplete();
      }
     } else {
        addToast("Please ensure your quiz has a title, questions, and outcomes.", 'warning');
    }
  };

  // --- Render Steps ---

  if (loading || saving) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <div className={`w-24 h-24 ${saving ? 'bg-neo-mint' : 'bg-neo-lemon'} border-2 border-black rounded-full animate-bounce flex items-center justify-center shadow-neo-md`}>
            <Sparkles className="w-12 h-12 animate-spin" />
        </div>
        <h2 className="text-2xl font-serif font-black italic">{saving ? 'Publishing to the world...' : 'Cooking up your quiz...'}</h2>
        <p className="font-mono bg-neo-black text-white px-2">{saving ? 'UPLOADING' : 'AI IS THINKING'}</p>
      </div>
    );
  }

  if (step === 'topic') {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-in zoom-in-95 relative">
        
        {/* Error Modal Overlay */}
        {showApiError && (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
                <div className="bg-red-100 border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full animate-in zoom-in duration-200">
                    <div className="flex justify-between items-start mb-4">
                         <div className="bg-red-500 text-white p-2 rounded-lg border-2 border-black">
                             <AlertTriangle className="w-6 h-6" />
                         </div>
                         <button onClick={() => setShowApiError(false)} className="hover:bg-black hover:text-white rounded p-1 transition-colors">
                             <X className="w-6 h-6" />
                         </button>
                    </div>
                    <h3 className="font-black font-serif italic text-2xl mb-2">Whoops! No Key.</h3>
                    <p className="font-bold text-sm mb-4">
                        We couldn't find your Gemini API Key. Vercel is strict about variable names.
                    </p>
                    <div className="bg-white p-3 rounded-lg border-2 border-black mb-4">
                        <p className="text-xs font-mono text-gray-500 mb-1">Go to Vercel Settings → Environment Variables</p>
                        <p className="text-xs font-black uppercase text-red-500">Name It Exactly:</p>
                        <code className="block bg-black text-white p-2 rounded mt-1 font-mono text-sm">VITE_API_KEY</code>
                    </div>
                    <NeoButton 
                        onClick={() => setShowApiError(false)}
                        className="w-full"
                        label="Got it, I'll fix it!"
                    />
                </div>
            </div>
        )}

        <div className={`text-center space-y-2 ${showApiError ? 'blur-sm pointer-events-none' : ''}`}>
            <h2 className="text-4xl font-serif font-black italic">Let's make something viral.</h2>
            <p className="font-sans font-bold text-gray-500">Create a quiz in seconds.</p>
        </div>

        <NeoCard className={`p-6 space-y-4 shadow-neo-lg ${showApiError ? 'blur-sm pointer-events-none' : ''}`}>
          <div>
            <label className="font-black uppercase text-xs mb-2 block">Quiz Topic</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Which 90s Cartoon Character Are You?"
              className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 ring-neo-lemon transition-all"
            />
          </div>
          
          <NeoButton 
            onClick={handleGenerate} 
            disabled={!topic}
            colorClass="bg-neo-periwinkle text-white"
            className="w-full"
            icon={Sparkles}
            label="Magic Auto-Generate"
          />
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t-2 border-black/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 font-bold text-xs uppercase">Or</span>
            <div className="flex-grow border-t-2 border-black/10"></div>
          </div>

          <NeoButton 
            onClick={handleManualStart} 
            variant="secondary"
            colorClass="bg-white"
            className="w-full"
            label="Build Manually"
          />
        </NeoCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black font-serif italic">Editing: {quizData.title}</h2>
             <NeoButton onClick={handleSave} colorClass="bg-neo-mint" icon={Save} label="Publish" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
            {/* Metadata & Outcomes */}
            <div className="space-y-6">
                <NeoCard className="p-4 bg-neo-paper" noShadow>
                    <h3 className="font-black uppercase text-sm mb-4 border-b-2 border-black pb-2">Basic Info</h3>
                    <input 
                        value={quizData.title} 
                        onChange={e => setQuizData({...quizData, title: e.target.value})}
                        className="w-full bg-white border-2 border-black p-2 rounded-lg font-bold mb-2"
                        placeholder="Quiz Title"
                    />
                    <textarea 
                        value={quizData.description} 
                        onChange={e => setQuizData({...quizData, description: e.target.value})}
                        className="w-full bg-white border-2 border-black p-2 rounded-lg font-medium text-sm"
                        placeholder="Description..."
                    />
                </NeoCard>

                <NeoCard className="p-4" noShadow>
                     <h3 className="font-black uppercase text-sm mb-4 border-b-2 border-black pb-2">Outcomes ({quizData.outcomes?.length})</h3>
                     <div className="space-y-2">
                        {quizData.outcomes?.map((outcome, idx) => (
                            <div key={idx} className={`p-3 border-2 border-black rounded-lg ${outcome.colorClass} flex gap-2 items-start`}>
                                <div className="text-2xl">{outcome.image}</div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">{outcome.title}</p>
                                    <p className="text-xs opacity-80">{outcome.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </NeoCard>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                 <h3 className="font-black uppercase text-sm bg-black text-white inline-block px-2 py-1 transform -rotate-1">Questions ({quizData.questions?.length})</h3>
                 {quizData.questions?.map((q, qIdx) => (
                     <NeoCard key={qIdx} className="p-4 hover:shadow-neo-lg transition-shadow">
                        <div className="flex justify-between mb-2">
                            <span className="font-black text-neo-periwinkle">Q{qIdx + 1}</span>
                            <button className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash className="w-4 h-4"/></button>
                        </div>
                        <input 
                            value={q.text} 
                            readOnly 
                            className="w-full font-serif font-bold text-lg border-b-2 border-black/10 focus:outline-none mb-3 bg-transparent"
                        />
                        <div className="space-y-2 pl-4 border-l-4 border-black/10">
                            {q.answers.map((a, aIdx) => (
                                <div key={aIdx} className="flex justify-between items-center text-sm">
                                    <span className="font-medium">{a.text}</span>
                                    <span className="text-xs font-mono bg-gray-200 px-1 rounded">{quizData.outcomes?.find(o => o.id === a.outcomeId)?.image}</span>
                                </div>
                            ))}
                        </div>
                     </NeoCard>
                 ))}
                 
                 <button className="w-full py-4 border-2 border-dashed border-black rounded-xl font-bold text-gray-500 hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                     <Plus className="w-5 h-5" /> Add Question
                 </button>
            </div>
        </div>
    </div>
  );
};

export default QuizBuilder;