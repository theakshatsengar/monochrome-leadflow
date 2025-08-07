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
  identifier: string; // Can be email or name
  password: string;
}

// Mock users for demonstration
export const MOCK_USERS: (LoginCredentials & { user: User })[] = [
  // Login by email
  {
    identifier: 'bhavyaojha28@gmail.com',
    password: 'garlicbread',
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Bhavya',
      email: 'bhavyaojha28@gmail.com',
      role: 'intern'
    }
  },
  {
    identifier: 'bhumikabisht603@gmail.com',
    password: 'pancake',
    user: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Bhumika',
      email: 'bhumikabisht603@gmail.com',
      role: 'intern'
    }
  },
  {
    identifier: 'akshatsengar1002@gmail.com',
    password: 'eggcurry',
    user: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Akshat',
      email: 'akshatsengar1002@gmail.com',
      role: 'admin'
    }
  },
  // Login by name
  {
    identifier: 'Bhavya',
    password: 'garlicbread',
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Bhavya',
      email: 'bhavyaojha28@gmail.com',
      role: 'intern'
    }
  },
  {
    identifier: 'Bhumika',
    password: 'pancake',
    user: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Bhumika',
      email: 'bhumikabisht603@gmail.com',
      role: 'intern'
    }
  },
  {
    identifier: 'Akshat',
    password: 'eggcurry',
    user: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Akshat',
      email: 'akshatsengar1002@gmail.com',
      role: 'admin'
    }
  }
];
