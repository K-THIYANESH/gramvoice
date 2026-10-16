/**
 * GramVoice TN - Government SLA Maintenance Triage & Dispatch Console
 * Production-Grade with Biometric Sign-Off, Technician Dispatch & Citizen Verification
 */
import React, { useState } from 'react';
import { 
  Wrench, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Send,
  Fingerprint,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { MaintenanceTicket } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { BiometricSignOffModal } from '../common/BiometricSignOffModal';

interface GovernmentMaintenanceProps {
  tickets: MaintenanceTicket[];
  onBack: () => void;
  onRefresh: () => void;
}

export const GovernmentMaintenance: React.FC<GovernmentMaintenanceProps> = ({ tickets, onBack, onRefresh }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [workerName, setWorkerName] = useState<string>('');
  const [workerContact, setWorkerContact] = useState<string>('');
  const [resolutionSummary, setResolutionSummary] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);

  const handleAssignWorker = async () => {
    if (!selectedTicket) return;
    try {
      await api.assignTicket(selectedTicket.id, workerName || 'K. Ramasamy (Lineman)', workerContact || '9842112345');
      setStatusMsg({ 
        type: 'success', 
        text: `Field technician dispatched! SMS notification triggered to citizen & technician.` 
      });
      setShowAssignModal(false);
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Assignment failed' });
    }
  };

  const handleTriggerResolveSign = () => {
    setShowResolveModal(false);
    setShowBiometricModal(true);
  };

  const handleBiometricResolveComplete = async (signData: any) => {
    if (!selectedTicket) return;
    try {
      const res = await api.resolveTicket(
        selectedTicket.id,
        resolutionSummary || 'Repaired and verified operational on field.',
        'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=800&q=80',
        currentUser.role,
        currentUser.id
      );
      setStatusMsg({
        type: 'success',
        text: `Ticket #${selectedTicket.ticketNumber} marked resolved with Biometric GovPass! Decision signed to ledger: ${res.ledgerBlock.hash.slice(0, 16)}...`
      });
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Resolution failed' });
    }
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

        <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
          SLA Triage Engine Active
        </span>
      </div>

      {statusMsg && (
        <Alert type={statusMsg.type} message={statusMsg.text} />
      )}

      {/* SLA Triage Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Public Grievance & SLA Dispatch Queue
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic priority scheduling with automatic countdown escalation (Urgent: 24h, High: 48h, Medium: 72h).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Category & Location</th>
                <th className="p-3">Priority / SLA</th>
                <th className="p-3">SLA Due Status</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Worker</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{t.category}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> Ward {t.wardNumber} ({t.gpsLocation.landmark})
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge type="priority" value={t.priority} />
                  </td>
                  <td className="p-3">
                    <StatusBadge type="sla" value={t.isBreached ? 'breached' : 'ok'} />
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {t.assignedWorkerName ? (
                      <span className="text-emerald-700 font-medium">{t.assignedWorkerName}</span>
                    ) : (
                      <span className="text-red-500 font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {t.status === 'REPORTED' && (
                      <button
                        onClick={() => { setSelectedTicket(t); setShowAssignModal(true); }}
                        className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                      >
                        Assign Worker
                      </button>
                    )}
                    {(t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') && (
                      <button
                        onClick={() => { setSelectedTicket(t); setShowResolveModal(true); }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {t.status === 'RESOLVED' && (
                      <span className="text-emerald-700 font-bold">Resolved ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setShowAssignModal(false)}
          title={`Assign Worker: Ticket #${selectedTicket.ticketNumber}`}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Technician / Line Worker Name:</label>
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder="e.g. K. Ramasamy (Panchayat Lineman)"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Worker Contact Phone:</label>
              <input
                type="text"
                value={workerContact}
                onChange={(e) => setWorkerContact(e.target.value)}
                placeholder="e.g. 9842112345"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-xs text-slate-600 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleAssignWorker} className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer">Dispatch Worker</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setShowResolveModal(false)}
          title={`Resolve Grievance: #${selectedTicket.ticketNumber}`}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Summary:</label>
              <textarea
                rows={3}
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="e.g. Leak plugged with new 2-inch PVC junction. Tested pressure OK."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
              <strong>Biometric GovPass Confirmation:</strong> You will authenticate with your official fingerprint or face ID to finalize this resolution.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowResolveModal(false)} className="px-4 py-2 text-xs text-slate-600 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleTriggerResolveSign} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Fingerprint className="w-4 h-4" />
                Proceed to Biometric e-Sign
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Biometric Sign-off Modal */}
      <BiometricSignOffModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleBiometricResolveComplete}
        actionTitle={`Resolve Grievance: #${selectedTicket?.ticketNumber}`}
        actionSubtitle={`Category: ${selectedTicket?.category} • Location: Ward ${selectedTicket?.wardNumber}`}
        documentRefNumber={`GRV-RES-${selectedTicket?.ticketNumber}`}
      />
    </div>
  );
};
