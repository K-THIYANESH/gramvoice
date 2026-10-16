/**
 * GramVoice TN - 6-Stage Visual Civic Journey Stepper
 * Discover -> Understand -> Suggest -> Participate -> Validate -> Monitor -> Maintain
 */
import React from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ProjectStage } from '../../types';

interface CivicJourneyStepperProps {
  currentStage: ProjectStage;
  interactive?: boolean;
  onSelectStage?: (stage: ProjectStage) => void;
}

const STAGES: { key: ProjectStage; labelEn: string; labelTa: string; stepNumber: number }[] = [
  { key: 'DISCOVER', labelEn: 'Discover', labelTa: 'கண்டுபிடி', stepNumber: 1 },
  { key: 'UNDERSTAND', labelEn: 'Understand', labelTa: 'புரிந்துகொள்', stepNumber: 2 },
  { key: 'SUGGEST', labelEn: 'Suggest', labelTa: 'பரிந்துரை', stepNumber: 3 },
  { key: 'PARTICIPATE', labelEn: 'Participate', labelTa: 'பங்கேற்பு', stepNumber: 4 },
  { key: 'VALIDATE', labelEn: 'Validate', labelTa: 'சரிபார்', stepNumber: 5 },
  { key: 'MONITOR', labelEn: 'Monitor', labelTa: 'கண்காணி', stepNumber: 6 },
  { key: 'MAINTAIN', labelEn: 'Maintain', labelTa: 'பராமரிப்பு', stepNumber: 7 },
];

export const CivicJourneyStepper: React.FC<CivicJourneyStepperProps> = ({ currentStage, interactive = false, onSelectStage }) => {
  const { language } = useLanguage();

  const currentIndex = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="w-full py-3">
      {/* Mobile Horizontal Scroll Stepper */}
      <div className="flex items-center overflow-x-auto no-scrollbar pb-2 px-1 gap-2 sm:justify-between">
        {STAGES.map((s, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div 
              key={s.key} 
              onClick={() => interactive && onSelectStage && onSelectStage(s.key)}
              className={`flex items-center shrink-0 ${interactive ? 'cursor-pointer' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : isCurrent 
                        ? 'bg-emerald-700 text-white ring-4 ring-emerald-100 scale-105' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : isCurrent ? <CircleDot className="w-4 h-4" /> : s.stepNumber}
                </div>
                <span className={`text-[11px] mt-1 font-medium whitespace-nowrap ${
                  isCurrent ? 'text-emerald-800 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {language === 'ta' ? s.labelTa : s.labelEn}
                </span>
              </div>

              {index < STAGES.length - 1 && (
                <div className={`h-0.5 w-6 sm:w-10 mx-1 mb-4 ${
                  index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
