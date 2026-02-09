import React, { useState } from 'react';
import { QuizVisibility } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import NeoButton from '../ui/NeoButton';
import NeoCard from '../ui/NeoCard';
import { Globe, Lock, Link, Eye } from 'lucide-react';

interface QuizSettingsProps {
  quizId: string;
  currentVisibility: QuizVisibility;
  onVisibilityChange: (visibility: QuizVisibility) => void;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({
  quizId,
  currentVisibility,
  onVisibilityChange
}) => {
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState(currentVisibility);

  const visibilityOptions = [
    {
      value: QuizVisibility.PUBLIC,
      label: 'Public',
      description: 'Anyone can find and play this quiz',
      icon: Globe,
      colorClass: 'bg-neo-mint text-black'
    },
    {
      value: QuizVisibility.UNLISTED,
      label: 'Unlisted',
      description: 'Only people with the link can play',
      icon: Link,
      colorClass: 'bg-neo-lemon text-black'
    },
    {
      value: QuizVisibility.PRIVATE,
      label: 'Private',
      description: 'Only you can see and play this quiz',
      icon: Lock,
      colorClass: 'bg-neo-coral text-white'
    }
  ];

  const handleUpdateVisibility = async () => {
    if (selectedVisibility === currentVisibility) return;

    setIsUpdating(true);
    try {
      // Update the quiz visibility in the database
      const { supabase } = await import('../../lib/supabaseClient');
      
      const { error } = await supabase
        .from('PopQuiz_Quizzes')
        .update({ visibility: selectedVisibility })
        .eq('id', quizId);

      if (error) throw error;

      onVisibilityChange(selectedVisibility);
      addToast(`Quiz visibility updated to ${selectedVisibility}`, 'success');
    } catch (error: any) {
      addToast(`Failed to update visibility: ${error.message}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getVisibilityDescription = () => {
    const option = visibilityOptions.find(opt => opt.value === currentVisibility);
    return option?.description || '';
  };

  return (
    <NeoCard className="space-y-6">
      <div>
        <h3 className="text-lg font-black font-serif mb-2 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Quiz Privacy
        </h3>
        <p className="text-sm text-gray-600">
          Current setting: {getVisibilityDescription()}
        </p>
      </div>

      <div className="space-y-3">
        {visibilityOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedVisibility === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setSelectedVisibility(option.value)}
              className={`
                w-full p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-black shadow-neo-md' 
                  : 'border-gray-300 hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-full border-2 border-black flex items-center justify-center
                  ${isSelected ? option.colorClass : 'bg-gray-200'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <NeoButton
        onClick={handleUpdateVisibility}
        disabled={isUpdating || selectedVisibility === currentVisibility}
        label={isUpdating ? 'Updating...' : 'Update Privacy'}
        className="w-full"
        colorClass="bg-neo-periwinkle text-white"
      />
    </NeoCard>
  );
};

export default QuizSettings;