/**
 * GramVoice TN - Citizen Submissions, Tickets & Offline Sync Queue Center
 * Production-Grade with Official Receipt Viewer & Citizen Work Verification Ratings
 */
import React, { useState } from 'react';
import { 
  History, 
  ArrowLeft, 
  Database, 
  WifiOff, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  RefreshCw,
  FileText,
  Star,
  ShieldCheck,
  Download,
  Share2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { CitizenSubmission, MaintenanceTicket } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CitizenReceiptModal } from '../common/CitizenReceiptModal';
import { CitizenRatingModal } from './CitizenRatingModal';

interface MyActivityProps {
  submissions: CitizenSubmission[];
  tickets: MaintenanceTicket[];
  onBack: () => void;
}

export const MyActivity: React.FC<MyActivityProps> = ({ submissions, tickets, onBack }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { queue, isOnline, triggerSync, removeQueuedItem, clearQueue } = useOffline();

  const [selectedTicketForReceipt, setSelectedTicketForReceipt] = useState<MaintenanceTicket | null>(null);
  const [selectedTicketForRating, setSelectedTicketForRating] = useState<MaintenanceTicket | null>(null);
  const [ratedTicketIds, setRatedTicketIds] = useState<Record<string, { rating: number; feedback: string }>>({});

  const handleRatingSubmit = (ticketId: string, rating: number, feedback: string) => {
    setRatedTicketIds(prev => ({
      ...prev,
      [ticketId]: { rating, feedback }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16 px-1 sm:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.btnBack}
        </button>
      </div>

      {/* Offline Storage Queue Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Local Offline Queue ({queue.length} items)</span>
          </h3>

          {queue.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerSync()}
                disabled={!isOnline}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Now
              </button>
              <button
                onClick={clearQueue}
                className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                title="Clear queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {queue.length === 0 ? (
          <p className="text-xs text-slate-500 py-3.5 text-center bg-slate-50 rounded-2xl border border-slate-200 leading-relaxed">
            All your submissions are synchronized with the Panchayat server.
          </p>
        ) : (
          <div className="space-y-2">
            {queue.map(item => (
              <div key={item.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-amber-900 block capitalize">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Saved at: {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded-md">
                    {item.status}
                  </span>
                  <button
                    onClick={() => removeQueuedItem(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reported Grievance Tickets */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-base">
          {language === 'ta' ? 'நீங்கள் பதிவு செய்த புகார்கள்' : 'Your Maintenance Grievance Tickets'}
        </h3>

        {tickets.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No maintenance complaints filed yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => {
              const isResolved = t.status === 'RESOLVED' || t.status === 'CITIZEN_VERIFIED' || t.status === 'CLOSED';
              const userRating = ratedTicketIds[t.id];

              return (
                <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold font-mono text-slate-900">{t.ticketNumber}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge type="status" value={t.status} />
                      <StatusBadge type="sla" value={t.isBreached ? 'breached' : 'ok'} />
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug break-words">{t.title}</h4>
                  
                  <p className="text-slate-600 text-xs">
                    {t.description}
                  </p>

                  {userRating && (
                    <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-950 flex items-center justify-between text-xs font-semibold">
                      <span>Verified by Citizen: {'⭐'.repeat(userRating.rating)}</span>
                      <span className="text-[10px] text-emerald-800 italic">{userRating.feedback || 'Quality Approved'}</span>
                    </div>
                  )}

                  {/* Actions: View Official Receipt + Rate Verification */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTicketForReceipt(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-bold cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'ta' ? 'அரசு ரசீது' : 'Official Receipt'}</span>
                      </button>

                      {isResolved && !userRating && (
                        <button
                          type="button"
                          onClick={() => setSelectedTicketForRating(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-2xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>{language === 'ta' ? 'தரத்தை மதிப்பிடு' : 'Verify & Rate Work'}</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px]">SLA Due: {new Date(t.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spoken Voice Submissions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-base">
          {language === 'ta' ? 'உங்கள் குரல் பதிவுகள்' : 'Your Voice Opinions & Submissions'}
        </h3>

        {submissions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No submissions recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {submissions.map(s => (
              <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 capitalize">{s.submissionType} Feedback</span>
                  <StatusBadge type="sentiment" value={s.sentiment} />
                </div>
                <p className="text-slate-600 italic leading-relaxed break-words">"{s.transcriptEnglish || s.transcriptRaw}"</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  <span className="font-mono text-emerald-800 font-semibold">UID: {s.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTicketForReceipt && (
        <CitizenReceiptModal
          isOpen={!!selectedTicketForReceipt}
          onClose={() => setSelectedTicketForReceipt(null)}
          ticket={selectedTicketForReceipt}
        />
      )}

      {selectedTicketForRating && (
        <CitizenRatingModal
          isOpen={!!selectedTicketForRating}
          onClose={() => setSelectedTicketForRating(null)}
          ticket={selectedTicketForRating}
          onSubmitRating={handleRatingSubmit}
        />
      )}
    </div>
  );
};
