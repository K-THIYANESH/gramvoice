/**
 * GramVoice TN - Government Gram Sabha Synthesis & Resolution Console
 * Production-Grade with Biometric Cryptographic Sign-Off & Official Gazette Extract
 */
import React, { useState } from 'react';
import { 
  Users, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Send, 
  Clock, 
  MapPin, 
  Printer, 
  Fingerprint, 
  Download,
  Share2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { GramSabhaSession } from '../../types';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { BiometricSignOffModal } from '../common/BiometricSignOffModal';

interface GovernmentGramSabhaProps {
  gramSabhas: GramSabhaSession[];
  onBack: () => void;
  onRefresh: () => void;
}

export const GovernmentGramSabha: React.FC<GovernmentGramSabhaProps> = ({ gramSabhas, onBack, onRefresh }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedSessionId, setSelectedSessionId] = useState<string>(gramSabhas[0]?.id || 'gs-2026-01');
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>(gramSabhas[0]?.agendaItems[0]?.id || 'ag-01');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisResult, setSynthesisResult] = useState<any | null>(null);
  const [officialDecision, setOfficialDecision] = useState<string>('');
  const [officialDecisionTamil, setOfficialDecisionTamil] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState<boolean>(false);
  const [showBiometricSignModal, setShowBiometricSignModal] = useState<boolean>(false);

  const activeSession = gramSabhas.find(g => g.id === selectedSessionId) || gramSabhas[0];
  const activeAgenda = activeSession?.agendaItems.find(a => a.id === selectedAgendaId) || activeSession?.agendaItems[0];

  const handleSynthesize = async () => {
    if (!activeSession || !activeAgenda) return;
    setIsSynthesizing(true);
    setStatusMsg(null);

    try {
      const res = await api.synthesizeAgendaThemes(activeSession.id, activeAgenda.id);
      setSynthesisResult(res);
      setStatusMsg({
        type: 'success',
        text: 'Citizen voice opinions successfully synthesized with Gemini 3.7 Flash AI!'
      });
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Synthesis failed' });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleRecordDecision = async () => {
    if (!activeSession || !activeAgenda) return;
    setShowDecisionModal(false);
    setShowBiometricSignModal(true);
  };

  const handleBiometricSignComplete = async (signData: any) => {
    if (!activeSession || !activeAgenda) return;
    try {
      const res = await api.recordGramSabhaDecision(activeSession.id, {
        agendaItemId: activeAgenda.id,
        officialDecision: officialDecision || 'Resolution passed with majority vote.',
        officialDecisionTamil: officialDecisionTamil || 'பெரும்பான்மை ஆதரவுடன் தீர்மானம் நிறைவேற்றப்பட்டது.',
        decisionRationale: rationale || `Signed with Biometric GovPass by ${currentUser.name} (${currentUser.role})`,
        officialRole: currentUser.role,
        officialId: currentUser.id
      });

      setStatusMsg({
        type: 'success',
        text: `Official Gram Sabha resolution signed with Biometric GovPass onto Cryptographic Ledger! Block Hash: ${res.ledgerBlock.hash.slice(0, 16)}...`
      });
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Recording decision failed' });
    }
  };

  const handlePrintResolution = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-1 sm:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <span className="text-xs font-bold bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
          Session: {activeSession?.sessionNumber}
        </span>
      </div>

      {statusMsg && (
        <Alert type={statusMsg.type} message={statusMsg.text} />
      )}

      {/* Session Details Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block mb-1">
              Gram Sabha Administration
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {activeSession?.meetingDate} • {activeSession?.panchayatName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Venue: {activeSession?.venue} • Quorum: {activeSession?.actualAttendees} / {activeSession?.quorumTarget} Attendees
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDecisionModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Fingerprint className="w-4 h-4 text-emerald-200" />
              Sign Official Resolution
            </button>
          </div>
        </div>
      </div>

      {/* Agenda & AI Synthesis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda Selector */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Agenda Items ({activeSession?.agendaItems.length})
          </h3>

          <div className="space-y-2">
            {activeSession?.agendaItems.map((agenda, i) => (
              <div
                key={agenda.id}
                onClick={() => setSelectedAgendaId(agenda.id)}
                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedAgendaId === agenda.id 
                    ? 'bg-purple-50 border-purple-400 font-bold text-purple-950' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Agenda #{i + 1}</span>
                  <span>{agenda.submissionsCount} submissions</span>
                </div>
                <div className="font-semibold">{agenda.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Citizen Submissions & AI Theme Synthesis */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">{activeAgenda?.title}</h3>
              <p className="text-xs text-slate-500">{activeAgenda?.description}</p>
            </div>

            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              {isSynthesizing ? 'Synthesizing...' : 'Run AI Theme Synthesis'}
            </button>
          </div>

          {/* AI Extracted Themes */}
          {activeAgenda?.aiExtractedThemes && activeAgenda.aiExtractedThemes.length > 0 && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Synthesized Key Themes (Gemini 3.7 Flash)
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {activeAgenda.aiExtractedThemes.map((th, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold shadow-2xs">
                    #{th}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Existing Official Decision */}
          {activeAgenda?.officialDecision ? (
            <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-3xl space-y-3 text-xs">
              <div className="flex items-center justify-between text-emerald-950 font-bold">
                <span className="flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" /> Official Signed Resolution
                </span>
                <span className="font-mono text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900">
                  {activeAgenda.ledgerHash?.slice(0, 16) || '0x7c4e2a9b1d8f'}...
                </span>
              </div>
              <p className="text-slate-800 font-semibold text-sm leading-relaxed">{activeAgenda.officialDecision}</p>
              <p className="text-emerald-900 font-medium font-tamil leading-relaxed">{activeAgenda.officialDecisionTamil}</p>
              
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Signed by {activeAgenda.signedByOfficialRole || currentUser.role}
                </span>
                <button
                  onClick={handlePrintResolution}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-emerald-300 rounded-lg text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-emerald-700" />
                  <span>Print Resolution Extract</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-500">No official resolution signed for this agenda yet.</p>
              <button
                onClick={() => setShowDecisionModal(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Record Decision Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Record Decision Modal */}
      <Modal
        isOpen={showDecisionModal}
        onClose={() => setShowDecisionModal(false)}
        title={`Draft Gram Sabha Resolution: ${activeAgenda?.title}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Resolution Text (English):</label>
            <textarea
              rows={2}
              value={officialDecision}
              onChange={(e) => setOfficialDecision(e.target.value)}
              placeholder="e.g. Gram Sabha resolved to approve the road tender with revised alignment."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">தீர்மான உரை (Tamil):</label>
            <textarea
              rows={2}
              value={officialDecisionTamil}
              onChange={(e) => setOfficialDecisionTamil(e.target.value)}
              placeholder="எ.கா. திருத்தப்பட்ட சாலையமைப்புடன் பணிகளை துவங்க கிராம சபை ஒப்புதல் அளிக்கிறது."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-tamil"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
            <strong>GovPass Biometric Validation:</strong> In the next step, you will be prompted to authenticate with your biometric credentials before the resolution is anchored to the permanent ledger.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowDecisionModal(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRecordDecision}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Fingerprint className="w-4 h-4" />
              Proceed to Biometric e-Sign
            </button>
          </div>
        </div>
      </Modal>

      {/* Biometric Sign-off Modal */}
      <BiometricSignOffModal
        isOpen={showBiometricSignModal}
        onClose={() => setShowBiometricSignModal(false)}
        onSuccess={handleBiometricSignComplete}
        actionTitle={`Sign Gram Sabha Resolution: ${activeAgenda?.title}`}
        actionSubtitle={`Session ${activeSession?.sessionNumber} • ${activeSession?.meetingDate}`}
        documentRefNumber={`GS-RES-${activeAgenda?.id || '01'}`}
      />
    </div>
  );
};
