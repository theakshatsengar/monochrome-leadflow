export type UserRole = 'admin' | 'manager' | 'intern';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Mock users for demonstration
export const MOCK_USERS: (LoginCredentials & { user: User })[] = [
  {
    email: 'admin@leadflow.com',
    password: 'admin123',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@leadflow.com',
      role: 'admin'
    }
  },
  {
    email: 'manager@leadflow.com',
    password: 'manager123',
    user: {
      id: '2',
      name: 'Manager User',
      email: 'manager@leadflow.com',
      role: 'manager'
    }
  },
  {
    email: 'intern@leadflow.com',
    password: 'intern123',
    user: {
      id: '3',
      name: 'Intern User',
      email: 'intern@leadflow.com',
      role: 'intern'
    }
  }
];
