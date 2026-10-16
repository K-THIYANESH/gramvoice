/**
 * GramVoice TN - Citizen Engagement Index (CEI) & Governance Analytics Console
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft, Users, ShieldCheck, Award, BarChart3, PieChart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { GovernanceScore } from '../../types';
import { api } from '../../services/api';

interface GovernmentAnalyticsProps {
  onBack: () => void;
}

export const GovernmentAnalytics: React.FC<GovernmentAnalyticsProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [scores, setScores] = useState<GovernanceScore[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sc, sm] = await Promise.all([
          api.getGovernanceScores(),
          api.getAnalyticsSummary()
        ]);
        setScores(sc);
        setSummary(sm);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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

        <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-200">
          Deterministic CEI Multi-Pillar Model
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
            Citizen Engagement Index (CEI) & Block Leaderboard
          </h2>
          <p className="text-xs text-slate-500">
            Multi-factor weighted evaluation: Voter Participation (30%), Ward Diversity (20%), Voice Adoption (20%), SLA Responsiveness (15%), Quorum Attainment (15%).
          </p>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-xs text-emerald-800 font-bold block">District Average CEI</span>
              <span className="text-3xl font-black text-emerald-950">{summary.districtAverageCEI}</span>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <span className="text-xs text-blue-800 font-bold block">Total Citizen Feedback</span>
              <span className="text-3xl font-black text-blue-950">{summary.totalCitizenSubmissions}</span>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
              <span className="text-xs text-purple-800 font-bold block">Voice Adoption Rate</span>
              <span className="text-3xl font-black text-purple-950">{summary.voiceAdoptionPercentage}%</span>
            </div>
          </div>
        )}

        <div className="pt-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">District Panchayat Governance Rankings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Panchayat</th>
                  <th className="p-3">Overall CEI</th>
                  <th className="p-3">Civic Voice</th>
                  <th className="p-3">SLA Compliance</th>
                  <th className="p-3">Quorum Score</th>
                  <th className="p-3">Financial Transparency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scores.map(s => (
                  <tr key={s.panchayatId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">#{s.rankInDistrict}</td>
                    <td className="p-3 font-semibold text-slate-800">{s.panchayatName}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {s.overallScore}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{s.citizenEngagementScore}%</td>
                    <td className="p-3 font-medium text-slate-700">{s.slaComplianceScore}%</td>
                    <td className="p-3 font-medium text-slate-700">{s.gramSabhaQuorumScore}%</td>
                    <td className="p-3 font-medium text-slate-700">{s.financialTransparencyScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
