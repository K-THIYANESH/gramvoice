/**
 * GramVoice TN - Cryptographic Decision Ledger Console & Integrity Explorer
 * Visual Block Chain Nodes, SHA-256 Aura & Real-time Tamper Resistance Inspector
 */
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Database, 
  Link2,
  Sparkles,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LedgerBlock } from '../../types';
import { Alert } from '../common/Alert';
import { api } from '../../services/api';

interface GovernmentLedgerProps {
  onBack: () => void;
}

export const GovernmentLedger: React.FC<GovernmentLedgerProps> = ({ onBack }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [verification, setVerification] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLedger();
      setBlocks(data.blocks);
      setVerification(data.verification);
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: 'Failed to load ledger data' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerifyLedger = async () => {
    setIsAuditing(true);
    try {
      const result = await api.verifyLedger();
      setVerification(result);
      if (result.isValid) {
        setStatusMsg({ type: 'success', text: t.ledgerValidStatus });
      } else {
        setStatusMsg({ type: 'error', text: `${t.ledgerInvalidStatus} (Broken at Block #${result.brokenAtIndex})` });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: 'Verification check failed' });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleTamperTest = async () => {
    setIsAuditing(true);
    try {
      const res = await api.simulateTamper(1);
      setVerification(res.verification);
      setStatusMsg({
        type: 'warning',
        text: 'Data tampering simulated on Block #1. The SHA-256 hash mismatch is immediately detected by the chain validator!'
      });
      fetchLedger();
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: 'Tamper test failed' });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRestore = async () => {
    setIsAuditing(true);
    try {
      const res = await api.restoreLedger(1);
      setVerification(res.verification);
      setStatusMsg({
        type: 'success',
        text: 'Ledger block restored to its authentic state. Cryptographic chain integrity verified 100%.'
      });
      fetchLedger();
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: 'Restore failed' });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <span className="text-xs font-mono font-bold bg-slate-900 text-emerald-400 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> SHA-256 Hash Chain
        </span>
      </div>

      {statusMsg && (
        <Alert type={statusMsg.type} message={statusMsg.text} />
      )}

      {/* Hero Visual Cryptographic Vault Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4 glow-emerald">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verifiable Decision Ledger
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t.ledgerTitle}</h2>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerifyLedger}
              disabled={isAuditing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              {t.ledgerVerifyButton}
            </button>

            <button
              onClick={handleTamperTest}
              className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              {t.ledgerTamperTestButton}
            </button>

            <button
              onClick={handleRestore}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              {t.ledgerRestoreButton}
            </button>
          </div>
        </div>

        {/* Visual Live Integrity Bar */}
        {verification && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            verification.isValid 
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' 
              : 'bg-red-950/80 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center gap-2 font-black text-sm">
              {verification.isValid ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
              <span>{verification.isValid ? t.ledgerValidStatus : t.ledgerInvalidStatus}</span>
            </div>
            <div className="font-mono text-[11px] opacity-80">
              {verification.totalBlocks} Blocks Linked • Algorithm: SHA-256
            </div>
          </div>
        )}
      </div>

      {/* Visual Block Chain Nodes */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
          Cryptographic Block Stream ({blocks.length} Nodes)
        </h3>

        <div className="space-y-3">
          {blocks.map((b, i) => (
            <div 
              key={b.hash} 
              className={`bg-white rounded-3xl border p-5 shadow-2xs transition-all space-y-3 relative ${
                b.tampered ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs">
                    Node #{b.index}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {b.actionType}
                  </span>
                  {b.tampered && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                      TAMPERED
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {new Date(b.timestamp).toLocaleDateString()} {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Signer</span>
                  <span className="font-bold text-slate-800">{b.officialRole} ({b.officialId})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rationale</span>
                  <span className="font-medium text-slate-700">{b.rationale}</span>
                </div>
              </div>

              {/* Cryptographic Hash Pills */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 font-mono text-[11px] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 gap-1">
                  <span className="font-semibold text-slate-400 text-[10px] uppercase shrink-0">Prev Hash:</span>
                  <span className="text-slate-600 break-all text-[10px] sm:text-[11px]">{b.previousHash}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-emerald-900 gap-1 pt-1.5 border-t border-slate-200">
                  <span className="font-bold text-emerald-800 text-[10px] uppercase shrink-0">Current Hash:</span>
                  <span className="text-emerald-700 font-bold break-all text-[10px] sm:text-[11px]">{b.hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
