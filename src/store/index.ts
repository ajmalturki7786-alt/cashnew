import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, BusinessSummary } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

interface BusinessState {
  businesses: BusinessSummary[];
  currentBusiness: BusinessSummary | null;
  isLoading: boolean;
  setBusinesses: (businesses: BusinessSummary[]) => void;
  setCurrentBusiness: (business: BusinessSummary | null) => void;
  updateCurrentBusiness: (business: Partial<BusinessSummary>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      businesses: [],
      currentBusiness: null,
      isLoading: false,
      setBusinesses: (businesses) => set({ businesses }),
      setCurrentBusiness: (business) => set({ currentBusiness: business }),
      updateCurrentBusiness: (businessData) =>
        set((state) => ({
          currentBusiness: state.currentBusiness
            ? { ...state.currentBusiness, ...businessData }
            : null,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'business-storage',
      partialize: (state) => ({
        currentBusiness: state.currentBusiness,
        businesses: state.businesses,
      }),
    }
  )
);
