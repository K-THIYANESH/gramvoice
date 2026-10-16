/**
 * GramVoice TN - Public Grievance SLA Engine & Escalation Dispatcher
 */
import { db, MaintenanceTicket } from './db.js';

export const SLA_HOURS_MAP: Record<MaintenanceTicket['priority'], number> = {
  URGENT: 24,
  HIGH: 48,
  MEDIUM: 72,
  LOW: 168
};

export function calculateSLADueDate(createdAt: Date, priority: MaintenanceTicket['priority']): { slaHours: number; dueAt: string } {
  const hours = SLA_HOURS_MAP[priority] || 72;
  const due = new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
  return {
    slaHours: hours,
    dueAt: due.toISOString()
  };
}

export function checkAndAuditAllSLAs(): { totalChecked: number; breachedCount: number; escalatedCount: number } {
  const now = Date.now();
  let breachedCount = 0;
  let escalatedCount = 0;

  for (const ticket of db.maintenanceTickets) {
    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CITIZEN_VERIFIED' && ticket.status !== 'CLOSED') {
      const dueTime = new Date(ticket.slaDueAt).getTime();
      if (now > dueTime) {
        if (!ticket.isBreached) {
          ticket.isBreached = true;
          breachedCount++;
        }
        // Auto-escalate if breached by more than 24 hours and not yet marked URGENT
        const hoursOverdue = (now - dueTime) / (1000 * 60 * 60);
        if (hoursOverdue > 24 && ticket.priority !== 'URGENT') {
          ticket.priority = 'URGENT';
          escalatedCount++;
        }
      } else {
        ticket.isBreached = false;
      }
    }
  }

  return {
    totalChecked: db.maintenanceTickets.length,
    breachedCount,
    escalatedCount
  };
}

export function transitionTicketStatus(
  ticketId: string,
  newStatus: MaintenanceTicket['status'],
  details: {
    workerName?: string;
    workerContact?: string;
    resolutionSummary?: string;
    resolutionPhotoUrl?: string;
  }
): MaintenanceTicket {
  const ticket = db.maintenanceTickets.find(t => t.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found`);
  }

  ticket.status = newStatus;
  ticket.updatedAt = new Date().toISOString();

  if (details.workerName) ticket.assignedWorkerName = details.workerName;
  if (details.workerContact) ticket.assignedWorkerContact = details.workerContact;
  if (details.resolutionSummary) ticket.resolutionSummary = details.resolutionSummary;
  if (details.resolutionPhotoUrl) ticket.resolutionPhotoUrl = details.resolutionPhotoUrl;

  if (newStatus === 'RESOLVED' || newStatus === 'CITIZEN_VERIFIED' || newStatus === 'CLOSED') {
    // If resolved before due date, ensure isBreached is false
    const now = Date.now();
    const dueTime = new Date(ticket.slaDueAt).getTime();
    if (now <= dueTime) {
      ticket.isBreached = false;
    }
  }

  return ticket;
}
