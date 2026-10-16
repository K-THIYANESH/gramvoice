/**
 * GramVoice TN - Cryptographic SHA-256 Decision Transparency Ledger
 */
import crypto from 'crypto';
import { db, LedgerBlock } from './db.js';

export function canonicalStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => `"${k}":${canonicalStringify(obj[k])}`).join(',') + '}';
}

export function calculateBlockHash(block: Omit<LedgerBlock, 'hash' | 'tampered'>): string {
  const payloadString = canonicalStringify(block.payload);
  const dataToHash = `${block.index}|${block.timestamp}|${block.previousHash}|${block.actionType}|${block.entityId}|${block.panchayatId}|${block.officialId}|${block.officialRole}|${block.rationale}|${payloadString}`;
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

export function addDecisionBlock(
  actionType: LedgerBlock['actionType'],
  entityId: string,
  entityType: LedgerBlock['entityType'],
  panchayatId: string,
  officialId: string,
  officialRole: LedgerBlock['officialRole'],
  payload: Record<string, any>,
  rationale: string
): LedgerBlock {
  const lastBlock = db.ledgerBlocks[db.ledgerBlocks.length - 1];
  const newIndex = lastBlock ? lastBlock.index + 1 : 0;
  const previousHash = lastBlock ? lastBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date().toISOString();

  const blockCandidate: Omit<LedgerBlock, 'hash' | 'tampered'> = {
    index: newIndex,
    timestamp,
    previousHash,
    actionType,
    entityId,
    entityType,
    panchayatId,
    officialId,
    officialRole,
    payload,
    rationale
  };

  const hash = calculateBlockHash(blockCandidate);
  const newBlock: LedgerBlock = {
    ...blockCandidate,
    hash
  };

  db.ledgerBlocks.push(newBlock);
  return newBlock;
}

export interface VerificationResult {
  isValid: boolean;
  totalBlocks: number;
  brokenIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  message: string;
  verifiedAt: string;
}

export function verifyLedgerIntegrity(): VerificationResult {
  const blocks = db.ledgerBlocks;
  if (blocks.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      message: 'Ledger is empty.',
      verifiedAt: new Date().toISOString()
    };
  }

  for (let i = 0; i < blocks.length; i++) {
    const current = blocks[i];
    
    // Check previous hash linkage
    if (i > 0) {
      const prev = blocks[i - 1];
      if (current.previousHash !== prev.hash) {
        return {
          isValid: false,
          totalBlocks: blocks.length,
          brokenIndex: i,
          expectedHash: prev.hash,
          actualHash: current.previousHash,
          message: `Chain Broken: Block #${i} previousHash does not match Block #${i - 1} hash!`,
          verifiedAt: new Date().toISOString()
        };
      }
    }

    // Check recalculation of current block's hash
    const { hash, tampered, ...rest } = current;
    const recomputedHash = calculateBlockHash(rest);
    if (recomputedHash !== hash || tampered) {
      return {
        isValid: false,
        totalBlocks: blocks.length,
        brokenIndex: i,
        expectedHash: recomputedHash,
        actualHash: hash,
        message: `Tamper Detected: Block #${i} hash mismatch! Data payload or fields have been altered!`,
        verifiedAt: new Date().toISOString()
      };
    }
  }

  return {
    isValid: true,
    totalBlocks: blocks.length,
    message: `All ${blocks.length} blocks verified cryptographically with zero tampering detected.`,
    verifiedAt: new Date().toISOString()
  };
}

export function simulateTamperTest(blockIndex: number): { success: boolean; tamperedBlock: LedgerBlock; verification: VerificationResult } {
  const target = db.ledgerBlocks.find(b => b.index === blockIndex);
  if (!target) {
    throw new Error(`Block with index ${blockIndex} not found`);
  }
  
  // Alter rationale or payload without recalculating valid hash
  target.rationale = target.rationale + ' [UNAUTHORIZED TAMPERED DATA]';
  target.tampered = true;
  
  const verification = verifyLedgerIntegrity();
  return {
    success: true,
    tamperedBlock: target,
    verification
  };
}

export function restoreLedgerBlock(blockIndex: number): { success: boolean; restoredBlock: LedgerBlock; verification: VerificationResult } {
  const target = db.ledgerBlocks.find(b => b.index === blockIndex);
  if (!target) {
    throw new Error(`Block with index ${blockIndex} not found`);
  }
  
  target.rationale = target.rationale.replace(' [UNAUTHORIZED TAMPERED DATA]', '');
  delete target.tampered;
  
  const verification = verifyLedgerIntegrity();
  return {
    success: true,
    restoredBlock: target,
    verification
  };
}
