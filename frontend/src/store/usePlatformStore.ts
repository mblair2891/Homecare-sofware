import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Classification = 'Limited' | 'Basic' | 'Intermediate' | 'Comprehensive';
export type AgencyPlan = 'Trial' | 'Starter' | 'Professional' | 'Enterprise';
export type CompanyStatus = 'Active' | 'Trial' | 'Suspended' | 'Cancelled';

export interface AgencyRecord {
  id: string;
  companyId: string;
  name: string;
  state: string;
  classification: Classification;
  licenseNumber: string;
  licenseExpiry: string;
  licenseIssuedDate: string;
  licenseVerified: boolean;
  licenseStatus: string;
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  physicalCounty: string;
  agencyPhone: string;
  agencyEmail: string;
  taxId: string;
  npiNumber: string;
  medicareCertified: boolean;
  medicareProviderNumber: string;
  medicaidCertified: boolean;
  medicaidProviderNumber: string;
  servicesOffered: string[];
  serviceCounties: string[];
  payerTypes: string[];
  languages: string[];
  clients: number;
  caregivers: number;
}

export interface Company {
  id: string;
  companyName: string;
  plan: AgencyPlan;
  status: CompanyStatus;
  billingCycle: 'Monthly' | 'Annual';
  mrr: number;
  joinedDate: string;
  notes: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  billingContactName: string;
  billingContactEmail: string;
  afterHoursName: string;
  afterHoursPhone: string;
  agencies: AgencyRecord[];
}

export const MRR_BY_PLAN: Record<AgencyPlan, number> = {
  Trial: 0,
  Starter: 149,
  Professional: 299,
  Enterprise: 599,
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
// No seed companies — clean slate for production use.

// ─── Store ────────────────────────────────────────────────────────────────────

interface PlatformStore {
  companies: Company[];
  addCompany: (company: Company) => void;
  updateCompanyStatus: (id: string, status: CompanyStatus) => void;
  removeCompany: (id: string) => void;
}

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set) => ({
      companies: [],
      addCompany: (company) =>
        set((s) => ({ companies: [...s.companies, company] })),
      updateCompanyStatus: (id, status) =>
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, status } : c)),
        })),
      removeCompany: (id) =>
        set((s) => ({ companies: s.companies.filter((c) => c.id !== id) })),
    }),
    { name: 'careaxis-platform-v2' }
  )
);
