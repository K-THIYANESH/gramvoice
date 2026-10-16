/**
 * GramVoice TN - Government Construction Photo & Defect Review Console
 */
import React, { useState } from 'react';
import { Camera, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ConstructionPhotoReport } from '../../types';
import { Alert } from '../common/Alert';
import { api } from '../../services/api';

interface GovernmentConstructionProps {
  photos: ConstructionPhotoReport[];
  onBack: () => void;
  onRefresh: () => void;
}

export const GovernmentConstruction: React.FC<GovernmentConstructionProps> = ({ photos, onBack, onRefresh }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleVerify = async (id: string, status: string) => {
    try {
      await api.verifyConstructionPhoto(id, {
        officialStatus: status,
        verifiedBy: currentUser.name,
        officialNotes: `Inspected and categorized as ${status} by ${currentUser.name}.`
      });
      setStatusMsg({ type: 'success', text: `Photo report updated to ${status}!` });
      onRefresh();
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: 'Verification update failed' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {statusMsg && <Alert type={statusMsg.type} message={statusMsg.text} />}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-orange-600" />
          Construction Quality & Field Inspection Triage
        </h2>
        <p className="text-xs text-slate-500">
          Citizen site evidence analyzed by Gemini 3.7 Vision AI for structural defects, curing issues, and milestone verification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {photos.map(p => (
            <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3">
              <div className="h-48 rounded-2xl overflow-hidden bg-slate-200 relative">
                <img src={p.photoUrl} alt="Inspection" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900/80 text-white">
                  {p.reportType}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Reported by {p.citizenName}</span>
                  <span className="text-emerald-700">{p.officialStatus}</span>
                </div>
                <p className="text-slate-600">{p.comment}</p>
              </div>

              {p.aiDefectAnalysis && (
                <div className="p-3 bg-white border border-slate-200 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    AI Vision Assessment (Gemini 3.7):
                  </span>
                  <p className="text-slate-700">{p.aiDefectAnalysis.summary}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Defect Category: <strong>{p.aiDefectAnalysis.defectCategory}</strong></span>
                    <span>Confidence: <strong>{Math.round(p.aiDefectAnalysis.confidenceScore * 100)}%</strong></span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleVerify(p.id, 'verified_accurate')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Verify Accurate
                </button>
                <button
                  onClick={() => handleVerify(p.id, 'remedial_action_ordered')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Order Remedial Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
