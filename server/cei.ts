/**
 * GramVoice TN - Citizen Engagement Index (CEI) & Governance Intelligence Engine
 * 
 * CEI Formula:
 * CEI = (0.25 * V_rate) + (0.20 * D_div) + (0.20 * V_voice) + (0.20 * R_res) + (0.15 * Q_att)
 * Where:
 * - V_rate: Voter Participation Rate (% of eligible ward/panchayat voters participating)
 * - D_div: Demographic & Ward Diversity factor (% of wards represented in submissions)
 * - V_voice: Voice-to-Text accessibility ratio (% of submissions delivered via spoken audio)
 * - R_res: Feedback Resolution & Responsiveness rate (% of citizen issues officially addressed)
 * - Q_att: Gram Sabha Quorum attainment ratio (Actual attendees / Constitutional quorum target)
 */

import { db, Project } from './db.js';

export interface CEIBreakdown {
  score: number;
  factors: {
    voterParticipationRate: { raw: number; score: number; weight: number; contribution: number };
    wardDiversityRate: { raw: number; score: number; weight: number; contribution: number };
    voiceAdoptionRate: { raw: number; score: number; weight: number; contribution: number };
    resolutionRate: { raw: number; score: number; weight: number; contribution: number };
    quorumAttainmentRate: { raw: number; score: number; weight: number; contribution: number };
  };
  classification: 'EXEMPLARY' | 'ACTIVE' | 'MODERATE' | 'NEEDS_OUTREACH';
  calculatedAt: string;
}

