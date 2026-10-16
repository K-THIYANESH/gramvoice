/**
 * GramVoice TN - Official Government Biometric e-Sign & Sanction Seal Modal
 * Simulates GovPass / Aadhaar Biometric Authorization for DPR Approvals, Resolutions & Fund Disbursals
 */
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  Scan, 
  CheckCircle2, 
  X, 
  Lock, 
  Sparkles,
  Building2,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface BiometricSignOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (signData: { signer: string; role: string; signatureHash: string; timestamp: string }) => void;
  actionTitle: string;
  actionSubtitle?: string;
  documentRefNumber?: string;
}

export const BiometricSignOffModal: React.FC<BiometricSignOffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle,
  actionSubtitle,
  documentRefNumber
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  const [authMode, setAuthMode] = useState<'fingerprint' | 'face_id' | 'pin'>('fingerprint');
  const [passcode, setPasscode] = useState<string>('TN-GOV-2026');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  if (!isOpen) return null;

  const triggerSignProcess = () => {
    if (isSigning) return;

    setIsSigning(true);
    setStatusMsg(
      language === 'ta'
        ? 'அரசு பயோமெட்ரிக் சேவையகத்தில் கையொப்பம் சரிபார்க்கப்படுகிறது...'
        : 'Verifying official GovPass cryptographic credentials...'
    );

    setTimeout(() => {
      setStatusMsg(
        language === 'ta'
          ? 'SHA-256 கிரிப்டோகிராஃபிக் முத்திரை உருவாக்கப்பட்டது...'
          : 'Generating 256-bit tamper-proof ledger block...'
      );
    }, 700);

    setTimeout(() => {
      setIsSigning(false);
      setIsSigned(true);
      setStatusMsg(
        language === 'ta'
          ? 'அங்கீகரிக்கப்பட்டு முத்திரை இடப்பட்டது!'
          : 'Cryptographic Signature Successfully Sealed!'
      );

      const signData = {
        signer: currentUser.name,
        role: currentUser.role,
        signatureHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        onSuccess(signData);
        setIsSigned(false);
        onClose();
      }, 900);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/80 flex items-center justify-center text-white border border-emerald-400/40 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {language === 'ta' ? 'அதிகாரப்பூர்வ டிஜிட்டல் கையொப்பம்' : 'Official Biometric Sign-Off'}
              </h3>
              <p className="text-[11px] text-emerald-300">
                {language === 'ta' ? 'தமிழ்நாடு அரசு மின்-ஆளுமை நெறிமுறை' : 'Govt of Tamil Nadu e-Governance Standard'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-center">
          {/* Action Context Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>{language === 'ta' ? 'ஆவணக் குறிப்பு' : 'Document Ref'}</span>
              <span className="font-mono text-emerald-800">{documentRefNumber || 'GO-RD-2026-DPR-01'}</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{actionTitle}</h4>
            {actionSubtitle && <p className="text-xs text-slate-600">{actionSubtitle}</p>}
            
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">
                {language === 'ta' ? 'கையொப்பமிடுபவர்' : 'Signing Official'}:
              </span>
              <span className="font-bold text-slate-900 font-mono">
                {currentUser.name} ({currentUser.role})
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMode('fingerprint')}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                authMode === 'fingerprint' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ta' ? 'கைரேகை' : 'Fingerprint'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('face_id')}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                authMode === 'face_id' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'ta' ? 'Face ID' : 'Face ID'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('pin')}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                authMode === 'pin' ? 'bg-white text-purple-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>{language === 'ta' ? 'PIN எண்' : 'Passcode'}</span>
            </button>
          </div>

          {/* Biometric / Passcode Sensor */}
          <div className="py-2 flex flex-col items-center justify-center">
            {authMode === 'fingerprint' && (
              <div
                onClick={triggerSignProcess}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-300 ${
                  !isSigning && !isSigned
                    ? 'bg-emerald-50 border-2 border-dashed border-emerald-400 hover:border-emerald-600 hover:scale-105 hover:bg-emerald-100/60'
                    : isSigning
                    ? 'bg-emerald-950 border-2 border-emerald-400 shadow-xl'
                    : 'bg-emerald-600 border-2 border-emerald-300 shadow-xl'
                }`}
              >
                {isSigning && (
                  <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-40 pointer-events-none" />
                )}

                {isSigned ? (
                  <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in-50 duration-300" />
                ) : (
                  <Fingerprint className={`w-12 h-12 ${isSigning ? 'text-emerald-300 animate-pulse' : 'text-emerald-700'}`} />
                )}

                {!isSigning && !isSigned && (
                  <span className="absolute bottom-1.5 text-[8px] font-bold text-emerald-800 tracking-wider uppercase">
                    {language === 'ta' ? 'தொடவும்' : 'Touch to Seal'}
                  </span>
                )}
              </div>
            )}

            {authMode === 'face_id' && (
              <div
                onClick={triggerSignProcess}
                className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-300 ${
                  !isSigning && !isSigned
                    ? 'bg-blue-50 border-2 border-dashed border-blue-400 hover:border-blue-600 hover:scale-105'
                    : isSigning
                    ? 'bg-slate-950 border-2 border-blue-400 shadow-xl'
                    : 'bg-blue-600 border-2 border-blue-300 shadow-xl'
                }`}
              >
                {isSigned ? (
                  <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in-50 duration-300" />
                ) : (
                  <Scan className={`w-12 h-12 ${isSigning ? 'text-blue-300 animate-pulse' : 'text-blue-700'}`} />
                )}

                {!isSigning && !isSigned && (
                  <span className="absolute bottom-1.5 text-[8px] font-bold text-blue-800 tracking-wider uppercase">
                    {language === 'ta' ? 'பார்க்கவும்' : 'Look to Seal'}
                  </span>
                )}
              </div>
            )}

            {authMode === 'pin' && (
              <div className="w-full space-y-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter GovPass PIN"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>

          <div className="min-h-[22px]">
            <p className="text-xs font-semibold text-slate-700">
              {statusMsg || (
                language === 'ta'
                  ? 'பயோமெட்ரிக் சென்சாரைத் தொட்டு உங்கள் அதிகாரப்பூர்வ ஒப்புதலை உறுதிசெய்க'
                  : 'Authenticate with your official biometric key to seal this order'
              )}
            </p>
          </div>

          {/* Action Trigger */}
          {!isSigning && !isSigned && (
            <button
              type="button"
              onClick={triggerSignProcess}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>
                {language === 'ta' ? 'டிஜிட்டல் முத்திரை இடுக (e-Sign)' : 'Affix Official Biometric e-Sign'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
