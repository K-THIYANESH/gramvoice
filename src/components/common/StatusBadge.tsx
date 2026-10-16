/**
 * GramVoice TN - Accessible Status Badge (Color + Text + Icon)
 */
import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Hammer, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ProjectStage, ProjectStatus, MaintenanceTicket } from '../../types';

interface StatusBadgeProps {
  type: 'stage' | 'status' | 'sla' | 'priority' | 'sentiment' | 'ai';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const { language, t } = useLanguage();

  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  if (type === 'stage') {
    const stage = value as ProjectStage;
    const stageMap: Record<ProjectStage, { labelEn: string; labelTa: string; bg: string; text: string; icon: any }> = {
      DISCOVER: { labelEn: 'Discover', labelTa: 'கண்டுபிடி', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Clock },
      UNDERSTAND: { labelEn: 'Understand', labelTa: 'புரிந்துகொள்', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', icon: Clock },
      SUGGEST: { labelEn: 'Suggest', labelTa: 'பரிந்துரை', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: Clock },
      PARTICIPATE: { labelEn: 'Public Consultation', labelTa: 'மக்கள் கலந்தாய்வு', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800 font-semibold', icon: Sparkles },
      VALIDATE: { labelEn: 'Gram Sabha Sanction', labelTa: 'கிராம சபை ஒப்புதல்', bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800', icon: ShieldCheck },
      MONITOR: { labelEn: 'Construction Watch', labelTa: 'கட்டுமான கண்காணிப்பு', bg: 'bg-orange-50 border-orange-300', text: 'text-orange-800', icon: Hammer },
      MAINTAIN: { labelEn: 'Maintenance & SLA', labelTa: 'பராமரிப்பு பணி', bg: 'bg-teal-50 border-teal-300', text: 'text-teal-800', icon: Wrench },
    };

    const cfg = stageMap[stage] || stageMap.DISCOVER;
    const Icon = cfg.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${sizeClasses}`}>
        <Icon className="w-3.5 h-3.5" />
        {language === 'ta' ? cfg.labelTa : cfg.labelEn}
      </span>
    );
  }

  if (type === 'sla') {
    const isBreached = value === 'breached' || value === 'true';
    return isBreached ? (
      <span className={`inline-flex items-center gap-1.5 rounded-full border bg-red-50 border-red-300 text-red-700 font-semibold ${sizeClasses}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        {language === 'ta' ? 'SLA காலக்கெடு கடந்தது' : 'SLA Escalated (Breached)'}
      </span>
    ) : (
      <span className={`inline-flex items-center gap-1.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 font-medium ${sizeClasses}`}>
        <Clock className="w-3.5 h-3.5" />
        {language === 'ta' ? 'காலக்கெடுவுக்குள் உள்ளது' : 'Within Official SLA'}
      </span>
    );
  }

  if (type === 'priority') {
    const p = value as MaintenanceTicket['priority'];
    const pMap: Record<MaintenanceTicket['priority'], { bg: string; text: string; labelEn: string; labelTa: string }> = {
      URGENT: { bg: 'bg-red-100 border-red-300', text: 'text-red-800', labelEn: 'URGENT (24h)', labelTa: 'அவசரம் (24 மணி)' },
      HIGH: { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-800', labelEn: 'HIGH (48h)', labelTa: 'முக்கியம் (48 மணி)' },
      MEDIUM: { bg: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-800', labelEn: 'MEDIUM (72h)', labelTa: 'நடுத்தரம் (72 மணி)' },
      LOW: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', labelEn: 'LOW (7 Days)', labelTa: 'சாதாரண (7 நாள்)' }
    };
    const cfg = pMap[p] || pMap.MEDIUM;
    return (
      <span className={`inline-flex items-center gap-1 rounded-md border font-semibold ${cfg.bg} ${cfg.text} ${sizeClasses}`}>
        {language === 'ta' ? cfg.labelTa : cfg.labelEn}
      </span>
    );
  }

  if (type === 'sentiment') {
    const s = value.toLowerCase();
    let bg = 'bg-slate-100 text-slate-700 border-slate-200';
    if (s.includes('support')) bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (s.includes('concern')) bg = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (s.includes('critical')) bg = 'bg-red-50 text-red-700 border-red-200';
    return (
      <span className={`inline-flex items-center rounded-full border capitalize font-medium ${bg} ${sizeClasses}`}>
        {value}
      </span>
    );
  }

  if (type === 'ai') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border bg-indigo-50 border-indigo-200 text-indigo-700 font-medium ${sizeClasses}`}>
        <Sparkles className="w-3 h-3 text-indigo-600" />
        {t.aiAssistedBadge}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md border bg-slate-100 border-slate-200 text-slate-700 ${sizeClasses}`}>
      {value}
    </span>
  );
};
