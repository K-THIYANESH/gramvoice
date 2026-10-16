/**
 * GramVoice TN - Government Executive Command Dashboard
 * Visually Speaking • Minimalist Text • High Impact Official HUD
 */
import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Layers, 
  Wrench, 
  Building2,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Lock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Project, MaintenanceTicket, GramSabhaSession, GovernanceScore } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface GovernmentDashboardProps {
  onNavigate: (view: string, data?: any) => void;
  projects: Project[];
  tickets: MaintenanceTicket[];
  gramSabhas: GramSabhaSession[];
  governanceScore?: GovernanceScore;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({ onNavigate, projects, tickets, gramSabhas, governanceScore }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  // Metrics
  const breachedTickets = tickets.filter(t => t.isBreached || t.status === 'REPORTED');
  const activeConsultationProjects = projects.filter(p => p.stage === 'PARTICIPATE');
  const totalOutlay = projects.reduce((acc, p) => acc + p.budgetTotal, 0);
  const totalOpinions = projects.reduce((acc, p) => acc + (p.participationCount || 0), 0);
  const resolvedTicketsCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      {/* 1. Official Header & Live CEI Gauge Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
              {currentUser.role.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {currentUser.panchayatName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Administrative Command Console
          </h2>
        </div>

        {governanceScore && (
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Panchayat CEI</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">{governanceScore.citizenEngagementScore}</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">District Rank</span>
              <span className="text-2xl sm:text-3xl font-black text-blue-900">#{governanceScore.rankInDistrict}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Urgent Attention Alert (If tickets escalated) */}
      {breachedTickets.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-900 bg-red-200 px-3 py-1 rounded-full">
              <AlertTriangle className="w-4 h-4 text-red-700" />
              SLA ATTENTION REQUIRED ({breachedTickets.length} Issues)
            </span>
            <button
              onClick={() => onNavigate('gov_maintenance')}
              className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1 cursor-pointer"
            >
              Open SLA Queue <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {breachedTickets.slice(0, 2).map(t => (
              <div key={t.id} className="bg-white p-3 rounded-2xl border border-red-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-red-950 block">{t.ticketNumber} • {t.category}</span>
                  <span className="text-slate-500 text-[11px] truncate max-w-xs block">{t.title}</span>
                </div>
                <button
                  onClick={() => onNavigate('gov_maintenance', t)}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs cursor-pointer shrink-0"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Visual KPI Triad / Tetrad */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Sanctioned Works</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{projects.length}</div>
          <div className="text-[11px] text-emerald-600 font-bold">
            ₹{(totalOutlay / 100000).toFixed(1)}L Outlay
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Citizen Feedback</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">{totalOpinions}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            76% Spoken Voice
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>SLA Grievances</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{tickets.length}</div>
          <div className="text-[11px] text-amber-700 font-bold">
            {resolvedTicketsCount} Resolved
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Ledger Integrity</span>
            <Lock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900">SHA-256</div>
          <div className="text-[11px] text-purple-700 font-bold">
            100% Chain Valid
          </div>
        </div>
      </div>

      {/* 4. Core Official Workspaces (Visual Action Grid) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Official Administrative Workspaces & Tools
          </h3>
          <span className="text-xs font-bold text-slate-400">7 Active Engines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Workspace 1: Projects */}
          <div 
            onClick={() => onNavigate('gov_projects')}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-900">
                Projects & Milestones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Advance 6-stage lifecycle, verify contractors & sign-off disbursements
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
              Manage Projects →
            </div>
          </div>

          {/* Workspace 2: Gram Sabha */}
          <div 
            onClick={() => onNavigate('gov_gramsabha')}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-purple-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-900">
                Gram Sabha Synthesis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI voice clustering & biometric resolution signing
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              Open Gram Sabha →
            </div>
          </div>

          {/* Workspace 3: SLA Maintenance */}
          <div 
            onClick={() => onNavigate('gov_maintenance')}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-900">
                SLA Grievances & Dispatch
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Triage water/lights issues, assign linemen & verify resolution
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              Open Triage Queue →
            </div>
          </div>

          {/* Workspace 4: DPR & Technical Sanctions */}
          <div 
            onClick={() => onNavigate('gov_dpr')}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-teal-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-900">
                Document AI & DPR
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gemini DPR synthesizer & biometric technical sanction orders
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
              Synthesize DPR →
            </div>
          </div>

          {/* Workspace 5: Construction Quality Watch */}
          <div 
            onClick={() => onNavigate('gov_construction')}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-orange-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-900">
                Construction Quality Triage
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect citizen site photos with AI crack & curing defect detection
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-orange-700 group-hover:translate-x-1 transition-transform">
              Inspect Photos →
            </div>
          </div>

          {/* Workspace 6: Decision Ledger */}
          <div 
            onClick={() => onNavigate('gov_ledger')}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-900">
                Cryptographic Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit SHA-256 block chain & test tamper-proof integrity
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
              Audit Ledger Blocks →
            </div>
          </div>

          {/* Workspace 7: CEI Analytics */}
          <div 
            onClick={() => onNavigate('gov_analytics')}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-3 sm:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-900">
                Citizen Engagement Index
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Panchayat CEI performance, ward analytics & participation trends
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-indigo-700 group-hover:translate-x-1 transition-transform">
              View Analytics →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
