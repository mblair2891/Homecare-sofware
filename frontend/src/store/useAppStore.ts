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

const seedClients: Client[] = [
  {
    id: 'c1', name: 'Margaret Thompson', dob: '1942-03-15', address: '1234 Oak St, Portland, OR 97201',
    phone: '(503) 555-0101', pcp: 'Dr. Sarah Chen', pcpPhone: '(503) 555-0200', hospital: 'OHSU',
    payer: 'Medicaid', diagnoses: ['Type 2 Diabetes', 'Hypertension', 'Osteoarthritis'],
    allergies: ['Penicillin', 'Sulfa'], medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Aspirin 81mg'],
    fallRisk: 'High', emergencyContact: 'Robert Thompson (Son)', emergencyPhone: '(503) 555-0102',
    status: 'Active', location: 'Portland', startDate: '2024-01-15', assignedCaregivers: ['cg1', 'cg2'],
    classification: 'Basic', canSelfDirect: true, stableAndPredictable: true,
    disclosureSignedDate: '2024-01-15', rightsSignedDate: '2024-01-15',
    initialAssessmentDate: '2024-01-15', servicePlanDate: '2024-01-22',
    serviceAgreementDate: '2024-01-15', initialVisitDate: '2024-01-25',
    lastMonitoringDate: '2024-10-15', lastSelfDirectionEvalDate: '2024-10-01', notes: ''
  },
  {
    id: 'c2', name: 'Harold Jenkins', dob: '1938-07-22', address: '5678 Pine Ave, Portland, OR 97202',
    phone: '(503) 555-0103', pcp: 'Dr. Michael Park', pcpPhone: '(503) 555-0201', hospital: 'Providence',
    payer: 'Private Pay', diagnoses: ['COPD', 'Congestive Heart Failure', 'Depression'],
    allergies: ['Codeine'], medications: ['Albuterol', 'Furosemide 40mg', 'Sertraline 50mg'],
    fallRisk: 'Medium', emergencyContact: 'Susan Jenkins (Wife)', emergencyPhone: '(503) 555-0104',
    status: 'Active', location: 'Portland', startDate: '2024-02-01', assignedCaregivers: ['cg1'],
    classification: 'Intermediate', canSelfDirect: false, stableAndPredictable: true,
    disclosureSignedDate: '2024-02-01', rightsSignedDate: '2024-02-01',
    initialAssessmentDate: '2024-02-01', servicePlanDate: '2024-02-08',
    serviceAgreementDate: '2024-02-01', initialVisitDate: '2024-02-12',
    lastMonitoringDate: '2024-09-01', lastSelfDirectionEvalDate: '2024-09-15', notes: ''
  },
  {
    id: 'c3', name: 'Dorothy Williams', dob: '1950-11-08', address: '910 Maple Dr, Eugene, OR 97401',
    phone: '(541) 555-0105', pcp: 'Dr. James Liu', pcpPhone: '(541) 555-0202', hospital: 'PeaceHealth',
    payer: 'Veterans', diagnoses: ['Parkinson\'s Disease', 'Anxiety Disorder'],
    allergies: [], medications: ['Levodopa/Carbidopa', 'Lorazepam 0.5mg'],
    fallRisk: 'High', emergencyContact: 'Linda Williams (Daughter)', emergencyPhone: '(541) 555-0106',
    status: 'Active', location: 'Eugene', startDate: '2024-03-10', assignedCaregivers: ['cg3'],
    classification: 'Comprehensive', canSelfDirect: true, stableAndPredictable: true,
    disclosureSignedDate: '2024-03-10', rightsSignedDate: '2024-03-10',
    initialAssessmentDate: '2024-03-10', servicePlanDate: '2024-03-17',
    serviceAgreementDate: '2024-03-10', initialVisitDate: '2024-03-20',
    lastMonitoringDate: '2024-11-10', lastSelfDirectionEvalDate: '2024-11-01', notes: ''
  },
  {
    id: 'c4', name: 'Frank Morales', dob: '1945-05-30', address: '234 Cedar Blvd, Salem, OR 97301',
    phone: '(503) 555-0107', pcp: 'Dr. Patricia Webb', pcpPhone: '(503) 555-0203', hospital: 'Salem Health',
    payer: 'Long-Term Care Insurance', diagnoses: ['Alzheimer\'s Disease (Mild)', 'Hypertension'],
    allergies: ['NSAIDs'], medications: ['Donepezil 5mg', 'Amlodipine 5mg'],
    fallRisk: 'Medium', emergencyContact: 'Maria Morales (Wife)', emergencyPhone: '(503) 555-0108',
    status: 'Active', location: 'Salem', startDate: '2024-04-05', assignedCaregivers: ['cg4'],
    classification: 'Basic', canSelfDirect: false, stableAndPredictable: true,
    disclosureSignedDate: '2024-04-05', rightsSignedDate: '2024-04-05',
    initialAssessmentDate: '2024-04-05', servicePlanDate: '2024-04-12',
    serviceAgreementDate: '2024-04-05', initialVisitDate: '2024-04-15',
    lastMonitoringDate: '2024-10-05', lastSelfDirectionEvalDate: undefined, notes: ''
  },
];

