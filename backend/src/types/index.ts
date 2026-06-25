import { Request } from 'express';

export type UserRole = 'Admin' | 'Manager' | 'Employee' | 'Viewer';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  salary: number;
  created_at: string;
  created_by: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
