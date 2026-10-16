/**
 * GramVoice TN - In-Memory Database Store with Real Tamil Nadu Governance Models
 */

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
  audioBlobUrl?: string;
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
  officialRole: 'PANCHAYAT_SECRETARY' | 'PANCHAYAT_PRESIDENT' | 'BDO' | 'DISTRICT_COLLECTOR';
  payload: Record<string, any>;
  rationale: string;
  tampered?: boolean;
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

// Initial In-Memory Seed Storage
class Database {
  panchayats: Panchayat[] = [
    {
      id: 'pan-001',
      name: 'Alanganallur',
      nameTamil: 'அலங்காநல்லூர்',
      district: 'Madurai',
      districtTamil: 'மதுரை',
      block: 'Vadipatti',
      population: 18450,
      totalVoters: 12600,
      activeProjectsCount: 4,
      ceiScore: 78.4
    },
    {
      id: 'pan-002',
      name: 'Odanthurai',
      nameTamil: 'ஓடந்துறை',
      district: 'Coimbatore',
      districtTamil: 'கோயம்புத்தூர்',
      block: 'Karamadai',
      population: 7200,
      totalVoters: 5100,
      activeProjectsCount: 3,
      ceiScore: 92.1
    },
    {
      id: 'pan-003',
      name: 'Thirukkuvalai',
      nameTamil: 'திருக்குவளை',
      district: 'Nagapattinam',
      districtTamil: 'நாகப்பட்டினம்',
      block: 'Thirumarugal',
      population: 9400,
      totalVoters: 6800,
      activeProjectsCount: 2,
      ceiScore: 71.8
    },
    {
      id: 'pan-004',
      name: 'Melpuram',
      nameTamil: 'மேல்புறம்',
      district: 'Kanyakumari',
      districtTamil: 'கன்னியாகுமரி',
      block: 'Melpuram',
      population: 14200,
      totalVoters: 10100,
      activeProjectsCount: 3,
      ceiScore: 84.6
    },
    {
      id: 'pan-005',
      name: 'Kurinjipadi',
      nameTamil: 'குறிஞ்சிப்பாடி',
      district: 'Cuddalore',
      districtTamil: 'கடலூர்',
      block: 'Kurinjipadi',
      population: 22100,
      totalVoters: 15800,
      activeProjectsCount: 5,
      ceiScore: 69.2
    }
  ];

