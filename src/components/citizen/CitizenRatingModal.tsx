/**
 * GramVoice TN - Citizen Work Verification & Satisfaction Rating Modal
 * Closes the SLA loop by letting citizens rate resolution quality and confirm ground truth
 */
import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  Camera, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  Send,
  ThumbsUp
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { MaintenanceTicket } from '../../types';

interface CitizenRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket;
  onSubmitRating: (ticketId: string, rating: number, feedback: string, photoProofUrl?: string) => void;
}

export const CitizenRatingModal: React.FC<CitizenRatingModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmitRating
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitRating(ticket.id, rating, feedback);
      setIsSubmitting(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              {language === 'ta' ? 'பணி நிறைவு & திருப்தி மதிப்பீடு' : 'Citizen Verification & Rating'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isDone ? (
          <div className="p-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-base text-slate-900">
              {language === 'ta' ? 'மதிப்பீடு பதிவு செய்யப்பட்டது!' : 'Feedback Verified & Recorded!'}
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'ta' ? 'உங்கள் கருத்து ஊராட்சி நிர்வாகத்தில் சேர்க்கப்பட்டது.' : 'Your civic score has been logged to the Panchayat SLA transparency ledger.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Ticket Info Pill */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-mono text-emerald-800 font-bold block mb-0.5">
                {ticket.ticketNumber} • {ticket.category}
              </span>
              <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                {ticket.title}
              </h5>
              <p className="text-[11px] text-slate-500 mt-1">
                {ticket.resolutionSummary || (language === 'ta' ? 'அதிகாரிகளால் பணி நிறைவு செய்யப்பட்டுள்ளது.' : 'Marked as resolved by field team.')}
              </p>
            </div>

            {/* Star Rating Section */}
            <div className="text-center space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'ta' ? 'பணியின் தரத்தை மதிப்பீடு செய்யவும்' : 'Rate Resolution Quality & Timeliness'}:
              </label>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-700 block">
                {rating === 5 && (language === 'ta' ? '⭐⭐⭐⭐⭐ மிகச் சிறந்த சேவை' : '⭐⭐⭐⭐⭐ Excellent & Timely')}
                {rating === 4 && (language === 'ta' ? '⭐⭐⭐⭐ நல்ல தீர்வு' : '⭐⭐⭐⭐ Good Quality')}
                {rating === 3 && (language === 'ta' ? '⭐⭐⭐ திருப்திகரமானது' : '⭐⭐⭐ Satisfactory')}
                {rating === 2 && (language === 'ta' ? '⭐⭐ மேலும் முன்னேற்றம் தேவை' : '⭐⭐ Needs Improvement')}
                {rating === 1 && (language === 'ta' ? '⭐ திருப்திகரமாக இல்லை' : '⭐ Unsatisfactory / Incomplete')}
              </span>
            </div>

            {/* Written Citizen Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'உங்கள் கருத்து / கள ஆய்வு குறிப்பு' : 'Citizen Verification Note (Optional)'}:
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder={language === 'ta' ? 'எ.கா. குழாய் பழுது நீக்கப்பட்டு தண்ணீர் சீராக வருகிறது...' : 'e.g. Pipeline leak fully repaired, water flow restored cleanly.'}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{language === 'ta' ? 'மதிப்பீட்டை உறுதி செய்' : 'Submit & Close Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
