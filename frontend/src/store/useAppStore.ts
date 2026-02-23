import { create } from 'zustand';

export type AgencyClassification = 'Limited' | 'Basic' | 'Intermediate' | 'Comprehensive';

export interface Client {
  id: string;
  name: string;
  dob: string;
  address: string;
  phone: string;
  pcp: string;
  pcpPhone: string;
  hospital: string;
  payer: 'Private Pay' | 'Medicaid' | 'Veterans' | 'Long-Term Care Insurance';
  diagnoses: string[];
  allergies: string[];
  medications: string[];
  fallRisk: 'Low' | 'Medium' | 'High';
  emergencyContact: string;
  emergencyPhone: string;
  status: 'Active' | 'Inactive' | 'On Hold' | 'Discharged';
  location: string;
  startDate: string;
  assignedCaregivers: string[];
  classification: AgencyClassification;
  canSelfDirect: boolean;
  stableAndPredictable: boolean;
  disclosureSignedDate?: string;
  rightsSignedDate?: string;
  initialAssessmentDate?: string;
  servicePlanDate?: string;
  serviceAgreementDate?: string;
  initialVisitDate?: string;
  lastMonitoringDate?: string;
  lastSelfDirectionEvalDate?: string;
  notes: string;
}

export interface Caregiver {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  location: string;
  classification: AgencyClassification;
  certifications: string[];
  licenseNumber?: string;
  licenseExpiry?: string;
  backgroundCheckDate?: string;
  orientationDate?: string;
  initialTrainingDate?: string;
  lastAnnualTrainingDate?: string;
  medicationTrainedDate?: string;
  leieCheckedDate?: string;
  assignedClients: string[];
  rating: number;
  hireDate: string;
  driverLicense: boolean;
  autoInsurance: boolean;
}

export interface Shift {
  id: string;
  clientId: string;
  caregiverId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Missed' | 'Cancelled';
  evvClockIn?: string;
  evvClockOut?: string;
  evvMethod?: 'GPS' | 'Telephony' | 'Manual';
  evvVerified: boolean;
  notes?: string;
  location: string;
  tasks: string[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: 'Parent' | 'Subunit' | 'Branch';
  administrator: string;
  classification: AgencyClassification;
  licenseNumber?: string;
  licenseExpiry?: string;
  activeClients: number;
  activeCaregivers: number;
  status: 'Active' | 'Pending' | 'Planning';
}

interface AppState {
  activeModule: string;
  activeLocation: string;
  clients: Client[];
  caregivers: Caregiver[];
  shifts: Shift[];
  locations: Location[];
  sidebarCollapsed: boolean;
  setActiveModule: (module: string) => void;
  setActiveLocation: (location: string) => void;
  setSidebarCollapsed: (v: boolean) => void;
  addClient: (c: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addCaregiver: (c: Caregiver) => void;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  addShift: (s: Shift) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  activeLocation: 'All Locations',
  clients: [],
  caregivers: [],
  shifts: [],
  locations: [],
  sidebarCollapsed: false,
  setActiveModule: (module) => set({ activeModule: module }),
  setActiveLocation: (location) => set({ activeLocation: location }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  addClient: (c) => set((s) => ({ clients: [...s.clients, c] })),
  updateClient: (id, updates) => set((s) => ({ clients: s.clients.map((c) => c.id === id ? { ...c, ...updates } : c) })),
  addCaregiver: (c) => set((s) => ({ caregivers: [...s.caregivers, c] })),
  updateCaregiver: (id, updates) => set((s) => ({ caregivers: s.caregivers.map((c) => c.id === id ? { ...c, ...updates } : c) })),
  addShift: (s) => set((state) => ({ shifts: [...state.shifts, s] })),
  updateShift: (id, updates) => set((s) => ({ shifts: s.shifts.map((sh) => sh.id === id ? { ...sh, ...updates } : sh) })),
}));
