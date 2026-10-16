/**
 * GramVoice TN - Government Document AI & DPR Generator
 * Production-Grade Multilingual DPR Synthesizer & Biometric Technical Sanction Console
 */
import React, { useState } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  Download, 
  Building2, 
  QrCode, 
  Fingerprint,
  Share2,
  Calendar,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { api } from '../../services/api';
import { BiometricSignOffModal } from '../common/BiometricSignOffModal';

interface GovernmentDPRProps {
  onBack: () => void;
}

export const GovernmentDPR: React.FC<GovernmentDPRProps> = ({ onBack }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState<string>('Periyar Nagar Flood Drainage & Culvert Construction');
  const [description, setDescription] = useState<string>('Heavy rainfall caused severe water logging in Ward 4 and 5 affecting 400 households and the village high school. Proposed 1.2km reinforced concrete stormwater drain connecting to the main irrigation lake with silt traps and road culvert crossings.');
  const [budget, setBudget] = useState<number>(3800000);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dprResult, setDprResult] = useState<any | null>(null);

  // Biometric Technical Sanction State
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [signedSanctionOrder, setSignedSanctionOrder] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const result = await api.generateDPR(title, description, budget);
      setDprResult(result);
    } catch (e: any) {
      console.warn(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSanctionSigned = (signData: any) => {
    setSignedSanctionOrder({
      orderNumber: `GO-TN-RD-TS-${Date.now().toString().slice(-6)}`,
      title,
      budget,
      signedBy: signData.signer,
      role: signData.role,
      signatureHash: signData.signatureHash,
      timestamp: signData.timestamp,
      panchayatName: currentUser.panchayatName
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-1 sm:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {dprResult && !signedSanctionOrder && (
          <button
            onClick={() => setShowSignModal(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>Issue Technical Sanction (Biometric)</span>
          </button>
        )}
      </div>

      {/* Success Sanction Order Certificate Banner */}
      {signedSanctionOrder && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/50 text-emerald-200 text-xs font-bold border border-emerald-400/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>TECHNICAL SANCTION (TS) ACCORDED</span>
            </div>
            <span className="font-mono text-xs text-emerald-300 font-bold">
              {signedSanctionOrder.orderNumber}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {signedSanctionOrder.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/10">
              <span className="text-[10px] text-emerald-300 block font-bold">SANCTIONED OUTLAY</span>
              <span className="text-sm font-bold font-mono text-white">₹{(signedSanctionOrder.budget / 100000).toFixed(1)} Lakhs</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10">
              <span className="text-[10px] text-emerald-300 block font-bold">SIGNING AUTHORITY</span>
              <span className="text-xs font-semibold text-white">{signedSanctionOrder.signedBy} ({signedSanctionOrder.role})</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10">
              <span className="text-[10px] text-emerald-300 block font-bold">BLOCKCHAIN SEAL</span>
              <span className="text-[10px] font-mono text-emerald-200 truncate block">{signedSanctionOrder.signatureHash.slice(0, 16)}...</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Sanction Order</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Generator Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            Document AI & Multilingual DPR Generator
          </h2>
          <p className="text-xs text-slate-500">
            Powered by Gemini 3.7 Flash: Transforms complex civil engineering DPRs into accessible citizen summaries in Tamil and structured budget breakdowns.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Concept Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Technical Scope & Engineering Inputs:</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget Outlay (₹):</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Synthesizing Multilingual DPR...' : 'Generate Bilingual DPR Summary (Gemini 3.7)'}
          </button>
        </form>

        {dprResult && (
          <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Generated Bilingual DPR Executive Output</h3>
              {!signedSanctionOrder && (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Biometric Sign</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-emerald-900 block">தமிழ் மக்கள் சுருக்கம் (Tamil Citizen Summary):</span>
              <p className="text-sm text-emerald-950 font-tamil leading-relaxed">{dprResult.summaryTamil}</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-800 block">English Administrative Summary:</span>
              <p className="text-xs text-slate-700 leading-relaxed">{dprResult.summaryEnglish}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Structured Budget Breakdown:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dprResult.budgetBreakdown?.map((b: any, i: number) => (
                  <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-medium text-slate-700">{b.category} ({b.percentage}%)</span>
                    <span className="font-bold text-slate-900 font-mono">₹{(b.estimatedAmount / 100000).toFixed(1)} L</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Biometric Sign-off Modal */}
      <BiometricSignOffModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSuccess={handleSanctionSigned}
        actionTitle={`Accord Technical Sanction: ${title}`}
        actionSubtitle={`Sanctioned Outlay: ₹${(budget / 100000).toFixed(1)} Lakhs under Rural Infrastructure Fund.`}
        documentRefNumber={`DPR-TS-${Date.now().toString().slice(-6)}`}
      />
    </div>
  );
};