  projects: Project[] = [
    {
      id: 'proj-001',
      code: 'TN-MDU-ALN-2026-RD01',
      title: 'Alanganallur Main Village Link & Drainage Road',
      titleTamil: 'அலங்காநல்லூர் கிராம இணைப்பு சாலை மற்றும் வடிகால் சீரமைப்பு',
      description: 'Upgradation of 2.8 km single lane village link road with CC drainage channels on both sides to prevent monsoon flooding and connect Ward 4 and 7 to State Highway.',
      descriptionTamil: 'மழைக்கால வெள்ளத்தைத் தடுக்க இருபுறமும் சிமெண்ட் வடிகால் அமைத்து, 4 மற்றும் 7-வது வார்டுகளை மாநில நெடுஞ்சாலையுடன் இணைக்கும் 2.8 கி.மீ கிராம இணைப்பு சாலையை மேம்படுத்துதல்.',
      category: 'Roads & Transport',
      panchayatId: 'pan-001',
      panchayatName: 'Alanganallur',
      wardNumber: 4,
      gpsLocation: { lat: 10.0489, lng: 78.0779, address: 'Kottai Mettu Street to SH-72 Junction, Alanganallur' },
      budgetTotal: 4850000,
      fundSource: 'Tamil Nadu Rural Roads Improvement Scheme (TNRRIS) & State Finance Commission',
      stage: 'PARTICIPATE',
      status: 'consultation',
      consultationEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      contractorName: 'Marudham Infrastructure Pvt Ltd',
      startDate: '2026-03-01',
      completionTargetDate: '2026-08-30',
      dprSummaryEn: 'Comprehensive road reconstruction using M-30 paver grade concrete on curve gradients, WBM base course, and RCC covered stormwater drains. Solar street lighting included at 5 critical intersections.',
      dprSummaryTa: 'வளைவுகளில் M-30 தர கான்கிரீட் தளம், தரமான WBM பேஸ் கோர்ஸ் மற்றும் மூடப்பட்ட RCC மழைநீர் வடிகால் அமைத்தல். 5 முக்கிய சந்திப்புகளில் சோலார் தெருவிளக்குகள் பொருத்துதல்.',
      milestones: [
        {
          id: 'ms-001',
          title: 'Topographic Survey & Public Consultation Sign-off',
          titleTamil: 'நில அளவீடு மற்றும் பொதுமக்கள் கலந்தாய்வு ஒப்புதல்',
          targetDate: '2026-03-10',
          completedDate: '2026-03-08',
          status: 'verified',
          budgetSharePct: 10,
          amountAllocated: 485000,
          verifiedBy: 'BDO Vadipatti Block',
          evidencePhotoCount: 6
        },
        {
          id: 'ms-002',
          title: 'Stormwater RCC Drain Channel Construction (2.8 km)',
          titleTamil: 'RCC மழைநீர் வடிகால் கால்வாய் அமைத்தல் (2.8 கி.மீ)',
          targetDate: '2026-04-20',
          status: 'in_progress',
          budgetSharePct: 35,
          amountAllocated: 1697500,
          evidencePhotoCount: 12
        },
        {
          id: 'ms-003',
          title: 'Bituminous Macadam Base Layer & Compaction',
          titleTamil: 'தார் சாலை அடித்தளம் மற்றும் ரோலர் சமன்படுத்துதல்',
          targetDate: '2026-06-15',
          status: 'pending',
          budgetSharePct: 40,
          amountAllocated: 1940000,
          evidencePhotoCount: 0
        },
        {
          id: 'ms-004',
          title: 'Solar Lighting, Signage & Final Inspection Audit',
          titleTamil: 'சோலார் விளக்குகள், வழிகாட்டிகள் மற்றும் இறுதி தணிக்கை',
          targetDate: '2026-08-30',
          status: 'pending',
          budgetSharePct: 15,
          amountAllocated: 727500,
          evidencePhotoCount: 0
        }
      ],
      participationCount: 47,
      voiceResponsesCount: 38,
      positiveSentimentPct: 82,
      ceiScore: 84.2,
      createdAt: '2026-02-10T09:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj-002',
      code: 'TN-CBE-ODN-2026-WS02',
      title: 'Odanthurai Solar Smart Overhead Water Supply System',
      titleTamil: 'ஓடந்துறை சோலார் மேல்நிலை நீர்த்தேக்க தொட்டி திட்டம்',
      description: '1.5 Lakh Litre capacity RCC overhead tank integrated with 15 kW grid-tied solar pump and SCADA sensor network for 24x7 automated potable water distribution across all 9 hamlets.',
      descriptionTamil: 'அனைத்து 9 குக்கிராமங்களுக்கும் 24 மணி நேர குடிநீர் வழங்க 15 kW சோலார் பம்ப் மற்றும் SCADA சென்சார்களுடன் கூடிய 1.5 லட்சம் லிட்டர் கொள்ளளவு கொண்ட RCC மேல்நிலை தொட்டி.',
      category: 'Water Supply',
      panchayatId: 'pan-002',
      panchayatName: 'Odanthurai',
      wardNumber: 2,
      gpsLocation: { lat: 11.3142, lng: 76.9381, address: 'High School Road, Odanthurai, Karamadai' },
      budgetTotal: 3600000,
      fundSource: 'Jal Jeevan Mission & Clean Energy Fund',
      stage: 'MONITOR',
      status: 'in_construction',
      consultationEndsAt: '2026-01-20T18:00:00.000Z',
      contractorName: 'Kovai Green Water Tech',
      startDate: '2026-01-25',
      completionTargetDate: '2026-07-15',
      dprSummaryEn: 'Solar-powered multi-village water supply scheme eliminating grid electricity bills. Dual filtration units and digital water meter kiosks installed at village centers.',
      dprSummaryTa: 'மின்சார கட்டணத்தை முழுமையாக தவிர்க்கும் சோலார் குடிநீர் திட்டம். கிராம மையங்களில் இரட்டை வடிகட்டி மற்றும் டிஜிட்டல் குடிநீர் மீட்டர்கள்.',
      milestones: [
        {
          id: 'ms-201',
          title: 'Soil Testing & RCC Column Foundation',
          titleTamil: 'மண் பரிசோதனை மற்றும் தூண் அடித்தளம்',
          targetDate: '2026-02-15',
          completedDate: '2026-02-12',
          status: 'verified',
          budgetSharePct: 30,
          amountAllocated: 1080000,
          verifiedBy: 'Assistant Engineer, TWAD Board',
          evidencePhotoCount: 15
        },
        {
          id: 'ms-202',
          title: 'Tank Staging & 1.5L Litre Reservoir Casting',
          titleTamil: 'தொட்டி தூண்கள் மற்றும் 1.5 லட்சம் லிட்டர் தொட்டி கான்கிரீட் பணி',
          targetDate: '2026-04-10',
          status: 'in_progress',
          budgetSharePct: 45,
          amountAllocated: 1620000,
          evidencePhotoCount: 8
        },
        {
          id: 'ms-203',
          title: 'Solar PV Array Mounting & Distribution Pipeline',
          titleTamil: 'சோலார் பேனல் பொருத்துதல் மற்றும் குடிநீர் குழாய் இணைப்பு',
          targetDate: '2026-07-15',
          status: 'pending',
          budgetSharePct: 25,
          amountAllocated: 900000,
          evidencePhotoCount: 0
        }
      ],
      participationCount: 89,
      voiceResponsesCount: 71,
      positiveSentimentPct: 94,
      ceiScore: 91.8,
      createdAt: '2026-01-05T08:30:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj-003',
      code: 'TN-NGP-THK-2026-HC01',
      title: 'Thirukkuvalai Mother & Child Health Sub-Centre',
      titleTamil: 'திருக்குவளை தாய் சேய் நல ஆரம்ப சுகாதார துணை நிலையம்',
      description: 'Modernized 6-bed maternal health clinic with cold-chain vaccine storage, telemedicine terminal connecting to Thiruvarur Medical College, and 24-hour nursing quarters.',
      descriptionTamil: 'தடுப்பூசி குளிர்பதன வசதி, திருவாரூர் மருத்துவக் கல்லூரியுடன் இணைக்கும் டெலிமெடிசின் மற்றும் 24 மணி நேர செவிலியர் குடியிருப்புடன் கூடிய 6 படுக்கை தாய் சேய் நல மருத்துவமனை.',
      category: 'Healthcare',
      panchayatId: 'pan-003',
      panchayatName: 'Thirukkuvalai',
      wardNumber: 3,
      gpsLocation: { lat: 10.6375, lng: 79.8242, address: 'South Car Street, Thirukkuvalai' },
      budgetTotal: 2900000,
      fundSource: 'National Health Mission (NHM) & MLA Constituency Development Fund',
      stage: 'VALIDATE',
      status: 'approved',
      consultationEndsAt: '2026-02-15T18:00:00.000Z',
      contractorName: 'Chola Builders & Engineers',
      startDate: '2026-03-15',
      completionTargetDate: '2026-09-30',
      dprSummaryEn: 'Disaster-resistant single-story RCC healthcare structure with rooftop solar inverter backup, solar water heating, and barrier-free ramp access for elderly and expectant mothers.',
      dprSummaryTa: 'பேரிடர் தாங்கும் கான்கிரீட் கட்டிடம், சோலார் மின்வசதி, சுடுநீர் வசதி மற்றும் கர்ப்பிணி தாய்மார்களுக்கான சாய்வுதளம்.',
      milestones: [
        {
          id: 'ms-301',
          title: 'Gram Sabha Sanction & Land Clearance',
          titleTamil: 'கிராம சபை அனுமதி மற்றும் நில ஒதுக்கீடு',
          targetDate: '2026-02-28',
          completedDate: '2026-02-20',
          status: 'verified',
          budgetSharePct: 15,
          amountAllocated: 435000,
          verifiedBy: 'Deputy Director of Health Services',
          evidencePhotoCount: 4
        },
        {
          id: 'ms-302',
          title: 'Civil Construction & Vaccine Cold-Room',
          titleTamil: 'கட்டிட பணி மற்றும் தடுப்பூசி குளிர்சாதன அறை',
          targetDate: '2026-06-30',
          status: 'pending',
          budgetSharePct: 60,
          amountAllocated: 1740000,
          evidencePhotoCount: 0
        },
        {
          id: 'ms-303',
          title: 'Telemedicine Hardware Setup & Staff Onboarding',
          titleTamil: 'டெலிமெடிசின் உபகரணங்கள் மற்றும் செவிலியர் பணி நியமனம்',
          targetDate: '2026-09-30',
          status: 'pending',
          budgetSharePct: 25,
          amountAllocated: 725000,
          evidencePhotoCount: 0
        }
      ],
      participationCount: 32,
      voiceResponsesCount: 26,
      positiveSentimentPct: 88,
      ceiScore: 76.5,
      createdAt: '2026-01-18T11:00:00.000Z',
      updatedAt: new Date().toISOString()
    }
  ];

