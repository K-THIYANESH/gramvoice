/**
 * GramVoice TN - API Client Service
 */
import { Project, CitizenSubmission, GramSabhaSession, ConstructionPhotoReport, MaintenanceTicket, ProjectSuggestion, LedgerBlock, Panchayat, GovernanceScore } from '../types';

export const api = {
  // Panchayats
  async getPanchayats(): Promise<Panchayat[]> {
    const res = await fetch('/api/panchayats');
    if (!res.ok) throw new Error('Failed to fetch Panchayats');
    return res.json();
  },

  // Projects
  async getProjects(params?: { panchayatId?: string; category?: string; stage?: string }): Promise<Project[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/projects${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProjectById(id: string): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project details');
    return res.json();
  },

  async createProject(project: Partial<Project>): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async updateProjectStage(id: string, newStage: string, officialRole: string, officialId: string, rationale?: string): Promise<{ project: Project; ledgerBlock: LedgerBlock }> {
    const res = await fetch(`/api/projects/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStage, officialRole, officialId, rationale })
    });
    if (!res.ok) throw new Error('Failed to update stage');
    return res.json();
  },

  async updateMilestone(projectId: string, milestoneId: string, data: { status?: string; verifiedBy?: string; releasePayment?: boolean; officialRole?: string; rationale?: string }): Promise<{ project: Project; milestone: any; ledgerBlock?: LedgerBlock }> {
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update milestone');
    return res.json();
  },

  // Submissions
  async getSubmissions(params?: { projectId?: string; gramSabhaId?: string; status?: string }): Promise<CitizenSubmission[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/submissions${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch submissions');
    return res.json();
  },

  async submitVoice(data: { projectId?: string; gramSabhaId?: string; audioBase64?: string; mimeType?: string; textFallback?: string; citizenName?: string; citizenPhone?: string; panchayatId?: string; durationSeconds?: number }): Promise<CitizenSubmission> {
    const res = await fetch('/api/submissions/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit voice feedback');
    return res.json();
  },

  async submitText(data: { projectId?: string; gramSabhaId?: string; text: string; citizenName?: string; citizenPhone?: string; panchayatId?: string }): Promise<CitizenSubmission> {
    const res = await fetch('/api/submissions/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit text feedback');
    return res.json();
  },

  async respondToSubmission(id: string, officialResponse: string, officialResponseBy: string): Promise<CitizenSubmission> {
    const res = await fetch(`/api/submissions/${id}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officialResponse, officialResponseBy })
    });
    if (!res.ok) throw new Error('Failed to post response');
    return res.json();
  },

  // Gram Sabha
  async getGramSabhas(panchayatId?: string): Promise<GramSabhaSession[]> {
    const res = await fetch(`/api/gramsabha${panchayatId ? `?panchayatId=${panchayatId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch Gram Sabhas');
    return res.json();
  },

  async getGramSabhaById(id: string): Promise<GramSabhaSession> {
    const res = await fetch(`/api/gramsabha/${id}`);
    if (!res.ok) throw new Error('Failed to fetch Gram Sabha details');
    return res.json();
  },

  async synthesizeAgendaThemes(gramSabhaId: string, agendaItemId: string): Promise<{ themes: string[]; consensusSummaryEn: string; consensusSummaryTa: string }> {
    const res = await fetch(`/api/gramsabha/${gramSabhaId}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agendaItemId })
    });
    if (!res.ok) throw new Error('Failed to synthesize themes');
    return res.json();
  },

  async recordGramSabhaDecision(gramSabhaId: string, data: { agendaItemId: string; officialDecision: string; officialDecisionTamil: string; decisionRationale: string; officialRole: string; officialId: string }): Promise<{ gramSabha: GramSabhaSession; ledgerBlock: LedgerBlock }> {
    const res = await fetch(`/api/gramsabha/${gramSabhaId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record decision');
    return res.json();
  },

  // Construction
  async getConstructionPhotos(projectId?: string): Promise<ConstructionPhotoReport[]> {
    const res = await fetch(`/api/construction/photos${projectId ? `?projectId=${projectId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch construction photos');
    return res.json();
  },

  async submitConstructionPhoto(data: { projectId: string; milestoneId: string; imageBase64: string; comment?: string; citizenName?: string; gpsCoordinates?: { lat: number; lng: number }; reportType?: string }): Promise<ConstructionPhotoReport> {
    const res = await fetch('/api/construction/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit photo');
    return res.json();
  },

  async verifyConstructionPhoto(id: string, data: { officialStatus: string; officialNotes?: string; verifiedBy?: string }): Promise<ConstructionPhotoReport> {
    const res = await fetch(`/api/construction/photos/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to verify photo');
    return res.json();
  },

  // Maintenance & SLA
  async getMaintenanceTickets(params?: { panchayatId?: string; status?: string; isBreached?: boolean }): Promise<MaintenanceTicket[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/maintenance${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch maintenance tickets');
    return res.json();
  },

  async createMaintenanceTicket(ticket: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });
    if (!res.ok) throw new Error('Failed to file ticket');
    return res.json();
  },

  async assignTicket(id: string, workerName: string, workerContact: string): Promise<MaintenanceTicket> {
    const res = await fetch(`/api/maintenance/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerName, workerContact })
    });
    if (!res.ok) throw new Error('Failed to assign ticket');
    return res.json();
  },

  async resolveTicket(id: string, resolutionSummary: string, resolutionPhotoUrl?: string, officialRole?: string, officialId?: string): Promise<{ ticket: MaintenanceTicket; ledgerBlock: LedgerBlock }> {
    const res = await fetch(`/api/maintenance/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionSummary, resolutionPhotoUrl, officialRole, officialId })
    });
    if (!res.ok) throw new Error('Failed to resolve ticket');
    return res.json();
  },

  // Suggestions
  async getSuggestions(panchayatId?: string): Promise<ProjectSuggestion[]> {
    const res = await fetch(`/api/suggestions${panchayatId ? `?panchayatId=${panchayatId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch suggestions');
    return res.json();
  },

  async createSuggestion(data: Partial<ProjectSuggestion>): Promise<ProjectSuggestion> {
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to post suggestion');
    return res.json();
  },

  async upvoteSuggestion(id: string, citizenId?: string): Promise<ProjectSuggestion> {
    const res = await fetch(`/api/suggestions/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizenId })
    });
    if (!res.ok) throw new Error('Failed to upvote');
    return res.json();
  },

  // Cryptographic Ledger
  async getLedger(): Promise<{ blocks: LedgerBlock[]; verification: any }> {
    const res = await fetch('/api/ledger');
    if (!res.ok) throw new Error('Failed to fetch ledger');
    return res.json();
  },

  async verifyLedger(): Promise<any> {
    const res = await fetch('/api/ledger/verify');
    if (!res.ok) throw new Error('Failed to verify ledger');
    return res.json();
  },

  async simulateTamper(blockIndex: number = 1): Promise<any> {
    const res = await fetch('/api/ledger/test-tamper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIndex })
    });
    if (!res.ok) throw new Error('Tamper test failed');
    return res.json();
  },

  async restoreLedger(blockIndex: number = 1): Promise<any> {
    const res = await fetch('/api/ledger/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIndex })
    });
    if (!res.ok) throw new Error('Restore failed');
    return res.json();
  },

  // Analytics
  async getGovernanceScores(): Promise<GovernanceScore[]> {
    const res = await fetch('/api/analytics/governance');
    if (!res.ok) throw new Error('Failed to fetch governance scores');
    return res.json();
  },

  async getAnalyticsSummary(): Promise<any> {
    const res = await fetch('/api/analytics/summary');
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  // DPR AI
  async generateDPR(title: string, description: string, budget: number): Promise<any> {
    const res = await fetch('/api/dpr/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, budget })
    });
    if (!res.ok) throw new Error('Failed to generate DPR summary');
    return res.json();
  },

  // Transparency
  async getPublicData(): Promise<any> {
    const res = await fetch('/api/transparency/public-data');
    if (!res.ok) throw new Error('Failed to fetch public data');
    return res.json();
  },

  // Assistant Chatbot
  async sendChatMessage(message: string, history: any[] = [], userContext: any = {}): Promise<any> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, userContext })
    });
    if (!res.ok) throw new Error('Failed to communicate with AI Assistant');
    return res.json();
  }
};
