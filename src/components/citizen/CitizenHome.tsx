/**
 * GramVoice TN - Mobile-First Visual Citizen Home Screen
 * Highly Minimalist in Text • Visually Speaking & Engaging
 * Includes Biometric Trust Badges, Flash Civic Alerts & GPDP Budget Transparency
 */
import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  Users, 
  AlertCircle, 
  Lightbulb, 
  Hammer, 
  History, 
  Sparkles, 
  MapPin, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Mic, 
  Calendar, 
  Volume2, 
  Layers,
  Fingerprint,
  AlertTriangle,
  Coins,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Project, GramSabhaSession, MaintenanceTicket } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface CitizenHomeProps {
  onNavigate: (view: string, data?: any) => void;
  projects: Project[];
  gramSabhas: GramSabhaSession[];
  activeTickets: MaintenanceTicket[];
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({ onNavigate, projects, gramSabhas, activeTickets }) => {
  const { language, t } = useLanguage();
  const { currentUser, setShowAuthModal } = useAuth();

  const [showAlert, setShowAlert] = useState<boolean>(true);

  // Active consultation project
  const activeConsultation = projects.find(p => p.stage === 'PARTICIPATE' || p.status === 'consultation') || projects[0];
  const upcomingGramSabha = gramSabhas.find(g => g.status === 'scheduled' || g.status === 'consultation_open') || gramSabhas[0];

  // Quick village metrics for visual counter pill
  const activeWorksCount = projects.filter(p => p.stage === 'MONITOR' || p.stage === 'PARTICIPATE').length || projects.length;
  const totalOpinionsCount = projects.reduce((acc, p) => acc + (p.participationCount || 0), 0);
  const resolvedIssuesCount = activeTickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16 px-1 sm:px-0">
      {/* 1. Visual Hero Card with Live Village Stats & Biometric e-KYC Verification */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-4.5 sm:p-6 shadow-md glow-emerald">
        {/* Subtle background decoration */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
          <Building2 className="w-28 h-28 text-white" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 backdrop-blur-xs text-emerald-200 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">{currentUser.panchayatName} • Ward {currentUser.wardNumber || 4}</span>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold shrink-0 border border-emerald-400/30 transition-all cursor-pointer"
              title="Click to check Biometric e-KYC Auth"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'ta' ? 'பயோமெட்ரிக் அங்கீகாரம்' : 'Aadhaar e-KYC Verified'}</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight break-words">
              {language === 'ta' ? `வணக்கம், ${currentUser.nameTamil || currentUser.name}!` : `Vanakkam, ${currentUser.name}!`}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 opacity-90 leading-relaxed">
              {language === 'ta' ? 'உங்கள் கிராமத்தின் குரல், உங்கள் வளர்ச்சி' : 'Your voice powers rural local governance'}
            </p>
          </div>

          {/* Micro Stats Bar with Auto-Wrapping and increased min-height */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-700/50">
            <div className="bg-emerald-950/40 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 text-center border border-emerald-600/30 flex flex-col justify-center min-h-[64px]">
              <span className="block text-[10px] text-emerald-300 uppercase tracking-wider font-semibold leading-tight">
                {language === 'ta' ? 'திட்டங்கள்' : 'Active Works'}
              </span>
              <span className="text-lg sm:text-xl font-black text-white mt-0.5">{activeWorksCount}</span>
            </div>

            <div className="bg-emerald-950/40 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 text-center border border-emerald-600/30 flex flex-col justify-center min-h-[64px]">
              <span className="block text-[10px] text-emerald-300 uppercase tracking-wider font-semibold leading-tight">
                {language === 'ta' ? 'குரல் பதிவுகள்' : 'Opinions'}
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">{totalOpinionsCount}</span>
            </div>

            <div className="bg-emerald-950/40 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 text-center border border-emerald-600/30 flex flex-col justify-center min-h-[64px]">
              <span className="block text-[10px] text-emerald-300 uppercase tracking-wider font-semibold leading-tight">
                {language === 'ta' ? 'தீர்க்கப்பட்டவை' : 'Resolved'}
              </span>
              <span className="text-lg sm:text-xl font-black text-teal-300 mt-0.5">{resolvedIssuesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Flash Civic Alert SOS Hub (Monsoon / Water Schedule) */}
      {showAlert && (
        <div className="p-3.5 bg-linear-to-r from-red-50 via-amber-50 to-white border border-red-200 rounded-3xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                  {language === 'ta' ? 'அறிவிப்பு' : 'Panchayat Notice'}
                </span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {language === 'ta' ? 'குடிநீர் விநியோக பராமரிப்பு பணி (வார்டு 2 & 4)' : 'Overhead Tank Maintenance (Ward 2 & 4)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                {language === 'ta' ? 'நாளை காலை 7 மணி முதல் 11 மணி வரை குடிநீர் குழாய் பழுதுநீக்கம் நடைபெறும்.' : 'Pipeline repairs scheduled tomorrow from 7 AM to 11 AM.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAlert(false)}
            className="text-[11px] text-slate-400 hover:text-slate-700 font-bold px-2 py-1 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Visual Urgent Consultation Banner */}
      {activeConsultation && (
        <div 
          onClick={() => onNavigate('project_detail', activeConsultation)}
          className="relative overflow-hidden bg-linear-to-r from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'ta' ? 'பொதுமக்கள் கருத்து கேட்கப்படுகிறது' : 'OPEN FOR CITIZEN VOICE'}</span>
            </div>
            <span className="text-xs text-amber-900 font-bold flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              {language === 'ta' ? '4 நாட்கள் மீதம்' : '4 days left'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug break-words">
            {language === 'ta' ? activeConsultation.titleTamil : activeConsultation.title}
          </h3>

          {/* Visual Mini Progress & Voice Waveform Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-amber-200/70">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Mic className="w-3 h-3 text-emerald-700" />
                {activeConsultation.voiceResponsesCount} {language === 'ta' ? 'குரல்கள்' : 'Voices'}
              </span>
              <span className="text-xs text-slate-600 font-bold">
                ₹{(activeConsultation.budgetTotal / 100000).toFixed(1)}L
              </span>
            </div>

            <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 group-hover:translate-x-1 transition-transform">
              <span>{t.btnGiveOpinion}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* 4. 6 Primary Interactive Civic Action Tiles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'ta' ? 'விரைவு சேவைகள்' : 'Quick Actions'}
          </h3>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Mic className="w-3 h-3" />
            {language === 'ta' ? 'குரல் வழி சேவை' : 'Tamil Voice Enabled'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Action 1: Give Your Opinion */}
          <button
            onClick={() => onNavigate('projects')}
            className="flex flex-col items-start p-3.5 sm:p-4 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-400 rounded-3xl shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer relative overflow-hidden min-h-[145px] sm:min-h-[155px] justify-between"
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-800 leading-snug break-words">
                {t.btnGiveOpinion}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 leading-tight break-words">
              {language === 'ta' ? 'திட்டங்களில் கருத்து' : 'Speak in consultations'}
            </span>
          </button>

          {/* Action 2: Digital Gram Sabha */}
          <button
            onClick={() => onNavigate('gramsabha')}
            className="flex flex-col items-start p-3.5 sm:p-4 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-400 rounded-3xl shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer relative overflow-hidden min-h-[145px] sm:min-h-[155px] justify-between"
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-purple-800 leading-snug break-words">
                {t.btnJoinGramSabha}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 leading-tight break-words">
              {language === 'ta' ? 'நிகழ்ச்சி நிரல் & வாக்கு' : 'Agenda & resolutions'}
            </span>
          </button>

          {/* Action 3: Report a Problem */}
          <button
            onClick={() => onNavigate('report_problem')}
            className="flex flex-col items-start p-3.5 sm:p-4 bg-white hover:bg-red-50/70 border border-slate-200 hover:border-red-400 rounded-3xl shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer relative overflow-hidden min-h-[145px] sm:min-h-[155px] justify-between"
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-red-800 leading-snug break-words">
                {t.btnReportProblem}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 leading-tight break-words">
              {language === 'ta' ? 'குடிநீர், மின்சாரம் SLA' : 'Fix water, streetlights'}
            </span>
          </button>

          {/* Action 4: Suggest a Project */}
          <button
            onClick={() => onNavigate('suggest_project')}
            className="flex flex-col items-start p-3.5 sm:p-4 bg-white hover:bg-amber-50/70 border border-slate-200 hover:border-amber-400 rounded-3xl shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer relative overflow-hidden min-h-[145px] sm:min-h-[155px] justify-between"
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-800 leading-snug break-words">
                {t.btnSuggestProject}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 leading-tight break-words">
              {language === 'ta' ? 'புதிய யோசனை & ஆதரவு' : 'Propose village ideas'}
            </span>
          </button>

          {/* Action 5: Construction Quality Watch */}
          <button
            onClick={() => onNavigate('construction_watch')}
            className="flex flex-col items-start p-3.5 sm:p-4 bg-white hover:bg-orange-50/70 border border-slate-200 hover:border-orange-400 rounded-3xl shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer relative overflow-hidden min-h-[145px] sm:min-h-[155px] justify-between"
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Hammer className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-orange-800 leading-snug break-words">
                {t.btnConstructionWatch}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 leading-tight break-words">
              {language === 'ta' ? 'புகைப்பட கள ஆய்வு' : 'Upload site photos'}
            </span>
          </button>

          {/* Action 6: My Activity & Receipts */}
          <button
            onClick={() => onNavigate('my_activity')}
            className="flex flex-col items-start p-3.5 sm:p-4 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-400 rounded-3xl shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer relative overflow-hidden min-h-[145px] sm:min-h-[155px] justify-between"
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <History className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-800 leading-snug break-words">
                {t.btnMyActivity}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 leading-tight break-words">
              {language === 'ta' ? 'ரசீது & பணி மதிப்பீடு' : 'Receipts & Track Status'}
            </span>
          </button>
        </div>
      </div>

      {/* 5. Village GPDP Budget & Funds Transparency Ledger */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
            <Coins className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{language === 'ta' ? 'ஊராட்சி நிதி & வரவு-செலவு கணக்கு (GPDP)' : 'Panchayat GPDP Fund Ledger'}</span>
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            FY 2025-2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              {language === 'ta' ? 'மொத்த ஒதுக்கீடு' : 'Total Sanctioned'}
            </span>
            <span className="text-base font-black text-slate-900">₹48,50,000</span>
            <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">15th Finance + State Fund</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              {language === 'ta' ? 'செலவிடப்பட்ட தொகை' : 'Expended / Utilized'}
            </span>
            <span className="text-base font-black text-emerald-700">₹34,20,000</span>
            <span className="text-[10px] text-slate-600 block font-semibold mt-0.5">70.5% Utilization Rate</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              {language === 'ta' ? 'இருப்புத் தொகை' : 'Unspent Balance'}
            </span>
            <span className="text-base font-black text-blue-700">₹14,30,000</span>
            <span className="text-[10px] text-slate-600 block font-semibold mt-0.5">Allocated to New DPRs</span>
          </div>
        </div>
      </div>

      {/* 6. Upcoming Gram Sabha Radar Card */}
      {upcomingGramSabha && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>{t.gramSabhaNextMeeting}</span>
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {upcomingGramSabha.sessionNumber}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-700 shrink-0" />
                <span>{upcomingGramSabha.meetingDate} • {upcomingGramSabha.meetingTime}</span>
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium break-words">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{language === 'ta' ? upcomingGramSabha.venueTamil : upcomingGramSabha.venue}</span>
              </p>
            </div>

            <button
              onClick={() => onNavigate('gramsabha', upcomingGramSabha)}
              className="w-full sm:w-auto px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>{language === 'ta' ? 'நிகழ்ச்சி நிரல் & கருத்து' : 'View Agenda & Speak'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
