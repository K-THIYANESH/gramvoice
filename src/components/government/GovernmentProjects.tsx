/**
 * GramVoice TN - Government Project & Milestone Sign-off Console
 */
import React, { useState } from 'react';
import { Layers, ArrowLeft, CheckCircle2, ShieldCheck, IndianRupee, Clock, AlertCircle, FileText, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Project, ProjectStage } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CivicJourneyStepper } from '../common/CivicJourneyStepper';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface GovernmentProjectsProps {
  projects: Project[];
  onBack: () => void;
  onRefresh: () => void;
}

export const GovernmentProjects: React.FC<GovernmentProjectsProps> = ({ projects, onBack, onRefresh }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-001');
  const [isUpdatingStage, setIsUpdatingStage] = useState<boolean>(false);
  const [selectedStageToAdvance, setSelectedStageToAdvance] = useState<ProjectStage>('VALIDATE');
  const [rationale, setRationale] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState<boolean>(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState<any | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleAdvanceStage = async () => {
    if (!activeProject) return;
    setIsUpdatingStage(true);
    setStatusMsg(null);

    try {
      const res = await api.updateProjectStage(
        activeProject.id,
        selectedStageToAdvance,
        currentUser.role,
        currentUser.id,
        rationale || `Stage advanced to ${selectedStageToAdvance} by ${currentUser.name}`
      );
      setStatusMsg({
        type: 'success',
        text: `Stage successfully updated to ${selectedStageToAdvance}! Decision hash recorded to ledger: ${res.ledgerBlock.hash.slice(0, 12)}...`
      });
      setShowAdvanceModal(false);
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update stage' });
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleVerifyMilestone = async (milestone: any, releasePayment: boolean) => {
    try {
      await api.updateMilestone(activeProject.id, milestone.id, {
        status: 'verified',
        verifiedBy: currentUser.name,
        releasePayment,
        officialRole: currentUser.role,
        rationale: `Milestone "${milestone.title}" inspected & verified by ${currentUser.name}.`
      });
      setStatusMsg({
        type: 'success',
        text: `Milestone verified! ${releasePayment ? `Disbursement of ₹${(milestone.amountAllocated / 100000).toFixed(1)} Lakhs signed onto Cryptographic Ledger.` : ''}`
      });
      setShowMilestoneModal(null);
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Verification failed' });
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {statusMsg && (
        <Alert type={statusMsg.type} message={statusMsg.text} />
      )}

      {/* Project Banner & Stage Controller */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                {activeProject.code}
              </span>
              <span className="text-xs text-slate-500">{activeProject.category} • Ward {activeProject.wardNumber}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{activeProject.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedStageToAdvance('VALIDATE'); setShowAdvanceModal(true); }}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              Advance Lifecycle Stage
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="pt-2 border-t border-slate-100">
          <CivicJourneyStepper currentStage={activeProject.stage} />
        </div>
      </div>

      {/* Milestones & Contractor Payment Management */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Civil Engineering Milestones & Payment Sign-off
            </h3>
            <p className="text-xs text-slate-500">
              Verifications are cryptographically anchored to prevent backdated contractor claims.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {activeProject.milestones.map((m, idx) => (
            <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Milestone #{idx + 1}:</span>
                  <span className="font-bold text-slate-900 text-sm">{m.title}</span>
                </div>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                  <span>Target: <strong>{m.targetDate}</strong></span>
                  <span>Share: <strong>{m.budgetSharePct}% (₹{(m.amountAllocated / 100000).toFixed(1)} L)</strong></span>
                  <span>Site Photos: <strong>{m.evidencePhotoCount} verified</strong></span>
                </div>
                {m.verifiedBy && (
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Signed off by {m.verifiedBy}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {m.status === 'verified' ? (
                  <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Payment Released
                  </span>
                ) : (
                  <button
                    onClick={() => setShowMilestoneModal(m)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-2xs"
                  >
                    Inspect & Sign-off
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advance Stage Modal */}
      <Modal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        title={`Advance Project Stage: ${activeProject.code}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Civic Stage:</label>
            <select
              value={selectedStageToAdvance}
              onChange={(e) => setSelectedStageToAdvance(e.target.value as ProjectStage)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="SUGGEST">SUGGEST (Citizen Ideas)</option>
              <option value="PARTICIPATE">PARTICIPATE (Public Consultation Open)</option>
              <option value="VALIDATE">VALIDATE (Gram Sabha Sanction)</option>
              <option value="MONITOR">MONITOR (Active Construction)</option>
              <option value="MAINTAIN">MAINTAIN (Routine Asset SLA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Constitutional Rationale / Resolution Ref:</label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="e.g. Gram Sabha approved resolution #4 with quorum of 120 citizens. Advancing to tendering."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
            <strong>Cryptographic Guarantee:</strong> This action creates an immutable SHA-256 block chained with previous decisions, logged under your official identity: <strong>{currentUser.name} ({currentUser.role})</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAdvanceModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleAdvanceStage}
              disabled={isUpdatingStage}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold"
            >
              Confirm & Sign Ledger Block
            </button>
          </div>
        </div>
      </Modal>

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowMilestoneModal(null)}
          title={`Milestone Sign-off: ${showMilestoneModal.title}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Confirm civil engineering inspection for <strong>{showMilestoneModal.title}</strong>. Budget share to be disbursed: <strong>₹{(showMilestoneModal.amountAllocated / 100000).toFixed(1)} Lakhs</strong>.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowMilestoneModal(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyMilestone(showMilestoneModal, true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                Verify & Authorize Payment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