  submissions: CitizenSubmission[] = [
    {
      id: 'sub-001',
      projectId: 'proj-001',
      gramSabhaId: 'gs-001',
      citizenId: 'cit-101',
      citizenName: 'Muthuvel Karuppan',
      citizenPhoneMasked: '98421*****',
      panchayatId: 'pan-001',
      submissionType: 'voice',
      durationSeconds: 24,
      language: 'ta',
      transcriptRaw: 'சாலை போடும் போது எங்க தெரு பக்கத்துல இருக்கிற அரசு பள்ளி நுழைவாயில் கிட்ட வேகத்தடை கண்டிப்பா போடணும். குழந்தைகள் போற இடம்.',
      transcriptTamil: 'சாலை போடும் போது எங்கள் தெரு அரசு பள்ளி நுழைவாயிலில் வேகத்தடை அமைக்க வேண்டும். குழந்தைகள் பாதுகாப்பு மிக முக்கியம்.',
      transcriptEnglish: 'While laying the road, please ensure a speed-breaker is installed near the government school entrance. Children safety is critical.',
      keyThemes: ['School Safety', 'Speed Breaker Request', 'Child Protection'],
      sentiment: 'concerned',
      urgency: 'high',
      aiAssisted: true,
      status: 'addressed',
      officialResponse: 'Speed breaker with fluorescent thermoplastic paint and school zone signboard added to revised DPR drawing Section 4.2.',
      officialResponseBy: 'Assistant Executive Engineer (RD)',
      createdAt: '2026-02-14T10:15:00.000Z'
    },
    {
      id: 'sub-002',
      projectId: 'proj-001',
      gramSabhaId: 'gs-001',
      citizenId: 'cit-102',
      citizenName: 'Selvi Meenakshi',
      citizenPhoneMasked: '94432*****',
      panchayatId: 'pan-001',
      submissionType: 'voice',
      durationSeconds: 31,
      language: 'ta',
      transcriptRaw: 'மழை பெஞ்சா கால்வாய் தண்ணி எங்க வீட்டு வாசல்ல நிக்குது. வடிகால் ஆழமா வெட்டி மெயின் வாய்க்கால் வரைக்கும் தொடர்ச்சியா இணைக்கணும்.',
      transcriptTamil: 'மழை பெய்தால் கால்வாய் தண்ணீர் குடியிருப்பு வாசலில் தேங்குகிறது. வடிகால் ஆழமாக வெட்டி பிரதான வாய்க்காலுடன் இணைக்க வேண்டும்.',
      transcriptEnglish: 'During heavy rains water overflows into residential doorways. Drains must be dug deeper and continuously linked to the main irrigation surplus channel.',
      keyThemes: ['Drainage Depth', 'Waterlogging Prevention', 'Channel Connection'],
      sentiment: 'supportive',
      urgency: 'medium',
      aiAssisted: true,
      status: 'reviewed',
      officialResponse: 'Drain depth increased from 60cm to 90cm with precast RCC cover slabs.',
      officialResponseBy: 'Panchayat President',
      createdAt: '2026-02-15T14:40:00.000Z'
    },
    {
      id: 'sub-003',
      projectId: 'proj-001',
      citizenId: 'cit-103',
      citizenName: 'Anand Ramasamy',
      citizenPhoneMasked: '97890*****',
      panchayatId: 'pan-001',
      submissionType: 'text',
      language: 'en',
      transcriptRaw: 'Please make sure solar street lights are placed at the dark turn near the bus stop junction to help night bus commuters.',
      transcriptTamil: 'இரவு பேருந்தில் வரும் பயணிகளுக்கு உதவும் வகையில் பேருந்து நிறுத்த திருப்பத்தில் சோலார் விளக்கு அமைக்கவும்.',
      transcriptEnglish: 'Please make sure solar street lights are placed at the dark turn near the bus stop junction to help night bus commuters.',
      keyThemes: ['Street Lighting', 'Commuter Safety', 'Night Visibility'],
      sentiment: 'supportive',
      urgency: 'medium',
      aiAssisted: true,
      status: 'processed',
      createdAt: '2026-02-16T18:20:00.000Z'
    }
  ];

