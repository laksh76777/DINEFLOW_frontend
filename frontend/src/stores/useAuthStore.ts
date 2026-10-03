import { create } from 'zustand';
import { User, Role } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const STORAGE_KEY_TOKEN = 'dineflow_auth_token';
const STORAGE_KEY_USER = 'dineflow_auth_user';

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
  let savedUser: User | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) savedUser = JSON.parse(raw);
  } catch (_) {
    savedUser = null;
  }

  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: Boolean(savedToken && savedUser),
    isLoading: false,

    login: (token: string, user: User) => {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ token: null, user: null, isAuthenticated: false });
    },

    updateUser: (updated) => {
      set((state) => {
        if (!state.user) return state;
        const newUser = { ...state.user, ...updated };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        return { user: newUser };
      });
    },
  };
});

// Helper to get authorization headers for fetch
export function getAuthHeaders(): Record<string, string> {
  const { token, user } = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user?.role) {
    headers['x-demo-role'] = user.role;
  }
  return headers;
}
