/**
 * GramVoice TN - Unified Full-Stack Server
 * Express 4 API Backend + Vite Dev Middleware / Static Production Serving
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, Project, CitizenSubmission, MaintenanceTicket, ConstructionPhotoReport, ProjectSuggestion } from './server/db.js';
import { verifyLedgerIntegrity, addDecisionBlock, simulateTamperTest, restoreLedgerBlock } from './server/crypto.js';
import { calculateProjectCEI, recalculateAllPanchayatScores } from './server/cei.js';
import { calculateSLADueDate, checkAndAuditAllSLAs, transitionTicketStatus } from './server/sla.js';
import { processVoiceInput, synthesizeGramSabhaThemes, generateDPRSummary, analyzeConstructionPhoto, processAssistantChat } from './server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Simple audit & logger middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// ----------------------------------------------------
// 1. SYSTEM HEALTH & OBSERVABILITY
// ----------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'gramvoice-tn-core',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.get('/api/ready', (req: Request, res: Response) => {
  const ledgerStatus = verifyLedgerIntegrity();
  res.json({
    status: 'ready',
    database: {
      panchayatsCount: db.panchayats.length,
      projectsCount: db.projects.length,
      submissionsCount: db.submissions.length,
      ticketsCount: db.maintenanceTickets.length
    },
    ledger: {
      isValid: ledgerStatus.isValid,
      totalBlocks: ledgerStatus.totalBlocks
    }
  });
});

// ----------------------------------------------------
// 2. PANCHAYAT ROUTES
// ----------------------------------------------------
app.get('/api/panchayats', (req: Request, res: Response) => {
  recalculateAllPanchayatScores();
  res.json(db.panchayats);
});

// ----------------------------------------------------
// 3. PROJECTS & CIVIC JOURNEY ROUTES
// ----------------------------------------------------
app.get('/api/projects', (req: Request, res: Response) => {
  const { panchayatId, category, stage, status } = req.query;
  let list = db.projects;
  if (panchayatId) list = list.filter(p => p.panchayatId === panchayatId);
  if (category) list = list.filter(p => p.category === category);
  if (stage) list = list.filter(p => p.stage === stage);
  if (status) list = list.filter(p => p.status === status);
  res.json(list);
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const cei = calculateProjectCEI(project.id);
  res.json({ ...project, ceiBreakdown: cei });
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const panchayat = db.panchayats.find(p => p.id === body.panchayatId) || db.panchayats[0];
    
    // Auto-generate Tamil translation & DPR summary via AI if not supplied
    let dprEn = body.dprSummaryEn;
    let dprTa = body.dprSummaryTa;
    if (!dprEn || !dprTa) {
      const dprResult = await generateDPRSummary(body.title, body.description, body.budgetTotal || 2500000);
      dprEn = dprEn || dprResult.dprSummaryEn;
      dprTa = dprTa || dprResult.dprSummaryTa;
    }

    const newProject: Project = {
      id: `proj-${Date.now().toString().slice(-4)}`,
      code: `TN-${panchayat.district.slice(0, 3).toUpperCase()}-${panchayat.name.slice(0, 3).toUpperCase()}-2026-${Date.now().toString().slice(-3)}`,
      title: body.title,
      titleTamil: body.titleTamil || body.title,
      description: body.description,
      descriptionTamil: body.descriptionTamil || body.description,
      category: body.category || 'Roads & Transport',
      panchayatId: panchayat.id,
      panchayatName: panchayat.name,
      wardNumber: Number(body.wardNumber) || 1,
      gpsLocation: body.gpsLocation || { lat: 10.0489, lng: 78.0779, address: `${panchayat.name} Village Center` },
      budgetTotal: Number(body.budgetTotal) || 2500000,
      fundSource: body.fundSource || 'Panchayat Development Fund & SFC',
      stage: 'DISCOVER',
      status: 'draft',
      consultationEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      contractorName: body.contractorName || 'Tender in progress',
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      completionTargetDate: body.completionTargetDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dprSummaryEn: dprEn,
      dprSummaryTa: dprTa,
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          title: 'Topographic & Soil Investigation',
          titleTamil: 'மண் பரிசோதனை மற்றும் கள அளவீடு',
          targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          budgetSharePct: 15,
          amountAllocated: Math.round((Number(body.budgetTotal) || 2500000) * 0.15),
          evidencePhotoCount: 0
        },
        {
          id: `ms-${Date.now()}-2`,
          title: 'Main Civil Construction Phase',
          titleTamil: 'பிரதான கட்டுமான பணி',
          targetDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          budgetSharePct: 60,
          amountAllocated: Math.round((Number(body.budgetTotal) || 2500000) * 0.60),
          evidencePhotoCount: 0
        },
        {
          id: `ms-${Date.now()}-3`,
          title: 'Finishing, Testing & Official Handover',
          titleTamil: 'முழுமை பணி, ஆய்வு மற்றும் ஒப்படைப்பு',
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          budgetSharePct: 25,
          amountAllocated: Math.round((Number(body.budgetTotal) || 2500000) * 0.25),
          evidencePhotoCount: 0
        }
      ],
      participationCount: 0,
      voiceResponsesCount: 0,
      positiveSentimentPct: 100,
      ceiScore: 65.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.projects.unshift(newProject);
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating project' });
  }
});

app.patch('/api/projects/:id/stage', (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const { newStage, officialId, officialRole, rationale } = req.body;
  const oldStage = project.stage;
  project.stage = newStage;
  project.updatedAt = new Date().toISOString();

  // Map stage to status if appropriate
  if (newStage === 'PARTICIPATE') project.status = 'consultation';
  if (newStage === 'VALIDATE') project.status = 'approved';
  if (newStage === 'MONITOR') project.status = 'in_construction';
  if (newStage === 'MAINTAIN') project.status = 'maintenance';

  // Record transition in cryptographic ledger
  const block = addDecisionBlock(
    'PROJECT_STAGE_CHANGE',
    project.id,
    'project',
    project.panchayatId,
    officialId || 'off-sec-01',
    officialRole || 'PANCHAYAT_SECRETARY',
    { projectId: project.id, oldStage, newStage, title: project.title },
    rationale || `Project transitioned from stage ${oldStage} to ${newStage}`
  );

  res.json({ project, ledgerBlock: block });
});

app.patch('/api/projects/:id/milestones/:mId', (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const milestone = project.milestones.find(m => m.id === req.params.mId);
  if (!milestone) {
    res.status(404).json({ error: 'Milestone not found' });
    return;
  }

  const { status, verifiedBy, releasePayment, officialRole, rationale } = req.body;
  if (status) milestone.status = status;
  if (status === 'verified') milestone.completedDate = new Date().toISOString().split('T')[0];
  if (verifiedBy) milestone.verifiedBy = verifiedBy;

  let ledgerBlock = null;
  if (releasePayment) {
    ledgerBlock = addDecisionBlock(
      'CONTRACTOR_PAYMENT_APPROVAL',
      milestone.id,
      'milestone',
      project.panchayatId,
      verifiedBy || 'off-bdo-01',
      officialRole || 'BDO',
      {
        projectId: project.id,
        milestoneId: milestone.id,
        amount: milestone.amountAllocated,
        contractor: project.contractorName
      },
      rationale || `Milestone "${milestone.title}" field-verified and payment released.`
    );
  }

  res.json({ project, milestone, ledgerBlock });
});

// ----------------------------------------------------
// 4. CITIZEN SUBMISSIONS & VOICE AI ROUTES
// ----------------------------------------------------
app.get('/api/submissions', (req: Request, res: Response) => {
  const { projectId, gramSabhaId, status } = req.query;
  let list = db.submissions;
  if (projectId) list = list.filter(s => s.projectId === projectId);
  if (gramSabhaId) list = list.filter(s => s.gramSabhaId === gramSabhaId);
  if (status) list = list.filter(s => s.status === status);
  res.json(list);
});

app.post('/api/submissions/voice', async (req: Request, res: Response) => {
  try {
    const { projectId, gramSabhaId, audioBase64, mimeType, textFallback, citizenName, citizenPhone, panchayatId, durationSeconds } = req.body;
    
    // AI Speech & Theme Processing via Gemini
    const aiResult = await processVoiceInput(audioBase64, mimeType, textFallback);

    const project = db.projects.find(p => p.id === projectId);
    const targetPanchayat = panchayatId || (project ? project.panchayatId : 'pan-001');

    const phoneMasked = citizenPhone 
      ? citizenPhone.slice(0, 5) + '*****' 
      : '98421*****';

    const newSubmission: CitizenSubmission = {
      id: `sub-${Date.now().toString().slice(-4)}`,
      projectId: projectId || 'proj-001',
      gramSabhaId,
      citizenId: `cit-${Date.now().toString().slice(-3)}`,
      citizenName: citizenName || 'Anonymous Citizen',
      citizenPhoneMasked: phoneMasked,
      panchayatId: targetPanchayat,
      submissionType: 'voice',
      durationSeconds: durationSeconds || 20,
      language: 'ta',
      transcriptRaw: aiResult.transcriptRaw,
      transcriptTamil: aiResult.transcriptTamil,
      transcriptEnglish: aiResult.transcriptEnglish,
      keyThemes: aiResult.keyThemes,
      sentiment: aiResult.sentiment,
      urgency: aiResult.urgency,
      aiAssisted: true,
      status: 'processed',
      createdAt: new Date().toISOString()
    };

    db.submissions.unshift(newSubmission);

    if (project) {
      project.participationCount += 1;
      project.voiceResponsesCount += 1;
      calculateProjectCEI(project.id);
    }

    res.status(201).json(newSubmission);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Voice submission failed' });
  }
});

app.post('/api/submissions/text', async (req: Request, res: Response) => {
  try {
    const { projectId, gramSabhaId, text, citizenName, citizenPhone, panchayatId } = req.body;
    const aiResult = await processVoiceInput(undefined, undefined, text);

    const project = db.projects.find(p => p.id === projectId);
    const targetPanchayat = panchayatId || (project ? project.panchayatId : 'pan-001');

    const phoneMasked = citizenPhone 
      ? citizenPhone.slice(0, 5) + '*****' 
      : '98421*****';

    const newSubmission: CitizenSubmission = {
      id: `sub-${Date.now().toString().slice(-4)}`,
      projectId: projectId || 'proj-001',
      gramSabhaId,
      citizenId: `cit-${Date.now().toString().slice(-3)}`,
      citizenName: citizenName || 'Citizen User',
      citizenPhoneMasked: phoneMasked,
      panchayatId: targetPanchayat,
      submissionType: 'text',
      language: 'ta-en',
      transcriptRaw: text,
      transcriptTamil: aiResult.transcriptTamil,
      transcriptEnglish: aiResult.transcriptEnglish,
      keyThemes: aiResult.keyThemes,
      sentiment: aiResult.sentiment,
      urgency: aiResult.urgency,
      aiAssisted: true,
      status: 'processed',
      createdAt: new Date().toISOString()
    };

    db.submissions.unshift(newSubmission);

    if (project) {
      project.participationCount += 1;
      calculateProjectCEI(project.id);
    }

    res.status(201).json(newSubmission);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Submission failed' });
  }
});

app.patch('/api/submissions/:id/respond', (req: Request, res: Response) => {
  const submission = db.submissions.find(s => s.id === req.params.id);
  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  const { officialResponse, officialResponseBy } = req.body;
  submission.officialResponse = officialResponse;
  submission.officialResponseBy = officialResponseBy || 'Panchayat Official';
  submission.status = 'addressed';

  if (submission.projectId) {
    calculateProjectCEI(submission.projectId);
  }

  res.json(submission);
});

// ----------------------------------------------------
// 5. DIGITAL GRAM SABHA ROUTES
// ----------------------------------------------------
app.get('/api/gramsabha', (req: Request, res: Response) => {
  const { panchayatId } = req.query;
  let list = db.gramSabhas;
  if (panchayatId) list = list.filter(g => g.panchayatId === panchayatId);
  res.json(list);
});

app.get('/api/gramsabha/:id', (req: Request, res: Response) => {
  const gs = db.gramSabhas.find(g => g.id === req.params.id);
  if (!gs) {
    res.status(404).json({ error: 'Gram Sabha not found' });
    return;
  }
  res.json(gs);
});

app.post('/api/gramsabha/:id/synthesize', async (req: Request, res: Response) => {
  try {
    const { agendaItemId } = req.body;
    const gs = db.gramSabhas.find(g => g.id === req.params.id);
    if (!gs) {
      res.status(404).json({ error: 'Gram Sabha not found' });
      return;
    }
    const agendaItem = gs.agendaItems.find(a => a.id === agendaItemId);
    if (!agendaItem) {
      res.status(404).json({ error: 'Agenda Item not found' });
      return;
    }

    // Get submissions for this agenda / project
    const relatedSubmissions = db.submissions.filter(s => 
      s.gramSabhaId === gs.id || (agendaItem.projectId && s.projectId === agendaItem.projectId)
    );

    const synthesis = await synthesizeGramSabhaThemes(relatedSubmissions);
    agendaItem.aiExtractedThemes = synthesis.themes;

    res.json({
      agendaItemId: agendaItem.id,
      themes: synthesis.themes,
      consensusSummaryEn: synthesis.consensusSummaryEn,
      consensusSummaryTa: synthesis.consensusSummaryTa,
      submissionCount: relatedSubmissions.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Synthesis failed' });
  }
});

app.post('/api/gramsabha/:id/decision', (req: Request, res: Response) => {
  const gs = db.gramSabhas.find(g => g.id === req.params.id);
  if (!gs) {
    res.status(404).json({ error: 'Gram Sabha not found' });
    return;
  }
  const { agendaItemId, officialDecision, officialDecisionTamil, decisionRationale, officialId, officialRole } = req.body;
  const agendaItem = gs.agendaItems.find(a => a.id === agendaItemId);
  if (!agendaItem) {
    res.status(404).json({ error: 'Agenda item not found' });
    return;
  }

  agendaItem.officialDecision = officialDecision;
  agendaItem.officialDecisionTamil = officialDecisionTamil;
  agendaItem.decisionRationale = decisionRationale;

  // Add block to decision ledger
  const block = addDecisionBlock(
    'GRAM_SABHA_RESOLUTION',
    agendaItem.id,
    'gram_sabha',
    gs.panchayatId,
    officialId || 'off-sec-01',
    officialRole || 'PANCHAYAT_SECRETARY',
    {
      gramSabhaId: gs.id,
      agendaItemId: agendaItem.id,
      agendaTitle: agendaItem.title,
      decision: officialDecision,
      decisionTamil: officialDecisionTamil
    },
    decisionRationale || 'Resolution passed by Gram Sabha council quorum.'
  );

  agendaItem.ledgerHash = block.hash;
  res.json({ gramSabha: gs, ledgerBlock: block });
});

// ----------------------------------------------------
// 6. CONSTRUCTION WATCH & PHOTO AI ROUTES
// ----------------------------------------------------
app.get('/api/construction/photos', (req: Request, res: Response) => {
  const { projectId, milestoneId } = req.query;
  let list = db.constructionPhotos;
  if (projectId) list = list.filter(c => c.projectId === projectId);
  if (milestoneId) list = list.filter(c => c.milestoneId === milestoneId);
  res.json(list);
});

app.post('/api/construction/photos', async (req: Request, res: Response) => {
  try {
    const { projectId, milestoneId, imageBase64, comment, citizenName, gpsCoordinates, reportType } = req.body;
    
    // AI defect analysis via Gemini
    const aiAnalysis = await analyzeConstructionPhoto(imageBase64, comment);

    const newPhotoReport: ConstructionPhotoReport = {
      id: `cp-${Date.now().toString().slice(-4)}`,
      projectId: projectId || 'proj-001',
      milestoneId: milestoneId || 'ms-002',
      citizenId: `cit-${Date.now().toString().slice(-3)}`,
      citizenName: citizenName || 'Village Monitor',
      photoUrl: imageBase64 || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&q=80',
      gpsCoordinates: gpsCoordinates || { lat: 10.0489, lng: 78.0779 },
      gpsVerified: true,
      reportType: reportType || (aiAnalysis.defectDetected ? 'defect_alert' : 'progress_verification'),
      comment: comment || 'Site progress photo submitted by citizen.',
      aiDefectAnalysis: aiAnalysis,
      officialStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    db.constructionPhotos.unshift(newPhotoReport);

    // Update milestone evidence count
    const project = db.projects.find(p => p.id === projectId);
    if (project) {
      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        milestone.evidencePhotoCount += 1;
      }
    }

    res.status(201).json(newPhotoReport);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Photo upload failed' });
  }
});

app.patch('/api/construction/photos/:id/verify', (req: Request, res: Response) => {
  const photo = db.constructionPhotos.find(p => p.id === req.params.id);
  if (!photo) {
    res.status(404).json({ error: 'Photo report not found' });
    return;
  }
  const { officialStatus, officialNotes, verifiedBy } = req.body;
  photo.officialStatus = officialStatus;
  photo.officialNotes = officialNotes;
  photo.verifiedBy = verifiedBy || 'Assistant Engineer (RD)';
  res.json(photo);
});

// ----------------------------------------------------
// 7. MAINTENANCE & SLA GRIEVANCE ENGINE ROUTES
// ----------------------------------------------------
app.get('/api/maintenance', (req: Request, res: Response) => {
  checkAndAuditAllSLAs();
  const { panchayatId, status, priority, isBreached } = req.query;
  let list = db.maintenanceTickets;
  if (panchayatId) list = list.filter(t => t.panchayatId === panchayatId);
  if (status) list = list.filter(t => t.status === status);
  if (priority) list = list.filter(t => t.priority === priority);
  if (isBreached !== undefined) list = list.filter(t => t.isBreached === (isBreached === 'true'));
  res.json(list);
});

app.get('/api/maintenance/:id', (req: Request, res: Response) => {
  const t = db.maintenanceTickets.find(ticket => ticket.id === req.params.id);
  if (!t) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json(t);
});

app.post('/api/maintenance', (req: Request, res: Response) => {
  try {
    const { title, titleTamil, description, category, panchayatId, wardNumber, gpsLocation, photoUrl, priority, reportedByPhone } = req.body;
    const now = new Date();
    const assignedPriority = priority || (category === 'Water Pipeline' ? 'URGENT' : 'HIGH');
    const sla = calculateSLADueDate(now, assignedPriority);

    const targetPanchayat = panchayatId || 'pan-001';

    const newTicket: MaintenanceTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      ticketNumber: `GV-MNT-2026-${Date.now().toString().slice(-3)}`,
      title: title || 'Reported Village Grievance',
      titleTamil: titleTamil || title || 'கிராம புகார் பதிவு',
      description: description || 'No detailed description provided',
      category: category || 'Water Pipeline',
      panchayatId: targetPanchayat,
      wardNumber: Number(wardNumber) || 1,
      gpsLocation: gpsLocation || { lat: 10.0489, lng: 78.0779, landmark: 'Near Village Center' },
      photoUrl,
      priority: assignedPriority,
      slaHoursTarget: sla.slaHours,
      slaDueAt: sla.dueAt,
      isBreached: false,
      assignedDepartment: `${category || 'Public Works'} Maintenance Team`,
      status: 'REPORTED',
      reportedByPhoneMasked: reportedByPhone ? reportedByPhone.slice(0, 5) + '*****' : '98421*****',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    db.maintenanceTickets.unshift(newTicket);
    res.status(201).json(newTicket);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ticket creation failed' });
  }
});

app.patch('/api/maintenance/:id/assign', (req: Request, res: Response) => {
  const { workerName, workerContact } = req.body;
  try {
    const ticket = transitionTicketStatus(req.params.id, 'ASSIGNED', { workerName, workerContact });
    res.json(ticket);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.patch('/api/maintenance/:id/resolve', (req: Request, res: Response) => {
  const { resolutionSummary, resolutionPhotoUrl, officialRole, officialId } = req.body;
  try {
    const ticket = transitionTicketStatus(req.params.id, 'RESOLVED', { resolutionSummary, resolutionPhotoUrl });
    
    // Add block to decision ledger
    const block = addDecisionBlock(
      'MAINTENANCE_RESOLUTION_SIGN_OFF',
      ticket.id,
      'maintenance',
      ticket.panchayatId,
      officialId || 'off-sec-01',
      officialRole || 'PANCHAYAT_SECRETARY',
      {
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
        resolutionSummary: resolutionSummary || 'Completed repair work on site'
      },
      `Maintenance issue ${ticket.ticketNumber} verified and resolved within official SLA guidelines.`
    );

    res.json({ ticket, ledgerBlock: block });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/maintenance/audit-slas', (req: Request, res: Response) => {
  const result = checkAndAuditAllSLAs();
  res.json(result);
});

// ----------------------------------------------------
// 8. CITIZEN PROJECT SUGGESTIONS (IDEA BOX)
// ----------------------------------------------------
app.get('/api/suggestions', (req: Request, res: Response) => {
  const { panchayatId } = req.query;
  let list = db.suggestions;
  if (panchayatId) list = list.filter(s => s.panchayatId === panchayatId);
  res.json(list);
});

app.post('/api/suggestions', (req: Request, res: Response) => {
  const { title, titleTamil, description, category, panchayatId, wardNumber, proposedByCitizen } = req.body;
  const panchayat = db.panchayats.find(p => p.id === panchayatId) || db.panchayats[0];

  const newSuggestion: ProjectSuggestion = {
    id: `sug-${Date.now().toString().slice(-4)}`,
    title,
    titleTamil: titleTamil || title,
    description,
    category: category || 'Education',
    panchayatId: panchayat.id,
    panchayatName: panchayat.name,
    wardNumber: Number(wardNumber) || 1,
    proposedByCitizen: proposedByCitizen || 'Active Citizen',
    upvotesCount: 1,
    upvotedCitizenIds: ['cit-self'],
    status: 'submitted',
    createdAt: new Date().toISOString()
  };

  db.suggestions.unshift(newSuggestion);
  res.status(201).json(newSuggestion);
});

app.post('/api/suggestions/:id/upvote', (req: Request, res: Response) => {
  const suggestion = db.suggestions.find(s => s.id === req.params.id);
  if (!suggestion) {
    res.status(404).json({ error: 'Suggestion not found' });
    return;
  }
  const { citizenId } = req.body;
  const cId = citizenId || `cit-${Date.now()}`;
  if (!suggestion.upvotedCitizenIds.includes(cId)) {
    suggestion.upvotedCitizenIds.push(cId);
    suggestion.upvotesCount += 1;
  }
  res.json(suggestion);
});

// ----------------------------------------------------
// 9. CRYPTOGRAPHIC DECISION TRANSPARENCY LEDGER
// ----------------------------------------------------
app.get('/api/ledger', (req: Request, res: Response) => {
  const verification = verifyLedgerIntegrity();
  res.json({
    blocks: db.ledgerBlocks,
    verification
  });
});

app.get('/api/ledger/verify', (req: Request, res: Response) => {
  const result = verifyLedgerIntegrity();
  res.json(result);
});

app.post('/api/ledger/test-tamper', (req: Request, res: Response) => {
  const { blockIndex } = req.body;
  try {
    const result = simulateTamperTest(Number(blockIndex) || 1);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/ledger/restore', (req: Request, res: Response) => {
  const { blockIndex } = req.body;
  try {
    const result = restoreLedgerBlock(Number(blockIndex) || 1);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 10. CEI & GOVERNANCE INTELLIGENCE ANALYTICS
// ----------------------------------------------------
app.get('/api/analytics/cei/:projectId', (req: Request, res: Response) => {
  try {
    const result = calculateProjectCEI(req.params.projectId);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.get('/api/analytics/governance', (req: Request, res: Response) => {
  recalculateAllPanchayatScores();
  res.json(db.governanceScores);
});

app.get('/api/analytics/summary', (req: Request, res: Response) => {
  recalculateAllPanchayatScores();
  const totalProjects = db.projects.length;
  const totalSubmissions = db.submissions.length;
  const totalVoice = db.submissions.filter(s => s.submissionType === 'voice').length;
  const totalTickets = db.maintenanceTickets.length;
  const resolvedTickets = db.maintenanceTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CITIZEN_VERIFIED' || t.status === 'CLOSED').length;
  const averageCEI = Number((db.projects.reduce((acc, p) => acc + p.ceiScore, 0) / (totalProjects || 1)).toFixed(1));

  res.json({
    totalProjects,
    totalSubmissions,
    totalVoiceSubmissions: totalVoice,
    voicePercentage: totalSubmissions > 0 ? Math.round((totalVoice / totalSubmissions) * 100) : 80,
    totalMaintenanceTickets: totalTickets,
    resolvedTickets,
    slaResolutionRate: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100,
    averageCEI,
    totalLedgerBlocks: db.ledgerBlocks.length
  });
});

// ----------------------------------------------------
// 11. DPR DOCUMENT AI ANALYZER ROUTE
// ----------------------------------------------------
app.post('/api/dpr/summarize', async (req: Request, res: Response) => {
  try {
    const { title, description, budget } = req.body;
    const summary = await generateDPRSummary(title || 'Village Development Project', description || '', Number(budget) || 3000000);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'DPR analysis failed' });
  }
});

// ----------------------------------------------------
// 12. PUBLIC TRANSPARENCY PORTAL (Sanitized, No PII)
// ----------------------------------------------------
app.get('/api/transparency/public-data', (req: Request, res: Response) => {
  const sanitizedProjects = db.projects.map(p => ({
    id: p.id,
    code: p.code,
    title: p.title,
    titleTamil: p.titleTamil,
    panchayatName: p.panchayatName,
    budgetTotal: p.budgetTotal,
    fundSource: p.fundSource,
    stage: p.stage,
    status: p.status,
    contractorName: p.contractorName,
    ceiScore: p.ceiScore,
    participationCount: p.participationCount,
    milestones: p.milestones
  }));

  const sanitizedSubmissions = db.submissions.map(s => ({
    id: s.id,
    projectId: s.projectId,
    keyThemes: s.keyThemes,
    sentiment: s.sentiment,
    urgency: s.urgency,
    transcriptTamil: s.transcriptTamil,
    transcriptEnglish: s.transcriptEnglish,
    status: s.status,
    officialResponse: s.officialResponse,
    createdAt: s.createdAt
  }));

  const ledger = verifyLedgerIntegrity();

  res.json({
    projects: sanitizedProjects,
    submissionsSample: sanitizedSubmissions.slice(0, 10),
    ledgerVerification: ledger,
    totalExpenditureAllocated: db.projects.reduce((acc, p) => acc + p.budgetTotal, 0),
    generatedAt: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 13. AI ASSISTANT CHATBOT & NAVIGATION COPILOT
// ----------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], userContext = {} } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const panchayat = db.panchayats.find(p => p.id === userContext.panchayatId) || db.panchayats[0];
    const context = {
      role: userContext.role || 'CITIZEN',
      panchayatName: panchayat ? panchayat.name : 'Alanganallur',
      wardNumber: userContext.wardNumber || 4,
      language: userContext.language || 'ta'
    };

    const response = await processAssistantChat(message, history, context);
    res.json(response);
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chatbot service failure' });
  }
});

// ----------------------------------------------------
// 14. VITE INTEGRATION / STATIC PROD SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, attach Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===================================================`);
    console.log(` GramVoice TN Server running on http://0.0.0.0:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start GramVoice TN server:', err);
});