  gramSabhas: GramSabhaSession[] = [
    {
      id: 'gs-001',
      sessionNumber: 'GS-ALN-2026-01',
      panchayatId: 'pan-001',
      panchayatName: 'Alanganallur',
      meetingDate: '2026-03-22',
      meetingTime: '10:00 AM',
      venue: 'Panchayat Community Hall, Near Bus Stand',
      venueTamil: 'ஊராட்சி சமுதாய கூடம், பேருந்து நிலையம் அருகில்',
      status: 'consultation_open',
      agendaItems: [
        {
          id: 'ag-001',
          title: 'Approval of Revised DPR for Link Road (Ward 4 & 7)',
          titleTamil: 'இணைப்பு சாலை திருத்தப்பட்ட திட்ட அறிக்கை ஒப்புதல் (வார்டு 4 & 7)',
          description: 'Review of citizen feedback regarding speed breakers, drain depth, and tender award to Marudham Infrastructure.',
          projectId: 'proj-001',
          submissionsCount: 47,
          supportCount: 39,
          concernCount: 8,
          aiExtractedThemes: ['School Zone Speed Breakers', 'Drain Overflows during Northeast Monsoon', 'Lighting at Junctions'],
          officialDecision: 'Resolution passed unanimously with incorporated school safety speed breaker and drain depth amendment.',
          officialDecisionTamil: 'பள்ளி பாதுகாப்பு வேகத்தடை மற்றும் வடிகால் ஆழ திருத்தங்களுடன் ஒருமனதாக தீர்மானம் நிறைவேற்றப்பட்டது.',
          decisionRationale: 'Citizen voice feedback verified by Ward 4 councilor and Block Engineer.',
          ledgerHash: 'b4a8e23f991c01e74a88dc12480392ef10ad77ca9b456102381ab1938fe10091'
        },
        {
          id: 'ag-002',
          title: 'Selection of Ward 2 Desilting & PWD Tank Deepening Works',
          titleTamil: 'வார்டு 2 பாசன குளம் தூர்வாருதல் பணி தேர்வு',
          description: 'Prioritization of MGNREGS 100-day worker deployment for water conservation before Southwest monsoon.',
          submissionsCount: 22,
          supportCount: 20,
          concernCount: 2,
          aiExtractedThemes: ['Silt Clearance for Agriculture', 'Cattle Drinking Water Pond'],
          officialDecision: 'Approved for MGNREGS 2026-27 annual action plan.',
          officialDecisionTamil: 'மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதித் திட்டத்தின் கீழ் தேர்வு செய்யப்பட்டது.'
        }
      ],
      quorumTarget: 150,
      actualAttendees: 184,
      minutesOfMeeting: 'The Gram Sabha was presided by the Panchayat President with BDO in attendance. 47 citizen voice submissions were presented via GramVoice TN portal and incorporated into final resolutions.',
      minutesOfMeetingTamil: 'ஊராட்சி மன்ற தலைவர் தலைமையில் வட்டார வளர்ச்சி அலுவலர் முன்னிலையில் நடைபெற்றது. கிராம்வாய்ஸ் போர்டல் மூலம் பெறப்பட்ட 47 மக்களின் கருத்துக்கள் பரிசீலிக்கப்பட்டு தீர்மானங்கள் நிறைவேற்றப்பட்டன.',
      createdAt: '2026-02-01T10:00:00.000Z'
    }
  ];

