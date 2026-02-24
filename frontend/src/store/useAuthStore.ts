import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SuperAdmin' | 'Owner' | 'Administrator' | 'Coordinator' | 'Nurse' | 'Biller' | 'ReadOnly';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agencyId?: string;
  agencyName?: string;
  mustChangePassword?: boolean;
}

export interface ManagedUser extends AuthUser {
  password: string;
  location: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  impersonatingAgency: { id: string; name: string } | null;
  managedUsers: ManagedUser[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  enterAgency: (agencyId: string, agencyName: string) => void;
  exitAgency: () => void;
  addManagedUser: (user: ManagedUser) => void;
  removeManagedUser: (email: string) => void;
  updateManagedUser: (email: string, updates: Partial<ManagedUser>) => void;
}

// The SuperAdmin is a platform-level account that only exists on the frontend.
// It never hits the backend.
const DEFAULT_ADMIN: ManagedUser = {
  id: 'sa-1',
  email: 'admin@careaxis.io',
  password: 'admin123',
  name: 'Platform Admin',
  role: 'SuperAdmin',
  location: 'All',
  status: 'Active',
  createdAt: '2024-01-01',
};

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      impersonatingAgency: null,
      managedUsers: [DEFAULT_ADMIN],

      login: async (email, password) => {
        // 1. Try the real backend first (agency users).
        try {
          const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (res.ok) {
            const data = (await res.json()) as {
              token: string;
              user: {
                id: string; email: string; name: string;
                role: string; agencyId: string; agencyName: string;
              };
            };
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role as UserRole,
              agencyId: data.user.agencyId,
              agencyName: data.user.agencyName,
            };
            set({ user: authUser, token: data.token, impersonatingAgency: null });
            return;
          }

          // 4xx from backend means invalid credentials (for a real backend user).
          // Fall through to check the local mock list.
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          // Only re-throw on server errors; 401/403 fall through to local check.
          if (res.status >= 500) throw new Error(errData.error ?? 'Login failed');
        } catch (err: unknown) {
          // Network error or 5xx — still fall through to local mock so the
          // app works when the backend is unavailable (dev / demo mode).
          if (err instanceof Error && err.message !== 'Login failed') {
            // Ignore network errors silently; the local fallback handles it.
          } else if (err instanceof Error) {
            throw err;
          }
        }

        // 2. Fall back to the in-memory managed-user list (SuperAdmin + any
        //    users created before the backend was connected).
        await new Promise((r) => setTimeout(r, 300));
        const match = get().managedUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.status === 'Active'
        );
        if (!match) throw new Error('Invalid email or password');
        const { password: _p, location: _l, status: _s, createdAt: _c, ...authUser } = match;
        set({ user: authUser, token: null, impersonatingAgency: null });
      },

      logout: () => set({ user: null, token: null, impersonatingAgency: null }),
      enterAgency: (agencyId, agencyName) => set({ impersonatingAgency: { id: agencyId, name: agencyName } }),
      exitAgency: () => set({ impersonatingAgency: null }),

      addManagedUser: (user) =>
        set((s) => ({
          managedUsers: [...s.managedUsers.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase()), user],
        })),

      removeManagedUser: (email) =>
        set((s) => ({
          managedUsers: s.managedUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase()),
        })),

      updateManagedUser: (email, updates) =>
        set((s) => ({
          managedUsers: s.managedUsers.map((u) =>
            u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...updates } : u
          ),
        })),
    }),
    { name: 'careaxis-auth' }
  )
);
