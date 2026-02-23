import { Router, Request, Response } from 'express';

const router = Router();

// ─── Mock Oregon OHA In-Home Care Agency License Database ───────────────────
// Real implementation: POST to https://apps.health.oregon.gov/FacilityProfiles/Search/Facility
// parse HTML response for license details.
// Each state's database URL/API would be configured per state.

interface LicenseRecord {
  agencyName: string;
  classification: 'Limited' | 'Basic' | 'Intermediate' | 'Comprehensive';
  licenseType: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Pending' | 'Revoked';
  issuedDate: string;
  expiryDate: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  phone: string;
  directorName?: string;
  capacity?: number;
  conditions?: string[];
}

const OREGON_LICENSES: Record<string, LicenseRecord> = {
  'IHC-2021-001': {
    agencyName: 'Portland Home Care LLC',
    classification: 'Intermediate',
    licenseType: 'In-Home Care Agency',
    status: 'Active',
    issuedDate: '2021-07-01',
    expiryDate: '2025-07-01',
    address: '100 SW Broadway',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    county: 'Multnomah',
    phone: '(503) 555-1000',
    directorName: 'Jennifer Adams',
    conditions: [],
  },
  'IHC-2022-002': {
    agencyName: 'Eugene Care Services Inc',
    classification: 'Comprehensive',
    licenseType: 'In-Home Care Agency',
    status: 'Active',
    issuedDate: '2022-02-15',
    expiryDate: '2025-08-15',
    address: '200 Willamette St',
    city: 'Eugene',
    state: 'OR',
    zip: '97401',
    county: 'Lane',
    phone: '(541) 555-2000',
    directorName: 'Michael Torres',
    conditions: [],
  },
  'IHC-2022-003': {
    agencyName: 'Salem Care Partners LLC',
    classification: 'Basic',
    licenseType: 'In-Home Care Agency',
    status: 'Active',
    issuedDate: '2022-09-30',
    expiryDate: '2025-09-30',
    address: '300 Commercial St',
    city: 'Salem',
    state: 'OR',
    zip: '97301',
    county: 'Marion',
    phone: '(503) 555-3000',
    directorName: 'Lisa Chang',
    conditions: [],
  },
  'IHC-2023-004': {
    agencyName: 'Bend Home Health Services',
    classification: 'Limited',
    licenseType: 'In-Home Care Agency',
    status: 'Active',
    issuedDate: '2023-06-01',
    expiryDate: '2025-12-31',
    address: '400 Wall St',
    city: 'Bend',
    state: 'OR',
    zip: '97701',
    county: 'Deschutes',
    phone: '(541) 555-4000',
    directorName: 'David Park',
    conditions: [],
  },
  'IHC-2020-015': {
    agencyName: 'Cascade Valley In-Home Care',
    classification: 'Comprehensive',
    licenseType: 'In-Home Care Agency',
    status: 'Expired',
    issuedDate: '2020-03-01',
    expiryDate: '2024-03-01',
    address: '1500 NE 42nd Ave',
    city: 'Portland',
    state: 'OR',
    zip: '97213',
    county: 'Multnomah',
    phone: '(503) 555-5000',
    directorName: 'Sarah Mitchell',
    conditions: ['License expired — renewal pending'],
  },
  'IHC-2024-008': {
    agencyName: 'Medford Senior Care LLC',
    classification: 'Basic',
    licenseType: 'In-Home Care Agency',
    status: 'Suspended',
    issuedDate: '2024-01-15',
    expiryDate: '2026-01-15',
    address: '800 S Central Ave',
    city: 'Medford',
    state: 'OR',
    zip: '97501',
    county: 'Jackson',
    phone: '(541) 555-6000',
    conditions: ['Survey deficiency — corrective action plan required'],
  },
};

// Oregon license format: IHC-YYYY-NNN  (In-Home Care – year – sequence)
const OR_LICENSE_REGEX = /^IHC-\d{4}-\d{3,4}$/i;

const STATE_FORMATS: Record<string, { regex: RegExp; label: string }> = {
  OR: { regex: OR_LICENSE_REGEX, label: 'IHC-YYYY-NNN (e.g. IHC-2024-001)' },
  WA: { regex: /^HCA-\d{6}$/i, label: 'HCA-NNNNNN' },
  CA: { regex: /^CA-IHSS-\d{5}$/i, label: 'CA-IHSS-NNNNN' },
  // Add more states as needed
};

router.post('/verify-license', async (req: Request, res: Response) => {
  const { licenseNumber, state } = req.body as { licenseNumber: string; state: string };

  if (!licenseNumber || !state) {
    return res.status(400).json({ message: 'License number and state are required.' });
  }

  const normalized = licenseNumber.trim().toUpperCase();
  const format = STATE_FORMATS[state.toUpperCase()];

  if (format && !format.regex.test(normalized)) {
    return res.status(400).json({
      message: `Invalid license format for ${state}. Expected: ${format.label}`,
    });
  }

  // Simulate network latency hitting the state database
  await new Promise((r) => setTimeout(r, 1500));

  // TODO: Replace with real state database call
  // Example for Oregon:
  // const ohaRes = await fetch('https://apps.health.oregon.gov/FacilityProfiles/Search/Facility', {
  //   method: 'POST',
  //   body: new URLSearchParams({ LicenseNumber: normalized, FacilityType: 'InHomeCareAgency' }),
  // });
  // const html = await ohaRes.text();
  // const record = parseOHAFacilityProfile(html);

  const record = OREGON_LICENSES[normalized];

  if (!record) {
    // Valid format but not found in state database
    return res.status(404).json({
      message: `License ${normalized} was not found in the ${state} state database. Verify the number and try again.`,
    });
  }

  return res.status(200).json(record);
});

export default router;
