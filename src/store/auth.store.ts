import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),
    }),
    {
      name: 'gymora-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
