/**
 * GramVoice TN - Citizen Project Discovery Screen
 * Visual Project Gallery with Progress Bars & CEI Gauges
 * Fixed for mobile screens: wrap text, enlarged touch areas, responsive budget stats
 */
import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  ArrowLeft,
  Mic, 
  Calendar, 
  Droplets, 
  Milestone, 
  HeartHandshake, 
  Building2,
  Sparkles,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Project } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

interface CitizenProjectsProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onBack: () => void;
}

export const CitizenProjects: React.FC<CitizenProjectsProps> = ({ projects, onSelectProject, onBack }) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', labelEn: 'All', labelTa: 'அனைத்தும்', icon: LayoutGrid },
    { id: 'Roads & Transport', labelEn: 'Roads', labelTa: 'சாலைகள்', icon: Milestone },
    { id: 'Water Supply', labelEn: 'Water', labelTa: 'குடிநீர்', icon: Droplets },
    { id: 'Sanitation', labelEn: 'Sanitation', labelTa: 'சுகாதாரம்', icon: Building2 },
    { id: 'Healthcare', labelEn: 'Health', labelTa: 'மருத்துவம்', icon: HeartHandshake },
  ];

  const filteredProjects = projects.filter(p => {
    const matchSearch = searchTerm === '' || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.titleTamil.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16 px-1 sm:px-0">
      {/* Search & Visual Category Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.btnBack || 'Back to Home'}
          </button>
          
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 hidden sm:flex items-center gap-2">
              <span>{t.projectsTitle}</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
              {filteredProjects.length} {language === 'ta' ? 'திட்டங்கள்' : 'Projects'}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ta' ? 'திட்டம் அல்லது வார்டு எண் தேடுங்கள்...' : 'Search by name or ward number...'}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
        </div>

        {/* Visual Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(c => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected 
                    ? 'bg-emerald-700 text-white shadow-xs scale-102' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{language === 'ta' ? c.labelTa : c.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Project Cards */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <EmptyState
            title={t.noDataFound}
            description={language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட பிரிவில் திட்டங்கள் இல்லை.' : 'No projects found matching the criteria.'}
          />
        ) : (
          filteredProjects.map(project => {
            const verifiedMilestonesCount = project.milestones.filter(m => m.status === 'verified').length;
            const milestonePct = Math.round((verifiedMilestonesCount / (project.milestones.length || 1)) * 100);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3"
              >
                {/* Stage Badge & Project Code */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge type="stage" value={project.stage} />
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {project.code}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug break-words">
                    {language === 'ta' ? project.titleTamil : project.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Ward {project.wardNumber} • {project.panchayatName}</span>
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="text-slate-600 font-semibold">{project.fundingSource}</span>
                  </div>
                </div>

                {/* Visual Milestone Progress Track */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <span className="text-slate-500 font-semibold">
                      {language === 'ta' ? 'பணி முன்னேற்றம்' : 'Civil Progress'}
                    </span>
                    <span className="font-bold text-emerald-800">
                      {verifiedMilestonesCount}/{project.milestones.length} {language === 'ta' ? 'மைல்கற்கள்' : 'Milestones'} ({milestonePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-linear-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${milestonePct || 15}%` }}
                    />
                  </div>
                </div>

                {/* Key Visual Metrics Grid with auto wrapping */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center min-h-[58px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold leading-tight">Budget</span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm mt-0.5 break-words">
                      ₹{(project.budgetTotal / 100000).toFixed(1)}L
                    </span>
                  </div>

                  <div className="p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center min-h-[58px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold leading-tight">Voices</span>
                    <span className="font-black text-emerald-700 text-xs sm:text-sm mt-0.5">
                      {project.voiceResponsesCount || 0}
                    </span>
                  </div>

                  <div className="p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center min-h-[58px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold leading-tight">Target</span>
                    <span className="font-black text-slate-700 text-[11px] sm:text-xs mt-0.5 truncate">
                      {project.completionTargetDate ? project.completionTargetDate.slice(5) : '2026'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