export function calculateProjectCEI(projectId: string): CEIBreakdown {
  const project = db.projects.find(p => p.id === projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const panchayat = db.panchayats.find(p => p.id === project.panchayatId);
  const totalVotersInWard = panchayat ? Math.round(panchayat.totalVoters / 12) : 1000;
  
  const projectSubmissions = db.submissions.filter(s => s.projectId === projectId);
  const totalSubmissions = projectSubmissions.length;
  const voiceSubmissions = projectSubmissions.filter(s => s.submissionType === 'voice').length;
  const resolvedSubmissions = projectSubmissions.filter(s => s.status === 'reviewed' || s.status === 'addressed').length;

  // 1. Voter Participation Rate (capped at 100)
  const participationRaw = totalVotersInWard > 0 ? (totalSubmissions / totalVotersInWard) * 100 : 0;
  // Scaled: 5% participation in rural direct consultation is excellent (score = 100)
  const vRateScore = Math.min(100, Math.max(10, (participationRaw / 5) * 100));

  // 2. Ward & Citizen Diversity (distribution across feedback)
  const dDivScore = totalSubmissions > 0 ? Math.min(100, 60 + (totalSubmissions * 4)) : 30;

  // 3. Voice Adoption Rate (% voice inputs vs total)
  const voicePct = totalSubmissions > 0 ? (voiceSubmissions / totalSubmissions) * 100 : 80;
  const vVoiceScore = Math.min(100, voicePct);

  // 4. Feedback Responsiveness / Resolution Rate
  const resPct = totalSubmissions > 0 ? (resolvedSubmissions / totalSubmissions) * 100 : 50;
  const rResScore = Math.min(100, Math.max(20, resPct));

  // 5. Gram Sabha Quorum Attainment
  const gramSabha = db.gramSabhas.find(gs => gs.panchayatId === project.panchayatId);
  const qAttRaw = gramSabha ? (gramSabha.actualAttendees / gramSabha.quorumTarget) * 100 : 100;
  const qAttScore = Math.min(100, qAttRaw);

  // Compute Weighted Score
  const weightVRate = 0.25;
  const weightDDiv = 0.20;
  const weightVVoice = 0.20;
  const weightRRes = 0.20;
  const weightQAtt = 0.15;

  const contribVRate = vRateScore * weightVRate;
  const contribDDiv = dDivScore * weightDDiv;
  const contribVVoice = vVoiceScore * weightVVoice;
  const contribRRes = rResScore * weightRRes;
  const contribQAtt = qAttScore * weightQAtt;

  const totalCEI = Number((contribVRate + contribDDiv + contribVVoice + contribRRes + contribQAtt).toFixed(1));

  let classification: CEIBreakdown['classification'] = 'MODERATE';
  if (totalCEI >= 85) classification = 'EXEMPLARY';
  else if (totalCEI >= 70) classification = 'ACTIVE';
  else if (totalCEI >= 50) classification = 'MODERATE';
  else classification = 'NEEDS_OUTREACH';

  // Update project CEI in store
  project.ceiScore = totalCEI;

  return {
    score: totalCEI,
    factors: {
      voterParticipationRate: { raw: Number(participationRaw.toFixed(2)), score: Number(vRateScore.toFixed(1)), weight: weightVRate, contribution: Number(contribVRate.toFixed(2)) },
      wardDiversityRate: { raw: totalSubmissions, score: Number(dDivScore.toFixed(1)), weight: weightDDiv, contribution: Number(contribDDiv.toFixed(2)) },
      voiceAdoptionRate: { raw: Number(voicePct.toFixed(1)), score: Number(vVoiceScore.toFixed(1)), weight: weightVVoice, contribution: Number(contribVVoice.toFixed(2)) },
      resolutionRate: { raw: Number(resPct.toFixed(1)), score: Number(rResScore.toFixed(1)), weight: weightRRes, contribution: Number(contribRRes.toFixed(2)) },
      quorumAttainmentRate: { raw: Number(qAttRaw.toFixed(1)), score: Number(qAttScore.toFixed(1)), weight: weightQAtt, contribution: Number(contribQAtt.toFixed(2)) }
    },
    classification,
    calculatedAt: new Date().toISOString()
  };
}

export function recalculateAllPanchayatScores(): void {
  for (const panchayat of db.panchayats) {
    const pProjects = db.projects.filter(p => p.panchayatId === panchayat.id);
    const pTickets = db.maintenanceTickets.filter(t => t.panchayatId === panchayat.id);
    const pGramSabha = db.gramSabhas.find(g => g.panchayatId === panchayat.id);

    // Timeliness
    const timelinessScore = 85.0;

    // SLA compliance
    const totalTickets = pTickets.length;
    const breachedTickets = pTickets.filter(t => t.isBreached).length;
    const slaComplianceScore = totalTickets > 0 ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 100) : 90;

    // CEI average
    const avgCei = pProjects.length > 0 ? pProjects.reduce((acc, p) => acc + p.ceiScore, 0) / pProjects.length : 75;

    // Quorum
    const quorumScore = pGramSabha ? Math.min(100, Math.round((pGramSabha.actualAttendees / pGramSabha.quorumTarget) * 100)) : 88;

    // Transparency
    const financialTransparencyScore = 88;

    const overall = Number((
      (avgCei * 0.30) +
      (slaComplianceScore * 0.25) +
      (timelinessScore * 0.20) +
      (quorumScore * 0.15) +
      (financialTransparencyScore * 0.10)
    ).toFixed(1));

    panchayat.ceiScore = Number(avgCei.toFixed(1));

    const existingScore = db.governanceScores.find(g => g.panchayatId === panchayat.id);
    if (existingScore) {
      existingScore.overallScore = overall;
      existingScore.citizenEngagementScore = Number(avgCei.toFixed(1));
      existingScore.slaComplianceScore = slaComplianceScore;
      existingScore.timelinessScore = timelinessScore;
      existingScore.gramSabhaQuorumScore = quorumScore;
      existingScore.lastCalculatedAt = new Date().toISOString();
    } else {
      db.governanceScores.push({
        panchayatId: panchayat.id,
        panchayatName: panchayat.name,
        overallScore: overall,
        citizenEngagementScore: Number(avgCei.toFixed(1)),
        timelinessScore,
        slaComplianceScore,
        financialTransparencyScore,
        gramSabhaQuorumScore: quorumScore,
        rankInDistrict: 1,
        totalPanchayatsInDistrict: 30,
        lastCalculatedAt: new Date().toISOString()
      });
    }
  }
}
