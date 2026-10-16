import React from 'react';
import { Home, Mic, Users, FolderKanban, Shield, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { triggerHaptic } from '../../services/nativeService';

interface MobileBottomNavProps {
  currentTab: 'citizen' | 'government' | 'public';
  setCurrentTab: (tab: 'citizen' | 'government' | 'public') => void;
  citizenView: string;
  setCitizenView: (view: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  citizenView,
  setCitizenView,
}) => {
  const { language } = useLanguage();

  const handleNavClick = (tab: 'citizen' | 'government' | 'public', view?: string) => {
    triggerHaptic('light');
    setCurrentTab(tab);
    if (tab === 'citizen' && view) {
      setCitizenView(view);
    }
  };

  const navItems = [
    {
      id: 'home',
      label: language === 'ta' ? 'முகப்பு' : 'Home',
      icon: Home,
      isActive: currentTab === 'citizen' && citizenView === 'home',
      onClick: () => handleNavClick('citizen', 'home'),
    },
    {
      id: 'report',
      label: language === 'ta' ? 'குறைதீர்ப்பு' : 'Report',
      icon: Mic,
      isActive: currentTab === 'citizen' && citizenView === 'report_problem',
      highlight: true,
      onClick: () => handleNavClick('citizen', 'report_problem'),
    },
    {
      id: 'projects',
      label: language === 'ta' ? 'திட்டங்கள்' : 'Projects',
      icon: FolderKanban,
      isActive: currentTab === 'citizen' && (citizenView === 'projects' || citizenView === 'project_detail'),
      onClick: () => handleNavClick('citizen', 'projects'),
    },
    {
      id: 'gramsabha',
      label: language === 'ta' ? 'கிராம சபை' : 'Sabha',
      icon: Users,
      isActive: currentTab === 'citizen' && citizenView === 'gramsabha',
      onClick: () => handleNavClick('citizen', 'gramsabha'),
    },
    {
      id: 'transparency',
      label: language === 'ta' ? 'வெளிப்படை' : 'Ledger',
      icon: BarChart3,
      isActive: currentTab === 'public',
      onClick: () => handleNavClick('public'),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center justify-center -mt-4 cursor-pointer focus:outline-none group active:scale-95 transition-transform"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    active
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-105'
                      : 'bg-emerald-700 text-white hover:bg-emerald-600'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer select-none active:scale-90 ${
                active
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  active ? 'bg-emerald-50 text-emerald-700' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