  constructionPhotos: ConstructionPhotoReport[] = [
    {
      id: 'cp-001',
      projectId: 'proj-001',
      milestoneId: 'ms-002',
      citizenId: 'cit-104',
      citizenName: 'Karthik Raja',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&q=80',
      gpsCoordinates: { lat: 10.0491, lng: 78.0782 },
      gpsVerified: true,
      reportType: 'progress_verification',
      comment: 'Drain concrete shuttering work is proceeding smoothly near Ward 4 temple entrance.',
      aiDefectAnalysis: {
        defectDetected: false,
        summary: 'RCC shuttering alignment appears standard. Reinforcement steel spacing meets visual standards.',
        confidenceScore: 0.93
      },
      officialStatus: 'verified_accurate',
      verifiedBy: 'Assistant Engineer (RD)',
      createdAt: '2026-02-18T11:20:00.000Z'
    },
    {
      id: 'cp-002',
      projectId: 'proj-001',
      milestoneId: 'ms-002',
      citizenId: 'cit-105',
      citizenName: 'Veerappan S.',
      photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&q=80',
      gpsCoordinates: { lat: 10.0502, lng: 78.0795 },
      gpsVerified: true,
      reportType: 'defect_alert',
      comment: 'Honeycombing and cracks noticed on the side wall of the culvert slab before curing period.',
      aiDefectAnalysis: {
        defectDetected: true,
        defectCategory: 'Structural Honeycombing / Inadequate Vibration',
        severityLevel: 'medium',
        summary: 'Visible surface voiding and aggregate segregation detected on vertical RCC surface.',
        confidenceScore: 0.88
      },
      officialStatus: 'remedial_action_ordered',
      officialNotes: 'Contractor directed to dismantle defective 3m section and recast with approved superplasticizer mix.',
      verifiedBy: 'Block Development Officer',
      createdAt: '2026-02-19T15:45:00.000Z'
    }
  ];

