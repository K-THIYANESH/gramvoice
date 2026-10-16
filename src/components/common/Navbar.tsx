/**
 * GramVoice TN - Main Navigation & Global Controls Header
 * Production Ready with User Registration & Switcher Modal
 * Fully mobile responsive: wrap-friendly badges, overflow protection
 */
import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Landmark, 
  Menu, 
  X, 
  Check, 
  Building2, 
  WifiOff, 
  UserPlus,
  ChevronDown,
  Sparkles,
  Fingerprint,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { UserRole } from '../../types';

interface NavbarProps {
  currentTab: 'citizen' | 'government' | 'public';
  setCurrentTab: (tab: 'citizen' | 'government' | 'public') => void;
  panchayats: any[];
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, panchayats }) => {
  const { language, setLanguage, t } = useLanguage();
  const { 
    currentUser, 
    switchRole, 
    selectedPanchayatId, 
    setSelectedPanchayatId, 
    isOfficial,
    setShowAuthModal 
  } = useAuth();
  const { isOnline, queue } = useOffline();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);

  const roles: { key: UserRole; labelEn: string; labelTa: string }[] = [
    { key: 'CITIZEN', labelEn: 'Citizen (Muthuvel K.)', labelTa: 'பொதுமக்கள் (முத்துவேல் க.)' },
    { key: 'PANCHAYAT_SECRETARY', labelEn: 'Panchayat Secretary (Sundaralingam)', labelTa: 'ஊராட்சி செயலாளர் (சுந்தரலிங்கம்)' },
    { key: 'PANCHAYAT_PRESIDENT', labelEn: 'Panchayat President (Meenatchi S.)', labelTa: 'ஊராட்சி தலைவர் (மீனாட்சி சு.)' },
    { key: 'BDO', labelEn: 'BDO Vadipatti Block (Dr. Arulselvan IAS)', labelTa: 'வட்டார வளர்ச்சி அலுவலர் BDO (டாக்டர் அருள்செல்வன் IAS)' },
    { key: 'DISTRICT_COLLECTOR', labelEn: 'District Collectorate Madurai', labelTa: 'மாவட்ட ஆட்சியர் அலுவலகம், மதுரை' },
    { key: 'SUPER_ADMIN', labelEn: 'GramVoice Super Admin', labelTa: 'முதன்மை நிர்வாகி' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      {/* Top Tamil Nadu Government Identity Strip */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] py-1 px-3 sm:px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold tracking-wide truncate">தமிழ்நாடு அரசு • GOVT OF TAMIL NADU</span>
            <span className="hidden md:inline text-emerald-400">|</span>
            <span className="hidden md:inline text-emerald-300">Department of Rural Development & Panchayat Raj</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Offline Status Pill */}
            {!isOnline && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )}
            {queue.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                {queue.length} Queued
              </span>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-950 rounded-md p-0.5 border border-emerald-800 shrink-0">
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                  language === 'ta' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                  language === 'en' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            onClick={() => setCurrentTab('citizen')}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight truncate">
                {language === 'ta' ? 'கிராம்வாய்ஸ்' : 'GramVoice TN'}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                {language === 'ta' ? 'ஊரக உள்ளாட்சி மக்கள் தளம்' : 'Rural Local Governance'}
              </p>
            </div>
          </div>

          {/* Panchayat Selector */}
          <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-200">
            <label className="text-xs text-slate-500 mr-2 font-medium">Panchayat:</label>
            <select
              value={selectedPanchayatId}
              onChange={(e) => setSelectedPanchayatId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {panchayats.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'ta' ? p.nameTamil : p.name} ({language === 'ta' ? p.districtTamil : p.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs for Desktop */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setCurrentTab('citizen')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'citizen' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            {t.navCitizen}
          </button>

          <button
            onClick={() => setCurrentTab('government')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'government' 
                ? 'bg-white text-blue-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-700" />
            {t.navGovernment}
          </button>

          <button
            onClick={() => setCurrentTab('public')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'public' 
                ? 'bg-white text-teal-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-4 h-4 text-teal-700" />
            {t.navPublic}
          </button>
        </div>

        {/* Right Action: User Role, Biometric Trigger & Register */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Biometric Quick Touch Shortcut */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-300/80 cursor-pointer transition-all shadow-2xs hover:scale-105 shrink-0"
            title={language === 'ta' ? 'பயோமெட்ரிக் கைரேகை / முக அடையாளம்' : 'Biometric Fast Auth (Fingerprint / Face ID)'}
            aria-label="Biometric Fast Auth"
          >
            <Fingerprint className="w-4 h-4 text-emerald-700 animate-pulse" />
          </button>

          {/* User Sign In / Profile Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-xs font-bold text-slate-800 cursor-pointer transition-all shrink-0"
            title="Switch User Role or Register"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setCurrentTab('citizen'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer ${
                currentTab === 'citizen' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Citizen</span>
            </button>

            <button
              onClick={() => { setCurrentTab('government'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer ${
                currentTab === 'government' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => { setCurrentTab('public'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer ${
                currentTab === 'public' ? 'bg-teal-100 text-teal-900 border border-teal-300' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Landmark className="w-4 h-4 text-teal-700" />
              <span>Public</span>
            </button>
          </div>

          {/* Mobile Panchayat Selector */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-600 block mb-1">Select Panchayat:</label>
            <select
              value={selectedPanchayatId}
              onChange={(e) => { setSelectedPanchayatId(e.target.value); setMobileMenuOpen(false); }}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            >
              {panchayats.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'ta' ? p.nameTamil : p.name} ({language === 'ta' ? p.districtTamil : p.district})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Current Role:</span>
            <button
              onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              {currentUser.role.replace('_', ' ')} (Change)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
