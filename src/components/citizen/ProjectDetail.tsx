/**
 * GramVoice TN - Citizen Project Detail & 6-Stage Civic Journey
 * Visual Timeline, Audio Synthesis Waveform & CEI Metrics
 * Fully responsive on mobile: wrapping tags, expanding boxes, flexible buttons
 */
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  FileText, 
  Mic, 
  ShieldCheck, 
  Send, 
  Building2, 
  Calendar, 
  IndianRupee, 
  Layers, 
  MessageSquare 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { Project, CitizenSubmission } from '../../types';
import { CivicJourneyStepper } from '../common/CivicJourneyStepper';
import { StatusBadge } from '../common/StatusBadge';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { Alert } from '../common/Alert';
import { api } from '../../services/api';

interface ProjectDetailProps {
  project: Project;
  submissions: CitizenSubmission[];
  onBack: () => void;
  onRefreshProject: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, submissions, onBack, onRefreshProject }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { isOnline, enqueueItem } = useOffline();

  const [activeTab, setActiveTab] = useState<'journey' | 'dpr' | 'voice' | 'opinions'>('journey');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [submittingVoice, setSubmittingVoice] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const projectSubmissions = submissions.filter(s => s.projectId === project.id);

  const handleVoiceRecorded = async (result: { audioBase64?: string; textFallback: string; durationSeconds: number }) => {
    setSubmittingVoice(true);
    setSubmitSuccess(null);

    const payload = {
      projectId: project.id,
      audioBase64: result.audioBase64,
      textFallback: result.textFallback,
      citizenName: currentUser.name,
      citizenPhone: currentUser.phone,
      panchayatId: project.panchayatId,
      durationSeconds: result.durationSeconds
    };

    try {
      if (!isOnline) {
        await enqueueItem('voice_submission', payload);
        setSubmitSuccess(t.offlineBannerSubtitle);
      } else {
        await api.submitVoice(payload);
        setSubmitSuccess(language === 'ta' ? 'உங்கள் கருத்து வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Your feedback has been submitted successfully!');
        onRefreshProject();
      }
    } catch (err: any) {
      console.warn('Voice submit failed, saving to offline queue:', err);
      await enqueueItem('voice_submission', payload);
      setSubmitSuccess(t.offlineBannerSubtitle);
    } finally {
      setSubmittingVoice(false);
    }
  };

  const handleSpeechSynthesis = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16 px-1 sm:px-0">
      {/* Header & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.btnBack}
        </button>

        <StatusBadge type="stage" value={project.stage} size="md" />
      </div>

      {/* Hero Visual Project Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            {project.code}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{project.panchayatName} • Ward {project.wardNumber}</span>
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
          {language === 'ta' ? project.titleTamil : project.title}
        </h2>

        {/* Audio Speech Waveform Button */}
        <button
          onClick={() => handleSpeechSynthesis(language === 'ta' ? project.descriptionTamil : project.description)}
          className="w-full p-3 sm:p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 cursor-pointer transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            {isPlayingAudio ? (
              <VolumeX className="w-5 h-5 text-emerald-700 animate-pulse shrink-0" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-700 shrink-0" />
            )}
            <span className="truncate">
              {isPlayingAudio 
                ? (language === 'ta' ? 'ஆடியோ ஒலிப்பதை நிறுத்தவும்' : 'Stop Audio Voice') 
                : (language === 'ta' ? 'தமிழில் திட்ட விவரங்களை கேளுங்கள் (Audio)' : 'Listen in Tamil (Audio Summary)')}
            </span>
          </div>
          <span className="text-[11px] bg-emerald-700 text-white px-2 py-0.5 rounded-lg shrink-0">
            AI Speech
          </span>
        </button>

        {/* Key Indicators Bar with Auto Wrapping */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center min-h-[58px]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold leading-tight">Total Outlay</span>
            <span className="font-black text-slate-900 text-xs sm:text-sm mt-0.5 break-words">
              ₹{(project.budgetTotal / 100000).toFixed(1)} Lakhs
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center min-h-[58px]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold leading-tight">Scheme</span>
            <span className="font-bold text-slate-700 text-xs mt-0.5 truncate">
              {project.fundingSource}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center min-h-[58px]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold leading-tight">Contractor</span>
            <span className="font-bold text-slate-700 text-xs mt-0.5 truncate">
              {project.contractorName || 'Tender Issued'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center min-h-[58px]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold leading-tight">Civil Status</span>
            <span className="font-black text-emerald-700 text-xs mt-0.5">
              {project.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 6-Stage Interactive Civic Journey Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {language === 'ta' ? '6-படி மக்கள் ஆட்சிப் பயணம்' : '6-Stage Civic Journey'}
        </h3>
        <CivicJourneyStepper currentStage={project.stage} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('journey')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all text-center shrink-0 ${
            activeTab === 'journey' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ta' ? 'பணி மைல்கற்கள்' : 'Milestones & Timeline'}
        </button>

        <button
          onClick={() => setActiveTab('dpr')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all text-center shrink-0 ${
            activeTab === 'dpr' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ta' ? 'DPR திட்ட மதிப்பீடு' : 'DPR & Budget Breakdown'}
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all text-center shrink-0 ${
            activeTab === 'voice' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ta' ? 'கருத்து பதிவு (Voice)' : 'Speak Your Opinion'}
        </button>

        <button
          onClick={() => setActiveTab('opinions')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all text-center shrink-0 ${
            activeTab === 'opinions' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ta' ? `ஊர்மக்கள் குரல்கள் (${projectSubmissions.length})` : `Community Voice (${projectSubmissions.length})`}
        </button>
      </div>

      {submitSuccess && (
        <Alert type="success" title="Feedback Recorded" message={submitSuccess} />
      )}

      {/* Tab 1: Milestones Track */}
      {activeTab === 'journey' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <span>{language === 'ta' ? 'களப்பணி மைல்கற்கள் மற்றும் நிதி விடுவிப்பு' : 'Field Milestones & Payment Release'}</span>
          </h3>

          <div className="space-y-3">
            {project.milestones.map((m, idx) => (
              <div
                key={m.id}
                className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm break-words">{m.name}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                    m.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                    m.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>Target: <strong>{m.targetDate}</strong></span>
                  <span>Payment Allocation: <strong>₹{(m.fundAllocation / 100000).toFixed(2)} Lakhs</strong></span>
                </div>

                {m.officialVerificationNotes && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-medium break-words">
                    <span className="font-bold block">Verification Note:</span>
                    {m.officialVerificationNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: DPR & Budget */}
      {activeTab === 'dpr' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Detailed Project Report (DPR) Summary</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words">
            {language === 'ta' ? project.descriptionTamil : project.description}
          </p>

          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-emerald-950">Technical Specifications & Approvals</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div className="p-2 bg-white rounded-xl border border-emerald-100">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">Administrative Sanction (AS)</span>
                <span className="font-mono font-bold text-slate-800">AS-TN-RD-2025/441</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">Technical Sanction (TS)</span>
                <span className="font-mono font-bold text-slate-800">TS-CE-RDPR-982</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Speak Your Voice */}
      {activeTab === 'voice' && (
        <div className="space-y-4">
          <VoiceRecorder
            promptText={language === 'ta' ? `இத்திட்டம் பற்றி உங்கள் கருத்தை சொல்லுங்கள்` : `Record your opinion on this project`}
            onRecorded={handleVoiceRecorded}
          />
        </div>
      )}

      {/* Tab 4: Community Opinions Stream */}
      {activeTab === 'opinions' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {language === 'ta' ? 'கிராம மக்களின் கருத்துக்கள் மற்றும் பரிந்துரைகள்' : 'Community Voice Feedback'}
          </h3>

          {projectSubmissions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              {language === 'ta' ? 'இத்திட்டத்திற்கு இன்னும் கருத்துக்கள் பதிவாகவில்லை. முதலில் உங்கள் கருத்தை பதிவு செய்யுங்கள்!' : 'No citizen feedback recorded yet. Be the first to speak!'}
            </p>
          ) : (
            <div className="space-y-3">
              {projectSubmissions.map(s => (
                <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{s.citizenName}</span>
                    <StatusBadge type="sentiment" value={s.sentiment} />
                  </div>
                  <p className="text-slate-700 italic leading-relaxed break-words">"{s.transcriptEnglish || s.transcriptRaw}"</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    <span>Duration: {s.durationSeconds}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
