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

// Default platform admin — always available
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      impersonatingAgency: null,
      managedUsers: [DEFAULT_ADMIN],

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 400)); // simulate network

        const allUsers = get().managedUsers;
        const match = allUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.status === 'Active'
        );

        if (!match) throw new Error('Invalid email or password');

        const { password: _p, location: _l, status: _s, createdAt: _c, ...authUser } = match;
        set({ user: authUser, impersonatingAgency: null });
      },

      logout: () => set({ user: null, impersonatingAgency: null }),

      enterAgency: (agencyId, agencyName) =>
        set({ impersonatingAgency: { id: agencyId, name: agencyName } }),

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
