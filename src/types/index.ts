/**
 * QueueMate Data Models and Types
 */

export type BusinessType = 'Clinic' | 'Salon' | 'Service Centre' | 'Other';

export type QueueOperationalStatus = 'open' | 'paused' | 'closed';

export type TokenStatus = 'waiting' | 'serving' | 'completed' | 'skipped' | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  businessId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  type: BusinessType;
  avgServiceMinutes: number;
  tokenPrefix: string;
  status: QueueOperationalStatus;
  createdAt: number;
  updatedAt: number;
}

export interface TokenItem {
  id: string;
  businessId: string;
  ownerId: string;
  tokenNumber: string; // e.g. "A-001" or "001"
  sequenceNumber: number; // integer 1, 2, 3...
  dateStr: string; // YYYY-MM-DD
  customerName: string;
  customerPhone?: string;
  status: TokenStatus;
  createdAt: number; // millisecond timestamp
  servedAt?: number;
  completedAt?: number;
  skippedAt?: number;
  cancelledAt?: number;
  notes?: string;
}

export interface DailyCounter {
  id: string; // `${businessId}_${dateStr}`
  businessId: string;
  dateStr: string;
  lastSequenceNumber: number;
  updatedAt: number;
}

export interface QueueActivity {
  id: string;
  businessId: string;
  ownerId: string;
  tokenNumber: string;
  customerName: string;
  type: 'issued' | 'called' | 'completed' | 'skipped' | 'cancelled' | 'status_changed';
  message: string;
  timestamp: number;
}

export interface QueueSummary {
  currentServingToken: TokenItem | null;
  waitingCount: number;
  completedCount: number;
  totalToday: number;
  skippedCount: number;
}

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
