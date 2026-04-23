import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem(TOKEN_KEY, token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: '@agro-saas:auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