  maintenanceTickets: MaintenanceTicket[] = [
    {
      id: 'tkt-001',
      ticketNumber: 'GV-MNT-2026-089',
      title: 'Major Drinking Water Pipeline Leakage near Mariamman Temple',
      titleTamil: 'மாரியம்மன் கோவில் அருகில் பிரதான குடிநீர் குழாய் உடைப்பு',
      description: 'Potable water is flooding the road for past 6 hours, leading to zero pressure in Ward 4 taps.',
      category: 'Water Pipeline',
      panchayatId: 'pan-001',
      wardNumber: 4,
      gpsLocation: { lat: 10.0485, lng: 78.0772, landmark: 'Opposite Ward 4 Ration Shop' },
      photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&q=80',
      priority: 'URGENT',
      slaHoursTarget: 24,
      slaDueAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
      isBreached: false,
      assignedDepartment: 'Panchayat Water Supply Wing',
      assignedWorkerName: 'Shanmugam (Plumber Specialist)',
      assignedWorkerContact: '98430*****',
      status: 'IN_PROGRESS',
      resolutionSummary: 'Excavation complete, 4-inch PVC coupler replacement currently being welded.',
      reportedByPhoneMasked: '98421*****',
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tkt-002',
      ticketNumber: 'GV-MNT-2026-074',
      title: 'Main Street Solar LED Light Failed for 3 Nights',
      titleTamil: 'மெயின் தெரு சோலார் எல்.இ.டி விளக்கு 3 நாட்களாக எரியவில்லை',
      description: 'Solar charge controller indicator flashing red, battery needs replacement or inspection.',
      category: 'Street Light',
      panchayatId: 'pan-001',
      wardNumber: 1,
      gpsLocation: { lat: 10.0472, lng: 78.0761, landmark: 'North Street Corner Pole #12' },
      priority: 'MEDIUM',
      slaHoursTarget: 72,
      slaDueAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isBreached: true,
      assignedDepartment: 'Rural Electrification Section',
      assignedWorkerName: 'K. Balaji (Electrician)',
      assignedWorkerContact: '94421*****',
      status: 'ASSIGNED',
      reportedByPhoneMasked: '94432*****',
      createdAt: new Date(Date.now() - 76 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tkt-003',
      ticketNumber: 'GV-MNT-2026-091',
      title: 'Drainage Clogged with Plastic Waste creating Stagnation',
      titleTamil: 'பிளாஸ்டிக் குப்பைகளால் அடைபட்ட சாக்கடை கால்வாய் சீரமைப்பு',
      description: 'Mosquito breeding risk near elementary school playground due to choked culvert.',
      category: 'Drainage Blockage',
      panchayatId: 'pan-001',
      wardNumber: 3,
      gpsLocation: { lat: 10.0498, lng: 78.0789, landmark: 'Panchayat Union Primary School Backside' },
      photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80',
      priority: 'HIGH',
      slaHoursTarget: 48,
      slaDueAt: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
      isBreached: false,
      assignedDepartment: 'Sanitation & Health Wing',
      assignedWorkerName: 'Murugan (Sanitary Supervisor)',
      assignedWorkerContact: '97871*****',
      status: 'REPORTED',
      reportedByPhoneMasked: '97890*****',
      createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  suggestions: ProjectSuggestion[] = [
    {
      id: 'sug-001',
      title: 'Establish a Village E-Sevai & Digital Library Center for Youth',
      titleTamil: 'இளைஞர்களுக்கான கிராம இ-சேவை மற்றும் டிஜிட்டல் நூலக மையம் அமைத்தல்',
      description: 'Convert the vacant old panchayat building into a computer training hub with broadband WiFi for students preparing for TNPSC and competitive exams.',
      category: 'Education',
      panchayatId: 'pan-001',
      panchayatName: 'Alanganallur',
      wardNumber: 2,
      proposedByCitizen: 'Dharani V. (College Student)',
      upvotesCount: 68,
      upvotedCitizenIds: ['cit-101', 'cit-102', 'cit-103', 'cit-104'],
      status: 'included_in_gram_sabha',
      createdAt: '2026-02-05T12:00:00.000Z'
    },
    {
      id: 'sug-002',
      title: 'Direct Farmer Vegetable Cold Storage & Drying Yard',
      titleTamil: 'விவசாயிகள் காய்கறி சேமிப்பு குளிர்சாதன கிடங்கு மற்றும் உலர்களம்',
      description: 'Solar powered 20-tonne cold storage facility to help local jasmine and tomato growers store produce during price dips.',
      category: 'Agriculture',
      panchayatId: 'pan-001',
      panchayatName: 'Alanganallur',
      wardNumber: 6,
      proposedByCitizen: 'R. Periyasamy (Farmers Union)',
      upvotesCount: 94,
      upvotedCitizenIds: ['cit-101', 'cit-105'],
      status: 'approved_for_dpr',
      createdAt: '2026-01-28T09:30:00.000Z'
    }
  ];

  ledgerBlocks: LedgerBlock[] = [
    {
      index: 0,
      timestamp: '2026-01-01T00:00:00.000Z',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: '9a5c88b77a01c34ef12480392ef10ad77ca9b456102381ab1938fe10091498e2',
      actionType: 'GRAM_SABHA_RESOLUTION',
      entityId: 'gs-000',
      entityType: 'gram_sabha',
      panchayatId: 'pan-001',
      officialId: 'off-admin',
      officialRole: 'PANCHAYAT_SECRETARY',
      payload: { note: 'Genesis Block - GramVoice TN Decision Integrity Ledger Initialized' },
      rationale: 'System initialization and constitutional Gram Sabha audit framework establishment.'
    },
    {
      index: 1,
      timestamp: '2026-02-10T10:00:00.000Z',
      previousHash: '9a5c88b77a01c34ef12480392ef10ad77ca9b456102381ab1938fe10091498e2',
      hash: 'b4a8e23f991c01e74a88dc12480392ef10ad77ca9b456102381ab1938fe10091',
      actionType: 'GRAM_SABHA_RESOLUTION',
      entityId: 'proj-001',
      entityType: 'project',
      panchayatId: 'pan-001',
      officialId: 'off-sec-01',
      officialRole: 'PANCHAYAT_SECRETARY',
      payload: {
        projectId: 'proj-001',
        resolutionNumber: 'RES-ALN-2026-01-RD',
        approvedBudget: 4850000,
        incorporatedAmendments: ['Speed Breaker at School Zone', 'Increased Drain Depth to 90cm']
      },
      rationale: 'Unanimous Gram Sabha approval following synthesis of 47 citizen voice submissions.'
    },
    {
      index: 2,
      timestamp: '2026-02-18T16:00:00.000Z',
      previousHash: 'b4a8e23f991c01e74a88dc12480392ef10ad77ca9b456102381ab1938fe10091',
      hash: 'f72a4491c98de1200192eab881902fc1a89c314092bba71029c123490aa71829',
      actionType: 'CONTRACTOR_PAYMENT_APPROVAL',
      entityId: 'ms-001',
      entityType: 'milestone',
      panchayatId: 'pan-001',
      officialId: 'off-bdo-01',
      officialRole: 'BDO',
      payload: {
        milestoneId: 'ms-001',
        amountReleased: 485000,
        contractor: 'Marudham Infrastructure Pvt Ltd',
        verifiedPhotoCount: 6
      },
      rationale: 'Milestone 1 survey and stakeholder sign-off verified in field inspection.'
    }
  ];

  governanceScores: GovernanceScore[] = [
    {
      panchayatId: 'pan-001',
      panchayatName: 'Alanganallur',
      overallScore: 82.5,
      citizenEngagementScore: 84.2,
      timelinessScore: 79.0,
      slaComplianceScore: 81.5,
      financialTransparencyScore: 88.0,
      gramSabhaQuorumScore: 92.0,
      rankInDistrict: 2,
      totalPanchayatsInDistrict: 28,
      lastCalculatedAt: new Date().toISOString()
    },
    {
      panchayatId: 'pan-002',
      panchayatName: 'Odanthurai',
      overallScore: 93.8,
      citizenEngagementScore: 91.8,
      timelinessScore: 95.0,
      slaComplianceScore: 94.2,
      financialTransparencyScore: 96.0,
      gramSabhaQuorumScore: 98.0,
      rankInDistrict: 1,
      totalPanchayatsInDistrict: 32,
      lastCalculatedAt: new Date().toISOString()
    }
  ];
}

export const db = new Database();