const seedCaregivers: Caregiver[] = [
  {
    id: 'cg1', name: 'Maria Santos', phone: '(503) 555-0301', email: 'maria.santos@careaxis.com',
    address: '456 Elm St, Portland, OR 97204', status: 'Active', location: 'Portland',
    classification: 'Intermediate', certifications: ['CNA', 'CPR/First Aid', 'Medication Administration'],
    licenseNumber: 'CNA-12345', licenseExpiry: '2025-06-30',
    backgroundCheckDate: '2024-01-10', orientationDate: '2024-01-12',
    initialTrainingDate: '2024-01-15', lastAnnualTrainingDate: '2024-01-15',
    medicationTrainedDate: '2024-01-15', leieCheckedDate: '2024-01-10',
    assignedClients: ['c1', 'c2'], rating: 4.9, hireDate: '2024-01-10',
    driverLicense: true, autoInsurance: true
  },
  {
    id: 'cg2', name: 'James Wilson', phone: '(503) 555-0302', email: 'james.wilson@careaxis.com',
    address: '789 Oak Ave, Portland, OR 97205', status: 'Active', location: 'Portland',
    classification: 'Basic', certifications: ['CPR/First Aid', 'Medication Assistance'],
    backgroundCheckDate: '2024-02-01', orientationDate: '2024-02-03',
    initialTrainingDate: '2024-02-05', lastAnnualTrainingDate: '2024-02-05',
    medicationTrainedDate: '2024-02-05', leieCheckedDate: '2024-02-01',
    assignedClients: ['c1'], rating: 4.7, hireDate: '2024-02-01',
    driverLicense: true, autoInsurance: true
  },
  {
    id: 'cg3', name: 'Angela Davis', phone: '(541) 555-0303', email: 'angela.davis@careaxis.com',
    address: '321 Fir Ln, Eugene, OR 97402', status: 'Active', location: 'Eugene',
    classification: 'Comprehensive', certifications: ['RN', 'CPR/First Aid', 'Medication Administration', 'Nursing Services'],
    licenseNumber: 'RN-67890', licenseExpiry: '2026-03-31',
    backgroundCheckDate: '2024-03-01', orientationDate: '2024-03-05',
    initialTrainingDate: '2024-03-05', lastAnnualTrainingDate: '2024-03-05',
    medicationTrainedDate: '2024-03-05', leieCheckedDate: '2024-03-01',
    assignedClients: ['c3'], rating: 5.0, hireDate: '2024-03-01',
    driverLicense: true, autoInsurance: true
  },
  {
    id: 'cg4', name: 'Robert Kim', phone: '(503) 555-0304', email: 'robert.kim@careaxis.com',
    address: '654 Spruce Way, Salem, OR 97302', status: 'Active', location: 'Salem',
    classification: 'Basic', certifications: ['CPR/First Aid'],
    backgroundCheckDate: '2024-04-01', orientationDate: '2024-04-03',
    initialTrainingDate: '2024-04-05', lastAnnualTrainingDate: '2024-04-05',
    leieCheckedDate: '2024-04-01',
    assignedClients: ['c4'], rating: 4.6, hireDate: '2024-04-01',
    driverLicense: false, autoInsurance: false
  },
];

const seedLocations: Location[] = [
  { id: 'loc1', name: 'Portland Main', address: '100 SW Broadway, Portland, OR 97201', phone: '(503) 555-1000', type: 'Parent', administrator: 'Jennifer Adams', classification: 'Intermediate', licenseNumber: 'IHC-2024-001', licenseExpiry: '2025-07-01', activeClients: 42, activeCaregivers: 28, status: 'Active' },
  { id: 'loc2', name: 'Eugene Office', address: '200 Willamette St, Eugene, OR 97401', phone: '(541) 555-2000', type: 'Subunit', administrator: 'Michael Torres', classification: 'Comprehensive', licenseNumber: 'IHC-2024-002', licenseExpiry: '2025-08-15', activeClients: 31, activeCaregivers: 19, status: 'Active' },
  { id: 'loc3', name: 'Salem Branch', address: '300 Commercial St, Salem, OR 97301', phone: '(503) 555-3000', type: 'Branch', administrator: 'Lisa Chang', classification: 'Basic', licenseNumber: 'IHC-2024-003', licenseExpiry: '2025-09-30', activeClients: 18, activeCaregivers: 12, status: 'Active' },
  { id: 'loc4', name: 'Bend (Planned)', address: '400 Wall St, Bend, OR 97701', phone: 'TBD', type: 'Subunit', administrator: 'TBD', classification: 'Basic', activeClients: 0, activeCaregivers: 0, status: 'Planning' },
];

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  activeLocation: 'All Locations',
  clients: seedClients,
  caregivers: seedCaregivers,
  shifts: [],
  locations: seedLocations,
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
