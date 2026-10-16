/**
 * GramVoice TN - Digital Gram Sabha Citizen Portal
 * Mobile optimized: wrapping agenda details, dynamic box sizes, full width action buttons
 */
import React, { useState } from 'react';
import { Users, Calendar, MapPin, CheckCircle2, MessageSquare, Mic, ArrowLeft, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { GramSabhaSession } from '../../types';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { Alert } from '../common/Alert';
import { api } from '../../services/api';

interface GramSabhaCitizenProps {
  gramSabha?: GramSabhaSession;
  onBack: () => void;
  onRefresh: () => void;
}

export const GramSabhaCitizen: React.FC<GramSabhaCitizenProps> = ({ gramSabha, onBack, onRefresh }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { isOnline, enqueueItem } = useOffline();

  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(
    gramSabha?.agendaItems[0]?.id || null
  );
  const [showVoiceRecorder, setShowVoiceRecorder] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!gramSabha) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl border border-slate-200 text-center">
        <p className="text-slate-500">No scheduled Gram Sabha session available.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">Go Back</button>
      </div>
    );
  }

  const selectedAgenda = gramSabha.agendaItems.find(a => a.id === selectedAgendaId) || gramSabha.agendaItems[0];

  const handleVoiceRecorded = async (result: { audioBase64?: string; textFallback: string; durationSeconds: number }) => {
    const payload = {
      gramSabhaId: gramSabha.id,
      projectId: selectedAgenda.projectId,
      audioBase64: result.audioBase64,
      textFallback: result.textFallback,
      citizenName: currentUser.name,
      citizenPhone: currentUser.phone,
      panchayatId: gramSabha.panchayatId,
      durationSeconds: result.durationSeconds
    };

    try {
      if (!isOnline) {
        await enqueueItem('voice_submission', payload);
        setSuccessMsg(t.offlineBannerSubtitle);
      } else {
        await api.submitVoice(payload);
        setSuccessMsg(language === 'ta' ? 'கிராம சபை கருத்து பதிவு செய்யப்பட்டது!' : 'Gram Sabha feedback registered!');
        onRefresh();
      }
      setShowVoiceRecorder(false);
    } catch (e: any) {
      await enqueueItem('voice_submission', payload);
      setSuccessMsg(t.offlineBannerSubtitle);
      setShowVoiceRecorder(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16 px-1 sm:px-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.btnBack}
        </button>

        <span className="text-xs bg-purple-100 text-purple-900 border border-purple-200 font-bold px-3 py-1 rounded-full shrink-0">
          {gramSabha.sessionNumber}
        </span>
      </div>

      {/* Hero Gram Sabha Card */}
      <div className="bg-linear-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-4.5 sm:p-6 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-700/60 text-purple-200 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-purple-300 shrink-0" />
          <span>{language === 'ta' ? 'தமிழ்நாடு ஊராட்சிகள் சட்டம் பிரிவு 3' : 'TN Panchayati Raj Act Sec 3'}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold leading-tight break-words">
          {t.gramSabhaTitle} • {gramSabha.panchayatName}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-purple-100 pt-2 border-t border-purple-700/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="break-words">Date & Time: <strong>{gramSabha.meetingDate} • {gramSabha.meetingTime}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="break-words">Venue: <strong>{language === 'ta' ? gramSabha.venueTamil : gramSabha.venue}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs bg-purple-950/40 p-3 rounded-2xl border border-purple-800/60">
          <span>Quorum Target: <strong>{gramSabha.quorumTarget} Citizens</strong></span>
          <span className="text-emerald-300 font-bold">Attended: {gramSabha.actualAttendees} (Quorum Met)</span>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" title="Success" message={successMsg} />
      )}

      {/* Agenda Items List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <span>{t.gramSabhaAgenda}</span>
          <span className="text-xs font-normal text-slate-500">({gramSabha.agendaItems.length} items)</span>
        </h3>

        <div className="space-y-3">
          {gramSabha.agendaItems.map((agenda, idx) => (
            <div
              key={agenda.id}
              onClick={() => setSelectedAgendaId(agenda.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedAgendaId === agenda.id 
                  ? 'bg-purple-50/60 border-purple-400 ring-2 ring-purple-100' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  Agenda #{idx + 1}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {agenda.submissionsCount} {language === 'ta' ? 'கருத்துக்கள்' : 'Citizen Submissions'}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
                {language === 'ta' ? agenda.titleTamil : agenda.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed break-words">{agenda.description}</p>

              {/* AI Synthesized Citizen Themes */}
              {agenda.aiExtractedThemes && agenda.aiExtractedThemes.length > 0 && (
                <div className="pt-2 border-t border-purple-200/60 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                    AI Themes:
                  </span>
                  {agenda.aiExtractedThemes.map((th, i) => (
                    <span key={i} className="text-[10px] bg-white border border-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-medium shadow-2xs">
                      #{th}
                    </span>
                  ))}
                </div>
              )}

              {/* Official Resolution */}
              {agenda.officialDecision && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between text-emerald-900 font-bold gap-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      {t.gramSabhaResolution}
                    </span>
                    {agenda.ledgerHash && (
                      <span className="font-mono text-[9px] text-slate-400">
                        Hash: {agenda.ledgerHash.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-950 font-medium leading-relaxed break-words">
                    {language === 'ta' && agenda.officialDecisionTamil ? agenda.officialDecisionTamil : agenda.officialDecision}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Speak on Selected Agenda Button */}
        <div className="pt-2">
          {!showVoiceRecorder ? (
            <button
              onClick={() => setShowVoiceRecorder(true)}
              className="w-full py-3 sm:py-3.5 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span className="text-center">{language === 'ta' ? 'இக்கூட்டத்தில் உங்கள் குரலை பதிவு செய்யுங்கள்' : 'Speak Your Opinion on This Agenda'}</span>
            </button>
          ) : (
            <VoiceRecorder
              promptText={language === 'ta' ? `நிகழ்ச்சி நிரல்: ${selectedAgenda.titleTamil}` : `Agenda: ${selectedAgenda.title}`}
              onRecorded={handleVoiceRecorded}
            />
          )}
        </div>
      </div>
    </div>
  );
};
