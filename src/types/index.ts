/**
 * GramVoice TN - Frontend TypeScript Definitions & Contracts
 */

export type Language = 'en' | 'ta';

export type UserRole = 
  | 'CITIZEN' 
  | 'PANCHAYAT_SECRETARY' 
  | 'PANCHAYAT_PRESIDENT' 
  | 'BDO' 
  | 'DISTRICT_COLLECTOR' 
  | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  nameTamil?: string;
  phone: string;
  role: UserRole;
  panchayatId: string;
  panchayatName: string;
  wardNumber: number;
}

export type ProjectStage = 
  | 'DISCOVER' 
  | 'UNDERSTAND' 
  | 'SUGGEST' 
  | 'PARTICIPATE' 
  | 'VALIDATE' 
  | 'MONITOR' 
  | 'MAINTAIN';

export type ProjectStatus = 'draft' | 'consultation' | 'approved' | 'tendering' | 'in_construction' | 'maintenance' | 'completed';

export interface ProjectMilestone {
  id: string;
  title: string;
  titleTamil: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'verified' | 'delayed';
  budgetSharePct: number;
  amountAllocated: number;
  verifiedBy?: string;
  evidencePhotoCount: number;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  titleTamil: string;
  description: string;
  descriptionTamil: string;
  category: 'Roads & Transport' | 'Water Supply' | 'Sanitation' | 'Healthcare' | 'Education' | 'Energy' | 'Agriculture';
  panchayatId: string;
  panchayatName: string;
  wardNumber: number;
  gpsLocation: { lat: number; lng: number; address: string };
  budgetTotal: number;
  fundSource: string;
  stage: ProjectStage;
  status: ProjectStatus;
  consultationEndsAt: string;
  contractorName?: string;
  startDate: string;
  completionTargetDate: string;
  dprSummaryEn: string;
  dprSummaryTa: string;
  audioExplanationUrl?: string;
  milestones: ProjectMilestone[];
  participationCount: number;
  voiceResponsesCount: number;
  positiveSentimentPct: number;
  ceiScore: number;
  ceiBreakdown?: CEIBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenSubmission {
  id: string;
  projectId: string;
  gramSabhaId?: string;
  citizenId: string;
  citizenName: string;
  citizenPhoneMasked: string;
  panchayatId: string;
  submissionType: 'voice' | 'text';
  durationSeconds?: number;
  language: 'ta' | 'en' | 'ta-en';
  transcriptRaw: string;
  transcriptTamil?: string;
  transcriptEnglish?: string;
  keyThemes: string[];
  sentiment: 'supportive' | 'concerned' | 'neutral' | 'critical';
  urgency: 'low' | 'medium' | 'high';
  aiAssisted: boolean;
  status: 'pending' | 'processed' | 'reviewed' | 'addressed';
  officialResponse?: string;
  officialResponseBy?: string;
  createdAt: string;
}

export interface GramSabhaSession {
  id: string;
  sessionNumber: string;
  panchayatId: string;
  panchayatName: string;
  meetingDate: string;
  meetingTime: string;
  venue: string;
  venueTamil: string;
  status: 'scheduled' | 'consultation_open' | 'hearing_in_progress' | 'decided' | 'closed';
  agendaItems: {
    id: string;
    title: string;
    titleTamil: string;
    description: string;
    projectId?: string;
    submissionsCount: number;
    supportCount: number;
    concernCount: number;
    aiExtractedThemes: string[];
    officialDecision?: string;
    officialDecisionTamil?: string;
    decisionRationale?: string;
    ledgerHash?: string;
  }[];
  quorumTarget: number;
  actualAttendees: number;
  minutesOfMeeting?: string;
  minutesOfMeetingTamil?: string;
  createdAt: string;
}

export interface ConstructionPhotoReport {
  id: string;
  projectId: string;
  milestoneId: string;
  citizenId: string;
  citizenName: string;
  photoUrl: string;
  gpsCoordinates: { lat: number; lng: number };
  gpsVerified: boolean;
  reportType: 'progress_verification' | 'defect_alert' | 'quality_concern';
  comment: string;
  aiDefectAnalysis?: {
    defectDetected: boolean;
    defectCategory?: string;
    severityLevel?: 'low' | 'medium' | 'high' | 'critical';
    summary: string;
    confidenceScore: number;
  };
  officialStatus: 'pending' | 'verified_accurate' | 'rejected' | 'remedial_action_ordered';
  officialNotes?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  titleTamil: string;
  description: string;
  category: 'Water Pipeline' | 'Street Light' | 'Road Pothole' | 'Drainage Blockage' | 'Public Toilet' | 'School Facility';
  panchayatId: string;
  wardNumber: number;
  gpsLocation: { lat: number; lng: number; landmark: string };
  photoUrl?: string;
  audioNoteUrl?: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  slaHoursTarget: number;
  slaDueAt: string;
  isBreached: boolean;
  assignedDepartment: string;
  assignedWorkerName?: string;
  assignedWorkerContact?: string;
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CITIZEN_VERIFIED' | 'CLOSED';
  resolutionSummary?: string;
  resolutionPhotoUrl?: string;
  reportedByPhoneMasked: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSuggestion {
  id: string;
  title: string;
  titleTamil: string;
  description: string;
  category: string;
  panchayatId: string;
  panchayatName: string;
  wardNumber: number;
  proposedByCitizen: string;
  upvotesCount: number;
  upvotedCitizenIds: string[];
  status: 'submitted' | 'under_review' | 'included_in_gram_sabha' | 'approved_for_dpr' | 'archived';
  createdAt: string;
}

export interface LedgerBlock {
  index: number;
  timestamp: string;
  previousHash: string;
  hash: string;
  actionType: 'GRAM_SABHA_RESOLUTION' | 'PROJECT_STAGE_CHANGE' | 'CONTRACTOR_PAYMENT_APPROVAL' | 'MAINTENANCE_RESOLUTION_SIGN_OFF';
  entityId: string;
  entityType: 'project' | 'gram_sabha' | 'maintenance' | 'milestone';
  panchayatId: string;
  officialId: string;
  officialRole: string;
  payload: Record<string, any>;
  rationale: string;
  tampered?: boolean;
}

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

export interface Panchayat {
  id: string;
  name: string;
  nameTamil: string;
  district: string;
  districtTamil: string;
  block: string;
  population: number;
  totalVoters: number;
  activeProjectsCount: number;
  ceiScore: number;
}

export interface GovernanceScore {
  panchayatId: string;
  panchayatName: string;
  overallScore: number;
  citizenEngagementScore: number;
  timelinessScore: number;
  slaComplianceScore: number;
  financialTransparencyScore: number;
  gramSabhaQuorumScore: number;
  rankInDistrict: number;
  totalPanchayatsInDistrict: number;
  lastCalculatedAt: string;
}

export interface OfflineQueuedItem {
  id: string;
  type: 'voice_submission' | 'text_submission' | 'maintenance_ticket' | 'suggestion' | 'construction_photo';
  payload: any;
  timestamp: number;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  errorMessage?: string;
}
