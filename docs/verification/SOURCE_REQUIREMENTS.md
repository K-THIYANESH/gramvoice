# GramVoice TN — Source Requirements Inventory

| ID | Requirement | Source | Expected Behaviour | Priority |
|----|-------------|--------|--------------------|----------|
| **GV-001** | Bilingual Interface (Tamil & English) | TN Civic Mandate | Seamless switching between English and Tamil across all citizen and official screens; proper Tamil Unicode font rendering and line heights. | P0 - Critical |
| **GV-002** | Voice-First Citizen Input | Civic Accessibility | Citizen can record Tamil or English audio, preview recording, receive AI speech-to-text transcript, edit if needed, and submit. | P0 - Critical |
| **GV-003** | Mobile-First Citizen Experience | Citizen UX Design | Responsive mobile viewport (360px-430px) prioritizing top citizen intents: Discover, Suggest, Participate, Report, Monitor. | P0 - Critical |
| **GV-004** | Desktop-First Government Console | Govt Administration | Action-oriented console for Panchayat, BDO, and District officials answering: What is happening? What needs attention? What action to take? | P0 - Critical |
| **GV-005** | Offline-First Submission & Queue | Rural Network Resilience | Offline detection, local saving, sync status (Online, Offline, Saving, Queued, Syncing, Synced, Sync Failed), auto-retry on reconnect without duplicates. | P0 - Critical |
| **GV-006** | 6-Stage Civic Journey | Governance Lifecycle | Clear visual journey for every civic project: Discover → Understand → Suggest → Participate → Validate → Monitor → Maintain. | P0 - Critical |
| **GV-007** | Digital Gram Sabha Portal | Panchayati Raj Act | Scheduling sessions, publishing agendas, accepting citizen voice/text consultations, AI theme synthesis, and official resolution recording. | P0 - Critical |
| **GV-008** | Citizen Engagement Index (CEI) | Civic Analytics Engine | Real mathematical calculation based on participation volume, demographic diversity, voice ratio, feedback resolution, and quorum rate. | P1 - Major |
| **GV-009** | Decision Transparency Ledger | Anti-Corruption / Audit | Cryptographic SHA-256 hash-chained ledger linking every project decision with timestamp, actor, rationale, and tamper-detection verification. | P0 - Critical |
| **GV-010** | Construction Watch | Civic Oversight | Citizen geo-tagged photo submission, AI defect triage, milestone verification, and official sign-off workflow. | P1 - Major |
| **GV-011** | Maintenance Watch & SLA Engine | Public Grievance | Issue reporting (water, road, sanitation, light) with GPS, priority SLA countdowns, auto-escalation, worker assignment, and resolution verification. | P0 - Critical |
| **GV-012** | DPR / Document AI Workflow | Public Works Mandate | Upload DPR documents, extract budget line items, generate bilingual (Tamil & English) executive summaries for citizen transparency. | P1 - Major |
| **GV-013** | Role-Based Access Control (RBAC) | Security & Governance | Server-enforced permissions for Citizen, Panchayat Official, BDO (Block Development Officer), District Official, and Admin. | P0 - Critical |
| **GV-014** | Public Transparency Portal | RTI & Open Data | Public unauthenticated access to project timelines, budget allocations, verified decisions, and ledger audit (no citizen PII exposed). | P1 - Major |
| **GV-015** | Citizen Idea Box / Project Suggestion | Democratic Planning | Citizens can propose village projects, attach voice/photos, and gather community upvotes for Gram Sabha prioritization. | P2 - Important |
| **GV-016** | Governance Intelligence Score (GIS) | Admin Benchmarking | Multi-pillar performance score (Citizen Voice, Timeliness, SLA Compliance, Financial Transparency, Gram Sabha Quorum) across Panchayats. | P1 - Major |
| **GV-017** | End-to-End Automated Verification Suite | Product Quality | Built-in test runner executing full 31-step village road lifecycle from citizen discovery to maintenance resolution. | P0 - Critical |
| **GV-018** | Observability & Health Endpoints | Production Readiness | Standard `/api/health` and `/api/ready` endpoints returning system component statuses (DB, AI, Ledger, Queue). | P1 - Major |
