'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { Report, ReportStatus, CreateReportData, ReportFilter, User } from '@/types';

const REPORTS_COLLECTION = 'reports';
const USERS_COLLECTION = 'users';

// Convert Firestore timestamp to Date
function convertTimestamp(timestamp: Timestamp | Date | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
}

// Create a new report
export async function createReport(
  userId: string,
  userName: string,
  data: CreateReportData
): Promise<string> {
  if (!db) throw new Error('Firebase is not configured');
  
  const now = Timestamp.now();
  const reportData = {
    userId,
    userName,
    title: data.title,
    description: data.description,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), reportData);
  return docRef.id;
}

// Update report status
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(reportRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

// Get reports for a specific user (real-time)
export function subscribeToUserReports(
  userId: string,
  callback: (reports: Report[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reports: Report[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        title: data.title,
        description: data.description,
        status: data.status,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      });
    });
    callback(reports);
  });
}

// Get all reports with filters (real-time)
export function subscribeToAllReports(
  callback: (reports: Report[]) => void,
  filter?: ReportFilter
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }
  
  const constraints: QueryConstraint[] = [];

  if (filter?.userId && filter.userId !== 'all') {
    constraints.push(where('userId', '==', filter.userId));
  }

  if (filter?.status && filter.status !== 'all') {
    constraints.push(where('status', '==', filter.status));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  const q = query(collection(db, REPORTS_COLLECTION), ...constraints);

  return onSnapshot(q, (snapshot) => {
    let reports: Report[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const report: Report = {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        title: data.title,
        description: data.description,
        status: data.status,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
      reports.push(report);
    });

    // Apply date filters on client side
    if (filter?.dateFrom) {
      reports = reports.filter(r => r.createdAt >= filter.dateFrom!);
    }
    if (filter?.dateTo) {
      const endDate = new Date(filter.dateTo);
      endDate.setHours(23, 59, 59, 999);
      reports = reports.filter(r => r.createdAt <= endDate);
    }

    callback(reports);
  });
}

// Get all users (for admin filter)
export async function getAllUsers(): Promise<User[]> {
  if (!db) return [];
  
  const q = query(collection(db, USERS_COLLECTION));
  const snapshot = await getDocs(q);

  const users: User[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      id: doc.id,
      name: data.name || 'Unknown',
      email: data.email || '',
      role: data.role || 'worker',
      createdAt: convertTimestamp(data.createdAt),
    });
  });

  return users;
}

// Get a single report by ID
export async function getReport(reportId: string): Promise<Report | null> {
  if (!db) return null;
  
  const docRef = doc(db, REPORTS_COLLECTION, reportId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId,
    userName: data.userName,
    title: data.title,
    description: data.description,
    status: data.status,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
}
