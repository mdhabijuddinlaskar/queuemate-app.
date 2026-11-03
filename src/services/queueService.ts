import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  Business,
  TokenItem,
  TokenStatus,
  QueueActivity,
  QueueSummary,
} from '../types';
import { getTodayDateStr, formatTokenNumber } from '../utils/format';

/**
 * Fetch business profile by ID
 */
export async function getBusiness(businessId: string): Promise<Business | null> {
  if (!db) return null;
  const path = `businesses/${businessId}`;
  try {
    const snap = await getDoc(doc(db, 'businesses', businessId));
    if (!snap.exists()) return null;
    return snap.data() as Business;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Update business settings
 */
export async function updateBusiness(
  businessId: string,
  updates: Partial<Pick<Business, 'name' | 'type' | 'avgServiceMinutes' | 'tokenPrefix' | 'status'>>
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore is not initialized.');
  const path = `businesses/${businessId}`;
  try {
    await updateDoc(doc(db, 'businesses', businessId), {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Issue a new token safely with sequential numbering using Firestore transaction.
 * Resets daily without wiping historical tokens by using counter keyed by `${businessId}_${dateStr}`.
 */
export async function issueToken(params: {
  businessId: string;
  ownerId: string;
  customerName: string;
  customerPhone?: string;
  tokenPrefix?: string;
  notes?: string;
}): Promise<TokenItem> {
  if (!db) throw new Error('Firestore is not configured. Please connect Firebase in settings.');

  const dateStr = getTodayDateStr();
  const counterDocRef = doc(db, 'counters', `${params.businessId}_${dateStr}`);
  const tokensCollRef = collection(db, 'tokens');
  const newTokenDocRef = doc(tokensCollRef);

  const activitiesCollRef = collection(db, 'activities');
  const newActivityDocRef = doc(activitiesCollRef);

  const now = Date.now();
  let generatedToken: TokenItem | null = null;

  try {
    await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterDocRef);
      let nextSeq = 1;

      if (counterSnap.exists()) {
        const data = counterSnap.data();
        nextSeq = (data.lastSequenceNumber || 0) + 1;
      }

      const prefix = params.tokenPrefix || '';
      const tokenNumber = formatTokenNumber(prefix, nextSeq);

      generatedToken = {
        id: newTokenDocRef.id,
        businessId: params.businessId,
        ownerId: params.ownerId,
        tokenNumber,
        sequenceNumber: nextSeq,
        dateStr,
        customerName: params.customerName.trim(),
        customerPhone: params.customerPhone?.trim() || '',
        status: 'waiting',
        createdAt: now,
        notes: params.notes?.trim() || '',
      };

      // 1. Update/Set counter
      transaction.set(
        counterDocRef,
        {
          businessId: params.businessId,
          dateStr,
          lastSequenceNumber: nextSeq,
          updatedAt: now,
        },
        { merge: true }
      );

      // 2. Create token doc
      transaction.set(newTokenDocRef, generatedToken);

      // 3. Log activity
      const activityData: QueueActivity = {
        id: newActivityDocRef.id,
        businessId: params.businessId,
        ownerId: params.ownerId,
        tokenNumber,
        customerName: params.customerName.trim(),
        type: 'issued',
        message: `Token ${tokenNumber} issued to ${params.customerName.trim()}`,
        timestamp: now,
      };
      transaction.set(newActivityDocRef, activityData);
    });

    if (!generatedToken) {
      throw new Error('Transaction succeeded but token was not generated.');
    }

    return generatedToken;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'tokens');
  }
}

/**
 * Call next waiting customer:
 * 1. Mark any currently 'serving' token as 'completed' (or operator can leave it)
 * 2. Find earliest 'waiting' token today and mark it as 'serving'
 */
export async function callNextToken(businessId: string, ownerId: string): Promise<TokenItem | null> {
  if (!db) throw new Error('Firestore is not configured.');

  const dateStr = getTodayDateStr();
  const path = 'tokens';

  try {
    // Find next waiting token
    const qWaiting = query(
      collection(db, 'tokens'),
      where('businessId', '==', businessId),
      where('dateStr', '==', dateStr),
      where('status', '==', 'waiting'),
      orderBy('sequenceNumber', 'asc'),
      limit(1)
    );

    const snap = await getDocs(qWaiting);
    if (snap.empty) {
      return null;
    }

    const nextDoc = snap.docs[0];
    const nextToken = nextDoc.data() as TokenItem;
    const now = Date.now();

    // Mark current serving token as completed if exists
    const qServing = query(
      collection(db, 'tokens'),
      where('businessId', '==', businessId),
      where('dateStr', '==', dateStr),
      where('status', '==', 'serving')
    );
    const servingSnap = await getDocs(qServing);
    for (const sDoc of servingSnap.docs) {
      await updateDoc(sDoc.ref, {
        status: 'completed',
        completedAt: now,
      });
    }

    // Update target token to serving
    await updateDoc(nextDoc.ref, {
      status: 'serving',
      servedAt: now,
    });

    // Record activity
    const activityRef = doc(collection(db, 'activities'));
    await setDoc(activityRef, {
      id: activityRef.id,
      businessId,
      ownerId,
      tokenNumber: nextToken.tokenNumber,
      customerName: nextToken.customerName,
      type: 'called',
      message: `Token ${nextToken.tokenNumber} (${nextToken.customerName}) is now being served`,
      timestamp: now,
    });

    return {
      ...nextToken,
      status: 'serving',
      servedAt: now,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update token status (Serving -> Completed, or Skipped, or Cancelled)
 */
export async function updateTokenStatus(params: {
  tokenId: string;
  businessId: string;
  ownerId: string;
  status: TokenStatus;
  tokenNumber: string;
  customerName: string;
}): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `tokens/${params.tokenId}`;
  const now = Date.now();

  try {
    const updates: Partial<TokenItem> = {
      status: params.status,
    };

    if (params.status === 'serving') updates.servedAt = now;
    if (params.status === 'completed') updates.completedAt = now;
    if (params.status === 'skipped') updates.skippedAt = now;
    if (params.status === 'cancelled') updates.cancelledAt = now;

    await updateDoc(doc(db, 'tokens', params.tokenId), updates);

    // Log activity
    const activityRef = doc(collection(db, 'activities'));
    await setDoc(activityRef, {
      id: activityRef.id,
      businessId: params.businessId,
      ownerId: params.ownerId,
      tokenNumber: params.tokenNumber,
      customerName: params.customerName,
      type: params.status,
      message: `Token ${params.tokenNumber} marked as ${params.status}`,
      timestamp: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Subscribe in real-time to today's tokens for a business
 */
export function subscribeToTodayTokens(
  businessId: string,
  onUpdate: (tokens: TokenItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!db) {
    return () => {};
  }

  const dateStr = getTodayDateStr();
  const path = 'tokens';
  const q = query(
    collection(db, 'tokens'),
    where('businessId', '==', businessId),
    where('dateStr', '==', dateStr),
    orderBy('sequenceNumber', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tokens: TokenItem[] = snapshot.docs.map((d) => d.data() as TokenItem);
      onUpdate(tokens);
    },
    (error) => {
      console.error('Error listening to today tokens:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribe to recent queue activities
 */
export function subscribeToRecentActivities(
  businessId: string,
  onUpdate: (activities: QueueActivity[]) => void,
  limitCount = 10
): Unsubscribe {
  if (!db) return () => {};

  const path = 'activities';
  const q = query(
    collection(db, 'activities'),
    where('businessId', '==', businessId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: QueueActivity[] = snapshot.docs.map((d) => d.data() as QueueActivity);
      onUpdate(items);
    },
    (error) => {
      console.error('Error listening to activities:', error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Calculate queue summary from tokens list
 */
export function calculateQueueSummary(tokens: TokenItem[]): QueueSummary {
  const serving = tokens.find((t) => t.status === 'serving') || null;
  const waitingCount = tokens.filter((t) => t.status === 'waiting').length;
  const completedCount = tokens.filter((t) => t.status === 'completed').length;
  const skippedCount = tokens.filter((t) => t.status === 'skipped').length;

  return {
    currentServingToken: serving,
    waitingCount,
    completedCount,
    totalToday: tokens.length,
    skippedCount,
  };
}

/**
 * Fetch tokens for analytics within date range
 */
export async function getTokensForAnalytics(businessId: string): Promise<TokenItem[]> {
  if (!db) return [];
  const path = 'tokens';
  try {
    const q = query(
      collection(db, 'tokens'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc'),
      limit(500)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TokenItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
