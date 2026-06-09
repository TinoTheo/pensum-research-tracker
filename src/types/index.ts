export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'RESEARCHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  title: string;
  problem: string;
  findings: string;
  solutions: string;
  status: ReportStatus;
  attachments?: any;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    createdAt: Date;
  };
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
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  inviteUser: (email: string, role: UserRole) => Promise<void>;
  acceptInvitation: (token: string, password: string, name: string) => Promise<void>;
}

export interface ReportFilter {
  status?: ReportStatus | 'all';
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
