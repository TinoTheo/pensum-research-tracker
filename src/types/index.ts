export type UserRole = 'admin' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export type ReportStatus = 'in-progress' | 'completed' | 'blocked';

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  title: string;
  problem: string;
  findings: string;
  solutions: string;
  status: ReportStatus;
  attachments: FileAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportData {
  title: string;
  problem: string;
  findings: string;
  solutions: string;
  status: ReportStatus;
  attachments?: FileAttachment[];
}

export interface AuthContextType {
  user: User | null;
  firebaseUser: import('firebase/auth').User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ReportFilter {
  status?: ReportStatus | 'all';
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
