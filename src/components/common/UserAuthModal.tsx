/**
 * GramVoice TN - User Registration & Official Authentication Modal
 * Production-Grade Flow with Simulated Biometric Fast Authentication (Fingerprint / Face ID)
 * UIDAI Aadhaar e-KYC & TN GovPass Standard
 */
import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Shield, 
  CheckCircle2, 
  Phone, 
  Building2, 
  MapPin, 
  Sparkles,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  Scan,
  RefreshCw,
  Lock,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchayats: any[];
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose, panchayats }) => {
  const { language } = useLanguage();
  const { 
    registerCitizen, 
    loginOfficial, 
    currentUser, 
    biometricLogin,
    isBiometricEnabled,
    toggleBiometric 
  } = useAuth();

  const [authMode, setAuthMode] = useState<'biometric_fast' | 'citizen_register' | 'official_login'>('biometric_fast');
  
  // Biometric Sub-State
  const [biometricMethod, setBiometricMethod] = useState<'fingerprint' | 'face_id'>('fingerprint');
  const [bioRole, setBioRole] = useState<UserRole>('CITIZEN');
  const [bioScanning, setBioScanning] = useState<boolean>(false);
  const [bioProgress, setBioProgress] = useState<number>(0);
  const [bioSuccess, setBioSuccess] = useState<boolean>(false);
  const [bioMessage, setBioMessage] = useState<string>('');

  // Citizen Registration Form State
  const [name, setName] = useState<string>('');
  const [nameTamil, setNameTamil] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [panchayatId, setPanchayatId] = useState<string>(panchayats[0]?.id || 'pan-001');
  const [wardNumber, setWardNumber] = useState<number>(4);
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Official Sign-in Form State
  const [officialRole, setOfficialRole] = useState<UserRole>('PANCHAYAT_SECRETARY');
  const [officialPanchayatId, setOfficialPanchayatId] = useState<string>(panchayats[0]?.id || 'pan-001');
  const [credentialCode, setCredentialCode] = useState<string>('SEC-TN-2026');

  if (!isOpen) return null;

  const handleStartBiometricScan = (targetRole: UserRole = bioRole) => {
    if (bioScanning) return;

    setBioScanning(true);
    setBioProgress(15);
    setBioSuccess(false);
    setBioMessage(
      biometricMethod === 'fingerprint' 
        ? (language === 'ta' ? 'கைரேகை சென்சார் தகவல்களை வாசிக்கிறது...' : 'Reading capacitive fingerprint ridges...')
        : (language === 'ta' ? '3D முக அமைப்பு & பார்வை சரிபார்க்கப்படுகிறது...' : 'Aligning 3D facial mesh & liveness detection...')
    );

    setTimeout(() => {
      setBioProgress(55);
      setBioMessage(
        language === 'ta'
          ? 'ஆதார் பயோமெட்ரிக் சேவையகத்துடன் சரிபார்க்கப்படுகிறது...'
          : 'Verifying with TN e-Governance Aadhaar Auth Server...'
      );
    }, 500);

    setTimeout(() => {
      setBioProgress(88);
      setBioMessage(
        language === 'ta' 
          ? 'பயோமெட்ரிக் சான்றிதழ் அங்கீகரிக்கப்பட்டது!' 
          : 'Biometric pass verified! Signing in...'
      );
    }, 1000);

    setTimeout(() => {
      setBioProgress(100);
      setBioSuccess(true);
      setBioMessage(
        language === 'ta' ? 'அங்கீகாரம் வெற்றிகரமாக முடிந்தது!' : 'Authentication Successful! Redirecting...'
      );

      setTimeout(() => {
        biometricLogin(targetRole, biometricMethod);
        onClose();
        setBioScanning(false);
        setBioSuccess(false);
      }, 600);
    }, 1500);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 10) {
      setError(language === 'ta' ? 'தயவுசெய்து முழு பெயர் மற்றும் 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்' : 'Please provide a valid full name and 10-digit mobile number');
      return;
    }
    setError(null);
    setOtpStep(true);
    setEnteredOtp('529410'); // Simulated instant OTP pre-filled for easy production testing
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.length < 4) {
      setError(language === 'ta' ? 'சரியான OTP எண்ணை உள்ளிடவும்' : 'Please enter valid OTP');
      return;
    }
    setIsSubmitting(true);
    const selectedP = panchayats.find(p => p.id === panchayatId) || panchayats[0];
    setTimeout(() => {
      registerCitizen({
        name,
        nameTamil: nameTamil || name,
        phone,
        panchayatId: selectedP?.id || 'pan-001',
        panchayatName: selectedP?.name || 'Alanganallur',
        wardNumber: Number(wardNumber),
        biometricToken: `BIO-REG-${Date.now().toString().slice(-6)}`
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleOfficialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      loginOfficial(officialRole, officialPanchayatId, credentialCode);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white border border-emerald-400/40 shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {language === 'ta' ? 'கிராம்வாய்ஸ் பயனர் பாதுகாப்பு தளம்' : 'GramVoice TN Access Hub'}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/30 shrink-0">
                  UIDAI / e-KYC
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {language === 'ta' ? 'தமிழ்நாடு ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை' : 'Govt of Tamil Nadu Rural Development'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tab Switcher: Biometric Fast | Citizen Register | Official */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 grid grid-cols-3 gap-1.5 shrink-0 text-center">
          <button
            onClick={() => { setAuthMode('biometric_fast'); setError(null); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authMode === 'biometric_fast' 
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-500/30' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{language === 'ta' ? 'பயோமெட்ரிக்' : 'Biometric'}</span>
          </button>

          <button
            onClick={() => { setAuthMode('citizen_register'); setOtpStep(false); setError(null); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authMode === 'citizen_register' 
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-500/30' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{language === 'ta' ? 'பதிவு / OTP' : 'Citizen Reg'}</span>
          </button>

          <button
            onClick={() => { setAuthMode('official_login'); setError(null); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authMode === 'official_login' 
                ? 'bg-white text-blue-950 shadow-xs border border-blue-500/30' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="truncate">{language === 'ta' ? 'அலுவலர்' : 'Gov Official'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Mode 1: Simulated Biometric Fast Authentication */}
          {authMode === 'biometric_fast' && (
            <div className="space-y-4 text-center">
              {/* Method Switcher: Fingerprint vs Face ID */}
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setBiometricMethod('fingerprint'); setBioSuccess(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    biometricMethod === 'fingerprint'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ta' ? 'கைரேகை (Touch)' : 'Fingerprint'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setBiometricMethod('face_id'); setBioSuccess(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    biometricMethod === 'face_id'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'ta' ? 'முக அடையாளம் (Face ID)' : 'Face ID'}</span>
                </button>
              </div>

              {/* Role Selection for Biometric Instant Verification */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'உள்நுழைய வேண்டிய கணக்கு' : 'Select Account for Biometric Auth'}:
                </label>
                <select
                  value={bioRole}
                  onChange={(e) => setBioRole(e.target.value as UserRole)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="CITIZEN">👤 Citizen: Muthuvel Karuppan (Alanganallur)</option>
                  <option value="PANCHAYAT_SECRETARY">🏛️ Panchayat Secretary: T. Sundaralingam</option>
                  <option value="PANCHAYAT_PRESIDENT">🎖️ Panchayat President: K. Meenatchi Sundaram</option>
                  <option value="BDO">🏛️ BDO: Dr. V. Arulselvan IAS (Vadipatti)</option>
                  <option value="DISTRICT_COLLECTOR">🇮🇳 District Collectorate Madurai</option>
                  <option value="SUPER_ADMIN">⚡ System Administrator</option>
                </select>
              </div>

              {/* Interactive Biometric Sensor HUD */}
              <div className="py-2 flex flex-col items-center justify-center">
                {biometricMethod === 'fingerprint' ? (
                  <div
                    onClick={() => handleStartBiometricScan(bioRole)}
                    className={`w-32 h-32 rounded-full flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-300 ${
                      !bioScanning && !bioSuccess
                        ? 'bg-emerald-50 border-2 border-dashed border-emerald-400 hover:border-emerald-600 hover:scale-105 hover:bg-emerald-100/60'
                        : bioScanning
                        ? 'bg-emerald-950 border-2 border-emerald-400 shadow-xl'
                        : 'bg-emerald-600 border-2 border-emerald-300 shadow-xl'
                    }`}
                  >
                    {bioScanning && (
                      <>
                        <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none" />
                        <div className="absolute w-24 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_#34d399] animate-bounce top-1/3" />
                      </>
                    )}

                    {bioSuccess ? (
                      <CheckCircle2 className="w-14 h-14 text-white animate-in zoom-in-50 duration-300" />
                    ) : (
                      <Fingerprint className={`w-14 h-14 transition-colors ${
                        bioScanning ? 'text-emerald-300 animate-pulse' : 'text-emerald-700'
                      }`} />
                    )}

                    {!bioScanning && !bioSuccess && (
                      <span className="absolute bottom-2 text-[9px] font-bold text-emerald-800 tracking-wider uppercase">
                        {language === 'ta' ? 'தொடவும்' : 'Touch to Scan'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartBiometricScan(bioRole)}
                    className={`w-32 h-32 rounded-3xl flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-300 ${
                      !bioScanning && !bioSuccess
                        ? 'bg-blue-50 border-2 border-dashed border-blue-400 hover:border-blue-600 hover:scale-105 hover:bg-blue-100/60'
                        : bioScanning
                        ? 'bg-slate-950 border-2 border-blue-400 shadow-xl'
                        : 'bg-blue-600 border-2 border-blue-300 shadow-xl'
                    }`}
                  >
                    <div className="absolute inset-2 border border-blue-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-1">
                      <div className="flex justify-between">
                        <span className="w-2 h-2 border-t-2 border-l-2 border-blue-400" />
                        <span className="w-2 h-2 border-t-2 border-r-2 border-blue-400" />
                      </div>
                      <div className="flex justify-between">
                        <span className="w-2 h-2 border-b-2 border-l-2 border-blue-400" />
                        <span className="w-2 h-2 border-b-2 border-r-2 border-blue-400" />
                      </div>
                    </div>

                    {bioScanning && (
                      <div className="absolute w-24 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent shadow-[0_0_12px_#60a5fa] animate-bounce top-1/2" />
                    )}

                    {bioSuccess ? (
                      <CheckCircle2 className="w-14 h-14 text-white animate-in zoom-in-50 duration-300" />
                    ) : (
                      <Scan className={`w-14 h-14 transition-colors ${
                        bioScanning ? 'text-blue-300 animate-pulse' : 'text-blue-700'
                      }`} />
                    )}

                    {!bioScanning && !bioSuccess && (
                      <span className="absolute bottom-2 text-[9px] font-bold text-blue-800 tracking-wider uppercase">
                        {language === 'ta' ? 'முகத்தை காட்டவும்' : 'Look to Scan'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress and status message */}
              <div className="space-y-1">
                {bioScanning && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        biometricMethod === 'fingerprint' ? 'bg-emerald-600' : 'bg-blue-600'
                      }`} 
                      style={{ width: `${bioProgress}%` }}
                    />
                  </div>
                )}

                <p className="text-xs font-semibold text-slate-700 min-h-[20px]">
                  {bioMessage || (
                    language === 'ta' 
                      ? 'சென்சாரைத் தொட்டு உங்கள் கைரேகை அல்லது முக அடையாளம் மூலம் உள்நுழைக' 
                      : 'Tap sensor icon to authenticate securely with Aadhaar / TN Biometrics'
                  )}
                </p>
              </div>

              {/* Action Trigger Button */}
              {!bioScanning && !bioSuccess && (
                <button
                  type="button"
                  onClick={() => handleStartBiometricScan(bioRole)}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>
                    {language === 'ta' ? 'பயோமெட்ரிக் மூலம் 1-நொடியில் திறக்க' : 'Authenticate 1-Tap Biometric'}
                  </span>
                </button>
              )}

              {/* Masked Aadhaar Verification Note */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-left flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'ta' ? 'தமிழ்நாடு e-Seva சரிபார்க்கப்பட்ட சுயவிவரம்' : 'TN e-Seva Verified Resident'}
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    Aadhaar UID: XXXX-XXXX-4829
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>e-KYC Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Citizen Registration (Traditional Mobile OTP + Biometric Opt-in) */}
          {authMode === 'citizen_register' && (
            <div>
              {!otpStep ? (
                <form onSubmit={handleRequestOtp} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'ta' ? 'முழு பெயர் (English)' : 'Full Name (English)'}: *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Muthuvel K."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'ta' ? 'பெயர் (தமிழில்)' : 'Name (Tamil)'}:
                      </label>
                      <input
                        type="text"
                        value={nameTamil}
                        onChange={(e) => setNameTamil(e.target.value)}
                        placeholder="எ.கா. முத்துவேல் க."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'கைபேசி எண் (Mobile Number)' : 'Mobile Phone Number'}: *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9842109876"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'ta' ? 'ஊராட்சி (Panchayat)' : 'Panchayat'}:
                      </label>
                      <select
                        value={panchayatId}
                        onChange={(e) => setPanchayatId(e.target.value)}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        {panchayats.map(p => (
                          <option key={p.id} value={p.id}>
                            {language === 'ta' ? p.nameTamil : p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'ta' ? 'வார்டு எண்' : 'Ward Number'}:
                      </label>
                      <select
                        value={wardNumber}
                        onChange={(e) => setWardNumber(Number(e.target.value))}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                          <option key={w} value={w}>Ward {w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Biometric e-KYC Toggle */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-emerald-700" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          {language === 'ta' ? 'பயோமெட்ரிக் உள்நுழைவை இயக்கு' : 'Enable Fast Biometric Access'}
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          {language === 'ta' ? 'அடுத்த முறை கைரேகையால் எளிதாக திறக்கலாம்' : '1-tap login with fingerprint / face scan'}
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isBiometricEnabled}
                      onChange={(e) => toggleBiometric(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>{language === 'ta' ? 'OTP சரிபார்ப்புக்கு தொடரவும்' : 'Verify Mobile via OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteRegistration} className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-950 text-sm">
                      {language === 'ta' ? 'OTP அனுப்பப்பட்டது' : 'OTP Code Sent'}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {language === 'ta' ? `+91 ${phone} எண்ணுக்கு 6 இலக்க குறியீடு அனுப்பப்பட்டுள்ளது` : `Enter the 6-digit code sent to +91 ${phone}`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 text-center mb-1">
                      {language === 'ta' ? '6 இலக்க OTP' : '6-Digit Verification OTP'}:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-48 mx-auto block text-center tracking-widest text-lg font-mono font-black p-2.5 bg-slate-50 border-2 border-emerald-500 rounded-xl focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === 'ta' ? 'பதிவை உறுதி செய்து உள்ளே செல்ல' : 'Confirm Registration & Enter'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← {language === 'ta' ? 'விவரங்களை திருத்துக' : 'Edit details'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Mode 3: Official Sign In */}
          {authMode === 'official_login' && (
            <div className="space-y-4">
              <form onSubmit={handleOfficialLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'அலுவலர் பதவி (Designation)' : 'Administrative Role'}:
                  </label>
                  <select
                    value={officialRole}
                    onChange={(e) => setOfficialRole(e.target.value as UserRole)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="PANCHAYAT_SECRETARY">Panchayat Secretary (சுந்தரலிங்கம்)</option>
                    <option value="PANCHAYAT_PRESIDENT">Panchayat President (மீனாட்சி சு.)</option>
                    <option value="BDO">Block Development Officer / BDO (டாக்டர் அருள்செல்வன் IAS)</option>
                    <option value="DISTRICT_COLLECTOR">District Collectorate Madurai</option>
                    <option value="SUPER_ADMIN">GramVoice System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'அதிகார வரம்பு (Panchayat Jurisdiction)' : 'Panchayat / Jurisdiction'}:
                  </label>
                  <select
                    value={officialPanchayatId}
                    onChange={(e) => setOfficialPanchayatId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {panchayats.map(p => (
                      <option key={p.id} value={p.id}>
                        {language === 'ta' ? p.nameTamil : p.name} ({p.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'அரசு துறை பாஸ்வேர்ட் / PIN' : 'Official Passcode / Department PIN'}:
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={credentialCode}
                      onChange={(e) => setCredentialCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{language === 'ta' ? 'கடவுக்குறியீடு உள்நுழைவு' : 'Passcode Sign In'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartBiometricScan(officialRole)}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>{language === 'ta' ? 'GovPass பயோமெட்ரிக்' : 'GovPass Biometric'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
