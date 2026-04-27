import React, { useState } from 'react';
import { Sparkles, Plus, Trash, Save, Globe, Lock, Link } from 'lucide-react';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import { Quiz, Outcome, QuizVisibility } from '../../types';
import { generateAIQuiz, GenerateQuizException } from '../../services/geminiService';
import { saveQuiz, updateQuiz } from '../../services/storageService';
import { getCurrentUser } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

interface QuizBuilderProps {
  onComplete: () => void;
  existingQuiz?: Quiz | null;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ onComplete, existingQuiz }) => {
  const { addToast } = useToast();
  const isEditing = !!existingQuiz;
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'topic' | 'edit'>(isEditing ? 'edit' : 'topic');

  const [quizData, setQuizData] = useState<Partial<Quiz>>(
    existingQuiz ?? {
      title: '',
      description: '',
      questions: [],
      outcomes: [],
      visibility: QuizVisibility.PUBLIC,
    }
  );

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);

    try {
        const generated = await generateAIQuiz(topic);
        if (generated) {
          setQuizData(generated);
          setStep('edit');
        } else {
          addToast("AI Generation failed. Please try a different topic or build manually.", 'error');
        }
    } catch (e: any) {
        if (e instanceof GenerateQuizException) {
            switch (e.code) {
                case 'NOT_AUTHENTICATED':
                    addToast("Please log in to use AI generation.", 'warning');
                    break;
                case 'RATE_LIMITED':
                    addToast("You've hit the hourly AI limit. Try again later or build manually.", 'warning');
                    break;
                case 'INVALID_TOPIC':
                    addToast("That topic didn't work — try something shorter.", 'error');
                    break;
                case 'NETWORK_ERROR':
                    addToast("Couldn't reach the server. Check your connection.", 'error');
                    break;
                default:
                    addToast("Something went wrong with the AI. Try again or build manually.", 'error');
            }
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

      // Require a verified email before allowing public content. Stops bot
      // accounts and disposable-address spam from polluting the global feed.
      if (!user.email_confirmed_at) {
          setSaving(false);
          addToast("Please confirm your email address before publishing a quiz.", 'warning');
          return;
      }
      
      const quizPayload: Quiz = {
        id: existingQuiz?.id ?? crypto.randomUUID(),
        author: existingQuiz?.author ?? (user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous'),
        user_id: existingQuiz?.user_id ?? user.id,
        createdAt: existingQuiz?.createdAt ?? Date.now(),
        plays: existingQuiz?.plays ?? 0,
        visibility: quizData.visibility || QuizVisibility.PUBLIC,
        title: quizData.title,
        description: quizData.description || '',
        questions: quizData.questions,
        outcomes: quizData.outcomes
      };

      const success = isEditing
        ? await updateQuiz(quizPayload)
        : await saveQuiz(quizPayload);
      setSaving(false);

      if (success) {
        addToast(isEditing ? 'Quiz updated!' : 'Quiz published!', 'success');
        onComplete();
      } else {
        addToast(isEditing ? 'Failed to update quiz.' : 'Failed to publish quiz. Check the console for details.', 'error');
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
        <h2 className="text-2xl font-serif font-black italic">{saving ? (isEditing ? 'Saving changes...' : 'Publishing to the world...') : 'Cooking up your quiz...'}</h2>
        <p className="font-mono bg-neo-black text-white px-2">{saving ? (isEditing ? 'UPDATING' : 'UPLOADING') : 'AI IS THINKING'}</p>
      </div>
    );
  }

  if (step === 'topic') {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-in zoom-in-95 relative">
        <div className="text-center space-y-2">
            <h2 className="text-4xl font-serif font-black italic">Let's make something viral.</h2>
            <p className="font-sans font-bold text-gray-500">Create a quiz in seconds.</p>
        </div>

        <NeoCard className="p-6 space-y-4 shadow-neo-lg">
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
             <h2 className="text-2xl font-black font-serif italic">{isEditing ? 'Editing' : 'Building'}: {quizData.title}</h2>
             <NeoButton onClick={handleSave} colorClass="bg-neo-mint" icon={Save} label={isEditing ? 'Save Changes' : 'Publish'} />
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

                 {/* Privacy Settings */}
                 <NeoCard className="p-4" noShadow>
                     <h3 className="font-black uppercase text-sm mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                         <Globe className="w-4 h-4" />
                         Privacy Settings
                     </h3>
                     <div className="space-y-2">
                         {[
                             {
                                 value: QuizVisibility.PUBLIC,
                                 label: 'Public',
                                 desc: 'Anyone can find and play this quiz',
                                 icon: Globe,
                                 color: 'bg-neo-mint'
                             },
                             {
                                 value: QuizVisibility.UNLISTED,
                                 label: 'Link Only',
                                 desc: 'Not in the feed — share the link directly with friends',
                                 icon: Link,
                                 color: 'bg-neo-lemon'
                             },
                             {
                                 value: QuizVisibility.PRIVATE,
                                 label: 'Private',
                                 desc: 'Only you can see and play this quiz',
                                 icon: Lock,
                                 color: 'bg-neo-coral'
                             }
                         ].map((option) => {
                             const Icon = option.icon;
                             const isSelected = quizData.visibility === option.value;
                             
                             return (
                                 <button
                                     key={option.value}
                                     onClick={() => setQuizData(prev => ({ ...prev, visibility: option.value }))}
                                     className={`
                                         w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3
                                         ${isSelected ? 'border-black shadow-neo-sm' : 'border-gray-300 hover:border-gray-500'}
                                     `}
                                 >
                                     <div className={`
                                         w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0
                                         ${isSelected ? option.color + ' text-black' : 'bg-gray-200'}
                                     `}>
                                         <Icon className="w-4 h-4" />
                                     </div>
                                     <div className="text-left">
                                         <div className="font-bold text-sm">{option.label}</div>
                                         <div className="text-xs text-gray-600">{option.desc}</div>
                                     </div>
                                     {isSelected && (
                                         <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center ml-auto">
                                             <div className="w-2 h-2 bg-white rounded-full"></div>
                                         </div>
                                     )}
                                 </button>
                             );
                         })}
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
                            <button
                                onClick={() => setQuizData(prev => ({
                                    ...prev,
                                    questions: prev.questions?.filter((_, i) => i !== qIdx)
                                }))}
                                className="text-red-500 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash className="w-4 h-4"/>
                            </button>
                        </div>
                        <input
                            value={q.text}
                            onChange={e => setQuizData(prev => ({
                                ...prev,
                                questions: prev.questions?.map((question, i) =>
                                    i === qIdx ? { ...question, text: e.target.value } : question
                                )
                            }))}
                            className="w-full font-serif font-bold text-lg border-b-2 border-black/10 focus:outline-none mb-3 bg-transparent"
                            placeholder="Question text..."
                        />
                        <div className="space-y-2 pl-4 border-l-4 border-black/10">
                            {q.answers.map((a, aIdx) => (
                                <div key={aIdx} className="flex justify-between items-center text-sm gap-2">
                                    <input
                                        value={a.text}
                                        onChange={e => setQuizData(prev => ({
                                            ...prev,
                                            questions: prev.questions?.map((question, i) =>
                                                i === qIdx
                                                    ? {
                                                        ...question,
                                                        answers: question.answers.map((ans, j) =>
                                                            j === aIdx ? { ...ans, text: e.target.value } : ans
                                                        )
                                                      }
                                                    : question
                                            )
                                        }))}
                                        className="flex-1 font-medium bg-transparent border-b border-black/20 focus:outline-none focus:border-black"
                                        placeholder="Answer text..."
                                    />
                                    <span className="text-xs font-mono bg-gray-200 px-1 rounded flex-shrink-0">{quizData.outcomes?.find(o => o.id === a.outcomeId)?.image}</span>
                                </div>
                            ))}
                        </div>
                     </NeoCard>
                 ))}

                 <button
                     onClick={() => {
                         const outcomes = quizData.outcomes || [];
                         const newQ = {
                             id: `q${Date.now()}`,
                             text: '',
                             answers: outcomes.slice(0, 2).map((o, i) => ({
                                 id: `q${Date.now()}_a${i}`,
                                 text: '',
                                 outcomeId: o.id
                             }))
                         };
                         setQuizData(prev => ({ ...prev, questions: [...(prev.questions || []), newQ] }));
                     }}
                     className="w-full py-4 border-2 border-dashed border-black rounded-xl font-bold text-gray-500 hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                 >
                     <Plus className="w-5 h-5" /> Add Question
                 </button>
            </div>
        </div>
    </div>
  );
};

export default QuizBuilder;