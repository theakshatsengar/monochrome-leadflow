import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, LoginCredentials, MOCK_USERS } from '@/types/auth';
import { UserService } from '@/services/userService';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials): Promise<boolean> => {
        set({ isLoading: true });
        
        try {
          // For demo purposes, authenticate with mock users first
          const mockUser = MOCK_USERS.find(
            u => u.identifier === credentials.identifier && u.password === credentials.password
          );
          
          if (mockUser) {
            // Use mock user directly for demo
            set({
              user: mockUser.user,
              isAuthenticated: true,
              isLoading: false
            });
            
            // Try to ensure user exists in Supabase for data operations (non-blocking)
            try {
              await UserService.findByEmailOrName(credentials.identifier).then(async (existingUser) => {
                if (!existingUser) {
                  await UserService.create(mockUser.user);
                }
              });
            } catch (error) {
              // Silently fail - user can still use the app with mock auth
              console.warn('Could not sync user to Supabase:', error);
            }
            
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      initializeUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
