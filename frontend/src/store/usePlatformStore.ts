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

const SEED_COMPANIES: Company[] = [
  {
    id: 'company-1',
    companyName: 'Pacific Northwest Care Network',
    plan: 'Enterprise',
    status: 'Active',
    billingCycle: 'Monthly',
    mrr: 599,
    joinedDate: '2024-01-15',
    notes: 'Multi-agency operator — flagship customer.',
    primaryContactName: 'Jennifer Adams',
    primaryContactEmail: 'jennifer@pnwcarenetwork.com',
    primaryContactPhone: '(503) 555-1000',
    billingContactName: 'Jennifer Adams',
    billingContactEmail: 'billing@pnwcarenetwork.com',
    afterHoursName: 'On-Call Coordinator',
    afterHoursPhone: '(503) 555-9999',
    agencies: [
      {
        id: 'agency-1', companyId: 'company-1',
        name: 'Portland Home Care LLC', state: 'OR', classification: 'Intermediate',
        licenseNumber: 'IHC-2021-001', licenseExpiry: '2025-07-01', licenseIssuedDate: '2021-07-01',
        licenseVerified: true, licenseStatus: 'Active',
        physicalAddress: '100 SW Broadway', physicalCity: 'Portland', physicalState: 'OR',
        physicalZip: '97201', physicalCounty: 'Multnomah',
        agencyPhone: '(503) 555-1001', agencyEmail: 'info@portlandhomecare.com',
        taxId: '93-1234567', npiNumber: '1234567890',
        medicareCertified: false, medicareProviderNumber: '',
        medicaidCertified: true, medicaidProviderNumber: 'OR-MED-001',
        servicesOffered: ['Personal Care (ADLs)', 'Homemaker Services', 'Medication Assistance'],
        serviceCounties: ['Multnomah', 'Washington', 'Clackamas'],
        payerTypes: ['Medicaid', 'Private Pay', 'Veterans (VA)'],
        languages: ['English', 'Spanish'], clients: 42, caregivers: 28,
      },
      {
        id: 'agency-2', companyId: 'company-1',
        name: 'Eugene Care Services Inc', state: 'OR', classification: 'Comprehensive',
        licenseNumber: 'IHC-2022-002', licenseExpiry: '2025-08-15', licenseIssuedDate: '2022-02-15',
        licenseVerified: true, licenseStatus: 'Active',
        physicalAddress: '200 Willamette St', physicalCity: 'Eugene', physicalState: 'OR',
        physicalZip: '97401', physicalCounty: 'Lane',
        agencyPhone: '(541) 555-2000', agencyEmail: 'info@eugenecare.com',
        taxId: '93-7654321', npiNumber: '0987654321',
        medicareCertified: true, medicareProviderNumber: 'OR-MCR-002',
        medicaidCertified: true, medicaidProviderNumber: 'OR-MED-002',
        servicesOffered: ['Personal Care (ADLs)', 'Nursing Services (RN/LPN)', 'Medication Administration'],
        serviceCounties: ['Lane', 'Benton'],
        payerTypes: ['Medicaid', 'Private Pay'],
        languages: ['English'], clients: 31, caregivers: 19,
      },
    ],
  },
  {
    id: 'company-2',
    companyName: 'Salem Care Partners',
    plan: 'Starter',
    status: 'Active',
    billingCycle: 'Monthly',
    mrr: 149,
    joinedDate: '2024-03-10',
    notes: '',
    primaryContactName: 'Lisa Chang',
    primaryContactEmail: 'lchang@salemcare.com',
    primaryContactPhone: '(503) 555-3000',
    billingContactName: 'Lisa Chang',
    billingContactEmail: 'billing@salemcare.com',
    afterHoursName: '',
    afterHoursPhone: '',
    agencies: [
      {
        id: 'agency-3', companyId: 'company-2',
        name: 'Salem Care Partners LLC', state: 'OR', classification: 'Basic',
        licenseNumber: 'IHC-2022-003', licenseExpiry: '2025-09-30', licenseIssuedDate: '2022-09-30',
        licenseVerified: true, licenseStatus: 'Active',
        physicalAddress: '300 Commercial St', physicalCity: 'Salem', physicalState: 'OR',
        physicalZip: '97301', physicalCounty: 'Marion',
        agencyPhone: '(503) 555-3000', agencyEmail: 'info@salemcare.com',
        taxId: '', npiNumber: '',
        medicareCertified: false, medicareProviderNumber: '',
        medicaidCertified: true, medicaidProviderNumber: 'OR-MED-003',
        servicesOffered: ['Personal Care (ADLs)', 'Homemaker Services', 'Companionship'],
        serviceCounties: ['Marion', 'Polk'],
        payerTypes: ['Medicaid', 'Long-Term Care Insurance'],
        languages: ['English', 'Spanish'], clients: 18, caregivers: 12,
      },
    ],
  },
  {
    id: 'company-3',
    companyName: 'Central Oregon Home Health',
    plan: 'Trial',
    status: 'Trial',
    billingCycle: 'Monthly',
    mrr: 0,
    joinedDate: '2025-01-15',
    notes: 'Trial — follow up re: upgrade to Starter.',
    primaryContactName: 'David Park',
    primaryContactEmail: 'dpark@centraloregonhh.com',
    primaryContactPhone: '(541) 555-4000',
    billingContactName: 'David Park',
    billingContactEmail: 'dpark@centraloregonhh.com',
    afterHoursName: '',
    afterHoursPhone: '',
    agencies: [
      {
        id: 'agency-4', companyId: 'company-3',
        name: 'Bend Home Health Services', state: 'OR', classification: 'Limited',
        licenseNumber: 'IHC-2023-004', licenseExpiry: '2025-12-31', licenseIssuedDate: '2023-06-01',
        licenseVerified: true, licenseStatus: 'Active',
        physicalAddress: '400 Wall St', physicalCity: 'Bend', physicalState: 'OR',
        physicalZip: '97701', physicalCounty: 'Deschutes',
        agencyPhone: '(541) 555-4000', agencyEmail: 'info@bendhomehealth.com',
        taxId: '', npiNumber: '',
        medicareCertified: false, medicareProviderNumber: '',
        medicaidCertified: false, medicaidProviderNumber: '',
        servicesOffered: ['Personal Care (ADLs)', 'Companionship'],
        serviceCounties: ['Deschutes'],
        payerTypes: ['Private Pay'],
        languages: ['English'], clients: 3, caregivers: 4,
      },
    ],
  },
];

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
      companies: SEED_COMPANIES,
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
