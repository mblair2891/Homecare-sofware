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
}

interface AuthStore {
  user: AuthUser | null;
  impersonatingAgency: { id: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  enterAgency: (agencyId: string, agencyName: string) => void;
  exitAgency: () => void;
}

const DEMO_USERS: (AuthUser & { password: string })[] = [
  {
    id: 'sa-1',
    email: 'admin@careaxis.io',
    password: 'admin123',
    name: 'Platform Admin',
    role: 'SuperAdmin',
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      impersonatingAgency: null,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 400)); // simulate network
        const match = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!match) throw new Error('Invalid email or password');
        const { password: _p, ...user } = match;
        set({ user, impersonatingAgency: null });
      },
      logout: () => set({ user: null, impersonatingAgency: null }),
      enterAgency: (agencyId, agencyName) =>
        set({ impersonatingAgency: { id: agencyId, name: agencyName } }),
      exitAgency: () => set({ impersonatingAgency: null }),
    }),
    { name: 'careaxis-auth' }
  )
);
