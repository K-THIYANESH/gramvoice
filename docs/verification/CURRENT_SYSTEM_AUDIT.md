# GramVoice TN — Current System Audit & Discovery Report

## 1. Initial State Discovery
- **Frontend Architecture**: React 19 + TypeScript + Tailwind CSS v4 + Motion.
- **Backend Architecture**: Node.js + Express 4 + TypeScript + Gemini 3.7 Flash SDK (`@google/genai`).
- **Initial Codebase Inspection**: Base template with empty `App.tsx` and basic Vite configuration.
- **Identified Deficiencies in Base**:
  - Missing complete backend API route layer.
  - Missing in-memory / relational schema data store with real Tamil Nadu village panchayat models.
  - Missing cryptographic SHA-256 ledger engine.
  - Missing real voice recording & Gemini transcription pipeline with Tamil support.
  - Missing offline sync queue with state management.
  - Missing mobile-first citizen interface and desktop-first government command center.

## 2. Engineering Plan & Architecture Execution
1. **Full-Stack Express + Vite Integration**: Create `server.ts` unifying REST APIs on `/api/*` and Vite frontend dev middleware on single port 3000.
2. **Data & Schema Layer (`server/db.ts`)**: Structured in-memory relational store with full CRUD, seeding real Tamil Nadu districts (Madurai, Thanjavur, Coimbatore, Kanyakumari, Cuddalore) and Panchayats (Alanganallur, Odanthurai, Thirukkuvalai, Melpuram, Kurinjipadi).
3. **Cryptographic Ledger (`server/crypto.ts`)**: SHA-256 chained blocks linking previous hash, timestamp, actor role, decision rationale, canonical serialization, and verification suite with intentional tamper injection test.
4. **AI Pipelines (`server/ai.ts`)**: Gemini 3.7 Flash integration for Tamil/English voice transcription, DPR Tamil summarization, Community feedback theme synthesis, Construction defect triage, and SLA priority categorization.
5. **CEI Engine (`server/cei.ts`)**: Deterministic multi-factor Citizen Engagement Index calculation:
   $$CEI = (0.25 \times V_{rate}) + (0.20 \times D_{div}) + (0.20 \times V_{voice}) + (0.20 \times R_{res}) + (0.15 \times Q_{att})$$
6. **SLA Engine (`server/sla.ts`)**: Dynamic SLA tracker with priority-based deadlines (Urgent: 24h, High: 72h, Medium: 7d, Low: 14d) and auto-escalation triggers.
7. **Offline Sync Manager**: Client-side storage queue for voice inputs, problem tickets, and upvotes with connection event listeners and graceful fallback.
8. **Bilingual Engine**: Complete dictionary for English and Tamil across all screens.
